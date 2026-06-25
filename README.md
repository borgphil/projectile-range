Projectile Range — GitHub Pages deployment

This repository is a small static site. To publish it as a GitHub Pages site you have two options:

1) Automatic via GitHub Actions (recommended)
   - The workflow `.github/workflows/deploy-gh-pages.yml` will deploy the repository root to the `gh-pages` branch on every push to `main`.
   - No additional secrets are required; the workflow uses the built-in `GITHUB_TOKEN`.
   - After the first successful run, Pages will be available at `https://<your-username>.github.io/<repo-name>/`.

2) Manual via repository settings
   - Go to the repository Settings → Pages and set the source to the `gh-pages` branch (or the `main` branch root).

Notes and recommendations
- Keep asset references relative (they already are), e.g. `script.js`, `styles.css`.
- If you prefer the `main` branch as the Pages source, you can change the repository Pages settings instead of using the action.

To test locally:

```bash
# from the repo root
python3 -m http.server 8000
# open http://localhost:8000 in your browser
```
