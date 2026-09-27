# Changelog

All notable changes to the Pre-Calculus 11 Visual Guide. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/) where *major* = a change students would notice in how the app works, *minor* = new sections or chapters, *patch* = fixes and polish.

Reference sections by number (e.g. `2.4`) so entries can be found from the app.

## [Unreleased]

### Added
- GitHub Pages deployment workflow: pushes to `main` publish the site (Pages must be enabled once in the repository settings); pull requests run the smoke test.
- Project documentation: intent, architecture, maintenance guide, content map, decision log, this changelog, and a `CLAUDE.md` for AI-assisted maintenance.
- `scripts/check.cjs` headless smoke test and `package.json` scripts (`check`, `serve`).

## [0.1.0] - 2026-09-26

### Added
- App shell: sidebar contents, hash routing, home and chapter pages, prev/next pager, "mark as understood" progress with a sidebar bar, light/dark theme toggle, phone-width layout.
- Shared libraries: SVG `Plot` and `Canvas`, DOM/control toolkit with sliders, chips, inputs and quizzes, algebra helpers (radical simplification, ac-method factoring, exact quadratic roots, number classification), shared parabola drawing with auto-bounds.
- Chapter 1 Roots and Powers: 1.1 fraction roots with square-grid and cube pictures; 1.2 nested number sets, classifier and the √2 squeeze; 1.3 mixed/entire radicals with factor tiles and equal-length bars; 1.4 rational exponents and the `y = x^k` family; 1.5 the exponent ladder and `y = b^x`; 1.6 exponent laws as tile counting, plus traps.
- Chapter 2 Radical Operations and Equations: 2.1 grouping tiles with variables; 2.2 like radicals as bars; 2.3 area-grid multiplication and rationalizing with conjugates; 2.4 graphical solving with the mirror branch that squaring lets in; 2.5 algebraic steps with restrictions and candidate checks.
- Chapter 3 Solving Quadratic Equations: 3.1 the factoring box and factor-pair table; 3.2 difference of squares and perfect squares as rearrangeable pictures; 3.3 zero-product property with the "= 6" trap; 3.4 square-root method and literal completing the square; 3.5 the formula as middle ± half-width with its derivation; 3.6 the discriminant as vertex height, with the three-case strip.
- Chapter 4 Analyzing Quadratic Functions and Inequalities: 4.1 property highlights; 4.2 two views of graphical solving; 4.3 staged transformations of `y = x²`; 4.4 vertex-form analysis and equation-from-vertex-and-point; 4.5 equivalent forms with conversions; 4.6 quadratic inequalities preview.
- Self-checks on 1.1, 1.3, 2.2 and 3.1.
- KaTeX 0.16.11 vendored with woff2 fonts for offline use.

### Fixed (during initial build, recorded for the pattern)
- Zero discriminant crashed exact-root formatting (`simplifyRadical(0)` now returns a coefficient of 0).
- TeX passed as a text child rendered as raw HTML on 1.4 and 1.5.
- A chips control appended directly rendered as `[object Object]` on 1.2; `h()` now accepts control objects.
- Single-backslash `\;` in TeX strings reached KaTeX as `;`.
- Parabola auto-bounds squashed the vertex; y-range now fits vertex, y-intercept and roots with padding.
- Overlapping labels on 1.2 (set boxes) and 3.2 (rearranged rectangle); missing colour names (`text-2`, `axis`) drew invisible strokes.
- 4.5 labelled a double root as irrational.
