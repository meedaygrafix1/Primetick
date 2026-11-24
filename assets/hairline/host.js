/* =========================================================
   Hosts the Hairline figure (exploded-watch.js) inside
   "Under the Glass". The engine (kernel.js) is unchanged;
   this does what the package's bench does, in the site's
   own type: mounts the figure, shows its read-out as a
   caption, lights the matching note, and plays the tour
   while the section is on screen (a real pointer or finger
   takes over the moment it arrives).
   ========================================================= */
(() => {
  const stage = document.getElementById('anatomyStage');
  if (!stage || !window.HL) return;
  const out = document.getElementById('anatomyRead');
  const notes = [...document.querySelectorAll('[data-layer]')];
  const idle = matchMedia('(hover: hover)').matches ? 'Move across the watch' : 'Drag across the watch';

  window.hairline = (figure) => {
    HL.inject(document);
    stage.setAttribute('data-hairline', figure.name);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', figure.means);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);

    let text = '';
    const read = {
      get textContent() { return text; },
      set textContent(v) {
        text = v == null ? '' : String(v);
        const resting = text === 'rest' || !text;
        out.textContent = resting ? idle : text;
        out.classList.toggle('live', !resting);
        notes.forEach((n) => n.classList.toggle('on', n.dataset.layer === text));
      },
    };

    figure.mount({ stage, svg, read }, figure.range[1] + 2);
    if (!text) read.textContent = 'rest';

    let tour = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !tour) tour = HL.tour(stage, figure.tour || HL.LAP);
      else if (!e.isIntersecting && tour) { tour.stop(); tour = null; }
    }, { threshold: 0.45 }).observe(stage);
  };
})();
