import { exchangeCode, json } from "./_lib/netatmo.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const savedState = await context.env.RWC_KV.get("OAUTH_STATE");
  const receivedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!savedState || savedState !== receivedState || !code) {
    return json({ error: "Érvénytelen Netatmo engedélyezési válasz." }, 400);
  }

  try {
    await exchangeCode(context.env, code);
    await context.env.RWC_KV.delete("OAUTH_STATE");

    const frontend = context.env.FRONTEND_ORIGIN;
    if (!frontend) {
      throw new Error("FRONTEND_ORIGIN nincs beállítva.");
    }

    return Response.redirect(new URL(frontend).toString(), 302);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
