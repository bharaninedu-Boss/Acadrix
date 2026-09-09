/* ACADRIX — Exam Mode: evidence labels and 2M + 12M preparation guidance. */
(function(){
'use strict';
function enhance(){
 const app=document.getElementById('app'); if(!app||!currentState?.subjectCode)return;
 const pyq=document.getElementById('acadrx-pyqs');
 if(pyq&&!pyq.querySelector('.evidence-legend')){
  const legend=document.createElement('div');legend.className='evidence-legend';
  legend.innerHTML='<strong>Evidence labels</strong><span class="evidence verified">✓ VERIFIED PYQ</span><span class="evidence practice">✦ ACADRIX PRACTICE</span><small>Only questions explicitly identified as previous-year papers are treated as PYQs. Practice questions are study material, not university PYQs.</small>';
  pyq.insertBefore(legend,pyq.firstChild);
 }
 const exam=document.getElementById('acadrx-exam');
 if(exam&&!exam.querySelector('.exam-mode-banner')){
  const banner=document.createElement('div');banner.className='exam-mode-banner';
  banner.innerHTML='<strong>🎯 Exam Mode</strong><div class="exam-mode-grid"><span><b>2-Mark</b><small>Definitions, formulas, facts and short concepts</small></span><span><b>12-Mark</b><small>Full explanation, diagram, formula/derivation, working and conclusion</small></span></div><p>ACADRIX uses 2-mark + 12-mark preparation as a study format. Where an official paper uses a different mark value, the original paper evidence remains unchanged.</p>';
  exam.insertBefore(banner,exam.firstChild);
 }
}
new MutationObserver(enhance).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
enhance();
})();
