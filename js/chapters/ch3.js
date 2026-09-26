import { h, tex, dtex, slider, numberInput, chips, card, controls, readout, legend, quiz } from '../lib/ui.js';
import { Plot, Canvas } from '../lib/graph.js';
import { gcd, isSquare, simplifyRadical, radicalTex, fmt, fmtT, quadraticRoots, polyTex, linTex, exactRootsTex, factorTrinomial, discriminant, fracTex, vertexTex } from '../lib/math.js';
import { drawQuadratic, autoBounds } from '../lib/quad.js';

const binTex = (p, q) => { // px + q
  const xs = p === 1 ? 'x' : p === -1 ? '-x' : `${p}x`;
  return q === 0 ? xs : `${xs} ${q < 0 ? '-' : '+'} ${Math.abs(q)}`;
};

/* ---------- 3.1 ---------- */
function s31(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Factoring is <b>un-multiplying</b>: find the two side lengths of a rectangle whose area is ${tex('ax^2+bx+c')}. In the box below, the ${tex('x^2')} tile and the constant tile are fixed by ${tex('a')} and ${tex('c')}; the only freedom is how the ${tex('bx')} splits into two pieces. Those two pieces must multiply to ${tex('a\\cdot c\\cdot x^2')} (they are diagonally opposite in the box) and add to ${tex('bx')}. That is the whole "product ac, sum b" rule — it isn't a trick, it's the geometry of the box.` })));
  const a = slider({ label: 'a', min: -6, max: 6, value: 2, onInput: update });
  const b = slider({ label: 'b', min: -15, max: 15, value: 7, onInput: update });
  const c = slider({ label: 'c', min: -15, max: 15, value: 3, onInput: update });
  const boxWrap = h('div'); const out = readout(); const tblWrap = h('div');
  el.append(card('', controls(a, b, c), h('div', { class: 'row' }, h('div', {}, h('h3', {}, 'The box (area model)'), boxWrap, out), h('div', {}, h('h3', {}, 'Factor pairs of ac'), tblWrap))));
  const cv = new Canvas(boxWrap, 400, 260);
  function update() {
    const A = a.value, B = b.value, C = c.value;
    if (A === 0) { out.innerHTML = 'a = 0 is not a trinomial in x² — it is just a line.'; cv.clear(); tblWrap.innerHTML = ''; return; }
    const F = factorTrinomial(A, B, C);
    const ac = A * C;
    tblWrap.innerHTML = '';
    const t = h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'm'), h('th', {}, 'n'), h('th', {}, 'm · n'), h('th', {}, 'm + n')));
    for (const [m, n] of (F?.pairs || [])) t.append(h('tr', { class: m + n === B ? 'hl' : '' }, h('td', {}, m), h('td', {}, n), h('td', {}, ac), h('td', {}, m + n + (m + n === B ? '  ← = b' : ''))));
    tblWrap.append(h('p', { class: 'small' }, `Need m · n = ac = ${ac} and m + n = b = ${B}.`), t);
    cv.clear();
    const x0 = 80, y0 = 50, W = 280, H = 180;
    const cell = (x, y, w, hh, txt, cls) => { cv.rect(x, y, w, hh, { fill: cls, opacity: 0.22, stroke: 'muted', width: 1 }); cv.text(x + w / 2, y + hh / 2, txt, { size: 14, weight: 600, bg: true }); };
    if (F && !F.none) {
      const { p, q, r, s, m, n } = F;
      const wa = W * 0.55, hc = H * 0.55;
      cell(x0, y0, wa, hc, `${A}x²`, 's1'); cell(x0 + wa, y0, W - wa, hc, `${m}x`, 's3'); cell(x0, y0 + hc, wa, H - hc, `${n}x`, 's3'); cell(x0 + wa, y0 + hc, W - wa, H - hc, `${C}`, 's2');
      cv.text(x0 + wa / 2, y0 - 14, `${p === 1 ? '' : p}x`, { size: 14, weight: 600, color: 's4' }); cv.text(x0 + wa + (W - wa) / 2, y0 - 14, `${q}`, { size: 14, weight: 600, color: 's4' });
      cv.text(x0 - 30, y0 + hc / 2, `${r === 1 ? '' : r}x`, { size: 14, weight: 600, color: 's4' }); cv.text(x0 - 30, y0 + hc + (H - hc) / 2, `${s}`, { size: 14, weight: 600, color: 's4' });
      cv.text(x0 + W / 2, y0 + H + 18, 'diagonal cells multiply to the same thing: ac·x²', { size: 11, color: 'muted' });
      const g = gcd(gcd(Math.abs(p), Math.abs(q)), 1);
      out.innerHTML = `<div class="big">${tex(`${polyTex(A, B, C)} = (${binTex(p, q)})(${binTex(r, s)})`)}</div>
        <div>Split the middle: ${tex(`${polyTex(A, 0, 0)} ${m < 0 ? '-' : '+'} ${Math.abs(m)}x ${n < 0 ? '-' : '+'} ${Math.abs(n)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}`)}</div>
        <div>Group: ${tex(`${r === 1 ? '' : r === -1 ? '-' : r}x(${binTex(p, q)}) ${s < 0 ? '-' : '+'} ${Math.abs(s)}(${binTex(p, q)}) = (${binTex(p, q)})(${binTex(r, s)})`)}</div>
        <p class="small">Check the box: top-left ${tex(`${A}x^2`)}, bottom-right ${tex(`${C}`)}, and the two side-length labels multiply out to every cell.</p>`;
    } else {
      cell(x0, y0, W * 0.55, H * 0.55, `${A}x²`, 's1'); cell(x0 + W * 0.55, y0, W * 0.45, H * 0.55, '?', 's3'); cell(x0, y0 + H * 0.55, W * 0.55, H * 0.45, '?', 's3'); cell(x0 + W * 0.55, y0 + H * 0.55, W * 0.45, H * 0.45, `${C}`, 's2');
      const D = discriminant(A, B, C);
      out.innerHTML = `<div class="big">${tex(polyTex(A, B, C))} does not factor over the integers.</div><p>No pair in the table has sum ${B}. ${D < 0 ? `Its discriminant ${tex(`b^2-4ac = ${D} < 0`)}: it has no real roots at all (3.6).` : isSquare(D) ? '' : `Its discriminant ${tex(`b^2-4ac = ${D}`)} is not a perfect square, so the roots are irrational — use the quadratic formula (3.5).`}</p>`;
    }
  }
  update();
  el.append(card('', quiz(() => {
    const p = [1, 1, 1, 2, 3][Math.floor(Math.random() * 5)], r = [1, 1, 2][Math.floor(Math.random() * 3)];
    const q = Math.floor(Math.random() * 11) - 5 || 1, s = Math.floor(Math.random() * 11) - 5 || -2;
    const A = p * r, B = p * s + q * r, C = q * s;
    return { prompt: `To factor ${tex(polyTex(A, B, C))}, which two numbers multiply to ${A * C} and add to ${B}? (type like <code>3,-4</code>)`, check: v => { const mm = v.replace(/\s|−/g, m => m === '−' ? '-' : '').split(','); if (mm.length !== 2) return false; const [x, y] = mm.map(Number); return x * y === A * C && x + y === B; }, hint: `List factor pairs of ${A * C} including negatives.`, explain: `${p * s} and ${q * r}: product ${p * s * q * r}, sum ${B}. So ${tex(`= (${binTex(p, q)})(${binTex(r, s)})`)}.` };
  })));
}

/* ---------- 3.2 ---------- */
function s32(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Two patterns show up so often they deserve to be <i>seen</i>, not memorised. <b>Difference of squares</b>: cut a ${tex('b\\times b')} corner out of an ${tex('a\\times a')} square, and the leftover L-shape rearranges into a rectangle ${tex('(a+b)')} by ${tex('(a-b)')}. <b>Perfect square trinomial</b>: a square of side ${tex('a+b')} is made of ${tex('a^2')}, ${tex('b^2')}, and <i>two</i> ${tex('ab')} rectangles — which is why ${tex('(a+b)^2 \\ne a^2+b^2')}.` })));
  const bS = slider({ label: 'b (a is fixed at 10)', min: 1, max: 9, value: 4, onInput: draw });
  const w1 = h('div'); const w2 = h('div'); const o1 = readout(); const o2 = readout();
  el.append(card('', controls(bS), h('div', { class: 'row' }, h('div', {}, h('h3', { html: tex('a^2 - b^2 = (a+b)(a-b)') }), w1, o1), h('div', {}, h('h3', { html: tex('(a+b)^2 = a^2 + 2ab + b^2') }), w2, o2))));
  const c1 = new Canvas(w1, 480, 250), c2 = new Canvas(w2, 460, 250);
  function draw() {
    const a = 10, b = bS.value, u = 14;
    c1.clear();
    // left: a×a square with b×b corner removed (bottom-right)
    const x0 = 20, y0 = 30;
    c1.rect(x0, y0, a * u, (a - b) * u, { fill: 's1', opacity: 0.35, stroke: 's1' });           // top strip a × (a−b)
    c1.rect(x0, y0 + (a - b) * u, (a - b) * u, b * u, { fill: 's3', opacity: 0.35, stroke: 's3' }); // bottom-left (a−b) × b
    c1.rect(x0 + (a - b) * u, y0 + (a - b) * u, b * u, b * u, { fill: 'none', stroke: 'muted', width: 1 });
    c1.line(x0 + (a - b) * u, y0 + (a - b) * u, x0 + a * u, y0 + a * u, { color: 'muted', width: 1, dash: '3 3' });
    c1.text(x0 + (a - b / 2) * u, y0 + (a - b / 2) * u, `b²`, { size: 12, color: 'muted' });
    c1.text(x0 + a * u / 2, y0 + (a - b) * u / 2, 'a(a−b)', { size: 12, weight: 600 });
    c1.text(x0 + (a - b) * u / 2, y0 + (a - b) * u + b * u / 2, '(a−b)b', { size: 12, weight: 600 });
    c1.brace(x0, y0 - 10, x0 + a * u, y0 - 10, 'a', { offset: -10 });
    c1.text(x0 + a * u / 2, y0 + a * u + 16, 'a² minus the b² corner', { size: 11, color: 'muted' });
    // right: rearranged (a+b) × (a−b)
    const x1 = 200, y1 = 30;
    c1.rect(x1, y1, a * u, (a - b) * u, { fill: 's1', opacity: 0.35, stroke: 's1' });
    c1.rect(x1 + a * u, y1, b * u, (a - b) * u, { fill: 's3', opacity: 0.35, stroke: 's3' });
    c1.text(x1 + a * u / 2, y1 + (a - b) * u / 2, 'a(a−b)', { size: 12, weight: 600 });
    if (b * u > 34) c1.text(x1 + a * u + b * u / 2, y1 + (a - b) * u / 2, 'b(a−b)', { size: 11, weight: 600 });
    c1.brace(x1, y1 - 10, x1 + (a + b) * u, y1 - 10, 'a + b', { offset: -10 });
    c1.brace(x1 + (a + b) * u + 12, y1, x1 + (a + b) * u + 12, y1 + (a - b) * u, 'a − b', { offset: 18 });
    c1.text(x1 + (a + b) * u / 2, y1 + (a - b) * u + 16, 'green piece rotated and moved to the right', { size: 11, color: 'muted' });
    o1.innerHTML = `${tex(`${a}^2 - ${b}^2 = ${a * a - b * b}`)} and ${tex(`(${a}+${b})(${a}-${b}) = ${a + b}\\cdot${a - b} = ${(a + b) * (a - b)}`)}. Same area, so ${tex('x^2 - 25 = (x+5)(x-5)')}, ${tex('4x^2 - 9y^2 = (2x+3y)(2x-3y)')}, and even ${tex('(x+1)^2 - 16 = (x+1+4)(x+1-4) = (x+5)(x-3)')}.`;
    c2.clear();
    const x2 = 40, y2 = 30;
    const A2 = 14 - b; // choose a so a+b = 14 fits
    const uu = 13;
    c2.rect(x2, y2, A2 * uu, A2 * uu, { fill: 's1', opacity: 0.35, stroke: 's1' });
    c2.rect(x2 + A2 * uu, y2, b * uu, A2 * uu, { fill: 's3', opacity: 0.35, stroke: 's3' });
    c2.rect(x2, y2 + A2 * uu, A2 * uu, b * uu, { fill: 's3', opacity: 0.35, stroke: 's3' });
    c2.rect(x2 + A2 * uu, y2 + A2 * uu, b * uu, b * uu, { fill: 's2', opacity: 0.35, stroke: 's2' });
    c2.text(x2 + A2 * uu / 2, y2 + A2 * uu / 2, 'a²', { size: 14, weight: 600 });
    c2.text(x2 + A2 * uu + b * uu / 2, y2 + A2 * uu / 2, 'ab', { size: 12, weight: 600 });
    c2.text(x2 + A2 * uu / 2, y2 + A2 * uu + b * uu / 2, 'ab', { size: 12, weight: 600 });
    c2.text(x2 + A2 * uu + b * uu / 2, y2 + A2 * uu + b * uu / 2, 'b²', { size: 12, weight: 600 });
    c2.brace(x2, y2 - 10, x2 + A2 * uu, y2 - 10, 'a', { offset: -10 }); c2.brace(x2 + A2 * uu, y2 - 10, x2 + (A2 + b) * uu, y2 - 10, 'b', { offset: -10 });
    c2.text(x2 + 14 * uu + 90, y2 + 60, `two ab strips,`, { size: 12, color: 'text-2' }); c2.text(x2 + 14 * uu + 90, y2 + 78, `not one`, { size: 12, color: 'text-2' });
    o2.innerHTML = `With ${tex(`a=${A2}, b=${b}`)}: ${tex(`(${A2}+${b})^2 = ${(A2 + b) ** 2}`)} but ${tex(`${A2}^2 + ${b}^2 = ${A2 * A2 + b * b}`)}. The missing ${tex(`2ab = ${2 * A2 * b}`)} is the two green strips. Recognise the pattern when the middle term is twice the product of the square roots of the ends: ${tex('x^2 + 6x + 9 = (x+3)^2')}, ${tex('4x^2 - 12x + 9 = (2x-3)^2')}.`;
  }
  draw();
  el.append(card('', h('h3', {}, 'The factoring checklist (in this order)'), h('ol', {},
    h('li', { html: `<b>Common factor first.</b> ${tex('6x^2 - 24 = 6(x^2 - 4) = 6(x-2)(x+2)')}. Pulling it out first makes everything after it smaller.` }),
    h('li', { html: `<b>Two terms?</b> Look for a difference of squares. (A <i>sum</i> of squares ${tex('x^2+9')} does not factor over the reals.)` }),
    h('li', { html: `<b>Three terms?</b> Check for a perfect square, otherwise use the box (3.1).` }),
    h('li', { html: `<b>Something repeated?</b> Substitute: ${tex('(x-2)^2 - 5(x-2) + 6')} with ${tex('u = x-2')} becomes ${tex('u^2 - 5u + 6 = (u-2)(u-3) = (x-4)(x-5)')}. The pattern doesn't care what's inside.` }))));
}

