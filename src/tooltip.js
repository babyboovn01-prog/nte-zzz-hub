// Shared hover/tap tooltip — one element reused for the whole hub.
// Usage: put data-tip-name="<name>" + data-tip-kind="char|w|d|b|a" (+ data-tip-game="NTE|ZZZ"
// for characters) on any element, call initTooltips() once and refreshTips() after any
// dynamic re-render. Content is built from the roster/item data already in the hub —
// nothing is invented: a name with no data gets an honest "not in database" tooltip.
// Mouse: follows the cursor. Touch: tap toggles (tap again / tap elsewhere closes).
import { NTE_ROSTER, ZZZ_ROSTER } from './characters.js';
import { ZZZ_WENGINES, ZZZ_DISCS, ZZZ_BANGBOO, NTE_ARCS } from './items.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rows = pairs => pairs.map(([k, v]) => `<div class="tt-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
const box = (name, inner) => `<b class="tt-title">${esc(name)}</b>${inner}`;
const missing = name => `<b class="tt-title">${esc(name)}</b><div class="tt-note">Stats not in the PityHub database yet — shown as-is rather than guessed.</div>`;

export function charTip(game, name) {
  const roster = game === 'ZZZ' ? ZZZ_ROSTER : NTE_ROSTER;
  const r = roster.find(x => x[0] === name);
  if (!r) return missing(name);
  if (game === 'ZZZ') {
    return box(name, rows([['Rank', r[1]], ['Attribute', r[2]], ['Specialty', r[3]], ['Faction', r[4]], ['Version', r[5]], ['Released', r[6]]]));
  }
  return box(name, rows([['Rank', r[1]], ['Element', r[2]], ['Arc type', r[3]], ['Role', r[4]], ['Status', r[5]]]));
}

export function itemTip(kind, name) {
  if (kind === 'w') {
    const r = ZZZ_WENGINES.find(x => x[0] === name);
    if (!r) return missing(name);
    return box(name, rows([['Rank', r[1]], ['Specialty', r[2]], ['Base stat (Lv. 1)', `${r[3]} ${r[4]}`], ['Type', 'W-Engine (ZZZ)']]));
  }
  if (kind === 'd') {
    const r = ZZZ_DISCS.find(x => x[0] === name);
    if (!r) return missing(name);
    return box(name, rows([['Area Patrol stage', r[1]], ['Added in', r[2]], ['2-pc / 4-pc bonus', 'See in-game'], ['Type', 'Drive Disc set (ZZZ)']]));
  }
  if (kind === 'b') {
    const r = ZZZ_BANGBOO.find(x => x[0] === name);
    if (!r) return missing(name);
    return box(name, rows([['Rank', r[1]], ['Attribute', r[2]], ['Faction', r[3]], ['Released', r[4]], ['Type', 'Bangboo (ZZZ)']]));
  }
  if (kind === 'a') {
    const r = NTE_ARCS.find(x => x[0] === name);
    if (!r) return missing(name);
    return box(`${name} — ${r[1]}`, rows([['Signature Arc', r[1]], ['Arc type', r[2]], ['Weapon type', r[3]], ['Type', 'Arc (NTE)']]));
  }
  return missing(name);
}

// Fill data-tip content for every [data-tip-name] element under root.
export function refreshTips(root = document) {
  root.querySelectorAll('[data-tip-name]').forEach(el => {
    const kind = el.dataset.tipKind || 'char';
    const name = el.dataset.tipName;
    el.dataset.tip = kind === 'char' ? charTip(el.dataset.tipGame || 'ZZZ', name) : itemTip(kind, name);
  });
}

let tipEl = null, pinnedEl = null, lastX = 0, lastY = 0;

function place(x, y) {
  if (!tipEl) return;
  tipEl.style.display = 'block';
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let left = x + 14, top = y + 14;
  if (left + w > window.innerWidth - 8) left = x - w - 14;
  if (top + h > window.innerHeight - 8) top = y - h - 14;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  tipEl.style.left = left + 'px';
  tipEl.style.top = top + 'px';
}

function show(el, x, y) {
  if (!el.dataset.tip) return;
  tipEl.innerHTML = el.dataset.tip;
  tipEl.classList.toggle('pinned', pinnedEl === el);
  place(x, y);
}

function hide() {
  if (!tipEl) return;
  tipEl.style.display = 'none';
  tipEl.classList.remove('pinned');
}

export function initTooltips() {
  if (tipEl) { refreshTips(); return; }
  tipEl = document.createElement('div');
  tipEl.id = 'ph-tip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);
  refreshTips();
  document.addEventListener('mousemove', e => { lastX = e.clientX; lastY = e.clientY; });
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el || pinnedEl) return;
    show(el, lastX, lastY);
  });
  document.addEventListener('mouseout', e => {
    const el = e.target.closest('[data-tip]');
    if (!el || pinnedEl) return;
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-tip]')) hide();
  });
  document.addEventListener('mousemove', e => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el && !pinnedEl && tipEl.style.display === 'block') place(e.clientX, e.clientY);
  });
  // Touch / click: tap toggles a pinned tooltip; tap elsewhere closes it.
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el) {
      if (pinnedEl === el) { pinnedEl = null; hide(); }
      else {
        pinnedEl = el;
        const r = el.getBoundingClientRect();
        show(el, r.left + r.width / 2, r.bottom);
      }
    } else if (pinnedEl) { pinnedEl = null; hide(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pinnedEl) { pinnedEl = null; hide(); } });
  window.addEventListener('scroll', () => { if (pinnedEl) hide(), pinnedEl = null; }, true);
}
