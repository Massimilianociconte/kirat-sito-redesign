(() => {
const d = document, root = d.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = (s, el = d) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const EMAIL = 'info@kirat.it', KEY = 'kirat-richiesta';
const hdr = d.querySelector('.hdr');
let lastY = scrollY, ticking = false;
const parallax = reduce ? [] : $$('[data-parallax]');
const steps = d.querySelector('[data-steps]');
const onScroll = () => {
const y = scrollY, max = root.scrollHeight - innerHeight;
if (hdr) {
hdr.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
hdr.classList.toggle('is-scrolled', y > 40);
if (!d.body.classList.contains('nav-open')) hdr.classList.toggle('is-hidden', y > lastY && y > 320);
}
lastY = y;
for (const el of parallax) {
const r = el.parentElement.getBoundingClientRect();
if (r.bottom < 0 || r.top > innerHeight) continue;
el.style.transform = `translate3d(0,${(-r.top * parseFloat(el.dataset.parallax)).toFixed(1)}px,0)`;
}
if (steps) {
const r = steps.getBoundingClientRect();
steps.style.setProperty('--prog', clamp((innerHeight * .6 - r.top) / r.height, 0, 1).toFixed(3));
}
ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
const navBtn = d.querySelector('.nav-btn'), nav = d.getElementById('nav');
const setNav = open => {
navBtn.setAttribute('aria-expanded', open);
navBtn.querySelector('.sr').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
d.body.classList.toggle('nav-open', open);
if (open) { hdr.classList.remove('is-hidden'); nav.querySelector('a').focus({ preventScroll: true }); }
};
navBtn && navBtn.addEventListener('click', () => setNav(navBtn.getAttribute('aria-expanded') !== 'true'));
nav && nav.addEventListener('click', e => { if (e.target.closest('a') && d.body.classList.contains('nav-open')) setNav(false); });
d.addEventListener('keydown', e => { if (e.key === 'Escape' && d.body.classList.contains('nav-open')) { setNav(false); navBtn.focus(); } });
const revealed = $$('[data-reveal], .draw, .drip-wrap, .grain-fig');
if ('IntersectionObserver' in window && !reduce) {
const io = new IntersectionObserver(es => es.forEach(e => {
if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
revealed.forEach(el => io.observe(el));
} else revealed.forEach(el => el.classList.add('is-in'));
if (!reduce && 'IntersectionObserver' in window) {
const co = new IntersectionObserver(es => es.forEach(e => {
if (!e.isIntersecting) return;
co.unobserve(e.target);
const el = e.target, to = +el.dataset.count, t0 = performance.now();
const run = t => { const k = clamp((t - t0) / 900, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(run); };
requestAnimationFrame(run);
}), { threshold: .6 });
$$('[data-count]').forEach(el => co.observe(el));
}
const prev = d.querySelector('.li-preview');
if (prev && fine && !reduce) {
const pimg = prev.querySelector('img');
let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; prev.style.setProperty('--x', `${x.toFixed(1)}px`); prev.style.setProperty('--y', `${y.toFixed(1)}px`); raf = requestAnimationFrame(loop); };
$$('[data-preview]').forEach(a => {
a.addEventListener('pointerenter', e => {
pimg.src = a.dataset.preview; tx = x = e.clientX + 30; ty = y = e.clientY - 120;
prev.classList.add('on'); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
});
a.addEventListener('pointermove', e => { tx = e.clientX + 30; ty = e.clientY - 120; });
a.addEventListener('pointerleave', () => { prev.classList.remove('on'); setTimeout(() => { if (!prev.classList.contains('on')) cancelAnimationFrame(raf); }, 400); });
});
}
if (fine && !reduce) $$('[data-tilt]').forEach(n => {
let raf = 0;
n.addEventListener('pointermove', e => {
cancelAnimationFrame(raf);
raf = requestAnimationFrame(() => {
const r = n.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
n.style.setProperty('--ry', `${((x - .5) * 8).toFixed(2)}deg`); n.style.setProperty('--rx', `${((.5 - y) * 6).toFixed(2)}deg`);
});
});
n.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); n.style.removeProperty('--ry'); n.style.removeProperty('--rx'); });
});
const showOnly = (items, test, animate = true) => {
let n = 0;
items.forEach(el => {
const show = test(el);
el.classList.toggle('is-out', !show);
if (!animate) { n += show; return; }
el.classList.remove('flt-in');
if (show) { void el.offsetWidth; el.style.setProperty('--n', n++); el.classList.add('flt-in', 'is-in'); }
});
return n;
};
$$('[data-explorer]').forEach(ex => {
const chips = $$('.flav-chips .chip', ex), cards = $$('[data-ex-grid] > *', ex), status = ex.querySelector('[data-ex-status]');
const pick = (chip, push) => {
chips.forEach(c => c.setAttribute('aria-pressed', c === chip));
const f = chip.dataset.f;
const n = showOnly(cards, el => f === '*' || el.dataset.flav.split(' ').includes(f), push);
status.innerHTML = f === '*' ? `Tutti i <b>${n}</b> prodotti con gusti` : `<b>${chip.dataset.name}</b>: in ${n} ${n === 1 ? 'prodotto' : 'prodotti'}`;
if (push) { const u = new URL(location); f === '*' ? u.searchParams.delete('gusto') : u.searchParams.set('gusto', f); history.replaceState(null, '', u); }
};
chips.forEach(c => c.addEventListener('click', () => pick(c, true)));
const want = new URLSearchParams(location.search).get('gusto');
pick(chips.find(c => c.dataset.f === want) || chips.find(c => c.getAttribute('aria-pressed') === 'true') || chips[0], false);
});
const filterBar = (bar, items, attr) => {
const btns = $$('button', bar);
btns.forEach(b => b.addEventListener('click', () => {
btns.forEach(x => x.setAttribute('aria-pressed', x === b));
showOnly(items, el => b.dataset.v === '*' || el.dataset[attr].split(' ').includes(b.dataset.v));
}));
};
const kf = d.querySelector('[data-kind-filter]');
if (kf) {
const secs = $$('[data-kind-target] .line-sec'), btns = $$('button', kf);
btns.forEach(b => b.addEventListener('click', () => {
btns.forEach(x => x.setAttribute('aria-pressed', x === b));
const v = b.dataset.v;
secs.forEach(s => {
const n = showOnly($$('.pcard', s), el => v === '*' || el.dataset.kind.split(' ').includes(v));
s.hidden = n === 0;
});
}));
}
const lf = d.querySelector('[data-line-filter]');
if (lf) filterBar(lf, $$('[data-line-target] tbody tr'), 'line');
$$('.faq details').forEach(det => {
const sum = det.querySelector('summary'), body = det.querySelector('.faq-a');
sum.addEventListener('click', e => {
if (reduce || !body.animate) return;
e.preventDefault();
if (det.open) {
body.animate({ height: [`${body.offsetHeight}px`, '0px'], opacity: [1, 0] }, { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => det.open = false;
} else {
det.open = true;
body.animate({ height: ['0px', `${body.offsetHeight}px`], opacity: [0, 1] }, { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
}
});
});
const toast = d.querySelector('.toast');
let tt;
const say = msg => {
if (!toast) return;
toast.innerHTML = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5 9.5-10"/></svg>${msg}`;
toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2400);
};
const copy = async text => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
if (!await copy(b.dataset.copy)) return;
b.classList.add('ok'); setTimeout(() => b.classList.remove('ok'), 1600);
say(b.dataset.copy.includes('@') ? 'Email copiata' : 'Numero copiato');
}));
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {  } badge(list, true); };
const badge = (list = load(), bump = false) => {
const n = list.reduce((s, it) => s + it.cartons, 0);
$$('[data-rq-count]').forEach(el => { el.textContent = n; el.hidden = !n; if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } });
$$('[data-rq-link]').forEach(a => a.setAttribute('aria-label', n ? `La tua richiesta d’ordine: ${n} ${n === 1 ? 'cartone' : 'cartoni'}` : 'La tua richiesta d’ordine'));
};
badge();
const add = item => {
const list = load();
const same = list.find(x => x.id === item.id && JSON.stringify(x.mix) === JSON.stringify(item.mix) && x.opt === item.opt);
same ? same.cartons += item.cartons : list.push(item);
save(list);
say(`Aggiunto alla richiesta · <a href="/kirat-sito-redesign/richiesta/" style="text-decoration:underline;pointer-events:auto">Apri</a>`);
toast && (toast.style.pointerEvents = 'auto', setTimeout(() => toast.style.pointerEvents = '', 2400));
};
const qtyStepper = scope => {
const out = scope.querySelector('.qty output');
let q = 1;
scope.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { q = clamp(q + +b.dataset.q, 1, 999); out.textContent = q; }));
return () => q;
};
const holdRepeat = (btn, fn) => {
let t, r;
const stop = () => { clearTimeout(t); clearInterval(r); };
btn.addEventListener('pointerdown', e => { if (e.button) return; t = setTimeout(() => { r = setInterval(fn, 70); }, 380); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
btn.addEventListener('click', fn);
};
$$('[data-cx]').forEach(cx => {
const cap = +cx.dataset.cap, rows = $$('.cx-list li', cx), cells = $$('.cx-cells i', cx);
const nOut = cx.querySelector('[data-cx-n]'), state = cx.querySelector('[data-cx-state]'), bar = cx.querySelector('.cx-bar i');
const addBtn = cx.querySelector('[data-cx-add]'), qty = qtyStepper(cx);
const count = rows.map(() => 0);
const total = () => count.reduce((a, b) => a + b, 0);
const render = () => {
const t = total();
rows.forEach((li, i) => {
li.querySelector('output').textContent = count[i];
li.classList.toggle('has', count[i] > 0);
li.querySelector('[data-d="-1"]').disabled = !count[i];
li.querySelector('[data-d="1"]').disabled = t >= cap;
});
let k = 0;
rows.forEach((li, i) => { for (let j = 0; j < count[i]; j++, k++) { const c = cells[k]; if (!c.classList.contains('on') || c.dataset.i != i) { c.classList.add('on'); c.dataset.i = i; c.style.setProperty('--c', li.style.getPropertyValue('--c')); } } });
for (; k < cells.length; k++) { cells[k].classList.remove('on'); delete cells[k].dataset.i; }
nOut.textContent = t;
bar.style.setProperty('--f', t / cap);
state.textContent = t === cap ? 'cartone completo' : `mancano ${cap - t}`;
state.classList.toggle('ok', t === cap);
addBtn.disabled = t !== cap;
};
rows.forEach((li, i) => $$('[data-d]', li).forEach(b => holdRepeat(b, () => {
const dlt = +b.dataset.d;
if (dlt > 0 && total() >= cap) return;
count[i] = clamp(count[i] + dlt, 0, cap); render();
})));
cx.querySelector('[data-cx-fill]').addEventListener('click', () => {
let idx = count.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0);
if (!idx.length || total() >= cap) { count.fill(0); idx = rows.map((_, i) => i); }
let left = cap - total(), j = 0;
while (left > 0) { count[idx[j % idx.length]]++; left--; j++; }
render();
});
cx.querySelector('[data-cx-clear]').addEventListener('click', () => { count.fill(0); render(); });
addBtn.addEventListener('click', () => {
const mix = rows.map((li, i) => [li.dataset.f, count[i], li.style.getPropertyValue('--c')]).filter(m => m[1] > 0);
add({ id: cx.dataset.pid, name: cx.dataset.name, url: cx.dataset.url, fmt: cx.dataset.fmt, cap, unit: cx.dataset.unit, cartons: qty(), mix, opt: '' });
});
render();
});
$$('[data-rq-simple]').forEach(f => {
const qty = qtyStepper(f);
f.querySelector('[data-rq-add]').addEventListener('click', () => {
const opt = $$('input:checked', f).map(i => i.value).join(' · ');
add({ id: f.dataset.pid, name: f.dataset.name, url: f.dataset.url, fmt: f.dataset.fmt, cap: 0, unit: f.dataset.unit, cartons: qty(), mix: [], opt });
});
});
const page = d.querySelector('[data-rq-page]');
if (page) {
const form = d.querySelector('[data-rq-form]');
const empty = page.innerHTML;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const draw = () => {
const list = load();
if (!list.length) { page.innerHTML = empty; return; }
page.innerHTML = list.map((it, i) => `<article class="rq-item"><div><h3><a href="${esc(it.url)}">${esc(it.name)}</a></h3>
<p class="rq-meta">${esc(it.fmt)}${it.cap ? ` · cartone da ${it.cap} ${esc(it.unit)}` : ''}${it.opt ? ` · ${esc(it.opt)}` : ''}</p></div>
<div class="rq-side"><span class="step"><button type="button" data-i="${i}" data-dq="-1" aria-label="Un cartone in meno"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M5.5 12h13"/></svg></button><output>${it.cartons}</output><button type="button" data-i="${i}" data-dq="1" aria-label="Un cartone in più"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13"/></svg></button></span>
<button type="button" class="rq-del" data-del="${i}"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/></svg>Rimuovi</button></div>
${it.mix.length ? `<div class="rq-mix">${it.mix.map(m => `<span style="--c:${esc(m[2])}"><i></i>${esc(m[0])} × ${m[1]}</span>`).join('')}</div>` : ''}</article>`).join('');
};
page.addEventListener('click', e => {
const b = e.target.closest('button'); if (!b) return;
const list = load();
if (b.dataset.del != null) list.splice(+b.dataset.del, 1);
else if (b.dataset.dq) { const it = list[+b.dataset.i]; it.cartons = clamp(it.cartons + +b.dataset.dq, 1, 999); }
save(list); draw();
});
const text = () => {
const list = load(), fd = new FormData(form);
const who = ['nome', 'azienda', 'citta'].map(k => (fd.get(k) || '').trim()).filter(Boolean).join(' – ');
const lines = list.map((it, i) => `${i + 1}. ${it.name} (${it.fmt}) – ${it.cartons} ${it.cartons === 1 ? 'cartone' : 'cartoni'}` +
(it.cap ? ` da ${it.cap} ${it.unit}` : '') + (it.opt ? `\n   ${it.opt}` : '') + (it.mix.length ? `\n   Composizione per cartone: ${it.mix.map(m => `${m[0]} ${m[1]}`).join(', ')}` : ''));
const note = (fd.get('note') || '').trim();
return `Buongiorno,\nvorrei richiedere disponibilità e condizioni per:\n\n${lines.join('\n') || '(nessun prodotto)'}\n${note ? `\nNote: ${note}\n` : ''}\n${who ? `${who}\n` : ''}`;
};
d.querySelector('[data-rq-send]').addEventListener('click', () => {
if (!load().length) { say('La richiesta è vuota'); return; }
location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Richiesta d’ordine dal sito')}&body=${encodeURIComponent(text())}`;
});
d.querySelector('[data-rq-copy]').addEventListener('click', async () => { if (await copy(text())) say('Testo copiato'); });
draw();
}
})();
