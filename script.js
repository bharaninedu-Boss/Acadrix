/**
 * DATA CONFIGURATION
 * Add/Edit subjects here.
 */
const DATA = {
    departments: {
        "Computer Science": {
            id: "CSE",
            semesters: {
                "Semester 1": [
                    { 
                        code: "GE3151", name: "Problem Solving and Python Programming", popular: true,
                        units: [
                            { n: 1, title: "Computational Thinking", link: "#" },
                            { n: 2, title: "Data, Expressions, Statements", link: "#" },
                            { n: 3, title: "Control Flow, Functions", link: "#" },
                            { n: 4, title: "Lists, Tuples, Dictionaries", link: "#" },
                            { n: 5, title: "Files, Modules, Packages", link: "#" }
                        ],
                        pyq: "https://example.com/pyq.pdf",
                        qbank: "https://example.com/qb.pdf",
                        imp: "#",
                        videos: [{ title: "Python Full Course", url: "#" }]
                    }
                ],
                "Semester 3": [
                    { 
                        code: "CS3301", name: "Data Structures", popular: true,
                        units: [
                            { n: 1, title: "Linear Data Structures", link: "#" },
                            { n: 2, title: "Non-Linear Data Structures - Trees", link: "#" },
                            { n: 3, title: "Non-Linear Data Structures - Graphs", link: "#" },
                            { n: 4, title: "Searching and Sorting", link: "#" },
                            { n: 5, title: "Hashing and Storage Strategies", link: "#" }
                        ],
                        pyq: "#", qbank: "#", imp: "#",
                        videos: [{ title: "DS Unit 1", url: "#" }]
                    }
                ]
            }
        },
        "Mechanical Engineering": {
            id: "Mech",
            semesters: {
                "Semester 1": [
                    { 
                        code: "MA3151", name: "Matrices and Calculus", popular: true,
                        units: [
                            { n: 1, title: "Matrices", link: "#" },
                            { n: 2, title: "Differential Calculus", link: "#" },
                            { n: 3, title: "Functions of Several Variables", link: "#" },
                            { n: 4, title: "Integral Calculus", link: "#" },
                            { n: 5, title: "Multiple Integrals", link: "#" }
                        ],
                        pyq: "#", qbank: "#", imp: "#"
                    }
                ]
            }
        },
        "Electronics & Communication": { id: "ECE", semesters: {} },
        "Electrical & Electronics": { id: "EEE", semesters: {} },
        "Information Technology": { id: "IT", semesters: {} },
        "Civil Engineering": { id: "Civil", semesters: {} }
    }
};

// State management
let currentState = {
    view: 'home',
    dept: null,
    sem: null,
    subject: null,
    history: []
};

// UI Components
const views = {
    home: document.getElementById('home-view'),
    sem: document.getElementById('sem-view'),
    subjectList: document.getElementById('subject-view'),
    material: document.getElementById('material-view')
};

/**
 * Navigation Core
 */
function navigateTo(view, params = {}) {
    // Hide all views
    Object.values(views).forEach(v => v.classList.add('hidden'));
    
    currentState.view = view;
    window.scrollTo(0, 0);

    if (view === 'home') {
        renderHome();
        views.home.classList.remove('hidden');
        updateBreadcrumbs(['Home']);
    } 
    else if (view === 'sem') {
        currentState.dept = params.dept;
        renderSemesters(params.dept);
        views.sem.classList.remove('hidden');
        updateBreadcrumbs(['Home', params.dept]);
    } 
    else if (view === 'subjectList') {
        currentState.dept = params.dept;
        currentState.sem = params.sem;
        renderSubjectList(params.dept, params.sem);
        views.subjectList.classList.remove('hidden');
        updateBreadcrumbs(['Home', params.dept, params.sem]);
    } 
    else if (view === 'material') {
        currentState.subject = params.subject;
        renderMaterial(params.subject);
        views.material.classList.remove('hidden');
        updateBreadcrumbs(['Home', currentState.dept, currentState.sem, params.subject.code]);
    }
}

function goBack() {
    if (currentState.view === 'material') navigateTo('subjectList', { dept: currentState.dept, sem: currentState.sem });
    else if (currentState.view === 'subjectList') navigateTo('sem', { dept: currentState.dept });
    else if (currentState.view === 'sem') navigateTo('home');
}

function updateBreadcrumbs(steps) {
    const bc = document.getElementById('breadcrumbs');
    bc.innerHTML = '';
    steps.forEach((step, index) => {
        const span = document.createElement('span');
        span.innerText = step;
        span.onclick = () => {
            if (index === 0) navigateTo('home');
            if (index === 1) navigateTo('sem', { dept: steps[1] });
            if (index === 2) navigateTo('subjectList', { dept: steps[1], sem: steps[2] });
        };
        bc.appendChild(span);
    });
    document.title = `${steps[steps.length - 1]} | AU Notes`;
}

/**
 * Render Functions
 */
