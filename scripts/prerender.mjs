// Writes static HTML for the home page and one file per article after `vite build`, so
// crawlers that don't run JavaScript see each page's real <title> and meta description, and
// can find every article from the home page. The values come from src/articles.js through
// pageTitle()/pageDescription(), the same helpers App.jsx uses at runtime, so the
// pre-rendered head and the live document.title always agree.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { articles, pageDescription, pageTitle } from '../src/articles.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function withHead(html, article) {
  const titled = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(pageTitle(article))}</title>`)
  return titled.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(pageDescription(article))}" />`,
  )
}

// Plain links inside #root: React replaces them on load, crawlers without JavaScript follow them.
const articleLinks = articles
  .map((article) => `<li><a href="/articles/${article.slug}">${escapeHtml(article.title)}</a></li>`)
  .join('')
const home = withHead(shell, null).replace('<div id="root"></div>', `<div id="root"><ul>${articleLinks}</ul></div>`)
writeFileSync(join(dist, 'index.html'), home)

for (const article of articles) {
  const dir = join(dist, 'articles', article.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), withHead(shell, article))
}

console.log(`prerendered the home page and ${articles.length} article pages`)
