# CLAUDE.md

Guidance for AI-assisted work on this repository. Read `docs/INTENT.md` before changing content and `docs/ARCHITECTURE.md` before changing code.

## What this is

A static, no-build web app: an interactive visual companion to Pearson *Pre-Calculus 11*, one page per textbook section, built for a Grade 11 student (Joana). Value lives in the content; the code stays plain on purpose.

## Commands

- `npm run serve` — serve on http://localhost:8000 (plain `python3 -m http.server`).
- `npm run check` — headless smoke test over every page; must end with `TOTAL ERRORS 0` and `texFallback: 0` on every line. Screenshots land in `.check/shots/`.
- There is no build, lint or transpile step. Syntax-check a module with `node --check path.js`.

## Rules

- Keep it dependency-free at runtime. KaTeX is vendored; do not reintroduce CDN links.
- Every section page starts with a "The one idea" card and has one interactive picture. Do not add a section without both.
- Match the textbook's section numbers and titles exactly; they are URLs and progress keys.
- TeX in JS strings uses double backslashes and is inserted as HTML (`html:` / `innerHTML`), never as a text child.
- Use named colours (`s1`…`s6`, `muted`, `text-2`, …) in graph code, never hex.
- Guard degenerate control values (`a = 0`, `k < 0`, merged roots). The check script drives every slider to min, max and midpoint.
- Use `drawQuadratic`/`autoBounds` for parabolas so labelling stays consistent across pages.

## Tracking changes

- Add a line under **Unreleased** in `CHANGELOG.md` for every change, referencing the section number.
- Update `docs/CONTENT-MAP.md` when a section's idea, picture or controls change, and list planned work there.
- Add an entry to `docs/DECISIONS.md` when choosing between real alternatives; never edit old entries.
- Commit messages: first line says what changed for the student (e.g. `3.6: show rational roots when D is a perfect square`). No model identifiers in commits or code.

## Before finishing any task

1. `npm run check` is clean.
2. Open the screenshots for touched pages (default and `_wiggled`) and look at them.
3. Changelog and content map are updated.
