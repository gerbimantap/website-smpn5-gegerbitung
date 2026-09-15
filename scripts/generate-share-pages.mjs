import fs from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = 'https://gerbimantap.github.io/website-smpn5-gegerbitung';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('SUPABASE_URL/SUPABASE_ANON_KEY belum tersedia');

const headers = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const strip = (v='') => String(v).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const slugify = (v='') => String(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100);
const imageUrl = p => !p ? `${SITE_URL}/logo%20sekolah.jpeg` : /^https?:\/\//i.test(p) ? p : `${SUPABASE_URL}/storage/v1/object/public/school-media/${String(p).replace(/^\/+/, '')}`;
const contentHtml = v => String(v||'').trim().replace(/\r?\n/g,'<br>');

async function getRows(table, select) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&status=eq.published&order=created_at.desc&limit=500`;
  const r = await fetch(url, {headers});
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

function page({title, description, image, url, date, category, content, kind}) {
  const safeTitle=esc(title), safeDesc=esc(strip(description||content).slice(0,220)), safeImage=esc(image), safeUrl=esc(url);
  const dateText=date?new Date(date).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle} | SMPN 5 Gegerbitung</title><meta name="description" content="${safeDesc}"><meta name="robots" content="index,follow"><link rel="canonical" href="${safeUrl}"><meta property="og:type" content="article"><meta property="og:locale" content="id_ID"><meta property="og:site_name" content="SMPN 5 Gegerbitung"><meta property="og:title" content="${safeTitle}"><meta property="og:description" content="${safeDesc}"><meta property="og:url" content="${safeUrl}"><meta property="og:image" content="${safeImage}"><meta property="og:image:alt" content="${safeTitle}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}"><meta name="twitter:description" content="${safeDesc}"><meta name="twitter:image" content="${safeImage}"><style>body{margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}.wrap{width:min(860px,92%);margin:35px auto 60px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)}.hero{width:100%;max-height:470px;object-fit:cover;display:block}.body{padding:32px}.tag{display:inline-block;background:#e0f2fe;color:#0369a1;padding:7px 10px;border-radius:999px;font-size:12px;font-weight:800}.date{color:#64748b;font-size:13px;margin:12px 0}.title{font-size:clamp(28px,5vw,44px);line-height:1.15;margin:10px 0 18px}.content{font-size:16px;line-height:1.9;color:#334155}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:800;border:0;cursor:pointer}.primary{background:#0284c7;color:#fff}.soft{background:#e0f2fe;color:#075985}.brand{margin:0 0 16px;font-size:14px;font-weight:800;color:#075985}.back{display:inline-block;margin-top:20px;color:#0369a1;font-weight:700}@media(max-width:560px){.body{padding:22px}.hero{max-height:300px}}</style></head><body><main class="wrap"><p class="brand">SMPN 5 Gegerbitung • ${kind}</p><article class="card"><img class="hero" src="${safeImage}" alt="${safeTitle}" onerror="this.src='${SITE_URL}/logo%20sekolah.jpeg'"><div class="body"><span class="tag">${esc(category||kind)}</span><h1 class="title">${safeTitle}</h1>${dateText?`<div class="date">${esc(dateText)}</div>`:''}<div class="content">${contentHtml(content||description||'Informasi sekolah.')}</div><div class="actions"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(title+'\n'+url)}" target="_blank" rel="noopener">Bagikan ke WhatsApp</a><button class="btn soft" type="button" onclick="navigator.clipboard?.writeText(location.href).then(()=>this.textContent='Link tersalin ✓')">Salin Link</button></div><a class="back" href="${SITE_URL}/">← Kembali ke Website SMPN 5 Gegerbitung</a></div></article></main></body></html>`;
}

async function main(){
  const [news, cur, stu] = await Promise.all([
    getRows('news','id,title,slug,excerpt,content,featured_image_path,category,published_at,created_at'),
    getRows('curriculum_activities','id,title,slug,description,content,image_path,activity_date,created_at'),
    getRows('student_activities','id,title,slug,description,content,image_path,activity_date,created_at')
  ]);
  const root='share';
  await fs.rm(root,{recursive:true,force:true});
  await fs.mkdir(root,{recursive:true});
  let count=0;
  for(const item of news){const slug=slugify(item.slug||item.title)||item.id;const url=`${SITE_URL}/share/berita/${slug}/`;const dir=path.join(root,'berita',slug);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),page({title:item.title,description:item.excerpt,image:imageUrl(item.featured_image_path),url,date:item.published_at||item.created_at,category:item.category||'Berita',content:item.content||item.excerpt,kind:'Berita'}));count++;}
  for(const [rows,type,label] of [[cur,'kurikulum','Kegiatan Kurikulum'],[stu,'kesiswaan','Kegiatan Kesiswaan']]) for(const item of rows){const slug=slugify(item.slug||item.title)||item.id;const url=`${SITE_URL}/share/kegiatan/${type}/${slug}/`;const dir=path.join(root,'kegiatan',type,slug);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),page({title:item.title,description:item.description,image:imageUrl(item.image_path),url,date:item.activity_date||item.created_at,category:label,content:item.content||item.description,kind:label}));count++;}
  await fs.writeFile(path.join(root,'README.txt'),`Generated ${count} share pages from Supabase. Do not edit manually.\n`);
  console.log(`Generated ${count} share pages.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
