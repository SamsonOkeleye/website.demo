(() => {
  document.documentElement.classList.add("js");

  const nav = document.querySelector(".nav");
  if (!nav) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const sectionForPage = (page) => {
    if (page.startsWith("destination-")) return "destination";
    if (page.startsWith("crew-")) return "crew";
    if (page.startsWith("technology-")) return "technology";
    return "home";
  };

  const currentSection = sectionForPage(currentPage);
  nav.id = nav.id || "primary-navigation";

  for (const link of nav.querySelectorAll("a[href]")) {
    const targetPage = new URL(link.href, window.location.href).pathname.split("/").pop();
    const isCurrentSection = sectionForPage(targetPage) === currentSection;
    link.classList.toggle("active", isCurrentSection);
    link.removeAttribute("aria-current");

    if (isCurrentSection) {
      link.setAttribute("aria-current", targetPage === currentPage ? "page" : "location");
    }
  }

  for (const link of document.querySelectorAll(".tabs a[href], .dots a[href], .steps a[href]")) {
    const targetPage = new URL(link.href, window.location.href).pathname.split("/").pop();
    const isCurrentPage = targetPage === currentPage;
    link.classList.toggle("active", isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    if (link.matches(".steps a")) {
      link.setAttribute("aria-label", `Technology step ${link.textContent.trim()}`);
    }
  }

  const menuButton = document.createElement("button");
  menuButton.className = "menu-toggle";
  menuButton.type = "button";
  menuButton.setAttribute("aria-controls", nav.id);
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");

  const menuIcon = document.createElement("span");
  menuIcon.className = "menu-toggle-icon";
  menuIcon.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 3; index += 1) {
    menuIcon.append(document.createElement("span"));
  }
  menuButton.append(menuIcon, document.createTextNode("Menu"));
  nav.parentElement.insertBefore(menuButton, nav);

  const setMenuOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
  });

  window.matchMedia("(min-width: 601px)").addEventListener("change", () => setMenuOpen(false));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  const entranceTargets = document.querySelectorAll(
    "main .hero-text, main > .page-title, main.hero > .explore, " +
      "main .content > .planet, main .content > .info, main .content > .text, " +
      "main .content > .photo, main .content > .steps, main .content > .picture"
  );

  document.querySelector(".header")?.animate(
    [
      { opacity: 0.78, transform: "translateY(-12px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 850, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );

  entranceTargets.forEach((element, index) => {
    element.animate(
      [
        { opacity: 0.78, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 900,
        delay: 120 + index * 90,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      }
    );
  });

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[href]");
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    const currentDirectory = window.location.pathname.slice(
      0,
      window.location.pathname.lastIndexOf("/") + 1
    );
    const isLocalPage =
      destination.protocol === window.location.protocol &&
      destination.host === window.location.host &&
      destination.pathname.startsWith(currentDirectory) &&
      destination.pathname.endsWith(".html");

    if (!isLocalPage || destination.href === window.location.href) return;

    event.preventDefault();
    setMenuOpen(false);

    const isCrewArrow = link.matches(".crew-arrow");
    const exitAnimations = isCrewArrow
      ? [...document.querySelectorAll(".crew .text, .crew .photo")].map((element) => {
          const direction = link.dataset.direction === "previous" ? 1 : -1;
          return element.animate(
            [
              { opacity: 1, transform: "translateX(0)" },
              { opacity: 0, transform: `translateX(${direction * 22}px)` },
            ],
            { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "both" }
          );
        })
      : [
          document.querySelector("main")?.animate(
            [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0, transform: "translateY(-8px)" },
            ],
            { duration: 340, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "both" }
          ),
          document.querySelector(".header")?.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 280, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "both" }
          ),
        ].filter(Boolean);

    await Promise.race([
      Promise.all(exitAnimations.map((animation) => animation.finished.catch(() => {}))),
      new Promise((resolve) => window.setTimeout(resolve, 400)),
    ]);
    window.location.assign(destination.href);
  });
})();