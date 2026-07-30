// ================================================
// RAMG PRODUCTION — DYNAMIC FIRESTORE GALLERY
// Fetch & Render Gallery Cards from Firestore (Instant Load & Background Sync)
// ================================================

import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Ensure interactions are initialized immediately for pre-rendered cards
  if (typeof window.initGalleryInteractions === "function") {
    window.initGalleryInteractions();
  }
  loadFirestoreGallery();
});

async function loadFirestoreGallery() {
  const galleryMasonry = document.getElementById("galleryMasonry");
  if (!galleryMasonry) return;

  try {
    console.log("[Firestore Gallery] Syncing documents from /gallery in background...");
    
    const querySnapshot = await getDocs(collection(db, "gallery"));
    
    if (querySnapshot.empty) {
      console.log("[Firestore Gallery] /gallery collection is empty. Retaining default archive.");
      return;
    }

    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`[Firestore Gallery] Loaded ${items.length} items from Firestore.`);

    // Replace grid only if Firestore returned valid data
    if (items.length > 0) {
      galleryMasonry.innerHTML = "";
      items.forEach((item) => {
        const cardEl = createGalleryCardDOM(item);
        galleryMasonry.appendChild(cardEl);
      });

      // Re-initialize GSAP reveals & interactions for newly injected cards
      if (typeof window.initScrollReveal === "function") {
        window.initScrollReveal();
      }
      if (typeof window.initGalleryInteractions === "function") {
        window.initGalleryInteractions();
      }
    }

  } catch (error) {
    console.warn("[Firestore Gallery] Network/Permission notice, displaying pre-hydrated archive:", error);
    // Keep instant pre-hydrated cards intact so user sees 0ms fast website
  }
}

function getOptimizedCloudinaryUrl(url, width = 800) {
  // If the cloud restricts dynamic transformations, the optimized URL will return 401/403.
  // To ensure images always load, we fallback to the original URL.
  return url;
}

function extractYoutubeId(input) {
  if (!input) return "";
  input = String(input).trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  const clean = input.split(/[?&#]/)[0].replace(/^.*[\\\/]/, '');
  return clean.length === 11 ? clean : input;
}

function createGalleryCardDOM(item) {
  const card = document.createElement("div");
  card.className = `gallery-card ${item.tiltClass || ''} reveal`;
  card.dataset.id = item.id;
  card.dataset.category = item.category || "uncategorized";
  card.dataset.title = item.title || "";

  if (item.mediaType === "video") {
    const cleanYtId = extractYoutubeId(item.youtubeId);
    card.setAttribute("data-youtube-id", cleanYtId);
    
    // Check if admin uploaded a custom thumbnail image for the video
    const customThumb = item.cloudinaryUrl || item.imageUrl || "";
    const primaryThumb = customThumb || `https://img.youtube.com/vi/${cleanYtId}/maxresdefault.jpg`;
    const hqThumb = `https://img.youtube.com/vi/${cleanYtId}/hqdefault.jpg`;
    const mqThumb = `https://img.youtube.com/vi/${cleanYtId}/mqdefault.jpg`;
    const brandFallback = `assets/images/ramg-prods.png`;

    const onerrorAttr = `if(!this.dataset.failStep){this.dataset.failStep=1;this.src='${hqThumb}';}else if(this.dataset.failStep=='1'){this.dataset.failStep=2;this.src='${mqThumb}';}else{this.src='${brandFallback}';}`;

    card.innerHTML = `
      <img src="${primaryThumb}" alt="${item.title || 'Video'}" loading="lazy" onerror="${onerrorAttr}" />
      <div class="gallery-card__video-badge">
        <svg viewBox="0 0 24 24">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
      </div>
      <div class="gallery-card__expand">&#10530;</div>
    `;
  } else {
    // Image item
    const rawUrl = item.cloudinaryUrl || item.imageUrl || "";
    const optimizedUrl = getOptimizedCloudinaryUrl(rawUrl, 800);
    card.setAttribute("data-image-url", optimizedUrl);
    card.innerHTML = `
      <img src="${optimizedUrl}" alt="${item.title || 'Photo'}" loading="lazy" />
      <div class="gallery-card__expand">&#10530;</div>
    `;
  }

  return card;
}
