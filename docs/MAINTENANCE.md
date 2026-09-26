# Maintenance

## Run locally

```
python3 -m http.server 8000      # or: npm run serve
open http://localhost:8000
```

Opening `index.html` directly also works in every major browser because everything is relative and vendored.

## Smoke test

```
npm install        # once; installs Playwright as a dev dependency
npm run check      # serves the site, visits every page, drives every control
```

`scripts/check.cjs` reports, per page, the number of controls exercised, the number of formulas that failed to render (`texFallback`), and any console or page errors. A clean run ends with `TOTAL ERRORS 0` and `texFallback: 0` on every line. It also writes screenshots to `.check/shots/` (default state and after wiggling every control) for a visual pass.

If Playwright's browser is missing: `npx playwright install chromium`.

## Change workflow

1. Branch from `main`.
2. Make the change. For content changes, re-read `docs/INTENT.md` and keep the section's "one idea" honest.
3. Run `npm run check`; open the screenshots for any page you touched and look at both the default and wiggled state.
4. Add a line to `CHANGELOG.md` under **Unreleased** (see *Tracking changes* below).
5. Commit with a message whose first line says what changed for the student, not how (e.g. "3.6: show that a perfect-square discriminant means rational roots").
6. Open a pull request. Merging to `main` publishes the site if GitHub Pages is set to the branch root.

## Tracking changes

- `CHANGELOG.md` is the human record, in Keep-a-Changelog style: *Added / Changed / Fixed / Removed*, grouped by release, with **Unreleased** at the top. Every merged change gets one line. Reference the section number (`2.4`) so the entry can be found from the app.
- `docs/CONTENT-MAP.md` is the inventory of what each section currently teaches and shows. Update it whenever a section's idea, picture or controls change, and mark planned sections there before building them.
- `docs/DECISIONS.md` records design and technical decisions with their reasons. Add an entry when you choose between real alternatives (new library, different storage, changed page structure). Never edit an old entry; add a new one that supersedes it.
- Git history is the mechanical record. Keep commits focused on one section or one library concern.

## Releases

Tag when a meaningful set of content lands (a new chapter, a rework of an existing one): bump the version in `package.json`, move **Unreleased** entries under the new version with the date, and `git tag vX.Y.Z`.

## Adding a section

1. In the chapter module, add `{ id, title, blurb, render }` in textbook order.
2. In `render(el)`:
   - Start with `card('insight', h('h3', {}, 'The one idea'), h('p', { html: ... }))`.
   - Create controls, a plot or canvas, and a `readout()`; wire them to one `update()`; call it once.
   - Prefer `drawQuadratic`/`autoBounds` for parabolas and `Canvas` for geometric pictures.
   - Add `quiz(...)` only if a generated question genuinely reinforces the idea.
3. Add the section to `docs/CONTENT-MAP.md`.
4. Run the smoke test; look at the wiggled screenshot to catch degenerate states.

## Adding a chapter

1. Create `js/chapters/chN.js` following the contract in `docs/ARCHITECTURE.md`.
2. Import it in `js/app.js` and append it to `chapters`.
3. Fill in the chapter's rows in `docs/CONTENT-MAP.md`.

## Updating KaTeX

```
npm pack katex@<version>
tar -xzf katex-<version>.tgz
cp package/dist/katex.min.{js,css} vendor/katex/
rm -rf vendor/katex/fonts && cp -r package/dist/fonts vendor/katex/ && rm vendor/katex/fonts/*.{ttf,woff}
cp package/LICENSE vendor/katex/
```

Then run the smoke test and confirm `texFallback: 0` everywhere.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Formula shows as `<span class="katex">…` text | TeX HTML passed as a text child; use `html:` |
| Formula shows `;` instead of a space, or a missing command | Single backslash in a JS string; double it |
| Page shows `[object Object]` | A control object appended with raw `append()`; use `h()`/`controls()` or `.el` |
| Blank plot after a slider move | `NaN` in bounds (e.g. division by `a = 0`); guard with `a.value || 1` |
| `npm run check` reports errors only on wiggle | A degenerate slider value; find it via the `_wiggled` screenshot |
| Colours wrong in dark mode | A hard-coded hex instead of a named colour / CSS variable |
