# ClipForge

ClipForge is a local web app inspired by AutoShorts-style creation flows.
It takes source text and creates **3 short-video variants** with:

- hooks,
- timestamped shot lists,
- captions,
- hashtags.

## Run locally

```bash
python -m http.server 4173
```

Open <http://localhost:4173>.

## Publish

This repository includes a GitHub Pages workflow at `.github/workflows/publish.yml`.

1. Push this repo to GitHub.
2. In **Settings → Pages**, ensure the source is **GitHub Actions**.
3. Push to the `main` branch (or run the workflow manually).
4. Your site will be published at:
   - `https://<your-user-or-org>.github.io/<repo-name>/`

## Features

- Platform, tone, and duration controls.
- Audience + CTA inputs to shape output.
- Three script frameworks per generation:
  - Pattern interrupt,
  - Problem → Fix,
  - Story + Lesson.
- One-click copy per variant and copy-all support.
- Download complete generation as JSON.

## Notes

- This is deterministic, client-side generation in `app.js`.
- No external AI API is required.
