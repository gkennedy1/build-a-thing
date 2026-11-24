(() => {
  const props = {
    pencil: '<path fill="#ffce65" d="M-8 2 3-6l4 5-11 8-4 1Z"/><path fill="#f9f7f3" d="m-8 8 4-1-4-5Z"/>',
    note: '<rect x="-6" y="-7" width="12" height="14" rx="1.5" fill="#f9f7f3" transform="rotate(14)"/><path d="m-2-2 5 1m-6 2 4 1" fill="none" stroke-linecap="round"/>',
    block: '<rect x="-7" y="-6" width="14" height="12" rx="2" fill="#ff8464" transform="rotate(-12)"/><path fill="#ffce65" d="m-4-3 6-1 1 5-6 1Z"/>',
    gear: '<path fill="#ffce65" d="M-3-8h6l1 3 3 1 2 4-2 4-3 1-1 3h-6l-1-3-3-1-2-4 2-4 3-1Z"/><circle r="2.5" fill="#f9f7f3"/>',
    die: '<rect x="-7" y="-7" width="14" height="14" rx="3" fill="#ff8464" transform="rotate(-13)"/><path d="M-3-3h.1M0 0h.1m2.9 3h.1" stroke-width="2" stroke-linecap="round"/>',
    star: '<path fill="#ffce65" d="m0-9 2.8 5.5 6.2 1-4.5 4.4 1 6.1L0 5.1-5.5 8l1-6.1L-9-2.5l6.2-1Z"/>',
    key: '<path fill="#c5b1ff" d="M-2-4a5 5 0 1 0-5 5v7h3V6h2V3h-2V1a5 5 0 0 0 2-5Z" transform="rotate(-35)"/><circle cx="-3.5" cy="-3.5" r="1.4" fill="#202020" transform="rotate(-35)"/>',
    leaf: '<path fill="#8ce0c1" d="M-6 4C-10-5 0-8 8-7 8 2 3 9-5 6Z"/><path d="m-8 9 12-12" fill="none" stroke-linecap="round"/>',
    bolt: '<path fill="#ffdf78" d="M0-9-7 1h6l-1 8L7-2H1l2-7Z"/>',
    button: '<circle r="7.5" fill="#ffaac5"/><path d="M-2-2h.1m3.9 0h.1M-2 2h.1m3.9 0h.1" stroke-width="1.8" stroke-linecap="round"/>'
  };
  const scenes = {
    desk: ['pencil', 'note'],
    workbench: ['block', 'gear'],
    arcade: ['die', 'star', 'pencil', 'note', 'block', 'gear', 'key', 'leaf', 'bolt', 'button']
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
  const degrees = distance => distance * 180 / (Math.PI * radius);

  function followPointer(scene, ball, items) {
    const section = scene.closest('.updates');
    const home = { x: start, y: centerY };
    const growth = .27;
    const touchResetDelay = 2500;
    const scatter = [
      { fraction: .14, top: 28 },
      { fraction: .43, top: 34 },
      { fraction: .26, bottom: 29 },
      { fraction: .73, bottom: 36 },
      { fraction: .29, top: 38 },
      { fraction: .60, top: 26 },
      { fraction: .12, bottom: 39 },
      { fraction: .49, bottom: 27 },
    ];
    const collectibles = Array.from(items, (node, index) => ({
      node,
      home: pickups[index],
      spot: scatter[index - pickups.length],
      attachment: null,
    }));
    let position = home;
    let target = home;
    let rotation = 0;
    let scale = 1;
    let frame = 0;
    let previousTime = 0;
    let returnTimer;
    let burst;
    let celebrated = false;

    function placeCollectibles() {
      const bounds = section.getBoundingClientRect();
      const origin = scene.getBoundingClientRect();
      const units = 144 / origin.width;
      for (const item of collectibles) {
        if (item.spot) {
          const { fraction, top, bottom } = item.spot;
          const x = bounds.left + bounds.width * fraction;
          const y = top === undefined ? bounds.bottom - bottom : bounds.top + top;
          item.home = { x: (x - origin.left) * units, y: (y - origin.top) * units };
        }
      }
    }

    function collect(previous) {
      const dx = position.x - previous.x;
      const dy = position.y - previous.y;
      const distanceSquared = dx * dx + dy * dy;
      for (const item of collectibles) {
        if (item.attachment !== null) continue;
        const offsetX = item.home.x - previous.x;
        const offsetY = item.home.y - previous.y;
        const nearest = distanceSquared
          ? Math.max(0, Math.min(1, (offsetX * dx + offsetY * dy) / distanceSquared))
          : 0;
        if (Math.hypot(offsetX - dx * nearest, offsetY - dy * nearest) > radius * scale + 9) continue;

        // Keep the contact angle relative to the ball as it turns.
        const angle = Math.atan2(offsetY, offsetX) * 180 / Math.PI;
        item.attachment = angle - rotation;
        item.node.setAttribute('data-collected', '');
      }
    }

    function draw() {
      const center = `translate(${position.x} ${position.y})`;
      ball.setAttribute('transform', `${center} rotate(${rotation}) scale(${scale})`);
      for (const item of collectibles) {
        const transform = item.attachment === null
          ? `translate(${item.home.x} ${item.home.y})`
          : `${center} rotate(${rotation + item.attachment}) translate(${radius * scale + 2} 0)`;
        item.node.setAttribute('transform', transform);
      }
    }

    function celebrate() {
      celebrated = true;
      const effect = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      effect.setAttribute('transform', `translate(${position.x} ${position.y})`);
      effect.innerHTML = `<g class="roll-sparks">
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(angle =>
          `<path d="M40 0h6" transform="rotate(${angle})"/>`).join('')}
      </g>`;
      effect.addEventListener('animationend', () => effect.remove(), { once: true });
      ball.ownerSVGElement.append(effect);
      burst = effect;
    }

    function animate(now) {
      frame = 0;
      const elapsed = previousTime ? Math.min(40, now - previousTime) : 16;
      const easing = 1 - Math.exp(-elapsed / 65);
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const arrived = Math.hypot(dx, dy) < .25;
      const previous = position;
      position = arrived ? target : { x: position.x + dx * easing, y: position.y + dy * easing };
      const rollDistance = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      rotation = (rotation + degrees(rollDistance * (arrived ? 1 : easing)) / scale) % 360;
      if (target !== home) collect(previous);

      const carrying = collectibles.filter(item => item.attachment !== null).length;
      if (carrying === collectibles.length && !celebrated) celebrate();
      const nextScale = 1 + Math.min(carrying, 6) * growth + Math.max(0, carrying - 6) * .13;
      const fullSize = Math.abs(nextScale - scale) < .005;
      scale = fullSize ? nextScale : scale + (nextScale - scale) * easing;
      const settled = arrived && fullSize;
      if (settled && target === home) rotation = 0;
      draw();
      previousTime = settled ? 0 : now;
      if (!settled) queueFrame();
      else if (target === home) ball.removeAttribute('data-following');
    }

    function queueFrame() {
      if (!frame) frame = requestAnimationFrame(animate);
    }

    function returnHome() {
      clearTimeout(returnTimer);
      burst?.remove();
      burst = undefined;
      celebrated = false;
      for (const item of collectibles) {
        item.attachment = null;
        item.node.removeAttribute('data-collected');
      }
      target = home;
      queueFrame();
    }

    function move(event) {
      if (reducedMotion.matches || !event.isPrimary) return;
      clearTimeout(returnTimer);
      const bounds = section.getBoundingClientRect();
      const origin = scene.getBoundingClientRect();
      const units = 144 / origin.width;
      const padding = (radius * scale + 10) / units;
      const x = Math.max(bounds.left + padding, Math.min(bounds.right - padding, event.clientX));
      const y = Math.max(bounds.top + padding, Math.min(bounds.bottom - padding, event.clientY));
      target = { x: (x - origin.left) * units, y: (y - origin.top) * units };
      ball.setAttribute('data-following', '');
      queueFrame();
      if (event.pointerType === 'touch') returnTimer = setTimeout(returnHome, touchResetDelay);
    }

    section.addEventListener('pointermove', event => {
      if (event.pointerType !== 'touch') move(event);
    }, { passive: true });
    section.addEventListener('pointerup', event => {
      if (event.pointerType === 'touch') move(event);
    }, { passive: true });
    section.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch' && target !== home) returnHome();
    });
    section.addEventListener('pointercancel', () => {
      if (target !== home) returnHome();
    });
    window.addEventListener('resize', () => {
      placeCollectibles();
      if (target === home) draw();
      else returnHome();
    });
    reducedMotion.addEventListener('change', () => {
      if (!reducedMotion.matches) return;
      returnHome();
      cancelAnimationFrame(frame);
      frame = previousTime = rotation = 0;
      scale = 1;
      position = target = home;
      ball.removeAttribute('data-following');
      draw();
    });
    placeCollectibles();
    draw();
  }

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

    if (scene.dataset.rollScene === 'arcade') {
      followPointer(scene, ball, items);
      continue;
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
