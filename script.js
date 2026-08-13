/* ──────────────────────────────────────────────────────────
           1. ELEMENT REFERENCES
           ────────────────────────────────────────────────────────── */
// Header
const menuBtn = document.getElementById("navbarMenuBtn") || document.querySelector(".navbar__menu-btn");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownClose = document.getElementById("dropdownClose");
const header = document.querySelector(".header");

// Stage
const stageCta = document.getElementById("stage-cta");
const stageSection = document.getElementById("stage");
const workSection = document.getElementById("work");
const stageCardsTrack = document.getElementById("stage__cards-track");
const stageCards = document.querySelectorAll(".stage__card");
const stageVideos = document.querySelectorAll(".stage__video");
const stageDotsWrap = document.getElementById("stage-dots");

// Trust
const trustSection = document.querySelector(".trust");
const trustNumbers = document.querySelectorAll(".trust__number");

// Wizard
const wizardOverlay = document.getElementById("wizard-overlay");
const wizardCloseBtn = document.getElementById("wizard-close");
const ctaCard = document.querySelector(".work__card--cta");
const wizardTypeButtons = document.querySelectorAll(".wizard__type");
const next1 = document.getElementById("next-1");
const next2 = document.getElementById("next-2");
const inputName = document.getElementById("input-name");
const inputProject = document.getElementById("input-project");
const inputContact = document.getElementById("input-contact");
const wizardSteps = document.querySelectorAll(".wizard__step");

