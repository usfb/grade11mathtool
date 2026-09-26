import { h, tex, dtex, slider, numberInput, textInput, chips, card, controls, readout, legend, quiz } from '../lib/ui.js';
import { Plot, Canvas } from '../lib/graph.js';
import { gcd, isSquare, isCube, nthRootInt, primeFactors, simplifyRadical, radicalTex, fmt, fmtT, parseReal, fracTex } from '../lib/math.js';

const fracOf = (k, den = 6) => { // k in multiples of 1/den → TeX fraction
  const n = Math.round(k * den); const g = gcd(n, den) || 1; const a = n / g, b = den / g;
  return b === 1 ? String(a) : `${a < 0 ? '-' : ''}\\tfrac{${Math.abs(a)}}{${b}}`;
};

/* ---------- 1.1 ---------- */
function s11(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `A square root is a <b>side length</b>. ${tex('\\sqrt{\\tfrac{4}{9}}')} asks: <i>what side gives a square of area ${tex('\\tfrac{4}{9}')}?</i> A cube root is an <b>edge length</b> of a cube. Because area and volume of a fraction of a square/cube scale by the square/cube of the edge, ${tex('\\sqrt{\\tfrac{a}{b}} = \\tfrac{\\sqrt a}{\\sqrt b}')} and ${tex('\\sqrt[3]{\\tfrac{a}{b}} = \\tfrac{\\sqrt[3]{a}}{\\sqrt[3]{b}}')}.` })));

  const num = numberInput({ label: 'numerator', value: 4, min: 1, max: 1000, onInput: update });
  const den = numberInput({ label: 'denominator', value: 9, min: 1, max: 1000, onInput: update });
  const idx = chips({ options: [{ value: 2, label: 'square root √' }, { value: 3, label: 'cube root ∛' }], value: 2, onChange: update });
  const picWrap = h('div'); const out = readout();
  el.append(card('', controls(num, den, idx), h('div', { class: 'row' }, picWrap, out)));
  const cv = new Canvas(picWrap, 420, 320);

  function update() {
    const k = +idx.value; let n = Math.round(num.value), d = Math.round(den.value);
    if (n < 1 || d < 1) return;
    const g = gcd(n, d); const rn = n / g, rd = d / g;
    const rootSym = k === 2 ? '\\sqrt' : '\\sqrt[3]';
    const rootN = nthRootInt(rn, k), rootD = nthRootInt(rd, k);
    let html = '';
    if (g > 1) html += `<div>Reduce first: ${tex(`\\tfrac{${n}}{${d}} = \\tfrac{${rn}}{${rd}}`)}</div>`;
    html += `<div class="big">${tex(`${rootSym}{\\tfrac{${rn}}{${rd}}} = \\frac{${rootSym}{${rn}}}{${rootSym}{${rd}}}`)}</div>`;
    if (rootN !== null && rootD !== null) {
      html += `<div class="big">${tex(`= \\frac{${rootN}}{${rootD}}`)} ${rootD === 1 ? '' : `≈ ${fmt(rootN / rootD, 4)}`}</div><p>Both numbers are perfect ${k === 2 ? 'squares' : 'cubes'}, so the answer is an exact fraction.</p>`;
    } else {
      const sN = simplifyRadical(rn, k), sD = simplifyRadical(rd, k);
      html += `<div class="big">${tex(`= \\frac{${radicalTex(sN.coef, sN.rad, k)}}{${radicalTex(sD.coef, sD.rad, k)}}`)} ≈ ${fmt(Math.pow(rn / rd, 1 / k), 4)}</div>`;
      const v = rn / rd; const lo = Math.floor(Math.pow(v, 1 / k)), hi = lo + 1;
      html += `<p>Not a perfect ${k === 2 ? 'square' : 'cube'} fraction, so the root is irrational. Estimate: ${tex(`${lo}^${k} = ${lo ** k} \\le ${fmt(v, 3)} \\le ${hi ** k} = ${hi}^${k}`)}, so the root lies between ${lo} and ${hi}.</p>`;
    }
    out.innerHTML = html;
    draw(k, rn, rd, rootN, rootD);
  }

  function draw(k, rn, rd, rootN, rootD) {
    cv.clear();
    if (k === 2) {
      const S = 260, x0 = 60, y0 = 30;
      cv.rect(x0, y0, S, S, { fill: 'none', stroke: 'muted' });
      if (rootD !== null && rootD <= 40) {
        const cell = S / rootD;
        for (let i = 0; i < rootD; i++) for (let j = 0; j < rootD; j++) {
          const shaded = rootN !== null && i < rootN && j < rootN;
          cv.rect(x0 + i * cell, y0 + S - (j + 1) * cell, cell, cell, { fill: shaded ? 's1' : 'none', stroke: 'axis', width: 0.8, opacity: shaded ? 0.85 : 1 });
        }
        if (rootN !== null) {
          const side = rootN * cell;
          cv.brace(x0, y0 + S + 14, x0 + side, y0 + S + 14, `side = ${rootN}/${rootD}`, { color: 's1', offset: 12 });
          cv.text(x0 + side / 2, y0 + S - side / 2, `area ${rn}/${rd}`, { color: '#fff', size: 14, weight: 700 });
        } else {
          // shade approximate area as a square with fractional side
          const side = Math.sqrt(rn / rd) * S;
          cv.rect(x0, y0 + S - side, side, side, { fill: 's2', opacity: 0.5 });
          cv.text(x0 + side / 2, y0 + S - side / 2, `area ${rn}/${rd}`, { size: 13, weight: 700, bg: true });
          cv.brace(x0, y0 + S + 14, x0 + side, y0 + S + 14, `side ≈ ${fmt(Math.sqrt(rn / rd), 3)}`, { color: 's2' });
        }
        cv.text(x0 + S / 2, y0 - 12, `big square: side 1, area 1, cut into ${rootD}×${rootD} cells of area 1/${rd}`, { size: 12, color: 'text-2' });
      } else {
        const side = Math.sqrt(rn / rd) * S;
        if (side <= S) cv.rect(x0, y0 + S - side, side, side, { fill: 's2', opacity: 0.5 });
        cv.text(x0 + S / 2, y0 - 12, `denominator ${rd} is not a perfect square: no clean grid`, { size: 12, color: 'text-2' });
        cv.brace(x0, y0 + S + 14, x0 + Math.min(side, S), y0 + S + 14, `side ≈ ${fmt(Math.sqrt(rn / rd), 3)}`, { color: 's2' });
      }
      cv.brace(x0 + S + 14, y0 + S, x0 + S + 14, y0, 'side 1', { color: 'muted' });
    } else {
      // isometric cube
      const E = 170, ox = 120, oy = 250;
      const cube = (e, fills, op) => {
        const ax = 0.87 * e, ay = 0.5 * e; // iso projection of the depth axis
        const P = (x, y, z) => [ox + x + ax * z, oy - y - ay * z]; // x right, y up, z depth (right-up)
        cv.poly([P(0, 0, 0), P(e, 0, 0), P(e, e, 0), P(0, e, 0)], { fill: fills[0], opacity: op, stroke: 'text-2', width: 1 });   // front
        cv.poly([P(0, e, 0), P(e, e, 0), P(e, e, 1), P(0, e, 1)].map(p => p), { fill: fills[1], opacity: op, stroke: 'text-2', width: 1 }); // top (uses z=1 → scaled below)
        cv.poly([P(e, 0, 0), P(e, 0, 1), P(e, e, 1), P(e, e, 0)], { fill: fills[2], opacity: op, stroke: 'text-2', width: 1 });   // right
      };
      // Since P uses z*e scaling implicitly via ax = 0.87e, pass z in {0,1}
      cube(E, ['none', 'none', 'none'], 1);
      const ratio = rootN !== null && rootD !== null ? rootN / rootD : Math.cbrt(rn / rd);
      if (ratio <= 1) cube(E * ratio, ['s1', 's3', 's4'], 0.85);
      cv.text(ox + E / 2, oy + 22, ratio <= 1 ? (rootN !== null && rootD !== null ? `edge = ${rootN}/${rootD}` : `edge ≈ ${fmt(ratio, 3)}`) : 'fraction > 1: inner cube bigger than unit cube', { size: 13, color: 's1', weight: 600 });
      cv.text(ox + E + 40, oy - E - 60, 'unit cube: edge 1, volume 1', { size: 12, color: 'text-2' });
      cv.text(ox + E / 2, oy - E / 2, `volume ${rn}/${rd}`, { size: 13, weight: 700, bg: true, color: 'text' });
    }
  }
  update();
  el.append(card('', quiz(() => {
    const roots = [[2, 3], [3, 4], [1, 5], [5, 6], [2, 7], [3, 10], [4, 9], [7, 8]]; const [p, q] = roots[Math.floor(Math.random() * roots.length)];
    const k = Math.random() < 0.6 ? 2 : 3;
    return { prompt: `Evaluate ${tex(`${k === 2 ? '\\sqrt' : '\\sqrt[3]'}{\\tfrac{${p ** k}}{${q ** k}}}`)} (answer as a fraction like 2/3).`, answer: `${p}/${q}`, hint: `Take the ${k === 2 ? 'square' : 'cube'} root of top and bottom separately.`, explain: `${tex(`\\tfrac{${p}}{${q}}`)} because ${tex(`${p}^${k} = ${p ** k}`)} and ${tex(`${q}^${k} = ${q ** k}`)}.` };
  })));
}

