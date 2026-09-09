import { supabase } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const imageUrl=p=>!p?"./logo%20sekolah.jpeg":String(p).startsWith("http")?p:`${SUPABASE_URL}/storage/v1/object/public/school-media/${String(p).replace(/^\/+/,"")}`;
const text=v=>String(v??"").replace(/<[^>]*>/g,"");

function modal(){
 let m=document.getElementById("programDetailModal");
 if(m)return m;
 const s=document.createElement("style");
 s.textContent=`#programDetailModal{position:fixed;inset:0;background:rgba(15,23,42,.72);display:none;place-items:center;padding:20px;z-index:10001}#programDetailModal.show{display:grid}#programDetailModal .pdm-card{width:min(820px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:30px;box-shadow:0 25px 70px rgba(0,0,0,.25)}#programDetailModal img{width:100%;max-height:400px;object-fit:cover;border-radius:18px;margin-bottom:20px}#programDetailModal h2{font-size:30px;line-height:1.3;margin:10px 0}.pdm-meta{color:#64748b;font-size:13px;margin-bottom:18px}.pdm-content{color:#334155;line-height:1.9}@media(max-width:560px){#programDetailModal{padding:10px}#programDetailModal .pdm-card{padding:20px}#programDetailModal h2{font-size:24px}}`;
 document.head.appendChild(s);
 m=document.createElement("div");m.id="programDetailModal";m.innerHTML='<div class="pdm-card"><div id="programDetailBody"></div></div>';
 document.body.appendChild(m);
 m.addEventListener("click",e=>{if(!e.target.closest(".pdm-card"))m.classList.remove("show")});
 return m;
}

async function render(){
 const grid=document.getElementById("achievementGrid");if(!grid)return;
 const {data,error}=await supabase.from("achievements").select("*").order("year",{ascending:false}).limit(8);
 if(error){console.error("Program Unggulan:",error);return}
 if(!data?.length){grid.innerHTML='<div class="empty">Belum ada program unggulan.</div>';return}
 grid.innerHTML=data.map((x,i)=>{const title=esc(x.title||"Program Unggulan");const desc=text(x.description||x.content||"Informasi program unggulan.");return `<article class="card program-detail-card"><img class="card-img" src="${imageUrl(x.image_path)}" alt="${title}" onerror="this.src='./logo%20sekolah.jpeg'"><div class="card-body"><span class="tag">${esc(x.category||"Program Unggulan")}</span><h3>${title}</h3><p>${esc(desc.slice(0,180))}${desc.length>180?"…":""}</p><button type="button" class="btn btn-primary program-detail-button" data-program-index="${i}">Lihat selengkapnya</button></div></article>`}).join("");
 modal();
 grid.querySelectorAll(".program-detail-button").forEach(b=>b.addEventListener("click",()=>{const x=data[Number(b.dataset.programIndex)];const m=document.getElementById("programDetailModal");document.getElementById("programDetailBody").innerHTML=`${x.image_path?`<img src="${imageUrl(x.image_path)}" alt="${esc(x.title)}" onerror="this.src='./logo%20sekolah.jpeg'">`:""}<span class="tag">${esc(x.category||"Program Unggulan")}</span><h2>${esc(x.title||"Program Unggulan")}</h2>${x.year?`<div class="pdm-meta">Tahun ${esc(x.year)}</div>`:""}<div class="pdm-content">${esc(text(x.description||x.content||"Informasi program unggulan.")).replace(/\n/g,"<br>")}</div>`;m.classList.add("show");document.body.style.overflow="hidden"}));
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(render,1200));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const m=document.getElementById("programDetailModal");if(m)m.classList.remove("show");document.body.style.overflow=""}});
