/* ──────────────────────────────────────────────────────────
   7. WORK — SLIDER, FILTERS & PROGRESS BAR
   ────────────────────────────────────────────────────────── */
let selectedType = "";

function updateProgress() {
  const max = workSlider.scrollWidth - workSlider.clientWidth;
  workProgress.style.width = (max > 0 ? (workSlider.scrollLeft / max) * 100 : 0) + "%";
}
function scrollSlider(direction) {
  workSlider.scrollBy({ left: direction * 220, behavior: "smooth" });
}
window.scrollSlider = scrollSlider;
const slider = document.getElementById("slider__track");
const dotsContainer = document.getElementById("slider__dots");

/* ──────────────────────────────────────────────────────────
   SLIDER PROGRESS
   ────────────────────────────────────────────────────────── */

function updateProgress() {
  if (!slider) return;

  const max = slider.scrollWidth - slider.clientWidth;

  if (workProgress) {
    workProgress.style.width = (max > 0 ? (slider.scrollLeft / max) * 100 : 0) + "%";
  }
}

/* ──────────────────────────────────────────────────────────
   SLIDER SCROLL
   ────────────────────────────────────────────────────────── */

function scrollSlider(direction) {
  if (!slider) return;

  slider.scrollBy({
    left: direction * 220,
    behavior: "smooth"
  });
}

window.scrollSlider = scrollSlider;

slider?.addEventListener("scroll", updateProgress);

/* ──────────────────────────────────────────────────────────
   INITIAL SLIDER POSITION
   ────────────────────────────────────────────────────────── */

window.addEventListener("load", () => {
  if (!slider) return;

  const cards = slider.querySelectorAll(".slider__card:not(.slider__card--cta)");

  if (!cards.length) return;

  const card = cards[2];

  if (card) {
    slider.scrollLeft = card.offsetLeft - slider.offsetWidth / 2 + card.offsetWidth / 2;
  }

  updateProgress();
});

/* ──────────────────────────────────────────────────────────
   SLIDER DOTS
   ────────────────────────────────────────────────────────── */

function initSliderDots() {
  if (!slider || !dotsContainer) return;

  dotsContainer.innerHTML = "";

  const cards = slider.querySelectorAll(".slider__card:not(.slider__card--cta):not(.hidden)");

  cards.forEach((card, index) => {
    const dot = document.createElement("button");

    dot.type = "button";

    dot.className = "slider__dot";

    dot.setAttribute("aria-label", `Go to project ${index + 1}`);

    if (index === 0) {
      dot.classList.add("is-active");
    }

    dot.addEventListener("click", () => {
      card.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    });

    dotsContainer.appendChild(dot);
  });

  observeSliderCards(cards);
}

/* ──────────────────────────────────────────────────────────
   OBSERVE CARDS
   ────────────────────────────────────────────────────────── */

function observeSliderCards(cards) {
  if (!slider || !dotsContainer) return;

  const dots = dotsContainer.querySelectorAll(".slider__dot");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const index = Array.from(cards).indexOf(entry.target);

        dots.forEach((dot) => {
          dot.classList.remove("is-active");
        });

        if (dots[index]) {
          dots[index].classList.add("is-active");
        }
      });
    },
    {
      root: slider,
      threshold: 0.6
    }
  );

  cards.forEach((card) => {
    observer.observe(card);
  });
}

/* ──────────────────────────────────────────────────────────
   INITIALIZE DOTS
   ────────────────────────────────────────────────────────── */

initSliderDots();
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
   document.querySelectorAll(".wizard__step").forEach((step) => step.classList.remove("active"));
   document.getElementById("step-" + stepNumber).classList.add("active");

   ["dot-1", "dot-2", "dot-3"].forEach((id, i) => {
     document.getElementById(id).classList.toggle("done", i < stepNumber);
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