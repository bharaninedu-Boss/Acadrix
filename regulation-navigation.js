/* ACADRIX regulation-aware Mechanical Engineering navigation
   R-2021 remains the existing data set.
   R-2025 is a separate navigation/data namespace and will be populated from
   the official Anna University R-2025 Mechanical Engineering curriculum.
*/

const originalRenderSemesters = renderSemesters;
const originalRenderSubjects = renderSubjects;
const originalLoadSemesterData = loadSemesterData;

function isMechanical(deptId) {
    return deptId === 'mech';
}

function regulationLabel(regulation) {
    return regulation === 'r2025' ? 'Regulation 2025' : 'Regulation 2021';
}

function navigateRegulation(regulation) {
    location.hash = `#/dept/mech/${regulation}`;
}

// Route parser: keep all existing R-2021 URLs working, while adding
// regulation-aware Mechanical Engineering URLs.
handleHashRoute = function () {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash || hash === '/') {
        navigateTo('home', {}, true);
        return;
    }

    const parts = hash.split('/').filter(Boolean);
    if (parts[0] !== 'dept') {
        navigateTo('home', {}, true);
        return;
    }

    const deptId = parts[1] || null;
    if (!deptId) {
        navigateTo('home', {}, true);
        return;
    }

    // Mechanical regulation selector: #/dept/mech
    if (!parts[2]) {
        navigateTo('semesters', { dept: deptId, regulation: isMechanical(deptId) ? null : 'r2021' }, true);
        return;
    }

    // New regulation-aware routes: #/dept/mech/r2021/sem5/CODE
    if (isMechanical(deptId) && /^r202[15]$/i.test(parts[2])) {
        const regulation = parts[2].toLowerCase();
        if (!parts[3]) {
            navigateTo('semesters', { dept: deptId, regulation }, true);
            return;
        }

        const semMatch = parts[3].match(/^sem(\d+)$/i);
        if (!semMatch) {
            navigateTo('semesters', { dept: deptId, regulation }, true);
            return;
        }

        const sem = parseInt(semMatch[1], 10);
        if (!parts[4]) {
            navigateTo('subjects', { dept: deptId, sem, regulation }, true);
            return;
        }

        navigateTo('details', {
            dept: deptId,
            sem,
            regulation,
            subjectCode: parts[4]
        }, true);
        return;
    }

    // Legacy route format is treated as R-2021 so existing shared links do not break.
    const semMatch = parts[2].match(/^sem(\d+)$/i);
    if (semMatch) {
        const sem = parseInt(semMatch[1], 10);
        if (!parts[3]) {
            navigateTo('subjects', { dept: deptId, sem, regulation: 'r2021' }, true);
            return;
        }
        navigateTo('details', {
            dept: deptId,
            sem,
            regulation: 'r2021',
            subjectCode: parts[3]
        }, true);
        return;
    }

    navigateTo('home', {}, true);
};

navigateTo = function (view, params = {}, fromHash = false) {
    currentState = { view, ...params };
    closeMenu();

    if (!fromHash) {
        if (view === 'home') {
            location.hash = '';
        } else if (view === 'semesters' && params.dept) {
            if (isMechanical(params.dept) && params.regulation) {
                location.hash = `#/dept/${params.dept}/${params.regulation}`;
            } else {
                location.hash = `#/dept/${params.dept}`;
            }
        } else if (view === 'subjects' && params.dept && params.sem) {
            if (isMechanical(params.dept) && params.regulation) {
                location.hash = `#/dept/${params.dept}/${params.regulation}/sem${params.sem}`;
            } else {
                location.hash = `#/dept/${params.dept}/sem${params.sem}`;
            }
        } else if (view === 'details' && params.dept && params.sem && params.subjectCode) {
            if (isMechanical(params.dept) && params.regulation) {
                location.hash = `#/dept/${params.dept}/${params.regulation}/sem${params.sem}/${params.subjectCode}`;
            } else {
                location.hash = `#/dept/${params.dept}/sem${params.sem}/${params.subjectCode}`;
            }
        }
    }

    render();
};

