import { h, tex, dtex, slider, numberInput, chips, card, controls, readout, legend, quiz } from '../lib/ui.js';
import { Plot, Canvas } from '../lib/graph.js';
import { gcd, simplifyRadical, radicalTex, fmt, fmtT, quadraticRoots, polyTex, linTex, exactRootsTex, primeFactors } from '../lib/math.js';

const RADS = [1, 2, 3, 5, 6, 7, 8, 10, 12, 18, 20, 27, 32, 45, 48, 50, 72, 75];
const sg = v => (v < 0 ? '- ' : '+ ') + Math.abs(v);
const coefTex = (c, sym) => c === 1 ? sym : c === -1 ? '-' + sym : `${c}${sym}`;

/* ---------- 2.1 ---------- */
function s21(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Variables simplify exactly like numbers: ${tex('\\sqrt{x^5} = \\sqrt{x^2\\cdot x^2\\cdot x} = x^2\\sqrt{x}')}. Under a square root, factors come out in <b>pairs</b>; under a cube root, in <b>triples</b>. For an exponent, that's just division with remainder: ${tex('x^{7}')} under ${tex('\\sqrt{\\ }')} → ${tex('7 = 2\\cdot 3 + 1')} → ${tex('x^3')} outside, ${tex('x^1')} inside.` })));
  const c = numberInput({ label: 'coefficient', value: 48, min: 1, max: 2000, onInput: update });
  const ex = slider({ label: 'exponent of x', min: 0, max: 11, value: 5, onInput: update });
  const ey = slider({ label: 'exponent of y', min: 0, max: 11, value: 2, onInput: update });
  const idx = chips({ options: [{ value: 2, label: '√' }, { value: 3, label: '∛' }], value: 2, onChange: update });
  const tiles = h('div'); const out = readout();
  el.append(card('', controls(c, ex, ey, idx), tiles, out));
  function update() {
    const k = +idx.value, C = Math.round(c.value), a = ex.value, b = ey.value;
    const s = simplifyRadical(C, k);
    tiles.innerHTML = '';
    const rowOf = (items) => h('div', { class: 'tiles', style: { marginBottom: '6px' } }, items);
    const numTiles = [];
    for (const g of s.groups) for (let i = 0; i < g.e; i++) { numTiles.push(h('div', { class: 'tile ' + (i < g.out * k ? 'pair' : 'alone') }, g.p)); if (i < g.out * k && (i + 1) % k === 0) numTiles.push(h('div', { class: 'tile-sep' })); }
    const varTiles = (sym, e) => { const t = []; const out = Math.floor(e / k); for (let i = 0; i < e; i++) { t.push(h('div', { class: 'tile ' + (i < out * k ? 'pair' : 'alone') }, sym)); if (i < out * k && (i + 1) % k === 0) t.push(h('div', { class: 'tile-sep' })); } return t; };
    tiles.append(rowOf([h('span', { class: 'small', style: { width: '90px' } }, `${C} =`), ...numTiles]));
    if (a) tiles.append(rowOf([h('span', { class: 'small', style: { width: '90px' } }, `x^${a} =`), ...varTiles('x', a)]));
    if (b) tiles.append(rowOf([h('span', { class: 'small', style: { width: '90px' } }, `y^${b} =`), ...varTiles('y', b)]));
    const rs = k === 2 ? '\\sqrt' : '\\sqrt[3]';
    const inside = `${C === 1 ? '' : C}${a ? `x^{${a}}` : ''}${b ? `y^{${b}}` : ''}` || '1';
    const oa = Math.floor(a / k), ra = a % k, ob = Math.floor(b / k), rb = b % k;
    const outside = `${s.coef === 1 ? '' : s.coef}${oa ? (oa === 1 ? 'x' : `x^{${oa}}`) : ''}${ob ? (ob === 1 ? 'y' : `y^{${ob}}`) : ''}`;
    const remain = `${s.rad === 1 ? '' : s.rad}${ra ? (ra === 1 ? 'x' : `x^{${ra}}`) : ''}${rb ? (rb === 1 ? 'y' : `y^{${rb}}`) : ''}`;
    const result = (outside || '1') + (remain ? `${rs}{${remain}}` : '');
    out.innerHTML = `<div class="big">${tex(`${rs}{${inside}} = ${result}`)}</div><p class="small">Green tiles form complete groups of ${k} and come out (one factor per group). Orange tiles have no partner and stay inside. ${k === 2 && (a % 2 === 0 || b % 2 === 0) && (a || b) ? 'When an even power comes out of a square root the textbook assumes the variable is non-negative, so no absolute-value bars are needed.' : ''}</p>`;
  }
  update();
}

