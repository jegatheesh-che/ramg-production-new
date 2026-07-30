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
    
    card.innerHTML = `
      <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${cleanYtId}?autoplay=1&mute=1&loop=1&playlist=${cleanYtId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" style="aspect-ratio: 16/9; pointer-events: none; display: block;" allowfullscreen></iframe>
      <div class="gallery-card__expand">&#10530;</div>
    `;
  } else {
    // Image item
    const optimizedUrl = getOptimizedCloudinaryUrl(item.cloudinaryUrl, 800);
    card.innerHTML = `
      <img src="${optimizedUrl}" alt="${item.title || 'Photo'}" loading="lazy" />
      <div class="gallery-card__expand">&#10530;</div>
    `;
  }

  return card;
}
