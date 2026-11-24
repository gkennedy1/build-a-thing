(() => {
  const halo = document.querySelector('.hero-halo');
  if (!halo) return;

  const canvas = halo.querySelector('canvas');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Let the ambient motion settle while keeping the halo responsive to input.
  const ambientSeconds = 4.2;
  let render;
  let visible = false;
  let request = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let phase = 0;
  let energy = 0;
  let pointerEnergy = 0;
  let pointerAngle = 0;
  let pointerExpiry = 0;

  function shouldRender() {
    return visible && !document.hidden && !reducedMotion.matches;
  }

  function draw(now) {
    request = 0;
    if (!shouldRender()) return;
    if (lastFrame && now - lastFrame < 1000 / 30) {
      request = requestAnimationFrame(draw);
      return;
    }

    const step = lastFrame ? Math.min((now - lastFrame) / 1000, 0.08) : 0;
    lastFrame = now;
    elapsed += step;
    if (now > pointerExpiry) pointerEnergy = 0;
    energy += (pointerEnergy - energy) * (1 - Math.exp(-5 * step));
    phase = (phase + step * (0.85 + energy * 3.2)) % (100 * Math.PI);
    render(phase, energy, pointerAngle);
    if (!halo.hasAttribute('data-animated')) halo.setAttribute('data-animated', '');

    if (elapsed < ambientSeconds || energy > 0.015 || pointerEnergy > 0) {
      request = requestAnimationFrame(draw);
    } else {
      lastFrame = 0;
    }
  }

  function sync() {
    if (!shouldRender()) {
      cancelAnimationFrame(request);
      request = 0;
      lastFrame = 0;
      if (reducedMotion.matches) halo.removeAttribute('data-animated');
      return;
    }

    if (render === undefined) render = createRenderer(canvas);
    if (render && !request) request = requestAnimationFrame(draw);
  }

  function resize() {
    const { width, height } = halo.getBoundingClientRect();
    const scale = Math.min(1, 760 / width, 540 / height);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    sync();
  }

  function respondToPointer(event) {
    if (!shouldRender() || (event.pointerType === 'touch' && !event.isPrimary)) return;
    const { left, top, width, height } = halo.getBoundingClientRect();
    const x = (event.clientX - left - width * 0.52) / height;
    const y = (top + height * 0.48 - event.clientY) / height;
    pointerEnergy = Math.max(0, 1 - Math.hypot(x, y) / 0.65);
    if (!pointerEnergy) return;
    pointerAngle = Math.atan2(y, x);
    pointerExpiry = performance.now() + 700;
    sync();
  }

  const hero = halo.parentElement;
  hero.addEventListener('pointermove', respondToPointer);
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') respondToPointer(event);
  });
  hero.addEventListener('pointerleave', event => {
    // A tap also emits pointerleave. Give its shimmer time to play.
    if (event.pointerType !== 'touch') pointerEnergy = 0;
  });
  hero.addEventListener('pointercancel', event => {
    if (event.isPrimary) pointerEnergy = 0;
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(request);
    request = 0;
    lastFrame = 0;
    render = null;
    halo.removeAttribute('data-animated');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    render = undefined;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  new ResizeObserver(resize).observe(halo);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(halo);

  function createRenderer(surface) {
    const gl = surface.getContext('webgl', {
      alpha: true, antialias: false, depth: false, premultipliedAlpha: false,
      powerPreference: 'low-power',
    });
    if (!gl) return null;

    const vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, `
      attribute vec2 corner;
      varying vec2 uv;
      void main() {
        uv = corner * 0.5 + 0.5;
        gl_Position = vec4(corner, 0.0, 1.0);
      }
    `);
    gl.compileShader(vertex);

    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, `
      precision mediump float;
      varying vec2 uv;
      uniform vec2 pixels;
      uniform float phase;
      uniform float energy;
      uniform float pointerAngle;

      void main() {
        vec2 point = (uv - vec2(0.52, 0.52)) * vec2(pixels.x / pixels.y, 1.0);
        float distance = length(point * vec2(1.0, 1.10));
        float angle = atan(point.y, point.x + 0.0001);
        float turn = angle + phase * 0.44 + distance * 3.5;
        float focus = 0.55 + 0.45 * cos(angle - pointerAngle);
        float twist = 0.007 + energy * (0.022 + 0.029 * focus);
        float rim = 0.32 + 0.010 * sin(phase * 0.74)
          + twist * (sin(turn * 5.0) + 0.45 * sin(turn * 9.0 - phase));
        float edge = distance - rim;

        float core = exp(-abs(edge) * 155.0);
        float glow = exp(-abs(edge) * 29.0);
        float threads = exp(-abs(edge + 0.020 * sin(turn * 16.0 + phase)) * 102.0);
        threads *= 0.24 + energy * focus * 0.31;
        float luster = 0.55 + 0.45 * sin(angle * 2.0 + phase * 0.62);
        float grain = fract(sin(dot(mod(gl_FragCoord.xy, 113.0), vec2(12.1, 39.7))) * 437.5);
        float opacity = (core * (0.43 + luster * 0.33) + glow * 0.42 + threads)
          * (0.89 + grain * 0.22);
        vec3 jade = vec3(0.11, 0.76, 0.48);
        vec3 mint = vec3(0.72, 1.0, 0.86);
        vec3 color = mix(jade, mint, min(1.0, luster * 0.45 + core * 0.71));
        gl_FragColor = vec4(color, clamp(opacity, 0.0, 1.0));
      }
    `);
    gl.compileShader(fragment);

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const corner = gl.getAttribLocation(program, 'corner');
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
    const pixels = gl.getUniformLocation(program, 'pixels');
    const time = gl.getUniformLocation(program, 'phase');
    const intensity = gl.getUniformLocation(program, 'energy');
    const angle = gl.getUniformLocation(program, 'pointerAngle');

    return (position, activity, direction) => {
      gl.viewport(0, 0, surface.width, surface.height);
      gl.uniform2f(pixels, surface.width, surface.height);
      gl.uniform1f(time, position);
      gl.uniform1f(intensity, activity);
      gl.uniform1f(angle, direction);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  }
})();
