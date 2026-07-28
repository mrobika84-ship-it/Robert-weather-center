# Cloudflare Worker – Netatmo

A mappát `worker` néven töltsd fel a meglévő GitHub repositoryba.

Cloudflare build beállítás:
- Root directory: `worker`
- Build command: hagyd üresen
- Deploy command: `npx wrangler deploy`

A `wrangler.jsonc` fájlban a KV namespace ID helyére a Cloudflare-ben létrehozott KV azonosítója kerül.

Cloudflare Secrets:
- NETATMO_CLIENT_ID
- NETATMO_CLIENT_SECRET

A titkos értékeket soha ne töltsd fel GitHubra.
