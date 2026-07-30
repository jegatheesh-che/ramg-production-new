// ================================================
// RAMG PRODUCTION — ULTRA CLEAN APP-LIKE ABOUT STORY BUILDER
// Native app aesthetic, smooth glassmorphism, responsive 1-box story builder
// ================================================

import { auth, db } from "/js/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUD_NAME = "dxbdobdxt";
const UPLOAD_PRESET = "website_gallery";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Max Sections Limit
const MAX_SECTIONS = 10;

// Navigation Tabs
const tabGallery = document.getElementById("tabGallery");
const tabReviews = document.getElementById("tabReviews");
const tabAbout = document.getElementById("tabAbout");
const sectionGallery = document.getElementById("sectionGallery");
const sectionReviews = document.getElementById("sectionReviews");
const sectionAbout = document.getElementById("sectionAbout");

// Form Elements
const aboutForm = document.getElementById("aboutContentForm");
const aboutFormError = document.getElementById("aboutFormError");
const aboutSubmitBtn = document.getElementById("aboutSubmitBtn");
const aboutLoadingState = document.getElementById("adminAboutLoading");
const sectionsContainer = document.getElementById("adminAboutSectionsContainer");
const btnAddSection = document.getElementById("btnAddAboutSection");
const sectionCounter = document.getElementById("adminAboutSectionCounter");

// State: List of About Page Sections (Max 10)
let sectionsList = [];

// Clean Default Initial Sections
const DEFAULT_SECTIONS = [
  {
    id: "sec_hero",
    eyebrow: "About Me",
    title: "Every story deserves to be remembered.",
    desc: "My journey into photography and filmmaking began in 2018, when I discovered that a single photograph could preserve a feeling forever and a single video could bring those emotions back to life. What started as a passion quickly became my purpose.\n\nOver the years, I have honed my artistic vision across Belgium, France, and international luxury destinations, blending documentary realism with high-fashion magazine styling to craft heirloom portraits.",
    imageUrl: "assets/images/r_DSC00241_full.webp"
  },
  {
    id: "sec_philosophy",
    eyebrow: "My Philosophy",
    title: "Genuine Moments — Authentic Emotions",
    desc: "Since then, I have dedicated myself to capturing genuine moments, authentic emotions, and meaningful stories. For me, photography and videography are not just about creating beautiful images—they are about preserving memories that will be treasured for generations.\n\nOne of the things I value most is the connection I build with every client. I believe the best moments happen when people feel comfortable, understood, and truly themselves.\n\nThat's why I take the time to listen, understand your vision, and create an experience that feels natural, relaxed, and enjoyable from beginning to end.",
    imageUrl: "assets/images/excellents/DSC08698-2.webp"
  },
  {
    id: "sec_journey",
    eyebrow: "My Journey",
    title: "Growth & Dedication",
    desc: "Every wedding, event, portrait, and celebration has taught me something new. Each client has helped shape my creative journey, and every experience has made me a better photographer, filmmaker, and storyteller.\n\nMy goal is simple: to create timeless photographs and cinematic films that allow you to relive your most precious moments exactly as they felt.\n\nWhen you choose to work with me, you’re choosing someone who genuinely cares about your story, values your memories, and is committed to capturing them with creativity, passion, and authenticity.",
    imageUrl: "assets/images/excellents/slide4.webp"
  }
];

// Initialize on auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadAboutContent();
  }
});

