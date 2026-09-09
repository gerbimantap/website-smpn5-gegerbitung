// Konfigurasi Supabase SMPN 5 Gegerbitung
// Jangan memasukkan service_role/secret key ke frontend.

export const SUPABASE_URL = "https://ekkwsbvvfvybreyclmhq.supabase.co";

export const SUPABASE_ANON_KEY = "sb_publishable_VyHcQVq513WaZOaPTuNoog_TUd4Zy2Y";

// Fitur tambahan tampilan website.
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    /* Tombol detail Kegiatan & Program Unggulan */
    #activityGrid .card-body,#achievementGrid .card-body{display:flex;flex-direction:column}
    .activity-read-button,.achievement-read-button{margin-top:12px;width:100%;min-height:42px}
    @media(max-width:560px){
      #activityGrid .card-body,#achievementGrid .card-body{padding:16px}
      .activity-read-button,.achievement-read-button{display:inline-flex!important;visibility:visible!important;opacity:1!important;margin-top:10px}
    }
    /* Modal detail Kegiatan/Program */
    #contentDetailModal{position:fixed;inset:0;background:rgba(15,23,42,.72);display:none;place-items:center;padding:16px;z-index:10020}
    #contentDetailModal.show{display:grid}
    #contentDetailModal .content-detail-card{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:28px;position:relative;box-shadow:0 25px 70px rgba(0,0,0,.28)}
    #contentDetailModal .content-detail-close{position:absolute;right:16px;top:16px;border:0;background:#f1f5f9;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:23px;z-index:2}
    #contentDetailModal .content-detail-img{width:100%;max-height:390px;object-fit:cover;border-radius:18px;margin-bottom:18px}
    #contentDetailModal .content-detail-title{font-family:"Plus Jakarta Sans",sans-serif;font-size:30px;line-height:1.3;margin:12px 50px 10px 0}
    #contentDetailModal .content-detail-text{font-size:15px;line-height:1.9;color:#334155;white-space:pre-line}
    @media(max-width:560px){
      #contentDetailModal{padding:10px}
      #contentDetailModal .content-detail-card{padding:20px;border-radius:20px;max-height:92vh}
      #contentDetailModal .content-detail-title{font-size:24px}
      #contentDetailModal .content-detail-img{max-height:280px}
    }

    /* Video YouTube sekolah */
    #videoSekolah{padding:65px 0;background:#f8fafc}
    #videoSekolah .video-box{width:min(900px,100%);margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:24px;padding:12px;box-shadow:0 12px 35px rgba(15,23,42,.08)}
    #videoSekolah .video-frame{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:17px;background:#000}
    #videoSekolah .video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
    #videoSekolah .video-note{text-align:center;color:var(--muted);font-size:13px;margin:14px 5px 3px}
    @media(max-width:560px){
      #videoSekolah{padding:50px 0}
      #videoSekolah .video-box{padding:7px;border-radius:18px}
      #videoSekolah .video-frame{border-radius:13px}
    }

    /* Bagian Ikuti Kami */
    #socialSekolah{padding:34px 0 38px;background:#0f2747;color:#fff}
    #socialSekolah .social-inner{display:flex;align-items:center;justify-content:space-between;gap:24px}
    #socialSekolah .social-title{margin:0 0 6px;font-family:"Plus Jakarta Sans",sans-serif;font-size:22px;color:#fff}
    #socialSekolah .social-desc{margin:0;color:rgba(255,255,255,.72);font-size:14px}
    #socialSekolah .social-links{display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end}
    #socialSekolah .social-link{display:inline-flex;align-items:center;gap:9px;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;background:#fff;color:#0f2747;transition:transform .2s ease,box-shadow .2s ease}
    #socialSekolah .social-link:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18)}
    #socialSekolah .social-icon{font-size:19px;line-height:1}
    @media(max-width:650px){
      #socialSekolah{padding:30px 0}
      #socialSekolah .social-inner{flex-direction:column;align-items:flex-start}
      #socialSekolah .social-links{width:100%;justify-content:flex-start}
      #socialSekolah .social-link{flex:1;justify-content:center;min-width:145px}
    }
  `;
  document.head.appendChild(style);

  // Lightbox galeri: foto dapat diklik untuk tampil lebih besar.
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

  document.addEventListener("click", (event) => {
    const img = event.target.closest("#galleryModal .gallery-modal-grid img");
    if (img) {
      event.preventDefault();
      event.stopPropagation();
      openGalleryLightbox(img);
      return;
    }
    if (event.target === lightbox || event.target.closest(".gallery-lightbox-close")) closeGalleryLightbox();
  });

  // Modal detail untuk Kegiatan dan Program Unggulan.
  const detailModal = document.createElement("div");
  detailModal.id = "contentDetailModal";
  detailModal.setAttribute("aria-hidden", "true");
  detailModal.innerHTML = `<div class="content-detail-card"><button class="content-detail-close" type="button" aria-label="Tutup">&times;</button><div id="contentDetailBody"></div></div>`;
  document.body.appendChild(detailModal);
  const detailBody = detailModal.querySelector("#contentDetailBody");

  function openContentDetail(card) {
    if (!card || !detailBody) return;
    const img = card.querySelector(".card-img");
    const title = card.querySelector("h3")?.textContent?.trim() || "Informasi Sekolah";
    const tag = card.querySelector(".tag")?.textContent?.trim() || "Informasi";
    const text = card.querySelector("p")?.textContent?.trim() || "Informasi sekolah.";
    detailBody.innerHTML = `${img ? `<img class="content-detail-img" src="${img.currentSrc || img.src}" alt="${title.replace(/"/g,"&quot;")}">` : ""}<span class="tag">${tag}</span><h2 class="content-detail-title">${title}</h2><div class="content-detail-text">${text}</div>`;
    detailModal.classList.add("show");
    detailModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeContentDetail() {
    detailModal.classList.remove("show");
    detailModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  detailModal.addEventListener("click", event => {
    if (event.target === detailModal || event.target.closest(".content-detail-close")) closeContentDetail();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeContentDetail();
      closeGalleryLightbox();
    }
  });

  // Main.js mengisi Kegiatan/Program secara dinamis dari Supabase.
  // Observer memastikan tombol selalu ditambahkan setelah data selesai dimuat.
  function addDetailButtons() {
    [
      ["activityGrid", "activity-read-button", "Kegiatan"],
      ["achievementGrid", "achievement-read-button", "Program Unggulan"]
    ].forEach(([gridId, buttonClass, label]) => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      grid.querySelectorAll(":scope > .card").forEach(card => {
        if (card.querySelector("." + buttonClass)) return;
        const body = card.querySelector(".card-body");
        if (!body) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = `btn btn-primary ${buttonClass}`;
        button.textContent = "Lihat selengkapnya";
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          openContentDetail(card);
        });
        body.appendChild(button);
      });
    });
  }

  // Tambahkan video YouTube sekolah ke halaman utama tanpa mengubah struktur index.html.
  function addSchoolVideo() {
    if (document.getElementById("videoSekolah")) return;
    const statsSection = document.querySelector("section .stats")?.closest("section");
    const profilSection = document.getElementById("profil");
    if (!profilSection) return;

    const section = document.createElement("section");
    section.id = "videoSekolah";
    section.innerHTML = `
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow" style="background:#e0f2fe;border-color:#bae6fd;color:#0369a1">VIDEO SEKOLAH</span>
            <h2>Video SMPN 5 Gegerbitung</h2>
            <p>Simak informasi dan berbagai kegiatan sekolah melalui video.</p>
          </div>
        </div>
        <div class="video-box">
          <div class="video-frame">
            <iframe
              src="https://www.youtube.com/embed/ODhVSvRuyPA"
              title="Video SMPN 5 Gegerbitung"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen>
            </iframe>
          </div>
          <p class="video-note">Tonton video sekolah langsung melalui website SMPN 5 Gegerbitung.</p>
        </div>
      </div>`;

    // Letakkan video setelah bagian statistik dan sebelum Profil.
    if (statsSection) statsSection.insertAdjacentElement("afterend", section);
    else profilSection.insertAdjacentElement("beforebegin", section);
  }

  // Tambahkan tautan resmi YouTube dan Instagram di bagian bawah website.
  function addSchoolSocials() {
    if (document.getElementById("socialSekolah")) return;
    const footer = document.querySelector("footer");
    if (!footer) return;

    const section = document.createElement("section");
    section.id = "socialSekolah";
    section.innerHTML = `
      <div class="container social-inner">
        <div>
          <h2 class="social-title">Ikuti SMPN 5 Gegerbitung</h2>
          <p class="social-desc">Dapatkan informasi, kegiatan, dan kabar terbaru sekolah melalui media sosial resmi kami.</p>
        </div>
        <div class="social-links">
          <a class="social-link" href="https://youtube.com/@smpn5gegerbitung" target="_blank" rel="noopener noreferrer" aria-label="YouTube SMPN 5 Gegerbitung">
            <span class="social-icon">▶</span><span>YouTube</span>
          </a>
          <a class="social-link" href="https://www.instagram.com/smpn_5_gegerbitung" target="_blank" rel="noopener noreferrer" aria-label="Instagram SMPN 5 Gegerbitung">
            <span class="social-icon">◎</span><span>Instagram</span>
          </a>
        </div>
      </div>`;

    // Letakkan tepat sebelum footer agar menjadi bagian penutup halaman.
    footer.insertAdjacentElement("beforebegin", section);
  }

  const startExtraFeatures = () => {
    addDetailButtons();
    addSchoolVideo();
    addSchoolSocials();
    const observer = new MutationObserver(() => {
      addDetailButtons();
      addSchoolVideo();
      addSchoolSocials();
    });
    ["activityGrid", "achievementGrid"].forEach(id => {
      const grid = document.getElementById(id);
      if (grid) observer.observe(grid, {childList:true,subtree:true});
    });
    setTimeout(addDetailButtons, 300);
    setTimeout(addDetailButtons, 1000);
    setTimeout(addSchoolVideo, 300);
    setTimeout(addSchoolVideo, 1000);
    setTimeout(addSchoolSocials, 300);
    setTimeout(addSchoolSocials, 1000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startExtraFeatures);
  else startExtraFeatures();
}