function renderHome() {
    const deptList = document.getElementById('dept-list');
    const popularGrid = document.getElementById('popular-subjects');
    const recentList = document.getElementById('recent-materials');
    
    deptList.innerHTML = '';
    popularGrid.innerHTML = '';
    recentList.innerHTML = '';

    // Render Departments
    Object.keys(DATA.departments).forEach(name => {
        const div = document.createElement('div');
        div.className = 'dept-card';
        div.innerHTML = `${name} <span>➔</span>`;
        div.onclick = () => navigateTo('sem', { dept: name });
        deptList.appendChild(div);
    });

    // Render Popular & Recent (Sample Logic)
    Object.keys(DATA.departments).forEach(dName => {
        Object.keys(DATA.departments[dName].semesters).forEach(sName => {
            DATA.departments[dName].semesters[sName].forEach(sub => {
                if (sub.popular) {
                    const card = document.createElement('div');
                    card.className = 'sub-card';
                    card.innerHTML = `
                        <span class="code-badge">${sub.code}</span>
                        <h4>${sub.name}</h4>
                        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:10px;">${dName}</p>
                    `;
                    card.onclick = () => {
                        currentState.dept = dName;
                        currentState.sem = sName;
                        navigateTo('material', { subject: sub });
                    };
                    popularGrid.appendChild(card);
                }
            });
        });
    });
}

function renderSemesters(deptName) {
    document.getElementById('dept-title').innerText = deptName;
    const grid = document.getElementById('sem-list');
    grid.innerHTML = '';

    for (let i = 1; i <= 8; i++) {
        const semName = `Semester ${i}`;
        const div = document.createElement('div');
        div.className = 'dept-card'; // Reusing style
        div.style.padding = "30px 20px";
        div.innerHTML = `Semester ${i} <span>➔</span>`;
        div.onclick = () => navigateTo('subjectList', { dept: deptName, sem: semName });
        grid.appendChild(div);
    }
}

function renderSubjectList(dept, sem) {
    document.getElementById('sem-title').innerText = `${dept} - ${sem}`;
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';

    const subjects = DATA.departments[dept].semesters[sem] || [];

    if (subjects.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:var(--text-muted);">No subjects added for this semester yet.</p>';
        return;
    }

    subjects.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'dept-card';
        div.style.marginBottom = "10px";
        div.innerHTML = `<div><strong style="color:var(--primary); margin-right:15px;">${sub.code}</strong> ${sub.name}</div> <span>➔</span>`;
        div.onclick = () => navigateTo('material', { subject: sub });
        container.appendChild(div);
    });
}

function renderMaterial(sub) {
    document.getElementById('mat-code').innerText = sub.code;
    document.getElementById('mat-title').innerText = sub.name;
    
    const unitContainer = document.getElementById('unit-container');
    unitContainer.innerHTML = '';
    
    sub.units.forEach(u => {
        const div = document.createElement('div');
        div.className = 'unit-item';
        div.innerHTML = `
            <div><strong>Unit ${u.n}:</strong> ${u.title}</div>
            <a href="${u.link}" target="_blank" class="pdf-link">View PDF</a>
        `;
        unitContainer.appendChild(div);
    });

    const extra = document.getElementById('extra-resources');
    extra.innerHTML = `
        <a href="${sub.pyq || '#'}" class="res-btn">Previous Year QP</a>
        <a href="${sub.qbank || '#'}" class="res-btn">Question Bank</a>
        <a href="${sub.imp || '#'}" class="res-btn">Important Questions</a>
        <a href="#" class="res-btn">Solved Problems</a>
    `;

    const vidContainer = document.getElementById('video-container');
    vidContainer.innerHTML = '';
    if(sub.videos) {
        sub.videos.forEach(v => {
            vidContainer.innerHTML += `<a href="${v.url}" target="_blank" class="vid-link">▶ ${v.title}</a>`;
        });
    } else {
        vidContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No videos available.</p>';
    }
}

/**
 * Search Functionality
 */
const searchInput = document.getElementById('main-search');
const resultsDiv = document.getElementById('search-results');

searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (q.length < 2) { resultsDiv.innerHTML = ''; return; }

    let html = '';
    Object.keys(DATA.departments).forEach(dName => {
        Object.keys(DATA.departments[dName].semesters).forEach(sName => {
            DATA.departments[dName].semesters[sName].forEach(sub => {
                if (sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q)) {
                    html += `
                        <div class="search-item" onclick="selectSearchResult('${dName}', '${sName}', '${sub.code}')">
                            <span class="sub-code">${sub.code}</span>
                            <span class="sub-name">${sub.name}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted)">${dName} • ${sName}</span>
                        </div>
                    `;
                }
            });
        });
    });
    resultsDiv.innerHTML = html;
});

function selectSearchResult(dept, sem, code) {
    const sub = DATA.departments[dept].semesters[sem].find(s => s.code === code);
    currentState.dept = dept;
    currentState.sem = sem;
    navigateTo('material', { subject: sub });
    searchInput.value = '';
    resultsDiv.innerHTML = '';
}

// Theme Toggle
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
};

// Initial Load
navigateTo('home');