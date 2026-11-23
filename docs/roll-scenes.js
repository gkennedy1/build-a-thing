(() => {
  const props = {
    pencil: '<path fill="#ffce65" d="M-8 2 3-6l4 5-11 8-4 1Z"/><path fill="#f9f7f3" d="m-8 8 4-1-4-5Z"/>',
    note: '<rect x="-6" y="-7" width="12" height="14" rx="1.5" fill="#f9f7f3" transform="rotate(14)"/><path d="m-2-2 5 1m-6 2 4 1" fill="none" stroke-linecap="round"/>',
    block: '<rect x="-7" y="-6" width="14" height="12" rx="2" fill="#ff8464" transform="rotate(-12)"/><path fill="#ffce65" d="m-4-3 6-1 1 5-6 1Z"/>',
    gear: '<path fill="#ffce65" d="M-3-8h6l1 3 3 1 2 4-2 4-3 1-1 3h-6l-1-3-3-1-2-4 2-4 3-1Z"/><circle r="2.5" fill="#f9f7f3"/>',
    die: '<rect x="-7" y="-7" width="14" height="14" rx="3" fill="#ff8464" transform="rotate(-13)"/><path d="M-3-3h.1M0 0h.1m2.9 3h.1" stroke-width="2" stroke-linecap="round"/>',
    star: '<path fill="#ffce65" d="m0-9 2.8 5.5 6.2 1-4.5 4.4 1 6.1L0 5.1-5.5 8l1-6.1L-9-2.5l6.2-1Z"/>'
  };
  const scenes = {
    desk: ['pencil', 'note'],
    workbench: ['block', 'gear'],
    arcade: ['die', 'star']
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const radius = 13;
  const start = 22;
  const travel = 95;
  const centerY = 29;
  const pickups = [
    { x: 52, y: 39, contact: 42 },
    { x: 90, y: 20, contact: 79 }
  ];
  const animations = new Map();

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .6) continue;
      observer.unobserve(entry.target);
      animations.get(entry.target)();
      animations.delete(entry.target);
    }
  }, { threshold: .6 }) : null;

  for (const scene of document.querySelectorAll('[data-roll-scene]')) {
    const objects = scenes[scene.dataset.rollScene];
    scene.innerHTML = `
      <svg viewBox="0 0 144 56">
        <path d="M7 46h130" fill="none" stroke="currentColor" stroke-opacity=".24"
          stroke-width="1.3" stroke-dasharray="1 5" stroke-linecap="round"/>
        <g stroke="#003e2b" stroke-width="1.35" stroke-linejoin="round">
          <g class="roll-ball">
            <circle r="13" fill="#ace589"/>
            <path fill="#76bd66" stroke="none" d="M-12 4A13 13 0 0 0 11-6 13 13 0 0 1-12 4Z"/>
            <path d="M-8-4q1-3 4-4" fill="none" stroke="#f9f7f3" stroke-width="1.6" stroke-linecap="round"/>
          </g>
          ${objects.map(name => `<g class="roll-object">${props[name]}</g>`).join('')}
        </g>
      </svg>`;

    const ball = scene.querySelector('.roll-ball');
    const items = scene.querySelectorAll('.roll-object');
    const degrees = distance => distance * 180 / (Math.PI * radius);

    function draw(progress) {
      const x = start + travel * progress;
      ball.setAttribute('transform', `translate(${x} ${centerY}) rotate(${degrees(x - start)})`);

      pickups.forEach((item, index) => {
        // After contact the prop keeps its offset from the ball and rotates with it.
        const transform = x < item.contact
          ? `translate(${item.x} ${item.y})`
          : `translate(${x} ${centerY}) rotate(${degrees(x - item.contact)}) translate(${item.x - item.contact} ${item.y - centerY})`;
        items[index].setAttribute('transform', transform);
      });
    }

    if (reducedMotion.matches || !observer) {
      draw(1);
      continue;
    }

    draw(0);
    animations.set(scene, () => {
      let began;
      function frame(now) {
        began ??= now;
        const time = reducedMotion.matches ? 1 : Math.min(1, (now - began) / 900);
        draw(time * time * (3 - 2 * time));
        if (time < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    observer.observe(scene);
  }
})();
