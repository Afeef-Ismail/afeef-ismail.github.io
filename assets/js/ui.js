/* Page UI: project grid + filters, certificate grid, navigation. */
(function () {
  "use strict";

  const PF = (window.PF = window.PF || {});
  const { el, icon } = PF;
  const pad2 = (n) => String(n).padStart(2, "0");

  function projectMedia(project, index) {
    const inner = project.image
      ? el("img", { src: project.image, alt: project.imageAlt || project.title, loading: "lazy", decoding: "async" })
      : el("div", { class: "project__visual" }, [icon(project.visual.icon), el("span", { text: project.visual.text })]);
    return el("div", { class: "project__media" }, [inner, el("span", { class: "project__idx", text: pad2(index + 1) })]);
  }

  function projectCard(project, index) {
    const more = el("button", { class: "project__more", type: "button", "aria-label": "View details: " + project.title }, [
      el("span", { text: "View case study" }),
      icon("fa-solid fa-arrow-right")
    ]);
    const github = project.github
      ? el("a", { class: "icon-btn", href: project.github, target: "_blank", rel: "noreferrer", "aria-label": project.title + " on GitHub" }, [icon("fa-brands fa-github")])
      : el("span", { class: "tag", text: "private" });

    const body = el("div", { class: "project__body" }, [
      el("p", { class: "project__cat", text: project.label }),
      el("h3", { text: project.title }),
      el("p", { text: project.blurb }),
      el("ul", { class: "tags" }, project.cardTags.map((tag) => el("li", { class: "tag", text: tag }))),
      el("div", { class: "project__foot" }, [more, github])
    ]);

    const card = el(
      "article",
      { class: "card project tilt" + (project.wide ? " project--wide" : ""), "data-id": project.id, "data-cats": project.cats.join(" "), "data-reveal": true },
      [projectMedia(project, index), body]
    );
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      PF.openProject(project.id, more);
    });
    return card;
  }

  function applyFilter(grid, filterId) {
    grid.classList.toggle("is-filtered", filterId !== "all");
    grid.querySelectorAll(".project").forEach((card) => {
      const match = filterId === "all" || card.dataset.cats.split(" ").includes(filterId);
      card.classList.toggle("is-hidden", !match);
      if (match) card.classList.add("is-in");
    });
  }

  PF.initProjects = function initProjects() {
    const grid = document.getElementById("project-grid");
    const bar = document.getElementById("project-filters");
    if (!grid || !bar) return;

    PF.projects.forEach((project, index) => grid.appendChild(projectCard(project, index)));

    const buttons = PF.filters.map((filter) => {
      const count = filter.id === "all" ? PF.projects.length : PF.projects.filter((p) => p.cats.includes(filter.id)).length;
      const button = el("button", { class: "filter", type: "button", "data-filter": filter.id, "aria-pressed": "false" }, [
        el("span", { text: filter.label }),
        el("small", { text: pad2(count) })
      ]);
      bar.appendChild(button);
      return button;
    });

    function select(filterId) {
      buttons.forEach((button) => {
        const active = button.dataset.filter === filterId;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const update = () => applyFilter(grid, filterId);
      if (document.startViewTransition && !PF.env.reducedMotion) document.startViewTransition(update);
      else update();
      if (PF.refreshScroll) setTimeout(PF.refreshScroll, 450);
    }

    bar.addEventListener("click", (event) => {
      const button = event.target.closest(".filter");
      if (button) select(button.dataset.filter);
    });
    buttons[0].classList.add("is-active");
    buttons[0].setAttribute("aria-pressed", "true");
  };

  PF.initCerts = function initCerts() {
    const grid = document.getElementById("cert-grid");
    const toggle = document.getElementById("cert-toggle");
    if (!grid) return;

    PF.certs.forEach((cert) => {
      grid.appendChild(
        el("a", { class: "card cert", href: encodeURI(cert.pdf), target: "_blank", rel: "noreferrer", "data-reveal": true }, [
          el("span", { class: "cert__img" }, [el("img", { src: cert.img, alt: cert.title + " certificate", loading: "lazy", decoding: "async" })]),
          el("span", { class: "cert__body" }, [
            el("strong", { text: cert.title }),
            el("span", { text: cert.note }),
            el("em", { class: "mono" }, [document.createTextNode("View PDF "), icon("fa-solid fa-arrow-up-right-from-square")])
          ])
        ])
      );
    });

    if (!toggle) return;
    const label = toggle.querySelector("span");
    toggle.addEventListener("click", () => {
      const collapsed = grid.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      label.textContent = collapsed ? "Show all certificates" : "Show fewer certificates";
      grid.querySelectorAll(".cert").forEach((card) => card.classList.add("is-in"));
      if (collapsed) grid.scrollIntoView({ block: "nearest" });
      if (PF.refreshScroll) PF.refreshScroll();
    });
  };

  PF.initNav = function initNav() {
    const nav = document.getElementById("nav");
    const links = document.getElementById("nav-links");
    const toggle = document.getElementById("nav-toggle");
    if (!nav || !links) return;

    function setMenu(open) {
      links.classList.toggle("is-open", open);
      if (!toggle) return;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      toggle.replaceChildren(icon(open ? "fa-solid fa-xmark" : "fa-solid fa-bars"));
    }

    if (toggle) toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    links.addEventListener("click", (event) => event.target.closest("a") && setMenu(false));
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) setMenu(false);
    });

    const anchors = Array.from(links.querySelectorAll("a"));
    const byId = new Map(anchors.map((a) => [a.getAttribute("href").slice(1), a]));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            anchors.forEach((a) => a.classList.remove("is-active"));
            const active = byId.get(entry.target.id);
            if (active) active.classList.add("is-active");
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    }

    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", () => PF.copyText(button.dataset.copy));
    });
  };
})();
