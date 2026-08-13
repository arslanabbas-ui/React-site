# Tideway Notes

An independent Vite + React sample blog for testing JavaScript-rendering crawlers. It contains no SearchAtlas, Pixel, analytics, or third-party optimization scripts.

## Run locally

```bash
npm install
npm run dev
```

Build the production app with `npm run build`, then preview it with `npm run preview`.

## Deploy

Deploy the `react-test-blog` directory to Vercel. `vercel.json` rewrites article URLs to the React entry point so direct links and refreshes work. After deployment, replace `https://tideway-notes.vercel.app` in `src/articles.js`, `public/robots.txt`, and `public/sitemap.xml` with the assigned production domain.

Article metadata (title, description, canonical URL, Open Graph values, and Article JSON-LD) is added after client-side routing, by design.
