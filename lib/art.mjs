// İnsansız, yer tutucu görseller üretir (manzara, mimari, kitaplık, soyut desen).
// Bir yazıya ya da sayıya gerçek fotoğraf yüklendiğinde bu görsellerin yerini fotoğraf alır.

const PALETTES = {
  dawn:       { sky: ['#f3d9c4', '#f7ede3'], sun: '#e8a46b', layers: ['#c9a891', '#a8857a', '#7d6264', '#4f4250'] },
  dusk:       { sky: ['#2b3555', '#c98a6b'], sun: '#f2c48d', layers: ['#7b6475', '#55495f', '#3a3449', '#232235'] },
  ink:        { sky: ['#1d2a3f', '#3b4c66'], sun: '#e9d8b4', layers: ['#4b5d78', '#36475f', '#26344a', '#172233'] },
  sage:       { sky: ['#dfe6dc', '#f2f1ea'], sun: '#d8b77a', layers: ['#a9b8a2', '#84977f', '#5f735f', '#3e5042'] },
  sand:       { sky: ['#f1e2c8', '#f8f1e4'], sun: '#d9893f', layers: ['#e2c08f', '#cfa06a', '#b07e4e', '#7f5636'] },
  ocean:      { sky: ['#cfdde4', '#eef2f1'], sun: '#f0c27b', layers: ['#7fa1b3', '#5b8196', '#3d6075', '#244456'] },
  terracotta: { sky: ['#f0d5c2', '#f8ece2'], sun: '#b5532f', layers: ['#d9a084', '#c07a5c', '#99573f', '#6b3b2c'] },
  night:      { sky: ['#0f1626', '#26324a'], sun: '#f1e6c8', layers: ['#2f3c56', '#243048', '#1a2438', '#111a2a'] },
};

export const ART_KINDS = ['mountains', 'sea', 'city', 'arches', 'forest', 'desert', 'library', 'abstract'];
export const PALETTE_NAMES = Object.keys(PALETTES);

