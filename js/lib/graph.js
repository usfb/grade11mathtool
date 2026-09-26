// Lightweight SVG function plotter.
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, v);
  return e;
};
const COLORS = { s1: 'var(--s1)', s2: 'var(--s2)', s3: 'var(--s3)', s4: 'var(--s4)', s5: 'var(--s5)', s6: 'var(--s6)', muted: 'var(--muted)', text: 'var(--text)', 'text-2': 'var(--text-2)', axis: 'var(--axis)', surface: 'var(--surface)', border: 'var(--border)' };
const col = c => COLORS[c] || c || COLORS.s1;

export class Plot {
  constructor(container, o = {}) {
    Object.assign(this, { xmin: -10, xmax: 10, ymin: -10, ymax: 10, width: 560, height: 380, pad: 22, grid: true, xlabel: 'x', ylabel: 'y', ticks: true, yticks: true, aspect: false }, o);
    this.svg = svgEl('svg', { viewBox: `0 0 ${this.width} ${this.height}`, class: 'plot', role: 'img' });
    this.gGrid = svgEl('g'); this.gData = svgEl('g'); this.gLabels = svgEl('g');
    this.svg.append(this.gGrid, this.gData, this.gLabels);
    container.append(this.svg);
    this.drawAxes();
  }
  setBounds(b) { Object.assign(this, b); this.drawAxes(); }
  sx(x) { return this.pad + (x - this.xmin) / (this.xmax - this.xmin) * (this.width - 2 * this.pad); }
  sy(y) { return this.height - this.pad - (y - this.ymin) / (this.ymax - this.ymin) * (this.height - 2 * this.pad); }
  clear() { this.gData.innerHTML = ''; this.gLabels.innerHTML = ''; }
  niceStep(range) {
    const raw = range / 8, p = 10 ** Math.floor(Math.log10(raw)), r = raw / p;
    return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * p;
  }
  drawAxes() {
    const g = this.gGrid; g.innerHTML = '';
    const xs = this.niceStep(this.xmax - this.xmin), ys = this.niceStep(this.ymax - this.ymin);
    const x0 = Math.min(Math.max(0, this.xmin), this.xmax), y0 = Math.min(Math.max(0, this.ymin), this.ymax);
    if (this.grid) {
      for (let x = Math.ceil(this.xmin / xs) * xs; x <= this.xmax + 1e-9; x += xs)
        g.append(svgEl('line', { x1: this.sx(x), x2: this.sx(x), y1: this.pad, y2: this.height - this.pad, stroke: 'var(--grid)', 'stroke-width': 1 }));
      for (let y = Math.ceil(this.ymin / ys) * ys; y <= this.ymax + 1e-9; y += ys)
        g.append(svgEl('line', { y1: this.sy(y), y2: this.sy(y), x1: this.pad, x2: this.width - this.pad, stroke: 'var(--grid)', 'stroke-width': 1 }));
    }
    g.append(svgEl('line', { x1: this.pad, x2: this.width - this.pad, y1: this.sy(y0), y2: this.sy(y0), stroke: 'var(--axis)', 'stroke-width': 1.2 }));
    g.append(svgEl('line', { y1: this.pad, y2: this.height - this.pad, x1: this.sx(x0), x2: this.sx(x0), stroke: 'var(--axis)', 'stroke-width': 1.2 }));
    if (this.ticks) {
      for (let x = Math.ceil(this.xmin / xs) * xs; x <= this.xmax + 1e-9; x += xs) {
        if (Math.abs(x) < 1e-9) continue;
        const t = svgEl('text', { x: this.sx(x), y: this.sy(y0) + 13, 'font-size': 10, fill: 'var(--muted)', 'text-anchor': 'middle' });
        t.textContent = fmtTick(x); g.append(t);
      }
      for (let y = Math.ceil(this.ymin / ys) * ys; this.yticks && y <= this.ymax + 1e-9; y += ys) {
        if (Math.abs(y) < 1e-9) continue;
        const t = svgEl('text', { x: this.sx(x0) - 5, y: this.sy(y) + 3.5, 'font-size': 10, fill: 'var(--muted)', 'text-anchor': 'end' });
        t.textContent = fmtTick(y); g.append(t);
      }
    }
    const lx = svgEl('text', { x: this.width - this.pad - 2, y: this.sy(y0) - 5, 'font-size': 12, fill: 'var(--text-2)', 'text-anchor': 'end', 'font-style': 'italic' }); lx.textContent = this.xlabel;
    const ly = svgEl('text', { x: this.sx(x0) + 6, y: this.pad + 10, 'font-size': 12, fill: 'var(--text-2)', 'font-style': 'italic' }); ly.textContent = this.ylabel;
    g.append(lx, ly);
  }
  fn(f, o = {}) {
    const { color = 's1', width = 2, dash, domain, samples = 400, opacity = 1 } = o;
    const [a, b] = domain || [this.xmin, this.xmax];
    let d = '', pen = false;
    const yr = this.ymax - this.ymin;
    for (let i = 0; i <= samples; i++) {
      const x = a + (b - a) * i / samples;
      let y = f(x);
      if (!Number.isFinite(y)) { pen = false; continue; }
      const yc = Math.max(this.ymin - yr, Math.min(this.ymax + yr, y));
      d += (pen ? 'L' : 'M') + this.sx(x).toFixed(1) + ' ' + this.sy(yc).toFixed(1);
      pen = true;
    }
    const p = svgEl('path', { d, fill: 'none', stroke: col(color), 'stroke-width': width, 'stroke-dasharray': dash, opacity, 'stroke-linejoin': 'round' });
    this.gData.append(p); return p;
  }
  polyline(pts, o = {}) {
    const { color = 's1', width = 2, dash, fill = 'none', opacity = 1, close = false } = o;
    const d = pts.map((p, i) => (i ? 'L' : 'M') + this.sx(p[0]) + ' ' + this.sy(p[1])).join('') + (close ? 'Z' : '');
    const p = svgEl('path', { d, fill, stroke: col(color), 'stroke-width': width, 'stroke-dasharray': dash, opacity });
    this.gData.append(p); return p;
  }
  polygon(pts, o = {}) { return this.polyline(pts, { close: true, width: 0, ...o, fill: col(o.fill || o.color), stroke: 'none' }); }
  segment(x1, y1, x2, y2, o = {}) { return this.polyline([[x1, y1], [x2, y2]], o); }
  vline(x, o = {}) { return this.segment(x, this.ymin, x, this.ymax, { dash: '4 4', width: 1.5, ...o }); }
  hline(y, o = {}) { return this.segment(this.xmin, y, this.xmax, y, { dash: '4 4', width: 1.5, ...o }); }
  band(x1, x2, o = {}) {
    const r = svgEl('rect', { x: this.sx(Math.min(x1, x2)), width: Math.abs(this.sx(x2) - this.sx(x1)), y: this.pad, height: this.height - 2 * this.pad, fill: col(o.color || 's2'), opacity: o.opacity ?? 0.12 });
    this.gData.append(r); return r;
  }
  hband(y1, y2, o = {}) {
    const r = svgEl('rect', { y: this.sy(Math.max(y1, y2)), height: Math.abs(this.sy(y2) - this.sy(y1)), x: this.pad, width: this.width - 2 * this.pad, fill: col(o.color || 's2'), opacity: o.opacity ?? 0.12 });
    this.gData.append(r); return r;
  }
  point(x, y, o = {}) {
    const { color = 's1', r = 5, label, pos = 'ne', fill, ring = true } = o;
    const g = svgEl('g');
    if (ring) g.append(svgEl('circle', { cx: this.sx(x), cy: this.sy(y), r: r + 2, fill: 'var(--surface)' }));
    g.append(svgEl('circle', { cx: this.sx(x), cy: this.sy(y), r, fill: fill === 'none' ? 'var(--surface)' : col(color), stroke: col(color), 'stroke-width': 2 }));
    this.gData.append(g);
    if (label) this.label(x, y, label, { pos, color });
    return g;
  }
  label(x, y, str, o = {}) {
    const { pos = 'ne', color = 'text', size = 12, bg = true } = o;
    const dx = pos.includes('e') ? 8 : pos.includes('w') ? -8 : 0;
    const dy = pos.includes('n') ? -8 : pos.includes('s') ? 14 : 4;
    const anchor = pos.includes('e') ? 'start' : pos.includes('w') ? 'end' : 'middle';
    const t = svgEl('text', { x: this.sx(x) + dx, y: this.sy(y) + dy, 'font-size': size, fill: col(color), 'text-anchor': anchor, 'font-weight': 600, 'paint-order': 'stroke', stroke: bg ? 'var(--surface)' : 'none', 'stroke-width': 3, 'stroke-linejoin': 'round' });
    t.textContent = str; this.gLabels.append(t); return t;
  }
  text(px, py, str, o = {}) {
    const t = svgEl('text', { x: px, y: py, 'font-size': o.size || 12, fill: col(o.color || 'text'), 'text-anchor': o.anchor || 'start', 'font-weight': o.weight || 400 });
    t.textContent = str; this.gLabels.append(t); return t;
  }
}

