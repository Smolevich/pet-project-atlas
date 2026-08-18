# Deploy (public site, via GitHub Actions)

The Starlight static build is served by nginx on the origin host, behind a Cloudflare
Tunnel. Nothing here names the host, the provider or what else runs on it: the tunnel is
the only reason those details are not already public, and a deploy doc is a strange place
to give them back.

**This site has no Cloudflare Access in front of it.** The atlas is meant to be public —
no login, no bypass rule needed.

## How it works

Push to `main` → workflow **"Deploy"** (`.github/workflows/deploy.yml`), two jobs:

1. **Build and check** — `npm ci`, `npm test`, `npm run lint:voice`, `npm run build`,
   `npm run check:links`, then uploads `dist/` and `nginx-atlas.conf` as an artifact.
   A broken build never reaches the host — this matters more here than on a private site
   because this repo takes outside contributions.
2. **Ship to the origin host** — downloads that artifact, joins the tailnet, `scp`s the
   files over, then `ssh` moves the build into `/var/www/atlas`, installs the nginx site,
   runs `nginx -t`, reloads and smoke-tests the live page through nginx.

The split is the security boundary, not a style choice. `npm ci` runs install scripts from
every dependency in the tree; the SSH key lives only in the second job, where no
third-party code executes.

Manual run: Actions tab → "Deploy" → Run workflow.

## One-time setup (someone with server / Cloudflare access)

**1. GitHub Secrets** — seven, in `Settings → Secrets and variables → Actions`:

| Secret | What it is |
|---|---|
| `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` | Tailscale OAuth (tag `tag:gha-runner`) |
| `VDS_HOST`, `VDS_PORT`, `VDS_USER` | SSH connection over the private network |
| `VDS_SSH_KEY`, `VDS_SSH_PASSPHRASE` | deploy private key + its passphrase |

The deploy key is a deploy key: it belongs to this site and nothing else, and it is worth
rotating on any suspicion rather than reasoning about whether a leak was real.

**2. Cloudflare Tunnel ingress** — add `atlas.smolevich.com → http://localhost:80` to the
tunnel config (nginx routes by `server_name` from there).

**3. DNS** — a proxied record for `atlas.smolevich.com` pointing at the tunnel. Proxied is
not optional: unproxied, the record publishes the origin address the tunnel exists to hide.

**4. No Cloudflare Access application** — this site is public on purpose. Do not attach
one.

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
