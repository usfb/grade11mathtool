# Pre-Calculus 11 Visual Guide

An interactive, visual companion to the Pearson *Pre-Calculus 11* textbook, built for Joana's Grade 11 math course. Every section of the table of contents gets one page with:

- **The one idea** — the single concept the section is really about, stated in plain language.
- **An interactive picture** — sliders, chips and graphs you can push around until the idea is obvious.
- **Self-checks** on the sections where quick practice helps.

Each chapter opens with a **Big Idea** that ties its sections together, aiming for the understanding and abstraction *behind* the textbook's worked examples rather than repeating them.

## Coverage

| Chapter | Sections |
|---|---|
| 1 Roots and Powers | 1.1 – 1.6 |
| 2 Radical Operations and Equations | 2.1 – 2.5 |
| 3 Solving Quadratic Equations | 3.1 – 3.6 |
| 4 Analyzing Quadratic Functions and Inequalities | 4.1 – 4.5, plus a preview of quadratic inequalities |

Chapters 5+ (from the next page of the contents) are not included yet. See *Adding a chapter* below.

## Running it

There is no build step. Either:

- **Open `index.html` directly** in any modern browser (Chrome, Edge, Firefox, Safari). KaTeX and all fonts are vendored under `vendor/`, so it works offline.
- **Serve the folder** for the cleanest experience: `python3 -m http.server 8000` then visit `http://localhost:8000`.
- **GitHub Pages**: in the repository settings, publish from the branch root. The site is fully static.

Progress ("mark as understood") and the light/dark theme choice are saved in the browser's local storage, so they persist per device.

## Project layout

```
index.html            page shell, sidebar, KaTeX includes
css/style.css         theme tokens (light + dark), layout, components
js/app.js             hash router, navigation, progress tracking, theme toggle
js/lib/math.js        number theory + algebra helpers (radical simplification,
                      factoring, discriminant, exact roots, TeX formatting)
js/lib/ui.js          DOM builder, sliders/chips/inputs, quiz, KaTeX rendering
js/lib/graph.js       SVG function plotter (Plot) and free-form canvas (Canvas)
js/lib/quad.js        shared parabola drawing + auto-bounds
js/chapters/chN.js    one module per chapter: big idea + sections
vendor/katex/         KaTeX 0.16.11 (MIT), woff2 fonts only
```

## Adding a chapter

1. Create `js/chapters/ch5.js` exporting `{ num, title, tagline, bigIdea: { title, render(el) }, sections: [{ id, title, blurb, render(el) }] }`.
2. Import it in `js/app.js` and add it to the `chapters` array.

Inside a `render(el)` function, build controls with `slider`, `chips`, `numberInput` from `js/lib/ui.js`, draw with `new Plot(container, { xmin, xmax, ymin, ymax })` from `js/lib/graph.js`, and write formulas with `tex('\\sqrt{x}')` (inline) or `dtex(...)` (display). The existing chapters are the reference for the pattern.

## Design notes

- Colours follow a colour-blind-safe categorical order (blue, orange, aqua, violet, red) in both themes; identity is never carried by colour alone (every graph has a legend or direct labels).
- Graphs are plain SVG so they stay crisp at any size and need no external library.
- Everything is vanilla ES modules: no bundler, no framework, no dependencies to update.
