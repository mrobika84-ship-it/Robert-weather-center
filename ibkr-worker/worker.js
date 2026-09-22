const QUERY_ID = "1645550";
const ALLOWED_ORIGIN = "https://mrobika84-ship-it.github.io";
const SEND_URL = "https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest";
const GET_URL = "https://gdcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement";

function headers() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300"
  };
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: headers() });
}

function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([\w]+)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function rows(xml, name) {
  return [...xml.matchAll(new RegExp("<" + name + "\\b[^>]*>", "g"))].map(m => attrs(m[0]));
}

function number(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function flexRequest(token) {
  const send = new URL(SEND_URL);
  send.search = new URLSearchParams({ t: token, q: QUERY_ID, v: "3" });
  const sendText = await (await fetch(send)).text();
  const reference = sendText.match(/<ReferenceCode>([^<]+)<\/ReferenceCode>/)?.[1];
  if (!reference) {
    const error = sendText.match(/<ErrorMessage>([^<]+)<\/ErrorMessage>/)?.[1] || "Az IBKR nem adott lekérdezési azonosítót.";
    throw new Error(error);
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt) await wait(1000);
    const get = new URL(GET_URL);
    get.search = new URLSearchParams({ q: reference, t: token, v: "3" });
    const response = await fetch(get);
    const text = await response.text();
    if (text.includes("<FlexQueryResponse") || text.includes("<FlexStatements")) return text;
    const code = text.match(/<ErrorCode>([^<]+)<\/ErrorCode>/)?.[1];
    if (code !== "1019" && code !== "1009") {
      const message = text.match(/<ErrorMessage>([^<]+)<\/ErrorMessage>/)?.[1];
      throw new Error(message || "Az IBKR-jelentés nem tölthető le.");
    }
  }
  throw new Error("Az IBKR-jelentés még nem készült el. Próbáld újra később.");
}

function normalize(xml) {
  const accounts = rows(xml, "AccountInformation");
  const nav = rows(xml, "NetAssetValue");
  const cash = rows(xml, "CashReportCurrency");
  const positions = rows(xml, "OpenPosition");
  const trades = rows(xml, "Trade");
  const transfers = rows(xml, "Transfer");

  const account = accounts[0] || {};
  const latestNav = nav.at(-1) || {};
  return {
    generatedAt: new Date().toISOString(),
    account: {
      currency: account.currency || account.baseCurrency || "EUR",
      type: account.accountType || null
    },
    summary: {
      netLiquidation: number(latestNav.total ?? latestNav.netLiquidationValue ?? latestNav.value),
      cash: cash.map(x => ({
        currency: x.currency,
        endingCash: number(x.endingCash),
        settledCash: number(x.settledCash),
        buyingPower: number(x.buyingPower)
      }))
    },
    positions: positions.map(x => ({
      symbol: x.symbol || x.description,
      description: x.description || null,
      assetCategory: x.assetCategory || null,
      currency: x.currency || null,
      quantity: number(x.position),
      price: number(x.markPrice),
      value: number(x.positionValue),
      costBasis: number(x.costBasisMoney),
      unrealizedPnl: number(x.fifoPnlUnrealized ?? x.unrealizedPnl),
      unrealizedPnlPercent: number(x.percentOfNAV)
    })),
    trades: trades.slice(-100).map(x => ({
      date: x.tradeDate || x.dateTime || null,
      symbol: x.symbol || x.description,
      side: x.buySell || x.transactionType || null,
      quantity: number(x.quantity),
      price: number(x.tradePrice),
      proceeds: number(x.proceeds),
      commission: number(x.ibCommission),
      currency: x.currency || null
    })),
    transfers: transfers.slice(-100).map(x => ({
      date: x.date || x.reportDate || null,
      type: x.type || x.transactionType || null,
      description: x.description || null,
      amount: number(x.amount),
      currency: x.currency || null
    }))
  };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: headers() });
    const url = new URL(request.url);
    if (url.pathname === "/") return json({ service: "IBKR portfolio API", status: "ok" });
    if (url.pathname !== "/api/portfolio") return json({ error: "not_found" }, 404);
    if (!env.IBKR_TOKEN) return json({ error: "IBKR_TOKEN nincs beállítva." }, 500);

    const cache = caches.default;
    const key = new Request("https://cache.local/ibkr-portfolio");
    const cached = await cache.match(key);
    if (cached) return cached;

    try {
      const response = json(normalize(await flexRequest(env.IBKR_TOKEN)));
      ctx.waitUntil(cache.put(key, response.clone()));
      return response;
    } catch (error) {
      return json({ error: error.message }, 502);
    }
  }
};
