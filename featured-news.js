import { supabase, configured } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

// Berita utama khusus 10 September 2026.
const FEATURED_DATE = "2026-09-10";
const FEATURED_TITLE = "Penghargaan Ibu Kepala Sekolah";

function imageUrl(path){
  if(!path) return "./logo%20sekolah.jpeg";
  if(String(path).startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(path).replace(/^\\/+/,"")}`;
}

function esc(value){
  return String(value ?? "").replace(/[&<>\"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",\"":"&quot;",\"'\":\"&#039;\"
  }[c]));
}

function stripHtml(value){
  return String(value ?? "").replace(/<[^>]*>/g, "");
}

function jakartaDate(){
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Jakarta",
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
  }).format(new Date());
}

function addStyles(){
  if(document.getElementById("featured-news-styles")) return;
  const style=document.createElement("style");
  style.id="featured-news-styles";
  style.textContent=`
    .featured-today{padding:28px 0 18px;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 55%,#f0f9ff 100%);border-bottom:1px solid #dbeafe;overflow:hidden}
    .featured-today-card{position:relative;display:grid;grid-template-columns:1.05fr .95fr;min-height:330px;border-radius:28px;overflow:hidden;background:linear-gradient(135deg,#075985,#0284c7);box-shadow:0 22px 55px rgba(2,132,199,.22)}
    .featured-today-content{padding:38px 42px;display:flex;flex-direction:column;justify-content:center;color:#fff;position:relative;z-index:2}
    .featured-today-badge{display:inline-flex;align-items:center;gap:7px;width:max-content;padding:8px 13px;border-radius:999px;background:#fbbf24;color:#172554;font-size:11px;font-weight:900;letter-spacing:.5px}
    .featured-today-content h2{font-family:"Plus Jakarta Sans",sans-serif;font-size:clamp(30px,4vw,48px);line-height:1.08;margin:16px 0 10px;color:#fff}
    .featured-today-content p{margin:0;color:#e0f2fe;font-size:15px;line-height:1.75;max-width:620px}
    .featured-today-date{margin:14px 0 20px;color:#bae6fd;font-size:12px;font-weight:700}
    .featured-today-button{display:inline-flex;width:max-content;align-items:center;justify-content:center;padding:12px 18px;border-radius:12px;background:#fff;color:#075985;font-weight:800;font-size:13px;cursor:pointer;border:0}
    .featured-today-image{width:100%;height:100%;min-height:330px;object-fit:cover;display:block}
    .featured-today-image-wrap{position:relative;min-height:330px}
    .featured-today-image-wrap:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,132,199,.15),rgba(2,132,199,0) 55%)}
    @media(max-width:760px){
      .featured-today{padding:18px 0 12px}
      .featured-today-card{grid-template-columns:1fr;min-height:0}
      .featured-today-content{padding:28px 25px 25px}
      .featured-today-image-wrap{min-height:230px;order:-1}
      .featured-today-image{min-height:230px;max-height:300px}
    }
  `;
  document.head.appendChild(style);
}

async function initFeaturedNews(){
  // Setelah tanggal berganti, elemen tidak dibuat sama sekali.
  if(jakartaDate() !== FEATURED_DATE) return;
  if(!configured) return;

  const {data:item,error}=await supabase
    .from("news")
    .select("*")
    .eq("title",FEATURED_TITLE)
    .eq("status","published")
    .order("published_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  if(error || !item) return;

  addStyles();
  const main=document.querySelector("main");
  if(!main || document.getElementById("featured-today")) return;

  const section=document.createElement("section");
  section.id="featured-today";
  section.className="featured-today";

  const excerpt=stripHtml(item.excerpt || item.content || "Informasi terbaru dari SMPN 5 Gegerbitung.");
  const date=item.published_at
    ? new Date(item.published_at).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})
    : "10 September 2026";

  section.innerHTML=`
    <div class="container">
      <div class="featured-today-card">
        <div class="featured-today-content">
          <span class="featured-today-badge">🏆 BERITA UTAMA HARI INI</span>
          <h2>${esc(item.title)}</h2>
          <p>${esc(excerpt.slice(0,260))}${excerpt.length>260?"…":""}</p>
          <div class="featured-today-date">${esc(date)} • SMPN 5 Gegerbitung</div>
          <button type="button" class="featured-today-button">Baca Berita Selengkapnya →</button>
        </div>
        <div class="featured-today-image-wrap">
          <img class="featured-today-image" src="${imageUrl(item.featured_image_path)}" alt="${esc(item.title)}" onerror="this.src='./logo%20sekolah.jpeg'">
        </div>
      </div>
    </div>
  `;

  main.insertBefore(section,main.firstElementChild);

  section.querySelector(".featured-today-button")?.addEventListener("click",()=>{
    const newsSection=document.getElementById("berita");
    if(newsSection) newsSection.scrollIntoView({behavior:"smooth",block:"start"});
  });
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded",initFeaturedNews,{once:true});
}else{
  initFeaturedNews();
}
