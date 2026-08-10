# Deploy (public, on hetzner, via GitHub Actions)

The Starlight static build is served by nginx on `bot-server`, behind a Cloudflare Tunnel.

**This host has no Cloudflare Access on this site.** Unlike the private KB on the same
box, atlas is meant to be public — no login, no bypass rule needed.

## How it works

Push to `main` → workflow **"Deploy to Hetzner"** (`.github/workflows/deploy.yml`):

1. Preflight: `npm ci`, `npm test`, `npm run lint:voice`, `npm run build`, `npm run check:links`.
   A broken build never reaches the box — this matters more here than on other sites
   because this repo takes outside contributions.
2. Runner joins the tailnet via the Tailscale GitHub Action.
3. `scp` ships `dist/` + `nginx-atlas.conf` to the server.
4. `ssh` moves the build into `/var/www/atlas`, installs the nginx site, `nginx -t`,
   reloads, and smoke-tests the live page through nginx.

Manual run: Actions tab → "Deploy to Hetzner" → Run workflow.

## One-time setup (someone with server / Cloudflare access)

**1. GitHub Secrets** — the standard seven, same tailnet and server as the other sites
on this box (voice-ai, LovioLab-docs):

| Secret | What it is |
|---|---|
| `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` | Tailscale OAuth (tag `tag:gha-runner`) |
| `VDS_HOST`, `VDS_PORT`, `VDS_USER` | SSH connection to bot-server (Tailscale address) |
| `VDS_SSH_KEY`, `VDS_SSH_PASSPHRASE` | deploy private key + its passphrase |

Copy the values from an existing repo on the same box (voice-ai or LovioLab-docs) into
`Settings → Secrets and variables → Actions` on this repo.

**2. Cloudflare Tunnel ingress** — add `atlas.smolevich.com → http://localhost:80`
to the tunnel config (nginx routes by `server_name` from there).

**3. DNS** — a proxied CNAME/A record for `atlas.smolevich.com` pointing at the tunnel,
same pattern as the other hostnames on this tunnel.

**4. No Cloudflare Access application** — this site is public on purpose. Do not attach
one, and do not add it to any Access policy used by the private KB.

## Triggering a manual deploy

Actions tab → "Deploy to Hetzner" → Run workflow → branch `main`.

## Checking it worked

- `gh run list --repo Smolevich/pet-project-atlas --limit 5` — latest run should be green.
- `curl -fsS https://atlas.smolevich.com/ | grep "a route out of zero traffic"` — confirms
  nginx is serving the current build, not a stale one.
- Spot-check a directory-style route, e.g. `https://atlas.smolevich.com/indexing/`, and a
  bad path, e.g. `https://atlas.smolevich.com/does-not-exist` — the latter must return a
  real `404`, not a soft-200.

## Local preview

```
npm run dev        # http://localhost:4321
npm run build      # dist/
```
