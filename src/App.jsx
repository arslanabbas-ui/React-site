import { useEffect, useMemo, useState } from 'react'
import { articles, categories, site } from './articles.js'

const formatDate = (date) => new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
const articlePath = (slug) => `/articles/${slug}`

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Link({ to, children, ...props }) {
  return <a href={to} onClick={(event) => { if (!event.metaKey && !event.ctrlKey) { event.preventDefault(); navigate(to) } }} {...props}>{children}</a>
}

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let element = document.head.querySelector(selector)
  if (!element) { element = document.createElement('meta'); element.setAttribute(property ? 'property' : 'name', name); document.head.append(element) }
  element.content = content
}

function usePageMetadata(article) {
  useEffect(() => {
    const title = article ? `${article.title} | ${site.name}` : `${site.name} — ${site.description}`
    const description = article?.excerpt ?? 'Tideway Notes is a sample React publication for JavaScript-rendering crawler tests.'
    const url = `${site.url}${article ? articlePath(article.slug) : '/'}`
    document.title = title
    setMeta('description', description)
    setMeta('og:type', article ? 'article' : 'website', true)
    setMeta('og:title', title, true); setMeta('og:description', description, true); setMeta('og:url', url, true)
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
    canonical.href = url
    let schema = document.getElementById('article-schema')
    if (article) {
      if (!schema) { schema = document.createElement('script'); schema.id = 'article-schema'; schema.type = 'application/ld+json'; document.head.append(schema) }
      schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.excerpt, datePublished: article.date, author: { '@type': 'Person', name: article.author }, publisher: { '@type': 'Organization', name: site.name }, mainEntityOfPage: url })
    } else if (schema) schema.remove()
  }, [article])
}

function Header() { return <header><div className="shell header-inner"><Link to="/" className="brand">{site.name}</Link><span>{site.description}</span></div></header> }
function Footer() { return <footer><div className="shell">Tideway Notes is an original sample React website for crawler testing. It is not a real publication.</div></footer> }

function Card({ article }) { return <article className="card"><p className="eyebrow">{article.category}</p><h2><Link to={articlePath(article.slug)}>{article.title}</Link></h2><p className="excerpt">{article.excerpt}</p><p className="byline">{formatDate(article.date)} · {article.minutes} min read</p></article> }

function Home() {
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('All')
  const visible = useMemo(() => articles.filter((article) => (category === 'All' || article.category === category) && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase())), [query, category])
  return <main className="shell"><p className="eyebrow">Field notes for ordinary days</p><h1>A little more ease, one useful idea at a time.</h1><p className="intro">A ten-article React sample blog with client-side navigation, searchable content, and route-aware SEO metadata.</p><section className="controls" aria-label="Article filters"><label><span>Search articles</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “home” or “desk”" /></label><div className="filters" aria-label="Categories">{['All', ...categories].map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></section><p className="count">{visible.length} {visible.length === 1 ? 'article' : 'articles'}</p><section className="grid">{visible.map((article) => <Card article={article} key={article.slug} />)}</section>{!visible.length && <div className="empty"><h2>No articles found</h2><p>Try a different word or choose another category.</p></div>}</main>
}

function Article({ article }) { const related = article.related.map((slug) => articles.find((item) => item.slug === slug)).filter(Boolean); return <main className="shell article-page"><article><p className="eyebrow">{article.category}</p><h1>{article.title}</h1><p className="deck">{article.excerpt}</p><p className="byline">By {article.author} · {formatDate(article.date)} · {article.minutes} min read</p>{article.sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<Link to="/" className="back">← All articles</Link></article><aside><p className="eyebrow">Keep exploring</p>{related.map((item) => <Link to={articlePath(item.slug)} key={item.slug}>{item.title}</Link>)}</aside></main> }
function NotFound() { return <main className="shell not-found"><p className="eyebrow">404</p><h1>This tide has gone out.</h1><p>The page you requested is not part of this sample publication.</p><Link to="/" className="back">← Return home</Link></main> }

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const listener = () => setPath(window.location.pathname); window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener) }, [])
  const match = path.match(/^\/articles\/([^/]+)\/?$/); const article = match ? articles.find((item) => item.slug === match[1]) : null
  const isHome = path === '/' || path === ''
  usePageMetadata(article ?? undefined)
  return <><Header />{isHome ? <Home /> : article ? <Article article={article} /> : <NotFound />}<Footer /></>
}
