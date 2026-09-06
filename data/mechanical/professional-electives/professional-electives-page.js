const CATALOGUE_URL = '../professional-electives.json';

async function initProfessionalElectivesPage() {
    const catalogue = document.getElementById('verticalCatalogue');
    if (!catalogue) return;

    try {
        const response = await fetch(CATALOGUE_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        catalogue.innerHTML = data.verticals.map(vertical => `
            <details>
                <summary>Vertical ${vertical.id} — ${escapeHtml(vertical.name)}</summary>
                <div class="vertical-body">
                    <div class="course-grid">
                        ${vertical.courses.map((course, index) => `
                            <div class="course">
                                <b>Row ${index + 1} · ${escapeHtml(course[0])}</b>
                                <span>${escapeHtml(course[1])}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </details>
        `).join('');
    } catch (error) {
        console.error('Failed to load Professional Elective catalogue:', error);
        catalogue.innerHTML = '<div class="error-box">The elective catalogue could not be loaded. Please refresh the page.</div>';
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[character]));
}

document.addEventListener('DOMContentLoaded', initProfessionalElectivesPage);
