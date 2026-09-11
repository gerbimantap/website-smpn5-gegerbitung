/* SMPN 5 Gegerbitung - Full Screen Page Transition */
(() => {
  const allowed = new Set(['profil','guru-tendik','berita','kegiatan','program-unggulan','galeri','ppdb']);
  let layer = null;
  let previousHash = '';
  let previousScroll = 0;
  let closing = false;

  const css = `
    #sp5-page-layer{position:fixed;inset:0;background:#f8fafc;z-index:10050;transform:translateY(105%);opacity:0;visibility:hidden;transition:transform .48s cubic-bezier(.22,.61,.36,1),opacity .28s ease;overflow:auto;overscroll-behavior:contain}
    #sp5-page-layer.open{transform:translateY(0);opacity:1;visibility:visible}
    #sp5-page-layer .sp5-page-bar{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-bottom:1px solid #e2e8f0;box-shadow:0 4px 18px rgba(15,23,42,.06)}
    #sp5-page-layer .sp5-page-bar-inner{width:min(1120px,92%);min-height:70px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
    #sp5-page-layer .sp5-page-brand{display:flex;align-items:center;gap:10px;font-weight:800;color:#0f172a}
    #sp5-page-layer .sp5-page-brand img{width:42px;height:42px;object-fit:contain}
    #sp5-page-layer .sp5-page-brand small{display:block;color:#64748b;font-size:10px;font-weight:600;margin-top:2px}
    #sp5-page-layer .sp5-back{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:12px;background:#e0f2fe;color:#0369a1;padding:11px 15px;font:700 14px Inter,system-ui,sans-serif;cursor:pointer}
    #sp5-page-layer .sp5-back:hover{background:#bae6fd}
    #sp5-page-layer .sp5-page-content{width:min(1120px,92%);margin:0 auto;padding:8px 0 70px}
    #sp5-page-layer .sp5-page-content>section{display:block;padding-top:58px}
    #sp5-page-layer .sp5-page-content>section:first-child{padding-top:40px}
    #sp5-page-layer .sp5-page-content .container{width:100%}
    #sp5-page-layer .sp5-page-content .hero{min-height:0}
    #sp5-page-layer .sp5-page-content footer{margin-top:20px}
    body.sp5-lock{overflow:hidden}
    @media(max-width:560px){#sp5-page-layer .sp5-page-bar-inner{min-height:62px}#sp5-page-layer .sp5-page-brand strong{font-size:14px}#sp5-page-layer .sp5-page-brand small{font-size:9px}#sp5-page-layer .sp5-back{padding:9px 12px;font-size:13px}}
  `;

  function setup(){
    if(document.getElementById('sp5-page-style')) return;
    const style=document.createElement('style');
    style.id='sp5-page-style';
    style.textContent=css;
    document.head.appendChild(style);

    layer=document.createElement('div');
    layer.id='sp5-page-layer';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`
      <div class="sp5-page-bar">
        <div class="sp5-page-bar-inner">
          <div class="sp5-page-brand"><img src="./logo%20sekolah.jpeg" alt="Logo SMPN 5 Gegerbitung"><div><strong>SMPN 5 Gegerbitung</strong><small>Halaman Informasi Sekolah</small></div></div>
          <button class="sp5-back" type="button" aria-label="Kembali ke halaman utama">← Kembali</button>
        </div>
      </div>
      <div class="sp5-page-content"></div>`;
    document.body.appendChild(layer);
    layer.querySelector('.sp5-back').addEventListener('click', closePage);
    layer.addEventListener('click', handleLayerClick);
  }

  function titleFor(section){
    return section.querySelector('h2')?.textContent?.trim() || section.id.replaceAll('-',' ');
  }

  function openPage(id, push=true){
    const target=document.getElementById(id);
    if(!target || !allowed.has(id)) return false;
    setup();
    if(layer.classList.contains('open') && layer.dataset.id===id) return true;
    previousScroll=window.scrollY;
    previousHash=location.hash;
    const content=layer.querySelector('.sp5-page-content');
    const clone=target.cloneNode(true);
    clone.removeAttribute('id');
    content.innerHTML='';
    content.appendChild(clone);
    layer.dataset.id=id;
    layer.querySelector('.sp5-page-brand small').textContent=titleFor(target);
    document.body.classList.add('sp5-lock');
    layer.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>layer.classList.add('open'));
    if(push){ history.pushState({sp5Page:id},'',`#${id}`); }
    layer.scrollTop=0;
    return true;
  }

  function closePage(fromPop=false){
    if(!layer || !layer.classList.contains('open') || closing) return;
    closing=true;
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden','true');
    setTimeout(()=>{
      document.body.classList.remove('sp5-lock');
      closing=false;
      if(!fromPop){
        history.pushState({},'',previousHash || location.pathname);
      }
      window.scrollTo({top:previousScroll,behavior:'instant'});
      layer.querySelector('.sp5-page-content').innerHTML='';
    },480);
  }

  function handleLayerClick(e){
    const back=e.target.closest('.sp5-back');
    if(back) return;
    const teacher=e.target.closest('[data-teacher-id]');
    if(teacher){
      const original=document.querySelector(`[data-teacher-id="${CSS.escape(teacher.dataset.teacherId)}"]`);
      if(original && original!==teacher){original.click();}
      return;
    }
    const news=e.target.closest('[data-news-index]');
    if(news){
      const original=document.querySelector(`[data-news-index="${CSS.escape(news.dataset.newsIndex)}"]`);
      if(original && original!==news){original.click();}
      return;
    }
    const gallery=e.target.closest('.gallery-read-button');
    if(gallery){
      const index=gallery.dataset.galleryIndex;
      const original=document.querySelector(`.gallery-read-button[data-gallery-index="${CSS.escape(index)}"]`);
      if(original && original!==gallery){original.click();}
    }
  }

  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href]');
    if(!link || link.target==='_blank' || link.hasAttribute('download')) return;
    const raw=link.getAttribute('href');
    if(!raw || !raw.startsWith('#')) return;
    const id=raw.slice(1);
    if(!allowed.has(id)) return;
    e.preventDefault();
    e.stopPropagation();
    openPage(id,true);
  },true);

  window.addEventListener('popstate',()=>{
    if(layer?.classList.contains('open')) closePage(true);
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && layer?.classList.contains('open')){
      e.preventDefault();
      closePage();
    }
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
