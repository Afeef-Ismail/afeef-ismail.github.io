/* Overlays: project case-study modal, screenshot lightbox, command palette. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const { el, icon } = PF;
  const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  const openLayers = [];

  function setLayer(layer, open) {
    layer.classList.toggle("is-open", open);
    layer.setAttribute("aria-hidden", String(!open));
    const index = openLayers.indexOf(layer);
    if (open && index === -1) openLayers.push(layer);
    if (!open && index !== -1) openLayers.splice(index, 1);
    PF.lockScroll(openLayers.length > 0);
  }

  function trapFocus(event, layer) {
    const items = Array.from(layer.querySelectorAll(FOCUSABLE)).filter((node) => node.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!items.includes(document.activeElement)) {
      /* Focus sits on the panel itself (or outside): pull it back inside. */
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------- Lightbox ---------------- */

  function initLightbox() {
    const layer = document.getElementById("lightbox");
    const image = document.getElementById("lightbox-img");
    if (!layer || !image) return { open() {}, close() {}, step() {}, layer: null };
    let sources = [];
    let current = 0;
    let returnFocus = null;

    function show(index) {
      current = (index + sources.length) % sources.length;
      image.src = sources[current].src;
      image.alt = sources[current].alt;
    }

    const api = {
      layer,
      open(list, index, opener) {
        sources = list;
        returnFocus = opener || null;
        layer.classList.toggle("is-single", list.length < 2);
        show(index);
        setLayer(layer, true);
        layer.querySelector("[data-lightbox-close]").focus();
      },
      close() {
        setLayer(layer, false);
        if (returnFocus) returnFocus.focus();
      },
      step(delta) {
        if (sources.length > 1) show(current + delta);
      }
    };

    layer.addEventListener("click", (event) => {
      const stepper = event.target.closest("[data-lightbox-step]");
      if (stepper) return api.step(Number(stepper.dataset.lightboxStep));
      if (event.target === layer || event.target.closest("[data-lightbox-close]")) api.close();
      return undefined;
    });
    return api;
  }

  /* ---------------- Project modal ---------------- */

  function block(title, items) {
    if (!items || !items.length) return null;
    return el("section", { class: "modal__block" }, [
      el("h4", { text: "// " + title }),
      el("ul", {}, items.map((item) => el("li", { text: item })))
    ]);
  }

  function gallery(project, lightbox) {
    const images = project.images || [];
    if (!images.length) return null;
    const list = images.map((src, i) => ({ src, alt: project.title + " screenshot " + (i + 1) }));
    return el(
      "div",
      { class: "modal__gallery" },
      list.map((item, i) => {
        const thumb = el("button", { class: "modal__thumb", type: "button", "aria-label": "Open " + item.alt }, [
          el("img", { src: item.src, alt: "", loading: "lazy" })
        ]);
        thumb.addEventListener("click", () => lightbox.open(list, i, thumb));
        return thumb;
      })
    );
  }

  function modalBody(project, lightbox) {
    const links = project.github
      ? el("a", { class: "btn btn--primary btn--sm", href: project.github, target: "_blank", rel: "noreferrer" }, [
          icon("fa-brands fa-github"),
          document.createTextNode(" View on GitHub")
        ])
      : el("span", { class: "modal__note", text: project.privateNote || "Source is private: this project uses confidential data." });

    return [
      el("p", { class: "modal__kicker", text: project.kicker }),
      el("h3", { class: "modal__title", id: "modal-title", text: project.title }),
      el("p", { class: "modal__summary", text: project.summary }),
      project.role ? el("p", { class: "project__role project__role--modal" }, [el("b", { text: "My role: " }), document.createTextNode(project.role)]) : null,
      el("ul", { class: "tags" }, project.tags.map((tag) => el("li", { class: "tag", text: tag }))),
      gallery(project, lightbox),
      el("div", { class: "modal__grid" }, [
        block("what it does", project.features),
        block("what it required", project.required),
        block("engineering notes", project.engineering),
        block("why it matters", project.impact)
      ]),
      el("div", { class: "modal__links" }, [links, el("span", { class: "modal__note", text: "Esc to close" })])
    ];
  }

  function initModal(lightbox) {
    const layer = document.getElementById("project-modal");
    const content = document.getElementById("modal-content");
    if (!layer || !content) return { close() {}, layer: null };
    const panel = layer.querySelector(".modal__panel");
    let returnFocus = null;

    PF.openProject = function openProject(id, opener) {
      const project = PF.projects.find((item) => item.id === id);
      if (!project) return;
      returnFocus = opener || document.activeElement;
      content.replaceChildren(...modalBody(project, lightbox).filter(Boolean));
      panel.scrollTop = 0;
      setLayer(layer, true);
      panel.focus({ preventScroll: true });
    };

    const api = {
      layer,
      close() {
        setLayer(layer, false);
        if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
      }
    };

    layer.addEventListener("click", (event) => {
      if (event.target === layer || event.target.closest("[data-modal-close]")) api.close();
    });
    return api;
  }

  /* ---------------- Command palette ---------------- */

  function buildCommands() {
    const go = (hash) => () => PF.scrollTo(hash);
    const open = (url) => () => window.open(url, "_blank", "noopener");
    const sections = [
      ["Home", "#home", "fa-solid fa-house"],
      ["About", "#about", "fa-solid fa-user"],
      ["Projects", "#projects", "fa-solid fa-layer-group"],
      ["Skills", "#skills", "fa-solid fa-microchip"],
      ["Experience", "#experience", "fa-solid fa-briefcase"],
      ["Education", "#education", "fa-solid fa-graduation-cap"],
      ["Certifications", "#certifications", "fa-solid fa-certificate"],
      ["Achievements", "#achievements", "fa-solid fa-trophy"],
      ["Contact", "#contact", "fa-solid fa-paper-plane"]
    ].map(([label, hash, ico]) => ({ group: "navigate", label, icon: ico, run: go(hash) }));

    const projects = PF.projects.map((project) => ({
      group: "projects",
      label: project.title,
      icon: "fa-solid fa-diagram-project",
      run: () => PF.openProject(project.id)
    }));

    const links = [
      { label: "Open resume (PDF)", icon: "fa-solid fa-file-pdf", run: open(PF.contact.resume) },
      { label: "GitHub profile", icon: "fa-brands fa-github", run: open(PF.contact.github) },
      { label: "LinkedIn profile", icon: "fa-brands fa-linkedin", run: open(PF.contact.linkedin) },
      { label: "Copy email address", icon: "fa-regular fa-copy", run: () => PF.copyText(PF.contact.email) },
      { label: "Send an email", icon: "fa-solid fa-envelope", run: open("https://mail.google.com/mail/?view=cm&fs=1&to=" + PF.contact.email) }
    ].map((item) => ({ ...item, group: "links" }));

    return sections.concat(projects, links);
  }

  function initPalette() {
    const layer = document.getElementById("palette");
    const input = document.getElementById("palette-input");
    const list = document.getElementById("palette-list");
    const opener = document.getElementById("palette-open");
    if (!layer || !input || !list) return { close() {}, toggle() {}, layer: null };
    const commands = buildCommands();
    let matches = commands;
    let active = 0;
    let returnFocus = null;

    function highlight() {
      list.querySelectorAll(".palette__item").forEach((node, i) => {
        const on = i === active;
        node.classList.toggle("is-active", on);
        node.setAttribute("aria-selected", String(on));
        if (on) node.scrollIntoView({ block: "nearest" });
      });
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      matches = commands.filter((cmd) => (cmd.label + " " + cmd.group).toLowerCase().includes(query));
      active = 0;
      if (!matches.length) {
        list.replaceChildren(el("li", { class: "palette__empty", text: "No matches. Try \"projects\" or \"resume\"." }));
        return;
      }
      const rows = [];
      matches.forEach((cmd, i) => {
        if (i === 0 || matches[i - 1].group !== cmd.group) rows.push(el("li", { class: "palette__group", role: "presentation", text: cmd.group }));
        rows.push(el("li", { class: "palette__item", role: "option", "data-index": String(i) }, [icon(cmd.icon), el("span", { text: cmd.label })]));
      });
      list.replaceChildren(...rows);
      highlight();
    }

    function run(index) {
      const cmd = matches[index];
      if (!cmd) return;
      api.close();
      cmd.run();
    }

    const api = {
      layer,
      open() {
        returnFocus = document.activeElement;
        input.value = "";
        render();
        setLayer(layer, true);
        setTimeout(() => input.focus(), 40);
      },
      close() {
        setLayer(layer, false);
        if (returnFocus && returnFocus !== document.body && returnFocus.focus) returnFocus.focus({ preventScroll: true });
      },
      toggle() {
        if (layer.classList.contains("is-open")) api.close();
        else api.open();
      }
    };

    input.addEventListener("input", render);
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!matches.length) return;
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
        highlight();
      } else if (event.key === "Enter") {
        event.preventDefault();
        run(active);
      }
    });
    list.addEventListener("click", (event) => {
      const item = event.target.closest(".palette__item");
      if (item) run(Number(item.dataset.index));
    });
    list.addEventListener("pointermove", (event) => {
      const item = event.target.closest(".palette__item");
      if (!item || Number(item.dataset.index) === active) return;
      active = Number(item.dataset.index);
      highlight();
    });
    layer.addEventListener("click", (event) => event.target === layer && api.close());
    if (opener) opener.addEventListener("click", api.open);
    return api;
  }

  PF.initOverlays = function initOverlays() {
    const lightbox = initLightbox();
    const modal = initModal(lightbox);
    const palette = initPalette();
    const closers = new Map([
      [lightbox.layer, lightbox.close],
      [modal.layer, modal.close],
      [palette.layer, palette.close]
    ]);

    document.addEventListener("keydown", (event) => {
      const top = openLayers[openLayers.length - 1];
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        palette.toggle();
        return;
      }
      if (!top) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closers.get(top)();
      } else if (event.key === "Tab") {
        trapFocus(event, top);
      } else if (top === lightbox.layer && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        lightbox.step(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
  };
})();
