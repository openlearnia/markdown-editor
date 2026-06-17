# Openlearnia Markdown

Multi-file Markdown workspace in the browser. Notes are stored locally using the [Origin Private File System (OPFS)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) — no server, no account.

An [Openlearnia](https://openlearnia.com) project.

## Features

- Split-pane editor with live GFM preview
- File tree with create, rename, and delete
- Auto-save to OPFS
- Command palette (`Ctrl+K` / `⌘K`)
- Export workspace as ZIP

## Quick start

```bash
bun install
bun run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Development server |
| `bun run build` | Production build → `dist/` |
| `bun run preview` | Preview production build |
| `bun run test` | Run unit tests |

## Browser support

Requires OPFS (`navigator.storage.getDirectory`). Use a recent Chrome, Edge, Firefox, or Safari.

## Deploy

Static SPA — build `dist/` and deploy to Cloudflare Pages (or any static host). SPA fallback: `/* /index.html 200`.

## License

MIT — see [LICENSE](LICENSE).