function fmtTick(x) { const s = (+x.toFixed(6)).toString(); return s.replace('-', '−'); }

// Raw SVG canvas (pixel coordinates) for geometric pictures.
export class Canvas {
  constructor(container, w = 480, h = 300) {
    this.w = w; this.h = h;
    this.svg = svgEl('svg', { viewBox: `0 0 ${w} ${h}`, class: 'plot' });
    container.append(this.svg);
  }
  clear() { this.svg.innerHTML = ''; }
  rect(x, y, w, h, o = {}) { const r = svgEl('rect', { x, y, width: w, height: h, fill: col(o.fill || 'none'), stroke: o.stroke ? col(o.stroke) : 'none', 'stroke-width': o.width ?? 1.5, opacity: o.opacity ?? 1, rx: o.rx ?? 0 }); if (o.fill === 'none' || !o.fill) r.setAttribute('fill', 'none'); this.svg.append(r); return r; }
  line(x1, y1, x2, y2, o = {}) { const l = svgEl('line', { x1, y1, x2, y2, stroke: col(o.color || 'text'), 'stroke-width': o.width ?? 2, 'stroke-dasharray': o.dash, opacity: o.opacity ?? 1, 'stroke-linecap': 'round' }); this.svg.append(l); return l; }
  poly(pts, o = {}) { const p = svgEl('polygon', { points: pts.map(p => p.join(',')).join(' '), fill: o.fill ? col(o.fill) : 'none', stroke: o.stroke ? col(o.stroke) : 'none', 'stroke-width': o.width ?? 1.5, opacity: o.opacity ?? 1 }); this.svg.append(p); return p; }
  circle(cx, cy, r, o = {}) { const c = svgEl('circle', { cx, cy, r, fill: o.fill ? col(o.fill) : 'none', stroke: o.stroke ? col(o.stroke) : 'none', 'stroke-width': o.width ?? 2 }); this.svg.append(c); return c; }
  text(x, y, str, o = {}) { const t = svgEl('text', { x, y, 'font-size': o.size || 13, fill: col(o.color || 'text'), 'text-anchor': o.anchor || 'middle', 'font-weight': o.weight || 500, 'dominant-baseline': o.baseline || 'middle', 'paint-order': 'stroke', stroke: o.bg ? 'var(--surface)' : 'none', 'stroke-width': 3 }); t.textContent = str; this.svg.append(t); return t; }
  brace(x1, y1, x2, y2, label, o = {}) { // simple dimension line with ticks
    this.line(x1, y1, x2, y2, { color: o.color || 'muted', width: 1 });
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 4, ny = dx / L * 4;
    this.line(x1 + nx, y1 + ny, x1 - nx, y1 - ny, { color: o.color || 'muted', width: 1 });
    this.line(x2 + nx, y2 + ny, x2 - nx, y2 - ny, { color: o.color || 'muted', width: 1 });
    const off = o.offset ?? 12;
    this.text((x1 + x2) / 2 + (nx / 4) * off, (y1 + y2) / 2 + (ny / 4) * off, label, { color: o.color || 'text-2', size: o.size || 12, bg: true });
  }
}
