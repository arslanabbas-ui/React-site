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
    const description = article?.excerpt ?? 'Tideway Notes shares practical, useful ideas for everyday life.'
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
  usePageMetadata()
  return <div><Header /><main><div className="shell"><div className="home-header"><h1>Welcome to Tideway Notes</h1><p>A sample publication to test rendering and indexing by search engine crawlers.</p><div className="search"><input placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="categories"><button onClick={() => setCategory('All')} className={category === 'All' ? 'active' : ''}>All</button>{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'active' : ''}>{c}</button>)}</div></div><div className="cards">{visible.map((article) => <Card key={article.slug} article={article} />)}</div></div></main><Footer /></div>
}

function Article() {
  const [article, setArticle] = useState()
  useEffect(() => { const slug = window.location.pathname.split('/')[2]; setArticle(articles.find((a) => a.slug === slug)) }, [])
  usePageMetadata(article)
  if (!article) return <div><Header /><main><div className="shell"><h1>Article not found</h1></div></main><Footer /></div>
  const related = article.related.map((slug) => articles.find((a) => a.slug === slug))
  return <div><Header /><main><div className="shell"><article className="article"><h1>{article.title}</h1><p className="byline">{formatDate(article.date)} · {article.minutes} min read by {article.author}</p><div className="sections">{article.sections.map((section, i) => <section key={i}><h2>{section[0]}</h2><p>{section[1]}</p></section>)}</div></article><div className="related"><h2>Related</h2><div className="cards">{related.map((a) => <Card key={a.slug} article={a} />)}</div></div></div></main><Footer /></div>
}

function Router() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => { const handler = () => setPath(window.location.pathname); window.addEventListener('popstate', handler); return () => window.removeEventListener('popstate', handler) }, [])
  return path === '/' ? <Home /> : <Article />
}

export default Router