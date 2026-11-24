import config from '../site.config.mjs';
import { strings } from './i18n.mjs';
import { icons } from './icons.mjs';
import { pickArt } from './art.mjs';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad2 = (n) => String(n).padStart(2, '0');

// ---------- Bağlam: dil, adresler, görseller ----------
export function makeCtx({ lang, base, siteUrl, artRegistry }) {
  const t = strings[lang];
  const defaultLang = config.languages[0];
  const prefix = (l) => (l === defaultLang ? '' : `/${l}`);
  const url = (p) => `${base}${p}`;
  const L = (p) => url(`${prefix(lang)}${p}`); // aynı dilde adres
  const artUrl = (kind, palette, seed) => {
    const name = `${kind}-${palette}-${seed}`.replace(/[^a-z0-9-]/gi, '');
    artRegistry.set(name, { kind, palette, seed });
    return url(`/art/${name}.svg`);
  };
  const media = (item, seedKey) => {
    if (item.image) return item.image.startsWith('http') ? item.image : url(item.image);
    const fallback = pickArt(seedKey);
    return artUrl(item.art || fallback.kind, item.palette || fallback.palette, seedKey);
  };
  const date = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
    new Intl.DateTimeFormat(t.locale, { ...opts, timeZone: 'UTC' }).format(d);
  const section = (id) => config.sections.find((s) => s.id === id);
  const sectionName = (id) => (section(id) ? section(id)[lang] : '');
  return { lang, t, base, siteUrl, prefix, url, L, artUrl, media, date, section, sectionName, defaultLang };
}

export const paths = {
  home: '/',
  issues: '/issues/',
  issue: (n) => `/issues/${pad2(n)}/`,
  article: (a) => `/articles/${a.slug}/`,
  sections: '/sections/',
  section: (id) => `/sections/${id}/`,
  video: '/video/',
  membership: '/membership/',
  about: '/about/',
  search: '/search/',
};

// ---------- Ortak parçalar ----------
function header(c, alt, active) {
  const { t } = c;
  const nav = [
    ['issues', paths.issues], ['sections', paths.sections], ['video', paths.video],
    ['membership', paths.membership], ['about', paths.about],
  ];
  const langName = (l) => (l === 'en' ? 'English' : l === 'tr' ? 'Türkçe' : l.toUpperCase());
  const langLinks = config.languages
    .map((l) => `<a href="${esc(alt[l] || c.url(c.prefix(l) + '/'))}" hreflang="${l}" lang="${l}"${l === c.lang ? ' aria-current="true"' : ''}><span class="l-full">${langName(l)}</span><span class="l-short">${l.toUpperCase()}</span></a>`)
    .join('<span class="lang-sep" aria-hidden="true">·</span>');
  const langOptions = config.languages
    .map((l) => `<option value="${esc(alt[l] || c.url(c.prefix(l) + '/'))}" lang="${l}"${l === c.lang ? ' selected' : ''}>${langName(l)}</option>`)
    .join('');
  return `<header class="site-header">
  <div class="wrap header-inner">
    <a class="masthead" lang="en" href="${c.L('/')}">${esc(config.name)}</a>
    <nav class="main-nav" id="main-nav" aria-label="${esc(t.menu)}">
      <ul>${nav.map(([k, p]) => `<li><a href="${c.L(p)}"${active === k ? ' aria-current="page"' : ''}>${esc(t.nav[k])}</a></li>`).join('')}<li class="nav-lang" role="group" aria-label="${esc(t.languageLabel)}"><span class="nav-lang-label">${esc(t.languageLabel)}</span><span class="nav-lang-links">${langLinks}</span></li></ul>
      <a class="btn btn-solid nav-cta" href="${c.L(paths.membership)}">${esc(t.becomeMember)}</a>
    </nav>
    <div class="header-tools">
      <label class="lang-select-wrap"><span class="visually-hidden">${esc(t.languageLabel)}</span><select class="lang-select" data-lang-select aria-label="${esc(t.languageLabel)}">${langOptions}</select></label>
      <a class="icon-btn" href="${c.L(paths.search)}" aria-label="${esc(t.search)}">${icons.search(20)}</a>
      <a class="btn btn-solid header-cta" href="${c.L(paths.membership)}">${esc(t.becomeMember)}</a>
      <button class="icon-btn menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="${esc(t.menu)}" data-label-open="${esc(t.menu)}" data-label-close="${esc(t.close)}">${icons.menu(22)}</button>
    </div>
  </div>
</header>`;
}

