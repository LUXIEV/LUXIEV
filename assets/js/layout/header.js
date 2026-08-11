/* ============================================================
   HEADER SCRIPTS
   1. HeaderScrollController   — toggles the white header background on scroll
   2. NavDropdownController    — hamburger button + navigation dropdown
   3. SearchToggleController   — simple search icon/overlay toggle
   4. SearchOverlayController  — rich search overlay (autocomplete, recent
                                  searches, results filtering, skeleton demo)
   ============================================================ */

/* ============================================================
   1. HEADER SCROLL CONTROLLER
   ------------------------------------------------------------
   Watches the scroll position and, as soon as the user starts
   scrolling (even by a single pixel), adds a modifier class that
   switches the header from transparent to solid white.

   Uses the scroll event combined with requestAnimationFrame
   throttling to keep things smooth and avoid unnecessary
   recalculations on every scroll tick.
   ============================================================ */
const HeaderScrollController = (() => {
  const SELECTORS = {
    header: ".header"
  };

  const MODIFIER_CLASS = "header--scrolled";

  // Minimum scroll distance (in px) before the header switches to white.
  // Kept at a low value so the effect triggers as soon as scrolling starts.
  const SCROLL_THRESHOLD = 50;

  let headerEl = null;
  let ticking = false; // prevents redundant updates within the same frame

  /**
   * Updates the header's visual state based on the current scroll position.
   */
  function updateHeaderState() {
    const hasScrolled = window.scrollY > SCROLL_THRESHOLD;
    headerEl.classList.toggle(MODIFIER_CLASS, hasScrolled);
    ticking = false;
  }

  /**
   * Fires on every scroll event, but defers the actual DOM update until
   * the browser is ready to paint the next frame (requestAnimationFrame),
   * so we don't overload the main thread during fast scrolling.
   */
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }

  /**
   * Confirms the header element exists before we start observing it.
   * @returns {boolean}
   */
  function validateDependencies() {
    if (!headerEl) {
      console.warn(`HeaderScrollController: element "${SELECTORS.header}" not found on the page.`);
      return false;
    }
    return true;
  }

  /**
   * Entry point.
   */
  function init() {
    headerEl = document.querySelector(SELECTORS.header);

    if (!validateDependencies()) return;

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Set the correct initial state in case the page was reloaded
    // while already scrolled down.
    updateHeaderState();
  }

  /**
   * Removes the event listener. Useful when running inside an SPA.
   */
  function destroy() {
    window.removeEventListener("scroll", handleScroll);
  }

  return { init, destroy };
})();

document.addEventListener("DOMContentLoaded", () => {
  HeaderScrollController.init();
});

/* ============================================================
   2. NAV DROPDOWN CONTROLLER
   ------------------------------------------------------------
   Handles opening/closing the hamburger navigation dropdown:
   toggle button, optional close button, Escape key, clicking a
   link/card inside it, and clicking outside of it.
   ============================================================ */
(() => {
  const navMenuButton = document.getElementById("navbarMenuBtn");
  const navDropdown = document.getElementById("dropdownMenu");
  const navDropdownCloseButton = document.getElementById("dropdownClose");

  if (!navMenuButton || !navDropdown) return;

  const isNavDropdownOpen = () => navDropdown.classList.contains("nav-dropdown--active");

  const openNavDropdown = () => {
    navDropdown.classList.add("nav-dropdown--active");
    navMenuButton.classList.add("active");
  };

  const closeNavDropdown = () => {
    navDropdown.classList.remove("nav-dropdown--active");
    navMenuButton.classList.remove("active");
  };

  const toggleNavDropdown = () => {
    if (isNavDropdownOpen()) {
      closeNavDropdown();
    } else {
      openNavDropdown();
    }
  };

  // Open/close via the hamburger button
  navMenuButton.addEventListener("click", toggleNavDropdown);

  // Optional dedicated close button
  if (navDropdownCloseButton) {
    navDropdownCloseButton.addEventListener("click", closeNavDropdown);
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isNavDropdownOpen()) {
      closeNavDropdown();
    }
  });

  // Close when clicking any in-page link inside the dropdown
  navDropdown.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeNavDropdown);
  });

  // Close when clicking any featured project card
  navDropdown.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", closeNavDropdown);
  });

  // Close when clicking outside the button/dropdown
  document.addEventListener("click", (e) => {
    if (!isNavDropdownOpen()) return;

    const clickedOutside = !navMenuButton.contains(e.target) && !navDropdown.contains(e.target);

    if (clickedOutside) {
      closeNavDropdown();
    }
  });
})();

