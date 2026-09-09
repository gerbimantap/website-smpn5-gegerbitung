import { supabase, configured } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";

const $ = id => document.getElementById(id);
const menu = $("menu"), content = $("content"), modal=$("modal"), modalBody=$("modalBody"), modalTitle=$("modalTitle");
let current = "dashboard";
let role = null;

const modules = {
  school_settings:{label:"🏫 Identitas Sekolah",table:"school_settings",fields:[
    ["school_name","Nama Sekolah","text"],["jenjang","Jenjang","text"],["npsn","NPSN","text"],["address","Alamat","text"],["village","Desa","text"],["district","Kecamatan","text"],["regency","Kabupaten/Kota","text"],["province","Provinsi","text"],["email","Email","email"],["phone","Telepon","text"],["principal_name","Nama Kepala Sekolah","text"],["principal_message","Sambutan Kepala Sekolah","textarea"],["vision","Visi","textarea"],["mission","Misi","textarea"],["goals","Tujuan","textarea"],["hero_title","Judul Hero","text"],["hero_subtitle","Subjudul Hero","textarea"],["primary_color","Warna Utama","text"],["secondary_color","Warna Kedua","text"],["google_maps_url","Google Maps URL","url"]
  ]},
  teachers:{label:"👩‍🏫 Guru & Tendik",table:"teachers",fields:[["name","Nama","text"],["nip","NIP","text"],["nuptk","NUPTK","text"],["gender","Jenis Kelamin","select:L,P"],["position","Jabatan","text"],["subject","Mata Pelajaran","text"],["education","Pendidikan","text"],["email","Email","email"],["phone","Telepon","text"],["bio","Biografi","textarea"],["photo_path","Foto","file-image"],["is_active","Aktif","checkbox"],["sort_order","Urutan","number"]]},
  students:{label:"👨‍🎓 Data Siswa",table:"students",fields:[["name","Nama","text"],["nis","NIS","text"],["nisn","NISN","text"],["gender","Jenis Kelamin","select:L,P"],["class_name","Kelas","text"],["grade","Tingkat","number"],["admission_year","Tahun Masuk","number"],["status","Status","select:active,graduated,transferred,inactive"]]},
  news:{label:"📰 Berita",table:"news",fields:[["title","Judul","text"],["featured_image_path","Foto Berita","file-image"],["slug","Slug","text"],["excerpt","Ringkasan","textarea"],["content","Isi Berita","textarea"],["category","Kategori","text"],["published_at","Tanggal Publikasi","datetime-local"],["status","Status","select:draft,published,archived"],["is_featured","Unggulan","checkbox"]]},
  announcements:{label:"📢 Pengumuman",table:"announcements",fields:[["title","Judul","text"],["content","Isi","textarea"],["start_date","Mulai","date"],["end_date","Berakhir","date"],["status","Status","select:draft,published,archived"],["is_important","Penting","checkbox"]]},
  gallery_albums:{label:"📸 Album Galeri",table:"gallery_albums",fields:[["title","Judul Album","text"],["slug","Slug","text"],["description","Deskripsi","textarea"],["event_date","Tanggal","date"],["is_published","Tampil Publik","checkbox"]]},
  gallery_images:{label:"🖼️ Foto Galeri",table:"gallery_images",fields:[["album_id","Album","album-select"],["image_path","Foto","file-image"],["caption","Keterangan","text"],["sort_order","Urutan","number"]]},
  achievements:{label:"⭐ Program Unggulan",table:"achievements",fields:[["title","Nama Program","text"],["image_path","Foto Program","file-image"],["category","Kategori","text"],["description","Deskripsi","textarea"],["year","Tahun","number"]]},
  curriculum_activities:{label:"📚 Kegiatan Kurikulum",table:"curriculum_activities",fields:[["title","Judul","text"],["image_path","Foto Kegiatan","file-image"],["slug","Slug","text"],["description","Deskripsi","textarea"],["content","Isi","textarea"],["activity_date","Tanggal","date"],["status","Status","select:draft,published,archived"]]},
  student_activities:{label:"👥 Kegiatan Kesiswaan",table:"student_activities",fields:[["title","Judul","text"],["image_path","Foto Kegiatan","file-image"],["slug","Slug","text"],["description","Deskripsi","textarea"],["content","Isi","textarea"],["activity_date","Tanggal","date"],["status","Status","select:draft,published,archived"]]},
  extracurriculars:{label:"⭐ Ekstrakurikuler",table:"extracurriculars",fields:[["name","Nama","text"],["description","Deskripsi","textarea"],["coach_name","Pembina","text"],["schedule","Jadwal","text"],["location","Tempat","text"],["is_active","Aktif","checkbox"],["sort_order","Urutan","number"]]},
  ppdb:{label:"📝 PPDB",table:"ppdb",fields:[["title","Judul","text"],["academic_year","Tahun Ajaran","text"],["description","Deskripsi","textarea"],["requirements","Persyaratan","textarea"],["schedule","Jadwal","textarea"],["registration_url","URL Pendaftaran","url"],["contact","Kontak","text"],["status","Status","select:draft,published,closed"]]},
  documents:{label:"📄 Dokumen",table:"documents",fields:[["title","Judul","text"],["description","Deskripsi","textarea"],["category","Kategori","text"],["file_name","Nama File","text"],["file_path","Path File","text"],["mime_type","Tipe File","text"],["is_public","Publik","checkbox"]]},
  facilities:{label:"🏢 Fasilitas",table:"facilities",fields:[["name","Nama","text"],["description","Deskripsi","textarea"],["is_active","Aktif","checkbox"],["sort_order","Urutan","number"]]},
  social_links:{label:"🌐 Media Sosial",table:"social_links",fields:[["platform","Platform","text"],["url","URL","url"],["icon","Icon","text"],["is_active","Aktif","checkbox"],["sort_order","Urutan","number"]]}
};

