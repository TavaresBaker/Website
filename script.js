/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================
   Mobile Nav (Burger Menu)
   Works across ALL pages
========================= */
(() => {
  const btn = $(".nav-toggle");
  const menu = $("[data-nav]");
  const header = $(".glass-nav");

  if (!btn || !menu) return;

  const openMenu = () => {
    btn.setAttribute("aria-expanded", "true");
    menu.classList.add("open");
    document.body.classList.add("nav-open");
  };

  const closeMenu = () => {
    btn.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    document.body.classList.remove("nav-open");
  };

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  // Close when clicking a link (mobile UX)
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const clickedInside =
      e.target.closest(".glass-nav") || e.target.closest("[data-nav]");
    if (!clickedInside) closeMenu();
  });

  // Close on resize back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) closeMenu();
  });

  // Optional: add a scroll class to the header for styling
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("nav-scrolled", window.scrollY > 20);
    });
  }
})();

/* =========================
   Smooth Scroll (only if target exists)
========================= */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = $(href);
    if (!target) return; // don't break other pages

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =========================
   Scroll Reveal Animations
   Uses your CSS: .reveal + .is-visible
========================= */
(() => {
  const items = $$(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(el => observer.observe(el));
})();

/* =========================
   Parallax Hero Effect (safe)
========================= */
(() => {
  const hero = $(".hero");
  if (!hero) return;

  window.addEventListener("scroll", () => {
    const scroll = window.scrollY || 0;
    hero.style.backgroundPositionY = (scroll * 0.25) + "px";
  });
})();

/* =========================
   Typing Text Effect (safe)
========================= */
(() => {
  const typingTarget = $("#typing-text");
  if (!typingTarget) return;

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
   Avoids messing up transforms on mobile tap
========================= */
(() => {
  const cards = $$(".card");
  if (!cards.length) return;

  const shouldTilt = () => window.matchMedia("(hover: hover)").matches;

  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      if (!shouldTilt()) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / 25);
      const rotateY = ((x - centerX) / 25);

      card.style.transform = `rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* =========================
   Image Lightbox (optional, safe)
   NOTE: If you don't want EVERY image clickable, change selector
========================= */
(() => {
  const imgs = $$("img");
  if (!imgs.length) return;

  imgs.forEach(img => {
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

      const bigImg = document.createElement("img");
      bigImg.src = img.src;
      bigImg.alt = img.alt || "";
      bigImg.style.maxWidth = "90%";
      bigImg.style.maxHeight = "90%";
      bigImg.style.borderRadius = "10px";

      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", () => overlay.remove());
      document.addEventListener("keydown", function esc(e){
        if (e.key === "Escape") {
          overlay.remove();
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
