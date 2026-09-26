# Intent

## Who this is for

Joana, a Grade 11 student working through Pearson *Pre-Calculus 11*, and whoever is helping her. It is a companion to the textbook, not a replacement: the book supplies the exercises, the app supplies the *why*.

## The problem it solves

Textbook sections teach by worked example. A student can reproduce the example and still not know what the section is *about*, which shows up the moment a question is phrased differently. This app exists to deliver the understanding and abstraction behind each section, so the examples become instances of an idea rather than recipes to memorise.

## Design principles

1. **One idea per section.** Every page opens with "The one idea": the single concept the section reduces to, stated in one or two plain sentences. If a page's one idea cannot be written in under 60 words, the page is not finished.
2. **The picture is the argument.** Each page has one interactive picture that *is* the explanation, not decoration beside it. The student should be able to move a slider and see the claim become obvious (e.g. the mirror branch that squaring lets in, the box whose diagonals explain "product ac, sum b").
3. **Predict, then move.** Controls invite a prediction before the change. Text near a control says what to try and what to notice ("Things to try", "Slide c past the vertex and watch…").
4. **Connect across sections.** Each chapter opens with a Big Idea that names the thread running through its sections. Sections point at each other by number where an idea reappears (3.4 → 3.5 → 3.6 → 4.4).
5. **Say the trap out loud.** Where students predictably go wrong (a negative exponent is not a negative number; the zero-product rule only works for zero; squaring is not reversible), the page names it as a trap rather than hoping the student avoids it.
6. **Exact and approximate, side by side.** Readouts show the exact form (6√2, (1 ± √5)/2) next to the decimal so the student learns to read both.
7. **Keep the textbook's map.** Section numbers, titles and order match the book's contents page so the app can be used alongside a homework assignment without translation.

## Non-goals

- Not a problem bank. Self-checks are small and only on sections where a quick generated question reinforces the idea. Drilling belongs in the textbook.
- Not a grading or reporting tool. Progress is a personal checkbox stored in the browser.
- Not a general graphing calculator. Every graph is pre-shaped to make one point.
- Not a framework project. The value is in the content; the code stays plain so it can be edited by hand for years.

## Tone

Direct, warm, no filler. Address the student as capable. Prefer "here is why" over "remember that". Avoid textbook phrasing when a plainer sentence exists.

## What "done" means for a section

- The one idea is written and true.
- The picture responds to at least one control and never shows a broken state at any slider value (including a = 0, negative k, roots that merge or vanish).
- The readout shows exact and decimal forms where both exist.
- Formulas render (no raw TeX, no raw HTML).
- The page renders without console errors in `npm run check`.
- Light and dark themes both read correctly.
