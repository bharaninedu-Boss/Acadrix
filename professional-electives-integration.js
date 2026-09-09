/* ACADRIX Professional Electives integration
   Adds the dedicated Mechanical Engineering Professional Electives hub
   ONLY to the R-2021 Mechanical Engineering semester selector.
   R-2025 has a different elective syllabus and must remain separate.
*/
(function () {
    const PE_URL = 'data/mechanical/professional-electives/';

    function isR2021MechanicalRoute() {
        const hash = (location.hash || '').toLowerCase();
        return hash === '#/dept/mech/r2021' || hash.startsWith('#/dept/mech/r2021/');
    }

    function removeProfessionalElectivesCard() {
        const app = document.getElementById('app');
        if (!app) return;
        const card = app.querySelector('[data-acadrix-pe-card]');
        if (card) card.remove();
    }

    function addProfessionalElectivesCard() {
        const app = document.getElementById('app');
        if (!app) return;

        // Professional Electives currently belong to the R-2021 work only.
        // Never show this card while browsing the R-2025 curriculum.
        if (!isR2021MechanicalRoute()) {
            removeProfessionalElectivesCard();
            return;
        }

        const semesterHeading = Array.from(app.querySelectorAll('h2')).find(
            h => h.textContent.trim() === 'Select Semester'
        );
        if (!semesterHeading) return;

        const breadcrumb = app.querySelector('.breadcrumb');
        const isMechanical = breadcrumb && breadcrumb.textContent.includes('Mechanical Engineering');
        if (!isMechanical) return;
        if (app.querySelector('[data-acadrix-pe-card]')) return;

        const grid = semesterHeading.nextElementSibling;
        if (!grid || !grid.classList.contains('grid')) return;

        const card = document.createElement('a');
        card.href = PE_URL;
        card.className = 'card pe-entry-card';
        card.setAttribute('data-acadrix-pe-card', 'true');
        card.setAttribute('aria-label', 'Open R-2021 Mechanical Engineering Professional Electives');
        card.innerHTML = `
            <div>
                <p class="pe-entry-label">PROFESSIONAL ELECTIVES · R-2021</p>
                <h3>Professional Electives</h3>
                <p>Browse Semester 5, Semester 6 and Semester 7 elective sections, with available ACADRIX study resources.</p>
                <div class="pe-entry-tags">
                    <span>Semester 5</span>
                    <span>Semester 6</span>
                    <span>Semester 7</span>
                </div>
            </div>
            <div class="arrow" aria-hidden="true">→</div>
        `;
        grid.appendChild(card);
    }

    function init() {
        addProfessionalElectivesCard();
        const app = document.getElementById('app');
        if (!app) return;
        new MutationObserver(addProfessionalElectivesCard).observe(app, { childList: true, subtree: true });
        window.addEventListener('hashchange', addProfessionalElectivesCard);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
