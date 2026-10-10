# SHM Creator Studio

A responsive, Bengali-first Creator Tools MVP for SHM Digital Hub (`shmwb.in`).

## Included in this folder

- `index.html` — landing page and modal workspace
- `assets/css/style.css` — responsive glassmorphism UI
- `assets/js/app.js` — tool interactions and export features

## Current working tools

1. **Social Media Post Maker** — live poster preview and PNG download; optional image background.
2. **Bangla Caption Studio** — template-based Bengali caption drafts and copy.
3. **Digital Product Maker** — title, author, introduction and body; print dialog can save as PDF.
4. **Creator Portfolio Builder** — live preview, HTML download and print/PDF.
5. **Micro Business Kit** — quotation/service price list template and print/PDF.
6. **Creator Learning Hub** — static starter learning guidance.

## How to publish in your GitHub repository

1. Create a folder such as `creator-studio` in your repository.
2. Upload the complete contents of this folder, keeping the same structure.
3. Open `index.html` locally to test, or publish through GitHub Pages / your existing hosting.
4. If the site is published under a subfolder, the relative CSS and JS paths already work.
5. For a direct link, use your published path, for example `https://www.shmwb.in/creator-studio/` if your hosting maps that folder to that URL.

## Important limitations of this MVP

- No backend, user account, cloud sync, payment system or membership gate is included.
- Caption Studio uses templates; it is not an AI writing API.
- Local/browser-side data is not automatically synced across devices.
- The PDF option uses the browser print dialog: select **Save as PDF**.
- Business documents are generic templates, not tax-compliant accounting software.
- The poster PNG uses a browser canvas. Font rendering may differ across devices, especially for Bengali. Test with your actual browser and fonts.
- Google Fonts and the logo load from external URLs when internet access is available.
- Add privacy policy, terms, accessibility checks, rights/licence checks for templates and proper payment verification before commercial launch.

## Suggested next upgrades

1. Add more original templates and editable layout controls.
2. Add local autosave / IndexedDB only after explaining storage behavior.
3. Add a small user-feedback form.
4. Track privacy-respecting, aggregate usage metrics only with suitable notice/consent.
5. Add backend accounts and payments only after real user demand is validated.

## License

Starter code for the SHM Digital Hub project. Check all third-party assets and fonts separately before redistribution.
