// Writes one static HTML file per article after `vite build`, so crawlers that don't run
// JavaScript see each page's real <title> and meta description instead of the shell's.
// The values come from src/articles.js, the same source App.jsx uses at runtime, so the
// pre-rendered head and the live document.title always agree.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { articles, site } from '../src/articles.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function withHead(html, { title, description }) {
  const titled = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  return titled.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
}

for (const article of articles) {
  const page = withHead(shell, { title: `${article.title} | ${site.name}`, description: article.excerpt })
  const dir = join(dist, 'articles', article.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), page)
}

console.log(`prerendered ${articles.length} article pages into dist/articles/`)
