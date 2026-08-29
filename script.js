/**
 * AU NOTES - ACADEMIC DATA
 * Use this section to add new subjects, PDFs, and links.
 */
const ACADEMIC_DATA = {
    departments: [
        { id: "mech", name: "Mechanical Engineering", icon: "⚙️" },
        { id: "cse", name: "Computer Science", icon: "💻" },
        { id: "ece", name: "Electronics & Communication", icon: "📟" },
        { id: "eee", name: "Electrical & Electronics", icon: "⚡" },
        { id: "it", name: "Information Technology", icon: "🌐" },
        { id: "civil", name: "Civil Engineering", icon: "🏗️" }
    ],
    subjects: {
        "mech-r2021-sem1": [
            { code: "MA3151", name: "Matrices and Calculus", units: ["Matrices", "Differential Calculus", "Functions of Several Variables", "Integral Calculus", "Multiple Integrals"], popular: true },
            { code: "PH3151", name: "Engineering Physics", units: ["Mechanics", "Oscillations, Optics and Lasers", "Quantum Physics", "Applied Quantum Mechanics", "Laser and Fiber Optics"] },
            { code: "CY3151", name: "Engineering Chemistry", units: ["Water and Its Treatment", "Nano Chemistry", "Phase Rule and Alloys", "Fuels and Combustion", "Energy Sources and Storage Devices"] },
            { code: "GE3151", name: "Problem Solving and Python Programming", units: ["Computational Thinking & Problem Solving", "Data, Expressions, Statements", "Control Flow, Functions", "Lists, Tuples, Dictionaries", "Files, Modules, Packages"] },
            { code: "HS3152", name: "Professional English - I", units: ["Content to be added", "Content to be added", "Content to be added", "Content to be added", "Content to be added"] },
            { code: "GE3152", name: "Heritage of Tamils", units: ["Content to be added", "Content to be added", "Content to be added", "Content to be added", "Content to be added"] }
        ],
        "mech-r2021-sem2": [
            { code: "HS3252", name: "Professional English - II", units: ["Content to be added", "Content to be added", "Content to be added", "Content to be added", "Content to be added"] },
            { code: "MA3251", name: "Statistics and Numerical Methods", units: ["Testing of Hypothesis", "Design of Experiments", "Solution of Equations", "Interpolation and Approximation", "Numerical Integration"] },
            { code: "PH3251", name: "Materials Science", units: ["Crystallography", "Phase Diagrams", "Mechanical Properties", "Magnetic, Dielectric & Optical Materials", "New Materials"] },
            { code: "BE3251", name: "Basic Electrical and Electronics Engineering", units: ["Electrical Circuits", "Electrical Machines", "Utilization of Electrical Energy", "Electronic Circuits", "Digital Electronics"] },
            { code: "GE3251", name: "Engineering Graphics", units: ["Plane Curves and Freehand Sketching", "Projection of Points, Lines and Plane Surfaces", "Projection of Solids", "Projection of Sectioned Solids and Development of Surfaces", "Isometric and Perspective Projections"] }
        ],
        "mech-r2021-sem3": [
            { 
                code: "ME3391", 
                name: "Engineering Thermodynamics", 
                units: ["Basic Concepts and First Law", "Second Law and Availability", "Properties of Pure Substance and Steam Power Cycle", "Ideal and Real Gases", "Psychrometry"],
                notes: { u1: "https://example.com/notes1", u2: "#", u3: "#", u4: "#", u5: "#" },
                pyqs: { "2023": "https://example.com/pyq23", "2022": "#" },
                videos: [{ title: "First Law Explained", channel: "Mech Master", url: "https://youtube.com" }]
            },
            { code: "MA3351", name: "Transforms and Partial Differential Equations", units: ["Partial Differential Equations", "Fourier Series", "Applications of Partial Differential Equations", "Fourier Transforms", "Z-transforms and Difference Equations"] },
            { code: "ME3351", name: "Engineering Mechanics", units: ["Statics of Particles", "Equilibrium of Rigid Bodies", "Properties of Surfaces and Solids", "Dynamics of Particles", "Friction and Rigid Body Dynamics"] },
            { code: "CE3391", name: "Fluid Mechanics and Machinery", units: ["Fluid Properties and Flow Characteristics", "Flow Through Pipes and Boundary Layer", "Dimensional Analysis and Model Studies", "Turbines", "Pumps"] }
        ],
        "mech-r2021-sem4": [
            { code: "ME3491", name: "Theory of Machines", units: ["Mechanisms", "Kinematics of Linkage Mechanisms", "Kinematics of Cam Mechanisms", "Gears and Gear Trains", "Friction and Force Analysis"] },
            { code: "ME3451", name: "Thermal Engineering", units: ["Gas and Combined Power Cycles", "Internal Combustion Engines", "Steam Nozzles and Turbines", "Air Compressors", "Refrigeration and Air Conditioning"] }
        ],
        "mech-r2021-sem5": [
            { code: "ME3591", name: "Design of Machine Elements", units: ["Steady and Variable Stresses", "Shafts and Couplings", "Temporary and Permanent Joints", "Energy Storing Elements", "Bearings"], formula: "https://example.com/formula-dme" },
            { code: "ME3592", name: "Metrology and Measurements", units: ["Basics of Metrology", "Linear and Angular Measurements", "Form Measurement", "Laser and Advances in Metrology", "Measurement of Mechanical Parameters"] }
        ]
        // You can add sem6, sem7, sem8 following the same pattern
    }
};

// State Management
let currentState = {
    view: 'home',
    dept: null,
    sem: null,
    subject: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    render();
    
    // Back button support
    window.onpopstate = () => {
        const state = window.history.state;
        if(state) {
            currentState = state;
            render(false);
        }
    };
});

