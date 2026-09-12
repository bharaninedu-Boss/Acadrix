/* ACADRIX PDF-first resource layer
   PDFs live in GitHub. Category folders keep Notes, PYQs, Important Questions and Syllabus separate.
   Upload to: data/pdfs/<department>/<regulation>/sem<semester>/<subject-code>/<category>/
*/
(function(){
  const API='https://api.github.com/repos/bharaninedu-Boss/Acadrix/contents/';
  const SITE='https://bharaninedu-boss.github.io/Acadrix/';
  const previous=window.renderSubjectDetails;
  if(typeof previous!=='function') return;

  const CATEGORIES=[
    {id:'notes',icon:'📖',title:'Notes / Study Materials',help:'Unit notes, full notes, reference materials and study PDFs.'},
    {id:'pyq',icon:'📝',title:'Previous Year Question Papers (PYQ)',help:'University examination papers, arranged separately from notes.'},
    {id:'important-questions',icon:'⭐',title:'Important Questions',help:'Important-question and exam-focused PDF collections.'},
    {id:'syllabus',icon:'📋',title:'Syllabus',help:'Official syllabus and curriculum PDFs.'}
  ];

  function esc(s){return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function pretty(name){return name.replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());}
  function pdfUrl(path){return SITE+path.split('/').map(encodeURIComponent).join('/');}
  async function getFiles(path){
    try{const r=await fetch(API+path+'?ref=main',{cache:'no-store'});if(!r.ok)return[];const d=await r.json();return Array.isArray(d)?d.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name)):[];}catch(e){return[];}
  }
  function routeState(code){
    const p=location.hash.match(/^#\/dept\/([^/]+)\/([^/]+)\/sem(\d+)\/([^/?#]+)/i);
    return {dept:p?p[1]:'',regulation:p?p[2]:'',sem:p?Number(p[3]):1,subjectCode:code|| (p?decodeURIComponent(p[4]):'')};
  }
  async function renderCategory(cat,folder){
    const files=await getFiles(`${folder}/${cat.id}`);
    const cards=files.sort((a,b)=>a.name.localeCompare(b.name)).map(f=>{const href=pdfUrl(f.path);return `<article class="pdf-library-card"><div class="pdf-icon">📄</div><strong>${esc(pretty(f.name))}</strong><p class="pdf-muted">PDF • ${(f.size/1024/1024).toFixed(2)} MB</p><div class="pdf-actions"><a class="pdf-open" href="${href}" target="_blank" rel="noopener">Open PDF →</a><a href="${href}" download>Download</a></div></article>`;}).join('');
    return `<section class="pdf-category"><div class="pdf-category-head"><div><h3>${cat.icon} ${cat.title}</h3><p class="pdf-muted">${cat.help}</p></div><code>${esc(folder+'/'+cat.id)}/</code></div><div class="pdf-library-grid">${cards||`<div class="pdf-library-card empty"><strong>No PDFs uploaded yet.</strong><p class="pdf-muted">Upload PDFs to the folder shown above. They will appear automatically after GitHub Pages updates.</p></div>`}</div></section>`;
  }
  async function mount(container,code){
    const s=routeState(code);
    if(s.dept!=='mech'||!/^r202[15]$/i.test(String(s.regulation))||!s.subjectCode)return;
    const folder=`data/pdfs/mechanical/${s.regulation.toLowerCase()}/sem${s.sem}/${s.subjectCode}`;
    let host=document.getElementById('acadrxPdfLibrary');if(!host){host=document.createElement('section');host.id='acadrxPdfLibrary';container.appendChild(host);}
    host.innerHTML=`<h2>📚 PDF Study Library</h2><div class="pdf-library-note"><strong>PDF-first system:</strong> Notes, PYQs, Important Questions and Syllabus are stored in separate folders. Upload a PDF directly to the correct GitHub category — no JSON editing and no PDF-to-text processing.</div><div id="pdfCategories">Loading PDF categories…</div>`;
    const target=host.querySelector('#pdfCategories');
    const html=await Promise.all(CATEGORIES.map(c=>renderCategory(c,folder)));
    target.innerHTML=html.join('');
  }
  window.renderSubjectDetails=async function(container,code){
    await previous.apply(this,arguments);
    await mount(container,code);
  };
})();