/* ---------- 1.2 ---------- */
function s12(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `The number sets are <b>nested boxes</b>: every natural number is whole, every whole number is an integer, every integer is rational. Rational means <i>can be written as a ratio of integers</i> ${tex('\\tfrac{p}{q}')}. Everything on the number line that can't is <b>irrational</b> — and together they fill the line completely: the <b>real numbers</b>.` })));
  const inp = textInput({ label: 'Type a number (try −3, 0.75, 2/5, √2, √9, π, 0.3...)', value: '√2', width: '320px', onInput: update });
  const ex = chips({ options: ['7', '0', '−4', '2/5', '0.75', '0.3...', '√2', '√9', '∛27', 'π', '−√16', '22/7'], value: '√2', onChange: v => { inp.value = v; update(); } });
  const boxWrap = h('div'); const lineWrap = h('div'); const out = readout();
  el.append(card('', controls(inp), ex, h('div', { class: 'row' }, boxWrap, h('div', {}, lineWrap, out))));
  const cv = new Canvas(boxWrap, 460, 320);
  const line = new Plot(lineWrap, { xmin: -6, xmax: 6, ymin: -1, ymax: 1, height: 90, grid: false, yticks: false, ylabel: '', xlabel: '' });

  const KINDS = ['natural', 'whole', 'integer', 'rational', 'real'];
  function update() {
    const r = parseReal(inp.value);
    cv.clear();
    const on = new Set();
    let chain = [];
    if (r) {
      if (r.kind === 'irrational') chain = ['irrational', 'real'];
      else if (r.kind === 'rational') chain = ['rational', 'real'];
      else if (r.kind === 'integer') chain = r.value > 0 ? ['natural', 'whole', 'integer', 'rational', 'real'] : r.value === 0 ? ['whole', 'integer', 'rational', 'real'] : ['integer', 'rational', 'real'];
      chain.forEach(k => on.add(k));
    }
    const box = (x, y, w, h_, name, sym, key) => {
      cv.rect(x, y, w, h_, { fill: on.has(key) ? 's1' : 'none', opacity: on.has(key) ? 0.13 : 1, stroke: on.has(key) ? 's1' : 'muted', width: on.has(key) ? 2.2 : 1, rx: 8 });
      cv.text(x + 10, y + 14, `${name} ${sym}`, { anchor: 'start', size: 12, weight: on.has(key) ? 700 : 500, color: on.has(key) ? 's1' : 'text-2' });
    };
    box(6, 6, 448, 308, 'Real numbers', 'ℝ', 'real');
    box(18, 30, 270, 276, 'Rational', 'ℚ', 'rational');
    box(30, 54, 246, 230, 'Integers', 'ℤ', 'integer');
    box(42, 78, 222, 184, 'Whole', 'W', 'whole');
    box(54, 102, 198, 138, 'Natural', 'ℕ', 'natural');
    box(300, 30, 142, 276, 'Irrational', '', 'irrational');
    cv.text(153, 175, '1, 2, 3, …', { size: 12, color: 'muted' });
    cv.text(153, 251, '0', { size: 12, color: 'muted' });
    cv.text(153, 273, '−1, −2, −3, …', { size: 12, color: 'muted' });
    cv.text(153, 295, '½, −0.75, 0.3̄, 22/7', { size: 11, color: 'muted' });
    cv.text(371, 170, '√2, π, ∛5,', { size: 11, color: 'muted' });
    cv.text(371, 186, '0.1010010001…', { size: 11, color: 'muted' });
    line.clear();
    if (!r) { out.innerHTML = '<span class="bad">Can\'t read that yet. Try one of the chips.</span>'; return; }
    const v = r.value;
    if (Math.abs(v) > 5.5) line.setBounds({ xmin: -Math.abs(v) - 2, xmax: Math.abs(v) + 2 }); else line.setBounds({ xmin: -6, xmax: 6 });
    line.point(v, 0, { color: r.kind === 'irrational' ? 's2' : 's1', label: `≈ ${fmt(v, 4)}`, pos: 'n' });
    out.innerHTML = `<div class="big">${tex(r.tex)} is ${r.kind === 'irrational' ? '<b class="c2">irrational</b>' : r.kind === 'rational' ? '<b class="c1">rational</b>' : '<b class="c1">' + chain[0] + '</b>'}, so it belongs to: <b>${chain.join(' ⊂ ')}</b></div>${r.why ? `<p>${r.why}</p>` : ''}`;
  }
  update();

  // √2 squeeze
  const wrap = h('div'); const sq = readout();
  const prec = slider({ label: 'decimal places', min: 0, max: 5, value: 1, onInput: squeeze });
  el.append(card('', h('h3', {}, 'Why √2 is not a fraction: the squeeze that never ends'),
    h('p', { html: `A rational number's decimal either <b>stops</b> or <b>repeats</b>. Watch √2 get trapped between two decimals at every precision — it never lands on a grid point, no matter how fine the grid.` }),
    controls(prec), wrap, sq));
  const zp = new Plot(wrap, { height: 110, grid: false, ylabel: '', xlabel: '', ymin: -1, ymax: 1 });
  function squeeze() {
    const p = prec.value, step = 10 ** -p; const lo = Math.floor(Math.SQRT2 / step) * step, hi = lo + step;
    zp.setBounds({ xmin: lo - step * 0.5, xmax: hi + step * 0.5, ticks: false }); zp.clear();
    for (let i = 0; i <= 10; i++) { const x = lo + i * step / 10; zp.segment(x, -0.25, x, 0.25, { color: 'muted', width: 1 }); }
    zp.label(lo, -0.3, lo.toFixed(p), { pos: 's' }); zp.label(hi, -0.3, hi.toFixed(p), { pos: 's' });
    zp.point(Math.SQRT2, 0, { color: 's2', label: '√2', pos: 'n' });
    sq.innerHTML = `<div class="big">${tex(`${lo.toFixed(p)}^2 = ${fmtT(lo * lo, 2 * p)} \\;<\\; 2 \\;<\\; ${fmtT(hi * hi, 2 * p)} = ${hi.toFixed(p)}^2`)}</div><p>So ${tex(`${lo.toFixed(p)} < \\sqrt2 < ${hi.toFixed(p)}`)}. Zoom in (more decimal places) and it is <i>still</i> strictly between two grid points. The proof that this goes on forever: if ${tex('\\sqrt2 = p/q')} in lowest terms, then ${tex('p^2 = 2q^2')} makes ${tex('p')} even, which makes ${tex('q')} even too — contradicting "lowest terms".</p>`;
  }
  squeeze();
}

