/* ACADRIX subject-page navigation — turns long subject pages into a quick study dashboard. */
(function () {
  'use strict';

  let enhanced = false;

  function enhanceSubjectPage() {
    if (enhanced) return;
    const header = document.querySelector('.subject-header');
    if (!header) return;

    const sections = Array.from(document.querySelectorAll('main .resource-section'));
    if (!sections.length) return;

    enhanced = true;
    const nav = document.createElement('div');
    nav.className = 'subject-tabs';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Subject resources');

    const makeTab = (label, target, active) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'subject-tab' + (active ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelectorAll('.subject-tab').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
      return b;
    };

    nav.appendChild(makeTab('📚 Units', 'acadrx-units', true));
    nav.appendChild(makeTab('📝 PYQs', 'acadrx-pyqs', false));
    nav.appendChild(makeTab('🎯 Exam Prep', 'acadrx-exam', false));
    nav.appendChild(makeTab('🎥 Videos', 'acadrx-videos', false));
    header.after(nav);

    const unitSection = document.querySelector('.resource-section');
    if (unitSection) unitSection.id = 'acadrx-units';

    const headings = Array.from(document.querySelectorAll('main .resource-section h3'));
    headings.forEach(h => {
      const text = h.textContent || '';
      if (text.includes('PREVIOUS YEAR')) h.closest('.resource-section').id = 'acadrx-pyqs';
      if (text.includes('EXAM PREPARATION')) h.closest('.resource-section').id = 'acadrx-exam';
      if (text.includes('RECOMMENDED VIDEOS')) h.closest('.resource-section').id = 'acadrx-videos';
    });

    // Add a compact "study path" strip above the units.
    const path = document.createElement('div');
    path.className = 'study-path';
    path.innerHTML = '<span>1. Learn</span><b>→</b><span>2. Practice</span><b>→</b><span>3. Verify</span><b>→</b><span>4. Revise</span>';
    nav.after(path);

    // Scroll-spy for the resource tabs.
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      const map = { 'acadrx-units': '📚 Units', 'acadrx-pyqs': '📝 PYQs', 'acadrx-exam': '🎯 Exam Prep', 'acadrx-videos': '🎥 Videos' };
      document.querySelectorAll('.subject-tab').forEach(b => b.classList.toggle('active', b.textContent === map[id]));
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.05, 0.2, 0.5] });
    ['acadrx-units','acadrx-pyqs','acadrx-exam','acadrx-videos'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  const observer = new MutationObserver(enhanceSubjectPage);
  observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  enhanceSubjectPage();
})();
