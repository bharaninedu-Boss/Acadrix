/* ACADRIX R-2025 subject-card navigation fix
   Keeps subject cards reliable on mobile browsers and touch screens.
*/
(function(){
  function install(){
    document.addEventListener('click',function(e){
      const card=e.target.closest('#subjectsGrid a.card');
      if(!card) return;
      const href=card.getAttribute('href');
      if(!href || href.indexOf('#/dept/mech/r2025/')!==0) return;
      e.preventDefault();
      if(location.hash!==href.slice(1)) location.hash=href.slice(1);
      else handleHashRoute();
    },true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
