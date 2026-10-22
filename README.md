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
