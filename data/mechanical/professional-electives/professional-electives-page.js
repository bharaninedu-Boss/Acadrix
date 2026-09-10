const CATALOGUE_URL = '../professional-electives.json';

// Only link courses that have a verified ACADRIX page.
const AVAILABLE_RESOURCES = {
    CME338: 'CME338.html',
    CME341: 'CME341.html',
    CME344: 'CME344.html',
    CME356: 'CME356.html',
    CME358: 'CME358.html',
    CME362: 'CME362.html',
    CME365: 'CME365.html',
    CME372: 'CME372.html',
    CME380: 'CME380.html',
    CME387: 'CME387.html'
};

// Anna University R-2021 Mechanical Engineering Semester VII.
// Semester VII is not a standard Professional Elective semester.
const SEM7_SUBJECTS = [
    ['ME3791', 'Mechatronics and IoT', 'Theory'],
    ['ME3792', 'Computer Integrated Manufacturing', 'Theory'],
    ['GE3791', 'Human Values and Ethics', 'Theory'],
    ['GE3792', 'Industrial Management', 'Theory'],
    ['OE-II', 'Open Elective - II', 'Open Elective'],
    ['OE-III', 'Open Elective - III', 'Open Elective'],
    ['OE-IV', 'Open Elective - IV', 'Open Elective'],
    ['ME3781', 'Mechatronics and IoT Laboratory', 'Laboratory'],
    ['ME3711', 'Summer Internship', 'Internship']
];

let catalogueData = [];

