# Hosting Smash India on Cloudflare Pages

The site is a static Vite + React build. Data refreshes via GitHub Actions, which commit JSON back to the repo — Cloudflare Pages auto-deploys on every commit. No backend, no database.

```
GitHub repo ──┬── Actions cron (6h + daily)  → commits to public/data/*.json
              └── Cloudflare Pages            → auto-deploy on push  → global CDN
```

## One-time setup

### 1. Push to GitHub

Already done if you saw the "pushed to github.com/<you>/smash-india" output. Otherwise:

```bash
cd ~/workspace/smash-india
gh repo create smash-india --public --source=. --push
# (uses your existing gh auth)
```

### 2. Add the Gemini secret to GitHub

GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**

- Name: `GEMINI_API_KEY`
- Value: your key from https://aistudio.google.com/apikey

Both workflows (`refresh-data.yml` and `daily-article.yml`) read it as `${{ secrets.GEMINI_API_KEY }}`.

### 3. Connect Cloudflare Pages

1. Sign in at https://dash.cloudflare.com (create an account if you don't have one).
2. Sidebar → **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize the Cloudflare GitHub app for your `smash-india` repo.
4. **Set up builds and deployments** screen — fill in:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: leave empty
   - **Environment variables**: none needed (the Gemini key lives in GitHub, not here)
5. Click **Save and Deploy**. First build runs in ~1 min and you get a live URL at `smash-india.pages.dev`.

`public/_redirects` handles SPA fallback so React Router routes resolve on hard refresh (`/news/<slug>` etc.). No additional config needed.

### 4. Verify it's running itself

- Push a small change → Cloudflare rebuilds in ~1 min.
- In GitHub → Actions → **Refresh data** → **Run workflow** to trigger the 6h cron manually. Watch it commit → Cloudflare auto-redeploys.
- Same for **Daily article**.

That's it. From here it runs unattended forever.

## Updating

- **Code changes** — push to `main`. Cloudflare deploys.
- **Data changes** — automatic via the two cron workflows. To force-refresh now, hit **Run workflow** in Actions.
- **A bad article slipped in** — edit/delete it in `public/data/articles.json`, push.

## Custom domain (optional)

1. Buy a domain at Cloudflare Registrar (cheapest — about ₹800/yr for `.in` or `.com`).
2. In Cloudflare Pages → your project → **Custom domains → Set up a custom domain** → enter your domain.
3. Cloudflare auto-configures DNS since the registrar is the same. SSL is automatic.

## Costs (free tier)

- **Cloudflare Pages** — free, **unlimited bandwidth and requests**, 500 builds/month (one build per push). More generous than Vercel hobby.
- **GitHub Actions** — 2,000 free minutes/month; each pipeline run is < 2 min, two crons/day ≈ 20 min/month.
- **Gemini Flash** — free tier covers thousands of requests/month; we use ~12/day.
- **Wikimedia Commons photos** — free, CC BY-SA / GODL with attribution.

Total: **₹0/month** at any reasonable traffic. Custom domain: ~₹800/year if you want one.
