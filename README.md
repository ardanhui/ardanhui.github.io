# ardanhui.github.io

Ardansyah Falah — portfolio v2 + Komunitech landing page, served by GitHub Pages at https://ardanhui.github.io/.

- `/` — portfolio (static HTML/CSS/JS, self-hosted fonts, CV PDF)
- `/komunitech` — Komunitech landing page, course and learn pages

## Source

Built from `ardanhui-site` with `python3 build_static.py` (portfolio → root, `public/` → `komunitech/`).
The build output in this repo is the deployable static site; deployment is automatic via the
`.github/workflows/pages.yml` workflow on every push to `main`.
