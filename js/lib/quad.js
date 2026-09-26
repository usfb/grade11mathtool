// Shared drawing for quadratics: parabola + vertex + axis + intercepts.
import { quadraticRoots, fmt } from './math.js';

export function autoBounds(a, b, c) {
  const vx = a === 0 ? 0 : -b / (2 * a), vy = a === 0 ? c : c - b * b / (4 * a);
  const roots = quadraticRoots(a, b, c);
  const xs = [vx, 0, ...roots];
  let xmin = Math.min(...xs) - 3, xmax = Math.max(...xs) + 3;
  const span = Math.max(xmax - xmin, 8); const mid = (xmin + xmax) / 2; xmin = mid - span / 2; xmax = mid + span / 2;
  const ys = [vy, c, 0];
  let ymin = Math.min(...ys), ymax = Math.max(...ys);
  const pad = Math.max(2.5, (ymax - ymin) * 0.35);
  ymin -= pad; ymax += pad;
  const yspan = Math.max(ymax - ymin, 8); const ymid = (ymin + ymax) / 2;
  return { xmin, xmax, ymin: ymid - yspan / 2, ymax: ymid + yspan / 2 };
}

export function drawQuadratic(p, a, b, c, o = {}) {
  const { color = 's1', width = 2.5, vertex = true, axis = true, roots = true, yint = true, dash, opacity = 1, labels = true } = o;
  p.fn(x => a * x * x + b * x + c, { color, width, dash, opacity });
  const vx = a === 0 ? 0 : -b / (2 * a), vy = a * vx * vx + b * vx + c;
  if (axis && a !== 0) p.vline(vx, { color: 's4', width: 1 });
  if (roots) quadraticRoots(a, b, c).forEach((r, i, arr) => p.point(r, 0, { color: 's3', label: labels ? `x = ${fmt(r, 3)}` : null, pos: (a > 0 ? 's' : 'n') + (arr.length === 1 ? '' : i === 0 ? 'w' : 'e') }));
  if (yint) p.point(0, c, { color: 's2', r: 4, label: labels ? `(0, ${fmt(c)})` : null, pos: 'e' });
  if (vertex && a !== 0) p.point(vx, vy, { color: 's4', label: labels ? `vertex (${fmt(vx, 3)}, ${fmt(vy, 3)})` : null, pos: a > 0 ? 's' : 'n' });
  return { vx, vy };
}
