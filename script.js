/* AU NOTES - Refactored to load JSON data files dynamically
   - Departments remain in-code
   - Semester/subject data is loaded from data/<deptFolder>/sem<n>.json on demand
   - Search will fetch semester files on first use (lazy)
   - Uses hash routing for direct links: #/details/ME3451
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
const loadedData = {}; // key: `${deptId}-r2021-sem${sem}` => array of subjects
let searchIndex = null; // built lazily

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
    handleHashRoute();
    render();

    // Back button support
    window.onpopstate = () => {
        const state = window.history.state;
        if (state) {
            currentState = state;
            render(false);
        }
    };

    window.addEventListener('hashchange', () => {
        handleHashRoute();
    });
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

// Hash routing: support direct links like #/details/ME3451
function handleHashRoute() {
    const hash = location.hash || '';
    if (hash.startsWith('#/details/')) {
        const code = hash.split('/')[2];
        if (code) {
            // Try to find subject; this will fetch semester files lazily if needed
            navigateTo('details', { subjectCode: code });
            return;
        }
    }
    // default: no change
}

// Navigation Router
function navigateTo(view, params = {}) {
    currentState = { view, ...params };
    // push state and update hash for shareable URLs on details view
    if (view === 'details' && params.subjectCode) {
        location.hash = `#/details/${params.subjectCode}`;
    } else if (view === 'home') {
        history.pushState(currentState, '', location.pathname + location.search);
        location.hash = '';
    } else {
        history.pushState(currentState, '', '');
    }
    render();
}

function render(pushHistory = true) {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current content

    switch (currentState.view) {
        case 'home':
            renderHome(app);
            break;
        case 'semesters':
            renderSemesters(app, currentState.dept);
            break;
        case 'subjects':
            renderSubjects(app, currentState.dept, currentState.sem);
            break;
        case 'details':
            renderSubjectDetails(app, currentState.subjectCode);
            break;
        default:
            renderHome(app);
    }
    window.scrollTo(0, 0);
}

// VIEW: Home
function renderHome(container) {
    container.innerHTML = `
        <section class="hero">
            <h1>Anna University Engineering Notes</h1>
            <p>Notes • PYQs • Question Banks • Important Questions • Video Lectures</p>
            <div class="grid" id="deptGrid"></div>
        </section>
        <section>
            <h2>Regulation</h2>
            <div class="grid">
                <div class="card" onclick="alert('R2021 is active. Select a department below.')">
                    <h3>Regulation 2021</h3>
                    <p>Current active syllabus for 2nd, 3rd, and 4th year students.</p>
                </div>
                <div class="card" style="opacity: 0.6">
                    <h3>Regulation 2025</h3>
                    <p>Coming Soon for new batch.</p>
                </div>
            </div>
        </section>
        <section>
            <h2>Recently Updated</h2>
            <div id="recentGrid" class="grid"></div>
        </section>
    `;

    const grid = document.getElementById('deptGrid');
    DEPARTMENTS.forEach(dept => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="font-size: 2rem">${dept.icon}</div>
            <h3>${dept.name}</h3>
            <p>R2021 Semester 1 - 8</p>
        `;
        card.onclick = () => navigateTo('semesters', { dept: dept.id });
        grid.appendChild(card);
    });

    // Build recent list from available loadedData (will be empty on first load). Offer note if empty.
    const recentGrid = document.getElementById('recentGrid');
    const recentItems = collectRecentlyUpdated(10);
    if (recentItems.length === 0) {
        recentGrid.innerHTML = `<div class="card"><p>No recent updates yet. Visit a semester to load data.</p></div>`;
    } else {
        recentGrid.innerHTML = recentItems.map(item => `
            <div class="card" onclick="navigateTo('details', { subjectCode: '${item.code}' })">
                <p style="color: var(--accent-color); font-weight: bold;">${item.code}</p>
                <h3>${item.name}</h3>
                <p>Updated: ${item.updated || '—'}</p>
            </div>
        `).join('');
    }
}

function collectRecentlyUpdated(limit = 8) {
    const all = [];
    Object.values(loadedData).forEach(arr => {
        arr.forEach(s => {
            if (s.updated) all.push(s);
        });
    });
    all.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
    return all.slice(0, limit);
}

// VIEW: Semesters
function renderSemesters(container, deptId) {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> > ${dept ? dept.name : deptId}</div>
        <h2>Select Semester</h2>
        <div class="grid">
            ${[1,2,3,4,5,6,7,8].map(num => `
                <div class="card" onclick="navigateTo('subjects', { dept: '${deptId}', sem: ${num} })">
                    <h3>Semester ${num}</h3>
                    <p>${dept ? dept.name : deptId} - R2021</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Load semester JSON (on demand)
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
        const res = await fetch(path);
        if (!res.ok) {
            loadedData[key] = [];
            return loadedData[key];
        }
        const json = await res.json();
        // Expecting an array of subject objects
        loadedData[key] = Array.isArray(json) ? json : [];
        return loadedData[key];
    } catch (e) {
        console.error('Failed to load', path, e);
        loadedData[key] = [];
        return loadedData[key];
    }
}

// VIEW: Subjects List
async function renderSubjects(container, deptId, sem) {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    container.innerHTML = `
        <div class="breadcrumb">
            <span onclick="navigateTo('home')">Home</span> > 
            <span onclick="navigateTo('semesters', {dept: '${deptId}'})">${dept ? dept.name : deptId}</span> > 
            Semester ${sem}
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
        <div class="card" onclick="navigateTo('details', { subjectCode: '${s.code}' })">
            <p style="color: var(--accent-color); font-weight: bold;">${s.code}</p>
            <h3>${s.name}</h3>
            <p>View Study Materials →</p>
        </div>
    `).join('');
}

// VIEW: Subject Details
async function renderSubjectDetails(container, code) {
    // Try to locate subject in loadedData
    let subject = null;
    for (const key in loadedData) {
        const arr = loadedData[key] || [];
        const found = arr.find(s => s.code === code);
        if (found) {
            subject = found;
            break;
        }
    }

    // If not found, attempt to fetch all mechanical sem files (lazy search)
    if (!subject) {
        // try sem1..sem8 for mechanical only (we only have mechanical JSONs for now)
        for (let i = 1; i <= 8; i++) {
            const arr = await loadSemesterData('mech', i);
            const found = arr.find(s => s.code === code);
            if (found) {
                subject = found;
                break;
            }
        }
    }

    if (!subject) {
        container.innerHTML = `<div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> › <span>Subject</span></div><div class="card"><p>Subject not found.</p></div>`;
        return;
    }

    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> › <span onclick="navigateTo('semesters', {dept: 'mech'})">Mechanical Engineering</span> › ${subject.code}</div>
        <button class="back-btn" onclick="window.history.back()">← Back</button>
        <div class="subject-header">
            <p>${subject.code}</p>
            <h1>${subject.name}</h1>
            <p>Regulation 2021 • Anna University</p>
        </div>

        <div class="resource-section">
            <h3>📚 UNIT-WISE NOTES</h3>
            <div class="unit-grid">
                ${((subject.units || [])).map((u, i) => {
                    const link = (subject.units && subject.units[i] && subject.units[i].notes) || (subject.notes && subject.notes[`u${i+1}`]) || null;
                    if (link && link !== '#') {
                        return `
                            <a href="${link}" class="resource-btn">
                                <div>
                                    <strong>Unit ${i+1}</strong>
                                    <div style="font-size:0.9rem">${typeof u === 'string' ? u : u.name || ''}</div>
                                </div>
                                <div class="status">✅ Available</div>
                            </a>
                        `;
                    } else {
                        return `
                            <div class="resource-btn disabled">
                                <div>
                                    <strong>Unit ${i+1}</strong>
                                    <div style="font-size:0.9rem">${typeof u === 'string' ? u : u.name || ''}</div>
                                </div>
                                <div class="status">⏳ Coming Soon</div>
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
        return pyqs.map(p => `
            <a href="${p.link}" class="resource-btn" ${p.link && p.link !== '#' ? 'target="_blank"' : ''}>
                ${p.year} ${p.session ? p.session : ''} <span style="margin-left:auto">Open</span>
            </a>
        `).join('');
    }
    // object map
    return Object.entries(pyqs).map(([year, url]) => `
        ${url && url !== '#' ? `<a href="${url}" class="resource-btn" target="_blank">${year} Paper</a>` : `<div class="resource-btn disabled">${year} — ⏳ Coming Soon</div>`}
    `).join('');
}

function renderExamPrep(subject) {
    const parts = [];
    const qbank = subject.questionBank || subject.qbank || null;
    const imp = subject.importantQuestions || subject.imp || null;
    const formula = subject.formulaSheet || subject.formula || null;
    const solved = subject.solvedProblems || null;

    if (qbank) parts.push(`<a href="${qbank}" class="resource-btn" target="_blank">Question Bank</a>`);
    else parts.push(`<div class="resource-btn disabled">Question Bank — ⏳ Coming Soon</div>`);

    if (imp) parts.push(`<a href="${imp}" class="resource-btn" target="_blank">Important Questions</a>`);
    else parts.push(`<div class="resource-btn disabled">Important Questions — ⏳ Coming Soon</div>`);

    if (formula) parts.push(`<a href="${formula}" class="resource-btn" target="_blank">Formula Sheet</a>`);
    else parts.push(`<div class="resource-btn disabled">Formula Sheet — ⏳ Coming Soon</div>`);

    if (solved) parts.push(`<a href="${solved}" class="resource-btn" target="_blank">Solved Problems</a>`);
    else parts.push(`<div class="resource-btn disabled">Solved Problems — ⏳ Coming Soon</div>`);

    return parts.join('\n');
}

// Search Logic with lazy indexing
async function handleSearch() {
    const input = document.getElementById('searchInput');
    const query = (input.value || '').trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');

    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    // build index if not ready (only mechanical dept for now)
    if (!searchIndex) {
        searchIndex = [];
        for (let i = 1; i <= 8; i++) {
            const arr = await loadSemesterData('mech', i);
            arr.forEach(s => {
                searchIndex.push({ ...s, sem: i, dept: 'mech' });
            });
        }
    }

    const matches = [];
    searchIndex.forEach(s => {
        if (s.code && s.code.toLowerCase().includes(query)) matches.push({ type: 'subject', item: s });
        else if (s.name && s.name.toLowerCase().includes(query)) matches.push({ type: 'subject', item: s });
        // search units
        (s.units || []).forEach((u, idx) => {
            const uname = typeof u === 'string' ? u : u.name || '';
            if (uname.toLowerCase().includes(query)) {
                matches.push({ type: 'unit', item: s, unitIndex: idx });
            }
        });
    });

    if (matches.length > 0) {
        resultsDiv.innerHTML = matches.map(m => {
            if (m.type === 'subject') {
                return `<div class="search-item" onclick="selectSearch('${m.item.code}')"><strong>${m.item.code}</strong><br><small>${m.item.name}</small></div>`;
            } else {
                const u = m.item.units[m.unitIndex];
                const uName = typeof u === 'string' ? u : u.name || '';
                return `<div class="search-item" onclick="selectSearch('${m.item.code}', ${m.unitIndex})"><strong>${m.item.code} — Unit ${m.unitIndex+1}</strong><br><small>${uName} — ${m.item.name}</small></div>`;
            }
        }).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
}

function selectSearch(code, unitIndex = null) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
    navigateTo('details', { subjectCode: code });
    // Optionally we could scroll to unit after detail page loads — left as future improvement
}

/* Utility: comingSoon previously used alerts — we now avoid alerts and show statuses in UI */

// Exported for debugging
window._AUNOTES = { DEPARTMENTS, loadedData };
