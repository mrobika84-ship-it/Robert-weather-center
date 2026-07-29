const NETATMO_AUTHORIZE = "https://api.netatmo.com/oauth2/authorize";
const NETATMO_TOKEN = "https://api.netatmo.com/oauth2/token";
const NETATMO_STATIONS = "https://api.netatmo.com/api/getstationsdata";

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function saveTokens(env, tokenData) {
  await env.RWC_KV.put("NETATMO_ACCESS_TOKEN", tokenData.access_token, {
    expirationTtl: Math.max(60, (tokenData.expires_in || 10800) - 60)
  });

  if (tokenData.refresh_token) {
    await env.RWC_KV.put("NETATMO_REFRESH_TOKEN", tokenData.refresh_token);
  }
}

export function authorizationUrl(env, state) {
  if (!env.NETATMO_CLIENT_ID) {
    throw new Error("NETATMO_CLIENT_ID nincs beállítva.");
  }
  if (!env.NETATMO_REDIRECT_URI) {
    throw new Error("NETATMO_REDIRECT_URI nincs beállítva.");
  }

  const query = new URLSearchParams({
    client_id: env.NETATMO_CLIENT_ID,
    redirect_uri: env.NETATMO_REDIRECT_URI,
    response_type: "code",
    scope: "read_station",
    state
  });

  return `${NETATMO_AUTHORIZE}?${query.toString()}`;
}

export async function exchangeCode(env, code) {
  if (!code) {
    throw new Error("Hiányzik a Netatmo engedélyezési kód.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.NETATMO_CLIENT_ID,
    client_secret: env.NETATMO_CLIENT_SECRET,
    redirect_uri: env.NETATMO_REDIRECT_URI
  });

  const response = await fetch(NETATMO_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("Netatmo tokenhiba: " + await response.text());
  }

  const tokens = await response.json();
  await saveTokens(env, tokens);
  return tokens;
}

export async function refreshAccessToken(env) {
  const refreshToken = await env.RWC_KV.get("NETATMO_REFRESH_TOKEN");
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.NETATMO_CLIENT_ID,
    client_secret: env.NETATMO_CLIENT_SECRET
  });

  const response = await fetch(NETATMO_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("Tokenfrissítési hiba: " + await response.text());
  }

  const tokens = await response.json();
  await saveTokens(env, tokens);
  return tokens.access_token;
}

export async function getAccessToken(env) {
  return (
    (await env.RWC_KV.get("NETATMO_ACCESS_TOKEN")) ||
    (await refreshAccessToken(env))
  );
}

export async function stationData(env) {
  let token = await getAccessToken(env);
  if (!token) return null;

  let response = await fetch(NETATMO_STATIONS, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401 || response.status === 403) {
    token = await refreshAccessToken(env);
    if (!token) return null;

    response = await fetch(NETATMO_STATIONS, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (!response.ok) {
    throw new Error("Netatmo állomásadat-hiba: " + await response.text());
  }

  const payload = await response.json();
  const station = payload?.body?.devices?.[0];

  if (!station) {
    throw new Error("Nem található Netatmo állomás.");
  }

  const indoor = station.dashboard_data || {};
  const modules = station.modules || [];

  const outdoorModule =
    modules.find(module => module.type === "NAModule1") ||
    modules.find(module => module.dashboard_data?.Temperature !== undefined);

  const outdoor = outdoorModule?.dashboard_data || {};

  return {
    indoorTemperature: indoor.Temperature ?? null,
    outdoorTemperature: outdoor.Temperature ?? null,
    co2: indoor.CO2 ?? null,
    indoorHumidity: indoor.Humidity ?? null,
    outdoorHumidity: outdoor.Humidity ?? null,
    pressure: indoor.Pressure ?? indoor.AbsolutePressure ?? null,
    updatedAt: Math.max(indoor.time_utc || 0, outdoor.time_utc || 0),
    outdoorBatteryPercent: outdoorModule?.battery_percent ?? null
  };
}