/* ---------- 2.2 ---------- */
function drawBars(cv, terms, opts = {}) {
  // terms: [{coef, rad}] ; draws each as |coef| bars of length √rad, one row per term, plus combined row if like
  cv.clear();
  const unit = opts.unit || 28, x0 = 20;
  let y = 24;
  const color = r => ({ 2: 's1', 3: 's2', 5: 's3', 6: 's4', 7: 's5', 1: 'muted' })[r] || 's6';
  const row = (coef, rad, label, yy) => {
    const L = Math.sqrt(rad) * unit;
    for (let i = 0; i < Math.abs(coef); i++) cv.rect(x0 + i * L + 1, yy, Math.max(L - 2, 2), 22, { fill: color(rad), opacity: coef < 0 ? 0.35 : 0.85, rx: 3 });
    if (coef < 0) cv.text(x0 + Math.abs(coef) * L + 10, yy + 11, '(subtract)', { anchor: 'start', size: 11, color: 'muted' });
    cv.text(x0, yy - 8, label, { anchor: 'start', size: 12, color: 'text-2' });
  };
  for (const t of terms) { row(t.coef, t.rad, t.label, y); y += 52; }
  return y;
}
function s22(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `${tex('3\\sqrt2 + 5\\sqrt2 = 8\\sqrt2')} for the same reason ${tex('3x + 5x = 8x')}: you are counting copies of one thing. ${tex('\\sqrt2')} is a <b>length</b>; eight of those lengths end to end. ${tex('3\\sqrt2 + 2\\sqrt3')} cannot be combined because the pieces have different lengths — but ${tex('\\sqrt8 + \\sqrt{18}')} <i>can</i>, once you simplify each and discover they are both ${tex('\\sqrt2')} in disguise.` })));
  const a = slider({ label: 'coefficient a', min: -6, max: 6, value: 1, onInput: update });
  const n = chips({ options: RADS.slice(1).map(String), value: '8', onChange: update });
  const b = slider({ label: 'coefficient b', min: -6, max: 6, value: 1, onInput: update });
  const m = chips({ options: RADS.slice(1).map(String), value: '18', onChange: update });
  const barWrap = h('div'); const out = readout();
  el.append(card('', h('div', { class: 'row' }, h('div', {}, controls(a), h('div', { class: 'small' }, 'radicand n'), n.el), h('div', {}, controls(b), h('div', { class: 'small' }, 'radicand m'), m.el)), out, barWrap));
  const cv = new Canvas(barWrap, 480, 190);
  function update() {
    const A = a.value, B = b.value, N = +n.value, M = +m.value;
    const s1 = simplifyRadical(N), s2 = simplifyRadical(M);
    const c1 = A * s1.coef, c2 = B * s2.coef;
    const expr = `${coefTex(A, `\\sqrt{${N}}`)} ${B < 0 ? '-' : '+'} ${coefTex(Math.abs(B), `\\sqrt{${M}}`)}`;
    let html = `<div class="big">${tex(expr)}</div>`;
    const simp = `${coefTex(c1, `\\sqrt{${s1.rad}}`)} ${c2 < 0 ? '-' : '+'} ${coefTex(Math.abs(c2), `\\sqrt{${s2.rad}}`)}`;
    if (s1.coef !== 1 || s2.coef !== 1) html += `<div>Simplify each first: ${tex(`= ${simp}`)}</div>`;
    if (s1.rad === s2.rad) {
      html += `<div class="big">${tex(`= ${coefTex(c1 + c2, `\\sqrt{${s1.rad}}`)}`)} <span class="ok">✓ like radicals — same radicand, so add the counts: ${c1} + (${c2}) = ${c1 + c2}</span></div>`;
      drawBars(cv, [{ coef: c1, rad: s1.rad, label: `${c1}√${s1.rad}` }, { coef: c2, rad: s2.rad, label: `${c2}√${s2.rad}` }, { coef: c1 + c2, rad: s1.rad, label: `total: ${c1 + c2}√${s1.rad}` }]);
    } else {
      html += `<div><span class="bad">✗ unlike radicals</span> — ${tex(`\\sqrt{${s1.rad}}`)} and ${tex(`\\sqrt{${s2.rad}}`)} are different lengths, so ${tex(simp)} is already as simple as it gets. (It is a number, ≈ ${fmt(A * Math.sqrt(N) + B * Math.sqrt(M), 4)}, just not one with a shorter name.)</div>`;
      drawBars(cv, [{ coef: c1, rad: s1.rad, label: `${c1}√${s1.rad}` }, { coef: c2, rad: s2.rad, label: `${c2}√${s2.rad}` }]);
    }
    out.innerHTML = html;
  }
  update();
  el.append(card('', quiz(() => {
    const r = [2, 3, 5][Math.floor(Math.random() * 3)]; const k1 = [2, 3, 4][Math.floor(Math.random() * 3)], k2 = [1, 2, 3, 5][Math.floor(Math.random() * 4)];
    const c1 = 1 + Math.floor(Math.random() * 4), c2 = 1 + Math.floor(Math.random() * 4);
    const ans = c1 * k1 + c2 * k2;
    return { prompt: `Simplify ${tex(`${c1}\\sqrt{${k1 * k1 * r}} + ${c2}\\sqrt{${k2 * k2 * r}}`)} (type like <code>7√2</code>).`, check: v => { const mm = v.toLowerCase().replace(/\s|\*|\(|\)/g, '').match(/^(\d+)(?:√|sqrt)(\d+)$/); return !!mm && +mm[1] === ans && +mm[2] === r; }, hint: 'Simplify each radical first; both hide the same radicand.', explain: `${tex(`${c1}\\cdot${k1}\\sqrt{${r}} + ${c2}\\cdot${k2}\\sqrt{${r}} = ${ans}\\sqrt{${r}}`)}.` };
  })));
}

