/* ACADRIX PYQ Explorer
   Search/filter previous-year papers from the subject's semester JSON.
*/
(function () {
  'use strict';

  async function init() {
    const details = document.querySelector('.subject-header');
    if (!details) return;

    const headerText = details.textContent || '';
    const codeMatch = headerText.match(/[A-Z]{2}\d{4}/i);
    if (!codeMatch) return;
    const code = codeMatch[0].toUpperCase();

    const section = document.getElementById('acadrx-pyqs');
    if (!section || section.dataset.explorerReady === '1') return;

    // The current subject renderer does not expose its object globally,
    // so load the semester data directly. This also works on direct links.
    let pyqs = [];
    try {
      const res = await fetch('data/mechanical/sem5.json');
      if (res.ok) {
        const json = await res.json();
        const subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
        const subject = subjects.find(s => String(s.code || '').toUpperCase() === code);
        if (subject && Array.isArray(subject.pyqs)) pyqs = subject.pyqs;
      }
    } catch (e) {
      console.warn('ACADRIX PYQ Explorer could not load PYQ data.', e);
    }

    if (!pyqs.length) return;
    section.dataset.explorerReady = '1';

    const wrapper = document.createElement('div');
    wrapper.className = 'pyq-explorer';
    wrapper.innerHTML = `
      <div class="pyq-toolbar">
        <input id="pyqSearch" type="search" placeholder="Search year, session or topic..." aria-label="Search previous year questions">
        <select id="pyqYear" aria-label="Filter by year"><option value="">All years</option></select>
        <select id="pyqSession" aria-label="Filter by session"><option value="">All sessions</option></select>
      </div>
      <div id="pyqCount" class="pyq-count"></div>
      <div id="pyqList" class="pyq-list"></div>
    `;
    section.appendChild(wrapper);

    const year = wrapper.querySelector('#pyqYear');
    const session = wrapper.querySelector('#pyqSession');
    const search = wrapper.querySelector('#pyqSearch');
    const years = [...new Set(pyqs.map(p => p.year).filter(Boolean))].sort((a, b) => String(b).localeCompare(String(a)));
    const sessions = [...new Set(pyqs.map(p => p.session).filter(Boolean))].sort();
    years.forEach(v => year.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
    sessions.forEach(v => session.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));

    function render() {
      const q = search.value.trim().toLowerCase();
      const filtered = pyqs.filter(p => {
        const hay = `${p.year || ''} ${p.session || ''} ${p.topic || ''} ${p.title || ''}`.toLowerCase();
        return (!q || hay.includes(q)) && (!year.value || String(p.year) === year.value) && (!session.value || p.session === session.value);
      });
      wrapper.querySelector('#pyqCount').textContent = `${filtered.length} paper${filtered.length === 1 ? '' : 's'} found`;
      const list = wrapper.querySelector('#pyqList');
      if (!filtered.length) {
        list.innerHTML = '<div class="pyq-empty">No matching question papers.</div>';
        return;
      }
      list.innerHTML = filtered.map(p => `
        <article class="pyq-card">
          <div><strong>${escapeHtml(p.year || 'Year')}</strong><span>${escapeHtml(p.session || '')}</span>${p.topic ? `<small>${escapeHtml(p.topic)}</small>` : ''}</div>
          ${p.link && p.link !== '#' ? `<a class="download-btn" href="${escapeAttr(p.link)}" target="_blank" rel="noopener">Open PDF ↗</a>` : ''}
        </article>`).join('');
    }

    search.addEventListener('input', render);
    year.addEventListener('change', render);
    session.addEventListener('change', render);
    render();
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  function escapeAttr(v) { return escapeHtml(v).replace(/`/g, '&#96;'); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
