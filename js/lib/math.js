// Pure math helpers shared by all chapters.

export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const isInt = x => Number.isInteger(x);
export const isSquare = n => isInt(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
export const isCube = n => isInt(n) && Math.round(Math.cbrt(n)) ** 3 === n;
export const nthRootInt = (n, k) => { const r = Math.round(Math.pow(n, 1 / k)); return r ** k === n ? r : null; };

export function primeFactors(n) {
  n = Math.abs(n);
  const out = [];
  for (let p = 2; p * p <= n; p++) {
    let e = 0;
    while (n % p === 0) { n /= p; e++; }
    if (e) out.push([p, e]);
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

// sqrt-like simplification: n = coef^index * rad, rad has no perfect index-th power factor.
export function simplifyRadical(n, index = 2) {
  if (!isInt(n) || n < 0) return null;
  if (n === 0) return { coef: 0, rad: 1, groups: [], perfect: 0 };
  let coef = 1, rad = 1;
  const factors = primeFactors(n);
  const groups = [];
  for (const [p, e] of factors) {
    const out = Math.floor(e / index), left = e % index;
    coef *= p ** out; rad *= p ** left;
    groups.push({ p, e, out, left });
  }
  return { coef, rad, groups, perfect: coef ** index };
}

export function radicalTex(coef, rad, index = 2) {
  if (rad === 1) return String(coef);
  const root = index === 2 ? `\\sqrt{${rad}}` : `\\sqrt[${index}]{${rad}}`;
  if (coef === 1) return root;
  if (coef === -1) return '-' + root;
  return `${coef}${root}`;
}

// Format a number for display (trim trailing zeros).
export function fmt(x, d = 3) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
  const s = (Math.abs(x) < 1e-12 ? 0 : x).toFixed(d).replace(/\.?0+$/, '');
  return s.replace('-', '−');
}
export const sgn = x => (x < 0 ? '−' : '+');
export const abs = Math.abs;

// TeX for a signed term like "+ 3x" / "- 3x" ; leading form has no plus.
export function term(coef, sym, { lead = false, one = true } = {}) {
  if (coef === 0) return '';
  const a = Math.abs(coef);
  let body = (a === 1 && sym && one) ? sym : `${fmtT(a)}${sym}`;
  if (lead) return (coef < 0 ? '-' : '') + body;
  return (coef < 0 ? ' - ' : ' + ') + body;
}
export function fmtT(x, d = 3) { return fmt(x, d).replace('−', '-'); }

// ax^2 + bx + c as TeX
export function polyTex(a, b, c) {
  let s = '';
  if (a !== 0) s += term(a, 'x^2', { lead: true });
  if (b !== 0) s += s ? term(b, 'x') : term(b, 'x', { lead: true });
  if (c !== 0 || !s) s += s ? term(c, '', { one: false }) : term(c, '', { lead: true, one: false }) || '0';
  return s;
}
export function linTex(m, k) { return polyTex(0, m, k); }

// vertex form a(x-p)^2+q
export function vertexTex(a, p, q) {
  const inner = p === 0 ? 'x' : `(x ${p > 0 ? '-' : '+'} ${fmtT(Math.abs(p))})`;
  let s = (a === 1 ? '' : a === -1 ? '-' : fmtT(a)) + (p === 0 ? 'x^2' : `${inner}^2`);
  if (q !== 0) s += ` ${q > 0 ? '+' : '-'} ${fmtT(Math.abs(q))}`;
  return s;
}
export function factoredTex(a, r1, r2) {
  const f = r => r === 0 ? 'x' : `(x ${r > 0 ? '-' : '+'} ${fmtT(Math.abs(r))})`;
  return (a === 1 ? '' : a === -1 ? '-' : fmtT(a)) + f(r1) + f(r2);
}

export function discriminant(a, b, c) { return b * b - 4 * a * c; }
export function quadraticRoots(a, b, c) {
  const D = discriminant(a, b, c);
  if (a === 0) return b === 0 ? [] : [-c / b];
  if (D < 0) return [];
  if (D === 0) return [-b / (2 * a)];
  const s = Math.sqrt(D);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((x, y) => x - y);
}

// Exact TeX for roots of integer quadratic: (-b ± √D) / 2a, simplified.
export function exactRootsTex(a, b, c) {
  const D = discriminant(a, b, c);
  if (D < 0) return null;
  const sr = simplifyRadical(D, 2);
  if (!sr) return null;
  if (sr.rad === 1) { // rational
    const r = quadraticRoots(a, b, c);
    return r.map(x => fracTex(-b + (x === r[0] ? -sr.coef : sr.coef), 2 * a));
  }
  // (-b ± k√m)/(2a): divide by g = gcd(b, k, 2a)
  let g = gcd(gcd(b, sr.coef), 2 * a);
  let nb = -b / g, k = sr.coef / g, den = 2 * a / g;
  if (den < 0) { nb = -nb; k = -k; den = -den; }
  const num = `${nb !== 0 ? nb + ' ' : ''}\\pm ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sqrt{${sr.rad}}`;
  const one = den === 1 ? num : `\\frac{${num}}{${den}}`;
  return [one];
}

export function fracTex(n, d) {
  if (d === 0) return '\\text{undefined}';
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d < 0) { n = -n; d = -d; }
  if (d === 1) return String(n);
  return (n < 0 ? '-' : '') + `\\frac{${Math.abs(n)}}{${d}}`;
}

// Find integer factoring of ax^2+bx+c = (px+q)(rx+s). Returns null if none.
export function factorTrinomial(a, b, c) {
  if (a === 0) return null;
  const ac = a * c;
  const pairs = [];
  const lim = Math.abs(ac);
  if (ac === 0) {
    // c = 0 : x(ax+b)
    return { p: 1, q: 0, r: a, s: b, m: 0, n: b, pairs: [[0, b]] };
  }
  for (let m = -lim; m <= lim; m++) {
    if (m === 0 || ac % m !== 0) continue;
    const n = ac / m;
    if (m > n) continue;
    pairs.push([m, n]);
  }
  const hit = pairs.find(([m, n]) => m + n === b);
  if (!hit) return { pairs, none: true };
  const [m, n] = hit;
  // a x^2 + m x + n x + c  -> group
  const g1 = gcd(a, m) * (a < 0 ? -1 : 1);            // from a x^2 + m x
  const p = a / g1, q = m / g1;                          // g1 (p x + q)
  const g2 = gcd(n, c) * (n < 0 ? -1 : 1);
  // second group n x + c = g2 (p x + q) must match
  const p2 = n / g2, q2 = c / g2;
  let G1 = g1, G2 = g2;
  if (p2 !== p || q2 !== q) { G2 = n / p; }
  return { p, q, r: G1, s: G2, m, n, pairs };
}

// Parse a simple real-number expression for the number system classifier.
// Supports: integers, decimals, fractions a/b, sqrt(n), √n, cbrt(n), ∛n, pi, π, e, with optional leading minus, repeating decimals "0.3...".
export function parseReal(str) {
  let s = str.trim().replace(/\s+/g, '').replace('−', '-');
  if (!s) return null;
  let neg = false;
  if (s.startsWith('-')) { neg = true; s = s.slice(1); }
  const res = (value, kind, tex, extra = {}) => ({ value: neg ? -value : value, kind, tex: (neg ? '-' : '') + tex, ...extra });
  if (/^(pi|π)$/i.test(s)) return res(Math.PI, 'irrational', '\\pi', { why: 'π is a non-terminating, non-repeating decimal (proved irrational in 1761).' });
  if (/^e$/.test(s)) return res(Math.E, 'irrational', 'e', { why: 'e ≈ 2.71828… never terminates or repeats.' });
  let m;
  if ((m = s.match(/^(?:sqrt\(?|√)(\d+(?:\.\d+)?)\)?$/i))) {
    const n = parseFloat(m[1]);
    const v = Math.sqrt(n);
    if (isInt(n) && isSquare(n)) return res(v, 'integer', `\\sqrt{${n}}`, { why: `√${n} = ${v}, a whole number in disguise.` });
    return res(v, 'irrational', `\\sqrt{${n}}`, { why: `${n} is not a perfect square, so √${n} cannot be written as a fraction of integers.` });
  }
  if ((m = s.match(/^(?:cbrt\(?|∛)(\d+)\)?$/i))) {
    const n = parseInt(m[1]); const v = Math.cbrt(n);
    if (isCube(n)) return res(v, 'integer', `\\sqrt[3]{${n}}`, { why: `∛${n} = ${Math.round(v)}.` });
    return res(v, 'irrational', `\\sqrt[3]{${n}}`, { why: `${n} is not a perfect cube, so its cube root is irrational.` });
  }
  if ((m = s.match(/^(\d+)\/(\d+)$/))) {
    const n = +m[1], d = +m[2];
    if (d === 0) return null;
    if (n % d === 0) return res(n / d, 'integer', `\\frac{${n}}{${d}}`, { why: `${n}/${d} = ${n / d} exactly.` });
    return res(n / d, 'rational', `\\frac{${n}}{${d}}`, { why: 'A ratio of two integers is rational by definition.' });
  }
  if ((m = s.match(/^(\d+)\.(\d+)\.\.\.$/))) {
    const v = parseFloat(m[1] + '.' + m[2].repeat(6));
    return res(v, 'rational', `${m[1]}.\\overline{${m[2]}}`, { why: 'A repeating decimal can always be turned into a fraction (e.g. 0.333… = 1/3).' });
  }
  if ((m = s.match(/^(\d+)\.(\d+)$/))) {
    return res(parseFloat(s), 'rational', s, { why: `A terminating decimal is a fraction: ${s} = ${m[1] + m[2]}/${10 ** m[2].length}.` });
  }
  if (/^\d+$/.test(s)) return res(parseInt(s), 'integer', s, { why: '' });
  return null;
}
