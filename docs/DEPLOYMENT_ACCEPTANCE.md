# Deployment acceptance

A Pages migration is not complete until a fresh GitHub Actions deployment has succeeded from `main` and the deployed root renders the React application rather than the legacy capability explorer.

Required checks:

- dependency installation succeeds without requiring a nonexistent lockfile
- Vite build succeeds
- generated `dist/index.html` contains the React root
- SPA fallback is generated
- Pages deployment succeeds
- root `/Kleenest_Architecture/` resolves to the application Home
- `/Kleenest_Architecture/capabilities` remains the optional architecture explorer
