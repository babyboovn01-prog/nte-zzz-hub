# NTE + ZZZ Hub — code repo

English-first gacha tools hub for Neverness to Everness (NTE) and Zenless Zone Zero (ZZZ).
Wish simulators, pity trackers, build calculators. Not text guides.

## Status (8 Nov 2026)

- Data: `nte-data-v15.md`, `zzz-data-v33.md`, `seo-domain-check.md`, `domain-registrar-check-2026-11-08.md`
- Demo: hosted artifact `nte-zzz-hub` (Wish Simulator NTE + Pity Tracker ZZZ)
- Domain: pityhub.com preferred, $11.81/yr on Porkbun — **NOT bought**, user deferred 2026-11-08
- NTE v1.5 starts 11 Nov 2026 (Elyms Phase 1, Exe Phase 2). ZZZ v3.3 Phase 2 Severian 11 Nov–1 Dec 2026.

## Open in VS Code (local, recommended)

This repo lives in `~/workspace/nte-zzz-hub/` on the Muse VM. There is **no direct
VS Code Remote-SSH connection into this VM** — it has no public IP, and its
Tailscale client is outbound-only (accepts no incoming connections).

Workable workflows:

1. **GitHub (best for 2 people / long-term):** push this folder to a GitHub repo,
   then `git clone` it on your own computer and open the folder in VS Code.
   I develop here, you review in VS Code locally, changes sync via git.
2. **Download + open locally:** download this folder as a zip, unzip, open in VS Code.
3. **I develop here, you review the demo:** fastest for now. I keep building in
   this environment and you test the hosted demo artifact. Code stays in this repo
   so it can move to GitHub at any time.

## Deploy — Cloudflare Pages (chosen 2026-11-08)

Free tier: unlimited bandwidth, free custom domain + SSL, GitHub auto-deploy,
AdSense-safe. No build step — plain HTML + ES modules.

1. Push this repo to GitHub as a **public** repo `nte-zzz-hub`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
   Pick the repo. Framework preset: **None**. Build command: *(empty)*.
   Build output directory: `/` (repo root).
3. Deploy. You get `https://nte-zzz-hub.pages.dev` free.
4. Later: buy `pityhub.com` ($11.81/yr, Porkbun) → Pages → Custom domains →
   add `pityhub.com` (apex needs nameservers moved to Cloudflare, free) or
   `www.pityhub.com` via CNAME.
5. AdSense later needs the owned domain + a real `ads.txt` at the root with
   your publisher ID. Do NOT create a placeholder `ads.txt` before that.

Files for Pages: `_headers` (security + caching), `_redirects`, `robots.txt`,
`sitemap.xml` (canonical `pityhub.com` — update if the domain changes).

## Run locally

```bash
cd nte-zzz-hub
npx serve .
# open http://localhost:3000
```

Node >= 20. No build step yet — plain HTML + ES modules in `src/`.

## Gacha rates — read before editing

- `src/gacha.js` is the single source of truth for pull math.
- NTE rates are **community-modelled, UNVERIFIED** — no official Hotta/Perfect World
  rate sheet was found. Do not present them as official in UI copy.
- ZZZ Agent rates are from the in-game Signal Search Details screen; soft pity
  (ramp from pull 74, +6%/pull) is community-measured, sources differ 74 vs 75.
- Featured A-ranks for NTE v1.5 both phases + ZZZ v3.3 Phase 2 were NOT FOUND
  as of 8 Nov 2026 — re-check ~9–11 Nov, do not invent them.

## Structure

- `index.html` — hub homepage (tool links + quick simulators)
- `nte-simulator.html`, `zzz-simulator.html` — wish simulators
- `pity-tracker.html` — exact-odds pity calculator (DP over gacha.js rates, localStorage save)
- `damage-calculator.html` — ATK/CRIT/DMG% estimator (labelled estimator, not game-accurate)
- `banner-schedule.html` — NTE v1.5 + ZZZ v3.3 banners, countdown to 11 Nov 2026
- `tier-list.html` — community snapshot, 8 Nov 2026
- `codes.html` — ZZZ active codes + NTE expired codes, last checked 8 Nov 2026
- `characters.html` — rosters rendered from `src/characters.js` (NTE 26, ZZZ 62)
- `assets/style.css` — shared stylesheet
- `src/gacha.js` — pull math (NTE + ZZZ), single source of truth — do not duplicate rate logic in pages
- `src/data.json` — banners, roster counts, codes, domains (checked 8 Nov 2026)
- `*.md` — research data, SEO + domain checks
