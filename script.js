/* AU NOTES - Improved navigation, clickable cards, mobile menu, enhanced search
   - Keeps original design and dark-mode support
   - Uses hash routing: #/dept/:deptId, #/dept/:deptId/sem:sem, #/dept/:deptId/sem:sem/:code
*/

const DEPARTMENTS = [
    { id: "mech", name: "Mechanical Engineering", icon: "⚙️", folder: "mechanical" },
    { id: "cse", name: "Computer Science", icon: "💻", folder: "computer" },
    { id: "ece", name: "Electronics & Communication", icon: "📟", folder: "electronics" },
    { id: "eee", name: "Electrical & Electronics", icon: "⚡", folder: "electrical" },
    { id: "it", name: "Information Technology", icon: "🌐", folder: "it" },
    { id: "civil", name: "Civil Engineering", icon: "🏗️", folder: "civil" }
];

// In-memory cache for loaded semester JSON data
// key: `${deptId}-r2021-sem${sem}` => array of subject objects augmented with dept and sem
const loadedData = {}; // { key: [ {code,name,units,pyqs,...,dept,sem,updated,popular} ] }
let searchIndex = null; // built lazily from all departments
window.ACADRIX_CACHE_VERSION = window.ACADRIX_CACHE_VERSION || '20260912';
const sharedResponseCache = new Map();
const sharedSemesterPromiseCache = new Map();
const deferredScriptRegistry = {};

function withCacheBust(url) {
    const version = (window.ACADRIX_CACHE_VERSION || '').trim();
    if (!version) return url;
    return url.includes('?') ? `${url}&v=${encodeURIComponent(version)}` : `${url}?v=${encodeURIComponent(version)}`;
}

function normalizeRegulation(regulation) {
    return (regulation || 'r2021').toLowerCase();
}

async function fetchJsonCached(path) {
    const key = `json:${path}`;
    if (sharedResponseCache.has(key)) return sharedResponseCache.get(key);
    const promise = fetch(withCacheBust(path))
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null);
    sharedResponseCache.set(key, promise);
    return promise;
}

async function fetchTextCached(path) {
    const key = `text:${path}`;
    if (sharedResponseCache.has(key)) return sharedResponseCache.get(key);
    const promise = fetch(withCacheBust(path))
        .then(res => (res.ok ? res.text() : ''))
        .catch(() => '');
    sharedResponseCache.set(key, promise);
    return promise;
}

async function getSemesterDataShared(deptId, sem, regulation = 'r2021') {
    const normalizedReg = normalizeRegulation(regulation);
    const key = `${deptId}|${normalizedReg}|${sem}`;
    if (sharedSemesterPromiseCache.has(key)) return sharedSemesterPromiseCache.get(key);
    const loader = typeof window.loadSemesterData === 'function' ? window.loadSemesterData : loadSemesterData;
    const promise = Promise.resolve(loader(deptId, sem, normalizedReg)).then(arr => Array.isArray(arr) ? arr : []);
    sharedSemesterPromiseCache.set(key, promise);
    return promise;
}

async function getSubjectByRoute(route) {
    if (!route || !route.dept || !route.sem || !route.code) return null;
    const list = await getSemesterDataShared(route.dept, route.sem, route.regulation || 'r2021');
    return list.find(s => String(s.code || '').toUpperCase() === String(route.code || '').toUpperCase()) || null;
}

function emitRenderEvent() {
    document.dispatchEvent(new CustomEvent('acadrx:rendered', { detail: { state: { ...currentState } } }));
}

function ensureScript(path) {
    if (deferredScriptRegistry[path]) return deferredScriptRegistry[path];
    deferredScriptRegistry[path] = new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = withCacheBust(path);
        el.async = true;
        el.onload = () => resolve();
        el.onerror = reject;
        document.body.appendChild(el);
    });
    return deferredScriptRegistry[path];
}

function loadDeferredEnhancements(view) {
    if (view === 'semesters') {
        ensureScript('professional-electives-integration.js').catch(() => {});
    }
    if (view === 'details') {
        [
            'pyq-explorer.js',
            'pyq-analysis.js',
            'study-mode.js',
            'exam-mode.js',
            'resource-completeness.js',
            'subject-quality-checker.js',
            'syllabus-coverage-checker.js'
        ].forEach(path => ensureScript(path).catch(() => {}));
    }
}