/* ---------- 2.3 ---------- */
function s23(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Multiplying radicals is the distributive law with ${tex('\\sqrt a\\sqrt b = \\sqrt{ab}')} thrown in — the same area grid you used for ${tex('(x+2)(x+3)')}. Dividing is about <b>rationalizing</b>: a radical in the denominator is removed by multiplying top and bottom by something that makes the bottom rational — its <b>conjugate</b>, which triggers ${tex('(u+v)(u-v) = u^2 - v^2')} and kills the cross terms.` })));
  const a = slider({ label: 'a', min: -5, max: 5, value: 2, onInput: update });
  const b = slider({ label: 'b', min: -5, max: 5, value: 3, onInput: update });
  const c = slider({ label: 'c', min: -5, max: 5, value: 2, onInput: update });
  const d = slider({ label: 'd', min: -5, max: 5, value: -3, onInput: update });
  const p = chips({ options: ['1', '2', '3', '5', '6'], value: '2', onChange: update });
  const q = chips({ options: ['1', '2', '3', '5', '6'], value: '3', onChange: update });
  const gridWrap = h('div'); const out = readout();
  const conj = h('button', { class: 'btn', onClick: () => { c.value = a.value; d.value = -b.value; update(); } }, 'make it a conjugate pair');
  el.append(card('', h('p', { html: `Multiply ${tex('(a\\sqrt p + b\\sqrt q)(c\\sqrt p + d\\sqrt q)')}` }),
    h('div', { class: 'row' }, h('div', {}, controls(a, b), h('div', { class: 'small' }, 'p'), p.el), h('div', {}, controls(c, d), h('div', { class: 'small' }, 'q'), q.el)), conj, h('div', { class: 'row' }, gridWrap, out)));
  const cv = new Canvas(gridWrap, 420, 260);
  const rt = (k, r) => k === 0 ? '0' : coefTex(k, r === 1 ? '' : `\\sqrt{${r}}`) || '1';
  function update() {
    const A = a.value, B = b.value, C = c.value, D = d.value, P = +p.value, Q = +q.value;
    // cells
    const cells = [
      { coef: A * C * P, rad: 1, tex: `${A * C}\\cdot ${P}` },
      { coef: A * D, rad: P * Q, tex: `${A * D}\\sqrt{${P * Q}}` },
      { coef: B * C, rad: P * Q, tex: `${B * C}\\sqrt{${P * Q}}` },
      { coef: B * D * Q, rad: 1, tex: `${B * D}\\cdot ${Q}` },
    ];
    const s = simplifyRadical(P * Q);
    const rational = cells[0].coef + cells[3].coef;
    const cross = (A * D + B * C) * s.coef;
    const t1 = rt(A, P), t2 = rt(B, Q), t3 = rt(C, P), t4 = rt(D, Q);
    let res = `${rational}`;
    if (cross !== 0 && s.rad !== 1) res += ` ${cross < 0 ? '-' : '+'} ${coefTex(Math.abs(cross), `\\sqrt{${s.rad}}`)}`;
    else if (cross !== 0) res = `${rational + cross}`;
    out.innerHTML = `<div class="big">${tex(`(${t1} ${B < 0 ? '-' : '+'} ${rt(Math.abs(B), Q)})(${t3} ${D < 0 ? '-' : '+'} ${rt(Math.abs(D), Q)})`)}</div>
      <div>Four cell products: ${tex(`${A * C}\\sqrt{${P}}\\sqrt{${P}} ${sg(A * D)}\\sqrt{${P}}\\sqrt{${Q}} ${sg(B * C)}\\sqrt{${Q}}\\sqrt{${P}} ${sg(B * D)}\\sqrt{${Q}}\\sqrt{${Q}}`)}</div>
      <div>${tex(`= ${A * C}\\cdot${P} ${sg(A * D + B * C)}\\sqrt{${P * Q}} ${sg(B * D)}\\cdot${Q}`)}${s.coef > 1 ? ` and ${tex(`\\sqrt{${P * Q}} = ${radicalTex(s.coef, s.rad)}`)}` : ''}</div>
      <div class="big">${tex(`= ${res}`)}</div>
      ${A * D + B * C === 0 ? `<p class="ok">The cross terms cancelled: the two factors are <b>conjugates</b> (${tex('u+v')} and ${tex('u-v')}), so the product is ${tex('u^2 - v^2')} — a rational number. That is the trick behind rationalizing a denominator.</p>` : `<p class="small">${tex('\\sqrt p\\cdot\\sqrt p = p')}: a radical times itself is the radicand. The cross terms carry ${tex('\\sqrt{pq}')}.</p>`}`;
    // grid picture
    cv.clear();
    const x0 = 70, y0 = 50, W = 320, H = 190;
    const wa = W * (Math.abs(A) * Math.sqrt(P)) / (Math.abs(A) * Math.sqrt(P) + Math.abs(B) * Math.sqrt(Q) || 1);
    const hc = H * (Math.abs(C) * Math.sqrt(P)) / (Math.abs(C) * Math.sqrt(P) + Math.abs(D) * Math.sqrt(Q) || 1);
    const cellR = (x, y, w, hh, txt, neg) => { cv.rect(x, y, w, hh, { fill: neg ? 's2' : 's1', opacity: neg ? 0.25 : 0.2, stroke: 'muted', width: 1 }); if (w > 30 && hh > 20) cv.text(x + w / 2, y + hh / 2, txt, { size: 12, weight: 600, bg: true }); };
    cellR(x0, y0, wa, hc, `${A * C}·${P} = ${A * C * P}`, A * C < 0);
    cellR(x0 + wa, y0, W - wa, hc, `${B * C}√${P * Q}`, B * C < 0);
    cellR(x0, y0 + hc, wa, H - hc, `${A * D}√${P * Q}`, A * D < 0);
    cellR(x0 + wa, y0 + hc, W - wa, H - hc, `${B * D}·${Q} = ${B * D * Q}`, B * D < 0);
    cv.text(x0 + wa / 2, y0 - 14, `${A}√${P}`, { size: 13, weight: 600, color: 's1' });
    cv.text(x0 + wa + (W - wa) / 2, y0 - 14, `${B}√${Q}`, { size: 13, weight: 600, color: 's1' });
    cv.text(x0 - 30, y0 + hc / 2, `${C}√${P}`, { size: 13, weight: 600, color: 's4' });
    cv.text(x0 - 30, y0 + hc + (H - hc) / 2, `${D}√${Q}`, { size: 13, weight: 600, color: 's4' });
    cv.text(x0 + W / 2, y0 + H + 16, 'widths to scale by |coefficient|·√radicand; orange = negative', { size: 10.5, color: 'muted' });
  }
  update();

  // rationalizing
  const N = slider({ label: 'numerator', min: 1, max: 12, value: 6, onInput: rat });
  const e = slider({ label: 'e', min: -4, max: 4, value: 1, onInput: rat });
  const f = slider({ label: 'f', min: -4, max: 4, value: -1, onInput: rat });
  const r = chips({ options: ['2', '3', '5', '6', '7'], value: '3', onChange: rat });
  const rout = readout();
  el.append(card('', h('h3', { html: `Dividing: rationalize ${tex('\\dfrac{N}{e + f\\sqrt r}')}` }), controls(N, e, f), h('div', { class: 'small' }, 'r'), r.el, rout));
  function rat() {
    const n = N.value, E = e.value, F = f.value, R = +r.value;
    if (F === 0) { rout.innerHTML = `<div class="big">${tex(`\\frac{${n}}{${E}}`)} — no radical in the denominator, nothing to do.</div>`; return; }
    if (E === 0) { const g = gcd(n, R * F); rout.innerHTML = `<div class="big">${tex(`\\frac{${n}}{${coefTex(F, `\\sqrt{${R}}`)}} = \\frac{${n}}{${coefTex(F, `\\sqrt{${R}}`)}}\\cdot\\frac{\\sqrt{${R}}}{\\sqrt{${R}}} = \\frac{${n}\\sqrt{${R}}}{${F * R}}${g > 1 ? ` = \\frac{${n / g}\\sqrt{${R}}}{${F * R / g}}` : ''}`)}</div><p class="small">One radical alone: multiply by itself, because ${tex(`\\sqrt{${R}}\\sqrt{${R}} = ${R}`)}.</p>`; return; }
    const den = E * E - F * F * R;
    const g = gcd(gcd(n * E, n * F), den);
    const conjT = `${E} ${F < 0 ? '+' : '-'} ${coefTex(Math.abs(F), `\\sqrt{${R}}`)}`;
    const origT = `${E} ${F < 0 ? '-' : '+'} ${coefTex(Math.abs(F), `\\sqrt{${R}}`)}`;
    const numT = `${n * E} ${-n * F < 0 ? '-' : '+'} ${coefTex(Math.abs(n * F), `\\sqrt{${R}}`)}`;
    let final = `\\frac{${numT}}{${den}}`;
    const d2 = den / g, n1 = n * E / g, n2 = -n * F / g;
    if (g > 1 || Math.abs(d2) === 1) {
      const sgn = d2 < 0 ? -1 : 1, D2 = Math.abs(d2);
      const numT2 = `${n1 * sgn} ${n2 * sgn < 0 ? '-' : '+'} ${coefTex(Math.abs(n2), `\\sqrt{${R}}`)}`;
      final += D2 === 1 ? ` = ${numT2}` : ` = \\frac{${numT2}}{${D2}}`;
    }
    rout.innerHTML = `<div class="big">${tex(`\\frac{${n}}{${origT}}\\cdot\\frac{${conjT}}{${conjT}} = \\frac{${n}(${conjT})}{${E}^2 - (${coefTex(Math.abs(F), `\\sqrt{${R}}`)})^2} = ${final}`)}</div><p class="small">The denominator became ${tex(`${E * E} - ${F * F}\\cdot${R} = ${den}`)}: the conjugate turns ${tex('u+v')} into ${tex('u^2 - v^2')}, and squaring removes the root. Multiplying by ${tex(`\\frac{${conjT}}{${conjT}}`)} is multiplying by 1, so the value (≈ ${fmt(n / (E + F * Math.sqrt(R)), 4)}) never changed — only its name did.</p>`;
  }
  rat();
}

/* ---------- 2.4 & 2.5 shared model ---------- */
function radicalModel(el, { algebra }) {
  const a = slider({ label: 'a (inside: √(x + a))', min: -6, max: 6, value: 3, onInput: update });
  const m = slider({ label: 'm (slope of right side)', min: -2, max: 2, step: 0.25, value: 1, onInput: update });
  const b = slider({ label: 'b (intercept of right side)', min: -6, max: 6, value: -3, onInput: update });
  const showSq = chips({ options: [{ value: 'no', label: 'original equation' }, { value: 'yes', label: 'after squaring both sides' }], value: 'no', onChange: update });
  const gw = h('div'); const out = readout(); const steps = h('div');
  el.append(card('', controls(a, m, b), showSq.el,
    legend([['c1', 'y = √(x + a)'], ['c2', 'y = mx + b'], ['c4', 'y = −√(x + a) (the mirror branch that squaring lets in)'], ['c3', 'after squaring: y = x + a and y = (mx + b)²']]), h('div', { class: 'row' }, gw, out), steps));
  const p = new Plot(gw, { xmin: -8, xmax: 12, ymin: -6, ymax: 10, height: 400 });
  function update() {
    const A = a.value, M = m.value, B = b.value, sq = showSq.value === 'yes';
    p.clear();
    p.band(-8, -A, { color: 's5', opacity: 0.08 });
    p.label(-A, -5.5, `x ≥ ${fmtT(-A)} only`, { pos: 'e', color: 's5', size: 11 });
    const f = x => Math.sqrt(x + A), g = x => M * x + B;
    if (sq) {
      p.fn(x => x + A, { color: 's3', width: 2 });
      p.fn(x => g(x) ** 2, { color: 's3', width: 2, dash: '6 3' });
      p.fn(f, { color: 's1', width: 1.2, opacity: .5 });
      p.fn(x => -f(x), { color: 's4', width: 1.5, dash: '4 3' });
      p.fn(g, { color: 's2', width: 1.2, opacity: .5 });
    } else {
      p.fn(f, { color: 's1', width: 2.5 });
      p.fn(g, { color: 's2', width: 2 });
    }
    // candidates from squared equation: M²x² + (2MB − 1)x + (B² − A) = 0
    const qa = M * M, qb = 2 * M * B - 1, qc = B * B - A;
    const cands = quadraticRoots(qa, qb, qc);
    const results = cands.map(x => ({ x, ok: g(x) >= -1e-9 && x + A >= -1e-9, mirror: g(x) < 0 && x + A >= 0 }));
    for (const r of results) {
      p.point(r.x, sq ? r.x + A : (r.ok ? g(r.x) : g(r.x)), { color: r.ok ? 's3' : 's5', label: (r.ok ? 'solution x = ' : 'extraneous x = ') + fmt(r.x, 3), pos: 'ne', fill: r.ok ? undefined : 'none' });
      if (!sq && !r.ok && r.mirror) p.point(r.x, -f(r.x), { color: 's4', r: 4, ring: false });
    }
    const lhs = `\\sqrt{x ${A < 0 ? '-' : '+'} ${Math.abs(A)}}`, rhs = linTex(M, B);
    const good = results.filter(r => r.ok), badr = results.filter(r => !r.ok);
    out.innerHTML = `<div class="big">${tex(`${lhs} = ${rhs}`)}</div>
      <div>${good.length ? `Solution${good.length > 1 ? 's' : ''}: ${good.map(r => `<b class="ok">x ≈ ${fmt(r.x, 4)}</b>`).join(', ')} — where the curve and line actually cross.` : '<b>No solution</b> — the curve and line never meet.'}</div>
      ${badr.length ? `<div class="bad">Extraneous: ${badr.map(r => `x ≈ ${fmt(r.x, 4)}`).join(', ')} — squaring invents these. ${badr.some(r => r.mirror) ? 'They are where the line hits the <b>mirror branch</b> −√(x + a): squaring can\'t tell +√ from −√.' : 'They fall outside the domain x ≥ ' + fmtT(-A) + '.'}</div>` : ''}
      <p class="small">${sq ? 'After squaring, both sides are polynomials: a line and a parabola. They cross at every candidate — real and fake alike. Squaring is a one-way street; it never loses a solution but it can add one.' : 'The left side is never negative, so any crossing must happen where the line is ≥ 0. Toggle to see what squaring does to this picture.'}</p>`;
    if (algebra) {
      const exact = exactRootsTex(Math.round(qa * 16), Math.round(qb * 16), Math.round(qc * 16));
      const li = [];
      li.push(`<li>Restrictions: radicand ≥ 0 → ${tex(`x \\ge ${fmtT(-A)}`)}; and since ${tex('\\sqrt{\\ }\\ge 0')}, need ${tex(`${rhs} \\ge 0`)}${M !== 0 ? ` → ${tex(`x ${M > 0 ? '\\ge' : '\\le'} ${fmtT(-B / M, 3)}`)}` : ''}.<span class="why">Write these down first; they tell you which candidates to throw away.</span></li>`);
      li.push(`<li>The radical is already isolated. Square both sides: ${tex(`x ${A < 0 ? '-' : '+'} ${Math.abs(A)} = (${rhs})^2`)}<span class="why">Only square when the radical is alone on one side.</span></li>`);
      li.push(`<li>Expand and collect: ${tex(`${polyTex(qa, qb, qc)} = 0`)}</li>`);
      li.push(`<li>Solve the quadratic (Chapter 3): ${cands.length ? tex(exact ? `x = ${exact.join(',\\; ')}` : `x \\approx ${cands.map(x => fmt(x, 4)).join(',\\; ')}`) : 'no real roots'}<span class="why">Candidates, not answers yet.</span></li>`);
      for (const r of results) { const L = Math.sqrt(r.x + A); li.push(`<li class="${r.ok ? 'good' : 'bad'}">Check x ≈ ${fmt(r.x, 4)}: LHS ${tex(lhs)} = ${Number.isNaN(L) ? 'undefined (negative radicand)' : fmt(L, 4)}, RHS = ${fmt(g(r.x), 4)} → ${r.ok ? '✓ keep' : '✗ reject (extraneous)'}</li>`); }
      steps.innerHTML = `<h3>Algebraic solution, step by step</h3><ol class="steps">${li.join('')}</ol>`;
    }
  }
  update();
}
function s24(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `An equation ${tex('\\text{left} = \\text{right}')} is a question: <i>where do the graphs of the two sides cross?</i> For ${tex('\\sqrt{x+a} = mx+b')}, the left side is half a sideways parabola that starts at ${tex('x=-a')} and only ever goes up. The right side is a line. Their crossing points are the solutions — and you can see at a glance when there are two, one, or none.` })));
  radicalModel(el, { algebra: false });
  el.append(card('warn', h('h3', {}, 'Things to try'), h('ul', {},
    h('li', {}, 'Set m = 1, b = −3, a = 3: the line crosses the curve once, but toggle "after squaring" and a second crossing appears at the mirror branch. That phantom is the extraneous root.'),
    h('li', {}, 'Set b so the line passes below the start of the curve: no solutions, yet squaring still produces candidates.'),
    h('li', {}, 'Make m = 0: a horizontal line meets √(x + a) exactly once if b ≥ 0 and never if b < 0. A square root is never negative.'))));
}
function s25(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `To undo a square root, square. But squaring is <b>not reversible</b>: ${tex('x = -2')} and ${tex('x = 2')} both square to 4. So squaring both sides of an equation can let in answers that were never there — <b>extraneous roots</b>. The fix is not clever algebra; it is <b>always checking</b> candidates in the original equation, and writing down the restrictions before you start.` })));
  radicalModel(el, { algebra: true });
  el.append(card('', h('h3', {}, 'Two radicals? Isolate one, square, isolate the other, square again'),
    h('p', { html: `For ${tex('\\sqrt{x+7} - \\sqrt{x} = 1')}: move one root over, ${tex('\\sqrt{x+7} = 1 + \\sqrt x')}; square, ${tex('x + 7 = 1 + 2\\sqrt x + x')}; the ${tex('x')}'s cancel, leaving ${tex('6 = 2\\sqrt x')}, so ${tex('\\sqrt x = 3')} and ${tex('x = 9')}. Check: ${tex('\\sqrt{16} - \\sqrt9 = 4 - 3 = 1')} ✓. Each squaring is a chance for a phantom to sneak in, so check at the end no matter how clean it looked.` })));
}

