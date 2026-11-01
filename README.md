# Orbit: SaaS landing page

A conversion-focused landing page for a fictional AI incident-management SaaS, with an interactive WebGL globe, bento feature grid, monthly/yearly pricing toggle and accessible FAQ.

**Live demo → [https://abdeltl.github.io/orbit-saas-landing/](https://abdeltl.github.io/orbit-saas-landing/)**

![Screenshot](https://abdeltl.github.io/work/orbit-saas-landing.jpg)

## Highlights
- **WebGL globe:** up to 12k instanced dots on a Fibonacci lattice masked into continents, animated data arcs (tube geometry + shader window) and a fresnel atmosphere
- Bento grid with an animated alert-correlation visual and cursor-tracking glow
- **Pricing** (`src/pricing.ts`, unit-tested): radiogroup toggle with arrow keys, yearly discount and savings per team
- Native `<details>` FAQ, reveal-on-scroll, `SoftwareApplication` JSON-LD

## Engineering
- **Stack:** Vite 8, TypeScript (strict), Three.js 0.186, no UI framework, with about 140 KB of JS gzipped including Three.js. The 3D chunk is lazy-loaded after first paint.
- **Performance:** device-pixel-ratio capped at 2, render loop paused when the canvas is off-screen or the tab is hidden, `prefers-reduced-motion` honoured.
- **Accessibility:** semantic HTML, native form controls, keyboard support, visible focus, ARIA only where native semantics fall short.
- **Security:** strict CSP (`default-src 'self'`, no inline scripts/styles), every string rendered via `textContent`, self-hosted fonts (no third-party requests, GDPR-friendly), pinned dependencies with a 14-day Dependabot cooldown, `npm audit` in CI.
- **SEO:** unique title/description, canonical URL, Open Graph, JSON-LD structured data, `robots.txt` and `sitemap.xml`.
- **Architecture:** `pricing.ts` (tested) · `globe.ts` (3D) · `main.ts` (UI). Drop-in ready for a real signup endpoint or a headless CMS for copy.

## Run locally
```bash
npm ci --ignore-scripts
npm run dev      # http://localhost:5173
npm test         # unit tests (node:test)
npm run build    # typecheck + production build in dist/
```

## Deploy
Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml` (Settings → Pages → Source: *GitHub Actions*).

---
Designed & developed by [Abderrahman Tlemcani](https://abdeltl.github.io/). The brand in this demo is fictional.