function footer(c, alt) {
  const { t } = c;
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="masthead masthead-footer" lang="en" href="${c.L('/')}">${esc(config.name)}</a>
      <p class="footer-tag">${esc(t.tagline)}</p>
      ${config.social.length ? `<ul class="footer-list footer-social">${config.social.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}
    </div>
    <div>
      <h2 class="footer-h">${esc(t.sections)}</h2>
      <ul class="footer-list">${config.sections.map((s) => `<li><a href="${c.L(paths.section(s.id))}">${esc(s[c.lang])}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-h">${esc(config.name)}</h2>
      <ul class="footer-list">
        <li><a href="${c.L(paths.issues)}">${esc(t.allIssues)}</a></li>
        <li><a href="${c.L(paths.video)}">${esc(t.nav.video)}</a></li>
        <li><a href="${c.L(paths.membership)}">${esc(t.nav.membership)}</a></li>
        <li><a href="${c.L(paths.about)}">${esc(t.about)}</a></li>
        ${config.contactEmail ? `<li><a href="mailto:${esc(config.contactEmail)}">${esc(t.contact)}</a></li>` : ''}
        <li><a href="${c.L('/feed.xml')}">${esc(t.rss)}</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">© ${new Date().getFullYear()} ${esc(config.name)}. ${esc(t.rights)}</div>
</footer>`;
}

export function layout(c, { title, description = '', body, alt = {}, active = '', image = '', bodyClass = '', path = '/' }) {
  const fullTitle = title ? `${title} | ${config.name}` : `${config.name} | ${c.t.tagline}`;
  const desc = description || c.t.tagline;
  const canonical = c.siteUrl ? `${c.siteUrl}${c.prefix(c.lang)}${path}` : '';
  const origin = (c.siteUrl.match(/^https?:\/\/[^/]+/) || [''])[0];
  const hreflangs = origin ? config.languages.map((l) => alt[l] ? `<link rel="alternate" hreflang="${l}" href="${esc(origin + alt[l])}">` : '').join('') : '';
  return `<!doctype html>
<html lang="${c.t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
${hreflangs}
<meta property="og:title" content="${esc(title || config.name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${bodyClass.includes('page-article') ? 'article' : 'website'}">
${image && origin && !image.endsWith('.svg') ? `<meta property="og:image" content="${esc(image.startsWith('http') ? image : origin + image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${c.url('/favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${esc(config.name)}" href="${c.L('/feed.xml')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400..700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${c.url('/assets/style.css')}">
</head>
<body class="${bodyClass}" data-lang="${c.lang}" data-base="${esc(c.base)}">
<a class="skip" href="#main">Skip to content</a>
${header(c, alt, active)}
<main id="main">
${body}
</main>
${footer(c, alt)}
<script src="${c.url('/assets/site.js')}" defer></script>
</body>
</html>`;
}

// ---------- Bileşenler ----------
export function issueCover(c, issue, { size = 'lg', isNew = false } = {}) {
  const { t } = c;
  const src = issue.cover ? c.url(issue.cover) : c.artUrl(issue.art || pickArt(`issue-${issue.number}`).kind, issue.palette || pickArt(`issue-${issue.number}`).palette, `issue-${issue.number}`);
  const month = c.date(issue.date, { month: 'long', year: 'numeric' });
  return `<a class="cover cover-${size}" href="${c.L(paths.issue(issue.number))}" aria-label="${esc(`${t.issue} ${pad2(issue.number)}: ${issue.title[c.lang]}`)}">
  <span class="cover-art"><img src="${esc(src)}" alt="" loading="lazy"></span>
  <span class="cover-shade"></span>
  ${isNew ? `<span class="cover-badge">${esc(t.newest)}</span>` : ''}
  <span class="cover-mast" lang="en">${esc(config.name)}</span>
  <span class="cover-text">
    <span class="cover-num"><small>${esc(t.issue)}</small>${pad2(issue.number)}</span>
    ${size !== 'sm' ? `<span class="cover-title">${esc(issue.title[c.lang])}</span>` : ''}
    <span class="cover-date">${esc(month)}</span>
  </span>
</a>`;
}

export function articleCard(c, a, { showStandfirst = true, headingLevel = 3 } = {}) {
  const { t } = c;
  const h = `h${headingLevel}`;
  return `<article class="card">
  <a class="card-media" href="${c.L(paths.article(a))}" tabindex="-1" aria-hidden="true"><img src="${esc(c.media(a, a.key))}" alt="" loading="lazy"></a>
  <div class="card-body">
    ${a.section ? `<a class="kicker" href="${c.L(paths.section(a.section))}">${esc(c.sectionName(a.section))}</a>` : ''}
    <${h} class="card-title"><a href="${c.L(paths.article(a))}">${esc(a.title)}</a></${h}>
    ${showStandfirst && a.standfirst ? `<p class="card-standfirst">${esc(a.standfirst)}</p>` : ''}
    <p class="meta">${a.author ? `<span>${esc(a.author)}</span>` : ''}<span>${a.minutes} ${esc(t.minRead)}</span><span class="meta-listen">${icons.headphones(15)} ${esc(t.listen)}</span></p>
  </div>
</article>`;
}

function videoTile(c, v, { featured = false } = {}) {
  const { t } = c;
  const poster = c.media(v, `video-${v.id}`);
  const playable = !!v.youtube;
  return `<div class="video ${featured ? 'video-featured' : 'video-thumb'}" ${playable ? `data-youtube="${esc(v.youtube)}"` : ''} data-title="${esc(v.title[c.lang])}" data-duration="${esc(v.duration)}" data-kind="${esc(v.kind[c.lang])}" data-poster="${esc(poster)}">
  <button class="video-frame" type="button" ${playable ? '' : 'disabled'} aria-label="${esc(`${playable ? t.watch : t.comingSoon}: ${v.title[c.lang]}`)}">
    <img src="${esc(poster)}" alt="" loading="lazy">
    <span class="video-play">${icons.play(featured ? 30 : 18)}</span>
    ${v.duration ? `<span class="video-duration">${esc(v.duration)}</span>` : ''}
    ${playable ? '' : `<span class="video-soon">${esc(t.comingSoon)}</span>`}
  </button>
  <div class="video-caption">
    ${v.kind[c.lang] ? `<span class="kicker kicker-light">${esc(v.kind[c.lang])}</span>` : ''}
    <${featured ? 'h3' : 'h4'} class="video-title">${esc(v.title[c.lang])}</${featured ? 'h3' : 'h4'}>
  </div>
</div>`;
}

export function videoPanel(c, videos, { heading = true } = {}) {
  if (!videos.length) return '';
  const [first, ...rest] = videos;
  return `<section class="video-panel" aria-labelledby="video-h">
  <div class="wrap">
    ${heading ? `<div class="section-head section-head-light"><h2 id="video-h">${esc(c.t.video)}</h2><a class="more-link" href="${c.L(paths.video)}">${esc(c.t.videoLibrary)} ${icons.arrow(16)}</a></div>` : ''}
    <div class="video-stage" data-video-stage>
      ${videoTile(c, first, { featured: true })}
      ${rest.length ? `<div class="video-list">${rest.slice(0, 3).map((v) => videoTile(c, v)).join('')}</div>` : ''}
    </div>
  </div>
</section>`;
}

function sectionsGrid(c, counts) {
  return `<div class="sections-grid">${config.sections.map((s) => `<a class="section-tile" href="${c.L(paths.section(s.id))}">
    <span class="section-name">${esc(s[c.lang])}</span>
    <span class="section-blurb">${esc(s.blurb[c.lang])}</span>
    <span class="section-count">${esc(c.t.browseSection)} ${icons.arrow(16)}</span>
  </a>`).join('')}</div>`;
}

function newsletter(c) {
  const { t } = c;
  const on = !!config.newsletterAction;
  return `<form class="newsletter" ${on ? `action="${esc(config.newsletterAction)}" method="post" target="_blank"` : 'onsubmit="return false"'}>
  <h2>${esc(t.newsletterTitle)}</h2>
  <p>${esc(t.newsletterText)}</p>
  <div class="newsletter-row">
    <label class="visually-hidden" for="nl-email-${c.lang}">${esc(t.emailPlaceholder)}</label>
    <input id="nl-email-${c.lang}" type="email" name="email" placeholder="${esc(t.emailPlaceholder)}" ${on ? 'required' : 'disabled'}>
    <button class="btn btn-solid" type="submit" ${on ? '' : 'disabled'}>${esc(on ? t.subscribe : t.comingSoon)}</button>
  </div>
</form>`;
}

function pastStrip(c, issues) {
  if (!issues.length) return '';
  return `<div class="past-strip" role="list">${issues.map((i) => `<div role="listitem">${issueCover(c, i, { size: 'sm' })}</div>`).join('')}</div>`;
}

export function articleRow(c, a) {
  const { t } = c;
  return `<li class="story-row">
  <a class="story-media" href="${c.L(paths.article(a))}" tabindex="-1" aria-hidden="true"><img src="${esc(c.media(a, a.key))}" alt="" loading="lazy"></a>
  <div class="story-body">
    ${a.section ? `<a class="kicker" href="${c.L(paths.section(a.section))}">${esc(c.sectionName(a.section))}</a>` : ''}
    <h3 class="story-title"><a href="${c.L(paths.article(a))}">${esc(a.title)}</a></h3>
    ${a.standfirst ? `<p class="story-standfirst">${esc(a.standfirst)}</p>` : ''}
    <p class="meta">${a.author ? `<span>${esc(a.author)}</span>` : ''}<span>${a.minutes} ${esc(t.minRead)}</span><span class="meta-listen">${icons.headphones(15)} ${esc(t.listen)}</span></p>
  </div>
</li>`;
}

// ---------- Sayfalar ----------
export function homePage(c, { issues, articles, videos, alt }) {
  const { t } = c;
  const latest = issues[0];
  const past = issues.slice(1);
  const byRank = (a, b) => (b.featured - a.featured) || (b.date - a.date);
  const inLatest = latest ? articles.filter((a) => a.issue === latest.number).sort(byRank) : [];
  const shown = inLatest.slice(0, 5);
  const earlier = articles.filter((a) => !latest || a.issue !== latest.number).sort((a, b) => b.date - a.date).slice(0, 6);
  const counts = {};
  articles.forEach((a) => { if (a.section) counts[a.section] = (counts[a.section] || 0) + 1; });

  const body = `
${latest ? `<section class="current-issue" aria-labelledby="current-h">
  <div class="wrap current-grid">
    <div class="current-cover">${issueCover(c, latest, { isNew: true })}</div>
    <div class="current-intro">
      <p class="eyebrow">${esc(t.currentIssue)} · ${esc(t.issue)} ${pad2(latest.number)} · ${esc(c.date(latest.date, { month: 'long', year: 'numeric' }))}</p>
      <h1 id="current-h" class="current-title">${esc(latest.title[c.lang])}</h1>
      ${latest.note && latest.note[c.lang] ? `<div class="issue-note"><h2 class="note-h">${esc(t.editorsNote)}</h2><p>${esc(latest.note[c.lang])}</p></div>` : ''}
      <a class="btn btn-solid" href="${c.L(paths.issue(latest.number))}">${esc(t.openIssue)}</a>
    </div>
  </div>
</section>

<section class="wrap issue-stories" aria-labelledby="stories-h">
  <div class="section-head"><h2 id="stories-h">${esc(t.inThisIssue)}</h2>${inLatest.length > shown.length ? `<a class="more-link" href="${c.L(paths.issue(latest.number))}">${esc(t.allArticlesInIssue)} ${icons.arrow(16)}</a>` : ''}</div>
  ${shown.length ? `<ol class="story-list">${shown.map((a) => articleRow(c, a)).join('')}</ol>` : `<p class="empty">${esc(t.issueComingSoon)}</p>`}
</section>` : ''}

${videoPanel(c, videos)}

${past.length ? `<section class="wrap home-past" aria-labelledby="past-h">
  <div class="section-head"><h2 id="past-h">${esc(t.pastIssues)}</h2><a class="more-link" href="${c.L(paths.issues)}">${esc(t.viewAllIssues)} ${icons.arrow(16)}</a></div>
  ${pastStrip(c, past)}
</section>` : ''}

${earlier.length ? `<section class="wrap home-earlier" aria-labelledby="earlier-h">
  <div class="section-head"><h2 id="earlier-h">${esc(t.earlierArticles)}</h2></div>
  <ol class="story-list">${earlier.map((a) => articleRow(c, a)).join('')}</ol>
</section>` : ''}

<section class="sections-band" aria-labelledby="sections-h">
  <div class="wrap">
    <div class="section-head"><h2 id="sections-h">${esc(t.sections)}</h2></div>
    ${sectionsGrid(c, counts)}
  </div>
</section>



<section class="mission" aria-labelledby="mission-h">
  <div class="wrap mission-inner">
    <h2 id="mission-h" class="eyebrow">${esc(t.missionTitle)}</h2>
    <p class="mission-text">${esc(t.missionText)}</p>
  </div>
</section>

<section class="join-band">
  <div class="wrap join-grid">
    <div class="join-teaser">
      <h2>${esc(t.membershipTitle)}</h2>
      <p>${esc(t.membershipTeaser)}</p>
      <a class="btn btn-solid" href="${c.L(paths.membership)}">${esc(t.seePlans)}</a>
    </div>
    ${newsletter(c)}
  </div>
</section>`;
  return layout(c, { body, alt, active: '', bodyClass: 'page-home', path: '/' });
}

export function issuesPage(c, { issues, alt }) {
  const { t } = c;
  const byYear = {};
  issues.forEach((i) => { const y = i.date.getUTCFullYear(); (byYear[y] ||= []).push(i); });
  const body = `<div class="wrap page-pad">
  <header class="page-head"><h1>${esc(t.allIssues)}</h1></header>
  ${Object.keys(byYear).sort((a, b) => b - a).map((y) => `<section class="year-block"><h2 class="year-h">${y}</h2><div class="covers-grid covers-grid-all">${byYear[y].map((i) => `<div class="cover-cell">${issueCover(c, i)}</div>`).join('')}</div></section>`).join('')}
</div>`;
  return layout(c, { title: t.allIssues, body, alt, active: 'issues', bodyClass: 'page-issues', path: paths.issues });
}

export function issuePage(c, { issue, issues, articles, alt }) {
  const { t } = c;
  const list = articles.filter((a) => a.issue === issue.number).sort((a, b) => (b.featured - a.featured) || (b.date - a.date));
  const others = issues.filter((i) => i.number !== issue.number).slice(0, 8);
  const body = `<section class="issue-head">
  <div class="wrap issue-head-grid">
    <div class="issue-cover-wrap">${issueCover(c, issue)}</div>
    <div class="issue-intro">
      <p class="eyebrow">${esc(t.issue)} ${pad2(issue.number)} · ${esc(c.date(issue.date, { month: 'long', year: 'numeric' }))}</p>
      <h1 class="issue-title">${esc(issue.title[c.lang])}</h1>
      ${issue.note[c.lang] ? `<div class="issue-note"><h2 class="note-h">${esc(t.editorsNote)}</h2><p>${esc(issue.note[c.lang])}</p></div>` : ''}
    </div>
  </div>
</section>
<section class="wrap page-pad" aria-labelledby="toc-h">
  <div class="section-head"><h2 id="toc-h">${esc(t.inThisIssue)}</h2></div>
  ${list.length ? `<div class="cards-grid">${list.map((a) => articleCard(c, a)).join('')}</div>` : `<p class="empty">${esc(t.issueComingSoon)}</p>`}
</section>
${others.length ? `<section class="wrap page-pad-b"><div class="section-head section-head-sm"><h2>${esc(t.pastIssues)}</h2><a class="more-link" href="${c.L(paths.issues)}">${esc(t.viewAllIssues)} ${icons.arrow(16)}</a></div>${pastStrip(c, others)}</section>` : ''}`;
  return layout(c, { title: `${t.issue} ${pad2(issue.number)}: ${issue.title[c.lang]}`, description: issue.note[c.lang], body, alt, active: 'issues', bodyClass: 'page-issue', path: paths.issue(issue.number) });
}

function sourcesList(c, a) {
  if (!a.sources.length) return '';
  return `<section class="sources" aria-labelledby="sources-h">
  <h2 id="sources-h">${esc(c.t.sources)}</h2>
  <ol>${a.sources.map((s, i) => {
    const n = i + 1;
    const title = s.url ? `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title || s.url)}</a>` : esc(s.title);
    const parts = [s.author && esc(s.author), title && `<cite>${title}</cite>`, s.publication && esc(s.publication), s.year && esc(s.year)].filter(Boolean);
    return `<li id="src-${n}">${parts.join(', ')}. <a class="src-back" href="#ref-${n}" aria-label="↩">${icons.back(14)}</a></li>`;
  }).join('')}</ol>
</section>`;
}

