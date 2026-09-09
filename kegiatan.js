import { supabase } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#039;"}[c]));
const stripHtml=v=>String(v??"").replace(/<[^>]*>/g,"");
const imageUrl=path=>{if(!path)return "./logo%20sekolah.jpeg";if(String(path).startsWith("http"))return path;return `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(path).replace(/^\/+/,"")}`};

function ensureActivityModal(){
  if(document.getElementById("activityModal"))return;
  const style=document.createElement("style");
  style.textContent=`#activityModal{position:fixed;inset:0;background:rgba(15,23,42,.72);display:none;place-items:center;padding:20px;z-index:9996}#activityModal.show{display:grid}#activityModal .activity-modal-card{width:min(820px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:30px;box-shadow:0 25px 70px rgba(0,0,0,.25)}#activityModal .activity-modal-img{width:100%;max-height:400px;object-fit:cover;border-radius:18px;margin-bottom:20px}#activityModal .activity-modal-title{font-size:30px;line-height:1.3;margin:0 0 8px}#activityModal .activity-modal-meta{font-size:13px;color:#64748b;margin-bottom:20px}#activityModal .activity-modal-content{font-size:15px;line-height:1.9;color:#334155}@media(max-width:560px){#activityModal{padding:10px}#activityModal .activity-modal-card{padding:20px}#activityModal .activity-modal-title{font-size:24px}#activityModal .activity-modal-img{max-height:280px}}`;
  document.head.appendChild(style);
  const modal=document.createElement("div");
  modal.id="activityModal";
  modal.innerHTML=`<div class="activity-modal-card"><div id="activityModalBody"></div></div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click",e=>{if(!e.target.closest(".activity-modal-card"))closeActivity()});
}
function closeActivity(){const m=document.getElementById("activityModal");if(m){m.classList.remove("show");document.body.style.overflow=""}}
function showActivity(item){
  ensureActivityModal();
  const body=document.getElementById("activityModalBody");
  const title=esc(item.title||"Kegiatan Sekolah");
  const img=item.image_path;
  const date=item.activity_date?new Date(item.activity_date).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}):"";
  const type=item.__type==="cur"?"Kegiatan Kurikulum":"Kegiatan Kesiswaan";
  const content=stripHtml(item.content||item.description||"Informasi kegiatan sekolah.").replace(/\n/g,"<br>");
  body.innerHTML=`${img?`<img class="activity-modal-img" src="${imageUrl(img)}" alt="${title}" onerror="this.src='./logo%20sekolah.jpeg'">`:""}<span class="tag">${type}</span><h2 class="activity-modal-title">${title}</h2>${date?`<div class="activity-modal-meta">${date}</div>`:""}<div class="activity-modal-content">${content}</div>`;
  document.getElementById("activityModal").classList.add("show");
  document.body.style.overflow="hidden";
}

async function renderActivities(){
  const grid=document.getElementById("activityGrid");
  if(!grid)return;
  try{
    const [{data:cur,error:e1},{data:stu,error:e2}]=await Promise.all([
      supabase.from("curriculum_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6),
      supabase.from("student_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6)
    ]);
    if(e1)throw e1;if(e2)throw e2;
    const activities=[...(cur||[]).map(x=>({...x,__type:"cur"})),...(stu||[]).map(x=>({...x,__type:"stu"}))].sort((a,b)=>new Date(b.activity_date||0)-new Date(a.activity_date||0)).slice(0,6);
    grid.innerHTML=activities.length?activities.map((item,i)=>{
      const title=esc(item.title||"Kegiatan Sekolah");
      const text=stripHtml(item.description||item.content||"Informasi kegiatan sekolah.");
      const type=item.__type==="cur"?"Kegiatan Kurikulum":"Kegiatan Kesiswaan";
      return `<article class="card"><img class="card-img" src="${imageUrl(item.image_path)}" alt="${title}" onerror="this.src='./logo%20sekolah.jpeg'"><div class="card-body"><span class="tag">${type}</span><h3>${title}</h3><p>${text.slice(0,180)}${text.length>180?"…":""}</p><button type="button" class="btn btn-primary activity-read-button" data-activity-index="${i}">Lihat selengkapnya</button></div></article>`;
    }).join(""):`<div class="empty">Belum ada kegiatan.</div>`;
    ensureActivityModal();
    grid.querySelectorAll(".activity-read-button").forEach(btn=>btn.addEventListener("click",()=>showActivity(activities[Number(btn.dataset.activityIndex)])));
  }catch(err){console.error("Kegiatan Sekolah:",err)}
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(renderActivities,700));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeActivity()});