/* ---------- 3.3 ---------- */
function s33(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `<b>Zero-product property:</b> if ${tex('P\\cdot Q = 0')} then ${tex('P=0')} or ${tex('Q=0')}. Nothing else multiplies to zero. That is why factoring solves equations — each factor becomes its own tiny equation. It only works for <b>zero</b>: ${tex('(x-1)(x-2) = 6')} tells you nothing about the factors (${tex('1\\cdot6,\\ 2\\cdot3,\\ -1.5\\cdot -4\\ldots')}). Graphically, roots are where the parabola crosses the x-axis, and each factor ${tex('(x - r)')} plants a crossing at ${tex('x = r')}.` })));
  const a = slider({ label: 'a (stretch)', min: -3, max: 3, step: 0.5, value: 1, onInput: update });
  const r1 = slider({ label: 'root r₁', min: -6, max: 6, step: 0.5, value: -1, onInput: update });
  const r2 = slider({ label: 'root r₂', min: -6, max: 6, step: 0.5, value: 3, onInput: update });
  const mode = chips({ options: [{ value: 0, label: '= 0 (roots)' }, { value: 6, label: '= 6 (the trap)' }], value: 0, onChange: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, r1, r2), mode.el, h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { xmin: -8, xmax: 8, ymin: -10, ymax: 12, height: 400 });
  function update() {
    const A = a.value || 0.5, R1 = r1.value, R2 = r2.value, k = +mode.value;
    const B = -A * (R1 + R2), C = A * R1 * R2;
    p.clear();
    drawQuadratic(p, A, B, C, { vertex: false, axis: false, yint: false, roots: k === 0 });
    const f = x => A * (x - R1) * (x - R2);
    let html = `<div class="big">${tex(`${A === 1 ? '' : A === -1 ? '-' : A}(x ${R1 < 0 ? '+' : '-'} ${Math.abs(R1)})(x ${R2 < 0 ? '+' : '-'} ${Math.abs(R2)}) = ${k}`)}</div><div>Expanded: ${tex(`${polyTex(A, B, C)} = ${k}`)}</div>`;
    if (k === 0) {
      html += `<div>Either ${tex(`x ${R1 < 0 ? '+' : '-'} ${Math.abs(R1)} = 0`)} → ${tex(`x = ${fmtT(R1)}`)}, or ${tex(`x ${R2 < 0 ? '+' : '-'} ${Math.abs(R2)} = 0`)} → ${tex(`x = ${fmtT(R2)}`)}.</div><p class="small">Change a: the crossings don't move. The stretch factor changes the shape but never where the factors are zero. ${R1 === R2 ? 'With r₁ = r₂ the parabola just touches the axis: one repeated root.' : ''}</p>`;
    } else {
      p.hline(6, { color: 's2', width: 1.5 });
      const rr = quadraticRoots(A, B, C - 6);
      for (const x of rr) p.point(x, 6, { color: 's2', label: `x = ${fmt(x, 3)}`, pos: 'n' });
      html += `<div class="bad">Setting each factor to 6 gives x = ${fmtT(R1 + 6)} and x = ${fmtT(R2 + 6)}, which are <b>wrong</b>: check ${tex(`f(${fmtT(R1 + 6)}) = ${fmt(f(R1 + 6))}`)}.</div><div>The real solutions are where the parabola meets the line ${tex('y=6')}: ${rr.length ? rr.map(x => `x ≈ ${fmt(x, 3)}`).join(', ') : 'nowhere — no solution'}. To use factoring you must first move everything to one side: ${tex(`${polyTex(A, B, C - 6)} = 0`)}, then factor <i>that</i>.</div>`;
    }
    out.innerHTML = html;
  }
  update();
}