/* ============================================================
   3. SEARCH TOGGLE CONTROLLER
   ------------------------------------------------------------
   Simple toggle for the search overlay: swaps the header button's
   icon (search <-> home) and shows/hides the overlay. Focuses the
   search input whenever the overlay becomes active.
   ============================================================ */
(() => {
  const searchToggleBtn = document.getElementById("searchToggleBtn");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchInput = document.querySelector(".search-overlay__input");

  function toggleSearchOverlay() {
    const isActive = searchOverlay.classList.toggle("search-overlay--active");
    searchToggleBtn.classList.toggle("active", isActive);
    searchToggleBtn.setAttribute("aria-label", isActive ? "Close search" : "Search");
    if (isActive) searchInput.focus();
  }

  searchToggleBtn?.addEventListener("click", toggleSearchOverlay);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay?.classList.contains("search-overlay--active")) {
      toggleSearchOverlay();
    }
  });
})();

/* ============================================================
   4. SEARCH OVERLAY CONTROLLER
   ------------------------------------------------------------
   Rich search experience: ghost-text autocomplete, recent
   searches (persisted in localStorage), live results filtering
   with an empty state, Enter-to-navigate, and a skeleton-loading
   demo helper.
   ============================================================ */
(() => {
  const searchTrigger = document.getElementById("searchTrigger");
  const searchClose = document.getElementById("searchClose");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchInput = document.querySelector(".search-overlay__input");
  const emptyState = document.getElementById("emptyState");
  const emptyQuery = document.getElementById("emptyQuery");
  const productGrid = document.getElementById("productGrid");
  const recentSearchesEl = document.getElementById("recentSearches");
  const productCards = document.querySelectorAll(".product-card");
  const ghostEl = document.getElementById("searchGhost");
  const searchToggleBtn = document.getElementById("searchToggleBtn");

  if (!searchOverlay || !searchInput) return;

  const RECENT_SEARCHES_STORAGE_KEY = "studio_recent_searches";
  const MAX_RECENT_SEARCHES = 5;

  // Terms suggested by the ghost-text autocomplete
  const suggestedTerms = ["New Website", "E-commerce", "work", "support", "brand", "Website"];

  // Maps a matched term to the section it should scroll to
  const searchRoutes = {
    website: "#website",
    "New Website": "#New Website",
    "E-commerce": "#ecommerce",
    work: "#work",
    brand: "#brand",
    support: "#support"
  };

  let currentSuggestion = "";

  /* ── Measure text width using the input's actual font (canvas trick) ── */
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");

  function measureTextWidth(text) {
    measureCtx.font = getComputedStyle(searchInput).font;
    return measureCtx.measureText(text).width;
  }

  /**
   * Keeps the input's typed text and the ghost suggestion visually
   * aligned by centering them together as one block.
   */
  function alignInputAndGhost(query, match) {
    if (!match) {
      searchInput.style.textAlign = "center";
      searchInput.style.paddingLeft = "";
      ghostEl.style.textAlign = "center";
      ghostEl.style.paddingLeft = "";
      return;
    }
    const wrapWidth = searchInput.parentElement.clientWidth;
    const fullWidth = measureTextWidth(match);
    const offset = Math.max(0, (wrapWidth - fullWidth) / 2);
    searchInput.style.textAlign = "left";
    searchInput.style.paddingLeft = offset + "px";
    ghostEl.style.textAlign = "left";
    ghostEl.style.paddingLeft = offset + "px";
  }

  function openSearch() {
    searchOverlay.classList.add("search-overlay--active");
    document.body.style.overflow = "hidden";
    renderRecentSearches();
    setTimeout(() => searchInput.focus(), 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove("search-overlay--active");
    document.body.style.overflow = "";
    searchInput.value = "";
    emptyState?.classList.remove("search-overlay__empty--visible");
    currentSuggestion = "";
    ghostEl.innerHTML = "";
    alignInputAndGhost("", null);

    searchToggleBtn?.classList.remove("active");
    searchToggleBtn?.setAttribute("aria-label", "Search");
  }

  // Close the overlay when any in-page link inside it is clicked
  const overlayLinks = searchOverlay.querySelectorAll('a[href^="#"]');
  overlayLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeSearch();
    });
  });

  searchTrigger?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay.classList.contains("search-overlay--active")) {
      closeSearch();
    }
  });

  /* ── Recent searches (persisted via localStorage) ── */
  function getRecentSearches() {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) || "[]");
  }

  function saveRecentSearch(term) {
    if (!term.trim()) return;
    let recent = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
    recent.unshift(term);
    recent = recent.slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recent));
  }

  function removeRecentSearch(term) {
    const recent = getRecentSearches().filter((t) => t !== term);
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recent));
    renderRecentSearches();
  }

  function renderRecentSearches() {
    const recent = getRecentSearches();
    recentSearchesEl.innerHTML = "";
    if (recent.length === 0) {
      recentSearchesEl.classList.remove("recent-searches--visible");
      return;
    }
    recentSearchesEl.classList.add("recent-searches--visible");

    const title = document.createElement("p");
    title.className = "popular-searches__title";
    title.style.fontSize = "14px";
    title.style.letterSpacing = "3px";
    title.style.marginBottom = "6px";
    title.textContent = "Recent";
    recentSearchesEl.appendChild(title);

    recent.forEach((term) => {
      const item = document.createElement("div");
      item.className = "recent-searches__item";
      item.innerHTML = `<span>${term}</span><button aria-label="Remove">✕</button>`;
      item.querySelector("button").addEventListener("click", () => removeRecentSearch(term));
      item.querySelector("span").addEventListener("click", () => {
        searchInput.value = term;
        searchInput.dispatchEvent(new Event("input"));
      });
      recentSearchesEl.appendChild(item);
    });
  }

  /* ── Ghost-text autocomplete (suggestion rendered inline inside the field) ── */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderGhost(query) {
    if (!query) {
      currentSuggestion = "";
      ghostEl.innerHTML = "";
      alignInputAndGhost(query, null);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const match = suggestedTerms.find(
      (term) => term.toLowerCase().startsWith(normalizedQuery) && term.length > query.length
    );

    if (!match) {
      currentSuggestion = "";
      ghostEl.innerHTML = "";
      alignInputAndGhost(query, null);
      return;
    }

    currentSuggestion = match;
    const typedPart = match.slice(0, query.length);
    const restPart = match.slice(query.length);
    ghostEl.innerHTML = `<span>${escapeHtml(typedPart)}</span><span>${escapeHtml(restPart)}</span>`;
    alignInputAndGhost(query, match);
  }

  function acceptGhostSuggestion() {
    if (!currentSuggestion) return false;
    searchInput.value = currentSuggestion;
    ghostEl.innerHTML = "";
    currentSuggestion = "";
    searchInput.dispatchEvent(new Event("input"));
    const caretPosition = searchInput.value.length;
    searchInput.setSelectionRange(caretPosition, caretPosition);
    return true;
  }

  /* ── Search input -> suggestions + empty state + save on Enter ── */
  searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    renderGhost(query);
    const trimmedQuery = query.trim();

    if (trimmedQuery.length > 0) {
      const hasMatch = Array.from(productCards).some((card) =>
        card.querySelector(".product-card__name").textContent.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      if (!hasMatch) {
        emptyQuery.textContent = trimmedQuery;
        emptyState.classList.add("search-overlay__empty--visible");
      } else {
        emptyState.classList.remove("search-overlay__empty--visible");
      }
    } else {
      emptyState?.classList.remove("search-overlay__empty--visible");
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    const caretAtEnd = searchInput.selectionStart === searchInput.value.length;

    if (currentSuggestion && caretAtEnd && (e.key === "Tab" || e.key === "ArrowRight")) {
      e.preventDefault();
      acceptGhostSuggestion();
      return;
    }

    if (e.key === "Enter") {
      if (currentSuggestion) {
        acceptGhostSuggestion();
      }

      const target = searchInput.value.trim();

      if (target) {
        saveRecentSearch(target);
      }

      if (searchRoutes[target]) {
        closeSearch();
        document.querySelector(searchRoutes[target]).scrollIntoView({
          behavior: "smooth"
        });
      }
    }
  });

  /**
   * Demo helper: renders skeleton placeholder cards to simulate a
   * network fetch delay, then reloads the page to restore the real
   * cards. Replace with a real fetch call in production.
   */
  function showSkeletonThenLoad() {
    productGrid.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "product-card product-card--skeleton";
      skeleton.innerHTML = `
                <div class="product-card__image"></div>
                <div class="product-card__info">
                    <h4 class="product-card__name">Loading name</h4>
                    <span class="product-card__price">Loading</span>
                </div>
            `;
      productGrid.appendChild(skeleton);
    }
    // Simulated network delay — replace with a real fetch in production
    setTimeout(() => {
      location.reload(); // demo only: reload to restore the real cards
    }, 1200);
  }

  // Uncomment to test the skeleton-loading demo on page load:
  // showSkeletonThenLoad();
})();