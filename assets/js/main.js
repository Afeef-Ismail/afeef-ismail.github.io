/* Entry point: wires every module together once the DOM and deferred scripts are ready. */
(function () {
  "use strict";

  const PF = window.PF || {};

  /** Runs one init step so a failure in a decorative feature never blanks the page. */
  function safely(name, step) {
    try {
      step();
    } catch (error) {
      console.error("[portfolio] " + name + " failed to initialise:", error);
    }
  }

  /**
   * Describes one skill chip for the globe: its brand logo (data-logo) when it
   * has one, plus the chip's own icon-font glyph as the fallback drawing.
   */
  function skillItem(chip, group) {
    const iconEl = chip.querySelector("i");
    const item = { label: chip.textContent.trim(), group, logo: chip.dataset.logo || "" };
    if (!iconEl) return item;
    const style = getComputedStyle(iconEl);
    const char = getComputedStyle(iconEl, "::before").content.replace(/^["']|["']$/g, "");
    if (!char || char === "none" || char === "normal") return item;
    return { ...item, glyph: { char, weight: style.fontWeight, family: style.fontFamily } };
  }

  function init() {
    const motion = { reducedMotion: PF.env.reducedMotion };

    safely("projects", PF.initProjects);
    safely("certificates", PF.initCerts);
    safely("navigation", PF.initNav);
    safely("overlays", PF.initOverlays);

    safely("smooth scroll", PF.initSmoothScroll);
    safely("scroll chrome", PF.initScrollChrome);
    safely("reveal", PF.initReveal);
    safely("scrub", PF.initScrub);

    safely("spotlight", PF.initSpotlight);
    safely("tilt", () => PF.initTilt(document));
    safely("magnetic", PF.initMagnetic);
    safely("aura", PF.initAura);
    safely("typed", () => PF.initTyped(document.getElementById("typed"), PF.typedPhrases));

    safely("neural canvas", () => PF.initNeural(document.getElementById("neural"), motion));
    safely("loss chart", () =>
      PF.initLossChart(document.getElementById("loss-chart"), document.getElementById("loss-epoch"), document.getElementById("loss-value"), motion)
    );

    safely("skills globe", () => {
      const skills = Array.from(document.querySelectorAll(".skill-group"), (group, index) =>
        Array.from(group.querySelectorAll(".chips li"), (chip) => skillItem(chip, index))
      ).flat();
      PF.initGlobe(document.getElementById("skill-globe"), skills, motion);
    });

    safely("boot", PF.initBoot);

    /* Tells the inline watchdog in index.html that the app started. */
    PF.ready = true;
    document.documentElement.classList.add("js");
  }

  if (!PF.env) {
    /* Core script missing: reveal everything rather than leave hidden content. */
    document.documentElement.classList.remove("js");
    return;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
