import { h, tex, dtex, slider, numberInput, chips, card, controls, readout, legend, quiz } from '../lib/ui.js';
import { Plot, Canvas } from '../lib/graph.js';
import { gcd, isSquare, simplifyRadical, radicalTex, fmt, fmtT, quadraticRoots, polyTex, linTex, exactRootsTex, factorTrinomial, discriminant, fracTex, vertexTex, factoredTex } from '../lib/math.js';
import { drawQuadratic, autoBounds } from '../lib/quad.js';

const FEATURES = [
  { id: 'vertex', label: 'vertex' }, { id: 'axis', label: 'axis of symmetry' }, { id: 'yint', label: 'y-intercept' }, { id: 'xint', label: 'x-intercepts' },
  { id: 'dir', label: 'direction of opening' }, { id: 'range', label: 'domain & range' }, { id: 'sym', label: 'symmetric pairs' },
];

/* ---------- 4.1 ---------- */
function s41(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `A parabola is completely described by <b>where its vertex is</b>, <b>which way it opens</b>, and <b>how steep it is</b>. Everything else on the list — axis of symmetry, max/min value, range, intercepts — is read off from those three. The axis passes through the vertex; the max/min <i>is</i> the vertex's y-value; the range starts there; the x-intercepts, if any, sit symmetrically about the axis.` })));
  const a = slider({ label: 'a', min: -3, max: 3, step: 0.5, value: 1, onInput: update });
  const b = slider({ label: 'b', min: -8, max: 8, value: -2, onInput: update });
  const c = slider({ label: 'c', min: -8, max: 8, value: -3, onInput: update });
  const feats = chips({ options: FEATURES.map(f => ({ value: f.id, label: f.label })), value: ['vertex', 'axis', 'xint', 'yint'], multi: true, onChange: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, b, c), h('div', { class: 'small' }, 'highlight'), feats.el, h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 400 });
  function update() {
    const A = a.value || 0.5, B = b.value, C = c.value; const on = new Set(feats.value);
    p.setBounds(autoBounds(A, B, C)); p.clear();
    const vx = -B / (2 * A), vy = A * vx * vx + B * vx + C;
    if (on.has('range')) p.hband(A > 0 ? vy : p.ymin, A > 0 ? p.ymax : vy, { color: 's3', opacity: 0.1 });
    p.fn(x => A * x * x + B * x + C, { color: 's1', width: 2.5 });
    if (on.has('axis')) { p.vline(vx, { color: 's4', width: 1.2 }); p.label(vx, p.ymax - 0.8, `x = ${fmt(vx, 3)}`, { pos: 'e', color: 's4' }); }
    if (on.has('vertex')) p.point(vx, vy, { color: 's4', label: `vertex (${fmt(vx, 3)}, ${fmt(vy, 3)})`, pos: A > 0 ? 's' : 'n' });
    if (on.has('yint')) p.point(0, C, { color: 's2', label: `(0, ${fmtT(C)})`, pos: 'e' });
    if (on.has('xint')) for (const r of quadraticRoots(A, B, C)) p.point(r, 0, { color: 's3', label: `(${fmt(r, 3)}, 0)`, pos: A > 0 ? 'n' : 's' });
    if (on.has('dir')) { p.label(vx, vy, A > 0 ? '⬆ opens up (a > 0): vertex is a minimum' : '⬇ opens down (a < 0): vertex is a maximum', { pos: A > 0 ? 'n' : 's', color: 's1' }); }
    if (on.has('sym')) { for (const d of [1, 2, 3]) { const y = A * d * d + vy; p.segment(vx - d, y, vx + d, y, { color: 's2', width: 1, dash: '3 3' }); p.point(vx - d, y, { color: 's2', r: 3, ring: false }); p.point(vx + d, y, { color: 's2', r: 3, ring: false }); } }
    const roots = quadraticRoots(A, B, C);
    out.innerHTML = `<div class="big">${tex(`y = ${polyTex(A, B, C)}`)}</div>
      <table class="tbl">
      <tr><td>Vertex</td><td>${tex(`\\left(-\\tfrac{b}{2a},\\ f(-\\tfrac{b}{2a})\\right) = (${fmt(vx, 3)},\\ ${fmt(vy, 3)})`)}</td></tr>
      <tr><td>Axis of symmetry</td><td>${tex(`x = ${fmt(vx, 3)}`)}</td></tr>
      <tr><td>Opens</td><td>${A > 0 ? 'up (a > 0)' : 'down (a < 0)'}, ${Math.abs(A) > 1 ? 'narrower' : Math.abs(A) < 1 ? 'wider' : 'same width'} than ${tex('y = x^2')}</td></tr>
      <tr><td>${A > 0 ? 'Minimum' : 'Maximum'} value</td><td>${fmt(vy, 3)} at ${tex(`x = ${fmt(vx, 3)}`)}</td></tr>
      <tr><td>Domain</td><td>${tex('\\{x \\mid x \\in \\mathbb{R}\\}')} — always, for any quadratic</td></tr>
      <tr><td>Range</td><td>${tex(`\\{y \\mid y ${A > 0 ? '\\ge' : '\\le'} ${fmt(vy, 3)},\\ y \\in \\mathbb{R}\\}`)}</td></tr>
      <tr><td>y-intercept</td><td>${tex(`(0, ${fmtT(C)})`)} — just c</td></tr>
      <tr><td>x-intercepts</td><td>${roots.length ? roots.map(r => `(${fmt(r, 3)}, 0)`).join(', ') : 'none (vertex is on the wrong side of the axis)'}</td></tr>
      </table>
      <p class="small">Try the "symmetric pairs" highlight: every horizontal line meets the parabola at two points the same distance from the axis. Symmetry is the reason ${tex('-\\tfrac{b}{2a}')} is the midpoint of the roots.</p>`;
  }
  update();
}

