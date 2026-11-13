/* Interactive skills globe: logo badges on a sphere that auto-rotates and can be dragged with inertia. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});

  const AUTO_SPIN = 0.22; /* rad/s around the vertical axis */
  const AUTO_TILT = 0.05; /* rad/s slow wobble around the horizontal axis */
  const DRAG_SENSITIVITY = 0.0055; /* rad per pixel dragged */
  const EASE_BACK = 1.4; /* how quickly a flick settles back to auto-spin */
  const MAX_SPEED = 9; /* rad/s cap after a hard flick */
  const DOT_COUNT = 340;
  const PERSPECTIVE = 0.3;
  const BADGE_SCALE = 0.052; /* badge radius as a fraction of the canvas size */
  const ICON_DIR = "assets/icons/";
  const FRONT_BOOST = 0.1; /* extra size for badges at the very front */
  const GROUP_COLORS = ["94,234,212", "96,165,250", "167,139,250", "244,170,222", "251,191,36"];

  /** Evenly spreads `count` points over a unit sphere. */
  function fibonacciSphere(count) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: count }, (_, i) => {
      const y = 1 - ((i + 0.5) / count) * 2;
      const ring = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return [Math.cos(theta) * ring, y, Math.sin(theta) * ring];
    });
  }

  /**
   * Evens out spacing by letting the points repel each other along the sphere
   * (like equal charges) until they settle. The spiral start is close already;
   * this removes its tight and loose patches so neighbours sit the same distance apart.
   */
  function relaxSphere(start, iterations) {
    let points = start;
    for (let round = 0; round < iterations; round += 1) {
      const stepSize = 0.12 * (1 - round / iterations) + 0.01;
      points = points.map((p, i) => {
        const force = [0, 0, 0];
        points.forEach((q, j) => {
          if (i === j) return;
          const d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
          const distSq = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + 1e-6;
          const push = 1 / (distSq * Math.sqrt(distSq));
          force[0] += d[0] * push;
          force[1] += d[1] * push;
          force[2] += d[2] * push;
        });
        const scale = stepSize / points.length;
        const moved = [p[0] + force[0] * scale, p[1] + force[1] * scale, p[2] + force[2] * scale];
        const len = Math.hypot(moved[0], moved[1], moved[2]) || 1;
        return [moved[0] / len, moved[1] / len, moved[2] / len];
      });
    }
    return points;
  }

  function multiply(a, b) {
    return [
      a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
      a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
      a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
    ];
  }

  /** Rotation by `ax` around the screen X axis, then `ay` around the screen Y axis. */
  function screenRotation(ax, ay) {
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    return multiply([cy, 0, sy, 0, 1, 0, -sy, 0, cy], [1, 0, 0, 0, cx, -sx, 0, sx, cx]);
  }

  /** Re-orthonormalises a rotation matrix so float error never skews the globe. */
  function orthonormalise(m) {
    const norm = (v) => {
      const len = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / len, v[1] / len, v[2] / len];
    };
    const r0 = norm([m[0], m[1], m[2]]);
    const dot = r0[0] * m[3] + r0[1] * m[4] + r0[2] * m[5];
    const r1 = norm([m[3] - dot * r0[0], m[4] - dot * r0[1], m[5] - dot * r0[2]]);
    const r2 = [r0[1] * r1[2] - r0[2] * r1[1], r0[2] * r1[0] - r0[0] * r1[2], r0[0] * r1[1] - r0[1] * r1[0]];
    return r0.concat(r1, r2);
  }

  const rotate = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

  /** Starts loading an item's brand logo; returns null when it has none. */
  function loadLogo(item, onReady) {
    if (!item.logo) return null;
    const image = new Image();
    image.decoding = "async";
    const src = ICON_DIR + item.logo + ".svg";
    image.addEventListener("load", onReady);
    /* One retry for a dropped request; until it loads the badge shows its fallback glyph. */
    image.addEventListener("error", () => setTimeout(() => (image.src = src + "?retry=1"), 900), { once: true });
    image.src = src;
    return image;
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{label: string, group: number, logo?: string, glyph?: {char: string, weight: string, family: string}}[]} items
   *   `logo` is a file name in assets/icons; `glyph` is the icon-font fallback used when there is no logo.
   * @param {{reducedMotion?: boolean}} options
   */
  PF.initGlobe = function initGlobe(canvas, items, options) {
    if (!canvas || !canvas.getContext || !items || !items.length) return;
    const ctx = canvas.getContext("2d");
    const reduced = Boolean(options && options.reducedMotion);
    const points = relaxSphere(fibonacciSphere(items.length), 320);
    const dotPoints = fibonacciSphere(DOT_COUNT);

    let size = 0;
    let radius = 0;
    let matrix = screenRotation(-0.35, 0.6);
    let velocity = { x: 0, y: reduced ? 0 : AUTO_SPIN };
    let drag = null;
    let pointer = null;
    let hovered = -1;
    let boxes = [];
    let rafId = 0;
    let last = 0;
    let visible = true;
    let frames = 0;

    const logos = items.map((item) => loadLogo(item, () => !rafId && render()));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.min(canvas.clientWidth, canvas.clientHeight);
      if (!size) return;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = size * 0.38;
      render();
    }

    function project(point) {
      const [x, y, z] = rotate(matrix, point);
      const scale = 1 + z * PERSPECTIVE;
      return { x: canvas.clientWidth / 2 + x * radius * scale, y: canvas.clientHeight / 2 + y * radius * scale, z };
    }

    function drawSphere() {
      const cx = canvas.clientWidth / 2;
      const cy = canvas.clientHeight / 2;
      const glow = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius * 1.28);
      glow.addColorStop(0, "rgba(96,165,250,0.16)");
      glow.addColorStop(0.55, "rgba(94,234,212,0.05)");
      glow.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.28, 0, Math.PI * 2);
      ctx.fill();

      dotPoints.forEach((point) => {
        const p = project(point);
        const depth = (p.z + 1) / 2;
        ctx.fillStyle = `rgba(150,185,235,${0.06 + depth * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.6 + depth * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawIcon(index, item, x, y, iconSize, color) {
      const logo = logos[index];
      if (logo && logo.complete && logo.naturalWidth) {
        ctx.drawImage(logo, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        return;
      }
      if (!item.glyph) return;
      ctx.font = `${item.glyph.weight} ${(iconSize * 0.86).toFixed(1)}px ${item.glyph.family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgb(${color})`;
      ctx.fillText(item.glyph.char, x, y + iconSize * 0.03);
    }

    function drawBadge(entry) {
      const { item, p, index } = entry;
      const depth = (p.z + 1) / 2;
      const isHover = index === hovered;
      /* Front-facing badges get an extra FRONT_BOOST, eased in over the nearest part of the globe. */
      const r = size * BADGE_SCALE * (0.6 + depth * 0.58) * (1 + FRONT_BOOST * Math.pow(depth, 3)) * (isHover ? 1.2 : 1);
      const color = GROUP_COLORS[item.group % GROUP_COLORS.length];

      ctx.save();
      ctx.globalAlpha = isHover ? 1 : 0.14 + Math.pow(depth, 1.5) * 0.86;
      if (isHover) {
        ctx.shadowColor = `rgba(${color},0.75)`;
        ctx.shadowBlur = 22;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(11,14,22,0.94)";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(${color},${isHover ? 1 : 0.5})`;
      ctx.lineWidth = isHover ? 1.8 : 1.1;
      ctx.stroke();
      drawIcon(index, item, p.x, p.y, r * 1.12, color);
      ctx.restore();

      return { index, x: p.x, y: p.y, r, z: p.z };
    }

    /** Name tag for the hovered badge, kept inside the canvas. */
    function drawTooltip(box) {
      const item = items[box.index];
      const fontSize = Math.max(11, size * 0.03);
      ctx.font = `600 ${fontSize.toFixed(1)}px Inter, "Segoe UI", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const width = ctx.measureText(item.label).width + fontSize * 1.6;
      const height = fontSize * 2;
      const half = width / 2;
      const x = Math.max(half + 4, Math.min(canvas.clientWidth - half - 4, box.x));
      const above = box.y - box.r - height / 2 - 8;
      const y = above - height / 2 < 4 ? box.y + box.r + height / 2 + 8 : above;

      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - half, y - height / 2, width, height, height / 2);
      else ctx.rect(x - half, y - height / 2, width, height);
      ctx.fillStyle = "rgba(9,11,18,0.96)";
      ctx.fill();
      ctx.strokeStyle = `rgba(${GROUP_COLORS[item.group % GROUP_COLORS.length]},0.9)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#e9edf5";
      ctx.fillText(item.label, x, y + 0.5);
    }

    function render() {
      if (!size) return;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      drawSphere();
      boxes = items
        .map((item, index) => ({ item, index, p: project(points[index]) }))
        .sort((a, b) => a.p.z - b.p.z)
        .map(drawBadge);
      const active = boxes.find((box) => box.index === hovered);
      if (active) drawTooltip(active);
    }

    function pickHovered() {
      if (!pointer || drag) return -1;
      for (let i = boxes.length - 1; i >= 0; i -= 1) {
        const box = boxes[i];
        if (box.z > -0.1 && Math.hypot(pointer.x - box.x, pointer.y - box.y) <= box.r + 3) return box.index;
      }
      return -1;
    }

    function step(dt) {
      if (!drag) {
        const targetY = hovered >= 0 || reduced ? 0 : AUTO_SPIN;
        const targetX = hovered >= 0 || reduced ? 0 : AUTO_TILT * Math.sin(performance.now() / 4200);
        const blend = 1 - Math.exp(-dt * EASE_BACK);
        velocity = { x: velocity.x + (targetX - velocity.x) * blend, y: velocity.y + (targetY - velocity.y) * blend };
        matrix = multiply(screenRotation(velocity.x * dt, velocity.y * dt), matrix);
      }
      frames += 1;
      if (frames % 240 === 0) matrix = orthonormalise(matrix);
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      step(dt);
      hovered = pickHovered();
      canvas.classList.toggle("is-hovering", hovered >= 0);
      render();
      const idle = reduced && !drag && Math.abs(velocity.x) < 0.002 && Math.abs(velocity.y) < 0.002;
      rafId = idle ? 0 : requestAnimationFrame(frame);
    }

    function start() {
      if (rafId || !visible || document.hidden) return;
      last = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function localPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", (event) => {
      pointer = localPoint(event);
      drag = { x: event.clientX, y: event.clientY, time: performance.now() };
      velocity = { x: 0, y: 0 };
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        /* Capture is a nicety: without it the drag just ends when the pointer leaves the canvas. */
      }
      canvas.classList.add("is-dragging");
      start();
    });

    canvas.addEventListener("pointermove", (event) => {
      pointer = localPoint(event);
      if (!drag) {
        if (reduced) start();
        return;
      }
      const now = performance.now();
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const dt = Math.max(0.008, (now - drag.time) / 1000);
      const ay = dx * DRAG_SENSITIVITY;
      const ax = -dy * DRAG_SENSITIVITY;
      matrix = multiply(screenRotation(ax, ay), matrix);
      /* Smoothed release velocity so a flick carries on naturally. */
      velocity = {
        x: clamp(velocity.x * 0.6 + (ax / dt) * 0.4, MAX_SPEED),
        y: clamp(velocity.y * 0.6 + (ay / dt) * 0.4, MAX_SPEED)
      };
      drag = { x: event.clientX, y: event.clientY, time: now };
    });

    function endDrag(event) {
      if (!drag) return;
      /* A pause before letting go means "place it here", not "throw it". */
      if (performance.now() - drag.time > 90) velocity = { x: 0, y: 0 };
      drag = null;
      canvas.classList.remove("is-dragging");
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }

    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", (event) => {
      pointer = null;
      if (drag && !canvas.hasPointerCapture(event.pointerId)) endDrag(event);
    });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }).observe(canvas);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);

    resize();
    start();
  };
})();
