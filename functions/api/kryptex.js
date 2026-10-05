export async function onRequestGet() {
  const address = 'dgb1qt2w8z6k8tura70rufzrcvpyw89fverkrm2m3hl';
  const worker = 'nerdqaxe1';
  const base = 'https://pool.kryptex.com/dgb/api/v1/miner';
  try {
    const [cr, br] = await Promise.all([
      fetch(base + '/chart/' + address + '/' + worker, {headers:{Accept:'application/json'}}),
      fetch(base + '/balance/' + address, {headers:{Accept:'application/json'}})
    ]);
    const chart = cr.ok ? await cr.json() : null;
    const balance = br.ok ? await br.json() : null;
    return Response.json({chart,balance,status:{chart:cr.status,balance:br.status}}, {headers:{'Cache-Control':'no-store'}});
  } catch(e) {
    return Response.json({error:String(e)}, {status:500,headers:{'Cache-Control':'no-store'}});
  }
}