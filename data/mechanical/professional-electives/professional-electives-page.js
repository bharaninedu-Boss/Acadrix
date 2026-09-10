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

async function initProfessionalElectivesPage() {
    const catalogue = document.getElementById('verticalCatalogue');
    renderSemester7();
    if (!catalogue) return;

    try {
        const response = await fetch(CATALOGUE_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        catalogue.innerHTML = data.verticals.map(vertical => `
            <details>
                <summary>
                    <span>Vertical ${vertical.id} — ${escapeHtml(vertical.name)}</span>
                    <small>${vertical.courses.length} courses</small>
                </summary>
                <div class="vertical-body">
                    <div class="course-grid">
                        ${vertical.courses.map((course, index) => renderCourse(course, index)).join('')}
                    </div>
                </div>
            </details>
        `).join('');
    } catch (error) {
        console.error('Failed to load Professional Elective catalogue:', error);
        catalogue.innerHTML = '<div class="error-box">The elective catalogue could not be loaded. Please refresh the page.</div>';
    }
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
