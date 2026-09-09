/* ACADRIX — Study Mode: local unit completion progress. */
(function(){
'use strict';
const KEY='acadrix-study-progress-v1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return {}}}
function write(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){} }
function subjectKey(){return [currentState?.dept,currentState?.regulation||'r2021',currentState?.sem,currentState?.subjectCode].join('|')}
function enhance(){
 const app=document.getElementById('app'); if(!app||!currentState?.subjectCode)return;
 const hero=app.querySelector('.hero'); if(!hero)return;
 let panel=document.getElementById('studyModePanel');
 if(!panel){panel=document.createElement('section');panel.id='studyModePanel';panel.className='study-mode-panel';hero.after(panel);}
 const cards=Array.from(app.querySelectorAll('.card')).filter(c=>/^\s*Unit\s*\d+/i.test(c.textContent||'')&&!c.querySelector('.study-complete-btn'));
 cards.forEach((c,i)=>c.dataset.studyUnit=String(i+1));
 const units=Array.from(app.querySelectorAll('[data-study-unit]')), data=read(), done=new Set(data[subjectKey()]||[]), completed=units.filter(c=>done.has(c.dataset.studyUnit)).length, pct=units.length?Math.round(completed/units.length*100):0;
 panel.innerHTML=`<div class="study-mode-header"><div><strong>Study Mode</strong><small> Learn → Practice → Verify → Revise</small></div><span>${completed}/${units.length} units · ${pct}%</span></div><div class="study-progress-bar"><span style="width:${pct}%"></span></div>`;
 units.forEach(card=>{const id=card.dataset.studyUnit,b=document.createElement('button');b.type='button';b.className='study-complete-btn';b.textContent=done.has(id)?'✓ Completed':'Mark unit complete';b.setAttribute('aria-pressed',done.has(id));b.onclick=()=>{const next=read(),set=new Set(next[subjectKey()]||[]);set.has(id)?set.delete(id):set.add(id);next[subjectKey()]=[...set];write(next);enhance();};card.appendChild(b);});
}
new MutationObserver(enhance).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
enhance();
})();
