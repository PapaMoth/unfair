# ClipForge

ClipForge is a local web app inspired by AutoShorts-style creation flows.
It gives you **one system for daily niche videos on autopilot** with:

- a daily content planner,
- 3 short-video variants per idea,
- timestamped shot lists,
- captions + hashtags,
- and an optional AI video production plan.

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

- **Autopilot Planner**: build 7/14/30-day niche video plans instantly.
- Multiple templates (Educational, Story, Problem/Solution, Authority/Proof).
- Platform, tone, and duration controls.
- Audience + CTA inputs to shape output.
- Three script frameworks per generation:
  - Pattern interrupt,
  - Problem → Fix,
  - Story + Lesson.
- One-click copy per variant and copy-all support.
- Download complete generation as JSON.
- AI Video Generator section that can call OpenAI Responses API and return a production-ready scene plan JSON.
- AI image/video scene planning for composition assets.
- `Build Composition JSON` button that emits a `VideoCompositionInput` object.
- Manual `Generate Video` workflow (Script + Stock + TTS + Captions + Render) with dashboard preview.
- Performance Analytics dashboard and auto-optimization suggestions based on watch/CTR metrics.
- Scheduling + approval flow (Draft → Pending → Approved) before publishing.
- One-click publish actions for YouTube, Instagram, and TikTok (app-level workflow simulation).
- Type definition included at `types/video-composition.d.ts`.

## Notes

- Core planner + variant generation are deterministic and client-side in `app.js`.
- AI video generation requires your own OpenAI API key and network access.
- API key is used only in-browser and is not persisted by the app.


## Next.js Dashboard

A server-side dashboard page is available at `app/dashboard/page.tsx` and expects Prisma models from `prisma/schema.prisma` plus a Prisma client helper at `lib/db.ts`.


The channel detail page is available at `app/channels/[id]/page.tsx` and includes a server action to trigger generation plus video status/render links.

The Prisma `Video` model includes status, final render URL, and thumbnail URL fields for dashboard/channel previews.

A video details page is available at `app/videos/[id]/page.tsx` with script, render preview, and per-scene breakdown.

A server route at `app/api/channels/[id]/generate/route.ts` updates render URLs (`finalVideoUrl`, `thumbnailUrl`, `subtitlesUrl`) and transitions status to `RENDERED` or `PUBLISHED` based on `Channel.approvalRequired`.

A demo insert script is available at `prisma/seed-demo-video.ts` to create a completed sample video record (update `channelId` before running).

Additional generation pipeline types are defined in `types/generation.ts` (topic/script/scene/subtitle/job payload).


## Stripe

Stripe checkout endpoint: `app/api/stripe/checkout/route.ts` and billing page: `app/billing/page.tsx`. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` in environment variables (`.env.example` included).

OpenAI server-side key access helper is defined in `lib/openai.ts` and expects `OPENAI_API_KEY` from env (never hardcode keys in source).

Validation schemas for topic/script/scene generation are defined in `lib/schemas.ts` using `zod`.

A retryable JSON+schema parser helper is available at `lib/parse-with-retry.ts` for robust AI output parsing.

Worker script generation service added at `apps/worker/src/services/generate-script.ts` using `parseWithRetry`, shared `ScriptSchema`, and OpenAI provider integration.

Model token pricing constants are defined in `packages/shared/src/model-pricing.ts`.

Task-to-model routing constants are defined in `packages/shared/src/task-model-map.ts` (`TASK_MODEL_MAP`).

A shared model selector helper `pickCheapestModel(task)` is available in `packages/shared/src/model-router.ts`.

Worker provider supports task-aware routing via `generateTextWithTask(prompt, task)` in `apps/worker/src/providers/ai.provider.ts`.
