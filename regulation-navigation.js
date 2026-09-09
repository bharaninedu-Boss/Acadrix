/* ACADRIX regulation-aware navigation
   R-2021 and R-2025 use separate data namespaces.
   data/catalog.json defines the shared content schema and regulation roots.
*/

const originalRenderSemesters = renderSemesters;
const originalRenderSubjects = renderSubjects;
const originalLoadSemesterData = loadSemesterData;
const originalRenderSubjectDetails = renderSubjectDetails;
const originalRenderHome = renderHome;

let acadrxCatalog = null;
let acadrxCatalogPromise = null;

async function getAcadrxCatalog() {
    if (acadrxCatalog) return acadrxCatalog;
    if (!acadrxCatalogPromise) {
        acadrxCatalogPromise = fetch('data/catalog.json')
            .then(r => r.ok ? r.json() : null)
            .then(data => { acadrxCatalog = data; return data; })
            .catch(err => { console.error('ACADRIX catalog load failed', err); return null; });
    }
    return acadrxCatalogPromise;
}

function isMechanical(deptId) { return deptId === 'mech'; }
function regulationLabel(regulation) { return regulation === 'r2025' ? 'Regulation 2025' : 'Regulation 2021'; }
function navigateRegulation(regulation) { location.hash = `#/dept/mech/${regulation}`; }

