import { stationData, json } from "../_lib/netatmo.js";

export async function onRequestGet(context) {
  try {
    const data = await stationData(context.env);
    if (!data) return json({ error: "authorization_required" }, 401);
    return json(data);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