// Tab Switching Setup
function setupTabs() {
  const tabs = [
    { btn: tabGallery, sec: sectionGallery },
    { btn: tabReviews, sec: sectionReviews },
    { btn: tabAbout, sec: sectionAbout }
  ];

  tabs.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener("click", () => {
        tabs.forEach(t => {
          if (t.btn) t.btn.classList.remove("active");
          if (t.sec) t.sec.style.display = "none";
        });
        item.btn.classList.add("active");
        if (item.sec) item.sec.style.display = "block";
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupTabs);
} else {
  setupTabs();
}

// ================================================
// LOAD ABOUT CONTENT FROM FIRESTORE
// ================================================
async function loadAboutContent() {
  if (!aboutForm) return;

  if (aboutLoadingState) aboutLoadingState.style.display = "block";
  aboutForm.style.display = "none";
  if (aboutFormError) aboutFormError.style.display = "none";

  try {
    const docRef = doc(db, "about", "content");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().sections) && docSnap.data().sections.length > 0) {
      sectionsList = docSnap.data().sections.slice(0, MAX_SECTIONS);
    } else {
      console.log("[Admin About] Using default initial sections...");
      sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
      await setDoc(docRef, { sections: sectionsList, updatedAt: serverTimestamp() });
    }

    renderAboutSections();

    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";

  } catch (err) {
    console.error("[Admin About] Load error:", err);
    sectionsList = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    renderAboutSections();
    if (aboutLoadingState) aboutLoadingState.style.display = "none";
    aboutForm.style.display = "flex";
  }
}

// Update Section Counter & Add Button State
function updateCounter() {
  if (sectionCounter) {
    sectionCounter.textContent = `${sectionsList.length} / ${MAX_SECTIONS} Sections`;
  }
  if (btnAddSection) {
    btnAddSection.disabled = sectionsList.length >= MAX_SECTIONS;
  }
}

// ================================================
// RENDER APP-LIKE SECTION CARDS IN ADMIN PANEL
// ================================================
function renderAboutSections() {
  if (!sectionsContainer) return;
  sectionsContainer.innerHTML = "";

  updateCounter();

  sectionsList.forEach((sec, idx) => {
    const card = document.createElement("div");
    card.className = "about-section-card";
    card.dataset.index = idx;

    const isFirst = idx === 0;
    const isLast = idx === sectionsList.length - 1;

    card.innerHTML = `
      <div class="about-section-card__header">
        <div class="about-section-card__title-group">
          <span class="about-section-card__badge">Section 0${idx + 1}</span>
          <h3 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--clr-white); font-weight: 400;">
            ${escapeHtml(sec.eyebrow || 'Story Section')} ${sec.title ? '&mdash; ' + escapeHtml(sec.title) : ''}
          </h3>
        </div>

        <div class="about-section-card__actions">
          <button type="button" class="btn-icon-action btn-move-up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Move Up">&uarr;</button>
          <button type="button" class="btn-icon-action btn-move-down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Move Down">&darr;</button>
          <button type="button" class="btn-icon-action btn-icon-delete btn-delete-sec" data-index="${idx}" title="Delete Section">&times;</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <div class="form-group">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--clr-gold);">Eyebrow Tagline *</label>
          <input type="text" class="sec-input-eyebrow" value="${escapeHtml(sec.eyebrow || '')}" placeholder="e.g., About Me, My Philosophy" required />
        </div>

        <div class="form-group">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--clr-gold);">Section Heading *</label>
          <input type="text" class="sec-input-title" value="${escapeHtml(sec.title || '')}" placeholder="e.g., Every story deserves to be remembered." required />
        </div>
      </div>

      <div class="form-group">
        <label style="font-size: 0.85rem; font-weight: 600; color: var(--clr-gold);">Section Story Text (Write your narrative here) *</label>
        <textarea class="admin-textarea sec-input-desc" rows="5" placeholder="Write your story section narrative..." required>${escapeHtml(sec.desc || '')}</textarea>
      </div>

      <div class="custom-upload-zone">
        <div style="flex: 1;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--clr-gold); margin-bottom: 8px; display: block;">Section Photo</label>
          <label class="custom-upload-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Upload Photo File</span>
            <input type="file" class="sec-input-file" accept="image/*" style="display: none;" />
          </label>
          <span class="file-name-indicator" style="font-size: 0.8rem; color: var(--clr-muted); margin-left: 12px;">No new file chosen</span>
        </div>

        <div style="text-align: center;">
          <p style="font-size: 0.75rem; color: var(--clr-muted); margin-bottom: 4px;">Photo Preview</p>
          <img class="sec-img-preview" src="${sec.imageUrl || '/assets/images/ramg-prods.png'}" alt="Preview" />
        </div>
      </div>
    `;

    sectionsContainer.appendChild(card);
  });

  attachCardEvents();
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

// Event Listeners for Dynamic Cards
function attachCardEvents() {
  // Move Up
  document.querySelectorAll(".btn-move-up").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx > 0) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx - 1];
        sectionsList[idx - 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Move Down
  document.querySelectorAll(".btn-move-down").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (idx < sectionsList.length - 1) {
        saveCurrentInputValues();
        const temp = sectionsList[idx];
        sectionsList[idx] = sectionsList[idx + 1];
        sectionsList[idx + 1] = temp;
        renderAboutSections();
      }
    });
  });

  // Delete
  document.querySelectorAll(".btn-delete-sec").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (confirm(`Are you sure you want to delete Section ${idx + 1}?`)) {
        saveCurrentInputValues();
        sectionsList.splice(idx, 1);
        renderAboutSections();
      }
    });
  });

  // Instant Image File Preview & File Name Label Update
  document.querySelectorAll(".sec-input-file").forEach(input => {
    input.addEventListener("change", (e) => {
      const card = e.target.closest(".about-section-card");
      if (card && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const preview = card.querySelector(".sec-img-preview");
        const fileNameIndicator = card.querySelector(".file-name-indicator");

        if (preview) {
          preview.src = URL.createObjectURL(file);
        }
        if (fileNameIndicator) {
          fileNameIndicator.textContent = file.name;
          fileNameIndicator.style.color = "var(--clr-gold)";
        }
      }
    });
  });
}