const wizardDots = [
  document.getElementById("dot-1"),
  document.getElementById("dot-2"),
  document.getElementById("dot-3")
];

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
  const productNames = Array.from(productCards).map((card) => ({
    card,
    name: card.querySelector(".product-card__name")?.textContent.toLowerCase().trim() || ""
  }));
  const ghostEl = document.getElementById("searchGhost");
  const searchToggleBtn = document.getElementById("searchToggleBtn");

  let searchFocusTimer = null;

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

  const searchInputFont = getComputedStyle(searchInput).font;
  function measureTextWidth(text) {
    measureCtx.font = searchInputFont;
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

    clearTimeout(searchFocusTimer);

    searchFocusTimer = setTimeout(() => {
      searchInput.focus();
      searchFocusTimer = null;
    }, 300);
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
      const normalizedQuery = trimmedQuery.toLowerCase();

      const hasMatch = productNames.some(({ name }) => name.includes(normalizedQuery));

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

/* ──────────────────────────────────────────────────────────
   4. STAGE — SCROLL-TO-WORK (CTA BUTTON)
   ────────────────────────────────────────────────────────── */
function scrollToWork(e) {
  if (!stageCta || !workSection) return;
  e.preventDefault();
  const headerOffset = header?.offsetHeight || 0;
  const elementPosition = workSection.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
}
stageCta?.addEventListener("click", scrollToWork);
/* ──────────────────────────────────────────────────────────
   5. STAGE — VIDEO SWITCHER + SLIDER + AUTO-ADVANCE
   ────────────────────────────────────────────────────────── */
let stageCurrentIndex = 0;

let stageAutoTimer = null;
let stageScrollEndTimer = null;
let stageCenterScrollTimer = null;

let stageIsScrolling = false;
/* ── Stage Dots ─────────────────────────────────────────── */

stageCards.forEach((_, index) => {
  const dot = document.createElement("button");

  dot.type = "button";
  dot.className = "stage__dot" + (index === 0 ? " is-active" : "");
  dot.setAttribute("aria-label", `Go to slide ${index + 1}`);

  dot.addEventListener("click", () => {
    goToStageCard(index);
  });

  stageDotsWrap?.appendChild(dot);
});

const stageDots = document.querySelectorAll(".stage__dot");

/* ── Load Video Only When Needed ────────────────────────── */

function loadStageVideo(index) {
  const video = stageVideos[index];

  if (!video) return;

  const source = video.querySelector("source[data-src]");

  if (!source) return;

  source.src = source.dataset.src;
  source.removeAttribute("data-src");

  video.load();
}

/* ── Stop Video ──────────────────────────────────────────── */

function stopStageVideo(video) {
  if (!video) return;

  video.pause();

  /*
   * Resetting currentTime prevents the old video from continuing
   * from its previous position when it becomes active again.
   */
  try {
    video.currentTime = 0;
  } catch (error) {
    // Ignore videos that are not ready for seeking yet.
  }

  video.classList.remove("is-active");
}

/* ── Play Active Video ───────────────────────────────────── */

function playStageVideo(video) {
  if (!video) return;

  video.classList.add("is-active");

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
}

/* ── Switch Stage ────────────────────────────────────────── */

function goToStageCard(index) {
  if (!stageCards.length || !stageVideos.length) return;

  if (index < 0 || index >= stageCards.length) return;

  if (index === stageCurrentIndex) return;

  const previousIndex = stageCurrentIndex;
  const previousVideo = stageVideos[previousIndex];
  const nextVideo = stageVideos[index];

  if (!nextVideo) return;

  /* Load requested video */
  loadStageVideo(index);

  /*
   * Preload only the next video.
   * This keeps transitions smoother without loading
   * all videos at once.
   */
  const nextIndex = (index + 1) % stageVideos.length;

  if (nextIndex !== index) {
    loadStageVideo(nextIndex);
  }

  const switchNow = () => {
    /* Stop previous video completely */
    if (previousVideo && previousVideo !== nextVideo) {
      stopStageVideo(previousVideo);
    }

    /* Update cards */
    stageCards[previousIndex]?.classList.remove("is-active");
    stageCards[index]?.classList.add("is-active");

    /* Update dots */
    stageDots[previousIndex]?.classList.remove("is-active");
    stageDots[index]?.classList.add("is-active");

    /* Update current index before playing */
    stageCurrentIndex = index;

    /* Start ONLY the active video */
    playStageVideo(nextVideo);

    /* Center selected card */
    centerStageCard(index);
  };

  if (nextVideo.readyState >= 3) {
    try {
      nextVideo.currentTime = 0;
    } catch (error) {}

    switchNow();
  } else {
    nextVideo.addEventListener(
      "canplay",
      () => {
        try {
          nextVideo.currentTime = 0;
        } catch (error) {}

        switchNow();
      },
      { once: true }
    );
  }
}
/* ── Center Stage Card ───────────────────────────────────── */
function centerStageCard(index) {
  if (!stageCardsTrack || !stageCards[index]) return;

  stageIsScrolling = true;

  const card = stageCards[index];

  const offset = card.offsetLeft - stageCardsTrack.offsetWidth / 2 + card.offsetWidth / 2;

  stageCardsTrack.scrollTo({
    left: offset,
    behavior: "smooth"
  });

  clearTimeout(stageCenterScrollTimer);

  stageCenterScrollTimer = setTimeout(() => {
    stageIsScrolling = false;
    stageCenterScrollTimer = null;
  }, 600);
}

/* ── Auto Advance ────────────────────────────────────────── */
function startStageAuto() {
  if (stageAutoTimer) return;

  stageAutoTimer = setInterval(() => {
    const next = (stageCurrentIndex + 1) % stageCards.length;
    goToStageCard(next);
  }, 3000);
}

function stopStageAuto() {
  if (!stageAutoTimer) return;

  clearInterval(stageAutoTimer);
  stageAutoTimer = null;
}

/* ── Detect Centered Card ────────────────────────────────── */

function getCardInCenter() {
  if (!stageCardsTrack || !stageCards.length) {
    return 0;
  }

  const trackCenter = stageCardsTrack.scrollLeft + stageCardsTrack.offsetWidth / 2;

  let closest = 0;
  let minDistance = Infinity;

  stageCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;

    const distance = Math.abs(trackCenter - cardCenter);

    if (distance < minDistance) {
      minDistance = distance;
      closest = index;
    }
  });

  return closest;
}