async function initProfessionalElectivesPage() {
    const catalogue = document.getElementById('verticalCatalogue');
    renderSemester7();
    if (!catalogue) return;

    try {
        const response = await fetch(CATALOGUE_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        catalogueData = Array.isArray(data.verticals) ? data.verticals : [];
        renderCatalogue(catalogueData);
        injectCatalogueFilters(catalogue);
    } catch (error) {
        console.error('Failed to load Professional Elective catalogue:', error);
        catalogue.innerHTML = '<div class="error-box">The elective catalogue could not be loaded. Please refresh the page.</div>';
    }
}

function renderCatalogue(verticals, query = '', status = 'all', verticalId = 'all') {
    const catalogue = document.getElementById('verticalCatalogue');
    if (!catalogue) return;

    const search = query.trim().toLowerCase();
    let visibleCourses = 0;

    catalogue.innerHTML = verticals.map(vertical => {
        if (verticalId !== 'all' && String(vertical.id) !== String(verticalId)) return '';

        const courses = (vertical.courses || []).filter(course => {
            const code = String(course[0] || '').toLowerCase();
            const title = String(course[1] || '').toLowerCase();
            const available = Boolean(AVAILABLE_RESOURCES[String(course[0])]);
            const matchesSearch = !search || code.includes(search) || title.includes(search);
            const matchesStatus = status === 'all' || (status === 'available' && available) || (status === 'coming' && !available);
            return matchesSearch && matchesStatus;
        });

        if (!courses.length) return '';
        visibleCourses += courses.length;

        return `
            <details ${search ? 'open' : ''}>
                <summary>
                    <span>Vertical ${escapeHtml(vertical.id)} — ${escapeHtml(vertical.name)}</span>
                    <small>${courses.length} matching ${courses.length === 1 ? 'course' : 'courses'}</small>
                </summary>
                <div class="vertical-body">
                    <div class="course-grid">
                        ${courses.map(course => renderCourse(course, (vertical.courses || []).indexOf(course))).join('')}
                    </div>
                </div>
            </details>
        `;
    }).join('');

    if (!visibleCourses) {
        catalogue.innerHTML = '<div class="error-box">No professional electives match your search or filter.</div>';
    }

    updateCatalogueCount(visibleCourses);
}

function injectCatalogueFilters(catalogue) {
    if (document.getElementById('peCatalogueFilters')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'peCatalogueFilters';
    wrapper.className = 'pe-filter-panel';
    wrapper.innerHTML = `
        <div class="pe-filter-row">
            <label class="pe-search-label" for="peSearch">Search electives</label>
            <input id="peSearch" class="pe-search" type="search" placeholder="Search by subject code or title…" autocomplete="off">
        </div>
        <div class="pe-filter-row pe-filter-controls">
            <label for="peStatus">Availability</label>
            <select id="peStatus" class="pe-select">
                <option value="all">All resources</option>
                <option value="available">Available on ACADRIX</option>
                <option value="coming">Resources coming soon</option>
            </select>
            <label for="peVertical">Vertical</label>
            <select id="peVertical" class="pe-select">
                <option value="all">All verticals</option>
                ${catalogueData.map(v => `<option value="${escapeHtml(v.id)}">Vertical ${escapeHtml(v.id)} — ${escapeHtml(v.name)}</option>`).join('')}
            </select>
            <button type="button" class="pe-clear" id="peClear">Clear</button>
        </div>
        <div class="pe-filter-meta" id="peFilterCount" aria-live="polite"></div>
    `;

    catalogue.parentNode.insertBefore(wrapper, catalogue);

    const search = document.getElementById('peSearch');
    const status = document.getElementById('peStatus');
    const vertical = document.getElementById('peVertical');
    const clear = document.getElementById('peClear');

    const apply = () => renderCatalogue(catalogueData, search.value, status.value, vertical.value);
    search.addEventListener('input', apply);
    status.addEventListener('change', apply);
    vertical.addEventListener('change', apply);
    clear.addEventListener('click', () => {
        search.value = '';
        status.value = 'all';
        vertical.value = 'all';
        apply();
        search.focus();
    });

    injectFilterStyles();
}

function updateCatalogueCount(count) {
    const counter = document.getElementById('peFilterCount');
    if (!counter) return;
    counter.textContent = `${count} ${count === 1 ? 'elective' : 'electives'} shown`;
}

function injectFilterStyles() {
    if (document.getElementById('peFilterStyles')) return;

    const style = document.createElement('style');
    style.id = 'peFilterStyles';
    style.textContent = `
        .pe-filter-panel{margin:1rem 0 1.25rem;padding:1rem;border:1px solid rgba(127,127,127,.22);border-radius:14px;background:rgba(127,127,127,.06)}
        .pe-filter-row{display:flex;gap:.65rem;align-items:center;flex-wrap:wrap}
        .pe-search-label{font-weight:700;display:block;width:100%}
        .pe-search{width:100%;padding:.75rem .9rem;border:1px solid rgba(127,127,127,.3);border-radius:10px;background:inherit;color:inherit;font:inherit;box-sizing:border-box}
        .pe-filter-controls label{font-size:.9rem;font-weight:650}
        .pe-select,.pe-clear{padding:.65rem .75rem;border:1px solid rgba(127,127,127,.3);border-radius:9px;background:inherit;color:inherit;font:inherit}
        .pe-clear{cursor:pointer;font-weight:650}
        .pe-filter-meta{margin-top:.7rem;font-size:.85rem;opacity:.72}
        @media (max-width:640px){.pe-filter-controls>*{width:100%}.pe-filter-controls label{margin-top:.2rem}.pe-clear{width:auto}}
    `;
    document.head.appendChild(style);
}

function renderSemester7() {
    const section = document.getElementById('sem7');
    if (!section) return;

    section.innerHTML = `
        <h2>Semester 7 — R-2021 Curriculum</h2>
        <p class="semester-intro">The standard Anna University R-2021 Mechanical Engineering Semester VII curriculum contains core theory subjects, open electives, a laboratory and summer internship. Professional Electives are registered in Semesters V and VI, not as standard Semester VII subjects.</p>
        <div class="sem7-grid">
            ${SEM7_SUBJECTS.map(([code, title, type]) => `
                <div class="sem7-subject">
                    <div class="sem7-code">${escapeHtml(code)}</div>
                    <h3>${escapeHtml(title)}</h3>
                    <span class="sem7-tag">${escapeHtml(type)}</span>
                </div>
            `).join('')}
        </div>
        <div class="rule">
            <strong>R-2021 note:</strong> Professional Elective Courses are registered in Semesters V and VI. Honours/Minor course registration may extend from Semester V to VIII under the applicable R-2021 rules.
        </div>
    `;
}

function renderCourse(course, index) {
    const code = String(course[0]);
    const title = String(course[1]);
    const resourceUrl = AVAILABLE_RESOURCES[code];

    if (resourceUrl) {
        return `
            <a class="course course-available" href="${resourceUrl}" aria-label="Open ACADRIX resources for ${escapeHtml(code)} — ${escapeHtml(title)}">
                <div class="course-topline"><b>Row ${index + 1} · ${escapeHtml(code)}</b><span class="status status-available">Available on ACADRIX</span></div>
                <span>${escapeHtml(title)}</span>
                <small class="course-action">Open subject hub →</small>
            </a>
        `;
    }

    return `
        <div class="course course-coming-soon">
            <div class="course-topline"><b>Row ${index + 1} · ${escapeHtml(code)}</b><span class="status status-coming">Resources coming soon</span></div>
            <span>${escapeHtml(title)}</span>
        </div>
    `;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[character]));
}

document.addEventListener('DOMContentLoaded', initProfessionalElectivesPage);
