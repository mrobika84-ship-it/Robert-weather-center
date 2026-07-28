import { authorizationUrl } from "./_lib/netatmo.js";

export async function onRequestGet(context) {
  const state = crypto.randomUUID();
  await context.env.RWC_KV.put("OAUTH_STATE", state, { expirationTtl: 600 });
  return Response.redirect(authorizationUrl(context.env, state), 302);
}
