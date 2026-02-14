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
   ✅ Android-safe nav height sync
   - Fixes mobile overlay issues where Android Chrome renders header
     slightly different than iOS (or the URL bar changes viewport).
   - Keeps CSS variable --nav-h accurate everywhere.
========================= */
(() => {
  const header = $(".glass-nav");
  if (!header) return;

  const setNavHeight = () => {
    const h = Math.round(header.getBoundingClientRect().height || 72);
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
  };

  setNavHeight();

  // Resize/orientation change
  window.addEventListener("resize", setNavHeight, { passive: true });
  window.addEventListener("orientationchange", setNavHeight, { passive: true });

  // Fonts can load after initial paint and change header height
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setNavHeight).catch(() => {});
  }
})();

/* =========================
   ✅ Android viewport unit fix (100vh/dvh quirks)
   - Sets a --vh var (1% of viewport height) for CSS fallbacks if needed.
   - Not required for iOS, but helps Android "overlay not covering page".
   - Safe to keep even if you don’t use var(--vh) in CSS yet.
========================= */
(() => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setVh();
  window.addEventListener("resize", setVh, { passive: true });
  window.addEventListener("orientationchange", setVh, { passive: true });
})();

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
   - ✅ Extra: forces menu to be on top on Android via inline z-index
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

  // ✅ Force nav overlay above everything (Android sometimes loses stacking context)
  // (CSS should also set this, but inline makes it bulletproof.)
  menu.style.zIndex = menu.style.zIndex || "5000";

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
   - DISABLED for the contact form card so the form is usable
   - Also won't tilt while you're interacting with inputs/buttons
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
   - Small files: send to Formspree as multipart FormData
   - Large files: upload via presigned URLs, then submit links to Formspree
   - No file-count cap + removable file list UI
   - Accepts image/* and falls back to extension if MIME is missing/weird
========================= */
(() => {
  const form = $("#contactForm");
  if (!form) return;

  const statusEl = $("#formStatus");
  const submitBtn = $("#submitBtn");
  const submittedAt = $("#submittedAt");
  const fileInput = $("#attachments", form);

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

  const FORMSPREE_MAX_PER_FILE = 25 * 1024 * 1024; // 25MB
  const FORMSPREE_MAX_TOTAL   = 100 * 1024 * 1024; // ~100MB

  const BIG_MAX_PER_FILE = 500 * 1024 * 1024;      // 500MB per file
  const BIG_MAX_TOTAL    = 2 * 1024 * 1024 * 1024; // 2GB total

  /* -------------------------
     File list UI + removal
  ------------------------- */
  let selectedFiles = [];

  const ensureFileUI = () => {
    if (!fileInput) return null;

    let wrap = $("#fileListWrap", form);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "fileListWrap";
      wrap.style.marginTop = "10px";

      const list = document.createElement("div");
      list.id = "fileList";
      list.style.display = "grid";
      list.style.gap = "8px";

      wrap.appendChild(list);
      fileInput.insertAdjacentElement("afterend", wrap);
    }
    return wrap;
  };

  const formatBytes = (bytes) => {
    const kb = 1024, mb = kb * 1024, gb = mb * 1024;
    if (bytes >= gb) return (bytes / gb).toFixed(2) + " GB";
    if (bytes >= mb) return (bytes / mb).toFixed(1) + " MB";
    if (bytes >= kb) return (bytes / kb).toFixed(1) + " KB";
    return bytes + " B";
  };

  const fileKey = (f) => `${f.name}__${f.size}__${f.lastModified}`;

  const syncInputFiles = () => {
    if (!fileInput) return;
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    fileInput.files = dt.files;
  };

  const renderFileList = () => {
    if (!fileInput) return;

    const wrap = ensureFileUI();
    if (!wrap) return;

    const list = $("#fileList", wrap);
    if (!list) return;

    list.innerHTML = "";

    if (!selectedFiles.length) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.fontSize = "13px";
      empty.textContent = "No files selected.";
      list.appendChild(empty);
      return;
    }

    const total = selectedFiles.reduce((s, f) => s + f.size, 0);

    const summary = document.createElement("div");
    summary.className = "muted";
    summary.style.fontSize = "13px";
    summary.textContent = `${selectedFiles.length} file(s) selected • ${formatBytes(total)} total`;
    list.appendChild(summary);

    selectedFiles.forEach((f, idx) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "1fr auto";
      row.style.alignItems = "center";
      row.style.gap = "10px";
      row.style.padding = "10px 12px";
      row.style.borderRadius = "14px";
      row.style.border = "1px solid rgba(255,255,255,0.12)";
      row.style.background = "rgba(255,255,255,0.04)";

      const left = document.createElement("div");
      left.style.minWidth = "0";

      const name = document.createElement("div");
      name.style.fontWeight = "750";
      name.style.fontSize = "13px";
      name.style.whiteSpace = "nowrap";
      name.style.overflow = "hidden";
      name.style.textOverflow = "ellipsis";
      name.textContent = f.name;

      const meta = document.createElement("div");
      meta.className = "muted";
      meta.style.fontSize = "12px";
      meta.textContent = `${formatBytes(f.size)} • ${f.type || "unknown type"}`;

      left.appendChild(name);
      left.appendChild(meta);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.style.padding = "10px 12px";
      btn.style.borderRadius = "14px";
      btn.textContent = "Remove";
      btn.addEventListener("click", () => {
        selectedFiles.splice(idx, 1);
        syncInputFiles();
        renderFileList();
      });

      row.appendChild(left);
      row.appendChild(btn);
      list.appendChild(row);
    });
  };

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const incoming = Array.from(fileInput.files || []);
      if (!incoming.length) {
        syncInputFiles();
        renderFileList();
        return;
      }

      const existing = new Set(selectedFiles.map(fileKey));
      for (const f of incoming) {
        const k = fileKey(f);
        if (!existing.has(k)) {
          selectedFiles.push(f);
          existing.add(k);
        }
      }

      syncInputFiles();
      renderFileList();
    });

    ensureFileUI();
    renderFileList();
  }

  /* -------------------------
     File type acceptance
  ------------------------- */
  const ext = (name) => {
    const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : "";
  };

  const allowedExt = new Set([
    "png","jpg","jpeg","gif","webp","bmp","tif","tiff","heic","heif","svg",
    "pdf","zip","rar","7z",
    "mp4","mov","m4v","avi","mkv"
  ]);

  const isAllowedFile = (f) => {
    const type = String(f.type || "").toLowerCase().trim();
    const e = ext(f.name);

    if (type.startsWith("image/")) return true;

    if (type === "application/pdf") return true;
    if (type === "application/zip" || type === "application/x-zip-compressed") return true;
    if (type.startsWith("video/")) return true;

    if (!type || type === "application/octet-stream" || type === "binary/octet-stream") {
      return allowedExt.has(e);
    }

    return allowedExt.has(e);
  };

  const getFiles = () => {
    if (!fileInput) return [];
    return selectedFiles.length ? selectedFiles.slice() : Array.from(fileInput.files || []);
  };

  const needsLargeUploadPath = (files) => {
    if (!files.length) return false;
    let total = 0;
    for (const f of files) {
      total += f.size;
      if (f.size > FORMSPREE_MAX_PER_FILE) return true;
    }
    return total > FORMSPREE_MAX_TOTAL;
  };

  const validateFiles = () => {
    const files = getFiles();
    if (!files.length) return { ok: true, mode: "none", files: [] };

    let total = 0;
    for (const f of files) {
      total += f.size;

      if (!isAllowedFile(f)) {
        markInvalid(fileInput);
        return {
          ok: false,
          field: fileInput,
          message: `File not permitted: ${f.name}. Try PNG/JPG/PDF/ZIP/MP4 or a common format.`
        };
      }

      if (f.size > BIG_MAX_PER_FILE) {
        markInvalid(fileInput);
        return { ok: false, field: fileInput, message: `One file is too large: ${f.name}. Max 500MB per file.` };
      }
    }

    if (total > BIG_MAX_TOTAL) {
      markInvalid(fileInput);
      return { ok: false, field: fileInput, message: "Total upload is too large. Max 2GB total." };
    }

    const mode = needsLargeUploadPath(files) ? "large" : "small";
    return { ok: true, mode, files, totalBytes: total };
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

    if (vf.mode === "large" && vf.files.length && !LARGE_UPLOAD_PRESIGN_ENDPOINT) {
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

  /* -------------------------
     Large upload helpers
  ------------------------- */
  const xhrUpload = (uploadUrl, file, extraHeaders = {}, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);

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

      showStatus("info", `Uploading file ${i + 1} of ${files.length}: ${file.name}`);

      const presign = await presignForFile(file);
      if ((presign.method || "PUT").toUpperCase() !== "PUT") {
        throw new Error("Presign endpoint must return a PUT uploadUrl for this uploader.");
      }

      let lastShownPct = -1;

      await xhrUpload(presign.uploadUrl, file, presign.headers, (loaded) => {
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

  /* -------------------------
     Submit
  ------------------------- */
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

      if (v.filesMode === "large" && v.files && v.files.length) {
        uploadedLinks = await uploadLargeFiles(v.files);
        showStatus("info", "Upload complete. Sending your request…");
      } else {
        showStatus("info", "Sending your request…");
      }

      const formData = new FormData(form);

      formData.append("userAgent", navigator.userAgent);
      formData.append("referrer", document.referrer || "");
      formData.append("url", window.location.href);

      if (uploadedLinks) {
        formData.delete("attachments");
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

      selectedFiles = [];
      syncInputFiles();
      renderFileList();
    } catch (err) {
      showStatus("error", err?.message || "Network error. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldText || "Send Request";
      }
    }
  });
})();
