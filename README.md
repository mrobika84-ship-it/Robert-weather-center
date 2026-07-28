# Robert Weather Center

## Első lépés – GitHub Pages

1. A repository gyökerébe töltsd fel ezt a négy fájlt:
   - `index.html`
   - `style.css`
   - `app.js`
   - `config.js`
2. Ne tölts fel Netatmo Client Secretet a GitHubra.
3. A GitHub Pages néhány perc múlva megjeleníti a műszerfalat.
4. Amíg a Worker nincs beállítva, a műszerfal próbaadatokat mutat.

## Második lépés – Cloudflare Worker

A `worker` mappában található a biztonságos Netatmo-kapcsolat mintája.

Szükséges beállítások:
- Cloudflare Worker
- KV namespace `RWC_KV`
- titkok:
  - `NETATMO_CLIENT_ID`
  - `NETATMO_CLIENT_SECRET`
- változók:
  - `FRONTEND_ORIGIN`
  - `NETATMO_REDIRECT_URI`

A Netatmo alkalmazás Redirect URI mezőjébe ugyanazt a Worker callback címet kell írni:
`https://A-WORKER-CIM.workers.dev/callback`

Ezután a `config.js` fájlban az `apiBaseUrl` értéke legyen a Worker címe.

## Biztonság

A Client Secret soha ne kerüljön a GitHub repositoryba vagy a böngészőben futó JavaScriptbe.