// Sync current input fields into sectionsList array memory before re-ordering/deleting
function saveCurrentInputValues() {
  const cards = document.querySelectorAll(".about-section-card");
  cards.forEach((card, idx) => {
    if (sectionsList[idx]) {
      sectionsList[idx].eyebrow = card.querySelector(".sec-input-eyebrow")?.value.trim() || "";
      sectionsList[idx].title = card.querySelector(".sec-input-title")?.value.trim() || "";
      sectionsList[idx].desc = card.querySelector(".sec-input-desc")?.value.trim() || "";
    }
  });
}

// Add New Section Handler (Max 10)
if (btnAddSection) {
  btnAddSection.addEventListener("click", () => {
    if (sectionsList.length >= MAX_SECTIONS) {
      alert("Maximum limit of 10 sections reached.");
      return;
    }
    saveCurrentInputValues();
    const newIdx = sectionsList.length + 1;
    sectionsList.push({
      id: `sec_${Date.now()}`,
      eyebrow: `Story Section 0${newIdx}`,
      title: "New Section Heading",
      desc: "Write your section story narrative here...",
      imageUrl: "assets/images/excellents/slide5.webp"
    });
    renderAboutSections();
  });
}

// Upload helper for Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary.");
  }

  const data = await res.json();
  return data.secure_url;
}

// ================================================
// SAVE ALL ABOUT SECTIONS TO FIRESTORE
// ================================================
if (aboutForm) {
  aboutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (aboutFormError) aboutFormError.style.display = "none";
    if (aboutSubmitBtn) {
      aboutSubmitBtn.disabled = true;
      aboutSubmitBtn.textContent = "Saving All Sections...";
    }

    try {
      saveCurrentInputValues();

      const cards = document.querySelectorAll(".about-section-card");
      
      // Process Cloudinary file uploads for each section
      for (let i = 0; i < cards.length; i++) {
        const fileInput = cards[i].querySelector(".sec-input-file");
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const uploadedUrl = await uploadToCloudinary(fileInput.files[0]);
          sectionsList[i].imageUrl = uploadedUrl;
        }
      }

      const payload = {
        sections: sectionsList,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "about", "content"), payload);

      renderAboutSections();

      if (window.showAppPopup) {
        window.showAppPopup("About Page Saved", `Successfully saved ${sectionsList.length} story sections!`, "edit");
      }

    } catch (err) {
      console.error("[Admin About] Save error:", err);
      if (aboutFormError) {
        aboutFormError.textContent = `Save failed: ${err.message}`;
        aboutFormError.style.display = "block";
      }
    } finally {
      if (aboutSubmitBtn) {
        aboutSubmitBtn.disabled = false;
        aboutSubmitBtn.textContent = "Save All About Sections";
      }
    }
  });
}