/* ---------- 3.4 ---------- */
function s34(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `If the equation looks like ${tex('(\\text{something})^2 = k')}, you don't need factoring: take the square root of both sides, remembering <b>both</b> signs — ${tex('\\text{something} = \\pm\\sqrt k')}. And <i>every</i> quadratic can be pushed into that shape by <b>completing the square</b>: ${tex('x^2 + bx')} is a square of side ${tex('x + \\tfrac b2')} with a corner ${tex('\\left(\\tfrac b2\\right)^2')} missing. Add the corner to both sides and the left side becomes a perfect square.` })));
  const pS = slider({ label: 'p  in (x − p)² = k', min: -5, max: 5, value: 2, onInput: draw });
  const kS = slider({ label: 'k', min: -4, max: 12, value: 5, onInput: draw });
  const gw = h('div'); const out = readout();
  el.append(card('', h('h3', { html: `Solve ${tex('(x-p)^2 = k')} by square roots` }), controls(pS, kS), legend([['c1', 'y = (x − p)²'], ['c2', 'y = k']]), h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { xmin: -8, xmax: 8, ymin: -5, ymax: 14, height: 360 });
  function draw() {
    const P = pS.value, K = kS.value; p.clear();
    drawQuadratic(p, 1, -2 * P, P * P, { yint: false, roots: false, labels: true });
    p.hline(K, { color: 's2', width: 1.5 });
    if (K >= 0) {
      const s = Math.sqrt(K);
      p.point(P - s, K, { color: 's3', label: `p − √k ≈ ${fmt(P - s, 3)}`, pos: 'nw' }); p.point(P + s, K, { color: 's3', label: `p + √k ≈ ${fmt(P + s, 3)}`, pos: 'ne' });
      p.segment(P, K, P + s, K, { color: 's3', width: 3 }); p.segment(P, K, P - s, K, { color: 's3', width: 3 });
      const sr = simplifyRadical(K);
      out.innerHTML = `<div class="big">${tex(`(x ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 = ${K}`)}</div><div>${tex(`x ${P < 0 ? '+' : '-'} ${Math.abs(P)} = \\pm\\sqrt{${K}}`)}</div><div class="big">${tex(`x = ${P} \\pm ${K === 0 ? '0' : radicalTex(sr.coef, sr.rad)}`)}${sr.rad === 1 ? ` → ${tex(`x = ${P - sr.coef},\\ ${P + sr.coef}`)}` : ` ≈ ${fmt(P - s, 3)}, ${fmt(P + s, 3)}`}</div><p class="small">The two answers sit symmetrically, ${tex('\\sqrt k')} either side of the axis ${tex(`x = ${P}`)}. That symmetry is the ± sign. ${K === 0 ? 'k = 0: the line touches the vertex — one repeated root.' : ''}</p>`;
    } else {
      out.innerHTML = `<div class="big">${tex(`(x ${P < 0 ? '+' : '-'} ${Math.abs(P)})^2 = ${K}`)}</div><p class="bad">A square is never negative, so nothing squared gives ${K}. The line sits below the vertex: <b>no real solution</b>.</p>`;
    }
  }
  draw();

  // completing the square picture
  const bS = slider({ label: 'b  in x² + bx', min: 1, max: 12, value: 6, onInput: cs });
  const cS = slider({ label: 'c  in x² + bx + c = 0', min: -20, max: 20, value: -7, onInput: cs });
  const cw = h('div'); const co = readout();
  el.append(card('', h('h3', {}, 'Completing the square, literally'), controls(bS, cS), h('div', { class: 'row' }, cw, co)));
  const cv = new Canvas(cw, 420, 280);
  function cs() {
    const B = bS.value, C = cS.value; cv.clear();
    const X = 120, hb = B / 2 * 12, x0 = 50, y0 = 40;
    cv.rect(x0, y0, X, X, { fill: 's1', opacity: 0.3, stroke: 's1' }); cv.text(x0 + X / 2, y0 + X / 2, 'x²', { size: 16, weight: 600 });
    cv.rect(x0 + X, y0, hb, X, { fill: 's3', opacity: 0.3, stroke: 's3' }); cv.text(x0 + X + hb / 2, y0 + X / 2, `${B / 2}x`, { size: 12, weight: 600 });
    cv.rect(x0, y0 + X, X, hb, { fill: 's3', opacity: 0.3, stroke: 's3' }); cv.text(x0 + X / 2, y0 + X + hb / 2, `${B / 2}x`, { size: 12, weight: 600 });
    cv.rect(x0 + X, y0 + X, hb, hb, { fill: 's2', opacity: 0.3, stroke: 's2', width: 1.5 }); cv.text(x0 + X + hb / 2, y0 + X + hb / 2, `(${B / 2})²`, { size: 11, weight: 600 });
    cv.brace(x0, y0 - 12, x0 + X + hb, y0 - 12, `x + ${B / 2}`, { offset: -10 });
    cv.text(x0 + X + hb + 100, y0 + 60, `x² + ${B}x is this L-shape;`, { size: 12, color: 'text-2' });
    cv.text(x0 + X + hb + 100, y0 + 78, `split bx into two strips`, { size: 12, color: 'text-2' });
    cv.text(x0 + X + hb + 100, y0 + 96, `and the missing corner is (b/2)²`, { size: 12, color: 'text-2' });
    const half = B / 2, corner = half * half, K = corner - C;
    let html = `<ol class="steps"><li>${tex(`x^2 + ${B}x ${C < 0 ? '-' : '+'} ${Math.abs(C)} = 0`)}</li><li>Move the constant: ${tex(`x^2 + ${B}x = ${-C}`)}</li><li>Add the corner ${tex(`(\\tfrac{${B}}{2})^2 = ${corner}`)} to both sides: ${tex(`x^2 + ${B}x + ${corner} = ${K}`)}</li><li>Left side is now a square: ${tex(`(x + ${half})^2 = ${K}`)}</li>`;
    if (K >= 0) { const sr = simplifyRadical(K) || { coef: 0, rad: 1 }; html += `<li>${tex(`x + ${half} = \\pm\\sqrt{${K}}`)} → ${tex(`x = -${half} \\pm ${K === 0 ? 0 : radicalTex(sr.coef, sr.rad)}`)} ≈ ${fmt(-half - Math.sqrt(K), 3)}, ${fmt(-half + Math.sqrt(K), 3)}</li>`; }
    else html += `<li class="bad">${tex(`(x+${half})^2 = ${K} < 0`)}: no real solution.</li>`;
    co.innerHTML = html + '</ol>';
  }
  cs();
}

/* ---------- 3.5 ---------- */
function s35(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `The quadratic formula is <b>completing the square done once, for every equation at the same time</b>. Read it as two pieces: ${tex('x = \\underbrace{-\\tfrac{b}{2a}}_{\\text{axis of symmetry}} \\pm \\underbrace{\\tfrac{\\sqrt{b^2-4ac}}{2a}}_{\\text{half-distance between roots}}')}. The roots sit symmetrically about the vertex; the formula just says "go to the middle, then step left and right by the same amount".` })));
  const a = slider({ label: 'a', min: -4, max: 4, value: 1, onInput: update });
  const b = slider({ label: 'b', min: -10, max: 10, value: -2, onInput: update });
  const c = slider({ label: 'c', min: -10, max: 10, value: -4, onInput: update });
  const gw = h('div'); const out = readout();
  el.append(card('', controls(a, b, c), h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 380 });
  function update() {
    const A = a.value || 1, B = b.value, C = c.value;
    p.setBounds(autoBounds(A, B, C)); p.clear();
    const { vx } = drawQuadratic(p, A, B, C, { yint: false });
    const D = discriminant(A, B, C);
    let html = `<div class="big">${tex(`${polyTex(A, B, C)} = 0`)}</div><div>${tex(`x = \\frac{-(${B}) \\pm \\sqrt{(${B})^2 - 4(${A})(${C})}}{2(${A})} = \\frac{${-B} \\pm \\sqrt{${D}}}{${2 * A}}`)}</div>`;
    if (D >= 0) {
      const s = Math.sqrt(D), half = s / (2 * Math.abs(A));
      p.segment(vx, 0, vx + half, 0, { color: 's2', width: 4 }); p.segment(vx, 0, vx - half, 0, { color: 's2', width: 4 });
      p.point(vx, 0, { color: 's4', r: 4, label: `middle −b/2a = ${fmt(vx, 3)}`, pos: A > 0 ? 'n' : 's' });
      const ex = exactRootsTex(A, B, C);
      const sr = simplifyRadical(D);
      html += `<div>${sr && sr.coef > 1 && sr.rad > 1 ? `${tex(`\\sqrt{${D}} = ${radicalTex(sr.coef, sr.rad)}`)}, so ` : ''}${tex(`x = ${ex.join(',\\; ')}`)}</div>`;
      html += `<div class="big">middle ${tex(`-\\tfrac{b}{2a} = ${fmt(vx, 3)}`)}, half-width ${tex(`\\tfrac{\\sqrt{D}}{2|a|} = ${fmt(half, 3)}`)} → ${tex(`x \\approx ${fmt(vx - half, 3)},\\ ${fmt(vx + half, 3)}`)}</div>`;
    } else {
      html += `<div class="bad">${tex(`\\sqrt{${D}}`)} is not real: the half-width doesn't exist, the parabola never reaches the x-axis. No real roots.</div>`;
    }
    out.innerHTML = html;
  }
  update();
  el.append(card('', h('h3', {}, 'Where it comes from (complete the square on the general equation)'), h('ol', { class: 'steps' },
    h('li', { html: tex('ax^2 + bx + c = 0') }),
    h('li', { html: `Divide by a: ${tex('x^2 + \\tfrac{b}{a}x = -\\tfrac{c}{a}')}` }),
    h('li', { html: `Add the corner ${tex('\\left(\\tfrac{b}{2a}\\right)^2')} to both sides: ${tex('x^2 + \\tfrac{b}{a}x + \\tfrac{b^2}{4a^2} = \\tfrac{b^2}{4a^2} - \\tfrac{c}{a}')}` }),
    h('li', { html: `Left side is a square, right side over a common denominator: ${tex('\\left(x + \\tfrac{b}{2a}\\right)^2 = \\tfrac{b^2 - 4ac}{4a^2}')}` }),
    h('li', { html: `Square root both sides (±!): ${tex('x + \\tfrac{b}{2a} = \\pm\\tfrac{\\sqrt{b^2-4ac}}{2a}')}` }),
    h('li', { html: `Isolate x: ${tex('x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')}. Step 4 is where ${tex('b^2-4ac')} is born — it is what's left under the root, which is why its sign decides everything (3.6).` }))));
}