function normalizeResourcePath(path, regulation = 'r2021') {
    if (!path) return path;
    if (/^(https?:|#|\/)/i.test(path) || path.startsWith('data/')) return path;
    if (regulation === 'r2025') return `data/mechanical/r2025/${path.replace(/^\.\//, '')}`;
    return path;
}

function normalizeSubject(subject, deptId, sem, regulation) {
    const copy = { ...subject, dept: deptId, sem, regulation };
    if (copy.resource) copy.resource = normalizeResourcePath(copy.resource, regulation);
    if (Array.isArray(copy.units)) {
        copy.units = copy.units.map(unit => ({
            ...unit,
            notes: unit.notes ? normalizeResourcePath(unit.notes, regulation) : unit.notes
        }));
    }
    ['importantQuestions','formulaSheet','solvedProblems','lastDayRevision','questionBank'].forEach(key => {
        if (typeof copy[key] === 'string') copy[key] = normalizeResourcePath(copy[key], regulation);
    });
    return copy;
}

handleHashRoute = function () {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash || hash === '/') return navigateTo('home', {}, true);
    const parts = hash.split('/').filter(Boolean);
    if (parts[0] !== 'dept') return navigateTo('home', {}, true);
    const deptId = parts[1] || null;
    if (!deptId) return navigateTo('home', {}, true);

    if (isMechanical(deptId) && /^r202[15]$/i.test(parts[2] || '')) {
        const regulation = parts[2].toLowerCase();
        if (!parts[3]) return navigateTo('semesters', { dept: deptId, regulation }, true);
        const semMatch = parts[3].match(/^sem(\d+)$/i);
        if (!semMatch) return navigateTo('semesters', { dept: deptId, regulation }, true);
        const sem = parseInt(semMatch[1], 10);
        if (!parts[4]) return navigateTo('subjects', { dept: deptId, sem, regulation }, true);
        return navigateTo('details', { dept: deptId, sem, regulation, subjectCode: parts[4] }, true);
    }

    const semMatch = (parts[2] || '').match(/^sem(\d+)$/i);
    if (semMatch) {
        const sem = parseInt(semMatch[1], 10);
        if (!parts[3]) return navigateTo('subjects', { dept: deptId, sem, regulation: 'r2021' }, true);
        return navigateTo('details', { dept: deptId, sem, regulation: 'r2021', subjectCode: parts[3] }, true);
    }
    if (!parts[2]) return navigateTo('semesters', { dept: deptId, regulation: isMechanical(deptId) ? null : 'r2021' }, true);
    navigateTo('home', {}, true);
};

navigateTo = function (view, params = {}, fromHash = false) {
    if (typeof view === 'object') { params = view; view = params.view; }
    currentState = { view, ...params };
    closeMenu();
    if (!fromHash) {
        if (view === 'home') location.hash = '';
        else if (view === 'semesters' && params.dept)
            location.hash = isMechanical(params.dept) && params.regulation ? `#/dept/${params.dept}/${params.regulation}` : `#/dept/${params.dept}`;
        else if (view === 'subjects' && params.dept && params.sem)
            location.hash = isMechanical(params.dept) && params.regulation ? `#/dept/${params.dept}/${params.regulation}/sem${params.sem}` : `#/dept/${params.dept}/sem${params.sem}`;
        else if (view === 'details' && params.dept && params.sem && params.subjectCode)
            location.hash = isMechanical(params.dept) && params.regulation ? `#/dept/${params.dept}/${params.regulation}/sem${params.sem}/${params.subjectCode}` : `#/dept/${params.dept}/sem${params.sem}/${params.subjectCode}`;
    }
    render();
};

renderHome = async function (container) {
    await originalRenderHome(container);
    const deptCards = document.querySelectorAll('#deptGrid .card');
    if (deptCards.length) {
        const mechCard = deptCards[0];
        const text = mechCard.querySelector('p');
        if (text) text.textContent = 'R2025 + R2021 • Semester 1–8';
    }
};

renderSemesters = function (container, deptId, regulation = null) {
    if (!isMechanical(deptId)) return originalRenderSemesters(container, deptId);
    const chosen = regulation || currentState.regulation || null;
    if (!chosen) {
        container.innerHTML = `
            <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; <span>Mechanical Engineering</span></div>
            <section class="hero"><h1>Mechanical Engineering</h1><p>Select your Anna University regulation. R-2025 and R-2021 resources are kept completely separate.</p></section>
            <section><h2>Select Regulation</h2><div class="grid">
                <div class="card" role="button" tabindex="0" onclick="navigateRegulation('r2025')"><div style="font-size:2.2rem">📘</div><h3>Regulation 2025</h3><p style="margin:0;color:var(--text-secondary)">New curriculum and dedicated R-2025 study-material namespace.</p><div class="arrow">→</div></div>
                <div class="card" role="button" tabindex="0" onclick="navigateRegulation('r2021')"><div style="font-size:2.2rem">📗</div><h3>Regulation 2021</h3><p style="margin:0;color:var(--text-secondary)">Existing R-2021 notes, PYQs and Professional Electives.</p><div class="arrow">→</div></div>
            </div></section>`;
        return;
    }
    const label = regulationLabel(chosen);
    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; <span onclick="navigateTo('semesters',{dept:'mech'})">Mechanical Engineering</span> &nbsp;›&nbsp; <span>${label}</span></div>
        <section class="hero"><h1>Mechanical Engineering — ${label}</h1><p>${chosen === 'r2025' ? 'R-2025 resources are stored separately from R-2021 and will be expanded semester-by-semester.' : 'R-2021 resources and existing study material.'}</p></section>
        <section><h2>Select Semester</h2><div class="grid">${[1,2,3,4,5,6,7,8].map(num => `<div class="card" role="button" tabindex="0" onclick="navigateTo('subjects',{dept:'mech',sem:${num},regulation:'${chosen}'})"><div><h3>Semester ${num}</h3><p style="margin:0;color:var(--text-secondary)">Mechanical Engineering · ${label}</p></div><div class="arrow">→</div></div>`).join('')}</div></section>`;
};

loadSemesterData = async function (deptId, sem, regulation = null) {
    if (isMechanical(deptId) && (regulation === 'r2025' || regulation === 'r2021')) {
        const catalog = await getAcadrxCatalog();
        const config = catalog?.departments?.[deptId]?.regulations?.[regulation];
        const fallbackRoot = regulation === 'r2025' ? 'data/mechanical/r2025' : 'data/mechanical';
        const root = config?.dataRoot || fallbackRoot;
        const pattern = config?.semesterPattern || 'sem{semester}.json';
        const path = `${root}/${pattern.replace('{semester}', sem)}`;
        const key = `${deptId}-${regulation}-sem${sem}`;
        if (loadedData[key]) return loadedData[key];
        try {
            const res = await fetch(path);
            if (!res.ok) return (loadedData[key] = []);
            const json = await res.json();
            const subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
            return (loadedData[key] = subjects.map(s => normalizeSubject(s, deptId, sem, regulation)));
        } catch (e) {
            console.error('Failed to load', path, e);
            return (loadedData[key] = []);
        }
    }

    // CSE's existing R-2021 data is stored under data/cse.
    if (deptId === 'cse') {
        const key = `${deptId}-r2021-sem${sem}`;
        if (loadedData[key]) return loadedData[key];
        const path = `data/cse/sem${sem}.json`;
        try {
            const res = await fetch(path);
            if (!res.ok) return (loadedData[key] = []);
            const json = await res.json();
            const subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
            return (loadedData[key] = subjects.map(s => normalizeSubject(s, deptId, sem, 'r2021')));
        } catch (e) { console.error('Failed to load CSE data', path, e); return (loadedData[key] = []); }
    }
    return originalLoadSemesterData(deptId, sem);
};

renderSubjects = async function (container, deptId, sem, regulation = null) {
    const chosen = regulation || currentState.regulation || null;
    if (!isMechanical(deptId) || chosen !== 'r2025') return originalRenderSubjects(container, deptId, sem);
    container.innerHTML = `<div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; <span onclick="navigateTo('semesters',{dept:'mech'})">Mechanical Engineering</span> &nbsp;›&nbsp; <span onclick="navigateTo('semesters',{dept:'mech',regulation:'r2025'})">Regulation 2025</span> &nbsp;›&nbsp; <span>Semester ${sem}</span></div><h2>R-2025 · Semester ${sem}</h2><div id="subjectsGrid" class="grid"><div class="card">Loading R-2025 subjects…</div></div>`;
    const subjects = await loadSemesterData(deptId, sem, 'r2025');
    const grid = document.getElementById('subjectsGrid');
    if (!subjects.length) { grid.innerHTML = `<div class="card"><h3>Semester ${sem}</h3><p>Curriculum structure is reserved for R-2025. Study resources will be added without mixing R-2021 material.</p></div>`; return; }
    grid.innerHTML = subjects.map(s => `<div class="card" role="button" tabindex="0" onclick="navigateTo('details',{dept:'mech',sem:${sem},regulation:'r2025',subjectCode:'${s.code}'})"><div><p style="color:var(--accent-color);font-weight:bold;margin:0">${s.code || ''}</p><h3 style="margin:6px 0">${s.name || ''}</h3><p style="margin:0;color:var(--text-secondary)">${s.resource ? 'Open Study Dashboard →' : 'Curriculum entry · resources coming soon'}</p></div><div class="arrow">→</div></div>`).join('');
};

renderSubjectDetails = async function (container, code) {
    const regulation = currentState.regulation || 'r2021';
    if (!(currentState.dept === 'mech' && (regulation === 'r2025' || regulation === 'r2021'))) return originalRenderSubjectDetails(container, code);
    const subjects = await loadSemesterData('mech', currentState.sem || 1, regulation);
    const subject = subjects.find(s => s.code && s.code.toLowerCase() === String(code).toLowerCase());
    if (!subject) {
        container.innerHTML = `<div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> › <span>${regulationLabel(regulation)} Subject</span></div><div class="card"><h2>Subject not found</h2><p>The requested subject is not present in this semester's verified data.</p></div>`;
        return;
    }
    if (regulation === 'r2021') return originalRenderSubjectDetails(container, code);

    const units = Array.isArray(subject.units) ? subject.units : [];
    const unitHtml = units.map(u => `<div class="card"><strong>Unit ${u.unit || ''} — ${u.title || u.name || 'Unit'}</strong>${u.notes ? `<br><a href="${u.notes}">📘 Open Unit Notes →</a>` : '<p style="color:var(--text-secondary)">Notes coming soon.</p>'}</div>`).join('');
    container.innerHTML = `<div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> › <span onclick="navigateTo('semesters',{dept:'mech'})">Mechanical Engineering</span> › <span onclick="navigateTo('semesters',{dept:'mech',regulation:'r2025'})">R-2025</span> › <span>Semester ${currentState.sem}</span></div><section class="hero"><h1>${subject.code} — ${subject.name}</h1><p><strong>Mechanical Engineering · Regulation 2025 · Semester ${currentState.sem}</strong></p><p>R-2025 resources are maintained independently from R-2021.</p></section><h2>Study Dashboard</h2><div class="grid">${subject.resource ? `<a class="card" href="${subject.resource}"><strong>📚 Course Hub</strong><p>Open the dedicated subject resource page.</p></a>` : ''}</div>${units.length ? `<h2>Unit-wise Notes</h2><div class="grid">${unitHtml}</div>` : '<div class="note">No unit-level notes have been published yet.</div>'}`;
};