/* ---------- 1.3 ---------- */
function s13(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `${tex('\\sqrt{ab} = \\sqrt a\\,\\sqrt b')}. So if a radicand hides a <b>perfect square factor</b>, that factor can walk out from under the root: ${tex('\\sqrt{72} = \\sqrt{36\\cdot 2} = 6\\sqrt2')}. An <b>entire</b> radical has everything inside; a <b>mixed</b> radical has a coefficient outside. They are the <i>same length</i> — the picture below proves it.` })));
  const n = numberInput({ label: 'radicand n', value: 72, min: 2, max: 2000, onInput: update });
  const idx = chips({ options: [{ value: 2, label: '√ (pairs)' }, { value: 3, label: '∛ (triples)' }], value: 2, onChange: update });
  const tilesWrap = h('div'); const barWrap = h('div'); const out = readout();
  el.append(card('', controls(n, idx), h('div', { class: 'row' }, h('div', {}, h('h3', {}, 'Prime factors, grouped'), tilesWrap, out), h('div', {}, h('h3', {}, 'Same length, two names'), barWrap))));
  const cv = new Canvas(barWrap, 440, 170);

  function update() {
    const k = +idx.value, N = Math.round(n.value); if (N < 2) return;
    const s = simplifyRadical(N, k);
    tilesWrap.innerHTML = '';
    const row = h('div', { class: 'tiles' });
    for (const g of s.groups) {
      for (let i = 0; i < g.e; i++) {
        const inGroup = i < g.out * k;
        row.append(h('div', { class: 'tile ' + (inGroup ? 'pair' : 'alone'), title: inGroup ? 'part of a complete group — comes out' : 'no complete group — stays inside' }, g.p));
        if (inGroup && (i + 1) % k === 0) row.append(h('div', { class: 'tile-sep' }));
      }
      row.append(h('div', { class: 'tile-sep' }), h('div', { class: 'tile-sep' }));
    }
    tilesWrap.append(row, h('p', { class: 'small' }, `${N} = ${s.groups.map(g => `${g.p}${g.e > 1 ? '^' + g.e : ''}`).join(' × ')}. Each complete group of ${k} (green) contributes one factor outside the root; leftovers (orange) stay inside.`));
    const rs = k === 2 ? '\\sqrt' : '\\sqrt[3]';
    if (s.coef === 1) out.innerHTML = `<div class="big">${tex(`${rs}{${N}}`)} is already simplest — no perfect ${k === 2 ? 'square' : 'cube'} factor.</div>`;
    else out.innerHTML = `<div class="big">${tex(`${rs}{${N}} = ${rs}{${s.perfect}\\cdot ${s.rad}} = ${rs}{${s.perfect}}\\,${rs}{${s.rad}} = ${radicalTex(s.coef, s.rad, k)}`)}</div><p class="small">Reverse (mixed → entire): ${tex(`${radicalTex(s.coef, s.rad, k)} = ${rs}{${s.coef}^${k}\\cdot ${s.rad}} = ${rs}{${N}}`)}. The coefficient goes back in as its ${k === 2 ? 'square' : 'cube'}.</p>`;
    // bars
    cv.clear();
    const L = 400, x0 = 20;
    const total = Math.pow(N, 1 / k), unit = L / total;
    cv.rect(x0, 30, L, 26, { fill: 's1', opacity: 0.85, rx: 4 });
    cv.text(x0 + L / 2, 43, `${k === 2 ? '√' : '∛'}${N} ≈ ${fmt(total, 3)}`, { color: '#fff', size: 13, weight: 700 });
    const seg = Math.pow(s.rad, 1 / k) * unit;
    for (let i = 0; i < s.coef; i++) {
      cv.rect(x0 + i * seg + 1, 90, seg - 2, 26, { fill: 's3', opacity: 0.85, rx: 4 });
      if (s.coef <= 12) cv.text(x0 + i * seg + seg / 2, 103, `${k === 2 ? '√' : '∛'}${s.rad}`, { color: '#fff', size: 12, weight: 600 });
    }
    cv.text(x0, 140, `${s.coef} copies of ${k === 2 ? '√' : '∛'}${s.rad} ≈ ${s.coef} × ${fmt(Math.pow(s.rad, 1 / k), 3)} = ${fmt(total, 3)}`, { anchor: 'start', size: 12, color: 'text-2' });
    cv.text(x0, 15, 'entire radical', { anchor: 'start', size: 11, color: 'muted' });
    cv.text(x0, 78, 'mixed radical', { anchor: 'start', size: 11, color: 'muted' });
  }
  update();
  el.append(card('', h('p', { class: 'small', html: `Where the picture comes from: ${tex('\\sqrt2')} is the diagonal of a 1×1 square, so ${tex('6\\sqrt2')} is the diagonal of a 6×6 square, whose area-of-diagonal-square is ${tex('6^2 + 6^2 = 72')}. Pythagoras and radical simplification are the same fact.` }),
    quiz(() => {
      const k = [2, 2, 3, 5, 6, 7, 10][Math.floor(Math.random() * 7)], m = [2, 3, 5, 6, 7, 10][Math.floor(Math.random() * 6)];
      const N = k * k * m;
      return { prompt: `Write ${tex(`\\sqrt{${N}}`)} as a mixed radical (type like <code>6√2</code> or <code>6 sqrt 2</code>).`, check: v => { const mm = v.toLowerCase().replace(/\s|\*|\(|\)/g, '').match(/^(\d+)(?:√|sqrt)(\d+)$/); return !!mm && +mm[1] === k && +mm[2] === m; }, hint: `Find the largest perfect square that divides ${N}.`, explain: `${tex(`\\sqrt{${N}} = \\sqrt{${k * k}\\cdot${m}} = ${k}\\sqrt{${m}}`)}.` };
    })));
}

