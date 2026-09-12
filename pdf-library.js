/* ACADRIX PDF-first resource layer
   PDFs live in GitHub. No PDF text is embedded in JSON and no AI/token processing is required.
   Upload a PDF to: data/pdfs/<department>/<regulation>/<semester>/<subject-code>/
   The subject dashboard discovers PDFs automatically through the public GitHub Contents API.
*/
(function(){
  const API='https://api.github.com/repos/bharaninedu-Boss/Acadrix/contents/';
  const SITE='https://bharaninedu-boss.github.io/Acadrix/';
  const previous=window.renderSubjectDetails;
  if(typeof previous!=='function') return;

  function esc(s){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function pretty(name){return name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());}
  function pdfUrl(path){return SITE+path.split('/').map(encodeURIComponent).join('/');}
  async function getFiles(path){
    try{const r=await fetch(API+path+'?ref=main',{cache:'no-store'});if(!r.ok)return[];const d=await r.json();return Array.isArray(d)?d.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name)):[];}catch(e){return[];}
  }
  async function mount(container){
    const s=window.currentState||{}; if(s.dept!=='mech'||!/^r202[15]$/.test(String(s.regulation||'')))return;
    const code=String(s.subjectCode||'').trim()||String(arguments[1]||'').trim(); if(!code)return;
    const reg=s.regulation, sem=Number(s.sem||1);
    const folder=`data/pdfs/mechanical/${reg}/sem${sem}/${code}`;
    let host=document.getElementById('acadrxPdfLibrary'); if(!host){host=document.createElement('section');host.id='acadrxPdfLibrary';container.appendChild(host);}
    host.innerHTML=`<h2>📚 PDF Study Library</h2><div class="pdf-library-note">Upload PDFs directly to the GitHub folder for this subject. ACADRIX detects them automatically — no JSON editing and no PDF-to-text processing.</div><div class="pdf-library-grid"><div class="pdf-library-card">Loading PDFs from GitHub…</div></div>`;
    const files=await getFiles(folder); const grid=host.querySelector('.pdf-library-grid');
    if(!files.length){grid.innerHTML=`<div class="pdf-library-card"><strong>No PDFs uploaded yet.</strong><p>GitHub folder:</p><code>${esc(folder)}/</code><p class="pdf-muted">Once you upload a PDF there, it will appear here automatically after GitHub Pages updates.</p></div>`;return;}
    grid.innerHTML=files.sort((a,b)=>a.name.localeCompare(b.name)).map(f=>{const path=f.path;const href=pdfUrl(path);return `<article class="pdf-library-card"><div class="pdf-icon">📄</div><strong>${esc(pretty(f.name))}</strong><p class="pdf-muted">PDF • ${(f.size/1024/1024).toFixed(2)} MB</p><div class="pdf-actions"><a class="pdf-open" href="${href}" target="_blank" rel="noopener">Open PDF →</a><a href="${href}" download>Download</a></div></article>`;}).join('');
  }
  window.renderSubjectDetails=async function(container,code){
    await previous.apply(this,arguments);
    window.currentState=window.currentState||{};
    window.currentState.subjectCode=code;
    await mount(container);
  };
})();
