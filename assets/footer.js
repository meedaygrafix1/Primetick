/* Footer: the stop-press clock (runs only while the footer is on screen)
   and the nameplate rising into its crop once. */
(() => {
  const foot = document.querySelector('.footer');
  const clock = document.getElementById('footClock');
  const mark = document.getElementById('footMark');
  if (!foot || !clock) return;

  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date();
    clock.innerHTML = `${pad(d.getHours())}:${pad(d.getMinutes())}<span>:${pad(d.getSeconds())}</span>`;
  };
  tick();

  let timer = 0;
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) { tick(); timer = setInterval(tick, 1000); }
  }).observe(foot);

  if (mark) {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { mark.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(mark);
  }
})();
