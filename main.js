import { supabase, configured } from "./supabase.js";

const el = id => document.getElementById(id);
const fallback = {
  school_name:"SMPN 5 Gegerbitung",
  principal_name:"Nengsri Rohimah, Munazah, S.Pd., M.Pd.",
  vision:"Mewujudkan peserta didik yang berkarakter, berprestasi, mandiri, dan berwawasan.",
  mission:"Menyelenggarakan pembelajaran yang aktif, inovatif, berkarakter, dan berorientasi pada prestasi.",
  principal_message:"Selamat datang di website resmi SMPN 5 Gegerbitung. Mari bersama membangun lingkungan pendidikan yang aman, inspiratif, dan berprestasi."
};

function imageUrl(path){
  if(!path) return "/assets/logo-smpn5-gegerbitung.png";
  if(path.startsWith("http")) return path;
  return `${location.origin}/storage/v1/object/public/school-media/${path}`;
}

function card(item, type){
  const title = item.title || item.name || "Tanpa judul";
  const text = item.excerpt || item.description || item.content || "Informasi sekolah.";
  const img = item.featured_image_path || item.image_path;
  const tag = item.category || (type==="achievement" ? "Prestasi" : "Kegiatan");
  return `<article class="card">${img?`<img class="card-img" src="${imageUrl(img)}" alt="${title.replace(/"/g,'&quot;')}" onerror="this.src='/assets/logo-smpn5-gegerbitung.png'">`:''}<div class="card-body"><span class="tag">${tag}</span><h3>${title}</h3><p>${String(text).replace(/<[^>]*>/g,'').slice(0,180)}</p></div></article>`;
}

async function load(){
  if(!configured){
    el("newsGrid").innerHTML = `<div class="empty">Supabase belum dikonfigurasi. Isi <b>src/config.js</b> sesuai petunjuk README.</div>`;
    el("activityGrid").innerHTML = `<div class="empty">Data kegiatan akan tampil setelah Supabase tersambung.</div>`;
    el("achievementGrid").innerHTML = `<div class="empty">Data prestasi akan tampil setelah Supabase tersambung.</div>`;
    el("galleryGrid").innerHTML = `<div class="empty">Galeri akan tampil setelah Supabase tersambung.</div>`;
    return;
  }

  const [{data:school},{data:news},{data:cur},{data:stu},{data:ach},{data:teachers}] = await Promise.all([
    supabase.from("school_settings").select("*").limit(1).maybeSingle(),
    supabase.from("news").select("*").eq("status","published").order("published_at",{ascending:false}).limit(6),
    supabase.from("curriculum_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6),
    supabase.from("student_activities").select("*").eq("status","published").order("activity_date",{ascending:false}).limit(6),
    supabase.from("achievements").select("*").order("year",{ascending:false}).limit(6),
    supabase.from("teachers").select("id").eq("is_active", true)
  ]);

  const s = school || fallback;
  el("schoolName").textContent = s.school_name || fallback.school_name;
  el("principalName").textContent = s.principal_name || fallback.principal_name;
  el("vision").textContent = s.vision || fallback.vision;
  el("mission").textContent = s.mission || fallback.mission;
  el("principalMessage").textContent = s.principal_message || fallback.principal_message;
  el("statTeachers").textContent = teachers?.length ?? "-";

  const studentCount = await supabase.from("students").select("id",{count:"exact",head:true});
  el("statStudents").textContent = studentCount.count ?? "-";
  el("statAchievements").textContent = ach?.length ?? "-";
  el("statActivities").textContent = ((cur||[]).length + (stu||[]).length) || "-";

  el("newsGrid").innerHTML = news?.length ? news.map(x=>card(x,"news")).join("") : `<div class="empty">Belum ada berita.</div>`;
  const activities = [...(cur||[]),...(stu||[])].slice(0,6);
  el("activityGrid").innerHTML = activities.length ? activities.map(x=>card(x,"activity")).join("") : `<div class="empty">Belum ada kegiatan.</div>`;
  el("achievementGrid").innerHTML = ach?.length ? ach.map(x=>card(x,"achievement")).join("") : `<div class="empty">Belum ada prestasi.</div>`;

  const {data:albums} = await supabase.from("gallery_albums").select("*,gallery_images(*)").eq("is_published",true).order("event_date",{ascending:false}).limit(8);
  const imgs = (albums||[]).flatMap(a=>a.gallery_images||[]).slice(0,8);
  el("galleryGrid").innerHTML = imgs.length ? imgs.map(i=>`<img src="${imageUrl(i.image_path)}" alt="${i.caption||'Galeri sekolah'}" onerror="this.src='/assets/logo-smpn5-gegerbitung.png'">`).join("") : `<div class="empty">Belum ada foto galeri.</div>`;
}
load().catch(err=>console.error(err));
