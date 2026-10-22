# SkillBridge AI

Production site: https://skillbridge-naija-ai.vercel.app/

SkillBridge is a mobile-first multilingual learning platform for English, Yoruba, Hausa and Igbo, including Firebase sign-in, learning paths, quiz and practice features, cloud sync, offline support, and AI Studio.

## Repository synchronization status

This repository contains a **partial verified source snapshot** recovered from the Vercel production deployment `dpl_77c3YdKBscaUeYAAHis81Myb7hiS` on October 22, 2026.

**Important: `app.js` is currently missing.** It is the main application module, so this repository cannot yet be deployed as a complete replacement for production. The existing Vercel site is unchanged. Do not connect automatic production deployments to this repository until the missing entrypoint is recovered and the app has passed an end-to-end test.

Present: `index.html`, `app.css`, `studio.js`, `studio.css`, `any-topic.js`, `auth.js`, `catalog.js`, `cloud-db.js`, `content.js`, `firebase-config.js`, `offline.js`, `skill-cases.js`, `sw.js`, `icon.svg`, `manifest.webmanifest`, `vercel.json`.

## Recovery

1. Export/download the original full `app.js` from the Vercel deployment, or retrieve it from the working project copy.
2. Commit it at the repository root, alongside `index.html`.
3. Test login, course generation, lesson selection, Studio, quiz grading, offline cache and Firestore synchronization.
4. Only then link this repo to the **existing** Vercel project `skillbridge-naija-ai` for deployments. Avoid creating a second Vercel project.

The Firebase web configuration in `firebase-config.js` is public client configuration, not an admin credential. Security depends on Firebase authorization and Firestore rules.