// Mechanical Engineering entry page now presents the two regulations separately.
renderSemesters = function (container, deptId, regulation = null) {
    if (!isMechanical(deptId)) {
        return originalRenderSemesters(container, deptId);
    }

    const chosen = regulation || currentState.regulation || null;

    if (!chosen) {
        container.innerHTML = `
            <div class="breadcrumb">
                <span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp;
                <span>Mechanical Engineering</span>
            </div>
            <section class="hero">
                <h1>Mechanical Engineering</h1>
                <p>Select your Anna University regulation to view the correct semester curriculum and study resources.</p>
            </section>
            <section>
                <h2>Select Regulation</h2>
                <div class="grid">
                    <div class="card" role="button" tabindex="0" onclick="navigateRegulation('r2025')">
                        <div style="font-size:2.2rem">📘</div>
                        <h3>Regulation 2025</h3>
                        <p style="margin:0;color:var(--text-secondary)">New Anna University curriculum. R-2025 resources will be built separately.</p>
                        <div class="arrow">→</div>
                    </div>
                    <div class="card" role="button" tabindex="0" onclick="navigateRegulation('r2021')">
                        <div style="font-size:2.2rem">📗</div>
                        <h3>Regulation 2021</h3>
                        <p style="margin:0;color:var(--text-secondary)">Existing ACADRIX Mechanical Engineering notes, PYQs and resources.</p>
                        <div class="arrow">→</div>
                    </div>
                </div>
            </section>
        `;
        return;
    }

    const label = regulationLabel(chosen);
    const is2025 = chosen === 'r2025';
    container.innerHTML = `
        <div class="breadcrumb">
            <span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp;
            <span onclick="navigateTo('semesters',{dept:'mech'})">Mechanical Engineering</span> &nbsp;›&nbsp;
            <span>${label}</span>
        </div>
        <section class="hero">
            <h1>Mechanical Engineering — ${label}</h1>
            <p>${is2025 ? 'Anna University R-2025 semester structure. Course resources will be added semester-by-semester.' : 'Anna University R-2021 resources already available on ACADRIX.'}</p>
        </section>
        <section>
            <h2>Select Semester</h2>
            <div class="grid">
                ${[1,2,3,4,5,6,7,8].map(num => `
                    <div class="card" role="button" tabindex="0" onclick="navigateTo('subjects',{dept:'mech',sem:${num},regulation:'${chosen}'})">
                        <div>
                            <h3>Semester ${num}</h3>
                            <p style="margin:0;color:var(--text-secondary)">Mechanical Engineering · ${label}</p>
                        </div>
                        <div class="arrow">→</div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
};

// Keep R-2021 loading exactly as before. R-2025 uses a separate path.
loadSemesterData = async function (deptId, sem, regulation = null) {
    if (!isMechanical(deptId) || regulation !== 'r2025') {
        return originalLoadSemesterData(deptId, sem);
    }

    const key = `${deptId}-r2025-sem${sem}`;
    if (loadedData[key]) return loadedData[key];

    const path = `data/mechanical/r2025/sem${sem}.json`;
    try {
        const res = await fetch(path);
        if (!res.ok) {
            loadedData[key] = [];
            return loadedData[key];
        }
        const json = await res.json();
        let subjects = Array.isArray(json) ? json : (json && Array.isArray(json.subjects) ? json.subjects : []);
        subjects = subjects.map(s => ({ ...s, dept: deptId, sem, regulation: 'r2025' }));
        loadedData[key] = subjects;
        return loadedData[key];
    } catch (e) {
        console.error('Failed to load R-2025 data', path, e);
        loadedData[key] = [];
        return loadedData[key];
    }
};

renderSubjects = async function (container, deptId, sem, regulation = null) {
    if (!isMechanical(deptId) || regulation !== 'r2025') {
        return originalRenderSubjects(container, deptId, sem);
    }

    container.innerHTML = `
        <div class="breadcrumb">
            <span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp;
            <span onclick="navigateTo('semesters',{dept:'mech'})">Mechanical Engineering</span> &nbsp;›&nbsp;
            <span onclick="navigateTo('semesters',{dept:'mech',regulation:'r2025'})">Regulation 2025</span> &nbsp;›&nbsp;
            <span>Semester ${sem}</span>
        </div>
        <h2>R-2025 · Semester ${sem}</h2>
        <div id="subjectsGrid" class="grid"><div class="card"><p>Loading R-2025 subjects…</p></div></div>
    `;

    const subjects = await loadSemesterData(deptId, sem, 'r2025');
    const grid = document.getElementById('subjectsGrid');
    if (!subjects.length) {
        grid.innerHTML = `
            <div class="card">
                <h3>R-2025 Semester ${sem}</h3>
                <p>Curriculum verified from the Anna University R-2025 source. ACADRIX study resources for this semester are being built separately from R-2021.</p>
                <p style="color:var(--text-secondary)">No subject resources have been published here yet.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = subjects.map(s => `
        <div class="card" role="button" tabindex="0" onclick="navigateTo('details',{dept:'mech',sem:${sem},regulation:'r2025',subjectCode:'${s.code}'})">
            <div>
                <p style="color:var(--accent-color);font-weight:bold;margin:0">${s.code || ''}</p>
                <h3 style="margin:6px 0">${s.name || ''}</h3>
                <p style="margin:0;color:var(--text-secondary)">View Study Materials →</p>
            </div>
            <div class="arrow">→</div>
        </div>
    `).join('');
};

// Ensure the initial render uses the regulation-aware route parser.
if (location.hash) {
    handleHashRoute();
}
