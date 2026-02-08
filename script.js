/* =========================
   Smooth Scroll
========================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});


/* =========================
   Scroll Fade-In Animations
========================= */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));


/* =========================
   Navbar Blur on Scroll (Apple style)
========================= */
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("nav-scrolled");
  } else {
    nav.classList.remove("nav-scrolled");
  }
});


/* =========================
   Parallax Hero Effect
========================= */
const hero = document.querySelector(".hero");
window.addEventListener("scroll", () => {
  let scroll = window.scrollY;
  hero.style.backgroundPositionY = scroll * 0.4 + "px";
});


/* =========================
   Typing Text Effect
========================= */
const text = "Secure. Reliable. Professional Technology Solutions.";
let index = 0;
const typingTarget = document.getElementById("typing-text");

function typeEffect() {
  if (typingTarget && index < text.length) {
    typingTarget.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeEffect, 40);
  }
}
typeEffect();


/* =========================
   Dark Mode Toggle
========================= */
const toggle = document.getElementById("darkToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
}


/* =========================
   Apple-style Hover Tilt Cards
========================= */
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / 20).toFixed(2);
    const rotateY = ((x - centerX) / 20).toFixed(2);

    card.style.transform = `rotateX(${ -rotateX }deg) rotateY(${ rotateY }deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
});


/* =========================
   Image Lightbox (Click Expand)
========================= */
document.querySelectorAll("img").forEach(img => {
  img.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.9)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 9999;

    const bigImg = document.createElement("img");
    bigImg.src = img.src;
    bigImg.style.maxWidth = "90%";
    bigImg.style.maxHeight = "90%";
    bigImg.style.borderRadius = "10px";

    overlay.appendChild(bigImg);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => overlay.remove());
  });
});


/* =========================
   Loading Screen (Fake Apple polish)
========================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("hide");
    }
  })
