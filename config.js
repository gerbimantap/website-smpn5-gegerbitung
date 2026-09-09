// Konfigurasi Supabase SMPN 5 Gegerbitung
// Jangan memasukkan service_role/secret key ke frontend.

export const SUPABASE_URL = "https://ekkwsbvvfvybreyclmhq.supabase.co";

export const SUPABASE_ANON_KEY = "sb_publishable_VyHcQVq513WaZOaPTuNoog_TUd4Zy2Y";

// Lightbox galeri: foto dapat diklik untuk tampil lebih besar.
if (typeof document !== "undefined") {
  const lightboxStyle = document.createElement("style");
  lightboxStyle.textContent = `
    #galleryLightbox{position:fixed;inset:0;background:rgba(2,8,23,.88);display:none;align-items:center;justify-content:center;padding:20px;z-index:10050;cursor:zoom-out}
    #galleryLightbox.show{display:flex}
    #galleryLightbox img{max-width:min(1100px,96vw);max-height:88vh;width:auto;height:auto;object-fit:contain;border-radius:14px;box-shadow:0 25px 80px rgba(0,0,0,.45);cursor:default}
    #galleryLightbox .gallery-lightbox-close{position:absolute;right:20px;top:18px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.95);color:#0f172a;font-size:27px;line-height:1;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.25)}
    #galleryLightbox .gallery-lightbox-caption{position:absolute;left:20px;right:20px;bottom:18px;text-align:center;color:#fff;font-size:13px;text-shadow:0 2px 8px rgba(0,0,0,.7)}
    #galleryModal .gallery-modal-grid img{cursor:zoom-in;transition:transform .2s ease,box-shadow .2s ease}
    #galleryModal .gallery-modal-grid img:hover{transform:scale(1.02);box-shadow:0 10px 25px rgba(15,23,42,.15)}
    @media(max-width:650px){#galleryLightbox{padding:10px}#galleryLightbox img{max-width:96vw;max-height:82vh}#galleryLightbox .gallery-lightbox-close{right:12px;top:12px;width:40px;height:40px;font-size:24px}}
  `;
  document.head.appendChild(lightboxStyle);

  const lightbox = document.createElement("div");
  lightbox.id = "galleryLightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="gallery-lightbox-close" type="button" aria-label="Tutup foto">&times;</button>
    <img src="" alt="Foto galeri sekolah">
    <div class="gallery-lightbox-caption"></div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");

  function openGalleryLightbox(img) {
    if (!img || !lightboxImg) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "Foto galeri sekolah";
    if (lightboxCaption) lightboxCaption.textContent = img.alt || "Foto galeri sekolah";
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeGalleryLightbox() {
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImg) lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  // Event delegation: tetap bekerja meskipun foto galeri dibuat dinamis oleh main.js.
  document.addEventListener("click", (event) => {
    const img = event.target.closest("#galleryModal .gallery-modal-grid img");
    if (img) {
      event.preventDefault();
      event.stopPropagation();
      openGalleryLightbox(img);
      return;
    }

    if (event.target === lightbox || event.target.closest(".gallery-lightbox-close")) {
      closeGalleryLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("show")) {
      closeGalleryLightbox();
    }
  });
}