/* ---------- 3.6 ---------- */
function s36(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `${tex('D = b^2 - 4ac')} is the thing under the square root. It tells you how many real roots there are <i>without solving</i>: positive → two, zero → one (a double root, the vertex touches the axis), negative → none. Geometrically, ${tex('D')} measures how far the vertex is from the x-axis, in the parabola's own units: the vertex height is ${tex('-\\tfrac{D}{4a}')}. Bonus: when ${tex('D')} is a perfect square the roots are rational and the trinomial factors over the integers.` })));
  const a = slider({ label: 'a', min: -4, max: 4, value: 1, onInput: update });
  const b = slider({ label: 'b', min: -10, max: 10, value: 4, onInput: update });
  const c = slider({ label: 'c', min: -12, max: 12, value: 1, onInput: update });
  const gw = h('div'); const out = readout(); const strip = h('div');
  el.append(card('', controls(a, b, c), h('div', { class: 'row' }, gw, out)));
  const p = new Plot(gw, { height: 380 });
  function update() {
    const A = a.value || 1, B = b.value, C = c.value, D = discriminant(A, B, C);
    p.setBounds(autoBounds(A, B, C)); p.clear();
    const { vx, vy } = drawQuadratic(p, A, B, C, { yint: false });
    p.segment(vx, 0, vx, vy, { color: 's2', width: 3 });
    const n = D > 0 ? 2 : D === 0 ? 1 : 0;
    out.innerHTML = `<div class="big">${tex(`D = b^2 - 4ac = (${B})^2 - 4(${A})(${C}) = ${D}`)}</div>
      <div class="big">${D > 0 ? '<span class="ok">D > 0 → two distinct real roots</span>' : D === 0 ? '<span class="c4">D = 0 → exactly one real root (repeated)</span>' : '<span class="bad">D < 0 → no real roots</span>'}</div>
      <div>${D > 0 ? (isSquare(D) ? `${D} is a perfect square (${Math.sqrt(D)}²), so the roots are <b>rational</b>: ${tex(`x = ${exactRootsTex(A, B, C).join(',\\ ')}`)}, and ${tex(polyTex(A, B, C))} factors over the integers.` : `${D} is not a perfect square, so the roots are <b>irrational</b>: ${tex(`x = ${exactRootsTex(A, B, C).join(',\\ ')}`)}. No integer factoring exists.`) : ''}</div>
      <p class="small">Vertex height ${tex(`= -\\tfrac{D}{4a} = ${fmt(-D / (4 * A), 3)}`)} (orange segment). ${A > 0 ? 'Opens up' : 'Opens down'}: the vertex is ${A > 0 ? 'below' : 'above'} the axis exactly when ${tex('D > 0')}. Slide c: raising the parabola shrinks D by 4a per unit, and the two roots slide together, merge, then vanish.</p>`;
  }
  update();
  // three cases strip
  const w = h('div', { class: 'grid-2' });
  for (const [cc, title] of [[-3, 'D > 0: two roots'], [0, 'D = 0: one (double) root'], [3, 'D < 0: no real roots']]) {
    const box = h('div'); w.append(h('div', {}, h('div', { class: 'small' }, title), box));
    const q = new Plot(box, { xmin: -5, xmax: 5, ymin: -5, ymax: 8, height: 200, ticks: false });
    drawQuadratic(q, 1, 0, cc, { yint: false, axis: false, labels: false });
  }
  el.append(card('', h('h3', {}, 'The three cases, side by side'), w, h('p', { class: 'small', html: `Same shape ${tex('y = x^2 + c')}, just at three heights. Nothing about the parabola changed except where it sits relative to the axis.` })));
}

