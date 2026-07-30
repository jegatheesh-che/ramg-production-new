// ================================================
// RAMG PRODUCTION — ULTRA CLEAN DYNAMIC ABOUT RENDERER
// Automatically renders alternating editorial story sections (up to 10)
// ================================================

import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadFirestoreAboutContent();
  initAboutExpanders();
});

async function loadFirestoreAboutContent() {
  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("[About Content] Using default pre-hydrated About content.");
      return;
    }

    const data = docSnap.data();

    // If dynamic sections array exists, render full dynamic story
    if (Array.isArray(data.sections) && data.sections.length > 0) {
      renderDynamicSections(data.sections);
    }

    initAboutExpanders();

    if (typeof window.initScrollReveal === "function") {
      window.initScrollReveal();
    }

  } catch (err) {
    console.warn("[About Content] Notice loading Firestore content:", err);
  }
}

// -----------------------------------------------
// RENDER DYNAMIC SECTIONS (AUTOMATIC ALTERNATING LAYOUTS)
// -----------------------------------------------
function renderDynamicSections(sections) {
  const wrapper = document.querySelector(".about-editorial-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "";

  sections.forEach((sec, idx) => {
    const isHero = idx === 0;
    // Auto-alternate layout: even indices (0, 2, 4...) -> Image Right, odd indices (1, 3, 5...) -> Image Left
    const isReverse = idx % 2 === 0; // split_right (text left, image right)

    const sectionEl = document.createElement("section");

    if (isHero) {
      // Hero section layout
      sectionEl.className = "hero__layout";

      sectionEl.innerHTML = `
        <div class="hero__text-col">
          <p class="hero__eyebrow reveal">${escapeHtml(sec.eyebrow || 'About Me')}</p>
          <div class="hero__title-wrap">
            <h1 class="hero__title">${escapeHtml(sec.title || 'Every story deserves to be remembered.')}</h1>
          </div>
          
          <div class="hero__desc reveal reveal-delay-2">
            ${formatParagraphs(sec.desc || '')}
          </div>
          
          <a href="contact.html" class="hero__cta reveal reveal-delay-3" style="margin-top: 24px; display: inline-block;">Let's Tell Your Story &rarr;</a>
        </div>
        
        <div class="hero__image-col reveal">
          <div class="hero__image-wrapper">
            <img src="${validImg(sec.imageUrl)}" alt="${escapeHtml(sec.title || 'About RamG Production')}" class="hero__image" fetchpriority="high" />
          </div>
        </div>
      `;

    } else {
      // Alternating Editorial Split section
      sectionEl.className = `editorial-split-section ${isReverse ? 'reverse' : ''} reveal`;

      const textColHtml = `
        <div class="editorial-text-col">
          <p class="hero__eyebrow">${escapeHtml(sec.eyebrow || '')}</p>
          <h2>${escapeHtml(sec.title || '')}</h2>
          ${formatParagraphs(sec.desc || '')}
        </div>
      `;

      const imgColHtml = `
        <div class="editorial-image-wrapper">
          <img src="${validImg(sec.imageUrl)}" alt="${escapeHtml(sec.title || 'RamG Production')}" loading="lazy" />
        </div>
      `;

      if (isReverse) {
        sectionEl.innerHTML = textColHtml + imgColHtml;
      } else {
        sectionEl.innerHTML = imgColHtml + textColHtml;
      }
    }

    wrapper.appendChild(sectionEl);
  });
}

// Format newline paragraphs cleanly
function formatParagraphs(text) {
  if (!text) return "";
  const parts = text.split("\n\n").filter(p => p.trim().length > 0);
  return parts.map(p => `<p style="margin-bottom: 16px; line-height: 1.6;">${escapeHtml(p.trim())}</p>`).join("");
}

// Validate and return a safe image URL (no broken leading-slash relative paths)
function validImg(url) {
  if (!url || url.trim() === '' || url.trim() === '/') {
    return 'assets/images/ramg-prods.png';
  }
  return url;
}

// Escape HTML special chars safely
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// -----------------------------------------------
// EXPANDER INTERACTIVITY (SAFEGUARD)
// -----------------------------------------------
function initAboutExpanders() {
  const expandBtns = document.querySelectorAll(".about-expand-btn");
  expandBtns.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    if (btn.parentNode) btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      const box = newBtn.closest(".about-expandable-box");
      if (!box) return;

      const isExpanded = box.classList.contains("is-open");
      if (isExpanded) {
        box.classList.remove("is-open");
        newBtn.textContent = "Read Full Story +";
      } else {
        box.classList.add("is-open");
        newBtn.textContent = "Read Less -";
      }

      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(() => ScrollTrigger.refresh(), 400);
      }
    });
  });
}
