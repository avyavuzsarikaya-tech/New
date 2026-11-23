// Siteyi derler: content/ klasöründeki sayılar ve yazılardan dist/ klasörüne hazır HTML üretir.
import fs from 'node:fs';
import path from 'node:path';
import config from './site.config.mjs';
import { loadContent } from './lib/content.mjs';
import { artSvg } from './lib/art.mjs';
import { strings } from './lib/i18n.mjs';
import * as R from './lib/render.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const REPO = process.env.GITHUB_REPOSITORY || 'KULLANICI/DEPO';

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const write = (rel, content) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const page = (rel, html) => write(rel.endsWith('.html') ? rel : path.join(rel, 'index.html'), html);
const copyDir = (src, dst) => { if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true }); };

const { issues, articles, videos } = loadContent();
const artRegistry = new Map();
const langs = config.languages;
const prefix = (l) => (l === langs[0] ? '' : `/${l}`);
const allLangsAlt = (p) => Object.fromEntries(langs.map((l) => [l, `${BASE}${prefix(l)}${p}`]));
const xml = (s) => R.esc(s);

for (const lang of langs) {
  const c = R.makeCtx({ lang, base: BASE, siteUrl: SITE_URL, artRegistry });
  const P = prefix(lang);
  const own = articles.filter((a) => a.lang === lang);

  page(`${P}/`, R.homePage(c, { issues, articles: own, videos, alt: allLangsAlt('/') }));
  page(`${P}${R.paths.issues}`, R.issuesPage(c, { issues, alt: allLangsAlt(R.paths.issues) }));
  for (const issue of issues) {
    page(`${P}${R.paths.issue(issue.number)}`, R.issuePage(c, { issue, issues, articles: own, alt: allLangsAlt(R.paths.issue(issue.number)) }));
  }
  for (const a of own) {
    const alt = {};
    for (const l of langs) {
      const tr = l === lang ? a : articles.find((x) => x.lang === l && x.key === a.key);
      alt[l] = tr ? `${BASE}${prefix(l)}${R.paths.article(tr)}` : `${BASE}${prefix(l)}/`;
    }
    page(`${P}${R.paths.article(a)}`, R.articlePage(c, { a, issues, articles: own, alt }));
  }
  page(`${P}${R.paths.sections}`, R.sectionsPage(c, { articles: own, alt: allLangsAlt(R.paths.sections) }));
  for (const s of config.sections) {
    page(`${P}${R.paths.section(s.id)}`, R.sectionPage(c, { s, articles: own, alt: allLangsAlt(R.paths.section(s.id)) }));
  }
  page(`${P}${R.paths.video}`, R.videoPage(c, { videos, alt: allLangsAlt(R.paths.video) }));
  page(`${P}${R.paths.membership}`, R.membershipPage(c, { alt: allLangsAlt(R.paths.membership) }));
  page(`${P}${R.paths.about}`, R.aboutPage(c, { alt: allLangsAlt(R.paths.about) }));
  page(`${P}${R.paths.search}`, R.searchPage(c, { alt: allLangsAlt(R.paths.search) }));
  if (lang === langs[0]) page('404.html', R.notFoundPage(c));

  // Arama dizini
  write(`${P}/search-index.json`.replace(/^\//, ''), JSON.stringify(own.map((a) => ({
    t: a.title, s: a.standfirst, a: a.author, sec: c.sectionName(a.section), i: a.issue,
    u: `${BASE}${P}${R.paths.article(a)}`, x: a.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1500),
  }))));

  // RSS
  const abs = (p) => (SITE_URL ? `${SITE_URL}${P}${p}` : `${P}${p}`);
  write(`${P}/feed.xml`.replace(/^\//, ''), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${xml(config.name)}</title><link>${xml(abs('/'))}</link><description>${xml(strings[lang].tagline)}</description><language>${lang}</language>
${own.slice(0, 30).map((a) => `<item><title>${xml(a.title)}</title><link>${xml(abs(R.paths.article(a)))}</link><guid>${xml(abs(R.paths.article(a)))}</guid><pubDate>${a.date.toUTCString()}</pubDate><description>${xml(a.standfirst)}</description></item>`).join('\n')}
</channel></rss>`);
}

// Yer tutucu görseller
for (const [name, { kind, palette, seed }] of artRegistry) write(`art/${name}.svg`, artSvg(kind, palette, seed));

// Sabit dosyalar
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
copyDir(path.join(ROOT, 'public'), DIST);
write('.nojekyll', '');

// Site haritası
if (SITE_URL) {
  const origin = SITE_URL.replace(/^(https?:\/\/[^/]+).*$/, '$1');
  const urls = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) { if (!['assets', 'art', 'admin', 'uploads'].includes(d.name)) walk(p); }
    else if (d.name === 'index.html') urls.push(origin + BASE + '/' + path.relative(DIST, dir).replace(/\\/g, '/') + (path.relative(DIST, dir) ? '/' : ''));
  });
  walk(DIST);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${xml(u.replace(/([^:])\/\/+/g, '$1/'))}</loc></url>`).join('\n')}\n</urlset>`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

// Yönetim paneli ayarı (depo adı GitHub'dan otomatik gelir)
const adminTemplate = path.join(ROOT, 'admin-config.yml');
if (fs.existsSync(adminTemplate)) {
  write('admin/config.yml', fs.readFileSync(adminTemplate, 'utf8').replace(/__REPO__/g, REPO).replace(/__SITE_URL__/g, SITE_URL || '/'));
}

const count = (dir) => { let n = 0; const w = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => e.isDirectory() ? w(path.join(d, e.name)) : e.name.endsWith('.html') && n++); w(dir); return n; };
console.log(`Derlendi: ${issues.length} sayı, ${articles.length} yazı, ${videos.length} video, ${count(DIST)} sayfa, ${artRegistry.size} görsel → dist/`);
