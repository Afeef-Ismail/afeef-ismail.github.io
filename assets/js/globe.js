/* Interactive skills globe: labels on a sphere that auto-rotates and can be dragged with inertia. */
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

  const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

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

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{label: string, group: number}[]} items
   * @param {{reducedMotion?: boolean}} options
   */
  PF.initGlobe = function initGlobe(canvas, items, options) {
    if (!canvas || !canvas.getContext || !items || !items.length) return;
    const ctx = canvas.getContext("2d");
    const reduced = Boolean(options && options.reducedMotion);
    const labelPoints = fibonacciSphere(items.length);
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

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.min(canvas.clientWidth, canvas.clientHeight);
      if (!size) return;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = size * (items.length > 30 ? 0.35 : 0.39);
      render();
    }

    function project(point) {
      const [x, y, z] = rotate(matrix, point);
      const scale = 1 + z * PERSPECTIVE;
      return { x: canvas.clientWidth / 2 + x * radius * scale, y: canvas.clientHeight / 2 + y * radius * scale, z, scale };
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

    function drawLabel(entry) {
      const { item, p, index } = entry;
      const depth = (p.z + 1) / 2;
      const isHover = index === hovered;
      const fontSize = Math.max(10, size * (items.length > 30 ? 0.0235 : 0.026)) * (0.72 + depth * 0.5) * (isHover ? 1.12 : 1);
      const alpha = isHover ? 1 : 0.14 + Math.pow(depth, 1.6) * 0.86;
      const color = GROUP_COLORS[item.group % GROUP_COLORS.length];

      ctx.font = `500 ${fontSize.toFixed(1)}px Inter, "Segoe UI", sans-serif`;
      const textWidth = ctx.measureText(item.label).width;
      const padX = fontSize * 0.75;
      const dot = fontSize * 0.3;
      const width = textWidth + padX * 2 + dot * 2 + 4;
      const height = fontSize * 1.95;
      const left = p.x - width / 2;
      const top = p.y - height / 2;

      if (p.z > 0.05 || isHover) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(left, top, width, height, height / 2);
        else ctx.rect(left, top, width, height);
        ctx.fillStyle = `rgba(9,11,18,${(isHover ? 0.95 : 0.78) * alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${color},${(isHover ? 0.95 : 0.34) * alpha})`;
        ctx.lineWidth = isHover ? 1.4 : 1;
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.beginPath();
      ctx.arc(left + padX + dot, p.y, dot, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(233,237,245,${alpha})`;
      ctx.textBaseline = "middle";
      ctx.fillText(item.label, left + padX + dot * 2 + 4, p.y + 0.5);

      return { index, left, top, right: left + width, bottom: top + height, z: p.z };
    }

    function render() {
      if (!size) return;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      drawSphere();
      boxes = items
        .map((item, index) => ({ item, index, p: project(labelPoints[index]) }))
        .sort((a, b) => a.p.z - b.p.z)
        .map(drawLabel);
    }

    function pickHovered() {
      if (!pointer || drag) return -1;
      for (let i = boxes.length - 1; i >= 0; i -= 1) {
        const box = boxes[i];
        if (box.z > 0 && pointer.x >= box.left && pointer.x <= box.right && pointer.y >= box.top && pointer.y <= box.bottom) return box.index;
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
