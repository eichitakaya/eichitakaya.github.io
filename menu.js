(function () {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const mobileQuery = window.matchMedia("(max-width: 720px)");

  if (!toggle || !nav) return;

  const setMenuOpen = (isOpen) => {
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (mobileQuery.matches && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  const handleViewportChange = (event) => {
    if (!event.matches) {
      setMenuOpen(false);
    }
  };

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(handleViewportChange);
  }
}());
