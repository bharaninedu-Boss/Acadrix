const CATALOGUE_URL = '../professional-electives.json';

// Only link courses that have a verified ACADRIX page.
// All other official catalogue entries remain visible without a fake/broken URL.
const AVAILABLE_RESOURCES = {
    CME341: 'CME341.html',
    CME362: 'CME362.html',
    CME380: 'CME380.html',
    CME387: 'CME387.html'
};

async function initProfessionalElectivesPage() {
    const catalogue = document.getElementById('verticalCatalogue');
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
