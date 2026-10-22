# SkillBridge AI

**Live application:** https://skillbridge-naija-ai.vercel.app/

SkillBridge AI is a mobile-first learning platform with guided lessons and AI learning experiences in English, Yoruba, Hausa and Igbo. The current implementation includes Firebase Authentication, Firestore learning-progress synchronization, generated learning paths, interactive quizzes and scenarios, offline support, and the AI Studio.

## Production source recovery — complete

This repository preserves the **complete 17-file source snapshot** from Vercel production deployment `dpl_77c3YdKBscaUeYAAHis81Myb7hiS` (October 22, 2026), including the previously missing `app.js`.

All 17 application files, including `app.js`, were individually checked against their corresponding deployment-file SHA-1 hashes, with **17 of 17 matching exactly**. The files are at the repository root, matching the static deployment structure.

The source snapshot is complete. **This does not establish that all features have passed authenticated end-to-end tests.** Course generation depends on Firebase AI configuration and enabled provider services. Firebase browser configuration is not an admin secret; enforce access with Firebase Authentication, App Check, and Firestore security rules.

## Verification

The `Validate SkillBridge source` GitHub Actions workflow checks JavaScript syntax and validates HTML, service-worker and relative module references without requiring credentials.

To run the same static checks locally after cloning, execute `node --check app.js` (and check other `*.js` files).

Additional manual acceptance tests required before a deployment cutover: email sign-in/sign-out and password recovery; onboarding, course creation and lesson progression; AI Studio read/watch/practice/tutor views; quiz scoring; browser storage/offline cache; Firestore synchronization; mobile behavior in all four languages.

## Vercel connection

**Existing production project:** `skillbridge-naija-ai`, project ID `prj_ZQOl7fH67LcXJXFcuuFyDuLlCePe`, owned by the `kolade-s-projects-ae7fd73f` Vercel team.

**Repository:** `Erioluwa23/Skillbridge-AI` (production branch `main`).

Keep the existing Vercel project and domain. In Vercel, use this project's **Settings → Git → Connect Git Repository**, authorizing the Vercel GitHub integration for the `Erioluwa23` account and this repository first, if needed. Do not create a second project or replace the live deployment until the Git connection and first Git-triggered deployment have been verified.

Note: The GitHub integration authorized for ChatGPT is **different** from the GitHub integration authorized inside Vercel. Successfully pushing files from ChatGPT does not automatically grant Vercel access.

## Repository layout

- `index.html`, `app.js`, `app.css`: main static application.
- `studio.js`, `studio.css`: AI learning studio.
- `any-topic.js`, `catalog.js`, `content.js`, `skill-cases.js`: content and course generation.
- `auth.js`, `firebase-config.js`, `cloud-db.js`: user authentication and data sync.
- `offline.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`: offline/PWA assets.
- `vercel.json`: deployment headers.

## AI-rendered video tutorial pipeline (pilot — not live until configured)

The repository contains a new **🎬 AI Video** launcher (`video-ui.js`, `video-ui.css`) and a serverless `/api/video` route. A signed-in learner chooses a lesson, language (English, Yoruba, Hausa or Igbo), and one of three five-second sections: concept, example, or practice. Video is rendered on demand; opening a lesson does **not** charge the provider. The existing scene-based video walkthrough is retained.

The server verifies Firebase Authentication ID tokens using Google's public keys, restricts rendering to an allowlist, validates inputs, rate-limits paid generation through Upstash Redis, and stores successfully rendered MP4s in Vercel Blob. Redis caches the result to avoid repeat rendering of the same learner/lesson/section. The provider is called through the Vercel AI SDK v6 (`experimental_generateVideo`) and AI Gateway. The default pilot model is `xai/grok-imagine-video`, overridable with `VIDEO_MODEL`. Provider capabilities, pricing and model availability may change.

**Server-only environment variables required on the EXISTING Vercel project**:

- `AI_GATEWAY_API_KEY`: AI Gateway key with video generation access and budget.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob store read/write token.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: persistent Upstash Redis REST endpoint/credential.
- `VIDEO_ALLOWED_UIDS`: comma-separated Firebase Auth UIDs invited to the pilot.
- Optional `VIDEO_MODEL` and `VIDEO_DAILY_LIMIT` (defaults to three clips per UTC day).

**Provider spending is not activated by uploading code.** These credentials and a linked Git/Vercel build must be configured before real video rendering works. Never commit API keys, Firebase service-account keys, or Redis tokens.

Current limitations: generation is a synchronous request with up to a 275-second client/server timeout and can fail on Vercel plans with shorter function durations; the interface keeps that request open and is not yet a durable queued-rendering system. Multi-clip concatenation and guaranteed natural narration in all four languages are not implemented. Public Blob URLs are accessible to anyone who possesses the link; do not generate or include sensitive private information in prompts. Validate model/API behavior, provider costs, mobile performance, and native-language accuracy in a limited pilot before broad rollout.

**Deployment safety:** the existing production Vercel project remains unchanged until the repository is linked and a Git-triggered build/deployment is verified.
