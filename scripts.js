/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================
   Mark JS as enabled (for reveal CSS)
========================= */
document.documentElement.classList.add("js");

/* =========================
   Mobile Nav (FULL SCREEN Overlay)
   Works across ALL pages
   - Supports menu markup as either:
     1) <nav class="nav-links" data-nav>...</nav>
     2) <nav class="nav-links">...</nav>
     3) any element with [data-nav]
   - Uses CSS: .open + body.nav-open
   - Close on link click, outside click, ESC, orientation/resize to desktop
   - Prevents "half-screen" issues by always toggling the correct menu element
========================= */
(() => {
  const btn = $(".nav-toggle");
  const header = $(".glass-nav");

  const menu =
    $("[data-nav]") ||
    $(".nav-links");

  if (!btn || !menu) return;

  if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");

  if (!menu.id) menu.id = "site-nav";
  btn.setAttribute("aria-controls", menu.id);

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;

  let lastFocusedEl = null;

  const isOpen = () => btn.getAttribute("aria-expanded") === "true";

  const lockScroll = () => document.body.classList.add("nav-open");
  const unlockScroll = () => document.body.classList.remove("nav-open");

  const openMenu = () => {
    if (isDesktop()) return;

    lastFocusedEl = document.activeElement;
    btn.setAttribute("aria-expanded", "true");
    menu.classList.add("open");
    lockScroll();

    const first = $(focusableSelector, menu);
    if (first) first.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    btn.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    unlockScroll();

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus({ preventScroll: true });
    } else {
      btn.focus({ preventScroll: true });
    }
  };

  const toggleMenu = () => (isOpen() ? closeMenu() : openMenu());

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!isOpen()) return;

    const clickedInsideMenu =
      e.target.closest("#" + CSS.escape(menu.id)) ||
      e.target.closest("[data-nav]") ||
      e.target.closest(".nav-links");

    const clickedToggle = e.target.closest(".nav-toggle");

    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === "Tab") {
      const focusables = $$(focusableSelector, menu).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const handleViewportChange = () => {
    if (isDesktop() && isOpen()) closeMenu();
  };
  window.addEventListener("resize", handleViewportChange, { passive: true });
  window.addEventListener("orientationchange", handleViewportChange, { passive: true });

  if (header) {
    window.addEventListener(
      "scroll",
      () => header.classList.toggle("nav-scrolled", window.scrollY > 20),
      { passive: true }
    );
  }
})();

/* =========================
   Smooth Scroll (only if target exists)
========================= */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = $(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =========================
   Scroll Reveal Animations
========================= */
(() => {
  const items = $$(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
})();

/* =========================
   Parallax Hero Effect (safe)
========================= */
(() => {
  const hero = $(".hero");
  if (!hero) return;

  window.addEventListener(
    "scroll",
    () => {
      const scroll = window.scrollY || 0;
      hero.style.backgroundPositionY = scroll * 0.25 + "px";
    },
    { passive: true }
  );
})();

/* =========================
   Typing Text Effect (safe)
========================= */
(() => {
  const typingTarget = $("#typing-text");
  if (!typingTarget) return;

  if (typingTarget.dataset.typed === "true") return;
  typingTarget.dataset.typed = "true";

  const text = "Secure. Reliable. Professional Technology Solutions.";
  let i = 0;

  const tick = () => {
    if (i < text.length) {
      typingTarget.textContent += text.charAt(i);
      i++;
      setTimeout(tick, 40);
    }
  };
  tick();
})();

/* =========================
   Dark Mode Toggle (safe)
========================= */
(() => {
  const toggle = $("#darkToggle");
  const saved = localStorage.getItem("darkMode");

  if (saved === "true") document.body.classList.add("dark");

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });
})();

/* =========================
   Card Hover Tilt (desktop only-ish)
========================= */
(() => {
  const cards = $$(".card");
  if (!cards.length) return;

  const shouldTilt = () => window.matchMedia("(hover: hover)").matches;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (!shouldTilt()) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 25;
      const rotateY = (x - centerX) / 25;

      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* =========================
   Image Lightbox (safe)
========================= */
(() => {
  const imgs = $$('img[data-lightbox]');
  if (!imgs.length) return;

  imgs.forEach((img) => {
    img.style.cursor = "zoom-in";

    img.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0,0,0,0.9)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "9999";
      overlay.style.padding = "24px";

      const bigImg = document.createElement("img");
      bigImg.src = img.src;
      bigImg.alt = img.alt || "";
      bigImg.style.maxWidth = "92%";
      bigImg.style.maxHeight = "92%";
      bigImg.style.borderRadius = "12px";
      bigImg.style.boxShadow = "0 20px 60px rgba(0,0,0,0.55)";

      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);

      const close = () => overlay.remove();

      overlay.addEventListener("click", close);

      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", esc);
        }
      });
    });
  });
})();

