/* ACADRIX — regulation-aware search enhancement
   Keeps the existing search UI but adds R-2025 awareness and richer metadata.
*/
(function () {
  'use strict';

  const originalHandleSearch = window.handleSearch;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function buildUnifiedIndex() {
    const index = [];
    const departments = Array.isArray(window.ACADRIX_DEPARTMENTS) ? window.ACADRIX_DEPARTMENTS : [
      { id:'mech', name:'Mechanical Engineering', folder:'mechanical' },
      { id:'cse', name:'Computer Science', folder:'cse' },
      { id:'ece', name:'Electronics & Communication', folder:'electronics' },
      { id:'eee', name:'Electrical & Electronics', folder:'electrical' },
      { id:'it', name:'Information Technology', folder:'it' },
      { id:'civil', name:'Civil Engineering', folder:'civil' }
    ];

    for (const dept of departments) {
      for (let sem = 1; sem <= 8; sem++) {
        let json;
        try {
          const path = dept.id === 'mech' ? `data/mechanical/sem${sem}.json` : `data/${dept.folder}/sem${sem}.json`;
          const res = await fetch(path);
          if (!res.ok) continue;
          json = await res.json();
        } catch (_) { continue; }
        const subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
        subjects.forEach(s => index.push(normalizeSubject(s, dept, sem, 'r2021')));
      }
    }

    // R-2025 Mechanical Engineering is intentionally indexed separately.
    for (let sem = 1; sem <= 8; sem++) {
      try {
        const res = await fetch(`data/mechanical/r2025/sem${sem}.json`);
        if (!res.ok) continue;
        const json = await res.json();
        const subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
        subjects.forEach(s => index.push(normalizeSubject(s, {id:'mech',name:'Mechanical Engineering'}, sem, 'r2025')));
      } catch (_) {}
    }
    return index;
  }

  function normalizeSubject(s, dept, sem, regulation) {
    const units = Array.isArray(s.units) ? s.units : [];
    const unitTopics = units.flatMap((u, i) => {
      if (typeof u === 'string') return [{ title:u, index:i }];
      return [{ title:u.name || u.title || `Unit ${i+1}`, index:i }];
    });
    return {
      code: s.code || '', name: s.name || '', dept: dept.id, deptName: dept.name,
      sem, regulation, units, unitTopics,
      resource: s.resource || '', importantQuestions: s.importantQuestions || '',
      formulaSheet: s.formulaSheet || '', solvedProblems: s.solvedProblems || ''
    };
  }

  async function enhancedSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return originalHandleSearch && originalHandleSearch();
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.style.display = 'none'; return; }

    const index = await buildUnifiedIndex();
    const scored = [];
    index.forEach(item => {
      const fields = [item.code, item.name, item.deptName, item.regulation, `semester ${item.sem}`, ...item.unitTopics.map(u => u.title)];
      let score = 0;
      fields.forEach((field, i) => {
        const text = String(field).toLowerCase();
        if (!text.includes(q)) return;
        score += i === 0 ? 100 : i === 1 ? 80 : i < 4 ? 35 : 50;
      });
      if (score) scored.push({item, score});
    });
    scored.sort((a,b) => b.score - a.score);
    const unique = [];
    const seen = new Set();
    scored.forEach(x => {
      const key = `${x.item.regulation}|${x.item.dept}|${x.item.sem}|${x.item.code}`;
      if (!seen.has(key) && unique.length < 12) { seen.add(key); unique.push(x.item); }
    });

    if (!unique.length) {
      results.innerHTML = '<div class="search-item"><strong>No results found</strong><br><small>Try a subject code, subject name, unit topic, regulation or semester.</small></div>';
    } else {
      results.innerHTML = unique.map(s => {
        const route = `#/dept/${s.dept}/${s.regulation}/sem${s.sem}/${encodeURIComponent(s.code)}`;
        return `<a class="search-item" href="${route}" role="option"><strong>${escapeHtml(s.code || s.name)}</strong><br><small>${escapeHtml(s.name)} · ${escapeHtml(s.regulation.toUpperCase())} · Semester ${s.sem}</small></a>`;
      }).join('');
    }
    results.style.display = 'block';
  }

  window.handleSearch = enhancedSearch;
})();