// State Management
let currentState = {
    view: 'home',
    dept: null,
    sem: null,
    subjectCode: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenuToggle();
    initSearchInputBridge();
    handleHashRoute();
    render();

    window.addEventListener('hashchange', () => {
        handleHashRoute();
    });

    function initSearchInputBridge() {
        const input = document.getElementById('searchInput');
        if (!input) return;
        input.removeAttribute('oninput');
        input.addEventListener('input', () => {
            if (typeof window.handleSearch === 'function') {
                window.handleSearch();
            }
        });
    }
});

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.textContent = savedTheme === 'light-theme' ? '🌙' : '☀️';

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-theme');
            const newTheme = isLight ? 'dark-theme' : 'light-theme';
            document.body.className = newTheme;
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = isLight ? '☀️' : '🌙';
        });
    }
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    if (!menuToggle) return;
    menuToggle.addEventListener('click', toggleMenu);
}

function toggleMenu() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.toggle('open');
}

function closeMenu() {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('open');
}

// Hash routing parser
function handleHashRoute() {
    const hash = (location.hash || '').replace(/^#/, ''); // remove leading #
    // patterns: /, /dept/mech, /dept/mech/sem4, /dept/mech/sem4/ME4301
    if (!hash || hash === '/' ) {
        navigateTo('home', {}, true);
        return;
    }
    const parts = hash.split('/').filter(Boolean);
    if (parts[0] === 'dept') {
        const deptId = parts[1] || null;
        if (!deptId) return navigateTo('home', {}, true);
        if (!parts[2]) return navigateTo('semesters', { dept: deptId }, true);
        const semPart = parts[2];
        const semMatch = semPart.match(/^sem(\d+)$/i);
        if (semMatch) {
            const sem = parseInt(semMatch[1], 10);
            if (!parts[3]) return navigateTo('subjects', { dept: deptId, sem }, true);
            const code = parts[3];
            return navigateTo('details', { dept: deptId, sem, subjectCode: code }, true);
        }
    }
    // fallback
    navigateTo('home', {}, true);
}

// Navigation Router
function navigateTo(view, params = {}, fromHash = false) {
    currentState = { view, ...params };
    // Close mobile menu on navigation
    closeMenu();
    // set hash for shareable URLs
    if (view === 'home') {
        if (!fromHash) location.hash = '';
    } else if (view === 'semesters' && params.dept) {
        if (!fromHash) location.hash = `#/dept/${params.dept}`;
    } else if (view === 'subjects' && params.dept && params.sem) {
        if (!fromHash) location.hash = `#/dept/${params.dept}/sem${params.sem}`;
    } else if (view === 'details' && params.dept && params.sem && params.subjectCode) {
        if (!fromHash) location.hash = `#/dept/${params.dept}/sem${params.sem}/${params.subjectCode}`;
    }
    render();
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current content
    let renderResult = null;

    switch (currentState.view) {
        case 'home':
            renderResult = renderHome(app);
            break;
        case 'semesters':
            renderResult = renderSemesters(app, currentState.dept);
            break;
        case 'subjects':
            renderResult = renderSubjects(app, currentState.dept, currentState.sem);
            break;
        case 'details':
            renderResult = renderSubjectDetails(app, currentState.subjectCode);
            break;
        case 'browse':
            renderResult = renderHome(app); // same as home but focus on departments
            break;
        default:
            renderResult = renderHome(app);
    }
    loadDeferredEnhancements(currentState.view);
    if (renderResult && typeof renderResult.then === 'function') {
        renderResult.finally(() => {
            emitRenderEvent();
            window.scrollTo(0, 0);
        });
        return;
    }
    emitRenderEvent();
    window.scrollTo(0, 0);
}

// VIEW: Home (with Browse by Department, Popular Subjects, Recently Added)
async function renderHome(container) {
    container.innerHTML = `
        <section class="hero">
            <h1>Anna University Engineering Notes</h1>
            <p>Notes • PYQs • Question Banks • Important Questions • Video Lectures</p>
        </section>

        <section>
            <h2>Browse by Department</h2>
            <div class="grid" id="deptGrid"></div>
        </section>

        <section>
            <h2>Popular Subjects</h2>
            <div id="popularGrid" class="grid"></div>
        </section>

        <section>
            <h2>Recently Added</h2>
            <div id="recentGrid" class="grid"></div>
        </section>
    `;

    const grid = document.getElementById('deptGrid');
    DEPARTMENTS.forEach(dept => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px">
                <div style="font-size:2rem">${dept.icon}</div>
                <div>
                    <h3 style="margin:0">${dept.name}</h3>
                    <p style="margin:0;color:var(--text-secondary)">R2021 • Semester 1–8</p>
                </div>
            </div>
            <div class="arrow">→</div>
        `;
        // Entire card clickable
        card.addEventListener('click', () => navigateTo('semesters', { dept: dept.id }));
        // support keyboard
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigateTo('semesters', { dept: dept.id }); });
        grid.appendChild(card);
    });

    // Build popular and recent lists by scanning JSONs (async)
    const popularGrid = document.getElementById('popularGrid');
    const recentGrid = document.getElementById('recentGrid');

    popularGrid.innerHTML = `<div class="card"><p>Loading popular subjects…</p></div>`;
    recentGrid.innerHTML = `<div class="card"><p>Loading recently added…</p></div>`;

    // load all department sem files (non-blocking) and collect subjects
    const allSubjects = [];
    const tasks = [];
    for (const dept of DEPARTMENTS) {
        for (let s = 1; s <= 8; s++) {
            tasks.push(
                getSemesterDataShared(dept.id, s, 'r2021').then(arr => ({ dept, sem: s, arr }))
            );
        }
    }
    const batches = await Promise.all(tasks);
    batches.forEach(({ dept, sem, arr }) => {
        if (!arr || !arr.length) return;
        arr.forEach(sub => {
            allSubjects.push({ ...sub, dept: dept.id, deptName: dept.name, sem });
        });
    });

    // Popular
    const popular = allSubjects.filter(s => s.popular).slice(0, 8);
    if (popular.length === 0) {
        popularGrid.innerHTML = `<div class="card"><p>No popular subjects yet.</p></div>`;
    } else {
        popularGrid.innerHTML = popular.map(p => `
            <div class="card" role="button" onclick="navigateTo('details',{dept:'${p.dept}',sem:${p.sem},subjectCode:'${p.code}'})" tabindex="0">
                <div>
                    <p style="color:var(--accent-color);font-weight:bold;margin:0">${p.code}</p>
                    <h3 style="margin:6px 0">${p.name}</h3>
                    <p style="margin:0;color:var(--text-secondary)">${p.deptName} • Semester ${p.sem}</p>
                </div>
                <div class="arrow">→</div>
            </div>
        `).join('');
    }

    // Recently Added (by updated field)
    const recent = allSubjects.filter(s => s.updated).sort((a,b)=> (b.updated||'').localeCompare(a.updated||'')).slice(0,8);
    if (recent.length === 0) {
        recentGrid.innerHTML = `<div class="card"><p>No recent updates.</p></div>`;
    } else {
        recentGrid.innerHTML = recent.map(r => `
            <div class="card" role="button" onclick="navigateTo('details',{dept:'${r.dept}',sem:${r.sem},subjectCode:'${r.code}'})" tabindex="0">
                <div>
                    <p style="color:var(--accent-color);font-weight:bold;margin:0">🆕 ${r.name}</p>
                    <h3 style="margin:6px 0">${r.code}</h3>
                    <p style="margin:0;color:var(--text-secondary)">Updated: ${r.updated}</p>
                </div>
                <div class="arrow">→</div>
            </div>
        `).join('');
    }
}

// VIEW: Semesters
function renderSemesters(container, deptId) {
    const dept = DEPARTMENTS.find(d => d.id === deptId) || { name: deptId };
    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; <span>${dept.name}</span></div>
        <h2>Select Semester</h2>
        <div class="grid">
            ${[1,2,3,4,5,6,7,8].map(num => `
                <div class="card" role="button" tabindex="0" onclick="navigateTo('subjects',{dept:'${deptId}',sem:${num}})">
                    <div>
                        <h3>Semester ${num}</h3>
                        <p style="margin:0;color:var(--text-secondary)">${dept.name} - R2021</p>
                    </div>
                    <div class="arrow">→</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load semester JSON (on demand) and normalize
async function loadSemesterData(deptId, sem) {
    const key = `${deptId}-r2021-sem${sem}`;
    if (loadedData[key]) return loadedData[key];

    const dept = DEPARTMENTS.find(d => d.id === deptId);
    if (!dept) {
        loadedData[key] = [];
        return loadedData[key];
    }

    const path = `data/${dept.folder}/sem${sem}.json`;
    try {
        const json = await fetchJsonCached(path);
        if (!json) {
            loadedData[key] = [];
            return loadedData[key];
        }
        let subjects = [];
        // support two shapes: array directly, or {semester: n, subjects: []}
        if (Array.isArray(json)) {
            subjects = json;
        } else if (json && Array.isArray(json.subjects)) {
            subjects = json.subjects;
        }
        // normalize: ensure code and name exist; add dept & sem
        subjects = subjects.map(s => ({ ...s, dept: deptId, sem }));
        loadedData[key] = subjects;
        return loadedData[key];
    } catch (e) {
        console.error('Failed to load', path, e);
        loadedData[key] = [];
        return loadedData[key];
    }
}

// VIEW: Subjects List
async function renderSubjects(container, deptId, sem) {
    const dept = DEPARTMENTS.find(d => d.id === deptId) || { name: deptId };
    container.innerHTML = `
        <div class="breadcrumb">
            <span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; 
            <span onclick="navigateTo('semesters',{dept:'${deptId}'})">${dept.name}</span> &nbsp;›&nbsp; 
            <span>Semester ${sem}</span>
        </div>
        <h2>Subjects</h2>
        <div id="subjectsGrid" class="grid">
            <div class="card">Loading subjects…</div>
        </div>
    `;

    const subjects = await loadSemesterData(deptId, sem);
    const grid = document.getElementById('subjectsGrid');
    if (!subjects || subjects.length === 0) {
        grid.innerHTML = `<p>Content coming soon for this semester.</p>`;
        return;
    }

    grid.innerHTML = subjects.map(s => `
        <div class="card" role="button" tabindex="0" onclick="navigateTo('details',{dept:'${deptId}',sem:${sem},subjectCode:'${s.code || s.name.replace(/\s+/g,'_')}'} )">
            <div>
                <p style="color: var(--accent-color); font-weight: bold; margin:0">${s.code || ''}</p>
                <h3 style="margin:6px 0">${s.name || ''}</h3>
                <p style="margin:0;color:var(--text-secondary)">View Study Materials →</p>
            </div>
            <div class="arrow">→</div>
        </div>
    `).join('');
}

// VIEW: Subject Details
async function renderSubjectDetails(container, code) {
    // Find subject across loadedData
    let subject = null;
    let foundDept = null;
    let foundSem = null;
    for (const key in loadedData) {
        const arr = loadedData[key] || [];
        const found = arr.find(s => (s.code === code) || (s.code && s.code.toLowerCase() === code.toLowerCase()));
        if (found) { subject = found; foundDept = found.dept; foundSem = found.sem; break; }
    }
    // If not found, try load all depts sems lazily (useful on direct link)
    if (!subject) {
        for (const dept of DEPARTMENTS) {
            for (let i = 1; i <= 8; i++) {
                const arr = await loadSemesterData(dept.id, i);
                const found = arr.find(s => (s.code === code) || (s.code && s.code.toLowerCase() === code.toLowerCase()));
                if (found) { subject = found; foundDept = dept.id; foundSem = i; break; }
            }
            if (subject) break;
        }
    }

    if (!subject) {
        container.innerHTML = `<div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> › <span>Subject</span></div><div class="card"><p>Subject not found.</p></div>`;
        return;
    }

    const deptObj = DEPARTMENTS.find(d => d.id === (foundDept || subject.dept)) || { name: 'Department' };
    const sem = foundSem || subject.sem || '';

    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> &nbsp;›&nbsp; <span onclick="navigateTo('semesters',{dept:'${deptObj.id || 'mech'}}')">${deptObj.name}</span> &nbsp;›&nbsp; <span onclick="navigateTo('subjects',{dept:'${deptObj.id || 'mech'}',sem:${sem}})">${sem && 'Semester ' + sem}</span> &nbsp;›&nbsp; <span>${subject.code}</span></div>
        <button class="back-btn" onclick="window.history.back()">← Back</button>
        <div class="subject-header">
            <p>${subject.code || ''}</p>
            <h1>${subject.name || ''}</h1>
            <p>Regulation 2021 • Anna University</p>
        </div>

        <div class="resource-section">
            <h3>📚 UNIT-WISE NOTES</h3>
            <div class="unit-grid" id="unitGrid">
                ${((subject.units || [])).map((u, i) => {
                    const link = (subject.units && subject.units[i] && (subject.units[i].notes || subject.units[i].link)) || (subject.notes && subject.notes[`u${i+1}`]) || null;
                    if (link && link !== '#') {
                        // If link is relative path, keep as-is
                        return `
                            <a class="resource-btn" href="${link}" target="_blank" rel="noopener noreferrer">
                                <div>
                                    <strong>Unit ${i+1}</strong>
                                    <div style="font-size:0.9rem">${typeof u === 'string' ? u : u.name || ''}</div>
                                </div>
                                <div style="margin-left:12px">📄 Open</div>
                            </a>
                        `;
                    } else {
                        return `
                            <div class="resource-btn disabled">
                                <div>
                                    <strong>Unit ${i+1}</strong>
                                    <div style="font-size:0.9rem">${typeof u === 'string' ? u : u.name || ''}</div>
                                </div>
                                <div style="margin-left:12px">⏳ Coming Soon</div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>

        <div class="grid">
            <div class="resource-section">
                <h3>📝 PREVIOUS YEAR QUESTIONS</h3>
                ${renderPyqs(subject.pyqs)}
            </div>

            <div class="resource-section">
                <h3>🎯 EXAM PREPARATION</h3>
                ${renderExamPrep(subject)}
            </div>
        </div>

        <div class="resource-section">
            <h3>🎥 RECOMMENDED VIDEOS</h3>
            ${((subject.videos || [])).length > 0 ? subject.videos.map(v => `
                <div class="video-card">
                    <div>
                        <p><strong>${v.title}</strong></p>
                        <p style="font-size:0.8rem; color:var(--text-secondary)">Channel: ${v.channel || ''}</p>
                    </div>
                    <a href="${v.url}" target="_blank" class="resource-btn">Watch →</a>
                </div>
            `).join('') : '<p>No videos recommended yet.</p>'}
        </div>
    `;
}

function renderPyqs(pyqs) {
    if (!pyqs) return '<p>Coming soon</p>';
    // pyqs can be object or array
    if (Array.isArray(pyqs)) {
        return pyqs.map(p => {
            const link = p.link && p.link !== '#' ? p.link : null;
            if (link) return `<a href="${link}" class="resource-btn" target="_blank">${p.year} ${p.session ? p.session : ''} <span style="margin-left:auto">Open</span></a>`;
            return `<div class="resource-btn disabled">${p.year} ${p.session ? p.session : ''} — ⏳ Coming Soon</div>`;
        }).join('');
    }
    // object map
    return Object.entries(pyqs).map(([year, url]) => (
        url && url !== '#' ? `<a href="${url}" class="resource-btn" target="_blank">${year} Paper</a>` : `<div class="resource-btn disabled">${year} — ⏳ Coming Soon</div>`
    )).join('');
}

function renderExamPrep(subject) {
    const parts = [];
    const qbank = subject.questionBank || subject.qbank || null;
    const imp = subject.importantQuestions || subject.imp || null;
    const formula = subject.formulaSheet || subject.formula || null;
    const solved = subject.solvedProblems || null;

    if (qbank && qbank !== '#') parts.push(`<a href="${qbank}" class="resource-btn" target="_blank">📖 Question Bank</a>`);
    else parts.push(`<div class="resource-btn disabled">📖 Question Bank — ⏳ Coming Soon</div>`);

    if (imp && imp !== '#') parts.push(`<a href="${imp}" class="resource-btn" target="_blank">🎯 Important Questions</a>`);
    else parts.push(`<div class="resource-btn disabled">🎯 Important Questions — ⏳ Coming Soon</div>`);

    if (formula && formula !== '#') parts.push(`<a href="${formula}" class="resource-btn" target="_blank">📐 Formula Sheet</a>`);
    else parts.push(`<div class="resource-btn disabled">📐 Formula Sheet — ⏳ Coming Soon</div>`);

    if (solved && solved !== '#') parts.push(`<a href="${solved}" class="resource-btn" target="_blank">✅ Solved Problems</a>`);
    else parts.push(`<div class="resource-btn disabled">✅ Solved Problems — ⏳ Coming Soon</div>`);

    return parts.join('\n');
}

// Search Logic with lazy indexing across all departments
async function handleSearchLegacy() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = (input.value || '').trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');

    if (query.length < 2) {
        if (resultsDiv) resultsDiv.style.display = 'none';
        return;
    }

    if (typeof window.handleSearch !== 'function') {
        window.handleSearch = handleSearchLegacy;
    }

    if (!searchIndex) {
        searchIndex = [];
        const tasks = [];
        for (const dept of DEPARTMENTS) {
            for (let i = 1; i <= 8; i++) {
                tasks.push(
                    getSemesterDataShared(dept.id, i, 'r2021').then(arr => ({ dept, sem: i, arr }))
                );
            }
        }
        const rows = await Promise.all(tasks);
        rows.forEach(({ dept, sem, arr }) => {
            arr.forEach(s => {
                searchIndex.push({ ...s, dept: dept.id, deptName: dept.name, sem });
            });
        });
    }

    const matches = [];
    searchIndex.forEach(s => {
        if (s.code && s.code.toLowerCase().includes(query)) matches.push({ type: 'subject', item: s });
        else if (s.name && s.name.toLowerCase().includes(query)) matches.push({ type: 'subject', item: s });
        else if (s.deptName && s.deptName.toLowerCase().includes(query)) matches.push({ type: 'dept', item: s });
        // search units
        (s.units || []).forEach((u, idx) => {
            const uname = typeof u === 'string' ? u : u.name || '';
            if (uname.toLowerCase().includes(query)) {
                matches.push({ type: 'unit', item: s, unitIndex: idx });
            }
        });
    });

    if (matches.length > 0 && resultsDiv) {
        resultsDiv.innerHTML = matches.map(m => {
            if (m.type === 'subject') {
                return `<div class="search-item" onclick="selectSearch('${m.item.code}', ${m.item.sem}, '${m.item.dept}')"><strong>${m.item.code}</strong><br><small>${m.item.name}</small></div>`;
            } else if (m.type === 'unit') {
                const u = m.item.units[m.unitIndex];
                const uName = typeof u === 'string' ? u : u.name || '';
                return `<div class="search-item" onclick="selectSearch('${m.item.code}', ${m.item.sem}, '${m.item.dept}', ${m.unitIndex})"><strong>${m.item.code} — Unit ${m.unitIndex+1}</strong><br><small>${uName}</small></div>`;
            } else {
                return `<div class="search-item" onclick="selectSearch('${m.item.code}', ${m.item.sem}, '${m.item.dept}')"><strong>${m.item.name}</strong><br><small>${m.item.deptName} • Semester ${m.item.sem}</small></div>`;
            }
        }).join('');
        resultsDiv.style.display = 'block';
    } else if (resultsDiv) {
        // Show "No results" message
        resultsDiv.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--text-secondary); min-height:120px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <p style="font-size:1.1rem; font-weight:600; margin:0 0 8px 0">❌ No results found</p>
                <p style="font-size:0.85rem; margin:0 0 12px 0">Try searching by:</p>
                <div style="text-align:left; font-size:0.8rem; line-height:1.6;">
                    <small>📍 Subject code (e.g., <strong>ME4301</strong>)</small><br>
                    <small>📍 Subject name (e.g., <strong>Thermal</strong>)</small><br>
                    <small>📍 Unit topic (e.g., <strong>thermodynamics</strong>)</small>
                </div>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }
}

function selectSearch(code, sem = 1, dept = 'mech', unitIndex = null) {
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) resultsDiv.style.display = 'none';
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    navigateTo('details', { dept, sem, subjectCode: code });
    // Optionally scroll to unit after page loads (future improvement)
}

// Exported for debugging
window._AUNOTES = { DEPARTMENTS, loadedData };
window.ACADRIX_DATA = {
    ...(window.ACADRIX_DATA || {}),
    fetchJsonCached,
    fetchTextCached,
    getSemesterDataShared,
    getSubjectByRoute,
    invalidateCaches() {
        sharedResponseCache.clear();
        sharedSemesterPromiseCache.clear();
        searchIndex = null;
    }
};
