import { supabase, configured } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

const el = id => document.getElementById(id);
const fallback = {
  school_name:"SMPN 5 Gegerbitung",
  principal_name:"Nengsri Rohimah, Munazah, S.Pd., M.Pd.",
  vision:"Mewujudkan peserta didik yang berkarakter, berprestasi, mandiri, dan berwawasan.",
  mission:"Menyelenggarakan pembelajaran yang aktif, inovatif, berkarakter, dan berorientasi pada prestasi.",
  principal_message:"Selamat datang di website resmi SMPN 5 Gegerbitung. Mari bersama membangun lingkungan pendidikan yang aman, inspiratif, dan berprestasi."
};

function imageUrl(path){
  if(!path) return "./logo%20sekolah.jpeg";
  if(String(path).startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(path).replace(/^\/+/, "")}`;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function card(item, type){
  const title = item.title || item.name || "Tanpa judul";
  const text = item.excerpt || item.description || item.content || "Informasi sekolah.";
  const img = item.featured_image_path || item.image_path;
  const tag = item.category || (type==="achievement" ? "Prestasi" : "Kegiatan");
  return `<article class="card">${img?`<img class="card-img" src="${imageUrl(img)}" alt="${esc(title)}" onerror="this.src='./logo%20sekolah.jpeg'">`:''}<div class="card-body"><span class="tag">${esc(tag)}</span><h3>${esc(title)}</h3><p>${String(text).replace(/<[^>]*>/g,'').slice(0,180)}</p></div></article>`;
}

function teacherCard(t){
  const name=esc(t.name||"Nama belum diisi");
  const role=esc(t.position||"Guru/Tendik");
  const subject=esc(t.subject||"");
  const photo=imageUrl(t.photo_path);
  const id=esc(t.id);
  return `<article class="teacher-card">
    <img class="teacher-photo" src="${photo}" alt="Foto ${name}" onerror="this.src='./logo%20sekolah.jpeg'">
    <div class="teacher-body">
      <span class="teacher-role">${role}</span>
      <h3>${name}</h3>
      <p class="teacher-meta">${subject ? `<b>Mata Pelajaran:</b> ${subject}` : "Tenaga pendidik dan kependidikan SMPN 5 Gegerbitung."}</p>
      <div class="teacher-detail"><button class="btn btn-soft" data-teacher-id="${id}">Lihat Profil Lengkap</button></div>
    </div>
  </article>`;
}

function showTeacher(t){
  const body=el("teacherModalBody");
  if(!body) return;
  const photo=imageUrl(t.photo_path);
  body.innerHTML=`<div class="teacher-profile">
    <img src="${photo}" alt="Foto ${esc(t.name||"Guru/Tendik")}" onerror="this.src='./logo%20sekolah.jpeg'">
    <div>
      <span class="teacher-role">${esc(t.position||"Guru/Tendik")}</span>
      <h2>${esc(t.name||"Nama belum diisi")}</h2>
      <div class="teacher-info">
        <div><b>NIP</b>${esc(t.nip||"-")}</div>
        <div><b>NUPTK</b>${esc(t.nuptk||"-")}</div>
        <div><b>Jenis Kelamin</b>${t.gender==="L"?"Laki-laki":t.gender==="P"?"Perempuan":"-"}</div>
        <div><b>Mata Pelajaran</b>${esc(t.subject||"-")}</div>
        <div><b>Pendidikan</b>${esc(t.education||"-")}</div>
        ${t.email?`<div><b>Email</b>${esc(t.email)}</div>`:""}
        ${t.phone?`<div><b>Telepon</b>${esc(t.phone)}</div>`:""}
      </div>
      ${t.bio?`<p style="color:#64748b;line-height:1.8;margin-top:18px">${esc(t.bio).replace(/\n/g,"<br>")}</p>`:""}
    </div>
  </div>`;
  el("teacherModal").classList.add("show");
  el("teacherModal").setAttribute("aria-hidden","false");
}
function closeTeacher(){
  const m=el("teacherModal");
  if(m){m.classList.remove("show");m.setAttribute("aria-hidden","true")}
}

async function load(){
  if(!configured){
    el("newsGrid").innerHTML = `<div class="empty">Supabase belum dikonfigurasi.</div>`;
    el("activityGrid").innerHTML = `<div class="empty">Data kegiatan akan tampil setelah Supabase tersambung.</div>`;
    el("achievementGrid").innerHTML = `<div class="empty">Data prestasi akan tampil setelah Supabase tersambung.</div>`;
    el("galleryGrid").innerHTML = `<div class="empty">Galeri akan tampil setelah Supabase tersambung.</div>`;
    el("teacherGrid").innerHTML = `<div class="empty">Data guru & tendik akan tampil setelah Supabase tersambung.</div>`;
    return;
  }

  const [{data:school},{data:news},{data:cur},{data:stu},{data:ach},{data:teachers,error:teacherError}] = await Promise.all([
    supabase.from("school_settings").select("*").limit(1).maybeSingle(),
    supabase.from("news").select("*").eq("status","published").order("published_at",{ascending:false}).limit(6),
    supabase.from("curriculum_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6),
    supabase.from("student_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6),
    supabase.from("achievements").select("*").order("year",{ascending:false}).limit(6),
    supabase.from("teachers").select("*").eq("is_active",true).order("sort_order",{ascending:true}).order("name",{ascending:true})
  ]);

  const s = school || fallback;
  el("schoolName").textContent = s.school_name || fallback.school_name;
  el("principalName").textContent = s.principal_name || fallback.principal_name;
  el("vision").textContent = s.vision || fallback.vision;
  el("mission").textContent = s.mission || fallback.mission;
  el("principalMessage").textContent = s.principal_message || fallback.principal_message;
  el("statTeachers").textContent = teacherError ? "-" : (teachers?.length ?? 0);

  const studentCount = await supabase.from("students").select("id",{count:"exact",head:true});
  el("statStudents").textContent = studentCount.count ?? "-";
  el("statAchievements").textContent = ach?.length ?? "-";
  el("statActivities").textContent = ((cur||[]).length + (stu||[]).length) || "-";

  el("teacherGrid").innerHTML = teacherError
    ? `<div class="empty">Kolom foto guru belum siap. Jalankan SQL pada file <b>supabase_teachers_photo.sql</b>, lalu muat ulang website.</div>`
    : (teachers?.length ? teachers.map(teacherCard).join("") : `<div class="empty">Belum ada data guru & tendik yang aktif.</div>`);

  if(!teacherError){
    el("teacherGrid").querySelectorAll("[data-teacher-id]").forEach(btn=>{
      btn.addEventListener("click",()=>showTeacher(teachers.find(t=>String(t.id)===btn.dataset.teacherId)));
    });
  }

  el("newsGrid").innerHTML = news?.length ? news.map(x=>card(x,"news")).join("") : `<div class="empty">Belum ada berita.</div>`;
  const activities = [...(cur||[]),...(stu||[])].slice(0,6);
  el("activityGrid").innerHTML = activities.length ? activities.map(x=>card(x,"activity")).join("") : `<div class="empty">Belum ada kegiatan.</div>`;
  el("achievementGrid").innerHTML = ach?.length ? ach.map(x=>card(x,"achievement")).join("") : `<div class="empty">Belum ada prestasi.</div>`;

  const {data:albums} = await supabase.from("gallery_albums").select("*,gallery_images(*)").eq("is_published",true).order("event_date",{ascending:false}).limit(8);
  const imgs = (albums||[]).flatMap(a=>a.gallery_images||[]).slice(0,8);
  el("galleryGrid").innerHTML = imgs.length ? imgs.map(i=>`<img src="${imageUrl(i.image_path)}" alt="${esc(i.caption||'Galeri sekolah')}" onerror="this.src='./logo%20sekolah.jpeg'">`).join("") : `<div class="empty">Belum ada foto galeri.</div>`;
}

el("teacherModalClose")?.addEventListener("click",closeTeacher);
el("teacherModal")?.addEventListener("click",e=>{if(e.target.id==="teacherModal")closeTeacher()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeTeacher()});
load().catch(err=>console.error(err));
