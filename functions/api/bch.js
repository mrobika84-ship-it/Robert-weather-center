export async function onRequestGet() {
  const upstream = 'https://bitcoincash.mysolopool.com/api/client/qqw3yvsfjt4e45yw9ravhtuee3jvltrh9y72tr35t3';
  try {
    const r = await fetch(upstream, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Robert-BCH-Dashboard/1.0' }
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'Content-Type': r.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error:'upstream_fetch_failed'}), {
      status: 502, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
    });
  }
}