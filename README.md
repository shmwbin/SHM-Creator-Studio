# SHM Creator Studio Plus

Modern Bengali-first creator tools MVP for the SHM Digital Hub / India's Orange Economy concept.

## Files
- `index.html` — landing page, tool directory, categories, search, templates and modal workspace
- `assets/css/style.css` — responsive dark glassmorphism UI
- `assets/js/app.js` — client-side tool logic

## Included tools
1. Social Post Maker (PNG export; optional image background)
2. Bangla Caption Studio (template-based, not AI)
3. Portfolio Builder (HTML export / print to PDF)
4. Micro Business Kit (quotation / price list template)
5. Digital Product Maker (print to PDF)
6. Word & Character Counter
7. Text Formatter
8. Brand Color Lab
9. Price & Profit Calculator
10. Hashtag Helper
11. Short Video Script outline
12. Content Idea Planner

## Publish in your existing repository
Upload the contents of this folder into your existing `SHM-Creator-Studio` directory, preserving the exact structure:
```
SHM-Creator-Studio/
  index.html
  assets/
    css/style.css
    js/app.js
  README.md
```
Commit the changes and reload the deployed URL with a hard refresh (Ctrl+F5). If your current URL has `/home`, confirm that your host routes it to `index.html`; normally the folder URL should serve its `index.html`.

## Notes
- This is a frontend MVP. No login, cloud storage, backend, AI API, analytics, payments or membership is included.
- Most tool inputs are processed in the current browser page; this app does not upload their contents to a custom server.
- PDF export uses the browser print dialog; select Save as PDF.
- PNG rendering of Bengali text depends on available browser fonts; test it on your target devices.
- Profit calculations are estimates and do not account for all taxes, fees or business costs.
- The invoice/quotation tool is a generic document template, not compliant accounting software.
- Before commercial launch, test all workflows, add terms/privacy/contact pages, verify third-party asset licences and consider accessibility.
