(() => {
  const halo = document.querySelector('.hero-halo');
  if (!halo) return;

  const canvas = halo.querySelector('canvas');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const buildTimeConstant = 4.2;
  const coastSeconds = 2.25;
  const maxPhaseSpeed = 24;
  let render;
  let visible = false;
  let request = 0;
  let lastFrame = 0;
  let phase = 0;
  let momentum = 0;
  let hovering = false;
  let touchPointer = null;
  let pointerAngle = 0;
  let focusAngle = 0;

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

    const step = Math.max(0, Math.min((now - lastFrame) / 1000, 0.08));
    lastFrame = now;
    const engaged = hovering || touchPointer !== null;
    // Approach the top speed gradually so the spin keeps building after the rim grows.
    momentum = engaged
      ? momentum + (1 - momentum) * (1 - Math.exp(-step / buildTimeConstant))
      : Math.max(0, momentum - step / coastSeconds);
    const speed = maxPhaseSpeed * momentum ** 1.65;
    phase = (phase + step * speed) % (100 * Math.PI);
    const angleDelta = pointerAngle - focusAngle;
    focusAngle += Math.atan2(Math.sin(angleDelta), Math.cos(angleDelta)) * (1 - Math.exp(-8 * step));
    render(phase, momentum, focusAngle);
    if (!halo.hasAttribute('data-animated')) halo.setAttribute('data-animated', '');

    if (engaged || momentum > 0) {
      request = requestAnimationFrame(draw);
    } else {
      lastFrame = 0;
    }
  }

  function sync() {
    if (!shouldRender()) {
      releasePointers();
      cancelAnimationFrame(request);
      request = 0;
      lastFrame = 0;
      if (reducedMotion.matches) halo.removeAttribute('data-animated');
      return;
    }

    if (render === undefined) render = createRenderer(canvas);
    if (render && !request) {
      lastFrame = performance.now();
      request = requestAnimationFrame(draw);
    }
  }

  function resize() {
    const { width, height } = halo.getBoundingClientRect();
    const scale = Math.min(1, 760 / width, 540 / height);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    sync();
  }

  function aimAtHalo(event) {
    const { left, top, width, height } = halo.getBoundingClientRect();
    const x = (event.clientX - left - width * 0.52) / height;
    const y = (top + height * 0.48 - event.clientY) / height;
    if (Math.hypot(x, y * 1.1) > 0.47) return false;
    pointerAngle = Math.atan2(y, x);
    return true;
  }

  function releasePointers() {
    hovering = false;
    touchPointer = null;
  }

  function endTouch(event) {
    if (event.pointerId === touchPointer) touchPointer = null;
  }

  const hero = halo.parentElement;
  // Listen on the hero so the decorative canvas never intercepts links, taps or scrolling.
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !shouldRender()) return;
    hovering = aimAtHalo(event);
    if (hovering) sync();
  }, { passive: true });
  hero.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') hovering = false;
  });
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary || !shouldRender() || !aimAtHalo(event)) return;
    hovering = false;
    touchPointer = event.pointerId;
    sync();
  }, { passive: true });
  window.addEventListener('pointerup', endTouch);
  window.addEventListener('pointercancel', endTouch);
  window.addEventListener('blur', releasePointers);
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
      uniform float momentum;
      uniform float pointerAngle;

      float hash(float seed) {
        return fract(sin(seed * 1.73) * 173.31);
      }

      float sparkField(vec2 point, float radius) {
        float brightness = 0.0;
        float width = max(0.0026, 0.6 / pixels.y);
        for (int i = 0; i < 6; i++) {
          float slot = float(i);
          // Use whole cycles across the phase wrap, with a dark interval between sparks.
          float cycle = phase / 314.15927 * (17.0 + slot) + slot * 0.37;
          float age = fract(cycle);
          float seed = floor(cycle) + 7.0 * slot;
          float strength = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.24, 0.76, age));
          float orbit = radius * (mix(0.72, 0.86, hash(seed + 4.3)) - 0.28 * age);
          float direction = 6.2831853 * hash(seed + 0.5) - phase * 0.44;
          vec2 radial = vec2(cos(direction), sin(direction));
          vec2 tangent = vec2(-radial.y, radial.x);
          vec2 offset = point - radial * orbit;
          float streak = length(vec2(dot(offset, radial), dot(offset, tangent) * 0.36)) / width;
          brightness += strength * (0.86 * exp(-streak) + 0.25 * exp(-streak * 0.36));
        }
        return brightness;
      }

      void main() {
        float collapse = smoothstep(0.38, 0.93, momentum);
        vec2 center = vec2(0.52, 0.52);
        vec2 point = (uv - center) * vec2(pixels.x / pixels.y, 1.0);
        float distance = length(point * vec2(1.0, 1.10));
        float angle = atan(point.y, point.x + 0.0001);
        float rotation = angle + phase * 0.44;
        float turn = rotation + distance * 3.5;
        float energy = min(1.0, momentum * 2.3);
        float formation = smoothstep(0.14, 0.76, momentum);
        float radius = mix(0.32 + 0.095 * energy, 0.145, collapse);
        float focus = 0.55 + 0.45 * cos(angle - pointerAngle);
        float stability = 1.0 - 0.90 * collapse;
        float twist = (0.007 + energy * (0.014 + 0.015 * focus)) * stability;
        float rim = radius + 0.010 * stability * sin(phase * 0.74)
          + twist * (sin(turn * 5.0) + 0.45 * sin(turn * 9.0 - phase));
        float edge = distance - rim;

        float bandScale = mix(1.0, 0.48, collapse);
        float bandEdge = edge / bandScale;
        float core = exp(-abs(bandEdge) * 155.0);
        float glow = exp(-abs(bandEdge) * 29.0) * (0.42 + 0.22 * energy);
        float threads = exp(-abs(bandEdge + 0.020 * sin(turn * 16.0 + phase)) * 102.0);
        threads *= 0.24 + energy * focus * 0.31;
        float luster = 0.55 + 0.45 * sin(angle * 2.0 + phase * 0.62);
        float grain = fract(sin(dot(mod(gl_FragCoord.xy, 113.0), vec2(12.1, 39.7))) * 437.5);
        float opacity = (core * (0.43 + luster * 0.33) + glow + threads)
          * (0.89 + grain * 0.22);
        vec3 jade = vec3(0.11, 0.76, 0.48);
        vec3 mint = vec3(0.72, 1.0, 0.86);
        vec3 color = mix(jade, mint, min(1.0, luster * 0.45 + core * 0.71));
        // The spiral and its shadow follow the rim as it contracts.
        float fill = formation * (1.0 - smoothstep(-0.035, -0.004, bandEdge));
        float shadowRadius = rim * 0.82 * formation;
        float outsideShadow = smoothstep(-0.016, 0.038, (distance - shadowRadius) / bandScale);
        float radialProgress = distance / radius;
        float spiral = 3.0 * (rotation + 4.1 * sqrt(radialProgress))
          + 0.65 * sin(radialProgress * 18.0 - phase * 0.18);
        float arms = pow(0.5 + 0.5 * cos(spiral), 4.0);
        float stream = arms * outsideShadow * smoothstep(0.085, 0.44, radialProgress);
        vec3 interior = mix(vec3(0.003, 0.014, 0.018), jade, 0.48 * stream);

        float rimAlpha = clamp(opacity, 0.0, 1.0);
        float interiorAlpha = fill * (1.0 - rimAlpha);
        float sparkAlpha = 0.0;
        if (momentum > 0.93 && edge < -0.004) {
          float ignition = smoothstep(0.93, 0.947, momentum);
          float inside = 1.0 - smoothstep(-0.017, -0.004, edge);
          sparkAlpha = clamp(ignition * inside * sparkField(point * vec2(1.0, 1.10), radius), 0.0, 1.0);
        }
        float alpha = sparkAlpha + (rimAlpha + interiorAlpha) * (1.0 - sparkAlpha);
        vec3 sparks = vec3(0.91, 1.0, 0.67) * sparkAlpha;
        vec3 composite = ((color * rimAlpha + interior * interiorAlpha) * (1.0 - sparkAlpha) + sparks)
          / max(alpha, 0.0001);
        gl_FragColor = vec4(composite, alpha);
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
    const intensity = gl.getUniformLocation(program, 'momentum');
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
