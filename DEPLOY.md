# Deploy latest changes (Railway + GitHub)

1. **Commit and push** (from the project folder):
   ```bash
   git add .
   git commit -m "Real EPA/USGS data, PDF data source, fixes"
   git push origin main
   ```

2. **Railway** will pick up the push and redeploy automatically (if your project is set to deploy from this repo). Check the Railway dashboard for build status.

3. **Env vars** — No need to change anything in Railway Variables unless you add new API keys. Existing `MAPBOX_TOKEN` and `ANTHROPIC_API_KEY` stay as-is.

No manual "redeploy" button is required unless you turned off auto-deploys in Railway.