/* ── Manual Stage Scroll ─────────────────────────────────── */
stageCardsTrack?.addEventListener(
  "scroll",
  () => {
    if (stageIsScrolling) return;

    clearTimeout(stageScrollEndTimer);

    stageScrollEndTimer = setTimeout(() => {
      stageScrollEndTimer = null;

      const centered = getCardInCenter();

      if (centered === stageCurrentIndex) return;

      const previousIndex = stageCurrentIndex;
      const previousVideo = stageVideos[previousIndex];
      const currentVideo = stageVideos[centered];

      loadStageVideo(centered);

      if (previousVideo) {
        stopStageVideo(previousVideo);
      }

      stageCards[previousIndex]?.classList.remove("is-active");
      stageCards[centered]?.classList.add("is-active");

      stageDots[previousIndex]?.classList.remove("is-active");
      stageDots[centered]?.classList.add("is-active");

      stageCurrentIndex = centered;

      if (currentVideo) {
        try {
          currentVideo.currentTime = 0;
        } catch (error) {}

        playStageVideo(currentVideo);
      }
    }, 150);
  },
  { passive: true }
);
/* ── Pause Auto Advance During Interaction ──────────────── */

stageCardsTrack?.addEventListener("mouseenter", stopStageAuto);

stageCardsTrack?.addEventListener("mouseleave", startStageAuto);

stageCardsTrack?.addEventListener("touchstart", stopStageAuto, { passive: true });

stageCardsTrack?.addEventListener("touchend", startStageAuto, { passive: true });

/* ── Initial Stage Setup ─────────────────────────────────── */

window.addEventListener("load", () => {
  if (!stageCards.length) return;

  const firstVideo = stageVideos[0];

  /* First card */
  stageCards[0]?.classList.add("is-active");
  stageDots[0]?.classList.add("is-active");

  /* Load and play ONLY first video */
  if (firstVideo) {
    loadStageVideo(0);

    firstVideo.classList.add("is-active");

    firstVideo.play().catch(() => {});
  }

  /*
   * Preload only the second video.
   * We don't load all six videos on startup.
   */
  if (stageVideos.length > 1) {
    loadStageVideo(1);
  }

  /* Center first card */
  centerStageCard(0);

  /* Start automatic slider */
  startStageAuto();
});

/* ──────────────────────────────────────────────────────────
      6. TRUST — ANIMATED STAT COUNTERS
      ────────────────────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll(".trust [data-fade]");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((el) => observer.observe(el));
})();

(function () {
  const counters = document.querySelectorAll(".trust__number");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
})();

const slider = document.getElementById("slider__track");
const dotsContainer = document.getElementById("slider__dots");

let sliderCardsObserver = null;
let activeSliderDot = null;
/* ──────────────────────────────────────────────────────────
   WORK SLIDER — PERFORMANCE OPTIMIZED
────────────────────────────────────────────────────────── */

const workSlider = document.getElementById("slider__track");
const workProgress = document.getElementById("work-progress");
const workFilters = document.querySelectorAll(".work__filter");
const workCards = document.querySelectorAll(".slider__card:not(.slider__card--cta)");
const newWebsiteBtn = document.getElementById("startProjectBtn");

const workCurrentEl = document.getElementById("slider-current");
const workTotalEl = document.getElementById("slider-total");

let sliderProgressRaf = null;
let workCardsObserver = null;

/* ── Update Progress ────────────────────────────────────── */

function updateProgress() {
  if (!workSlider || !workProgress) return;

  const maxScroll = workSlider.scrollWidth - workSlider.clientWidth;

  if (maxScroll <= 0) {
    workProgress.style.transform = "scaleX(0)";
    return;
  }

  const progress = workSlider.scrollLeft / maxScroll;
  workProgress.style.transform = `scaleX(${progress})`;
}

/* ── Schedule Progress Update ───────────────────────────── */

function requestProgressUpdate() {
  if (sliderProgressRaf !== null) return;

  sliderProgressRaf = requestAnimationFrame(() => {
    updateProgress();
    sliderProgressRaf = null;
  });
}