function rng(seedText) {
  let h = 2166136261;
  for (const c of String(seedText)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200, H = 800;
const f = (n) => Math.round(n * 10) / 10;

function sky(p, id) {
  return `<defs><linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#s${id})"/>`;
}

function ridge(r, baseY, amp, steps) {
  let d = `M0 ${H} L0 ${f(baseY)}`;
  for (let i = 1; i <= steps; i++) {
    const x = (W / steps) * i;
    const y = baseY - r() * amp + amp * 0.3;
    d += ` L${f(x - W / steps / 2)} ${f(y - amp * 0.4 * r())} L${f(x)} ${f(y)}`;
  }
  return d + ` L${W} ${H} Z`;
}

const kinds = {
  mountains(r, p, id) {
    let s = sky(p, id) + `<circle cx="${f(250 + r() * 700)}" cy="${f(190 + r() * 90)}" r="${f(60 + r() * 40)}" fill="${p.sun}" opacity=".9"/>`;
    p.layers.forEach((c, i) => { s += `<path d="${ridge(r, 380 + i * 110, 210 - i * 30, 5 + i * 2)}" fill="${c}"/>`; });
    return s;
  },
  sea(r, p, id) {
    const hz = 430 + r() * 60;
    let s = sky(p, id) + `<circle cx="${f(300 + r() * 600)}" cy="${f(hz - 40)}" r="${f(80 + r() * 30)}" fill="${p.sun}"/>`;
    s += `<rect y="${f(hz)}" width="${W}" height="${f(H - hz)}" fill="${p.layers[1]}"/>`;
    for (let i = 0; i < 26; i++) {
      const y = hz + 10 + i * i * 0.55 + i * 4;
      if (y > H) break;
      const x = r() * W * 0.8;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(80 + r() * 260)}" height="${f(2 + i * 0.25)}" rx="2" fill="${i % 3 ? p.layers[2] : p.sky[1]}" opacity="${f(0.35 + r() * 0.4)}"/>`;
    }
    s += `<path d="M0 ${f(hz)} L${W} ${f(hz)}" stroke="${p.layers[3]}" stroke-width="2" opacity=".35"/>`;
    return s;
  },
  city(r, p, id) {
    let s = sky(p, id) + `<circle cx="${f(200 + r() * 800)}" cy="${f(200 + r() * 80)}" r="${f(55 + r() * 30)}" fill="${p.sun}" opacity=".85"/>`;
    [0, 1, 2].forEach((layer) => {
      let x = -20;
      const color = p.layers[layer + 1];
      while (x < W) {
        const w = 40 + r() * 90;
        const h = (layer === 2 ? 140 : 220) + r() * (layer === 0 ? 330 : 260) - layer * 40;
        const y = H - h - layer * -20;
        s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h + 40)}" fill="${color}"/>`;
        if (layer === 2) {
          for (let wy = y + 18; wy < H - 20; wy += 26) {
            for (let wx = x + 10; wx < x + w - 12; wx += 18) {
              if (r() > 0.55) s += `<rect x="${f(wx)}" y="${f(wy)}" width="7" height="11" fill="${p.sun}" opacity=".55"/>`;
            }
          }
        }
        x += w + (layer === 0 ? 10 : 2) + r() * 12;
      }
    });
    return s;
  },
  arches(r, p, id) {
    let s = `<rect width="${W}" height="${H}" fill="${p.sky[1]}"/>`;
    const n = 4 + Math.floor(r() * 2);
    const bay = W / n;
    s += `<rect y="${H * 0.82}" width="${W}" height="${H * 0.18}" fill="${p.layers[0]}"/>`;
    for (let i = 0; i < n; i++) {
      const x0 = i * bay, pad = bay * 0.16, w = bay - pad * 2, top = 210, spring = 380, bottom = H * 0.82;
      const xl = x0 + pad, xr = xl + w, xm = xl + w / 2;
      s += `<rect x="${f(x0)}" y="0" width="${f(pad)}" height="${f(bottom)}" fill="${p.layers[2]}"/><rect x="${f(x0 + bay - pad)}" y="0" width="${f(pad)}" height="${f(bottom)}" fill="${p.layers[2]}"/>`;
      s += `<path d="M${f(x0)} 0 H${f(x0 + bay)} V${f(bottom)} H${f(xr)} V${spring} C${f(xr)} ${f(spring - 120)} ${f(xm + w * 0.12)} ${f(top + 30)} ${f(xm)} ${top} C${f(xm - w * 0.12)} ${f(top + 30)} ${f(xl)} ${f(spring - 120)} ${f(xl)} ${spring} V${f(bottom)} H${f(x0)} Z" fill="${p.layers[1]}"/>`;
      s += `<path d="M${f(xl)} ${f(bottom)} L${f(xl + w * 0.15)} ${H} L${f(xr + w * 0.4)} ${H} L${f(xr)} ${f(bottom)} Z" fill="${p.sun}" opacity=".18"/>`;
    }
    s += `<rect width="${W}" height="70" fill="${p.layers[3]}"/>`;
    return s;
  },
  forest(r, p, id) {
    let s = sky(p, id) + `<circle cx="${f(200 + r() * 800)}" cy="${f(170 + r() * 60)}" r="${f(50 + r() * 30)}" fill="${p.sun}" opacity=".8"/>`;
    p.layers.forEach((c, li) => {
      const base = 420 + li * 110, size = 70 + li * 35;
      let x = -size + r() * 30;
      while (x < W + size) {
        const h = size * (1.6 + r() * 0.9);
        s += `<path d="M${f(x)} ${f(base + 60)} L${f(x + size / 2)} ${f(base - h + 60)} L${f(x + size)} ${f(base + 60)} Z" fill="${c}"/>`;
        x += size * (0.55 + r() * 0.35);
      }
      s += `<rect y="${f(base + 58)}" width="${W}" height="${f(H)}" fill="${c}"/>`;
    });
    return s;
  },
  desert(r, p, id) {
    let s = sky(p, id) + `<circle cx="${f(300 + r() * 600)}" cy="${f(220 + r() * 60)}" r="${f(70 + r() * 30)}" fill="${p.sun}" opacity=".9"/>`;
    p.layers.forEach((c, i) => {
      const y = 450 + i * 95, a = 60 + r() * 60;
      s += `<path d="M0 ${f(y + a * r())} C${f(W * 0.25)} ${f(y - a)} ${f(W * 0.45)} ${f(y + a)} ${f(W * 0.7)} ${f(y - a * 0.5)} S${f(W * 0.95)} ${f(y + a * 0.3)} ${W} ${f(y)} V${H} H0 Z" fill="${c}"/>`;
    });
    return s;
  },
  library(r, p, id) {
    let s = `<rect width="${W}" height="${H}" fill="${p.layers[3]}"/>`;
    const shelves = 4, sh = H / shelves;
    const colors = [...p.layers.slice(0, 3), p.sun, p.sky[0], p.sky[1]];
    for (let k = 0; k < shelves; k++) {
      const by = (k + 1) * sh - 16;
      let x = 30 + r() * 20;
      while (x < W - 40) {
        const w = 18 + r() * 30, h = sh * (0.55 + r() * 0.35);
        if (r() > 0.93) { x += 30; continue; }
        const lean = r() > 0.95;
        s += `<rect x="${f(x)}" y="${f(by - h)}" width="${f(w)}" height="${f(h)}" fill="${colors[Math.floor(r() * colors.length)]}" ${lean ? `transform="rotate(8 ${f(x + w)} ${f(by)})"` : ''}/>`;
        if (r() > 0.5) s += `<rect x="${f(x + 3)}" y="${f(by - h + 14)}" width="${f(w - 6)}" height="3" fill="${p.layers[3]}" opacity=".35"/>`;
        x += w + 2;
      }
      s += `<rect y="${f(by)}" width="${W}" height="16" fill="${p.layers[2]}"/>`;
    }
    return s;
  },
  abstract(r, p, id) {
    let s = `<rect width="${W}" height="${H}" fill="${p.sky[1]}"/>`;
    const cols = [p.sun, ...p.layers];
    for (let i = 0; i < 7; i++) {
      s += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(60 + r() * 260)}" fill="${cols[i % cols.length]}" opacity="${f(0.55 + r() * 0.4)}"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const y = 60 + r() * (H - 120);
      s += `<rect x="${f(r() * W * 0.5)}" y="${f(y)}" width="${f(200 + r() * 700)}" height="3" fill="${p.layers[3]}" opacity=".5"/>`;
    }
    return s;
  },
};

export function artSvg(kind = 'mountains', palette = 'dawn', seed = 'x') {
  const k = kinds[kind] ? kind : 'mountains';
  const p = PALETTES[palette] || PALETTES.dawn;
  const r = rng(`${k}-${palette}-${seed}`);
  const id = Math.floor(r() * 1e6);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${kinds[k](r, p, id)}</svg>`;
}

// Bir anahtardan kararlı bir görsel türü ve renk seçer (görsel belirtilmemişse).
export function pickArt(key) {
  const r = rng(key);
  return { kind: ART_KINDS[Math.floor(r() * ART_KINDS.length)], palette: PALETTE_NAMES[Math.floor(r() * PALETTE_NAMES.length)] };
}
