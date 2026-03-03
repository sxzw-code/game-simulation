document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const allTabTriggers = Array.from(
    document.querySelectorAll("[data-target]")
  );

  function showPanel(id) {
    panels.forEach((panel) => {
      panel.classList.toggle("is-visible", panel.id === id);
    });

    navLinks.forEach((link) => {
      const target = link.getAttribute("data-target");
      link.classList.toggle("active", target === id);
    });

    if (window.innerWidth <= 720 && navList && navList.classList.contains("open")) {
      navList.classList.remove("open");
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-target");
      if (target) showPanel(target);
    });
  });

  allTabTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) showPanel(target);
    });
  });

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }
});