export default {
  num: 3, title: 'Solving Quadratic Equations',
  tagline: 'Every method — factoring, square roots, completing the square, the formula — finds where a parabola crosses the x-axis. They are one idea in four outfits.',
  bigIdea: {
    title: 'Roots live symmetrically around the vertex: middle ± half-width',
    render(el) {
      el.append(h('p', { html: `A parabola is symmetric, so its two roots are the same distance either side of its axis ${tex('x = -\\tfrac{b}{2a}')}. That single fact is the quadratic formula: ${tex('x = -\\tfrac{b}{2a} \\pm \\tfrac{\\sqrt{b^2-4ac}}{2a}')}. Factoring finds the roots directly when they're nice numbers; completing the square finds the middle and the half-width by hand; the formula is completing the square done once and for all; the discriminant ${tex('b^2-4ac')} is just what's under the root — its sign says whether the half-width exists.` }));
      const gw = h('div'); el.append(gw);
      const p = new Plot(gw, { xmin: -3, xmax: 7, ymin: -6, ymax: 8, height: 300 });
      const { vx } = drawQuadratic(p, 1, -4, -1, { yint: false });
      const half = Math.sqrt(20) / 2;
      p.segment(vx, 0, vx + half, 0, { color: 's2', width: 4 }); p.segment(vx, 0, vx - half, 0, { color: 's2', width: 4 });
      p.label(vx + half / 2, 0.2, '√D / 2a', { pos: 'n', color: 's2' }); p.label(vx - half / 2, 0.2, '√D / 2a', { pos: 'n', color: 's2' });
      p.label(vx, 1.2, '−b / 2a', { pos: 'n', color: 's4' });
    }
  },
  sections: [
    { id: '3.1', title: 'Factoring Trinomials of the Form ax² + bx + c', blurb: 'Un-multiply a rectangle. "Product ac, sum b" is the geometry of the box, not a trick.', render: s31 },
    { id: '3.2', title: 'Factoring Polynomial Expressions', blurb: 'Difference of squares and perfect squares — as pictures you can rearrange.', render: s32 },
    { id: '3.3', title: 'Solving Quadratic Equations by Factoring', blurb: 'Zero-product property: each factor plants a crossing on the x-axis. It only works for zero.', render: s33 },
    { id: '3.4', title: 'Using Square Roots to Solve Quadratic Equations', blurb: '(something)² = k → something = ±√k. Completing the square makes every quadratic look like that.', render: s34 },
    { id: '3.5', title: 'Developing and Applying the Quadratic Formula', blurb: 'The formula is "middle ± half-width", and it is completing the square done once for all equations.', render: s35 },
    { id: '3.6', title: 'Interpreting the Discriminant', blurb: 'What is under the root decides how many roots there are — and whether they are rational.', render: s36 },
  ],
};
