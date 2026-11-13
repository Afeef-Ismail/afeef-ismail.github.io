/* Motion: smooth scroll (Lenis), scroll reveals, scrubbed rails (GSAP), boot + hero intro. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const BOOT_KEY = "pf-booted";
  const BOOT_MS = 800;
  const BOOT_STEPS = ["loading weights...", "compiling graph...", "warming up inference...", "ready."];
  const REVEAL_STAGGER_MS = 80;

  let lenis = null;

  const hasGsap = () => typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  PF.refreshScroll = function refreshScroll() {
    if (lenis) lenis.resize();
    if (hasGsap()) window.ScrollTrigger.refresh();
  };

  PF.lockScroll = function lockScroll(locked) {
    document.body.classList.toggle("is-locked", locked);
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  };

  PF.scrollTo = function scrollTo(hash) {
    const target = hash === "#home" ? document.body : document.querySelector(hash);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(hash === "#home" ? 0 : target, { offset: -92, duration: 1.2 });
    } else if (hash === "#home") {
      window.scrollTo({ top: 0, behavior: PF.env.reducedMotion ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: PF.env.reducedMotion ? "auto" : "smooth" });
    }
  };

  PF.initSmoothScroll = function initSmoothScroll() {
    if (typeof window.Lenis !== "undefined" && PF.env.finePointer && !PF.env.reducedMotion) {
      lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      if (hasGsap()) {
        lenis.on("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => lenis.raf(time * 1000));
        window.gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    }

    document.addEventListener("click", (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;
      const hash = link.getAttribute("href");
      if (hash.length < 2 || !document.querySelector(hash)) return;
      event.preventDefault();
      PF.scrollTo(hash);
      history.replaceState(null, "", hash);
      /* Move keyboard focus with the scroll so skip links and nav work for keyboard users. */
      const target = document.querySelector(hash);
      if (hash !== "#home" && target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  };

  PF.initScrollChrome = function initScrollChrome() {
    const bar = document.getElementById("progress-bar");
    const nav = document.getElementById("nav");
    let queued = false;

    function update() {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar) bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  };

  function onRevealed(node) {
    node.classList.add("is-in");
    setTimeout(() => {
      node.classList.add("is-settled");
      node.style.removeProperty("--reveal-delay");
    }, 1500);
    const counters = node.matches("[data-count]") ? [node] : Array.from(node.querySelectorAll("[data-count]"));
    counters.forEach(PF.countUp);
    node.querySelectorAll("[data-scramble]").forEach(PF.scramble);
  }

  PF.initReveal = function initReveal() {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window) || PF.env.reducedMotion) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            entry.target.style.setProperty("--reveal-delay", Math.min(i * REVEAL_STAGGER_MS, 480) + "ms");
            onRevealed(entry.target);
            observer.unobserve(entry.target);
          });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
  };

  /** Rails that fill as their section scrolls through the viewport. */
  PF.initScrub = function initScrub() {
    if (!hasGsap() || PF.env.reducedMotion) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const narrowQuery = window.matchMedia("(max-width: 720px)");
    let tweens = [];

    function build() {
      tweens.forEach((tween) => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
      });
      tweens = Array.from(document.querySelectorAll("[data-scrub]"), (fill) => {
        const vertical = fill.dataset.scrub === "y" || narrowQuery.matches;
        const prop = vertical ? "scaleY" : "scaleX";
        const trigger = fill.closest(".timeline, .milestones") || fill;
        gsap.set(fill, { clearProps: "transform" });
        return gsap.fromTo(
          fill,
          { [prop]: 0 },
          {
            [prop]: 1,
            ease: "none",
            scrollTrigger: { trigger, start: "top 78%", end: vertical ? "bottom 62%" : "top 38%", scrub: 0.6 }
          }
        );
      });
    }

    build();
    /* The milestone rail flips between horizontal and vertical at this breakpoint. */
    narrowQuery.addEventListener("change", build);

    gsap.to(".backdrop__grid", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1 }
    });
  };

  function heroIntro() {
    const hero = document.getElementById("home");
    if (!hero) return;
    hero.classList.add("is-ready");
    if (PF.env.reducedMotion) return;
    if (hasGsap()) {
      window.gsap.from(hero.querySelectorAll("[data-intro]"), {
        y: 30,
        opacity: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "transform,opacity"
      });
    }
    hero.querySelectorAll(".hero__line").forEach((line, i) => setTimeout(() => PF.scramble(line), 250 + i * 160));
  }

  function hasBooted() {
    try {
      return sessionStorage.getItem(BOOT_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markBooted() {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch (error) {
      /* Storage unavailable (private mode): the boot screen simply replays next visit. */
    }
  }

  /** Short "loading weights" screen on the first visit of a session, then the hero intro. */
  PF.initBoot = function initBoot() {
    const boot = document.getElementById("boot");
    const bar = document.getElementById("boot-bar");
    const pct = document.getElementById("boot-pct");
    const status = document.getElementById("boot-status");
    if (!boot || !bar || PF.env.reducedMotion || hasBooted()) {
      if (boot) boot.classList.add("is-skipped");
      heroIntro();
      return;
    }

    const startTime = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - startTime) / BOOT_MS);
      const eased = 1 - Math.pow(1 - t, 2);
      bar.style.transform = `scaleX(${eased.toFixed(3)})`;
      if (pct) pct.textContent = Math.round(eased * 100) + "%";
      if (status) status.textContent = BOOT_STEPS[Math.min(BOOT_STEPS.length - 1, Math.floor(t * BOOT_STEPS.length))];
      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }
      markBooted();
      boot.classList.add("is-done");
      setTimeout(heroIntro, 180);
    }
    requestAnimationFrame(frame);
  };
})();
