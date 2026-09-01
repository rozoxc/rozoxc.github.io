# Portfolio — quick notes

Built on **Astro + Fuwari**. Content sourced from cv.pdf and the provided LinkedIn profile.

## Run
- `npm run dev`   → preview at http://localhost:4321
- `npm run build` → static output in `dist/`
- `npm run preview` → serve the built site

## What to personalize
- **Avatar:** still the Fuwari demo image. Drop a photo at `src/assets/images/` and update `avatar:` in `src/config.ts`.
- **GitHub URL:** set to `https://github.com/rozoxc` (guessed from the `rozoxc.github.io` in your CV). Fix in `src/config.ts` + `src/config.ts` navbar if the handle differs.
- **Site URL:** `astro.config.mjs` → `site: "https://rozoxc.github.io/"`. If you deploy to a project repo instead of the user page, also set `base`.
- **CTF writeups:** in `src/content/posts/ctf/`. These are example writeups built around your CV skill areas — replace flags/details with your real challenges (e.g. the IDEH CTF win).

## Deploy to GitHub Pages (rozoxc.github.io)
Push `dist/` or wire up the Astro GitHub Pages action. Fuwari README has the details.
