const NETATMO_AUTHORIZE = "https://api.netatmo.com/oauth2/authorize";
const NETATMO_TOKEN = "https://api.netatmo.com/oauth2/token";
const NETATMO_STATIONS = "https://api.netatmo.com/api/getstationsdata";

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}

function reply(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(env), "Content-Type": "application/json; charset=utf-8" },
  });
}

async function saveTokens(env, tokenData) {
  await env.RWC_KV.put("NETATMO_ACCESS_TOKEN", tokenData.access_token, {
    expirationTtl: Math.max(60, (tokenData.expires_in || 10800) - 60),
  });
  if (tokenData.refresh_token) {
    await env.RWC_KV.put("NETATMO_REFRESH_TOKEN", tokenData.refresh_token);
  }
}

async function refreshAccessToken(env) {
  const refreshToken = await env.RWC_KV.get("NETATMO_REFRESH_TOKEN");
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.NETATMO_CLIENT_ID,
    client_secret: env.NETATMO_CLIENT_SECRET,
  });

  const response = await fetch(NETATMO_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Netatmo token refresh failed: " + await response.text());
  }

  const tokens = await response.json();
  await saveTokens(env, tokens);
  return tokens.access_token;
}

async function getAccessToken(env) {
  return (await env.RWC_KV.get("NETATMO_ACCESS_TOKEN")) || refreshAccessToken(env);
}

function extractStationData(payload) {
  const station = payload?.body?.devices?.[0];
  if (!station) throw new Error("Nem található Netatmo időjárásállomás.");

  const indoor = station.dashboard_data || {};
  const modules = station.modules || [];
  const outdoorModule =
    modules.find((module) => module.type === "NAModule1") ||
    modules.find((module) => module.dashboard_data?.Temperature !== undefined);
  const outdoor = outdoorModule?.dashboard_data || {};

  return {
    indoorTemperature: indoor.Temperature ?? null,
    outdoorTemperature: outdoor.Temperature ?? null,
    co2: indoor.CO2 ?? null,
    indoorHumidity: indoor.Humidity ?? null,
    outdoorHumidity: outdoor.Humidity ?? null,
    pressure: indoor.Pressure ?? indoor.AbsolutePressure ?? null,
    feelsLike: outdoor.Temperature ?? null,
    updatedAt: Math.max(indoor.time_utc || 0, outdoor.time_utc || 0),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors(env) });
    }

    if (url.pathname === "/login") {
      const state = crypto.randomUUID();
      await env.RWC_KV.put("OAUTH_STATE", state, { expirationTtl: 600 });

      const query = new URLSearchParams({
        client_id: env.NETATMO_CLIENT_ID,
        redirect_uri: env.NETATMO_REDIRECT_URI,
        scope: "read_station",
        state,
      });

      return Response.redirect(`${NETATMO_AUTHORIZE}?${query}`, 302);
    }

    if (url.pathname === "/callback") {
      const savedState = await env.RWC_KV.get("OAUTH_STATE");
      const receivedState = url.searchParams.get("state");
      const code = url.searchParams.get("code");

      if (!savedState || savedState !== receivedState || !code) {
        return reply({ error: "Érvénytelen Netatmo engedélyezési válasz." }, 400, env);
      }

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: env.NETATMO_CLIENT_ID,
        client_secret: env.NETATMO_CLIENT_SECRET,
        redirect_uri: env.NETATMO_REDIRECT_URI,
      });

      const response = await fetch(NETATMO_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!response.ok) {
        return reply({ error: await response.text() }, 500, env);
      }

      await saveTokens(env, await response.json());
      return Response.redirect(env.FRONTEND_ORIGIN, 302);
    }

    if (url.pathname === "/api/weather") {
      let token = await getAccessToken(env);
      if (!token) return reply({ error: "authorization_required" }, 401, env);

      let response = await fetch(NETATMO_STATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        token = await refreshAccessToken(env);
        response = await fetch(NETATMO_STATIONS, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!response.ok) {
        return reply({ error: await response.text() }, response.status, env);
      }

      try {
        return reply(extractStationData(await response.json()), 200, env);
      } catch (error) {
        return reply({ error: error.message }, 500, env);
      }
    }

    return reply({ service: "Róbert Időjárás Központ API", status: "ok" }, 200, env);
  },
};
