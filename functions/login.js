import { authorizationUrl, json } from "./_lib/netatmo.js";

export async function onRequestGet(context) {
  try {
    const state = crypto.randomUUID();
    await context.env.RWC_KV.put("OAUTH_STATE", state, {
      expirationTtl: 600
    });

    return Response.redirect(
      authorizationUrl(context.env, state),
      302
    );
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
