export async function onRequestGet() {
  const address = 'dgb1qt2w8z6k8tura70rufzrcvpyw89fverkrm2m3hl';
  const worker = 'nerdqaxe1';
  const base = 'https://pool.kryptex.com/dgb/api/v1/miner';
  try {
    const [cr, br, pr] = await Promise.all([
      fetch(base + '/chart/' + address + '/' + worker, {headers:{Accept:'application/json'}}),
      fetch(base + '/balance/' + address, {headers:{Accept:'application/json'}}),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=digibyte&vs_currencies=eur', {headers:{Accept:'application/json','User-Agent':'RobertWeatherCenter/1.0'}})
    ]);
    const chart = cr.ok ? await cr.json() : null;
    const balance = br.ok ? await br.json() : null;
    const price = pr.ok ? await pr.json() : null;
    const rawPrice = Number(price?.digibyte?.eur);
    const eurPrice = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0.00381;
    return Response.json({chart,balance,price,eurPrice:Number.isFinite(eurPrice)?eurPrice:null,status:{chart:cr.status,balance:br.status,price:pr.status}}, {headers:{'Cache-Control':'no-store'}});
  } catch(e) {
    return Response.json({error:String(e)}, {status:500,headers:{'Cache-Control':'no-store'}});
  }
}