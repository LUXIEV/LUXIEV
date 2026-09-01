/* ════════════════════════════════════════════════════════════
   TABLE OF CONTENTS
   1.  Element References
   2.  Header Scroll Controller
   3.  Nav Dropdown Controller
   4.  Search Toggle Controller
   5.  Search Overlay Controller
   6.  Stage — Scroll-to-Work (CTA button)
   7.  Stage — Video Switcher + Card Slider + Auto-Advance
   8.  Trust — Scroll-Reveal / Animated Stat Counters
   9.  Work Section — Slider (progress bar, arrows, counter)
   10. Wizard — "New Project" Request Modal
   ════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   1. ELEMENT REFERENCES
   ────────────────────────────────────────────────────────── */
// Header
const header = document.querySelector(".header");

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

/* ════════════════════════════════════════════════════════════
   2. HEADER SCROLL CONTROLLER
   ----------------------------------------------------------
   Watches the scroll position and, as soon as the user starts
   scrolling (even by a single pixel), adds a modifier class that
   switches the header from transparent to solid white.

   Uses the scroll event combined with requestAnimationFrame
   throttling to keep things smooth and avoid unnecessary
   recalculations on every scroll tick.
   ════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════
   3. NAV DROPDOWN CONTROLLER
   ----------------------------------------------------------
   Handles opening/closing the hamburger navigation dropdown:
   toggle button, optional close button, Escape key, clicking a
   link/card inside it, and clicking outside of it.
   ════════════════════════════════════════════════════════════ */
