# SkillBridge Workplace Studio (hackathon pilot)

This release adds a self-contained Workplace Simulation Studio and private Skills Evidence Portfolio to the existing SkillBridge AI app.

## Working capabilities

- A visible Workplace Studio launch button that does not depend on the main app router.
- Two end-to-end fictional customer-support cases: delayed delivery and return request.
- Inspect order records, customer messages and company policy; resource-reading gate.
- Choose an initial action, write a response and save drafts.
- Formative five-criterion rubric with explicit warnings for risky promises; 100-point practice estimate (not a verified skills certification).
- Revise an answer while preserving prior attempts and scores.
- Private evidence portfolio with versions and an exportable JSON record.
- Browser-local offline persistence and per-account Cloud Firestore backup in the existing `learners/{uid}` document (no new database required).
- Optional AI coaching through Firebase AI Logic / Gemini, initiated only by the user while signed in and online; it does not override rubric scores.
- Basic interface localization for English, Yoruba, Hausa and Igbo. Workplace documents remain in English as realistic workplace artifacts, and translations require a native-speaking reviewer.

## Limitations and safety

- Rubric scores are keyword-based formative estimates, and should not be used for hiring or certification.
- AI coaching is experimental, depends on existing Firebase AI Logic availability and quotas, and may be unavailable.
- No public portfolio sharing is enabled; records are private by default.
- Guest/demo attempts remain on the current device. Authenticated accounts are saved locally and backed up to Firestore when online; if cloud backup fails, local work remains accessible. Concurrent writes across devices are not merged.
- Firestore rules must restrict `learners/{uid}` to the authenticated UID; this release does not broaden those rules.
- All customer records and companies used in the simulations are fictional. Do not enter real customer data or private information.

## Integration

New files: `simulation-cases.js`, `simulation-store.js`, `simulation.js`, `simulation.css`.

Changed files: `index.html` (new module and stylesheet), `sw.js` (precache new modules and remove nonexistent `video-pipeline.js`).

Deploy to the existing Vercel project `skillbridge-naija-ai` from GitHub; do not create a second project.

## Manual test plan

1. Open the app and use **Workplace Studio**.
2. Complete the delayed-delivery assignment, opening at least two documents and selecting an action.
3. Enter a response of at least 60 characters; submit; inspect five rubric criteria.
4. Revise the response and verify both versions remain in **My portfolio**.
5. Complete the return-request scenario; verify separate attempts and record export.
6. Reload while offline and confirm draft/portfolio access.
7. Sign in, complete an assignment, sign out, sign in on another device and verify Firestore restoration (requires network and rules validation).
8. Check English, Yoruba, Hausa and Igbo language selectors; arrange native-speaker review.
9. Test optional AI coaching only on a test account, without real personal data.
10. Confirm older lessons and sign-in/out continue working.

## Automated checks

`node --check` passed for all four new JS modules and the service worker.

Playwright headless Chromium test passed for two assignments, resource gating, decisions, submissions, portfolio retrieval, reopen and no page exceptions. This isolated browser harness uses a fake authentication user and does not constitute a live Firebase or Vercel end-to-end test.