// Theme Logic
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    document.getElementById('themeToggle').textContent = savedTheme === 'light-theme' ? '🌙' : '☀️';
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark-theme' : 'light-theme';
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
    });
}

// Navigation Router
function navigateTo(view, params = {}) {
    currentState = { view, ...params };
    window.history.pushState(currentState, '', '');
    render();
}

function render(pushHistory = true) {
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear current content

    switch(currentState.view) {
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
    }
    window.scrollTo(0,0);
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
    `;

    const grid = document.getElementById('deptGrid');
    ACADEMIC_DATA.departments.forEach(dept => {
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
}

// VIEW: Semesters
function renderSemesters(container, deptId) {
    const dept = ACADEMIC_DATA.departments.find(d => d.id === deptId);
    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> > ${dept.name}</div>
        <h2>Select Semester</h2>
        <div class="grid">
            ${[1,2,3,4,5,6,7,8].map(num => `
                <div class="card" onclick="navigateTo('subjects', { dept: '${deptId}', sem: ${num} })">
                    <h3>Semester ${num}</h3>
                    <p>${dept.name} - R2021</p>
                </div>
            `).join('')}
        </div>
    `;
}

// VIEW: Subjects List
function renderSubjects(container, deptId, sem) {
    const key = `${deptId}-r2021-sem${sem}`;
    const subjects = ACADEMIC_DATA.subjects[key] || [];
    
    container.innerHTML = `
        <div class="breadcrumb">
            <span onclick="navigateTo('home')">Home</span> > 
            <span onclick="navigateTo('semesters', {dept: '${deptId}'})">${deptId.toUpperCase()}</span> > 
            Semester ${sem}
        </div>
        <h2>Subjects</h2>
        <div class="grid">
            ${subjects.length > 0 ? subjects.map(s => `
                <div class="card" onclick="navigateTo('details', { subjectCode: '${s.code}' })">
                    <p style="color: var(--accent-color); font-weight: bold;">${s.code}</p>
                    <h3>${s.name}</h3>
                    <p>View Study Materials →</p>
                </div>
            `).join('') : '<p>Content coming soon for this semester.</p>'}
        </div>
    `;
}

// VIEW: Subject Details
function renderSubjectDetails(container, code) {
    // Find subject in data
    let subject = null;
    for (let key in ACADEMIC_DATA.subjects) {
        subject = ACADEMIC_DATA.subjects[key].find(s => s.code === code);
        if (subject) break;
    }

    if (!subject) {
        container.innerHTML = "Subject not found.";
        return;
    }

    container.innerHTML = `
        <div class="breadcrumb"><span onclick="navigateTo('home')">Home</span> > ${code}</div>
        <div class="subject-header">
            <p>${code}</p>
            <h1>${subject.name}</h1>
            <p>Regulation 2021 • Anna University</p>
        </div>

        <div class="resource-section">
            <h3>📚 Unit-wise Notes</h3>
            <div class="unit-grid">
                ${subject.units.map((u, i) => {
                    const link = (subject.notes && subject.notes[`u${i+1}`]) || "#";
                    return `
                        <a href="${link}" class="resource-btn" ${link === "#" ? 'onclick="comingSoon(event)"' : 'target="_blank"'}>
                            Unit ${i+1}: ${u}
                        </a>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="grid">
            <div class="resource-section">
                <h3>📝 Previous Year Questions</h3>
                ${subject.pyqs ? Object.entries(subject.pyqs).map(([year, url]) => `
                    <a href="${url}" class="resource-btn" style="margin-top:10px" target="_blank">Year ${year} Paper</a>
                `).join('') : '<p>Coming soon</p>'}
            </div>
            
            <div class="resource-section">
                <h3>🎯 Exam Prep</h3>
                <a href="${subject.qbank || '#'}" class="resource-btn" onclick="${!subject.qbank ? 'comingSoon(event)' : ''}" style="margin-top:10px">Question Bank</a>
                <a href="${subject.imp || '#'}" class="resource-btn" onclick="${!subject.imp ? 'comingSoon(event)' : ''}" style="margin-top:10px">Important Questions</a>
                ${subject.formula ? `<a href="${subject.formula}" class="resource-btn" style="margin-top:10px" target="_blank">Formula Sheet</a>` : ''}
            </div>
        </div>

        <div class="resource-section">
            <h3>🎥 Recommended Videos</h3>
            ${subject.videos ? subject.videos.map(v => `
                <div class="video-card">
                    <div>
                        <p><strong>${v.title}</strong></p>
                        <p style="font-size:0.8rem; color:var(--text-secondary)">Channel: ${v.channel}</p>
                    </div>
                    <a href="${v.url}" target="_blank" class="resource-btn">Watch →</a>
                </div>
            `).join('') : '<p>No videos recommended yet.</p>'}
        </div>
    `;
}

// Search Logic
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    let matches = [];
    Object.values(ACADEMIC_DATA.subjects).flat().forEach(s => {
        if (s.code.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)) {
            matches.push(s);
        }
    });

    if (matches.length > 0) {
        resultsDiv.innerHTML = matches.map(m => `
            <div class="search-item" onclick="selectSearch('${m.code}')">
                <strong>${m.code}</strong><br>
                <small>${m.name}</small>
            </div>
        `).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
}

function selectSearch(code) {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchInput').value = '';
    navigateTo('details', { subjectCode: code });
}

function comingSoon(e) {
    e.preventDefault();
    alert("This resource is coming soon! We are currently uploading notes.");
}