/* ---------- 4.2 ---------- */
function s42(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Solving ${tex('ax^2+bx+c = k')} graphically can be done two ways, and they are the <i>same</i> picture shifted: (1) draw the parabola and the horizontal line ${tex('y = k')}, read off the crossings; or (2) move ${tex('k')} across, draw ${tex('y = ax^2+bx+c-k')}, and read off the <b>x-intercepts</b>. Subtracting ${tex('k')} just slides the parabola down until the line becomes the x-axis. That's why "set it equal to zero" is the universal first move.` })));
  const a = slider({ label: 'a', min: -3, max: 3, step: 0.5, value: 1, onInput: update });
  const b = slider({ label: 'b', min: -8, max: 8, value: -1, onInput: update });
  const c = slider({ label: 'c', min: -8, max: 8, value: 2, onInput: update });
  const k = slider({ label: 'k (right-hand side)', min: -10, max: 12, value: 6, onInput: update });
  const view = chips({ options: [{ value: 'two', label: 'two graphs: parabola meets y = k' }, { value: 'one', label: 'one graph: zeros of f(x) − k' }], value: 'two', onChange: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, b, c, k), view.el, h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 400 });
  function update() {
    const A = a.value || 0.5, B = b.value, C = c.value, K = k.value, two = view.value === 'two';
    const bounds = autoBounds(A, B, C - K); if (two) { bounds.ymin = Math.min(bounds.ymin, K - 2, C - 2); bounds.ymax = Math.max(bounds.ymax, K + 2, C + 2); }
    p.setBounds(bounds); p.clear();
    const roots = quadraticRoots(A, B, C - K);
    if (two) {
      p.fn(x => A * x * x + B * x + C, { color: 's1', width: 2.5 });
      p.hline(K, { color: 's2', width: 1.5 }); p.label(p.xmax - 0.5, K, `y = ${K}`, { pos: 'w', color: 's2' });
      for (const r of roots) { p.point(r, K, { color: 's3', label: `x ≈ ${fmt(r, 3)}`, pos: 'n' }); p.segment(r, K, r, 0, { color: 's3', width: 1, dash: '3 3' }); }
    } else {
      p.fn(x => A * x * x + B * x + C, { color: 's1', width: 1, dash: '4 4', opacity: .5 });
      p.fn(x => A * x * x + B * x + C - K, { color: 's3', width: 2.5 });
      for (const r of roots) p.point(r, 0, { color: 's3', label: `x ≈ ${fmt(r, 3)}`, pos: 'n' });
      p.label(p.xmin + 0.5, p.ymax - 0.8, `slid down by ${K}`, { pos: 'e', color: 's3' });
    }
    const ex = exactRootsTex(A * 2, B * 2, (C - K) * 2);
    out.innerHTML = `<div class="big">${tex(`${polyTex(A, B, C)} = ${K}`)}</div>
      <div>${two ? `Crossings of the parabola with the line ${tex(`y = ${K}`)}:` : `Rearranged: ${tex(`${polyTex(A, B, C - K)} = 0`)}. Its x-intercepts:`} ${roots.length ? roots.map(r => `<b>x ≈ ${fmt(r, 4)}</b>`).join(', ') : '<b>none</b> — no solution'}</div>
      ${roots.length && ex ? `<div>Exact (Chapter 3): ${tex(`x = ${ex.join(',\\ ')}`)}</div>` : ''}
      <p class="small">Graphs give <i>approximate</i> answers and tell you how many there are; algebra gives exact ones. Use the graph to know what to expect, then the formula to nail it down. Slide k past the vertex and watch two solutions become one, then none.</p>`;
  }
  update();
}