/* ── Slider Scroll ──────────────────────────────────────── */

function scrollSlider(direction) {
  if (!workSlider) return;

  workSlider.scrollBy({
    left: direction * 220,
    behavior: "smooth"
  });
}

window.scrollSlider = scrollSlider;

/* ── Optimized Scroll Listener ──────────────────────────── */

workSlider?.addEventListener("scroll", requestProgressUpdate, { passive: true });

/* ──────────────────────────────────────────────────────────
   WORK COUNTER
   ────────────────────────────────────────────────────────── */
function initWorkCounter() {
  if (!workSlider || !workCards.length) return;

  const cards = Array.from(workCards).filter((card) => !card.classList.contains("hidden"));

  if (workTotalEl) {
    workTotalEl.textContent = cards.length; // ✅ من غير padStart
  }

  workCardsObserver?.disconnect();

  workCardsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const index = cards.indexOf(entry.target);
        if (index === -1) return;

        if (workCurrentEl) {
          workCurrentEl.textContent = index + 1; // ✅ من غير padStart
        }
      });
    },
    {
      root: workSlider,
      threshold: 0.6
    }
  );

  cards.forEach((card) => workCardsObserver.observe(card));
}
/* ──────────────────────────────────────────────────────────
   INITIAL SLIDER POSITION
   ────────────────────────────────────────────────────────── */

window.addEventListener("load", () => {
  if (!workSlider || !workCards.length) return;

  const card = workCards[2];

  if (card) {
    workSlider.scrollLeft = card.offsetLeft - workSlider.offsetWidth / 2 + card.offsetWidth / 2;
  }

  updateProgress();
  initWorkCounter();
});
/* ──────────────────────────────────────────────────────────
        8. WIZARD — "NEW PROJECT" REQUEST MODAL
        ────────────────────────────────────────────────────────── */
let wizardSelectedType = "";

function openWizard() {
  wizardOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeWizard() {
  wizardOverlay.classList.remove("open");
  document.body.style.overflow = "";
  goToWizardStep(1);

  wizardTypeButtons.forEach((btn) => btn.classList.remove("selected"));
  next1.disabled = true;

  inputName.value = "";
  inputProject.value = "";
  inputContact.value = "";
  next2.disabled = true;

  wizardSelectedType = "";
}
function goToWizardStep(stepNumber) {
  const activeIndex = stepNumber - 1;

  wizardSteps.forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
  });

  wizardDots.forEach((dot, index) => {
    dot?.classList.toggle("done", index < stepNumber);
  });
}
ctaCard?.addEventListener("click", openWizard);
newWebsiteBtn?.addEventListener("click", openWizard);
wizardCloseBtn?.addEventListener("click", closeWizard);
wizardOverlay?.addEventListener("click", (e) => {
  if (e.target === wizardOverlay) closeWizard();
});

wizardTypeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    wizardTypeButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    wizardSelectedType = btn.dataset.type;
    next1.disabled = false;
  });
});
next1?.addEventListener("click", () => goToWizardStep(2));

function checkWizardStep2() {
  next2.disabled = !(inputName.value.trim() && inputProject.value.trim() && inputContact.value.trim());
}
[inputName, inputProject, inputContact].forEach((input) => input?.addEventListener("input", checkWizardStep2));

next2?.addEventListener("click", async () => {
  const email = localStorage.getItem("email");

  if (!email) {
    alert("لازم تسجل دخول الأول");
    return;
  }

  next2.disabled = true;
  next2.textContent = "Sending...";

  try {
    const response = await fetch("http://localhost:3000/api/submit-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: inputName.value.trim(),
        projectType: wizardSelectedType,
        projectName: inputProject.value.trim(),
        contact: inputContact.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "حصل خطأ، حاول تاني");
      next2.disabled = false;
      next2.textContent = "Send Request →";
      return;
    }

    goToWizardStep(3);
  } catch (err) {
    console.error(err);
    alert("مش قادر أوصل للسيرفر");
    next2.disabled = false;
    next2.textContent = "Send Request →";
  }
});
