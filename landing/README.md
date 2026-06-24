# QuickSplit — Landing Page

A minimal, zero-build static marketing site for QuickSplit. It leads with the key
differentiators vs Splitwise and includes the **Privacy Policy** and **Support** pages that
the App Store and Google Play require for submission.

This is intentionally separate from the full web app in `../frontend/` (which is **not**
deployed for V1). Edit and ship this folder independently.

## Files

```
index.html      Marketing page (hero, why-vs-Splitwise, features, how-it-works, CTA)
privacy.html    Privacy Policy  (required for store submission)
support.html    Support / FAQ / account-deletion  (required for store submission)
styles.css      Shared styles — design tokens mirror the app (forest green / orange, Playfair + Inter)
assets/         App icon + favicon (copied from ../mobile/assets)
netlify.toml    Netlify static config (+ /privacy, /support clean URLs)
vercel.json     Vercel static config (cleanUrls)
```

No build step, no dependencies. Fonts load from Google Fonts; everything else is local.

## Preview locally

```bash
cd landing
python3 -m http.server 4321   # then open http://localhost:4321
```

## Deploy

**Netlify (drag-and-drop):** drag the `landing/` folder onto https://app.netlify.com/drop.

**Netlify (CLI):**
```bash
cd landing && npx netlify deploy --prod --dir .
```

**Vercel (CLI):**
```bash
cd landing && npx vercel --prod
```
Or in the Vercel dashboard: import the repo, set **Root Directory = `landing`**, framework
preset **Other**, no build command, output directory `.`.

## Before going live (TODO)

- [ ] Point a custom domain (e.g. `quicksplit.app`) at the deployment.
- [ ] Replace `hello@quicksplit.app` / `privacy@quicksplit.app` with real, monitored inboxes.
- [ ] In `privacy.html`, add the registered legal entity + jurisdiction.
- [ ] Swap the "Coming soon" store badges for real App Store / Play Store links once the apps
      are published (or wire the buttons to a real waitlist form instead of `mailto:`).
- [ ] Optional: add real device screenshots to a gallery section once store assets are finalized.
