(() => {
  const hero = document.querySelector('.intro');
  const wave = hero?.querySelector('.hero-wave path');
  if (!wave) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const flat = wave.getAttribute('d');
  let frame = 0;

  function draw() {
    frame = 0;
    const viewport = window.innerHeight;
    const boundary = hero.getBoundingClientRect().bottom;
    // Raise the crest as the boundary enters view, then lower it as Projects takes over.
    const progress = (viewport * .92 - boundary) / (viewport * .62);
    if (progress <= 0 || progress >= 1) {
      wave.setAttribute('d', flat);
      return;
    }

    const crest = (100 - 92 * Math.sin(Math.PI * progress) ** 2).toFixed(1);
    wave.setAttribute('d', `M0 100H260C395 100 449 ${crest} 500 ${crest}S605 100 740 100H1000V101H0Z`);
  }

  function queueDraw() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function syncMotion() {
    if (reducedMotion.matches) {
      window.removeEventListener('scroll', queueDraw);
      window.removeEventListener('resize', queueDraw);
      cancelAnimationFrame(frame);
      frame = 0;
      wave.setAttribute('d', flat);
      return;
    }
    window.addEventListener('scroll', queueDraw, { passive: true });
    window.addEventListener('resize', queueDraw);
    queueDraw();
  }

  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
