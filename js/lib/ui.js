// DOM helpers, controls, and TeX rendering.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    if (c instanceof Node) el.append(c);
    else if (c && c.el instanceof Node) el.append(c.el);
    else el.append(document.createTextNode(String(c)));
  }
  return el;
}

// TeX → HTML string (inline). Falls back to code if KaTeX isn't loaded.
export function tex(s, display = false) {
  if (window.katex) {
    try { return window.katex.renderToString(s, { throwOnError: false, displayMode: display, strict: 'ignore' }); }
    catch (e) { /* fall through */ }
  }
  return `<code class="tex-fallback">${s.replace(/</g, '&lt;')}</code>`;
}
export const dtex = s => tex(s, true);

export function slider({ label, min, max, step = 1, value, fmt = v => v, onInput }) {
  const valEl = h('span', { class: 'val' }, fmt(value));
  const input = h('input', { type: 'range', min, max, step, value });
  const wrap = h('div', { class: 'ctl' }, h('label', {}, h('span', { html: label }), valEl), input);
  const api = {
    el: wrap,
    get value() { return parseFloat(input.value); },
    set value(v) { input.value = v; valEl.textContent = fmt(parseFloat(input.value)); },
  };
  input.addEventListener('input', () => { valEl.textContent = fmt(api.value); onInput && onInput(api.value); });
  return api;
}

export function numberInput({ label, value, min, max, step = 1, onInput, width }) {
  const input = h('input', { type: 'number', value, min, max, step });
  const wrap = h('div', { class: 'ctl', style: width ? { minWidth: width } : {} }, h('label', { html: label }), input);
  const api = { el: wrap, get value() { const v = parseFloat(input.value); return Number.isNaN(v) ? 0 : v; }, set value(v) { input.value = v; } };
  input.addEventListener('input', () => onInput && onInput(api.value));
  return api;
}

export function textInput({ label, value = '', placeholder = '', onInput, width }) {
  const input = h('input', { type: 'text', value, placeholder });
  const wrap = h('div', { class: 'ctl', style: width ? { minWidth: width } : {} }, h('label', { html: label }), input);
  const api = { el: wrap, get value() { return input.value; }, set value(v) { input.value = v; }, input };
  input.addEventListener('input', () => onInput && onInput(api.value));
  return api;
}

export function select({ label, options, value, onChange }) {
  const sel = h('select', {}, options.map(o => h('option', { value: o.value ?? o, selected: (o.value ?? o) == value ? '' : null }, o.label ?? o)));
  const wrap = h('div', { class: 'ctl' }, h('label', { html: label }), sel);
  const api = { el: wrap, get value() { return sel.value; }, set value(v) { sel.value = v; } };
  sel.addEventListener('change', () => onChange && onChange(sel.value));
  return api;
}

// A row of toggle chips; `multi` allows several on.
export function chips({ options, value, onChange, multi = false }) {
  const state = new Set(multi ? value : [value]);
  const wrap = h('div', { class: 'chips' });
  const render = () => {
    wrap.innerHTML = '';
    for (const o of options) {
      const v = o.value ?? o;
      const c = h('button', { class: 'chip' + (state.has(v) ? ' on' : ''), html: o.label ?? o });
      c.addEventListener('click', () => {
        if (multi) { state.has(v) ? state.delete(v) : state.add(v); }
        else { state.clear(); state.add(v); }
        render(); onChange && onChange(multi ? [...state] : v);
      });
      wrap.append(c);
    }
  };
  render();
  return { el: wrap, get value() { return multi ? [...state] : [...state][0]; } };
}

export function card(cls, ...children) { return h('div', { class: 'card ' + cls }, ...children); }
export function controls(...items) { return h('div', { class: 'controls' }, items.map(i => i.el || i)); }
export function readout() { return h('div', { class: 'readout' }); }
export function legend(items) { return h('div', { class: 'legend' }, items.map(([cls, label]) => h('span', { class: cls, html: label }))); }

// Simple self-check quiz: gen() returns {prompt (html), answer (string or number), tol, hint}
export function quiz(gen, { title = 'Check yourself' } = {}) {
  const q = h('div', { class: 'q' });
  const inp = h('input', { placeholder: 'your answer' });
  const fb = h('div', { class: 'fb' });
  let cur;
  const next = () => { cur = gen(); q.innerHTML = cur.prompt; inp.value = ''; fb.innerHTML = ''; };
  const check = () => {
    const v = inp.value.trim();
    if (!v) return;
    const ok = cur.check ? cur.check(v) : (typeof cur.answer === 'number'
      ? Math.abs(parseFloat(v.replace('−', '-')) - cur.answer) <= (cur.tol ?? 1e-6)
      : v.replace(/\s+/g, '').toLowerCase() === String(cur.answer).replace(/\s+/g, '').toLowerCase());
    fb.innerHTML = ok ? `<span class="ok">✓ Correct.</span> ${cur.explain || ''}` : `<span class="bad">✗ Not yet.</span> ${cur.hint || ''}`;
  };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  const el = h('div', { class: 'quiz' }, h('div', { class: 'small' }, title), q,
    h('div', { class: 'controls' }, inp, h('button', { class: 'btn primary', onClick: check }, 'Check'), h('button', { class: 'btn', onClick: next }, 'New question')), fb);
  next();
  return el;
}
