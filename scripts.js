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

  const shouldTilt = () =>
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const interactiveSel = "input, textarea, select, button, label, a";

  cards.forEach((card) => {
    if (card.querySelector("#contactForm")) return;

    let raf = null;
    let latest = null;

    const apply = () => {
      raf = null;
      if (!latest) return;

      const { x, y, rect } = latest;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 60;
      const rotateY = (x - centerX) / 60;

      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    };

    card.addEventListener("mousemove", (e) => {
      if (!shouldTilt()) return;

      if (e.target && e.target.closest(interactiveSel)) {
        card.style.transform = "";
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      latest = { x, y, rect };

      if (!raf) raf = requestAnimationFrame(apply);
    });

    card.addEventListener("mouseleave", () => {
      latest = null;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
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
   Contact Form Handler
   - Small files: send to Formspree as multipart FormData (original behavior)
   - Large files (up to 500MB): upload to your storage via presigned URLs,
     then send Formspree a submission with file links (NOT the files)
========================= */
(() => {
  const form = $("#contactForm");
  if (!form) return;

  const statusEl = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const submittedAt = $("#submittedAt");
  const fileInput = $("#attachments", form);

  /* ---- Configure this ----
     You must create an endpoint on YOUR domain that returns presigned upload URLs.
     Example: https://bakertsolutions.com/api/upload-url

     Expected response JSON (per file):
     {
       "uploadUrl": "https://... presigned PUT url ...",
       "publicUrl": "https://... file url users can access ...",
       "method": "PUT",
       "headers": { "Content-Type": "..." }
     }

     For multiple files, this script calls it once per file.
  */
  const LARGE_UPLOAD_PRESIGN_ENDPOINT =
    form.getAttribute("data-presign-endpoint") ||
    window.__BTS_PRESIGN_ENDPOINT__ ||
    "";

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

  // Formspree hard limits (cannot be bypassed in JS)
  const FORMSPREE_MAX_PER_FILE = 25 * 1024 * 1024;   // 25MB
  const FORMSPREE_MAX_TOTAL = 100 * 1024 * 1024;     // ~100MB

  // Your desired limits
  const BIG_MAX_PER_FILE = 500 * 1024 * 1024;        // 500MB
  const BIG_MAX_TOTAL = 520 * 1024 * 1024;           // slightly above 500MB to allow a bit of overhead
  const BIG_MAX_FILES = 5;

  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "video/mp4",
    "video/quicktime"
  ]);

  const getFiles = () => {
    if (!fileInput || !fileInput.files) return [];
    return Array.from(fileInput.files || []);
  };

  const needsLargeUploadPath = (files) => {
    if (!files.length) return false;
    let total = 0;
    for (const f of files) {
      total += f.size;
      if (f.size > FORMSPREE_MAX_PER_FILE) return true;
    }
    if (total > FORMSPREE_MAX_TOTAL) return true;
    return false;
  };

  const validateFiles = () => {
    const files = getFiles();
    if (!files.length) return { ok: true, mode: "none" };

    if (files.length > BIG_MAX_FILES) {
      markInvalid(fileInput);
      return { ok: false, field: fileInput, message: `Please upload ${BIG_MAX_FILES} files or fewer.` };
    }

    let total = 0;
    for (const f of files) {
      total += f.size;

      const type = (f.type || "").toLowerCase();
      if (type && !allowed.has(type)) {
        markInvalid(fileInput);
        return {
          ok: false,
          field: fileInput,
          message: "Unsupported file type. Allowed: JPG, PNG, HEIC, PDF, ZIP, MP4, MOV."
        };
      }

      if (f.size > BIG_MAX_PER_FILE) {
        markInvalid(fileInput);
        return { ok: false, field: fileInput, message: "One file is too large. Max 500MB per file." };
      }
    }

    if (total > BIG_MAX_TOTAL) {
      markInvalid(fileInput);
      return { ok: false, field: fileInput, message: "Total upload is too large. Max 500MB total." };
    }

    const mode = needsLargeUploadPath(files) ? "large" : "small";
    return { ok: true, mode, totalBytes: total, files };
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

    // If large mode is needed, require presign endpoint
    if (vf.mode === "large" && !LARGE_UPLOAD_PRESIGN_ENDPOINT) {
      markInvalid(fileInput);
      return {
        ok: false,
        field: fileInput,
        message:
          "Large uploads are enabled, but no presign endpoint is configured. Add data-presign-endpoint to the form or set window.__BTS_PRESIGN_ENDPOINT__."
      };
    }

    return { ok: true, filesMode: vf.mode, files: vf.files || [] };
  };

  const xhrUpload = (uploadUrl, file, extraHeaders = {}, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);

      // Some presigned URLs require content-type to match what was signed.
      // If your backend signs with a specific Content-Type, keep this.
      const headers = {
        "Content-Type": file.type || "application/octet-stream",
        ...extraHeaders
      };

      Object.entries(headers).forEach(([k, v]) => {
        if (v != null && v !== "") xhr.setRequestHeader(k, String(v));
      });

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        if (typeof onProgress === "function") onProgress(evt.loaded, evt.total);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve(true);
        reject(new Error(`Upload failed (${xhr.status})`));
      };

      xhr.onerror = () => reject(new Error("Upload failed (network error)"));
      xhr.send(file);
    });
  };

  const presignForFile = async (file) => {
    const res = await fetch(LARGE_UPLOAD_PRESIGN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size
      })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.uploadUrl || !data.publicUrl) {
      const msg =
        (data && (data.error || data.message)) ||
        "Could not start upload. Check your presign endpoint.";
      throw new Error(msg);
    }

    return {
      uploadUrl: data.uploadUrl,
      publicUrl: data.publicUrl,
      method: data.method || "PUT",
      headers: data.headers || {}
    };
  };

  const uploadLargeFiles = async (files) => {
    const results = [];
    const totalBytes = files.reduce((s, f) => s + f.size, 0);
    let uploadedBytesSoFar = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      showStatus(
        "info",
        `Uploading file ${i + 1} of ${files.length}: ${file.name}`
      );

      const presign = await presignForFile(file);

      if ((presign.method || "PUT").toUpperCase() !== "PUT") {
        throw new Error("Presign endpoint must return a PUT uploadUrl for this client uploader.");
      }

      let lastShownPct = -1;

      await xhrUpload(presign.uploadUrl, file, presign.headers, (loaded, total) => {
        const overall = uploadedBytesSoFar + loaded;
        const pct = Math.floor((overall / totalBytes) * 100);
        if (pct !== lastShownPct) {
          lastShownPct = pct;
          showStatus("info", `Uploading… ${pct}%`);
        }
      });

      uploadedBytesSoFar += file.size;

      results.push({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        url: presign.publicUrl
      });
    }

    return results;
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

    try {
      let uploadedLinks = null;

      // If large uploads are needed, upload to your storage first
      if (v.filesMode === "large" && v.files && v.files.length) {
        uploadedLinks = await uploadLargeFiles(v.files);
        showStatus("info", "Upload complete. Sending your request…");
      } else {
        showStatus("info", "Sending your request…");
      }

      // Build FormData for Formspree
      const formData = new FormData(form);

      // Always attach metadata fields
      formData.append("userAgent", navigator.userAgent);
      formData.append("referrer", document.referrer || "");
      formData.append("url", window.location.href);

      // If we used large upload mode, do NOT send files to Formspree
      if (uploadedLinks) {
        // Remove file field from FormData to avoid Formspree size limits
        // Note: key must match your <input name="attachments" ...>
        formData.delete("attachments");

        // Add the uploaded file links as a JSON string
        formData.append("uploadedFiles", JSON.stringify(uploadedLinks));
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
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
      showStatus(
        "error",
        err?.message ||
          "Network error. Please try again, or contact us directly using the info on this page."
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText || "Send Request";
      }
    }
  });
})();
