/* ACADRIX Subject Resource Completeness Checker
   Reports only resources explicitly present in the subject data schema.
*/
(function () {
  'use strict';

  const DEPT_ROOTS = {
    cse: 'data/cse', ece: 'data/electronics', eee: 'data/electrical',
    it: 'data/it', civil: 'data/civil'
  };

  const RESOURCE_DEFS = [
    { key: 'units', label: 'Unit Notes', icon: '📘', isAvailable: s => Array.isArray(s.units) && s.units.some(u => u && u.notes) },
    { key: 'importantQuestions', label: 'Important Questions', icon: '🎯', isAvailable: s => typeof s.importantQuestions === 'string' && s.importantQuestions.trim() },
    { key: 'formulaSheet', label: 'Formula Sheet', icon: '📐', isAvailable: s => typeof s.formulaSheet === 'string' && s.formulaSheet.trim() },
    { key: 'solvedProblems', label: 'Solved Problems', icon: '🧮', isAvailable: s => typeof s.solvedProblems === 'string' && s.solvedProblems.trim() },
    { key: 'pyqs', label: 'PYQs', icon: '📄', isAvailable: s => Array.isArray(s.pyqs) && s.pyqs.length > 0 },
    { key: 'lastDayRevision', label: 'Last-Day Revision', icon: '⚡', isAvailable: s => typeof s.lastDayRevision === 'string' && s.lastDayRevision.trim() }
  ];

  let lastRoute = '';
  let timer = null;

  function routeInfo() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const p = raw.split('/').filter(Boolean);
    if (p[0] !== 'dept' || !p[1] || !p[2] || !p[3]) return null;
    let regulation = 'r2021', sem, code;
    if (/^r20\d+$/i.test(p[2])) { regulation = p[2].toLowerCase(); sem = Number((p[3] || '').replace(/^sem/i, '')); code = p[4]; }
    else { sem = Number((p[2] || '').replace(/^sem/i, '')); code = p[3]; }
    if (!Number.isInteger(sem) || sem < 1 || sem > 8 || !code) return null;
    return { dept: p[1].toLowerCase(), regulation, sem, code: decodeURIComponent(code).toUpperCase() };
  }

  function dataPath(r) {
    if (r.dept === 'mech') {
      const root = r.regulation === 'r2025' ? 'data/mechanical/r2025' : 'data/mechanical';
      return `${root}/sem${r.sem}.json`;
    }
    if (r.regulation !== 'r2021' || !DEPT_ROOTS[r.dept]) return null;
    return `${DEPT_ROOTS[r.dept]}/sem${r.sem}.json`;
  }

  async function loadSubject(r) {
    const path = dataPath(r);
    if (!path) return null;
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.subjects) ? data.subjects : []);
      return list.find(s => String(s.code || '').toUpperCase() === r.code) || null;
    } catch (_) { return null; }
  }

  function resourceHref(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim();
  }

  function render(subject, route) {
    const app = document.getElementById('app');
    if (!app || !subject) return;
    const old = document.getElementById('acadrx-resource-completeness');
    if (old) old.remove();

    const states = RESOURCE_DEFS.map(def => ({ ...def, available: Boolean(def.isAvailable(subject)) }));
    const available = states.filter(x => x.available).length;
    const total = states.length;
    const panel = document.createElement('section');
    panel.id = 'acadrx-resource-completeness';
    panel.className = 'resource-completeness card';
    panel.setAttribute('aria-labelledby', 'resource-completeness-title');

    const regulationLabel = route.regulation === 'r2025' ? 'R-2025' : 'R-2021';
    panel.innerHTML = `
      <div class="resource-completeness-head">
        <div>
          <span class="resource-completeness-kicker">RESOURCE COVERAGE</span>
          <h2 id="resource-completeness-title">Study Resources</h2>
          <p>Coverage check for ${escapeHtml(subject.code)} · ${regulationLabel}. Missing items are shown as not added yet — no placeholder links are created.</p>
        </div>
        <div class="resource-completeness-score" aria-label="${available} of ${total} resource groups available"><strong>${available}/${total}</strong><span>available</span></div>
      </div>
      <div class="resource-completeness-grid">
        ${states.map(item => {
          const href = item.key === 'units' ? '' : resourceHref(subject[item.key]);
          const cls = item.available ? 'is-available' : 'is-missing';
          const status = item.available ? 'Available' : 'Not added yet';
          const action = item.key === 'units'
            ? (item.available ? 'Open unit notes from the tabs above' : 'No unit note links in data')
            : (href ? `<a href="${escapeAttr(href)}">Open resource →</a>` : '');
          return `<article class="resource-check-item ${cls}"><div class="resource-check-icon" aria-hidden="true">${item.icon}</div><div class="resource-check-main"><strong>${item.label}</strong><span>${status}</span>${action ? `<small>${action}</small>` : ''}</div><b class="resource-check-mark" aria-hidden="true">${item.available ? '✓' : '—'}</b></article>`;
        }).join('')}
      </div>
    `;

    const header = app.querySelector('.subject-header');
    const tabs = app.querySelector('.subject-tabs');
    const anchor = tabs || header;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    else app.prepend(panel);
  }

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

  async function refresh() {
    const route = routeInfo();
    if (!route) {
      const old = document.getElementById('acadrx-resource-completeness');
      if (old) old.remove();
      return;
    }
    const key = `${route.dept}/${route.regulation}/${route.sem}/${route.code}`;
    if (key === lastRoute && document.getElementById('acadrx-resource-completeness')) return;
    lastRoute = key;
    const subject = await loadSubject(route);
    if (subject && routeInfo() && `${routeInfo().dept}/${routeInfo().regulation}/${routeInfo().sem}/${routeInfo().code}` === key) render(subject, route);
  }

  function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 80); }
  window.addEventListener('hashchange', () => { lastRoute = ''; schedule(); });
  const app = document.getElementById('app');
  if (app) new MutationObserver(schedule).observe(app, { childList: true, subtree: true });
  schedule();
})();