/* =========================
   Loading Screen (safe)
========================= */
window.addEventListener("load", () => {
  const loader = $("#loader");
  if (!loader) return;
  loader.classList.add("hide");
});

/* =========================
   Contact Form Handler (Formspree + file uploads)
   - Sends multipart FormData so attachments work
   - Keeps your validation + UI behavior
========================= */
(() => {
  const form = $("#contactForm");
  if (!form) return;

  const statusEl = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const submittedAt = $("#submittedAt");
  const fileInput = $("#attachments", form);

  const showStatus = (type, msg) => {
    if (!statusEl) return;
    statusEl.className = "alert " + type;
    statusEl.textContent = msg;
    statusEl.style.display = "block";
  };

  const clearInvalid = () => {
    $$(".field", form).forEach((f) => f.setAttribute("aria-invalid", "false"));
  };

  const markInvalid = (el) => {
    if (!el) return;
    el.setAttribute("aria-invalid", "true");
  };

  const validateFiles = () => {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return { ok: true };
    }

    const files = Array.from(fileInput.files);
    const allowed = new Set([
      "image/jpeg",
      "image/png",
      "image/heic",
      "image/heif"
    ]);

    // Soft limits (match Formspree typical constraints)
    const maxFiles = 10;
    const maxPerFile = 25 * 1024 * 1024;  // 25MB
    const maxTotal = 100 * 1024 * 1024;   // 100MB

    if (files.length > maxFiles) {
      markInvalid(fileInput);
      return { ok: false, field: fileInput, message: `Please upload ${maxFiles} photos or fewer.` };
    }

    let total = 0;
    for (const f of files) {
      total += f.size;

      if (!allowed.has((f.type || "").toLowerCase())) {
        markInvalid(fileInput);
        return { ok: false, field: fileInput, message: "Only image files are allowed (JPG, PNG, HEIC)." };
      }

      if (f.size > maxPerFile) {
        markInvalid(fileInput);
        return { ok: false, field: fileInput, message: "One of your images is too large. Max 25MB per file." };
      }
    }

    if (total > maxTotal) {
      markInvalid(fileInput);
      return { ok: false, field: fileInput, message: "Total upload is too large. Max 100MB total." };
    }

    return { ok: true };
  };

  const validate = () => {
    clearInvalid();

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== "") {
      return { ok: false, silent: true };
    }

    const required = [
      "name",
      "email",
      "phone",
      "preferredContact",
      "category",
      "urgency",
      "bestTime",
      "message",
      "noSecrets"
    ];

    for (const name of required) {
      const el = form.elements[name];
      if (!el) continue;

      if (el.type === "checkbox") {
        if (!el.checked) {
          markInvalid(el);
          return {
            ok: false,
            field: el,
            message: "Please confirm you won’t include passwords or sensitive info."
          };
        }
        continue;
      }

      if (!el.checkValidity()) {
        markInvalid(el);
        return {
          ok: false,
          field: el,
          message: el.validationMessage || "Please fill out this field."
        };
      }
    }

    const phone = (form.elements.phone?.value || "").trim();
    if (phone.length < 7) {
      const el = form.elements.phone;
      markInvalid(el);
      return { ok: false, field: el, message: "Please enter a valid phone number." };
    }

    const vf = validateFiles();
    if (!vf.ok) return vf;

    return { ok: true };
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submittedAt) submittedAt.value = new Date().toISOString();

    const v = validate();
    if (!v.ok) {
      if (!v.silent) showStatus("error", v.message || "Please fix the highlighted fields.");
      if (v.field && typeof v.field.focus === "function") v.field.focus();
      return;
    }

    const endpoint = form.getAttribute("action") || "";
    if (!endpoint || endpoint.includes("YOUR_DOMAIN_HERE")) {
      showStatus("error", "Set your Formspree endpoint in the form action (example: https://formspree.io/f/xxxxxx).");
      return;
    }

    const oldText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    showStatus("info", "Sending your request…");

    try {
      // IMPORTANT: FormData is required for file uploads
      const formData = new FormData(form);

      // add extra metadata (without breaking files)
      formData.append("userAgent", navigator.userAgent);
      formData.append("referrer", document.referrer || "");
      formData.append("url", window.location.href);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && data.errors && data.errors[0] && data.errors[0].message) ||
          (data && (data.error || data.message)) ||
          "Something went wrong. Please try again.";
        showStatus("error", msg);
        return;
      }

      showStatus("success", "Request sent! We’ll reach out soon.");
      form.reset();
      clearInvalid();
    } catch (err) {
      showStatus("error", "Network error. Please try again, or contact us directly using the info on this page.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText || "Send Request";
      }
    }
  });
})();