// Medya panelini n'inci üst düzey paragraftan sonra yerleştirir (alıntı içindeki paragrafları saymaz).
function insertAfterParagraph(html, n, insert) {
  if (!insert) return html;
  const re = /<blockquote[^>]*>|<\/blockquote>|<\/p>/g;
  let depth = 0, count = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<blockquote')) depth++;
    else if (m[0] === '</blockquote>') depth--;
    else if (depth === 0 && ++count === n) {
      const at = m.index + 4;
      return html.slice(0, at) + insert + html.slice(at);
    }
  }
  return html + insert;
}

export function articlePage(c, { a, issues, articles, alt }) {
  const { t } = c;
  const issue = issues.find((i) => i.number === a.issue);
  const more = articles.filter((x) => x !== a && x.lang === a.lang && a.issue != null && x.issue === a.issue).slice(0, 3);
  const fallbackMore = more.length ? more : articles.filter((x) => x !== a && x.lang === a.lang && x.section === a.section).slice(0, 3);
  const heroSrc = c.media(a, a.key);
  let mediaPanel = '';
  if (a.video) {
    mediaPanel = `<figure class="media-panel">
    <div class="video video-inline" data-youtube="${esc(a.video)}" data-title="${esc(a.videoCaption || a.title)}">
      <button class="video-frame" type="button" aria-label="${esc(`${t.watch}: ${a.videoCaption || a.title}`)}">
        <img src="${esc(heroSrc)}" alt="" loading="lazy"><span class="video-play">${icons.play(28)}</span>
      </button>
    </div>
    ${a.videoCaption || a.mediaCaption ? `<figcaption>${esc(a.videoCaption || a.mediaCaption)}</figcaption>` : ''}
  </figure>`;
  } else if (a.mediaImage || a.mediaArt) {
    const src = a.mediaImage ? (a.mediaImage.startsWith('http') ? a.mediaImage : c.url(a.mediaImage)) : c.artUrl(a.mediaArt, a.mediaPalette || 'dawn', `${a.key}-media`);
    mediaPanel = `<figure class="media-panel"><img src="${esc(src)}" alt="${esc(a.mediaCaption)}" loading="lazy">${a.mediaCaption ? `<figcaption>${esc(a.mediaCaption)}</figcaption>` : ''}</figure>`;
  }
  const shareUrl = c.siteUrl ? `${c.siteUrl}${c.prefix(c.lang)}${paths.article(a)}` : '';

  const body = `<article class="article" data-article>
  <header class="article-head wrap-text">
    <nav class="crumbs" aria-label="breadcrumb">
      ${issue ? `<a href="${c.L(paths.issue(issue.number))}">${esc(t.issue)} ${pad2(issue.number)}</a><span aria-hidden="true">›</span>` : ''}
      ${a.section ? `<a href="${c.L(paths.section(a.section))}">${esc(c.sectionName(a.section))}</a>` : ''}
    </nav>
    <h1 class="article-title" data-speak>${esc(a.title)}</h1>
    ${a.standfirst ? `<p class="article-standfirst" data-speak>${esc(a.standfirst)}</p>` : ''}
    <p class="meta byline">${a.author ? `<span>${esc(t.by)} <strong>${esc(a.author)}</strong></span>` : ''}<span><time datetime="${a.date.toISOString()}">${esc(c.date(a.date))}</time></span><span>${a.minutes} ${esc(t.minRead)}</span></p>
  </header>

  <figure class="article-hero wrap-wide">
    <img src="${esc(heroSrc)}" alt="${esc(a.imageCaption || '')}">
    ${a.imageCaption ? `<figcaption>${esc(a.imageCaption)}</figcaption>` : ''}
  </figure>

  <div class="article-tools wrap-text">
    <div class="tools">
      <div class="size-ctl" role="group" aria-label="${esc(t.textSize)}">
        <button type="button" data-size="-1" aria-label="${esc(t.smaller)}">A<span>−</span></button>
        <button type="button" data-size="1" aria-label="${esc(t.larger)}">A<span>+</span></button>
      </div>
      <div class="share" data-share data-url="${esc(shareUrl)}" data-title="${esc(a.title)}">
        <button class="share-btn" type="button" aria-expanded="false" aria-haspopup="true" data-share-toggle>${icons.share(18)}<span>${esc(t.share)}</span></button>
        <div class="share-menu" role="menu" hidden>
          <button type="button" role="menuitem" data-share-copy data-copied="${esc(t.copied)}">${icons.link(17)}<span>${esc(t.copyLink)}</span></button>
          <a role="menuitem" data-share-net="x" href="#" target="_blank" rel="noopener">${icons.x(15)}<span>X</span></a>
          <a role="menuitem" data-share-net="facebook" href="#" target="_blank" rel="noopener">${icons.facebook(17)}<span>Facebook</span></a>
          <a role="menuitem" data-share-net="whatsapp" href="#" target="_blank" rel="noopener">${icons.whatsapp(17)}<span>WhatsApp</span></a>
          <a role="menuitem" data-share-net="linkedin" href="#" target="_blank" rel="noopener">${icons.linkedin(17)}<span>LinkedIn</span></a>
          <a role="menuitem" data-share-net="email" href="#">${icons.mail(17)}<span>${esc(t.email)}</span></a>
        </div>
      </div>
    </div>
    <div class="player" data-player ${a.audio ? `data-src="${esc(a.audio.startsWith('http') ? a.audio : c.url(a.audio))}"` : ''} data-speech-lang="${esc(t.speechLang)}" data-minutes="${a.minutes}" data-label-play="${esc(t.play)}" data-label-pause="${esc(t.pause)}" data-unavailable="${esc(t.audioUnavailable)}">
      <button class="player-btn" type="button" data-player-toggle aria-label="${esc(t.listenToArticle)}">
        <span class="i-play">${icons.play(18)}</span><span class="i-pause">${icons.pause(18)}</span>
      </button>
      <div class="player-main">
        <div class="player-label">${icons.headphones(15)} <span>${esc(t.listenToArticle)}</span></div>
        <div class="player-bar" data-player-bar role="slider" tabindex="0" aria-label="${esc(t.listenToArticle)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="player-fill" data-player-fill></span></div>
        <div class="player-time"><span data-player-cur>0:00</span><span data-player-dur>${a.minutes}:00</span></div>
      </div>
      <button class="player-speed" type="button" data-player-speed aria-label="${esc(t.speed)}">1×</button>
    </div>
  </div>

  <div class="article-body wrap-text" data-speak-body>
    ${insertAfterParagraph(a.html.replace(/(src|href)="\/(uploads\/)/g, `$1="${c.base}/$2`), 3, mediaPanel)}
  </div>

  <div class="wrap-text">${sourcesList(c, a)}</div>
</article>

${fallbackMore.length ? `<section class="more-issue" aria-labelledby="more-h">
  <div class="wrap">
    <div class="section-head"><h2 id="more-h">${esc(t.moreFromIssue)}</h2>${issue ? `<a class="more-link" href="${c.L(paths.issue(issue.number))}">${esc(t.issue)} ${pad2(issue.number)} ${icons.arrow(16)}</a>` : ''}</div>
    <div class="cards-grid cards-grid-3">${fallbackMore.map((x) => articleCard(c, x, { showStandfirst: false })).join('')}</div>
  </div>
</section>` : ''}`;
  return layout(c, { title: a.title, description: a.standfirst, body, alt, active: '', image: heroSrc, bodyClass: 'page-article', path: paths.article(a) });
}

export function sectionsPage(c, { articles, alt }) {
  const { t } = c;
  const counts = {};
  articles.forEach((a) => { if (a.section) counts[a.section] = (counts[a.section] || 0) + 1; });
  const body = `<div class="wrap page-pad"><header class="page-head"><h1>${esc(t.sections)}</h1></header>${sectionsGrid(c, counts)}</div>`;
  return layout(c, { title: t.sections, body, alt, active: 'sections', bodyClass: 'page-sections', path: paths.sections });
}

export function sectionPage(c, { s, articles, alt }) {
  const { t } = c;
  const list = articles.filter((a) => a.section === s.id);
  const body = `<div class="wrap page-pad">
  <header class="page-head"><p class="eyebrow"><a href="${c.L(paths.sections)}">${esc(t.sections)}</a></p><h1>${esc(s[c.lang])}</h1><p class="page-lead">${esc(s.blurb[c.lang])}</p></header>
  ${list.length ? `<div class="cards-grid">${list.map((a) => articleCard(c, a)).join('')}</div>` : `<p class="empty">${esc(t.noArticlesYet)}</p>`}
</div>`;
  return layout(c, { title: s[c.lang], description: s.blurb[c.lang], body, alt, active: 'sections', bodyClass: 'page-section', path: paths.section(s.id) });
}

export function videoPage(c, { videos, alt }) {
  const { t } = c;
  const body = `<div class="video-page">
  <div class="wrap page-pad-t"><header class="page-head page-head-light"><h1>${esc(t.videoLibrary)}</h1></header></div>
  ${videoPanel(c, videos.slice(0, 4), { heading: false })}
  ${videos.length > 4 ? `<div class="wrap page-pad-b"><div class="video-grid">${videos.slice(4).map((v) => videoTile(c, v)).join('')}</div></div>` : ''}
</div>`;
  return layout(c, { title: t.videoLibrary, body, alt, active: 'video', bodyClass: 'page-video', path: paths.video });
}

export function membershipPage(c, { alt }) {
  const { t } = c;
  const m = config.membership;
  const joinBtn = (cls) => m.joinUrl
    ? `<a class="btn ${cls}" href="${esc(m.joinUrl)}" rel="noopener">${esc(t.join)}</a>`
    : `<button class="btn ${cls}" type="button" disabled>${esc(t.comingSoon)}</button>`;
  const body = `<section class="member-hero">
  <div class="wrap member-hero-inner">
    <p class="eyebrow">${esc(t.nav.membership)}</p>
    <h1>${esc(t.membershipTitle)}</h1>
    <p class="page-lead">${esc(t.membershipLead)}</p>
  </div>
</section>
<section class="wrap plans" aria-label="${esc(t.nav.membership)}">
  ${m.plans.map((p) => `<div class="plan${p.featured ? ' plan-featured' : ''}">
    ${p.featured ? `<span class="plan-badge">${esc(t.mostPopular)}</span>` : ''}
    <h2 class="plan-name">${esc(p.name[c.lang])}</h2>
    <p class="plan-price"><strong>${esc(p.price)}</strong> <span>${esc(p.period[c.lang])}</span></p>
    <ul class="plan-list">${p.features[c.lang].map((f) => `<li>${icons.check(16)} ${esc(f)}</li>`).join('')}</ul>
    ${joinBtn(p.featured ? 'btn-solid' : 'btn-line')}
  </div>`).join('')}
</section>
<section class="benefits">
  <div class="wrap benefits-grid">${t.benefits.map(([ic, h, p]) => `<div class="benefit"><span class="benefit-ic">${icons[ic](24)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
</section>
<section class="wrap faq page-pad-b" aria-labelledby="faq-h">
  <h2 id="faq-h">${esc(t.faqTitle)}</h2>
  ${t.faq.map(([q, aText]) => `<details><summary>${esc(q)}</summary><p>${esc(aText)}</p></details>`).join('')}
</section>`;
  return layout(c, { title: t.nav.membership, description: t.membershipLead, body, alt, active: 'membership', bodyClass: 'page-membership', path: paths.membership });
}

export function aboutPage(c, { alt }) {
  const { t } = c;
  const body = `<div class="wrap-text page-pad prose"><h1>${esc(t.aboutTitle)}</h1>${t.aboutBody}</div>`;
  return layout(c, { title: t.aboutTitle, body, alt, active: 'about', bodyClass: 'page-about', path: paths.about });
}

export function searchPage(c, { alt }) {
  const { t } = c;
  const body = `<div class="wrap-text page-pad">
  <header class="page-head"><h1>${esc(t.search)}</h1></header>
  <form class="search-form" role="search" data-search data-index="${c.L('/search-index.json')}" data-empty="${esc(t.searchNoResults)}">
    <label class="visually-hidden" for="q">${esc(t.search)}</label>
    <input id="q" name="q" type="search" placeholder="${esc(t.searchPlaceholder)}" autocomplete="off">
    <button class="btn btn-solid" type="submit">${icons.search(18)}<span class="visually-hidden">${esc(t.search)}</span></button>
  </form>
  <ol class="search-results" data-results aria-live="polite"></ol>
</div>`;
  return layout(c, { title: t.search, body, alt, active: '', bodyClass: 'page-search', path: paths.search });
}

export function notFoundPage(c) {
  const { t } = c;
  const body = `<div class="wrap-text page-pad center"><h1>${esc(t.notFoundTitle)}</h1><p class="page-lead">${esc(t.notFoundText)}</p><a class="btn btn-solid" href="${c.L('/')}">${esc(t.backHome)}</a></div>`;
  return layout(c, { title: t.notFoundTitle, body, alt: {}, bodyClass: 'page-404', path: '/404.html' });
}
