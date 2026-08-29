/**
 * CONFIGURATION PANEL
 * Update your PDF links and subjects here easily.
 */
const WEBSITE_DATA = {
    "Mechanical Engineering": {
        "Sem 1": [
            { code: "MA3151", name: "Matrices and Calculus", notes: "https://example.com/notes1.pdf", qbank: "https://example.com/qb1.pdf" },
            { code: "PH3151", name: "Engineering Physics", notes: "#", qbank: "#" }
        ],
        "Sem 2": [{ code: "GE3251", name: "Engineering Graphics", notes: "#" }],
        "Sem 3": [], "Sem 4": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": []
    },
    "CSE": {
        "Sem 1": [{ code: "GE3151", name: "Python Programming", notes: "https://example.com/python.pdf" }],
        "Sem 3": [{ code: "CS3301", name: "Data Structures", notes: "#", qp: "#" }],
        "Sem 4": [{ code: "CS3401", name: "Algorithms", notes: "#" }],
        "Sem 2": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": []
    },
    "ECE": { "Sem 1": [], "Sem 2": [], "Sem 3": [], "Sem 4": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": [] },
    "EEE": { "Sem 1": [], "Sem 2": [], "Sem 3": [], "Sem 4": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": [] },
    "Civil": { "Sem 1": [], "Sem 2": [], "Sem 3": [], "Sem 4": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": [] },
    "IT": { "Sem 1": [], "Sem 2": [], "Sem 3": [], "Sem 4": [], "Sem 5": [], "Sem 6": [], "Sem 7": [], "Sem 8": [] }
};

// --- Core Logic ---

let state = {
    dept: "",
    sem: ""
};

const views = {
    home: document.getElementById('home-view'),
    sem: document.getElementById('sem-view'),
    subject: document.getElementById('subject-view'),
    material: document.getElementById('material-view')
};

function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    window.scrollTo(0,0);
}

// 1. Initialize Departments
function showHome() {
    const deptList = document.getElementById('dept-list');
    deptList.innerHTML = '';
    Object.keys(WEBSITE_DATA).forEach(dept => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h3>${dept}</h3>`;
        div.onclick = () => showSemesters(dept);
        deptList.appendChild(div);
    });
    switchView('home');
}

// 2. Show Semesters
function showSemesters(dept) {
    state.dept = dept;
    document.getElementById('dept-title').innerText = dept;
    const semList = document.getElementById('sem-list');
    semList.innerHTML = '';
    
    for(let i=1; i<=8; i++) {
        const semKey = `Sem ${i}`;
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h3>Semester ${i}</h3>`;
        div.onclick = () => showSubjects(semKey);
        semList.appendChild(div);
    }
    switchView('sem');
}

// 3. Show Subjects
function showSubjects(sem) {
    state.sem = sem;
    document.getElementById('sem-title').innerText = `${state.dept} - ${sem}`;
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    const subjects = WEBSITE_DATA[state.dept][sem] || [];
    
    if(subjects.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No subjects found for this semester.</p>';
    }

    subjects.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'subject-item';
        div.innerHTML = `<div><strong>${sub.code}</strong> ${sub.name}</div><span>➔</span>`;
        div.onclick = () => showMaterials(sub);
        container.appendChild(div);
    });
    
    document.getElementById('back-to-sem').onclick = () => showSemesters(state.dept);
    switchView('subject');
}

// 4. Show Materials
function showMaterials(sub) {
    document.getElementById('material-title').innerText = sub.name;
    const container = document.getElementById('materials-container');
    
    // Use '#' as placeholder if link is missing
    const links = {
        notes: sub.notes || '#',
        qb: sub.qbank || '#',
        qp: sub.qp || '#',
        imp: sub.important || '#',
        lab: sub.lab || '#'
    };

    container.innerHTML = `
        <div class="material-group">
            <div class="btn-grid">
                <a href="${links.notes}" target="_blank" class="pdf-btn">📄 Unit Notes</a>
                <a href="${links.qb}" target="_blank" class="pdf-btn">📚 Question Bank</a>
                <a href="${links.qp}" target="_blank" class="pdf-btn">📝 Previous Year QP</a>
                <a href="${links.imp}" target="_blank" class="pdf-btn">⭐ Important Questions</a>
                <a href="${links.lab}" target="_blank" class="pdf-btn">🧪 Lab Materials</a>
            </div>
        </div>
    `;
    document.getElementById('back-to-sub').onclick = () => showSubjects(state.sem);
    switchView('material');
}

// 5. Search
const searchInput = document.getElementById('main-search');
const resultsDiv = document.getElementById('search-results');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if(query.length < 2) { resultsDiv.innerHTML = ''; return; }

    let html = '';
    Object.keys(WEBSITE_DATA).forEach(dept => {
        Object.keys(WEBSITE_DATA[dept]).forEach(sem => {
            WEBSITE_DATA[dept][sem].forEach(sub => {
                if(sub.name.toLowerCase().includes(query) || sub.code.toLowerCase().includes(query)) {
                    html += `<div class="search-item" onclick="handleSearchClick('${dept}', '${sem}', '${sub.code}')">
                        ${sub.code} - ${sub.name} (${dept})
                    </div>`;
                }
            });
        });
    });
    resultsDiv.innerHTML = html;
});

function handleSearchClick(dept, sem, code) {
    state.dept = dept;
    state.sem = sem;
    const sub = WEBSITE_DATA[dept][sem].find(s => s.code === code);
    showMaterials(sub);
    searchInput.value = '';
    resultsDiv.innerHTML = '';
}

// 6. Theme & Init
document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('dark-mode');
showHome();