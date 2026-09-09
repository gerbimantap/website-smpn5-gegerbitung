import { supabase } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#039;"}[c]));
const stripHtml=v=>String(v??"").replace(/<[^>]*>/g,"");
const imageUrl=path=>{if(!path)return "./logo%20sekolah.jpeg";if(String(path).startsWith("http"))return path;return `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(path).replace(/^\/+/,"")}`};

function ensureModal(){
  if(document.getElementById("programModal"))return;
  const style=document.createElement("style");
  style.textContent=`#programModal{position:fixed;inset:0;background:rgba(15,23,42,.72);display:none;place-items:center;padding:20px;z-index:9997}#programModal.show{display:grid}#programModal .program-modal-card{width:min(820px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:30px;box-shadow:0 25px 70px rgba(0,0,0,.25)}#programModal .program-modal-img{width:100%;max-height:400px;object-fit:cover;border-radius:18px;margin-bottom:20px}#programModal .program-modal-title{font-family:"Plus Jakarta Sans",sans-serif;font-size:30px;line-height:1.3;margin:0 0 8px}#programModal .program-modal-meta{font-size:13px;color:#64748b;margin-bottom:20px}#programModal .program-modal-content{font-size:15px;line-height:1.9;color:#334155}@media(max-width:560px){#programModal{padding:10px}#programModal .program-modal-card{padding:20px}#programModal .program-modal-title{font-size:24px}#programModal .program-modal-img{max-height:280px}}`;
  document.head.appendChild(style);
  const modal=document.createElement("div");
  modal.id="programModal";
  modal.innerHTML=`<div class="program-modal-card"><div id="programModalBody"></div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click",e=>{if(!e.target.closest(".program-modal-card"))closeModal()});
}
function closeModal(){const m=document.getElementById("programModal");if(m){m.classList.remove("show");document.body.style.overflow=""}}
function showProgram(item){
  ensureModal();
  const body=document.getElementById("programModalBody");
  const title=esc(item.title||"Program Unggulan");
  const img=item.image_path;
  const category=esc(item.category||"Program Unggulan");
  const year=item.year?String(item.year):"";
  const content=stripHtml(item.content||item.description||"Informasi program unggulan sekolah.").replace(/\n/g,"<br>");
  body.innerHTML=`${img?`<img class="program-modal-img" src="${imageUrl(img)}" alt="${title}" onerror="this.src='./logo%20sekolah.jpeg'">`:""}<span class="tag">${category}</span><h2 class="program-modal-title">${title}</h2>${year?`<div class="program-modal-meta">Tahun ${year}</div>`:""}<div class="program-modal-content">${content}</div>`;
  document.getElementById("programModal").classList.add("show");
  document.body.style.overflow="hidden";
}

async function renderPrograms(){
  const grid=document.getElementById("achievementGrid");
  if(!grid)return;
  try{
    const {data:items,error}=await supabase.from("achievements").select("*").order("year",{ascending:false}).limit(6);
    if(error)throw error;
    grid.innerHTML=items?.length?items.map((item,i)=>{
      const title=esc(item.title||"Program Unggulan");
      const text=stripHtml(item.description||item.content||"Program unggulan sekolah.");
      const img=item.image_path;
      return `<article class="card"><img class="card-img" src="${imageUrl(img)}" alt="${title}" onerror="this.src='./logo%20sekolah.jpeg'"><div class="card-body"><span class="tag">${esc(item.category||"Program Unggulan")}</span><h3>${title}</h3><p>${text.slice(0,180)}${text.length>180?"…":""}</p><button type="button" class="btn btn-primary program-read-button" data-program-index="${i}">Lihat selengkapnya</button></div></article>`;
    }).join(""):`<div class="empty">Belum ada program unggulan.</div>`;
    ensureModal();
    grid.querySelectorAll(".program-read-button").forEach(btn=>btn.addEventListener("click",()=>showProgram(items[Number(btn.dataset.programIndex)])));
  }catch(err){console.error("Program Unggulan:",err)}
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(renderPrograms,500));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});