export default {
  num: 2, title: 'Radical Operations and Equations',
  tagline: 'Treat √2 like a variable: like terms combine, unlike terms don’t, and multiplication distributes. Solving means undoing the root — carefully, because squaring is irreversible.',
  bigIdea: {
    title: 'A radical is a length, and squaring is a one-way door',
    render(el) {
      el.append(h('p', { html: `Two ideas run the whole chapter. <b>(1)</b> ${tex('\\sqrt2')} is just a number, a specific length; ${tex('3\\sqrt2 + 5\\sqrt2 = 8\\sqrt2')} the way ${tex('3x + 5x = 8x')}, and ${tex('(1+\\sqrt2)(1-\\sqrt2) = 1 - 2 = -1')} by the same distributive law you already know. <b>(2)</b> A square root is never negative, so when you square an equation to remove the root, you also admit its negative twin. Every extraneous root in this chapter is that twin, and the picture below shows it: the solid curve is ${tex('y = \\sqrt{x+3}')}, the dashed one is its twin ${tex('y=-\\sqrt{x+3}')}, and the line ${tex('y = x-3')} crosses <i>both</i> — squaring can't tell which.` }));
      const gw = h('div'); el.append(gw);
      const p = new Plot(gw, { xmin: -5, xmax: 10, ymin: -5, ymax: 6, height: 300 });
      p.fn(x => Math.sqrt(x + 3), { color: 's1', width: 2.5 });
      p.fn(x => -Math.sqrt(x + 3), { color: 's4', width: 1.5, dash: '4 3' });
      p.fn(x => x - 3, { color: 's2', width: 2 });
      p.point(6, 3, { color: 's3', label: 'real: x = 6', pos: 'nw' });
      p.point(1, -2, { color: 's5', fill: 'none', label: 'phantom: x = 1', pos: 'se' });
    }
  },
  sections: [
    { id: '2.1', title: 'Simplifying Radical Expressions', blurb: 'Factors leave the root in pairs (or triples). For exponents, that is division with remainder.', render: s21 },
    { id: '2.2', title: 'Adding and Subtracting Radical Expressions', blurb: 'Like radicals are like terms: count copies of one length. Simplify first to reveal hidden matches.', render: s22 },
    { id: '2.3', title: 'Multiplying and Dividing Radical Expressions', blurb: 'The area model, plus √a·√a = a. Conjugates kill the cross terms — that is how you rationalize.', render: s23 },
    { id: '2.4', title: 'Solving Radical Equations Graphically', blurb: 'Solutions are crossings of two graphs. Squaring adds a mirror branch and, with it, phantom crossings.', render: s24 },
    { id: '2.5', title: 'Solving Radical Equations Algebraically', blurb: 'Restrict, isolate, square, solve, check. The check is not optional, because squaring is not reversible.', render: s25 },
  ],
};
