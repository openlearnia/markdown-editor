# Openlearnia Markdown Editor

Browser-based Markdown workspace from [Openlearnia](https://openlearnia.com).

## Quick start

```bash
bun install
bun run dev
```

## Build & test

```bash
bun run build
bun run test
```

## Deploy

Pushes to `main` deploy `dist/` to Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`). Required org secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`. Pages project name is in `wrangler.toml`. Custom domain option: `markdown.openlearnia.com`.

## License

MIT — see [LICENSE](LICENSE).
