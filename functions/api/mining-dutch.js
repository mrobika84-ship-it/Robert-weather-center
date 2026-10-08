export async function onRequestGet() {
  try {
    const upstream = await fetch('https://mining-dutch-api.mrobika84.workers.dev/', {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 0 }
    });
    if (!upstream.ok) return Response.json({error:'Mining-Dutch API HTTP '+upstream.status},{status:502,headers:{'Cache-Control':'no-store'}});
    const data = await upstream.json();
    return Response.json(data,{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
  } catch (e) {
    return Response.json({error:'Mining-Dutch API nem elérhető'},{status:502,headers:{'Cache-Control':'no-store'}});
  }
}