(() => {
  const navMenuButton = document.getElementById("navbarMenuBtn");
  const navDropdown = document.getElementById("dropdownMenu");
  const navDropdownCloseButton = document.getElementById("dropdownClose");

  if (!navMenuButton || !navDropdown) return;

  const isNavDropdownOpen = () => navDropdown.classList.contains("nav-dropdown--active");

  const openNavDropdown = () => {
    navDropdown.classList.add("nav-dropdown--active");
    navMenuButton.classList.add("active");
    navMenuButton.setAttribute("aria-expanded", "true");
  };

  const closeNavDropdown = () => {
    navDropdown.classList.remove("nav-dropdown--active");
    navMenuButton.classList.remove("active");
    navMenuButton.setAttribute("aria-expanded", "false");
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
/* =========================================================
   Stage
   ========================================================= */

const stageSection = document.getElementById("stage");
const stageCta = document.getElementById("stage-cta");
const workSection = document.getElementById("work");
const stageCardsTrack = document.getElementById("stage__cards-track");
const stageCards = document.querySelectorAll(".stage__card");
const stageVideos = document.querySelectorAll(".stage__video");
const stageDotsWrap = document.getElementById("stage-dots");

/* =========================================================
   CTA
   ========================================================= */

function scrollToWork(e) {
  if (!stageCta || !workSection) return;

  e.preventDefault();

  const headerOffset = header?.offsetHeight || 0;
  const elementPosition = workSection.getBoundingClientRect().top;

  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

stageCta?.addEventListener("click", scrollToWork);

/* =========================================================
   Stage State
   ========================================================= */

let stageCurrentIndex = 0;

let stageAutoTimer = null;
let stageScrollEndTimer = null;
let stageCenterScrollTimer = null;

let stageIsScrolling = false;
let stageIsVisible = false;
let stageIsSwitching = false;

/* =========================================================
   Video State
   ========================================================= */

/*
 * Videos that have already received their real src.
 *
 * WeakSet is perfect here because the key is the actual
 * HTMLVideoElement.
 */
const stageLoadedVideos = new WeakSet();

/*
 * Save the last playback position of every video.
 *
 * Example:
 *
 * video #1 → 4.73s
 * video #2 → 8.21s
 * video #3 → 2.14s
 */
const stageVideoTimes = new WeakMap();

/* =========================================================
   Dots
   ========================================================= */

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

/* =========================================================
   Load Video — ONLY ONCE
   ========================================================= */

function loadStageVideo(index) {
  const video = stageVideos[index];

  if (!video) return;

  /*
   * Already loaded?
   *
   * Do absolutely nothing.
   *
   * This prevents video.load() from being called again.
   */
  if (stageLoadedVideos.has(video)) {
    return;
  }

  const source = video.querySelector("source[data-src]");

  if (!source) {
    /*
     * The video may already have a normal src.
     * Consider it loaded.
     */
    stageLoadedVideos.add(video);
    return;
  }

  const src = source.dataset.src;

  if (!src) return;

  /*
   * Assign the real source only once.
   */
  source.src = src;

  source.removeAttribute("data-src");

  /*
   * load() is called ONLY the first time.
   */
  video.load();

  stageLoadedVideos.add(video);
}

/* =========================================================
   Save Video Position
   ========================================================= */

function saveStageVideoTime(video) {
  if (!video) return;

  const currentTime = video.currentTime;

  if (Number.isFinite(currentTime) && currentTime >= 0) {
    stageVideoTimes.set(video, currentTime);
  }
}

/* =========================================================
   Restore Video Position
   ========================================================= */

function restoreStageVideoTime(video) {
  if (!video) return;

  const savedTime = stageVideoTimes.get(video);

  if (typeof savedTime !== "number" || !Number.isFinite(savedTime)) {
    return;
  }

  /*
   * Restore only when the metadata is available.
   */
  if (video.readyState >= 1) {
    try {
      video.currentTime = savedTime;
    } catch (error) {
      // Ignore browser timing errors.
    }
  }
}

/* =========================================================
   Stop Video
   ========================================================= */

/*
 * Used when switching FROM one card TO another.
 *
 * Important:
 * We reset currentTime here intentionally because
 * a newly selected card should start from 0.
 */
function stopStageVideo(video) {
  if (!video) return;

  /*
   * Save position before stopping.
   *
   * This means if we ever return to this exact video,
   * its last position is still known.
   */
  saveStageVideoTime(video);

  video.pause();

  /*
   * New card starts from beginning.
   */
  try {
    video.currentTime = 0;
  } catch (error) {
    // Ignore browser timing errors.
  }

  /*
   * Since we intentionally reset this video,
   * remove the saved position.
   */
  stageVideoTimes.delete(video);

  video.classList.remove("is-active");
}

/* =========================================================
   Play Video
   ========================================================= */

function playStageVideo(video, restorePosition = true) {
  if (!video) return;

  if (!stageIsVisible) return;

  /*
   * Restore the previous position when returning
   * to a paused Stage.
   */
  if (restorePosition) {
    restoreStageVideoTime(video);
  }

  video.classList.add("is-active");

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
}

/* =========================================================
   Go To Stage Card
   ========================================================= */

function goToStageCard(index) {
  if (!stageIsVisible) return;

  if (!stageCards.length || !stageVideos.length) {
    return;
  }

  if (index < 0 || index >= stageCards.length) {
    return;
  }

  if (index === stageCurrentIndex) {
    return;
  }

  if (stageIsSwitching) {
    return;
  }

  const previousIndex = stageCurrentIndex;

  const previousVideo = stageVideos[previousIndex];

  const nextVideo = stageVideos[index];

  if (!nextVideo) return;

  stageIsSwitching = true;

  /* -----------------------------------------------------
       Load requested video once
       ----------------------------------------------------- */

  loadStageVideo(index);

  /* -----------------------------------------------------
       Preload next video once
       ----------------------------------------------------- */

  const preloadIndex = (index + 1) % stageVideos.length;

  if (preloadIndex !== index) {
    loadStageVideo(preloadIndex);
  }

  /* -----------------------------------------------------
       Switch
       ----------------------------------------------------- */

  const switchNow = () => {
    /*
     * User may have left Stage while video was loading.
     */
    if (!stageIsVisible) {
      stageIsSwitching = false;
      return;
    }

    /*
     * Stop previous video.
     *
     * This intentionally resets the previous card
     * because selecting it again should start from 0.
     */
    if (previousVideo && previousVideo !== nextVideo) {
      stopStageVideo(previousVideo);
    }

    /* Card state */

    stageCards[previousIndex]?.classList.remove("is-active");

    stageCards[index]?.classList.add("is-active");

    /* Dot state */

    stageDots[previousIndex]?.classList.remove("is-active");

    stageDots[index]?.classList.add("is-active");

    /* Current index */

    stageCurrentIndex = index;

    /*
     * New card ALWAYS starts from 0.
     */
    try {
      nextVideo.currentTime = 0;
    } catch (error) {
      // Ignore browser timing errors.
    }

    /*
     * No saved position because this is a new
     * card selection.
     */
    stageVideoTimes.delete(nextVideo);

    /*
     * Play new video.
     *
     * restorePosition = false because this is
     * a deliberate card change.
     */
    playStageVideo(nextVideo, false);

    /* Center card */

    centerStageCard(index);

    stageIsSwitching = false;
  };

  /* -----------------------------------------------------
       Video already ready
       ----------------------------------------------------- */

  if (nextVideo.readyState >= 3) {
    switchNow();
    return;
  }

  /* -----------------------------------------------------
       Wait until video can play
       ----------------------------------------------------- */

  nextVideo.addEventListener("canplay", switchNow, { once: true });
}

/* =========================================================
   Center Card
   ========================================================= */

function centerStageCard(index) {
  if (!stageCardsTrack || !stageCards[index]) {
    return;
  }

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

/* =========================================================
   Auto Advance
   ========================================================= */

function startStageAuto() {
  if (!stageIsVisible) return;

  if (stageAutoTimer) return;

  stageAutoTimer = setInterval(() => {
    if (!stageIsVisible) {
      stopStageAuto();
      return;
    }

    const next = (stageCurrentIndex + 1) % stageCards.length;

    goToStageCard(next);
  }, 5000);
}

function stopStageAuto() {
  if (!stageAutoTimer) return;

  clearInterval(stageAutoTimer);

  stageAutoTimer = null;
}

/* =========================================================
   Detect Center Card
   ========================================================= */

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

/* =========================================================
   Manual Card Scroll
   ========================================================= */

stageCardsTrack?.addEventListener(
  "scroll",
  () => {
    if (!stageIsVisible) return;

    if (stageIsScrolling) return;

    clearTimeout(stageScrollEndTimer);

    stageScrollEndTimer = setTimeout(() => {
      stageScrollEndTimer = null;

      const centered = getCardInCenter();

      if (centered === stageCurrentIndex || stageIsSwitching) {
        return;
      }

      const previousIndex = stageCurrentIndex;

      const previousVideo = stageVideos[previousIndex];

      const currentVideo = stageVideos[centered];

      if (!currentVideo) return;

      /* Load only once */

      loadStageVideo(centered);

      /*
       * Stop previous video.
       *
       * Deliberate card change = reset old video.
       */
      if (previousVideo) {
        stopStageVideo(previousVideo);
      }

      /* Card state */

      stageCards[previousIndex]?.classList.remove("is-active");

      stageCards[centered]?.classList.add("is-active");

      /* Dot state */

      stageDots[previousIndex]?.classList.remove("is-active");

      stageDots[centered]?.classList.add("is-active");

      /* Update current */

      stageCurrentIndex = centered;

      /*
       * New selected video starts from 0.
       */
      try {
        currentVideo.currentTime = 0;
      } catch (error) {
        // Ignore browser timing errors.
      }

      stageVideoTimes.delete(currentVideo);

      /*
       * Play without restoring an old position.
       */
      playStageVideo(currentVideo, false);
    }, 150);
  },
  { passive: true }
);

/* =========================================================
   Hover / Touch
   ========================================================= */

stageCardsTrack?.addEventListener("mouseenter", stopStageAuto);

stageCardsTrack?.addEventListener("mouseleave", startStageAuto);

stageCardsTrack?.addEventListener("touchstart", stopStageAuto, { passive: true });

stageCardsTrack?.addEventListener(
  "touchend",
  () => {
    if (stageIsVisible) {
      startStageAuto();
    }
  },
  { passive: true }
);

/* =========================================================
   Pause Stage
   ========================================================= */

function pauseStage() {
  stageIsVisible = false;

  stopStageAuto();

  /*
   * IMPORTANT:
   *
   * We DO NOT:
   *
   * video.load()
   * video.currentTime = 0
   *
   * We only pause and save the current position.
   */

  stageVideos.forEach((video) => {
    if (!video) return;

    saveStageVideoTime(video);

    video.pause();
  });
}

/* =========================================================
   Resume Stage
   ========================================================= */

function resumeStage() {
  if (!stageSection) return;

  stageIsVisible = true;

  const activeVideo = stageVideos[stageCurrentIndex];

  if (activeVideo) {
    /*
     * Restore exact position before playing.
     */
    restoreStageVideoTime(activeVideo);

    activeVideo.classList.add("is-active");

    const playPromise = activeVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  startStageAuto();
}

/* =========================================================
   Intersection Observer
   ========================================================= */

const stageObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      resumeStage();
    } else {
      pauseStage();
    }
  },
  {
    threshold: 0.15
  }
);

if (stageSection) {
  stageObserver.observe(stageSection);
}

/* =========================================================
   Initial Setup
   ========================================================= */

window.addEventListener("load", () => {
  if (!stageCards.length) {
    return;
  }

  const firstVideo = stageVideos[0];

  /* First card */

  stageCards[0]?.classList.add("is-active");

  /* First dot */

  stageDots[0]?.classList.add("is-active");

  /* Load first video ONCE */

  if (firstVideo) {
    loadStageVideo(0);

    firstVideo.classList.add("is-active");
  }

  /*
   * Preload second video ONCE.
   */
  if (stageVideos.length > 1) {
    loadStageVideo(1);
  }

  /* Center first card */

  centerStageCard(0);

  /*
   * IMPORTANT:
   *
   * Do NOT call:
   *
   * firstVideo.play()
   * startStageAuto()
   *
   * here.
   *
   * IntersectionObserver controls them.
   */
});
/* ════════════════════════════════════════════════════════════
   8.TRUST
   ════════════════════════════════════════════════════════════ */

const el = document.querySelector(".trust__text");

if (el && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add("is-visible");
        observer.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  observer.observe(el);
} else if (el) {
  el.classList.add("is-visible");
}
/* ════════════════════════════════════════════════════════════
   9. WORK SECTION — SLIDER (progress bar, arrows, counter, filters)
   ════════════════════════════════════════════════════════════ */
const workSlider = document.getElementById("slider__track");
const workProgress = document.getElementById("work-progress");
const workFilters = document.querySelectorAll(".work__filter");
const workCards = document.querySelectorAll(".slider__card:not(.slider__card--cta)");
const newWebsiteBtn = document.getElementById("startProjectBtn");
const workCurrentEl = document.getElementById("slider-current");
const workTotalEl = document.getElementById("slider-total");

let sliderProgressRaf = null;
let workCardsObserver = null;

/* ── Update progress ── */
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

/* ── Schedule progress update (rAF-throttled) ── */
function requestProgressUpdate() {
  if (sliderProgressRaf !== null) return;
  sliderProgressRaf = requestAnimationFrame(() => {
    updateProgress();
    sliderProgressRaf = null;
  });
}

/* ── Slider scroll (arrow buttons) ── */
function scrollSlider(direction) {
  if (!workSlider) return;
  workSlider.scrollBy({
    left: direction * 220,
    behavior: "smooth"
  });
}
window.scrollSlider = scrollSlider;

workSlider?.addEventListener("scroll", requestProgressUpdate, { passive: true });

/* ── Work counter ("N of total") — respects hidden (filtered) cards ── */
function initWorkCounter() {
  if (!workSlider || !workCards.length) return;

  const cards = Array.from(workCards).filter((card) => !card.classList.contains("hidden"));

  if (workTotalEl) {
    workTotalEl.textContent = cards.length;
  }
  if (workCurrentEl) {
    workCurrentEl.textContent = cards.length ? 1 : 0;
  }

  workCardsObserver?.disconnect();
  workCardsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = cards.indexOf(entry.target);
        if (index === -1) return;
        if (workCurrentEl) {
          workCurrentEl.textContent = index + 1;
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

/* ── Filtering ── */
function applyFilter(filterValue) {
  if (!workCards.length) return;

  workCards.forEach((card) => {
    const matches = filterValue === "all" || card.dataset.category === filterValue;
    card.classList.toggle("hidden", !matches);
  });

  if (workSlider) {
    workSlider.scrollTo({ left: 0, behavior: "auto" });
  }

  initWorkCounter();
  updateProgress();
}

workFilters.forEach((btn) => {
  btn.addEventListener("click", () => {
    workFilters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    applyFilter(btn.dataset.filter);
  });
});

/* ── Initial slider position ── */
window.addEventListener("load", () => {
  if (!workSlider || !workCards.length) return;
  const card = workCards[2];
  if (card) {
    workSlider.scrollLeft = card.offsetLeft - workSlider.offsetWidth / 2 + card.offsetWidth / 2;
  }
  updateProgress();
  initWorkCounter();
});
/* ════════════════════════════════════════════════════════════
   10. WIZARD — "NEW PROJECT" REQUEST MODAL
   ════════════════════════════════════════════════════════════ */
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
/* ════════════════════════════════════════════════════════════
   
   ════════════════════════════════════════════════════════════ */
lucide.createIcons();
