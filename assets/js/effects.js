/* Micro-interactions: spotlight, tilt, magnetic buttons, counters, typing, scramble. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const SCRAMBLE_CHARS = "01<>/[]{}=+*#_";
  const TILT_MAX_DEG = 5;
  const MAGNET_STRENGTH = 0.28;

  PF.env = Object.freeze({
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches
  });

  /** Creates an element. `attrs.text` sets textContent; `attrs.class` sets className. */
  PF.el = function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value === true ? "" : value);
    });
    [].concat(children || []).forEach((child) => child && node.appendChild(child));
    return node;
  };

  PF.icon = (classes) => PF.el("i", { class: classes, "aria-hidden": "true" });

  let toastTimer = 0;
  PF.toast = function toast(message) {
    const node = document.getElementById("toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("is-on"), 2200);
  };

  PF.copyText = function copyText(text) {
    const fallback = () => {
      const area = PF.el("textarea", { "aria-hidden": "true", style: "position:fixed;opacity:0" });
      area.value = text;
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok ? Promise.resolve() : Promise.reject(new Error("copy command rejected"));
    };
    const attempt = navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(text).catch(fallback) : fallback();
    return attempt.then(
      () => PF.toast("copied: " + text),
      () => PF.toast("copy failed, email: " + text)
    );
  };

  /** One document-level listener keeps every .card's spotlight under the cursor. */
  PF.initSpotlight = function initSpotlight() {
    if (!PF.env.finePointer) return;
    document.addEventListener(
      "pointermove",
      (event) => {
        const card = event.target instanceof Element ? event.target.closest(".card") : null;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      },
      { passive: true }
    );
  };

  PF.initTilt = function initTilt(root) {
    if (!PF.env.finePointer || PF.env.reducedMotion) return;
    (root || document).querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.classList.add("is-tilting");
        card.style.transform = `perspective(1100px) rotateX(${(-py * TILT_MAX_DEG).toFixed(2)}deg) rotateY(${(px * TILT_MAX_DEG).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      });
    });
  };

  PF.initMagnetic = function initMagnetic() {
    if (!PF.env.finePointer || PF.env.reducedMotion) return;
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) * MAGNET_STRENGTH;
        const dy = (event.clientY - rect.top - rect.height / 2) * MAGNET_STRENGTH;
        button.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s, background 0.3s, box-shadow 0.3s";
        button.style.transform = "";
        setTimeout(() => (button.style.transition = ""), 500);
      });
    });
  };

  /** Soft glow that trails the cursor behind the page content. */
  PF.initAura = function initAura() {
    const aura = document.getElementById("aura");
    if (!aura || !PF.env.finePointer || PF.env.reducedMotion) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let rafId = 0;

    function follow() {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      aura.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      const settled = Math.abs(target.x - pos.x) < 0.3 && Math.abs(target.y - pos.y) < 0.3;
      rafId = settled ? 0 : requestAnimationFrame(follow);
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        target.x = event.clientX;
        target.y = event.clientY;
        aura.classList.add("is-on");
        if (!rafId) rafId = requestAnimationFrame(follow);
      },
      { passive: true }
    );
  };

  /** Counts a [data-count] element up to its value. Final text always matches the markup. */
  PF.countUp = function countUp(node) {
    const end = Number(node.dataset.count);
    if (!Number.isFinite(end) || node.dataset.counted) return;
    node.dataset.counted = "true";
    const decimals = Number(node.dataset.decimals || 0);
    const suffix = node.dataset.suffix || "";
    const finalText = end.toFixed(decimals) + suffix;
    if (PF.env.reducedMotion) {
      node.textContent = finalText;
      return;
    }
    const duration = 1500;
    const startTime = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      node.textContent = t < 1 ? (end * eased).toFixed(decimals) + suffix : finalText;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /** Decodes text from random glyphs into the real string. */
  PF.scramble = function scramble(node) {
    const finalText = node.dataset.text || node.textContent;
    node.dataset.text = finalText;
    if (PF.env.reducedMotion || node.dataset.scrambling) return;
    node.dataset.scrambling = "true";
    const total = 14 + finalText.length * 2;
    let frameNo = 0;
    function frame() {
      frameNo += 1;
      const revealed = Math.floor((frameNo / total) * finalText.length);
      const tail = Array.from(finalText.slice(revealed), (ch) =>
        ch === " " ? " " : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      ).join("");
      node.textContent = finalText.slice(0, revealed) + tail;
      if (frameNo < total) {
        setTimeout(frame, 30);
      } else {
        node.textContent = finalText;
        delete node.dataset.scrambling;
      }
    }
    frame();
  };

  /** Type-and-delete loop over a list of phrases. */
  PF.initTyped = function initTyped(node, phrases) {
    if (!node || !phrases || !phrases.length || PF.env.reducedMotion) return;
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let deleting = true;

    function loop() {
      const phrase = phrases[phraseIndex];
      node.textContent = phrase.slice(0, charIndex);
      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
        return setTimeout(loop, 48);
      }
      if (!deleting) {
        deleting = true;
        return setTimeout(loop, 1900);
      }
      if (charIndex > 0) {
        charIndex -= 1;
        return setTimeout(loop, 24);
      }
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      return setTimeout(loop, 260);
    }

    setTimeout(loop, 2600);
  };
})();
