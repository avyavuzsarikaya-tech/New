import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import config from '../site.config.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function readFolder(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), 'utf8');
      try {
        const { data, content } = matter(raw);
        return { file: f, data, body: content };
      } catch (e) {
        console.warn(`UYARI: ${dir}/${f} okunamadı, atlandı (${e.reason || e.message})`);
        return null;
      }
    })
    .filter(Boolean);
}

const TR_MAP = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u', â: 'a', î: 'i', û: 'u' };
export function slugify(text) {
  return String(text || '')
    .replace(/[çğıİöşüÇĞÖŞÜâîû]/g, (c) => TR_MAP[c] || c)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'yazi';
}

const toDate = (v) => (v ? new Date(v) : new Date(0));
const pad2 = (n) => String(n).padStart(2, '0');

function youtubeId(v) {
  if (!v) return '';
  const s = String(v).trim();
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{6,}$/.test(s) ? s : '';
}

// Metindeki [^1] işaretlerini kaynakçaya giden üst simgelere çevirir.
function footnotes(md) {
  const counts = {};
  return md.replace(/\[\^(\d+)\]/g, (_, n) => {
    counts[n] = (counts[n] || 0) + 1;
    const id = `ref-${n}${counts[n] > 1 ? '-' + counts[n] : ''}`;
    return `<sup class="fn"><a href="#src-${n}" id="${id}" aria-label="Source ${n}">${n}</a></sup>`;
  });
}

function wordCount(md) {
  return md.replace(/<[^>]+>/g, ' ').replace(/[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length;
}

export function loadContent() {
  const langs = config.languages;
  const sectionIds = new Set(config.sections.map((s) => s.id));

  const issues = readFolder('content/issues')
    .map(({ data, body }) => {
      const number = Number(data.number);
      const title = {}, note = {};
      for (const l of langs) {
        title[l] = data[`title_${l}`] || data.title_en || `${number}`;
        note[l] = data[`note_${l}`] || '';
      }
      return {
        number, id: pad2(number), date: toDate(data.date), title, note,
        cover: data.cover || '', art: data.art || '', palette: data.palette || '',
        draft: !!data.draft, extra: body.trim(),
      };
    })
    .filter((i) => Number.isFinite(i.number) && !i.draft)
    .sort((a, b) => b.number - a.number);

  const articles = readFolder('content/articles')
    .map(({ file, data, body }) => {
      const lang = langs.includes(data.lang) ? data.lang : langs[0];
      const slug = slugify(data.slug || data.title || file.replace(/\.md$/, ''));
      const md = footnotes(body.trim());
      const sources = Array.isArray(data.sources) ? data.sources.filter((s) => s && (s.title || s.url)) : [];
      return {
        lang, slug, key: String(data.key || slug),
        title: data.title || 'Untitled', standfirst: data.standfirst || '',
        author: data.author || '', date: toDate(data.date),
        issue: data.issue != null ? Number(data.issue) : null,
        section: sectionIds.has(data.section) ? data.section : null,
        featured: !!data.featured, draft: !!data.draft,
        image: data.image || '', imageCaption: data.image_caption || '',
        art: data.art || '', palette: data.palette || '',
        video: youtubeId(data.video), videoCaption: data.video_caption || '',
        mediaImage: data.media_image || '', mediaArt: data.media_art || '', mediaPalette: data.media_palette || '', mediaCaption: data.media_caption || '',
        audio: data.audio || '',
        sources,
        html: marked.parse(md, { mangle: false, headerIds: false }),
        minutes: Math.max(1, Math.round(wordCount(body) / 220)),
      };
    })
    .filter((a) => !a.draft)
    .sort((a, b) => b.date - a.date);

  const videos = readFolder('content/videos')
    .map(({ file, data }) => {
      const title = {}, kind = {};
      for (const l of langs) { title[l] = data[`title_${l}`] || data.title_en || ''; kind[l] = data[`kind_${l}`] || data.kind_en || ''; }
      return {
        id: file.replace(/\.md$/, ''), title, kind, duration: data.duration || '',
        youtube: youtubeId(data.youtube), image: data.image || '', art: data.art || '', palette: data.palette || '',
        featured: !!data.featured, date: toDate(data.date), order: Number(data.order ?? 999), draft: !!data.draft,
      };
    })
    .filter((v) => !v.draft)
    .sort((a, b) => (b.featured - a.featured) || (a.order - b.order) || (b.date - a.date));

  // Aynı dilde aynı adresi alan iki yazı olursa ikincisine ek getir.
  const seen = new Set();
  for (const a of articles) {
    let s = a.slug, i = 2;
    while (seen.has(`${a.lang}/${s}`)) s = `${a.slug}-${i++}`;
    a.slug = s; seen.add(`${a.lang}/${s}`);
  }

  return { issues, articles, videos };
}
