# Decision log

Short records of choices that shaped the project, newest last. Do not edit old entries; add a superseding one.

## 001 · Static site, no build step (2026-09-26)

**Decision.** Plain HTML, CSS and browser ES modules. No bundler, transpiler, framework or package runtime dependency.
**Why.** The app must stay editable by hand for the life of a school course, open from a folder or GitHub Pages, and never break because a toolchain moved on. The interactivity needed (sliders, SVG) is well within plain DOM.
**Consequences.** No JSX or TypeScript; a small `h()` builder instead. Module count stays small by design.

## 002 · KaTeX vendored, not loaded from a CDN (2026-09-26)

**Decision.** `vendor/katex/` holds KaTeX 0.16.11 and woff2 fonts; `index.html` references it relatively.
**Why.** The first build loaded from jsDelivr and rendered raw TeX wherever the CDN was unreachable. Vendoring makes the app work offline and on restricted school networks. Only woff2 fonts are kept to hold the folder near 600 KB.
**Consequences.** Upgrading KaTeX is a manual copy (see `docs/MAINTENANCE.md`).

## 003 · Own SVG plotter instead of a charting library (2026-09-26)

**Decision.** `js/lib/graph.js` implements the small `Plot`/`Canvas` API the pages need.
**Why.** Charting libraries are built for data series; these pages need function curves, labelled points, shaded bands and geometric pictures with math-unit coordinates, in about 150 lines. SVG also stays crisp and themes through CSS variables.
**Consequences.** No hover tooltips yet; if they are wanted, add them to `Plot` rather than adopting a library.

## 004 · Section pages built around "one idea" (2026-09-26)

**Decision.** Every section opens with a card titled "The one idea", followed by one interactive picture. Practice is secondary.
**Why.** The brief was to deliver understanding and abstraction beyond the textbook's examples. A single, honestly stated idea plus a picture that makes it obvious is the smallest thing that does that.
**Consequences.** Sections that cannot be reduced to one idea should be split or rethought, not padded.

## 005 · Textbook numbering kept as the navigation (2026-09-26)

**Decision.** Chapters and sections use the book's numbers and titles; hashes are `#/chN/N.M`.
**Why.** Joana will use the app next to homework that references section numbers. Progress is keyed by these ids, so they must stay stable.
**Consequences.** Section 4.6 is provisional until the book's next contents page is seen; renaming it later is a one-line change plus a note in the changelog (stored progress for that id would be lost, which is acceptable).

## 006 · Hash routing and localStorage state (2026-09-26)

**Decision.** Client-side hash routes; progress and theme in localStorage; no accounts, no backend.
**Why.** Works from `file://` and GitHub Pages with no server. The only state worth keeping is a personal checklist and a theme, which belong on the device.
**Consequences.** Progress does not sync across devices. If that is ever needed, export/import of the JSON is the smallest addition.

## 007 · Colour-blind-safe categorical palette with named roles (2026-09-26)

**Decision.** Series colours are `s1`…`s6` (blue, orange, aqua, violet, red, yellow) as CSS variables with separate dark-mode steps; graph code uses the names, never hex.
**Why.** Multiple curves are compared on most pages, and the app is used in both themes. Named roles let dark mode re-step colours without touching page code. Identity is also carried by legends and direct labels, never by colour alone.
**Consequences.** New pictures must pick from the named set; a new colour is a change to the palette, not a local hex.

## 008 · Headless smoke test drives every control (2026-09-26)

**Decision.** `scripts/check.cjs` visits every route, screenshots the default state, then sets each slider to min, max and midpoint and clicks each chip, recording errors and unrendered formulas.
**Why.** Most bugs found during the first build were degenerate states (a = 0, D = 0, k < 0) that only appear at specific slider positions. The wiggle pass finds them mechanically.
**Consequences.** Every new control is automatically exercised; keep controls as standard inputs and `.chip` buttons so the script sees them.