/* ---------- 1.4 ---------- */
function s14(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Why should ${tex('a^{1/2}')} mean ${tex('\\sqrt a')}? Because the exponent law must keep working: ${tex('a^{1/2}\\cdot a^{1/2} = a^{1/2+1/2} = a^1')}. So ${tex('a^{1/2}')} is <i>the number that squares to a</i> — that is what a square root is. Fractional exponents aren't a new rule; they're the only definition that keeps the old rules true.<br><br>In general ${tex('a^{m/n} = \\left(\\sqrt[n]{a}\\right)^m = \\sqrt[n]{a^m}')}: the <b>denominator is the root</b>, the <b>numerator is the power</b>. Root first keeps numbers small.` })));

  const base = chips({ options: ['4', '8', '9', '16', '27', '32', '64', '81', '100'], value: '8', onChange: update });
  const mm = slider({ label: 'numerator m', min: 1, max: 5, value: 2, onInput: update });
  const nn = slider({ label: 'denominator n (the root)', min: 2, max: 5, value: 3, onInput: update });
  const out = readout();
  el.append(card('', h('div', { class: 'small' }, 'base a'), base.el, controls(mm, nn), out));
  function update() {
    const a = +base.value, m = mm.value, n = nn.value;
    const r = nthRootInt(a, n);
    const rs = n === 2 ? `\\sqrt{${a}}` : `\\sqrt[${n}]{${a}}`;
    const val = Math.pow(a, m / n);
    let html = `<div class="big">${tex(`${a}^{${m}/${n}}`)}</div>`;
    html += `<div><b>Root first:</b> ${tex(`\\left(${rs}\\right)^{${m}} = ${r !== null ? `${r}^{${m}} = ${r ** m}` : `(${fmt(Math.pow(a, 1 / n), 4)})^{${m}} \\approx ${fmt(val, 4)}`}`)}</div>`;
    html += `<div><b>Power first:</b> ${tex(`\\sqrt[${n}]{${a}^{${m}}} = \\sqrt[${n}]{${a ** m}}${r !== null ? ` = ${r ** m}` : ` \\approx ${fmt(val, 4)}`}`)} ${a ** m > 10000 ? '<span class="small">— the same answer but with a huge number in the middle.</span>' : ''}</div>`;
    if (r === null) html += `<p class="small">${a} is not a perfect ${n}${['', '', 'nd', 'rd', 'th', 'th'][n]} power, so this one is irrational: ${tex(`${a}^{${m}/${n}} \\approx ${fmt(val, 5)}`)}.</p>`;
    out.innerHTML = html;
  }
  update();

  // graph of x^k family
  const kS = slider({ label: 'exponent k', min: 0, max: 3, step: 1 / 6, value: 0.5, fmt: v => fracOf(v).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2'), onInput: draw });
  const xS = slider({ label: 'x', min: 0, max: 9, step: 0.25, value: 4, onInput: draw });
  const gw = h('div'); const gout = readout();
  el.append(card('', h('h3', { html: `The whole family ${tex('y = x^k')} at once` }),
    h('p', { html: `Slide k continuously. The curves for ${tex('k=1/2')} (square root), ${tex('k=1/3')} (cube root), ${tex('k=1')} (line) and ${tex('k=2')} (parabola) are not different topics — they are one dial.` }),
    controls(kS, xS), legend([['c1', 'y = x^k'], ['c4', 'y = x (k = 1)'], ['c2', 'y = x² and y = √x mirror each other in y = x']]), gw, gout));
  const p = new Plot(gw, { xmin: -0.5, xmax: 9, ymin: -0.5, ymax: 9, height: 400 });
  function draw() {
    const k = kS.value, x = xS.value; p.clear();
    p.fn(t => t, { color: 's4', dash: '3 4', width: 1 });
    p.fn(t => t * t, { color: 's2', width: 1, opacity: 0.5, domain: [0, 3] });
    p.fn(t => Math.sqrt(t), { color: 's2', width: 1, opacity: 0.5, domain: [0, 9] });
    p.fn(t => Math.pow(t, k), { color: 's1', width: 2.5, domain: [0, 9] });
    const y = Math.pow(x, k);
    p.point(x, y, { color: 's1', label: `(${fmt(x)}, ${fmt(y, 3)})`, pos: y > 7 ? 'se' : 'nw' });
    gout.innerHTML = `<div class="big">${tex(`y = x^{${fracOf(k)}}`)}  →  at ${tex(`x=${fmt(x)}`)}: ${tex(`${fmt(x)}^{${fracOf(k)}} \\approx ${fmt(y, 4)}`)}</div><p class="small">${k < 1 ? 'k < 1: the curve grows slower than a line — big inputs get squeezed (roots).' : k === 1 ? 'k = 1: the identity line.' : 'k > 1: the curve grows faster than a line (powers).'} Every curve in this family passes through (1, 1): 1 to any power is 1.</p>`;
  }
  draw();
}

/* ---------- 1.5 ---------- */
function s15(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `Going <b>up</b> one exponent multiplies by the base. So going <b>down</b> one divides by the base — and nothing stops you at zero. Keep dividing: ${tex('2^1 = 2,\\; 2^0 = 1,\\; 2^{-1} = \\tfrac12,\\; 2^{-2} = \\tfrac14')}. A negative exponent is a <b>reciprocal</b>, never a negative number: ${tex('a^{-m/n} = \\dfrac{1}{a^{m/n}}')}.` })));
  const base = chips({ options: ['2', '3', '4', '5', '8', '9', '10', '16', '27'], value: '2', onChange: update });
  const tblWrap = h('div'); const gw = h('div'); const out = readout();
  const xS = slider({ label: 'exponent x', min: -3, max: 3, step: 1 / 6, value: -1, fmt: v => fracOf(v).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2'), onInput: update });
  el.append(card('', h('div', { class: 'small' }, 'base b'), base.el, h('div', { class: 'row' }, h('div', {}, h('h3', {}, 'The ladder: divide to go down'), tblWrap), h('div', {}, h('h3', { html: tex('y = b^x') + ' is one smooth curve' }), controls(xS), gw, out))));
  const p = new Plot(gw, { xmin: -3.2, xmax: 3.2, ymin: -1, ymax: 10, height: 330 });
  function update() {
    const b = +base.value, x = xS.value;
    tblWrap.innerHTML = '';
    const t = h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'power'), h('th', {}, 'value'), h('th', {}, '')));
    for (let e = 3; e >= -3; e--) {
      const v = b ** e;
      t.append(h('tr', { class: e === Math.round(x) && Number.isInteger(x) ? 'hl' : '' }, h('td', { html: tex(`${b}^{${e}}`) }), h('td', { html: tex(e >= 0 ? String(v) : `\\tfrac{1}{${b ** -e}}`) + (e < 0 ? ` = ${fmt(v, 4)}` : '') }), h('td', { class: 'small' }, e === 3 ? '' : `÷ ${b} from the row above`)));
    }
    tblWrap.append(t);
    p.setBounds({ ymax: Math.min(30, b ** 3 * 1.05 + 1) }); p.clear();
    p.fn(t => Math.pow(b, t), { color: 's1', width: 2.5 });
    for (let e = -3; e <= 3; e++) p.point(e, b ** e, { color: 's1', r: 3, ring: false });
    p.hline(1, { color: 'muted', width: 1 });
    const y = Math.pow(b, x);
    p.point(x, y, { color: 's2', r: 6, label: `(${fracOf(x).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2')}, ${fmt(y, 3)})`, pos: x < 0 ? 'ne' : 'nw' });
    // exact form
    const nnum = Math.round(x * 6), g = gcd(Math.abs(nnum), 6) || 1; const m = Math.abs(nnum) / g, n = 6 / g; const neg = x < 0;
    const r = nthRootInt(b, n);
    let exact;
    if (n === 1) exact = neg ? `\\frac{1}{${b}^{${m}}} = \\frac{1}{${b ** m}}` : `${b ** m}`;
    else {
      const rs = n === 2 ? `\\sqrt{${b}}` : `\\sqrt[${n}]{${b}}`;
      const inner = r !== null ? `${m === 1 ? r : `${r}^{${m}} = ${r ** m}`}` : `(${rs})^{${m}}`;
      exact = neg ? `\\frac{1}{(${rs})^{${m}}} = ${r !== null ? `\\frac{1}{${r ** m}}` : `\\frac{1}{${fmt(Math.pow(b, m / n), 4)}}`}` : `(${rs})^{${m}} = ${r !== null ? inner : fmt(y, 4)}`;
    }
    out.innerHTML = `<div class="big">${tex(`${b}^{${fracOf(x)}} = ${exact}${r !== null || n === 1 ? '' : ''}`)} ≈ ${fmt(y, 4)}</div><p class="small">${x < 0 ? 'Negative exponent → flip to a reciprocal. The value is small but still <b>positive</b>.' : x === 0 ? 'Anything (nonzero) to the 0 is 1 — it has to be, to keep the ÷ b pattern going.' : 'Positive exponent → a value above 1.'} Notice the curve is always above the x-axis: ${tex('b^x')} is never negative.</p>`;
  }
  update();
  el.append(card('warn', h('h3', {}, 'Traps'), h('ul', {},
    h('li', { html: `${tex('2^{-3}')} is ${tex('\\tfrac18')}, not ${tex('-8')}.` }),
    h('li', { html: `${tex('\\left(\\tfrac{2}{3}\\right)^{-2} = \\left(\\tfrac{3}{2}\\right)^{2} = \\tfrac94')} — a negative exponent flips the <i>whole fraction</i>.` }),
    h('li', { html: `${tex('(-8)^{2/3} = (\\sqrt[3]{-8})^2 = (-2)^2 = 4')}, but ${tex('-8^{2/3} = -(8^{2/3}) = -4')}. Brackets decide what the exponent applies to.` }),
    h('li', { html: `${tex('(-16)^{1/2}')} is not a real number (no real number squares to −16), but ${tex('(-16)^{1/4}')} isn't either, while ${tex('(-27)^{1/3} = -3')} is fine: <b>odd roots</b> of negatives exist, <b>even roots</b> don't.` }))));
}

/* ---------- 1.6 ---------- */
function s16(el) {
  el.append(card('insight', h('h3', {}, 'The one idea'),
    h('p', { html: `An exponent is a <b>count of factors</b>. Every law is just counting: multiply → add the counts, divide → subtract, power of a power → multiply, and a power of a product distributes to each factor. Once the laws are true for counts, the definitions in 1.4 and 1.5 make them true for <i>every</i> rational exponent.` })));
  const m = slider({ label: 'm', min: 0, max: 6, value: 3, onInput: update });
  const n = slider({ label: 'n', min: 0, max: 6, value: 2, onInput: update });
  const wrap = h('div', { class: 'grid-2' });
  el.append(card('', controls(m, n), wrap));
  const tiles = (count, label = 'a', cls = 'pair') => h('div', { class: 'tiles' }, Array.from({ length: count }, () => h('div', { class: 'tile ' + cls }, label)));
  function update() {
    const M = m.value, N = n.value; wrap.innerHTML = '';
    // product
    const prod = h('div', { class: 'card' }, h('h3', { html: `Product: ${tex('a^m\\cdot a^n = a^{m+n}')}` }),
      h('div', { class: 'tiles' }, ...Array.from({ length: M }, () => h('div', { class: 'tile pair' }, 'a')), h('div', { class: 'tile-sep' }), h('div', {}, '×'), h('div', { class: 'tile-sep' }), ...Array.from({ length: N }, () => h('div', { class: 'tile alone' }, 'a'))),
      h('p', { html: tex(`a^{${M}}\\cdot a^{${N}} = a^{${M + N}}`) + ` — ${M} factors then ${N} more is ${M + N} factors. Just counting.` }));
    // quotient
    const cancel = Math.min(M, N);
    const quot = h('div', { class: 'card' }, h('h3', { html: `Quotient: ${tex('\\dfrac{a^m}{a^n} = a^{m-n}')}` }),
      h('div', {}, h('div', { class: 'tiles' }, ...Array.from({ length: M }, (_, i) => h('div', { class: 'tile ' + (i < cancel ? 'alone' : 'pair'), style: i < cancel ? { opacity: .35, textDecoration: 'line-through' } : {} }, 'a')), M === 0 && h('span', {}, '1')),
        h('div', { style: { borderTop: '2px solid var(--text-2)', margin: '4px 0', width: '60%' } }),
        h('div', { class: 'tiles' }, ...Array.from({ length: N }, (_, i) => h('div', { class: 'tile ' + (i < cancel ? 'alone' : 'pair'), style: i < cancel ? { opacity: .35, textDecoration: 'line-through' } : {} }, 'a')), N === 0 && h('span', {}, '1'))),
      h('p', { html: tex(`\\frac{a^{${M}}}{a^{${N}}} = a^{${M - N}}`) + (M - N < 0 ? ` = ${tex(`\\frac{1}{a^{${N - M}}}`)} — more factors on the bottom, so the answer is a reciprocal: that's where negative exponents come from.` : M === N ? ' = 1 — every factor cancels: that\'s why anything to the 0 is 1.' : ` — ${cancel} pair${cancel === 1 ? '' : 's'} cancel, ${M - N} left on top.`) }));
    // power of power
    const pw = h('div', { class: 'card' }, h('h3', { html: `Power of a power: ${tex('(a^m)^n = a^{mn}')}` }),
      h('div', {}, ...Array.from({ length: N }, () => h('div', { class: 'tiles', style: { marginBottom: '4px' } }, h('span', { class: 'small' }, '('), ...Array.from({ length: M }, () => h('div', { class: 'tile pair' }, 'a')), h('span', { class: 'small' }, ')')))),
      h('p', { html: tex(`(a^{${M}})^{${N}} = a^{${M * N}}`) + ` — ${N} rows of ${M} is a ${N}×${M} grid: multiply the counts.` }));
    // power of product
    const pp = h('div', { class: 'card' }, h('h3', { html: `Power of a product: ${tex('(ab)^n = a^n b^n')}` }),
      h('div', { class: 'tiles' }, ...Array.from({ length: N }, () => [h('div', { class: 'tile pair' }, 'a'), h('div', { class: 'tile alone' }, 'b'), h('div', { class: 'tile-sep' })]).flat()),
      h('p', { html: tex(`(ab)^{${N}} = a^{${N}}b^{${N}}`) + ' — regroup the a\'s together and the b\'s together. <b>This does not work for sums:</b> ' + tex('(a+b)^2 \\ne a^2+b^2') + '.' }));
    wrap.append(prod, quot, pw, pp);
  }
  update();

  // numeric check with rational exponents
  const a = chips({ options: ['4', '8', '9', '16', '27', '64'], value: '16', onChange: check });
  const e1 = chips({ options: ['1/2', '3/2', '-1/2', '1/3', '2/3', '-2/3', '1/4', '3/4', '-1/4', '5/4'], value: '3/4', onChange: check });
  const e2 = chips({ options: ['1/2', '3/2', '-1/2', '1/3', '2/3', '-2/3', '1/4', '3/4', '-1/4', '5/4'], value: '-1/4', onChange: check });
  const co = readout();
  el.append(card('', h('h3', {}, 'The laws still hold for fractional and negative exponents'), h('div', { class: 'small' }, 'base a'), a.el, h('div', { class: 'small' }, 'exponent p'), e1.el, h('div', { class: 'small' }, 'exponent q'), e2.el, co));
  const pf = s => { const [x, y] = s.split('/'); return +x / +y; };
  function check() {
    const A = +a.value, P = pf(e1.value), Q = pf(e2.value);
    const l = Math.pow(A, P) * Math.pow(A, Q), r = Math.pow(A, P + Q);
    const pq = fracOf(P + Q, 4).replace('tfrac', 'frac');
    co.innerHTML = `<div class="big">${tex(`${A}^{${e1.value.replace(/(-?\d+)\/(\d+)/, '\\frac{$1}{$2}')}}\\cdot ${A}^{${e2.value.replace(/(-?\d+)\/(\d+)/, '\\frac{$1}{$2}')}} = ${A}^{${pq}}`)}</div>
      <div>Left side: ${fmt(Math.pow(A, P), 4)} × ${fmt(Math.pow(A, Q), 4)} = <b>${fmt(l, 4)}</b> &nbsp;&nbsp; Right side: ${tex(`${A}^{${pq}}`)} = <b>${fmt(r, 4)}</b> ${Math.abs(l - r) < 1e-9 ? '<span class="ok">✓ equal</span>' : ''}</div>
      <p class="small">Order of operations for a chain like ${tex('\\left(\\frac{a^{p}}{a^{q}}\\right)^{2}')}: simplify inside the bracket first with the quotient law, then apply the outer power. Brackets → exponents (which includes roots) → multiplication/division → addition/subtraction.</p>`;
  }
  check();
}

export default {
  num: 1, title: 'Roots and Powers',
  tagline: 'Roots undo powers. Fractional and negative exponents are not new rules — they are the only definitions that keep the old rules true.',
  bigIdea: {
    title: 'Powers and roots are one dial, and roots are powers run backwards',
    render(el) {
      el.append(h('p', { html: `Slide the exponent. ${tex('x^2')}, ${tex('x^{1/2} = \\sqrt x')}, ${tex('x^{-1} = 1/x')} and ${tex('x^0 = 1')} are all the same machine with the dial set differently. And ${tex('\\sqrt x')} is ${tex('x^2')} reflected in the line ${tex('y=x')}: a root <b>undoes</b> a power, which is why "the power of a root equals the root of the power".` }));
      const kS = slider({ label: 'exponent k', min: -2, max: 3, step: 1 / 6, value: 0.5, fmt: v => fracOf(v).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2'), onInput: draw });
      const gw = h('div');
      el.append(controls(kS), legend([['c1', 'y = x^k'], ['c2', 'its mirror y = x^(1/k)'], ['c4', 'mirror line y = x']]), gw);
      const p = new Plot(gw, { xmin: -1, xmax: 6, ymin: -1, ymax: 6, height: 360 });
      function draw() {
        const k = kS.value; p.clear();
        p.fn(t => t, { color: 's4', dash: '3 4', width: 1 });
        if (Math.abs(k) > 1e-9) p.fn(t => Math.pow(t, 1 / k), { color: 's2', width: 1.5, domain: [0.001, 6], opacity: .8 });
        p.fn(t => Math.pow(t, k), { color: 's1', width: 2.5, domain: [k < 0 ? 0.05 : 0, 6] });
        p.point(1, 1, { color: 's1', r: 4, label: '(1,1)', pos: 'se' });
        p.label(5.5, Math.min(5.5, Math.pow(5.5, k)), `k = ${fracOf(k).replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2')}`, { pos: 'w', color: 's1' });
      }
      draw();
    }
  },
  sections: [
    { id: '1.1', title: 'Square Roots and Cube Roots of Fractions', blurb: 'A root is a side length. Take the root of the top and bottom separately — after reducing.', render: s11 },
    { id: '1.2', title: 'The Real Number System', blurb: 'Nested boxes: natural ⊂ whole ⊂ integer ⊂ rational, plus the irrationals that fill the gaps.', render: s12 },
    { id: '1.3', title: 'Mixed and Entire Radicals', blurb: 'Perfect-square factors walk out from under the root. Entire and mixed forms are the same length.', render: s13 },
    { id: '1.4', title: 'Powers with Positive Rational Exponents', blurb: 'Denominator = root, numerator = power. It is the only definition that keeps the exponent laws true.', render: s14 },
    { id: '1.5', title: 'Powers with Negative Rational Exponents', blurb: 'Going down the ladder divides by the base. Negative exponent means reciprocal, never negative.', render: s15 },
    { id: '1.6', title: 'Exponent Laws and Order of Operations', blurb: 'Exponents count factors, and every law is counting. Watch the tiles.', render: s16 },
  ],
};