function toast(msg){$("toast").textContent=msg;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",3000)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function imageUrl(path){
  if(!path) return "";
  if(String(path).startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(path).replace(/^\/+/, "")}`;
}
function safeFileName(name){return String(name||"foto").toLowerCase().replace(/[^a-z0-9._-]+/g,"-").replace(/-+/g,"-");}

function fieldHtml(f,val=""){
  const [key,label,type]=f;
  if(type==="file-image"){
    const preview=val?`<div class="photo-preview"><img src="${imageUrl(val)}" alt="Foto saat ini" onerror="this.style.display='none'"><span class="muted">Foto saat ini tersimpan. Pilih file baru untuk menggantinya.</span></div>`:"";
    return `<div class="field"><label>${label}</label><input type="file" name="${key}_file" accept="image/jpeg,image/png,image/webp">${preview}<input type="hidden" name="${key}" value="${esc(val)}"><div class="muted">JPG, PNG atau WEBP. Sebaiknya foto tidak terlalu besar.</div></div>`;
  }
  if(type==="album-select") return `<div class="field"><label>${label}</label><select name="${key}" id="albumSelect"><option value="">Memuat album...</option></select></div>`;
  if(type==="textarea") return `<div class="field"><label>${label}</label><textarea name="${key}">${esc(val)}</textarea></div>`;
  if(type==="checkbox") return `<div class="field"><label><input type="checkbox" name="${key}" ${val?"checked":""}> ${label}</label></div>`;
  if(type.startsWith("select:")) return `<div class="field"><label>${label}</label><select name="${key}">${type.slice(7).split(",").map(x=>`<option value="${x}" ${String(val)===x?"selected":""}>${x}</option>`).join("")}</select></div>`;
  let v=val??""; if(type==="datetime-local" && v) v=String(v).slice(0,16);
  return `<div class="field"><label>${label}</label><input type="${type}" name="${key}" value="${esc(v)}"></div>`;
}

async function checkSession(){
  if(!configured){$("loginError").classList.remove("hidden");$("loginError").textContent="Supabase belum dikonfigurasi. Isi src/config.js terlebih dahulu.";$("loginBtn").disabled=true;return;}
  const {data:{session}}=await supabase.auth.getSession();
  if(session) await showApp(session); else $("login").style.display="grid";
}
async function showApp(session){
  const {data:p,error}=await supabase.from("profiles").select("*").eq("id",session.user.id).maybeSingle();
  if(error || !p || p.role!=="super_admin"){$("loginError").classList.remove("hidden");$("loginError").textContent="Akun ini belum memiliki role super_admin.";await supabase.auth.signOut();return;}
  role=p.role;$("login").style.display="none";$("app").style.display="block";$("userInfo").textContent=`${p.full_name||session.user.email} • ${p.role}`;
  buildMenu();render("dashboard");
}
function buildMenu(){
  menu.innerHTML=`<button class="active" data-key="dashboard">📊 Dashboard</button>`+Object.entries(modules).map(([k,v])=>`<button data-key="${k}">${v.label}</button>`).join("");
  menu.querySelectorAll("button[data-key]").forEach(b=>b.onclick=()=>render(b.dataset.key));
}
async function render(key){
  current=key;menu.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.key===key));
  $("pageTitle").textContent=key==="dashboard"?"Dashboard":modules[key].label;
  if(key==="dashboard"){await renderDashboard();return;}await renderModule(key);
}
async function renderDashboard(){
  const names=Object.entries(modules).filter(([k])=>k!=="school_settings");
  const counts=await Promise.all(names.map(async([k,m])=>{const r=await supabase.from(m.table).select("id",{count:"exact",head:true});return [k,r.count??0]}));
  content.innerHTML=`<div class="dashboard-cards">${counts.slice(0,8).map(([k,c])=>`<div class="dash-card"><b>${c}</b><span>${modules[k].label.replace(/^\S+\s/,"")}</span></div>`).join("")}</div><div class="panel" style="margin-top:20px"><h2>Selamat datang, Super Admin</h2><p class="muted">Dari dashboard ini Anda dapat mengelola konten website SMPN 5 Gegerbitung. Perubahan akan tersimpan langsung di Supabase.</p></div>`;
}
async function renderModule(key){
  const m=modules[key];const {data,error}=await supabase.from(m.table).select("*").order("created_at",{ascending:false});
  if(error){content.innerHTML=`<div class="panel"><div class="error">${esc(error.message)}</div></div>`;return;}
  content.innerHTML=`<div class="panel"><div class="actions" style="justify-content:space-between"><p class="muted">Kelola data ${m.label.toLowerCase()}.</p><button class="btn primary" id="add">+ Tambah Data</button></div><div class="table-wrap"><table class="table"><thead><tr>${m.fields.slice(0,5).map(f=>`<th>${f[1]}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>${(data||[]).map(row=>`<tr>${m.fields.slice(0,5).map(f=>`<td>${f[2]==="checkbox"?(row[f[0]]?"Ya":"Tidak"):f[2]==="file-image"?(row[f[0]]?"📷 Ada":"—"):esc(row[f[0]])}</td>`).join("")}<td><div class="actions"><button class="btn ghost small edit" data-id="${row.id}">Edit</button><button class="btn small" style="background:#fee2e2;color:#b91c1c" data-id="${row.id}" data-del="1">Hapus</button></div></td></tr>`).join("")||`<tr><td colspan="6">Belum ada data.</td></tr>`}</tbody></table></div></div>`;
  $("add").onclick=()=>openForm(key,null);
  content.querySelectorAll(".edit").forEach(b=>b.onclick=()=>openForm(key,data.find(x=>x.id===b.dataset.id)));
  content.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Hapus data ini?")){const r=await supabase.from(m.table).delete().eq("id",b.dataset.id);if(r.error)toast(r.error.message);else{toast("Data dihapus");renderModule(key)}}});
}

async function uploadPhoto(file,folder,id){
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const name=safeFileName(file.name.replace(/\.[^.]+$/,""))||"foto";
  const path=`${folder}/${id}-${Date.now()}-${name}.${ext}`;
  const upload=await supabase.storage.from("school-media").upload(path,file,{upsert:false,contentType:file.type||"image/jpeg",cacheControl:"3600"});
  if(upload.error) throw upload.error;
  return path;
}

async function populateAlbums(selected=""){
  const select=$("albumSelect");if(!select)return;
  const {data,error}=await supabase.from("gallery_albums").select("id,title,event_date").order("event_date",{ascending:false});
  if(error){select.innerHTML=`<option value="">Gagal memuat album</option>`;return;}
  select.innerHTML=`<option value="">Pilih album galeri</option>`+(data||[]).map(a=>`<option value="${esc(a.id)}" ${String(selected)===String(a.id)?"selected":""}>${esc(a.title)}${a.event_date?` — ${esc(a.event_date)}`:""}</option>`).join("");
}

function openForm(key,row){
  const m=modules[key];modalTitle.textContent=row?"Edit Data":"Tambah Data";
  modalBody.innerHTML=`<form id="form">${m.fields.map(f=>fieldHtml(f,row?.[f[0]])).join("")}<div class="actions"><button class="btn primary" id="saveBtn">Simpan</button></div></form>`;
  modal.classList.remove("hidden");
  if(key==="gallery_images")populateAlbums(row?.album_id);
  $("form").onsubmit=async e=>{
    e.preventDefault();const btn=$("saveBtn");btn.disabled=true;btn.textContent="Menyimpan...";const fd=new FormData(e.target);const payload={};
    m.fields.forEach(([k,,t])=>{if(t==="file-image")return;payload[k]=t==="checkbox"?fd.has(k):(fd.get(k)||null);});
    try{
      let savedId=row?.id;let r;
      const imageField=m.fields.find(f=>f[2]==="file-image");
      let imagePath=null;
      if(imageField){
        const [imageKey]=imageField;const file=fd.get(`${imageKey}_file`);
        if(file&&file.size){
          if(!savedId) savedId=crypto.randomUUID();
          let folder=key;
          if(key==="teachers")folder="teachers";
          else if(key==="gallery_images")folder="gallery";
          else if(key==="news")folder="news";
          else if(key==="curriculum_activities")folder="activities/curriculum";
          else if(key==="student_activities")folder="activities/student";
          else if(key==="achievements")folder="program-unggulan";
          imagePath=await uploadPhoto(file,folder,savedId);
          payload[imageKey]=imagePath;
        }
      }
      if(row) r=await supabase.from(m.table).update(payload).eq("id",row.id);
      else {payload.id=savedId||undefined;r=await supabase.from(m.table).insert(payload).select("id").single();savedId=r.data?.id||savedId;}
      if(r.error)throw r.error;
      toast("Berhasil disimpan. Foto juga sudah diunggah.");modal.classList.add("hidden");renderModule(key);
    }catch(err){toast(err.message||"Gagal menyimpan data");}
    finally{btn.disabled=false;btn.textContent="Simpan";}
  };
}

$("closeModal").onclick=()=>modal.classList.add("hidden");
$("loginBtn").onclick=async()=>{const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){$("loginError").classList.remove("hidden");$("loginError").textContent=error.message}else{const {data:{session}}=await supabase.auth.getSession();await showApp(session)}};
$("logout").onclick=async()=>{await supabase.auth.signOut();location.reload()};
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click()});
checkSession();