/* ---------- 4.3 ---------- */
function s43(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Every parabola is ${tex('y = x^2')} after three moves: <b>stretch</b> vertically by ${tex('a')} (flip if negative), slide <b>right</b> by ${tex('p')}, slide <b>up</b> by ${tex('q')}. Each point ${tex('(x, x^2)')} goes to ${tex('(x + p,\\ a x^2 + q)')}. The sign of ${tex('p')} looks backwards — ${tex('(x-3)^2')} moves <i>right</i> — because the function asks "what input gives me the old value?", and the answer is "3 more than before".` })));
  const a = slider({ label: 'a (stretch)', min: -3, max: 3, step: 0.25, value: 2, onInput: update });
  const pS = slider({ label: 'p (right)', min: -5, max: 5, value: 3, onInput: update });
  const q = slider({ label: 'q (up)', min: -6, max: 6, value: -2, onInput: update });
  const stage = chips({ options: [{ value: 0, label: 'y = x²' }, { value: 1, label: 'stretch: y = ax²' }, { value: 2, label: 'slide right: y = a(x − p)²' }, { value: 3, label: 'slide up: y = a(x − p)² + q' }], value: 3, onChange: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, pS, q), stage.el, legend([['c1', 'current stage'], ['c4', 'parent y = x²'], ['c2', 'where marked points went']]), h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { xmin: -8, xmax: 10, ymin: -8, ymax: 12, height: 420 });
  function update() {
    const A = a.value, P = pS.value, Q = q.value, s = +stage.value;
    const aa = s >= 1 ? A : 1, pp = s >= 2 ? P : 0, qq = s >= 3 ? Q : 0;
    p.clear();
    p.fn(x => x * x, { color: 's4', width: 1.5, dash: '4 4', opacity: .7 });
    if (s >= 2) p.fn(x => aa * x * x, { color: 's1', width: 1, opacity: .3 });
    if (s >= 3) p.fn(x => aa * (x - pp) ** 2, { color: 's1', width: 1, opacity: .3 });
    p.fn(x => aa * (x - pp) ** 2 + qq, { color: 's1', width: 2.5 });
    const rows = [];
    for (const x of [-2, -1, 0, 1, 2]) {
      const y0 = x * x, x1 = x + pp, y1 = aa * y0 + qq;
      p.point(x, y0, { color: 's4', r: 3, ring: false });
      if (s > 0) { p.segment(x, y0, x1, y1, { color: 's2', width: 1, dash: '2 3' }); p.point(x1, y1, { color: 's2', r: 4 }); }
      rows.push(`<tr><td>${tex(`(${x}, ${y0})`)}</td><td>→</td><td>${tex(`(${x}${pp ? (pp > 0 ? ' + ' : ' − ') + Math.abs(pp) : ''},\\ ${aa !== 1 ? aa + '·' : ''}${y0}${qq ? (qq > 0 ? ' + ' : ' − ') + Math.abs(qq) : ''}) = (${fmtT(x1)}, ${fmtT(y1)})`)}</td></tr>`);
    }
    p.point(pp, qq, { color: 's1', label: `vertex (${fmtT(pp)}, ${fmtT(qq)})`, pos: aa > 0 ? 's' : 'n' });
    out.innerHTML = `<div class="big">${tex(`y = ${vertexTex(aa, pp, qq)}`)}</div><table class="tbl"><tr><th>on y = x²</th><th></th><th>after the moves</th></tr>${rows.join('')}</table>
      <p class="small">${s === 1 ? (Math.abs(A) > 1 ? `|a| > 1: every height is multiplied by ${A}, so the parabola looks narrower.` : Math.abs(A) < 1 ? `|a| < 1: heights shrink, the parabola looks wider.` : 'a = ±1: same width.') + (A < 0 ? ' Negative a flips it upside down.' : '') : s === 2 ? `The vertex is now at x = ${P}. Inside the bracket, "x − ${P}" means the graph reaches its old value ${P} units later.` : s === 3 ? `Adding q just lifts the whole thing. Vertex at (${P}, ${Q}), axis x = ${P}, range y ${A > 0 ? '≥' : '≤'} ${Q}.` : 'The parent. Vertex (0, 0), goes through (±1, 1), (±2, 4).'}</p>`;
  }
  update();
}

/* ---------- 4.4 ---------- */
function s44(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Vertex form ${tex('y = a(x-p)^2 + q')} is the parabola with its secrets on the outside: the vertex is ${tex('(p, q)')}, the axis is ${tex('x = p')}, the max/min is ${tex('q')}, the direction is the sign of ${tex('a')}. The only thing that takes work is the x-intercepts — set ${tex('y = 0')} and solve ${tex('a(x-p)^2 = -q')} by square roots (3.4): ${tex('x = p \\pm \\sqrt{-q/a}')}. They exist only when ${tex('-q/a \\ge 0')}, i.e. when the vertex and the opening direction point toward the axis.` })));
  const a = slider({ label: 'a', min: -3, max: 3, step: 0.5, value: -1, onInput: update });
  const pS = slider({ label: 'p', min: -6, max: 6, value: 2, onInput: update });
  const q = slider({ label: 'q', min: -8, max: 8, value: 4, onInput: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, pS, q), h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 400 });
  function update() {
    const A = a.value || 0.5, P = pS.value, Q = q.value;
    const B = -2 * A * P, C = A * P * P + Q;
    p.setBounds(autoBounds(A, B, C)); p.clear();
    if (A > 0) p.hband(Q, p.ymax, { color: 's3', opacity: 0.08 }); else p.hband(p.ymin, Q, { color: 's3', opacity: 0.08 });
    drawQuadratic(p, A, B, C, {});
    const k = -Q / A; const roots = quadraticRoots(A, B, C);
    let xi;
    if (k < 0) xi = `${tex(`${A}(x-${P})^2 = ${-Q}`)} has no solution (a square can't be ${fmt(k, 3)}): <b>no x-intercepts</b>.`;
    else { const sr = k === Math.round(k) ? simplifyRadical(Math.round(k)) : null; xi = `${tex(`(x ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 = ${fmtT(k, 3)}`)} → ${tex(`x = ${P} \\pm ${sr ? (k === 0 ? '0' : radicalTex(sr.coef, sr.rad)) : `\\sqrt{${fmtT(k, 3)}}`}`)} ≈ ${roots.map(r => fmt(r, 3)).join(', ')}`; }
    out.innerHTML = `<div class="big">${tex(`y = ${vertexTex(A, P, Q)}`)}</div>
      <table class="tbl">
      <tr><td>Vertex</td><td>${tex(`(p, q) = (${P}, ${Q})`)} — read directly (mind the sign flip on p)</td></tr>
      <tr><td>Axis</td><td>${tex(`x = ${P}`)}</td></tr>
      <tr><td>Opens</td><td>${A > 0 ? 'up' : 'down'}, so ${tex('q')} is the <b>${A > 0 ? 'minimum' : 'maximum'}</b> value: ${Q}</td></tr>
      <tr><td>Range</td><td>${tex(`y ${A > 0 ? '\\ge' : '\\le'} ${Q}`)} (shaded)</td></tr>
      <tr><td>y-intercept</td><td>set x = 0: ${tex(`${A}(0-${P})^2 + ${Q} = ${fmtT(C)}`)}</td></tr>
      <tr><td>x-intercepts</td><td>${xi}</td></tr>
      </table>`;
  }
  update();

  // find equation from vertex + point
  const vp = slider({ label: 'vertex p', min: -5, max: 5, value: 1, onInput: fit });
  const vq = slider({ label: 'vertex q', min: -6, max: 6, value: -3, onInput: fit });
  const px = slider({ label: 'point x', min: -6, max: 6, value: 3, onInput: fit });
  const py = slider({ label: 'point y', min: -8, max: 10, value: 5, onInput: fit });
  const fw = h('div'); const fo = readout();
  el.append(card('', h('h3', {}, 'Backwards: write the equation from the vertex and one more point'), controls(vp, vq, px, py), h('div', { class: 'row' }, fw, fo)));
  const fp = new Plot(fw, { xmin: -7, xmax: 7, ymin: -9, ymax: 11, height: 320 });
  function fit() {
    const P = vp.value, Q = vq.value, X = px.value, Y = py.value; fp.clear();
    fp.point(P, Q, { color: 's4', label: `vertex (${P}, ${Q})`, pos: 's' }); fp.point(X, Y, { color: 's2', label: `(${X}, ${Y})`, pos: 'e' });
    if (X === P) { fo.innerHTML = '<span class="bad">The point is directly above/below the vertex — that\'s on the axis, and it can only be the vertex itself. Pick a different x.</span>'; return; }
    const A = (Y - Q) / (X - P) ** 2;
    fp.fn(x => A * (x - P) ** 2 + Q, { color: 's1', width: 2.5 });
    fo.innerHTML = `<ol class="steps"><li>Vertex gives p and q: ${tex(`y = a(x ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 ${Q < 0 ? '-' : '+'} ${Math.abs(Q)}`)}</li><li>Substitute the point: ${tex(`${Y} = a(${X} ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 ${Q < 0 ? '-' : '+'} ${Math.abs(Q)}`)}</li><li>${tex(`${Y - Q} = ${(X - P) ** 2}a`)} → ${tex(`a = ${fracTex(Y - Q, (X - P) ** 2)}`)}</li><li class="good">${tex(`y = ${fracTex(Y - Q, (X - P) ** 2)}(x ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 ${Q < 0 ? '-' : '+'} ${Math.abs(Q)}`)}</li></ol><p class="small">One unknown (a), one point, one equation. The vertex fixes two of the three numbers for free.</p>`;
  }
  fit();
}

/* ---------- 4.5 ---------- */
function s45(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Standard, vertex and factored form are three <b>names for the same curve</b>. Each name shows one feature plainly and hides the others: standard form shows the <b>y-intercept</b> (c); vertex form shows the <b>vertex</b>; factored form shows the <b>x-intercepts</b>. Converting is not busywork — you convert <i>toward the feature you need</i>. Expanding goes toward standard; completing the square goes toward vertex; factoring goes toward factored.` })));
  const a = slider({ label: 'a', min: -3, max: 3, value: 1, onInput: update });
  const pS = slider({ label: 'p', min: -5, max: 5, value: 1, onInput: update });
  const q = slider({ label: 'q', min: -9, max: 9, value: -4, onInput: update });
  const form = chips({ options: [{ value: 'std', label: 'standard  y = ax² + bx + c' }, { value: 'vtx', label: 'vertex  y = a(x − p)² + q' }, { value: 'fac', label: 'factored  y = a(x − r₁)(x − r₂)' }], value: 'vtx', onChange: update });
  const gw = h('div'); const out = readout(); const conv = h('div');
  el.append(card('', controls(a, pS, q), form.el, h('div', { class: 'row' }, gw, out), conv));
  const p = new Plot(gw, { height: 380 });
  function update() {
    const A = a.value || 1, P = pS.value, Q = q.value, F = form.value;
    const B = -2 * A * P, C = A * P * P + Q;
    p.setBounds(autoBounds(A, B, C)); p.clear();
    drawQuadratic(p, A, B, C, { vertex: F === 'vtx', axis: F === 'vtx', yint: F === 'std', roots: F === 'fac' });
    const roots = quadraticRoots(A, B, C); const D = discriminant(A, B, C);
    const ex = D >= 0 ? exactRootsTex(A, B, C) : null;
    const facStr = roots.length === 2 && isSquare(D) ? factoredTex(A, roots[0], roots[1]) : roots.length === 1 ? `${A === 1 ? '' : A}(x ${roots[0] < 0 ? '+' : '-'} ${Math.abs(roots[0])})^2` : roots.length === 2 ? `${A === 1 ? '' : A}\\left(x - (${ex[0]})\\right)\\left(x - (${ex[0].replace('\\pm', '\\mp')})\\right)` : null;
    const forms = {
      std: { t: `y = ${polyTex(A, B, C)}`, shows: `y-intercept (0, ${fmtT(C)}) — the constant term. Also the direction (sign of a).` },
      vtx: { t: `y = ${vertexTex(A, P, Q)}`, shows: `vertex (${P}, ${Q}), axis x = ${P}, ${A > 0 ? 'min' : 'max'} value ${Q}, range.` },
      fac: { t: facStr ? `y = ${facStr}` : '\\text{(no factored form: no real roots)}', shows: roots.length ? `x-intercepts ${roots.map(r => `(${fmt(r, 3)}, 0)`).join(' and ')}, and therefore the axis at their midpoint ${fmt(P)}.` : 'nothing — there are no x-intercepts, so this form doesn\'t exist over the reals.' },
    };
    out.innerHTML = Object.entries(forms).map(([k, v]) => `<div class="${k === F ? 'big' : ''}" style="${k === F ? '' : 'opacity:.6'}">${tex(v.t)}<div class="small">shows: ${v.shows}</div></div>`).join('<hr style="border:0;border-top:1px solid var(--border)">');
    const half = B / (2 * A);
    conv.innerHTML = `<div class="grid-2">
      <div class="card"><h3>vertex → standard (expand)</h3>${tex(`${vertexTex(A, P, Q)}`)}<br>${tex(`= ${A === 1 ? '' : A}(x^2 ${-2 * P < 0 ? '-' : '+'} ${Math.abs(2 * P)}x + ${P * P}) ${Q < 0 ? '-' : '+'} ${Math.abs(Q)}`)}<br>${tex(`= ${polyTex(A, B, C)}`)}</div>
      <div class="card"><h3>standard → vertex (complete the square)</h3>${tex(`${polyTex(A, B, C)}`)}<br>${A !== 1 ? tex(`= ${A}\\left(x^2 ${B / A < 0 ? '-' : '+'} ${fmtT(Math.abs(B / A))}x\\right) ${C < 0 ? '-' : '+'} ${Math.abs(C)}`) + '<br>' : ''}${tex(`= ${A === 1 ? '' : A}\\left(x ${half < 0 ? '-' : '+'} ${fmtT(Math.abs(half))}\\right)^2 - ${A === 1 ? '' : A + '\\cdot'}${fmtT(half * half)} ${C < 0 ? '-' : '+'} ${Math.abs(C)}`)}<br>${tex(`= ${vertexTex(A, P, Q)}`)}<div class="small">Half the x-coefficient, square it, add and subtract it. The "add" completes the square; the "subtract" keeps the value honest.</div></div>
      <div class="card"><h3>standard → factored</h3>${roots.length === 1 ? `${tex(polyTex(A, B, C))}<br>${tex(`= ${facStr}`)}<div class="small">D = 0: a perfect square trinomial — one repeated root, the vertex sits on the x-axis.</div>` : roots.length === 2 && isSquare(D) ? `${tex(polyTex(A, B, C))}<br>${tex(`= ${facStr}`)}<div class="small">Discriminant ${D} is a perfect square, so integer/rational factors exist (3.1).</div>` : roots.length ? `Roots are irrational (${tex(`D = ${D}`)} is not a perfect square), so the factored form uses the formula's roots: ${tex(`y = ${facStr}`)}. Legal, but not something you'd find by the box method.` : `${tex(`D = ${D} < 0`)}: no real roots, no factored form.`}</div>
      <div class="card" style="grid-column: 1 / -1"><h3>which form should you reach for?</h3><ul><li>Need the max/min or the range → <b>vertex</b>.</li><li>Need where it crosses the x-axis → <b>factored</b> (or the formula).</li><li>Need the y-intercept or to add/compare functions → <b>standard</b>.</li><li>Have the vertex and a point → build <b>vertex</b> form (4.4). Have the intercepts and a point → build <b>factored</b> form.</li></ul></div></div>`;
  }
  update();
}

/* ---------- bonus: inequalities ---------- */
function sIneq(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `${tex('ax^2 + bx + c > 0')} asks: <i>where is the parabola above the x-axis?</i> The roots are the only places the sign can change, so they cut the number line into pieces, and on each piece the sign is constant. Find the roots, look at the picture (opens up or down?), read off the intervals. That's the whole method.` })));
  const a = slider({ label: 'a', min: -3, max: 3, step: 0.5, value: 1, onInput: update });
  const b = slider({ label: 'b', min: -8, max: 8, value: -1, onInput: update });
  const c = slider({ label: 'c', min: -8, max: 8, value: -6, onInput: update });
  const rel = chips({ options: [{ value: 'gt', label: '> 0' }, { value: 'ge', label: '≥ 0' }, { value: 'lt', label: '< 0' }, { value: 'le', label: '≤ 0' }], value: 'gt', onChange: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, b, c), rel.el, h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 380 });
  function update() {
    const A = a.value || 0.5, B = b.value, C = c.value, R = rel.value;
    p.setBounds(autoBounds(A, B, C)); p.clear();
    const roots = quadraticRoots(A, B, C);
    const wantPos = R === 'gt' || R === 'ge', incl = R === 'ge' || R === 'le';
    const f = x => A * x * x + B * x + C;
    // determine intervals
    const cuts = [p.xmin, ...roots, p.xmax];
    const parts = [];
    for (let i = 0; i < cuts.length - 1; i++) { const mid = (cuts[i] + cuts[i + 1]) / 2; const pos = f(mid) > 0; if (pos === wantPos) { p.band(cuts[i], cuts[i + 1], { color: 's3', opacity: 0.15 }); parts.push([cuts[i], cuts[i + 1]]); } }
    p.fn(f, { color: 's1', width: 2.5 });
    for (const r of roots) p.point(r, 0, { color: 's3', fill: incl ? undefined : 'none', label: `${fmt(r, 3)}`, pos: 'n' });
    const rs = roots.map(r => fmt(r, 3));
    let ans;
    if (roots.length === 2) {
      const [r1, r2] = rs; const lt = incl ? '≤' : '<';
      const outside = (A > 0) === wantPos;
      ans = outside ? `x ${lt} ${r1} or x ${incl ? '≥' : '>'} ${r2}` : `${r1} ${lt} x ${lt} ${r2}`;
    } else if (roots.length === 1) {
      const r = rs[0]; const posEverywhereElse = A > 0;
      if (posEverywhereElse === wantPos) ans = incl ? 'all real x' : `all real x except x = ${r}`;
      else ans = incl ? `only x = ${r}` : 'no solution';
    } else {
      ans = (A > 0) === wantPos ? 'all real x' : 'no solution';
    }
    out.innerHTML = `<div class="big">${tex(`${polyTex(A, B, C)} ${{ gt: '>', ge: '\\ge', lt: '<', le: '\\le' }[R]} 0`)}</div>
      <div>Roots: ${roots.length ? rs.join(', ') : 'none'} — the only places the sign can flip.</div>
      <div>Opens ${A > 0 ? 'up' : 'down'}, so it is ${A > 0 ? 'negative between the roots, positive outside' : 'positive between the roots, negative outside'}.</div>
      <div class="big ok">Solution: ${ans}</div>
      <p class="small">${incl ? 'Filled dots: the roots themselves count, because "= 0" is allowed.' : 'Open dots: the roots are excluded, because the parabola is exactly 0 there, not strictly above/below.'} A sign chart is this same picture flattened onto the number line.</p>`;
  }
  update();
}

export default {
  num: 4, title: 'Analyzing Quadratic Functions and Inequalities',
  tagline: 'Every parabola is y = x² stretched and slid. The three forms of its equation are three views of one curve, each exposing a different feature.',
  bigIdea: {
    title: 'One curve, three names, and every parabola is x² in disguise',
    render(el) {
      el.append(h('p', { html: `Take ${tex('y = x^2')}. Stretch it by ${tex('a')}, slide it to vertex ${tex('(p, q)')}, and you have <i>every</i> quadratic there is. Its equation can be written to show the vertex ${tex('y = a(x-p)^2+q')}, the x-intercepts ${tex('y = a(x-r_1)(x-r_2)')}, or the y-intercept ${tex('y = ax^2+bx+c')}. Chapter 3 told you how to switch between them (expanding, factoring, completing the square). Chapter 4 is about <b>choosing</b> the form that shows what you want to know.` }));
      const gw = h('div'); el.append(gw);
      const p = new Plot(gw, { xmin: -5, xmax: 7, ymin: -5, ymax: 9, height: 320 });
      p.fn(x => x * x, { color: 's4', width: 1.5, dash: '4 4' });
      p.label(2.2, 5.5, 'y = x²', { pos: 'e', color: 's4' });
      drawQuadratic(p, 0.5, -2, -2, {});
      p.label(4.5, 6, 'y = ½(x − 2)² − 4', { pos: 'w', color: 's1' });
    }
  },
  sections: [
    { id: '4.1', title: 'Properties of a Quadratic Function', blurb: 'Vertex, direction, steepness — everything else on the list is read off from those three.', render: s41 },
    { id: '4.2', title: 'Math Lab: Solving a Quadratic Equation Graphically', blurb: 'Crossings with y = k, or zeros after sliding down by k. Same picture.', render: s42 },
    { id: '4.3', title: 'Math Lab: Transforming the Graph of y = x²', blurb: 'Stretch, slide right, slide up. Watch each point move.', render: s43 },
    { id: '4.4', title: 'Analyzing Quadratic Functions of the Form y = a(x − p)² + q', blurb: 'Vertex form wears its vertex on the outside. Only the x-intercepts take work.', render: s44 },
    { id: '4.5', title: 'Equivalent Forms of the Equation of a Quadratic Function', blurb: 'Three names for one curve. Convert toward the feature you need.', render: s45 },
    { id: '4.6', title: 'Quadratic Inequalities (preview of the next sections)', blurb: 'Where is the parabola above or below the axis? Roots cut the line into pieces; read the sign on each.', render: sIneq },
  ],
};
