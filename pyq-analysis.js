/* ACADRIX PYQ Analysis
   Evidence-based exam intelligence for subjects with verified PYQ coverage.
   Never treats practice questions or predictions as university PYQs.
*/
(function () {
  'use strict';

  const ANALYSIS = {
    ME3591: {
      title: 'ME3591 Exam Intelligence',
      note: 'Based only on the three papers currently listed in sem5.json: Apr/May 2024, Nov/Dec 2024 and Nov/Dec 2023. This is a revision guide, not a prediction of the next paper.',
      papers: 3,
      patterns: [
        ['Shafts & shaft design', '3/3 papers', 'Very High', 2],
        ['Couplings', '3/3 papers', 'Very High', 3],
        ['Springs', '3/3 papers', 'Very High', 4],
        ['Bearings / hydrodynamic bearings', '3/3 papers', 'Very High', 5],
        ['Joints: welded / riveted / cotter / knuckle', '3/3 papers', 'Very High', 3],
        ['Flywheels', '3/3 papers', 'Very High', 4],
        ['Keys & splines', '3/3 papers', 'High', 2],
        ['Failure theories / stresses', '3/3 papers', 'High', 1],
        ['Design fundamentals / material selection', '3/3 papers', 'High', 1],
        ['Connecting rod', '2/3 papers', 'High', 5],
        ['Power screws', '1/3 papers', 'Moderate', 3],
        ['Fatigue / variable loading', '1/3 papers', 'Moderate', 1]
      ],
      units: [
        ['Unit I', 'Design fundamentals, stresses, failure theories, fatigue, crane hook / C-frame', 'High', 1],
        ['Unit II', 'Shafts, keys, splines', 'Very High', 2],
        ['Unit III', 'Couplings, power screws, welded/riveted joints', 'Very High', 3],
        ['Unit IV', 'Springs, flywheels, bearings', 'Very High', 4],
        ['Unit V', 'Machine joints and components such as cotter/knuckle/connecting rod', 'High', 5]
      ],
      unitLinks: {
        1: 'data/mechanical/ME3591_Unit1_Notes.html',
        2: 'data/mechanical/ME3591_Unit2_Notes.html',
        3: 'data/mechanical/ME3591_Unit3_Notes.html',
        4: 'data/mechanical/ME3591_Unit4_Notes.html',
        5: 'data/mechanical/ME3591_Unit5_Notes.html'
      }
    }
  };

  // Expose the verified dataset so future subjects can register their own
  // evidence without rewriting the rendering engine.
  window.ACADRIX_PYQ_ANALYSIS = ANALYSIS;

  function priorityClass(value) {
    return String(value).toLowerCase().replace(/\s+/g, '-');
  }

  function unitLink(data, unit) {
    const href = data.unitLinks && data.unitLinks[unit];
    return href ? `<a class="analysis-unit-link" href="${escapeAttr(href)}">Unit ${unit} Notes ↗</a>` : '';
  }

  function init() {
    const header = document.querySelector('.subject-header');
    if (!header) return;
    const codeText = header.textContent || '';
    const match = codeText.match(/[A-Z]{2}\d{4}/i);
    if (!match) return;
    const code = match[0].toUpperCase();
    const data = window.ACADRIX_PYQ_ANALYSIS[code];
    if (!data || document.getElementById('acadrx-pyq-analysis')) return;

    const anchor = document.getElementById('acadrx-pyqs');
    if (!anchor) return;

    const section = document.createElement('section');
    section.id = 'acadrx-pyq-analysis';
    section.className = 'resource-section pyq-analysis';
    section.innerHTML = `
      <div class="pyq-analysis-head">
        <div>
          <span class="analysis-kicker">EXAM INTELLIGENCE</span>
          <h2>${escapeHtml(data.title)}</h2>
          <p>${escapeHtml(data.note)}</p>
        </div>
        <div class="analysis-stat"><strong>${data.papers}</strong><span>verified papers analysed</span></div>
      </div>
      <div class="exam-intelligence-callout">
        <strong>📌 Study First</strong>
        <span>Start with the Very High units, then High units. Use the direct note links below; Moderate topics are revision items.</span>
      </div>
      <div class="study-first-grid">
        ${data.units.map(u => `<a class="study-first-card" href="${escapeAttr(data.unitLinks[u[3]])}"><div class="study-first-top"><span class="study-step">${escapeHtml(u[3])}</span><strong>${escapeHtml(u[0])}</strong><span class="priority priority-${priorityClass(u[2])}">${escapeHtml(u[2])}</span></div><p>${escapeHtml(u[1])}</p><span class="study-first-action">Open Unit Notes →</span></a>`).join('')}
      </div>
      <h3>Most recurring topics</h3>
      <div class="analysis-table-wrap">
        <table class="analysis-table">
          <thead><tr><th>Topic</th><th>Coverage</th><th>Priority</th><th>Notes</th></tr></thead>
          <tbody>${data.patterns.map(r => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td><span class="priority priority-${priorityClass(r[2])}">${escapeHtml(r[2])}</span></td><td>${unitLink(data, r[3])}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <h3>Unit-wise revision priority</h3>
      <div class="unit-priority-grid">
        ${data.units.map(u => `<article><div class="unit-priority-title"><strong>${escapeHtml(u[0])}</strong><span class="priority priority-${priorityClass(u[2])}">${escapeHtml(u[2])}</span></div><p>${escapeHtml(u[1])}</p>${unitLink(data, u[3])}</article>`).join('')}
      </div>
      <p class="analysis-disclaimer"><strong>Evidence rule:</strong> frequency is calculated only from the explicitly listed verified papers. Topic-to-unit links identify the corresponding syllabus unit; they do not claim that every individual paper question has been manually mapped.</p>
    `;

    anchor.parentNode.insertBefore(section, anchor);
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function escapeAttr(v) {
    return escapeHtml(v).replace(/`/g, '&#96;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
