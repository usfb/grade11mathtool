import { h, tex, dtex } from './lib/ui.js';
import ch1 from './chapters/ch1.js';
import ch2 from './chapters/ch2.js';
import ch3 from './chapters/ch3.js';
import ch4 from './chapters/ch4.js';

const chapters = [ch1, ch2, ch3, ch4];
const main = document.getElementById('main');
const nav = document.getElementById('nav');
const sidebar = document.getElementById('sidebar');
const KEY = 'pc11-progress';

const progress = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } })();
const saveProgress = () => { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* ignore */ } };
const allSections = chapters.flatMap(c => c.sections.map(s => ({ ch: c, sec: s })));

function buildNav() {
  nav.innerHTML = '';
  for (const c of chapters) {
    const box = h('div', { class: 'nav-ch' });
    box.append(h('a', { class: 'nav-ch-title', href: `#/ch${c.num}` }, `${c.num}  ${c.title}`));
    for (const s of c.sections) {
      box.append(h('a', { class: 'nav-sec' + (progress[s.id] ? ' done' : ''), href: `#/ch${c.num}/${s.id}`, 'data-id': s.id }, h('span', { class: 'num' }, s.id), h('span', {}, s.title)));
    }
    nav.append(box);
  }
  updateProgress();
}
function updateProgress() {
  const n = allSections.filter(x => progress[x.sec.id]).length;
  document.getElementById('progress-bar').style.width = (100 * n / allSections.length) + '%';
  document.getElementById('progress-text').textContent = `${n} of ${allSections.length} sections marked understood`;
  nav.querySelectorAll('.nav-sec').forEach(a => a.classList.toggle('done', !!progress[a.dataset.id]));
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [chPart, secId] = hash.split('/');
  const chNum = parseInt((chPart || '').replace('ch', ''));
  const ch = chapters.find(c => c.num === chNum);
  main.innerHTML = '';
  nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
  sidebar.classList.remove('open');
  window.scrollTo(0, 0);
  if (!ch) return renderHome();
  const sec = ch.sections.find(s => s.id === secId);
  if (!sec) return renderChapterHome(ch);
  renderSection(ch, sec);
}

function renderHome() {
  main.append(
    h('div', { class: 'eyebrow' }, 'Pearson Pre-Calculus 11'),
    h('h1', {}, 'See the idea, not just the example'),
    h('p', { class: 'lede' }, 'Every section of the textbook, rebuilt as something you can move, drag, and break. Each page starts with the one idea that the whole section is really about, then lets you explore it.'),
    h('div', { class: 'card idea' }, h('h3', {}, 'How to use this'),
      h('ul', {}, h('li', {}, 'Start with the chapter’s ', h('b', {}, 'Big Idea'), '. If you get that, the sections are just special cases.'),
        h('li', {}, 'Drag every slider. Ask "what changes, what stays the same?"'),
        h('li', {}, 'Try to predict before you move something. Being wrong and then seeing why is how the idea sticks.'),
        h('li', {}, 'Mark a section as understood when you can explain the picture to someone else.'))),
    h('div', { class: 'home-grid' }, chapters.map(c => h('a', { class: 'home-card', href: `#/ch${c.num}` },
      h('div', { class: 'card' }, h('div', { class: 'n' }, c.num), h('h3', {}, c.title), h('p', { class: 'small' }, c.tagline),
        h('ul', {}, c.sections.map(s => h('li', {}, `${s.id} ${s.title}`))))))));
}

function renderChapterHome(ch) {
  nav.querySelector(`a[href="#/ch${ch.num}"]`)?.classList.add('active');
  main.append(
    h('div', { class: 'eyebrow' }, `Chapter ${ch.num}`),
    h('h1', {}, ch.title),
    h('p', { class: 'lede' }, ch.tagline));
  const idea = h('div', { class: 'card idea' }, h('h3', {}, '💡 Big idea: ' + ch.bigIdea.title));
  ch.bigIdea.render(idea);
  main.append(idea);
  main.append(h('h2', {}, 'Sections'));
  main.append(h('div', { class: 'home-grid' }, ch.sections.map(s => h('a', { class: 'home-card', href: `#/ch${ch.num}/${s.id}` },
    h('div', { class: 'card' }, h('div', { class: 'eyebrow' }, s.id), h('h3', {}, s.title), h('p', { class: 'small', html: s.blurb }))))));
}

function renderSection(ch, sec) {
  nav.querySelector(`a[href="#/ch${ch.num}/${sec.id}"]`)?.classList.add('active');
  const idx = allSections.findIndex(x => x.sec.id === sec.id);
  const prev = allSections[idx - 1], next = allSections[idx + 1];
  main.append(
    h('div', { class: 'eyebrow' }, `Chapter ${ch.num} · ${ch.title}`),
    h('h1', {}, `${sec.id}  ${sec.title}`),
    h('p', { class: 'lede', html: sec.blurb }));
  const body = h('div');
  main.append(body);
  try { sec.render(body); } catch (e) { body.append(h('div', { class: 'card warn' }, 'This section failed to render: ' + e.message)); console.error(e); }
  const cb = h('input', { type: 'checkbox' }); cb.checked = !!progress[sec.id];
  const toggle = h('label', { class: 'done-toggle' }, cb, h('span', {}, 'I can explain this picture to someone else (mark as understood)'));
  cb.addEventListener('change', () => { if (cb.checked) progress[sec.id] = true; else delete progress[sec.id]; saveProgress(); updateProgress(); });
  main.append(toggle);
  main.append(h('div', { class: 'pager' },
    prev ? h('a', { href: `#/ch${prev.ch.num}/${prev.sec.id}` }, `← ${prev.sec.id} ${prev.sec.title}`) : h('span'),
    next ? h('a', { href: `#/ch${next.ch.num}/${next.sec.id}` }, `${next.sec.id} ${next.sec.title} →`) : h('span')));
}

document.getElementById('menu-toggle').addEventListener('click', () => sidebar.classList.toggle('open'));
// theme toggle
const themeBtn = h('button', { class: 'btn theme-btn', title: 'Toggle light/dark' }, '◐');
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.dataset.theme;
  const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('pc11-theme', document.documentElement.dataset.theme); } catch {}
});
try { const t = localStorage.getItem('pc11-theme'); if (t) document.documentElement.dataset.theme = t; } catch {}
document.body.append(themeBtn);

window.addEventListener('hashchange', route);
// KaTeX loads deferred; render once it's there so formulas show on first paint.
const start = () => { buildNav(); route(); };
if (window.katex) start(); else window.addEventListener('load', start);
