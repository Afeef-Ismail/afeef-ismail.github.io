/* Canvas visuals: the hero neural network and the training-loss sparkline. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const LINK_DIST = 165;
  const MAX_NODES = 140;
  const MAX_PULSES = 7;
  const PULSE_MS = 650;
  const SPAWN_MS = 320;
  const MOUSE_RADIUS = 190;

  const rand = (min, max) => min + Math.random() * (max - min);

  function createNodes(count, w, h) {
    return Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.22, 0.22),
      r: rand(1, 2.4),
      glow: 0
    }));
  }

  function neighboursOf(nodes, index, exclude) {
    const a = nodes[index];
    const out = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (i === index || i === exclude) continue;
      const b = nodes[i];
      if (Math.hypot(a.x - b.x, a.y - b.y) < LINK_DIST) out.push(i);
    }
    return out;
  }

  /**
   * Draws drifting nodes joined by proximity links, with "signal" pulses that
   * hop from node to node like activations through a network.
   */
  PF.initNeural = function initNeural(canvas, options) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const reduced = Boolean(options && options.reducedMotion);
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let nodes = [];
    let pulses = [];
    let rafId = 0;
    let visible = true;
    let last = 0;
    let sinceSpawn = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(Math.min(MAX_NODES, Math.round((w * h) / 11000)), w, h);
      pulses = [];
      if (reduced) draw(0);
    }

    function spawnPulse() {
      if (pulses.length >= MAX_PULSES || nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      const options = neighboursOf(nodes, from, -1);
      if (!options.length) return;
      const to = options[Math.floor(Math.random() * options.length)];
      pulses = pulses.concat({ from, to, t: 0, hops: 4 });
    }

    function advancePulse(pulse, dt) {
      const t = pulse.t + dt / PULSE_MS;
      if (t < 1) return { ...pulse, t };
      nodes[pulse.to].glow = 1;
      if (pulse.hops <= 0) return null;
      const options = neighboursOf(nodes, pulse.to, pulse.from);
      if (!options.length) return null;
      const next = options[Math.floor(Math.random() * options.length)];
      return { from: pulse.to, to: next, t: 0, hops: pulse.hops - 1 };
    }

    function moveNode(node, dt) {
      const step = dt / 16.7;
      node.x += node.vx * step;
      node.y += node.vy * step;
      if (node.x < -20) node.x = w + 20;
      if (node.x > w + 20) node.x = -20;
      if (node.y < -20) node.y = h + 20;
      if (node.y > h + 20) node.y = -20;
      node.glow = Math.max(0, node.glow - dt / 900);
    }

    function drawLinks() {
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > LINK_DIST || Math.abs(dy) > LINK_DIST) continue;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;
          const mx = (a.x + b.x) / 2 - mouse.x;
          const my = (a.y + b.y) / 2 - mouse.y;
          const near = Math.max(0, 1 - Math.hypot(mx, my) / MOUSE_RADIUS);
          const alpha = (1 - dist / LINK_DIST) * (0.22 + near * 0.55);
          ctx.strokeStyle = near > 0.05 ? `rgba(94,234,212,${alpha})` : `rgba(130,160,220,${alpha})`;
          ctx.lineWidth = 0.6 + near * 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    function drawNodes() {
      nodes.forEach((node) => {
        const near = Math.max(0, 1 - Math.hypot(node.x - mouse.x, node.y - mouse.y) / MOUSE_RADIUS);
        const boost = Math.max(node.glow, near * 0.7);
        ctx.fillStyle = `rgba(${150 - boost * 56},${190 + boost * 44},${235 - boost * 23},${0.45 + boost * 0.55})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + boost * 2.2, 0, Math.PI * 2);
        ctx.fill();
        if (boost > 0.15) {
          ctx.fillStyle = `rgba(94,234,212,${boost * 0.14})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + 9 * boost, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function drawPulses() {
      pulses.forEach((pulse) => {
        const a = nodes[pulse.from];
        const b = nodes[pulse.to];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * pulse.t;
        const y = a.y + (b.y - a.y) * pulse.t;
        ctx.strokeStyle = "rgba(94,234,212,0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(94,234,212,0.18)";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d9fff8";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      if (dt > 0) {
        nodes.forEach((node) => moveNode(node, dt));
        sinceSpawn += dt;
        if (sinceSpawn > SPAWN_MS) {
          sinceSpawn = 0;
          spawnPulse();
        }
        pulses = pulses.map((pulse) => advancePulse(pulse, dt)).filter(Boolean);
      }
      drawLinks();
      drawPulses();
      drawNodes();
    }

    function frame(now) {
      const dt = Math.min(50, now - (last || now));
      last = now;
      draw(dt);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (reduced || rafId || !visible || document.hidden) return;
      last = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    const host = canvas.parentElement || canvas;
    host.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });
    host.addEventListener("pointerleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }).observe(canvas);
    }

    resize();
    start();
  };

  /**
   * Animated "training loss" sparkline: a noisy exponential decay that redraws
   * itself in a loop, with a live epoch and loss readout.
   */
  PF.initLossChart = function initLossChart(canvas, epochEl, valueEl, options) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const reduced = Boolean(options && options.reducedMotion);
    const EPOCHS = 60;
    const STEP_MS = 110;
    const HOLD_STEPS = 26;
    let w = 0;
    let h = 0;
    let series = [];
    let step = 0;

    const lossAt = (epoch) => 0.08 + 2.22 * Math.exp(-epoch / 11) + rand(-0.04, 0.04) * Math.exp(-epoch / 30);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    }

    function render() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(0, h * p);
        ctx.lineTo(w, h * p);
        ctx.stroke();
      });
      if (series.length < 2) return;

      const px = (i) => (i / (EPOCHS - 1)) * w;
      const py = (v) => h - 6 - (Math.min(v, 2.4) / 2.4) * (h - 12);
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#a78bfa");
      gradient.addColorStop(0.5, "#60a5fa");
      gradient.addColorStop(1, "#5eead4");

      ctx.beginPath();
      series.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      const lastX = px(series.length - 1);
      const lastY = py(series[series.length - 1]);
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, h);
      fill.addColorStop(0, "rgba(94,234,212,0.16)");
      fill.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.fillStyle = "#5eead4";
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    function readout() {
      const epoch = Math.max(series.length - 1, 0);
      if (epochEl) epochEl.textContent = "epoch " + String(epoch).padStart(2, "0");
      if (valueEl && series.length) valueEl.textContent = series[series.length - 1].toFixed(3);
    }

    function tick() {
      if (document.hidden) return;
      step += 1;
      if (series.length < EPOCHS) {
        series = series.concat(lossAt(series.length));
      } else if (step > EPOCHS + HOLD_STEPS) {
        series = [];
        step = 0;
      }
      readout();
      render();
    }

    if (reduced) {
      series = Array.from({ length: EPOCHS }, (_, i) => lossAt(i));
      readout();
    } else {
      setInterval(tick, STEP_MS);
    }

    window.addEventListener("resize", resize);
    resize();
  };
})();
