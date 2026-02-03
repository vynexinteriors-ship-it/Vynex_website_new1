// ============================================
// VYNEX INTERIORS - MAIN JAVASCRIPT
// Midnight Navy + Copper Editorial Luxury Theme
// ============================================

"use strict";

// ============================================
// MOBILE NAVIGATION TOGGLE
// ============================================

const header = document.querySelector(".header");
const navToggle = document.getElementById("navToggle");

if (navToggle && header) {
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-controls", "nav");

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen.toString());
  });

  // Close nav when clicking outside
  document.addEventListener("click", (e) => {
    if (
      header.classList.contains("nav-open") &&
      !header.contains(e.target)
    ) {
      header.classList.remove("nav-open");
    }
  });

  // Close nav when clicking any navigation link
  const navLinks = document.querySelectorAll(".nav-list a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
    });
  });

  // Close nav on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
    }
  });
}

// ============================================
// ACCORDION FUNCTIONALITY (FAQ)
// ============================================

const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach((btn, index) => {
  const body = btn.nextElementSibling;
  if (body) {
    const bodyId = `accordion-body-${index}`;
    body.id = bodyId;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", bodyId);
  }

  btn.addEventListener("click", () => {
    const body = btn.nextElementSibling;
    const isOpen = btn.classList.contains("active");

    // Close all accordions first
    accordionHeaders.forEach((header) => {
      header.classList.remove("active");
      header.setAttribute("aria-expanded", "false");
      const accordionBody = header.nextElementSibling;
      if (accordionBody) {
        accordionBody.style.maxHeight = null;
      }
    });

    // Re-open the clicked accordion if it was closed
    if (!isOpen && body) {
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
      body.style.maxHeight = body.scrollHeight + "px";
    }
  });
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Skip if it's just "#" or empty
    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    const target = document.querySelector(href);

    if (target) {
      e.preventDefault();

      // Close mobile nav if open
      if (header && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
      }

      // Smooth scroll to target
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    }
  });
});

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = "info") {
  // Remove existing notification if any
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;



  // Add animation styles
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Append to body
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// ============================================
// DEBOUNCE UTILITY FUNCTION
// ============================================

function debounce(func, wait = 10, immediate = false) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

// ============================================
// FORM SUBMISSION TO GOOGLE SHEETS
// ============================================

// 🔴 REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyevbhQlR589r3BvNXo2fjkMutPMb9v2sJIVKspjzeOVQF8Qm5224yZHeL6JnyA2yjW/exec';

const leadForms = document.querySelectorAll(".lead-form");

leadForms.forEach((form) => {
  // Add ARIA labels for accessibility
  const nameInput = form.querySelector('input[name="name"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const cityInput = form.querySelector('input[name="city"]');

  if (nameInput) nameInput.setAttribute("aria-label", "Full Name");
  if (phoneInput) phoneInput.setAttribute("aria-label", "Phone Number");
  if (cityInput) cityInput.setAttribute("aria-label", "City");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const phone = formData.get("phone").replace(/\D/g, "");
    const city = formData.get("city").trim();

    // Validation
    if (!name || name.length < 2) {
      showNotification("Please enter a valid name", "error");
      return;
    }

    if (phone.length < 10 || phone.length > 15 || !/^\d+$/.test(phone)) {
      showNotification("Please enter a valid phone number (10-15 digits)", "error");
      return;
    }

    if (!city || city.length < 2) {
      showNotification("Please enter a valid city name", "error");
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // Prepare data for submission
    const submissionData = {
      name: name,
      phone: phone,
      city: city,
      source: 'Website Form'
    };

    try {
      // Send data to Google Sheets via Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      // Since mode is 'no-cors', we can't read the response directly
      // Assume success if no error thrown
      showNotification(
        `Thank you, ${name}! We'll contact you shortly at ${phone} regarding your ${city} project.`,
        "success"
      );
      form.reset();

    } catch (error) {
      console.error('Form submission error:', error);
      showNotification("There was an error submitting your form. Please try again.", "error");
    } finally {
      // Restore button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================

let lastScrollTop = 0;
const scrollThreshold = 50;

window.addEventListener(
  "scroll",
  debounce(() => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > scrollThreshold) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }, 10)
);

if (!document.querySelector("#header-scroll-styles")) {
  const style = document.createElement("style");
  style.id = "header-scroll-styles";
  style.textContent = `
    .header.scrolled {
      box-shadow: 0 4px 24px rgba(10, 14, 20, 0.1);
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// INTERSECTION OBSERVER (FADE IN ON SCROLL)
// ============================================

const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -80px 0px",
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up");
      fadeInObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

const animateElements = document.querySelectorAll(
  ".showcase-card, .card, .process-steps li, .service-item, .trust-item, .city-item, .blog-card"
);

animateElements.forEach((el) => {
  fadeInObserver.observe(el);
});

// ============================================
// LAZY LOAD BACKGROUND IMAGES
// ============================================

if ("IntersectionObserver" in window) {
  const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;

        if (lazyImage.dataset.bg) {
          lazyImage.style.backgroundImage = `url(${lazyImage.dataset.bg})`;
          lazyImage.classList.add("loaded");
          lazyImageObserver.unobserve(lazyImage);
        }
      }
    });
  });

  const lazyBackgrounds = document.querySelectorAll("[data-bg]");
  lazyBackgrounds.forEach((bg) => lazyImageObserver.observe(bg));
}

// ============================================
// CTA BUTTON CLICK HANDLERS
// ============================================

const estimateButtons = document.querySelectorAll(
  '.btn-copper:not([type="submit"]), .btn-copper-primary'
);

estimateButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (btn.getAttribute("type") !== "submit") {
      e.preventDefault();
      const heroForm = document.querySelector(".hero-form-card");
      if (heroForm) {
        heroForm.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
          const firstInput = heroForm.querySelector("input");
          if (firstInput) firstInput.focus();
        }, 800);
      }
    }
  });
});

// ============================================
// REFERRAL BUTTON HANDLER
// ============================================

const referralButtons = document.querySelectorAll(
  '.referral button, a[href*="refer"]'
);

referralButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    showNotification(
      "Referral program coming soon! Stay tuned for exclusive rewards.",
      "info"
    );
  });
});

// ============================================
// FORM INPUT ENHANCEMENTS
// ============================================

const phoneInputs = document.querySelectorAll('input[type="tel"]');

phoneInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    if (value.length > 5) {
      value = value.slice(0, 5) + " " + value.slice(5);
    }

    e.target.value = value;
  });

  input.addEventListener("keypress", (e) => {
    if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") {
      e.preventDefault();
    }
  });
});

const nameInputs = document.querySelectorAll('input[name="name"]');

nameInputs.forEach((input) => {
  input.addEventListener("blur", (e) => {
    const value = e.target.value.trim();
    if (value) {
      e.target.value = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  });
});

const cityInputs = document.querySelectorAll('input[name="city"]');

cityInputs.forEach((input) => {
  input.addEventListener("blur", (e) => {
    const value = e.target.value.trim();
    if (value) {
      e.target.value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
  });
});

// ============================================
// TRACK SCROLL PROGRESS
// ============================================

function updateScrollProgress() {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;
  const progress = (scrolled / documentHeight) * 100;
  return progress;
}

window.addEventListener("scroll", debounce(updateScrollProgress, 50));

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

const skipLink = document.createElement("a");
skipLink.href = "#hero";
skipLink.className = "skip-link";
skipLink.textContent = "Skip to main content";
skipLink.style.cssText = `
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--vynex-copper);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  transition: top 0.2s;
`;

skipLink.addEventListener("focus", () => {
  skipLink.style.top = "0";
});

skipLink.addEventListener("blur", () => {
  skipLink.style.top = "-40px";
});

document.body.prepend(skipLink);

// ============================================
// TRACK USER INTERACTIONS (ANALYTICS)
// ============================================

function trackEvent(category, action, label) {
  console.log(`Event Tracked: ${category} - ${action} - ${label}`);
  
  // Example Google Analytics 4
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', action, {
  //     'event_category': category,
  //     'event_label': label
  //   });
  // }
}

document.querySelectorAll(".btn-copper, .btn-copper-primary").forEach((btn) => {
  btn.addEventListener("click", () => {
    const buttonText = btn.textContent.trim();
    trackEvent("CTA", "click", buttonText);
  });
});

document.querySelectorAll(".nav-list a").forEach((link) => {
  link.addEventListener("click", () => {
    const linkText = link.textContent.trim();
    trackEvent("Navigation", "click", linkText);
  });
});

// ============================================
// DETECT USER PREFERENCES
// ============================================

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  document.documentElement.style.setProperty("--transition-fast", "0s");
  document.documentElement.style.setProperty("--transition-med", "0s");
  console.log("Reduced motion detected - animations disabled");
}

// ============================================
// ERROR BOUNDARY (GLOBAL ERROR HANDLER)
// ============================================

window.addEventListener("error", (e) => {
  console.error("Global error caught:", e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});

// ============================================
// VIEWPORT HEIGHT FIX (FOR MOBILE)
// ============================================

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setViewportHeight();
window.addEventListener("resize", debounce(setViewportHeight, 100));

// ============================================
// PREVENT FORM RESUBMISSION ON REFRESH
// ============================================

if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("%c✓ Vynex website loaded successfully", "color: #10b981; font-weight: 600;");

  document.body.classList.add("loaded");

  const yearElement = document.querySelector(".current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  initializeAnimations();
  initEstimateCarousel();   // <- add this line

  const sections = document.querySelectorAll("section");
  console.log(`%c${sections.length} sections initialized`, "color: #6B6B6B;");
});

// ============================================
// INITIALIZE ANIMATIONS
// ============================================

function initializeAnimations() {
  const showcaseCards = document.querySelectorAll(".showcase-card");
  showcaseCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  const serviceItems = document.querySelectorAll(".service-item");
  serviceItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.05}s`;
  });

  const trustItems = document.querySelectorAll(".trust-item");
  trustItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.15}s`;
  });
}

// ============================================
// ESTIMATE SCROLLER CAROUSEL
// ============================================

function initEstimateCarousel() {
  const scroller = document.querySelector('.estimate-scroller');
  const prevBtn = document.querySelector('.scroll-btn.prev');
  const nextBtn = document.querySelector('.scroll-btn.next');

  if (!scroller) return;

  const cardWidth = 320; // must match CSS
  const gap = 24;        // 1.5rem ≈ 24px
  const scrollAmount = cardWidth + gap;

  function scroll(direction) {
    scroller.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scroll(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scroll(1));
}

// ============================================
// EASTER EGG (KONAMI CODE)
// ============================================

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiIndex = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateEasterEgg();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function activateEasterEgg() {
  console.log("%c🎉 KONAMI CODE ACTIVATED!", "font-size: 24px; color: #B87350;");
  showNotification("🎉 You found the secret! Enjoy 10% off your consultation!", "success");
}

// ============================================
// CONSOLE BRANDING
// ============================================

console.log(
  "%cVynex Interiors",
  "color: #B87350; font-size: 28px; font-weight: bold; font-family: 'Playfair Display', serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);"
);
console.log(
  "%cLuxury Home Interiors • Midnight Navy + Copper Edition",
  "color: #1B2838; font-size: 13px; font-weight: 600;"
);
console.log(
  "%cBuilt with precision and care",
  "color: #6B6B6B; font-size: 11px; font-style: italic;"
);

// ============================================
// PERFORMANCE MONITORING
// ============================================

if ("performance" in window) {
  window.addEventListener("load", () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

    console.log(
      `%cPage Load Time: ${pageLoadTime}ms`,
      "color: #10b981; font-weight: 600;"
    );

    if (pageLoadTime > 3000) {
      console.warn("Page load time is above 3 seconds. Consider optimization.");
    }
  });
}

// ============================================
// END OF MAIN.JS
// ============================================

console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #B87350;");
console.log("%cVynex Interiors • All systems operational", "color: #10b981; font-weight: 600;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #B87350;");

