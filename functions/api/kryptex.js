export async function onRequestGet(context) {
  const address = 'dgb1qt2w8z6k8tura70rufzrcvpyw89fverkrm2m3hl';
  const base = 'https://pool.kryptex.com/dgb/api';
  try {
    const [wr, br, cr] = await Promise.all([
      fetch(base + '/v3/miner/workers/' + address, {headers:{'Accept':'application/json'}}),
      fetch(base + '/v1/miner/balance/' + address, {headers:{'Accept':'application/json'}}),
      fetch(base + '/v1/miner/chart/' + address + '/nerdqaxe1', {headers:{'Accept':'application/json'}})
    ]);
    const workers = wr.ok ? await wr.json() : null;
    const balance = br.ok ? await br.json() : null;
    const chart = cr.ok ? await cr.json() : null;
    return Response.json({workers,balance,chart,status:{workers:wr.status,balance:br.status,chart:cr.status}}, {headers:{'Cache-Control':'no-store'}});
  } catch (e) {
    return Response.json({error:String(e)}, {status:500,headers:{'Cache-Control':'no-store'}});
  }
}