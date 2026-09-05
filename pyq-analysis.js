/* ACADRIX PYQ Analysis
   Exam-pattern insights for subjects with verified PYQ coverage.
   The ME3591 analysis below is based only on the three papers currently listed in sem5.json.
*/
(function () {
  'use strict';

  const ANALYSIS = {
    ME3591: {
      title: 'ME3591 Exam Pattern',
      note: 'Based on the available Apr/May 2024, Nov/Dec 2024 and Nov/Dec 2023 papers. Use this as a revision guide, not a prediction of the next paper.',
      papers: 3,
      patterns: [
        ['Shafts & shaft design', '3/3 papers', 'Very High'],
        ['Couplings', '3/3 papers', 'Very High'],
        ['Springs', '3/3 papers', 'Very High'],
        ['Bearings / hydrodynamic bearings', '3/3 papers', 'Very High'],
        ['Joints: welded / riveted / cotter / knuckle', '3/3 papers', 'Very High'],
        ['Flywheels', '3/3 papers', 'Very High'],
        ['Keys & splines', '3/3 papers', 'High'],
        ['Failure theories / stresses', '3/3 papers', 'High'],
        ['Design fundamentals / material selection', '3/3 papers', 'High'],
        ['Power screws', '1/3 papers', 'Moderate'],
        ['Fatigue / variable loading', '1/3 papers', 'Moderate'],
        ['Connecting rod', '2/3 papers', 'High']
      ],
      units: [
        ['Unit I', 'Design fundamentals, stresses, failure theories, fatigue, crane hook / C-frame', 'High'],
        ['Unit II', 'Shafts, keys, splines', 'Very High'],
        ['Unit III', 'Couplings, power screws, welded/riveted joints', 'Very High'],
        ['Unit IV', 'Springs, flywheels, bearings', 'Very High'],
        ['Unit V', 'Machine joints and components such as cotter/knuckle/connecting rod', 'High']
      ]
    }
  };

  function init() {
    const header = document.querySelector('.subject-header');
    if (!header) return;
    const codeText = header.textContent || '';
    const match = codeText.match(/[A-Z]{2}\d{4}/i);
    if (!match) return;
    const code = match[0].toUpperCase();
    const data = ANALYSIS[code];
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
        <div class="analysis-stat"><strong>${data.papers}</strong><span>papers analysed</span></div>
      </div>
      <h3>Most recurring topics</h3>
      <div class="analysis-table-wrap">
        <table class="analysis-table">
          <thead><tr><th>Topic</th><th>Coverage</th><th>Priority</th></tr></thead>
          <tbody>${data.patterns.map(r => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td><span class="priority priority-${r[2].toLowerCase().replace(/\s+/g,'-')}">${escapeHtml(r[2])}</span></td></tr>`).join('')}</tbody>
        </table>
      </div>
      <h3>Unit-wise revision priority</h3>
      <div class="unit-priority-grid">
        ${data.units.map(u => `<article><div class="unit-priority-title"><strong>${escapeHtml(u[0])}</strong><span class="priority priority-${u[2].toLowerCase().replace(/\s+/g,'-')}">${escapeHtml(u[2])}</span></div><p>${escapeHtml(u[1])}</p></article>`).join('')}
      </div>
    `;

    anchor.parentNode.insertBefore(section, anchor);
  }

  function escapeHtml(v) {
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
