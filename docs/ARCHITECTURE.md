# Architecture

Plain static site. No bundler, no framework, no server. Everything is ES modules loaded by the browser.

```
index.html              shell: sidebar <nav id="nav">, <main id="main">, KaTeX includes
css/style.css           design tokens (:root, dark overrides), layout, components
js/app.js               hash router, nav builder, progress store, theme toggle
js/lib/math.js          pure algebra helpers (no DOM)
js/lib/ui.js            DOM builder + controls + TeX rendering
js/lib/graph.js         Plot (function graphs) and Canvas (free-form SVG pictures)
js/lib/quad.js          shared parabola drawing and auto-bounds
js/chapters/chN.js      one module per chapter: metadata, big idea, sections
vendor/katex/           KaTeX 0.16.11 + woff2 fonts (offline)
scripts/check.cjs       headless smoke test (Playwright)
```

## Routing and page lifecycle

- Routes are hashes: `#/` home, `#/ch3` chapter home, `#/ch3/3.4` a section.
- `app.js` clears `<main>`, calls the section's `render(el)`, then appends the "mark as understood" toggle and prev/next pager.
- A render function builds its whole DOM once, wires controls to an `update()` closure, and calls `update()` immediately. Re-rendering happens by replacing `innerHTML` of a readout or clearing a plot, never by re-routing.
- `app.js` waits for KaTeX (deferred script) before the first route so formulas render on first paint. `tex()` degrades to `<code class="tex-fallback">` if KaTeX is missing.

## Chapter module contract

```js
export default {
  num: 3,
  title: 'Solving Quadratic Equations',
  tagline: 'one sentence shown under the chapter title and on the home card',
  bigIdea: { title: '...', render(el) { /* append to el */ } },
  sections: [
    { id: '3.1', title: '...', blurb: 'one sentence (HTML allowed)', render(el) { ... } },
  ],
};
```

`id` must be unique across all chapters: it is the progress key in localStorage and the URL segment.

## `js/lib/ui.js`

| Export | Purpose |
|---|---|
| `h(tag, attrs, ...children)` | Element builder. `attrs.html` sets innerHTML; `on*` keys add listeners; `style` may be an object. Children may be nodes, strings, arrays, or any control object with an `.el` node. |
| `tex(s)`, `dtex(s)` | KaTeX → HTML string (inline / display). Always insert via `html:` or `innerHTML`, never as a text child. |
| `slider({label,min,max,step,value,fmt,onInput})` | Range input with live value. `.value` get/set. |
| `numberInput`, `textInput`, `select` | Same shape: `{ el, value }`. |
| `chips({options,value,onChange,multi})` | Toggle pills. `options` are strings or `{value,label}`. |
| `card(cls, ...children)` | `.card` wrapper; `cls` in `insight`, `idea`, `warn`, or `''`. |
| `controls(...items)` | Flex row of controls (accepts control objects or nodes). |
| `readout()` | Empty `.readout` div for results. |
| `legend([[cls,label],...])` | Colour legend; `cls` is `c1`…`c5`. |
| `quiz(gen)` | Self-check. `gen()` returns `{prompt, answer|check, hint, explain, tol}`. |

## `js/lib/graph.js`

`new Plot(container, { xmin, xmax, ymin, ymax, width, height, grid, ticks, yticks, xlabel, ylabel })`

- Coordinates are math units; `sx()/sy()` map to pixels.
- `fn(f, {color, width, dash, domain, opacity})` breaks the path on NaN/Infinity and clamps wild values so steep curves stay drawable.
- `point`, `label`, `segment`, `polyline`, `polygon`, `vline`, `hline`, `band` (vertical shading), `hband` (horizontal shading), `text` (pixel coords).
- `setBounds({...})` redraws axes; `clear()` empties data and label layers only.
- Colours are names resolved through one map: `s1`…`s6`, `muted`, `text`, `text-2`, `axis`, `surface`, `border`. Anything else is passed through as a CSS colour. Series colours are CSS variables so dark mode works without redraw.

`new Canvas(container, w, h)` is a bare SVG in pixel coordinates with `rect`, `line`, `poly`, `circle`, `text`, `brace` (dimension line with label). Used for geometric pictures (grids, cubes, area models, tiles).

## `js/lib/math.js`

Pure functions, unit-testable in Node. Key ones:

- `simplifyRadical(n, index)` → `{coef, rad, groups, perfect}`; `n = 0` returns coef 0.
- `radicalTex(coef, rad, index)`, `fracTex(n, d)`, `polyTex(a,b,c)`, `vertexTex(a,p,q)`, `factoredTex(a,r1,r2)`, `linTex(m,k)`.
- `quadraticRoots(a,b,c)` (numeric, sorted), `discriminant`, `exactRootsTex(a,b,c)` (integer coefficients; returns `null` for D < 0).
- `factorTrinomial(a,b,c)` via the ac-method; returns `{p,q,r,s,m,n,pairs}` or `{pairs, none:true}`.
- `parseReal(str)` for the number-system classifier (integers, decimals, `a/b`, `√n`, `∛n`, `π`, `e`, `0.3...`).
- `fmt(x, d)` for display (trims zeros, uses the true minus sign); `fmtT` for the ASCII minus inside TeX.

## `js/lib/quad.js`

`autoBounds(a,b,c)` picks a window that shows the vertex, the y-intercept and the roots with padding. `drawQuadratic(plot, a,b,c, opts)` draws the parabola and optionally vertex, axis, roots, y-intercept. Use it for every parabola so labelling is consistent.

## State

| Key | Where | Content |
|---|---|---|
| `pc11-progress` | localStorage | `{ "3.4": true, ... }` |
| `pc11-theme` | localStorage | `"light"` or `"dark"` (absent = follow OS) |

Both reads are wrapped in try/catch; the app works with storage blocked.

## Theming

Tokens live on `:root`; dark values are declared twice, under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and under `:root[data-theme="dark"]`, so the toggle beats the OS setting both ways. SVG strokes reference the same variables. Categorical order is blue, orange, aqua, violet, red, yellow (colour-blind-safe adjacent pairs in both themes).

## Conventions and pitfalls

- **TeX in JS strings needs double backslashes.** `tex('\\sqrt{2}')`, and in template literals `\;` for a thin space. A single `\;` silently becomes `;`.
- **TeX output is HTML.** Pass it through `html:` / `innerHTML`; as a text child it renders as literal markup.
- **Controls are objects.** `h()` and `controls()` accept them directly (they read `.el`), but `append()` on a raw node does not.
- **Guard degenerate inputs.** `a = 0` in a quadratic, `k < 0` under a root, merged roots, and mid-range slider values are all reachable; `scripts/check.cjs` drives every slider to min, max and midpoint.
- **Do not depend on the CDN.** KaTeX is vendored; keep it that way so the app works offline and in restricted networks.
