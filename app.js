(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const D = window.PRIMETICK;
  const byId = Object.fromEntries(D.watches.map(w => [w.id, w]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const imgSrc = w => `assets/watches/${w.img}.jpg`;
  const waURL = msg => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(msg)}`;
  const askMsg = w => `Hi Primetick, is the ${w.name} (PT-${w.id}) available? What's the price today?`;
  $$('.wa-link').forEach(a => { a.href = waURL(a.dataset.msg); a.target = '_blank'; a.rel = 'noopener'; });
  $('#yr').textContent = new Date().getFullYear();
  $('#dateline').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#trustCount').textContent = D.watches.length;

  /* The catalogue uses original photographs; the deck and hero use cutouts. */
  $('#grid').innerHTML = D.watches.map(w => `<article class="card-wrap" data-tags="${w.tags.join(' ')}"><div class="card">
    <button class="card-hit" data-id="${w.id}" aria-label="See the real photo of ${w.name}">
      <div class="ph"><div><img src="${imgSrc(w)}" alt="${w.name}" width="600" height="750" loading="lazy"></div></div>
      <span class="no">PT-${w.id}</span><h3>${w.name}</h3><p class="meta">${w.meta}</p>
    </button><a class="ask" href="${waURL(askMsg(w))}" aria-label="Ask for the price of ${w.name}" target="_blank" rel="noopener">Ask for the price</a>
  </div></article>`).join('');
  const updateCount = () => {
    const count = $$('.card-wrap:not(.hide)').length;
    $('#catalogueCount').textContent = `${count} ${count === 1 ? 'watch' : 'watches'}`;
  };
  updateCount();
  $$('.chip').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip').forEach(c => { c.classList.toggle('on', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
    $$('.card-wrap').forEach(c => {
      const hide = chip.dataset.f !== 'all' && !c.dataset.tags.split(' ').includes(chip.dataset.f);
      c.classList.toggle('hide', hide);
    });
    updateCount();
  }));

  /* Keep the actual photograph uncropped in the product viewer. */
  const qv = $('#qv');
  const openQV = id => {
    const w = byId[id]; if (!w) return;
    $('#qvImg').src = imgSrc(w); $('#qvImg').alt = w.name;
    $('#qvNo').textContent = 'Classified · PT-' + w.id;
    $('#qvName').textContent = w.name; $('#qvMeta').textContent = w.meta;
    $('#qvCta').href = waURL(askMsg(w));
    if (typeof qv.showModal === 'function') qv.showModal(); else window.open(waURL(askMsg(w)), '_blank');
  };
  document.addEventListener('click', e => { const t = e.target.closest('.card-hit, .watch-hit'); if (t) openQV(t.dataset.id); });
  $('#qvClose').addEventListener('click', () => qv.close());
  qv.addEventListener('click', e => { if (e.target === qv) qv.close(); });

  /* The deck: swipeable playing cards. */
  (() => {
    const hand = (D.deck || []).filter(c => byId[c.id]);
    const deckEl = $('#deck');
    if (!hand.length || !deckEl) return;
    deckEl.innerHTML = hand.map((c, i) => {
      const w = byId[c.id], red = c.suit === '♥' || c.suit === '♦';
      const img = w.cutout
        ? `<img class="cut" src="${w.cutout}" alt="" draggable="false">`
        : `<img src="${imgSrc(w)}" alt="" draggable="false" ${i > 1 ? 'loading="lazy"' : ''}>`;
      const idx = `<span class="r">${c.rank}</span><span class="s">${c.suit}</span>`;
      return `<article class="pcard${red ? ' red' : ''}" data-i="${i}" data-watch="${w.id}" aria-label="${w.name}">
        <div class="idx tl">${idx}</div><div class="art">${img}</div><div class="idx br">${idx}</div></article>`;
    }).join('');
    const cards = $$('.pcard', deckEl);
    let order = hand.map((_, i) => i);
    const SLOTS = [{ x: 0, y: 0, r: 0, s: 1 }, { x: 16, y: 10, r: 6, s: .96 }, { x: -14, y: 16, r: -5, s: .93 }];
    const slot = p => SLOTS[Math.min(p, SLOTS.length - 1)];
    const tf = ({ x, y, r, s }) => `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s})`;
    const lerp = (a, b, t) => a + (b - a) * t;
    const setInfo = () => {
      const c = hand[order[0]], w = byId[c.id];
      $('#deckNum').textContent = String(order[0] + 1).padStart(2, '0');
      $('#deckName').textContent = w.name; $('#deckLine').textContent = c.line;
      $('#deckCta').href = waURL(askMsg(w));
    };
    const layout = skip => {
      order.forEach((ci, p) => {
        const el = cards[ci]; el.style.zIndex = cards.length - p;
        el.setAttribute('aria-hidden', p ? 'true' : 'false');
        if (el === skip) return;
        el.style.opacity = p < SLOTS.length ? 1 : 0; el.style.transform = tf(slot(p));
      }); setInfo();
    };
    $('#deckTotal').textContent = String(hand.length).padStart(2, '0'); layout();
    let flying = null;
    const finishFly = () => {
      if (!flying) return;
      const { el, timer } = flying; clearTimeout(timer); flying = null;
      el.style.transition = 'none'; el.style.opacity = 0; el.style.transform = tf(slot(order.length - 1));
      el.offsetWidth; el.style.transition = ''; layout();
    };
    const next = (dir = 1, fromY = 0) => {
      finishFly(); const el = cards[order[0]], W = deckEl.offsetWidth; order.push(order.shift());
      el.style.transition = reduce ? 'opacity 200ms ease' : 'transform 420ms var(--ease-out), opacity 250ms ease';
      el.style.transform = reduce ? tf(SLOTS[0]) : `translate3d(${dir * W * 1.7}px,${fromY + 40}px,0) rotate(${dir * 28}deg)`;
      if (reduce) el.style.opacity = 0;
      layout(el); flying = { el, timer: setTimeout(finishFly, reduce ? 200 : 420) }; navigator.vibrate?.(8);
    };
    const prev = () => {
      finishFly(); const ci = order.pop(); order.unshift(ci);
      const el = cards[ci], W = deckEl.offsetWidth;
      el.style.transition = 'none'; el.style.zIndex = cards.length + 1; el.style.opacity = reduce ? 0 : 1;
      el.style.transform = reduce ? tf(SLOTS[0]) : `translate3d(${-W * 1.7}px,40px,0) rotate(-28deg)`;
      el.offsetWidth; el.style.transition = ''; layout();
    };
    let drag = null;
    deckEl.addEventListener('pointerdown', e => {
      const el = e.target.closest('.pcard');
      if (drag || !el || el !== cards[order[0]] || e.button > 0) return;
      finishFly();
      drag = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t0: performance.now(), hist: [], horizontal: null };
      el.setPointerCapture(e.pointerId);
    });
    deckEl.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
      if (drag.horizontal === null && Math.hypot(drag.dx, drag.dy) > 6) drag.horizontal = Math.abs(drag.dx) > Math.abs(drag.dy);
      if (!drag.horizontal) return;
      const now = performance.now(); drag.hist.push({ x: e.clientX, t: now }); drag.hist = drag.hist.filter(h => now - h.t < 100);
      drag.el.classList.add('dragging'); drag.el.style.transform = `translate3d(${drag.dx}px,${drag.dy * .25}px,0) rotate(${drag.dx / 14}deg)`;
      const t = Math.min(Math.abs(drag.dx) / 160, 1), a = SLOTS[1], b = SLOTS[0], under = cards[order[1]];
      if (under) { under.style.transition = 'none'; under.style.transform = tf({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), s: lerp(a.s, b.s, t) }); }
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const { el, dx, dy, hist, t0, horizontal } = drag; drag = null; el.classList.remove('dragging');
      const under = cards[order[1]]; if (under) under.style.transition = '';
      const h0 = hist[0], h1 = hist[hist.length - 1];
      const v = h0 && h1 && h1.t > h0.t ? Math.abs(h1.x - h0.x) / (h1.t - h0.t) : 0;
      if (!horizontal && Math.hypot(dx, dy) < 6 && performance.now() - t0 < 350 && e.type === 'pointerup') { openQV(hand[order[0]].id); return; }
      if (horizontal && (Math.abs(dx) > deckEl.offsetWidth * .32 || v > .45)) next(Math.sign(dx) || 1, dy * .25); else layout();
    };
    deckEl.addEventListener('pointerup', end); deckEl.addEventListener('pointercancel', end);
    $('#deckNext').addEventListener('click', () => { next(1); });
    $('#deckPrev').addEventListener('click', () => { prev(); });
    deckEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Enter') openQV(hand[order[0]].id);
    });
  })();
})();
