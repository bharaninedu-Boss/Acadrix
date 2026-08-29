/* =========================================================
   AU NOTES
   Anna University - R2021
   Clean JavaScript
   ========================================================= */

const DATA = {

    departments: {

        "Computer Science": {
            id: "CSE",
            semesters: {}
        },

        "Mechanical Engineering": {
            id: "Mech",

            semesters: {

                "Semester 1": [],

                "Semester 2": [],

                "Semester 3": [],

                "Semester 4": [],

                "Semester 5": [],

                "Semester 6": [],

                "Semester 7": [],

                "Semester 8": []

            }
        },

        "Electronics & Communication": {
            id: "ECE",
            semesters: {}
        },

        "Electrical & Electronics": {
            id: "EEE",
            semesters: {}
        },

        "Information Technology": {
            id: "IT",
            semesters: {}
        },

        "Civil Engineering": {
            id: "Civil",
            semesters: {}
        }

    }

};


/* =========================================================
   SUBJECT CREATOR
   ========================================================= */

function createSubject(code, name, popular = false) {

    return {

        code: code,

        name: name,

        popular: popular,

        units: [

            {
                n: 1,
                title: "Unit 1",
                link: "#"
            },

            {
                n: 2,
                title: "Unit 2",
                link: "#"
            },

            {
                n: 3,
                title: "Unit 3",
                link: "#"
            },

            {
                n: 4,
                title: "Unit 4",
                link: "#"
            },

            {
                n: 5,
                title: "Unit 5",
                link: "#"
            }

        ],

        pyq: "#",

        qbank: "#",

        imp: "#",

        videos: []

    };

}


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const appState = {

    department: null,

    semester: null,

    subject: null,

    history: []

};


/* =========================================================
   HELPER
   ========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   HIDE ALL VIEWS
   ========================================================= */

function hideAllViews() {

    const views = [

        "home-view",

        "sem-view",

        "subject-view",

        "material-view"

    ];

    views.forEach(function(id) {

        const element = getElement(id);

        if (element) {

            element.classList.add("hidden");

        }

    });

}


/* =========================================================
   HOME
   ========================================================= */

function showHome() {

    hideAllViews();

    const home = getElement("home-view");

    if (home) {

        home.classList.remove("hidden");

    }

    renderDepartments();

}


/* =========================================================
   RENDER DEPARTMENTS
   ========================================================= */

function renderDepartments() {

    const container = getElement("dept-list");

    if (!container) return;

    container.innerHTML = "";

    Object.keys(DATA.departments).forEach(function(departmentName) {

        const card = document.createElement("div");

        card.className = "dept-card";

        card.innerHTML = `

            <span>${escapeHTML(departmentName)}</span>

            <span>→</span>

        `;

        card.addEventListener("click", function() {

            appState.history.push("home");

            appState.department = departmentName;

            showSemesters();

        });

        container.appendChild(card);

    });

}


/* =========================================================
   SEMESTERS
   ========================================================= */

function showSemesters() {

    hideAllViews();

    const view = getElement("sem-view");

    if (view) {

        view.classList.remove("hidden");

    }

    renderSemesters();

}


/* =========================================================
   RENDER SEMESTERS
   ========================================================= */

function renderSemesters() {

    const title = getElement("dept-title");

    const container = getElement("sem-list");

    if (title) {

        title.textContent = appState.department || "Department";

    }

    if (!container) return;

    container.innerHTML = "";

    const department =
        DATA.departments[appState.department];

    if (!department) return;

    for (let i = 1; i <= 8; i++) {

        const semesterName =
            "Semester " + i;

        const card =
            document.createElement("div");

        card.className = "dept-card";

        card.innerHTML = `

            <span>${semesterName}</span>

            <span>→</span>

        `;

        card.addEventListener("click", function() {

            appState.history.push("semesters");

            appState.semester = semesterName;

            showSubjects();

        });

        container.appendChild(card);

    }

}


/* =========================================================
   SUBJECTS
   ========================================================= */

function showSubjects() {

    hideAllViews();

    const view = getElement("subject-view");

    if (view) {

        view.classList.remove("hidden");

    }

    renderSubjects();

}


/* =========================================================
   RENDER SUBJECTS
   ========================================================= */

function renderSubjects() {

    const title = getElement("sem-title");

    const container =
        getElement("subjects-container");

    if (title) {

        title.textContent =
            appState.department +
            " • " +
            appState.semester;

    }

    if (!container) return;

    container.innerHTML = "";

    const subjects =
        DATA.departments[
            appState.department
        ]?.semesters[
            appState.semester
        ] || [];

    if (subjects.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Subjects will be added here.
                </p>

            </div>

        `;

        return;

    }

    subjects.forEach(function(subject) {

        const card =
            document.createElement("div");

        card.className = "subject-card";

        card.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(subject.code)}
                </strong>

                <span>
                    ${escapeHTML(subject.name)}
                </span>

            </div>

            <span>→</span>

        `;

        card.addEventListener("click", function() {

            appState.history.push("subjects");

            appState.subject = subject;

            showMaterial();

        });

        container.appendChild(card);

    });

}


/* =========================================================
   MATERIAL PAGE
   ========================================================= */

function showMaterial() {

    hideAllViews();

    const view =
        getElement("material-view");

    if (view) {

        view.classList.remove("hidden");

    }

    renderMaterial();

}


/* =========================================================
   RENDER MATERIAL
   ========================================================= */

function renderMaterial() {

    const subject =
        appState.subject;

    if (!subject) return;

    const code =
        getElement("mat-code");

    const title =
        getElement("mat-title");

    if (code) {

        code.textContent =
            subject.code;

    }

    if (title) {

        title.textContent =
            subject.name;

    }

    renderUnits(subject);

    renderResources(subject);

    renderVideos(subject);

}


/* =========================================================
   UNITS
   ========================================================= */

function renderUnits(subject) {

    const container =
        getElement("unit-container");

    if (!container) return;

    container.innerHTML = "";

    subject.units.forEach(function(unit) {

        const item =
            document.createElement("div");

        item.className =
            "unit-item";

        item.innerHTML = `

            <div>

                <strong>
                    Unit ${unit.n}
                </strong>

                <span>
                    ${escapeHTML(unit.title)}
                </span>

            </div>

            <a
                href="${safeURL(unit.link)}"
                class="pdf-link"
            >
                View PDF
            </a>

        `;

        container.appendChild(item);

    });

}


/* =========================================================
   RESOURCES
   ========================================================= */

function renderResources(subject) {

    const container =
        getElement("extra-resources");

    if (!container) return;

    container.innerHTML = `

        <a
            href="${safeURL(subject.pyq)}"
            class="res-btn"
        >
            Previous Year Questions
        </a>

        <a
            href="${safeURL(subject.qbank)}"
            class="res-btn"
        >
            Question Bank
        </a>

        <a
            href="${safeURL(subject.imp)}"
            class="res-btn"
        >
            Important Questions
        </a>

    `;

}


/* =========================================================
   VIDEOS
   ========================================================= */

function renderVideos(subject) {

    const container =
        getElement("video-container");

    if (!container) return;

    container.innerHTML = "";

    if (!subject.videos ||
        subject.videos.length === 0) {

        container.innerHTML = `

            <p class="muted">
                No videos added yet.
            </p>

        `;

        return;

    }

    subject.videos.forEach(function(video) {

        const link =
            document.createElement("a");

        link.href =
            safeURL(video.url);

        link.target =
            "_blank";

        link.rel =
            "noopener";

        link.className =
            "vid-link";

        link.textContent =
            video.title;

        container.appendChild(link);

    });

}


/* =========================================================
   BACK
   ========================================================= */

function goBack() {

    const previous =
        appState.history.pop();

    if (previous === "home") {

        showHome();

        return;

    }

    if (previous === "semesters") {

        showSemesters();

        return;

    }

    if (previous === "subjects") {

        showSubjects();

        return;

    }

    showHome();

}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeURL(value) {

    if (!value || value === "#") {

        return "#";

    }

    try {

        const url =
            new URL(
                value,
                window.location.href
            );

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return url.href;

        }

    } catch (error) {

        return "#";

    }

    return "#";

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const input =
        getElement("main-search");

    const results =
        getElement("search-results");

    if (!input || !results) return;

    input.addEventListener(
        "input",
        function() {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            results.innerHTML = "";

            if (query.length < 2) return;

            const matches = [];

            Object.entries(
                DATA.departments
            ).forEach(
                function([departmentName, department]) {

                    Object.entries(
                        department.semesters || {}
                    ).forEach(
                        function([semesterName, subjects]) {

                            subjects.forEach(
                                function(subject) {

                                    const text =
                                        (
                                            subject.code +
                                            " " +
                                            subject.name +
                                            " " +
                                            departmentName +
                                            " " +
                                            semesterName
                                        ).toLowerCase();

                                    if (
                                        text.includes(query)
                                    ) {

                                        matches.push({
                                            departmentName,
                                            semesterName,
                                            subject
                                        });

                                    }

                                }
                            );

                        }
                    );

                }
            );

            matches.forEach(
                function(match) {

                    const item =
                        document.createElement("div");

                    item.className =
                        "search-item";

                    item.innerHTML = `

                        <strong>
                            ${escapeHTML(
                                match.subject.code
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                match.subject.name
                            )}
                        </span>

                        <small>
                            ${escapeHTML(
                                match.departmentName
                            )}
                            •
                            ${escapeHTML(
                                match.semesterName
                            )}
                        </small>

                    `;

                    item.addEventListener(
                        "click",
                        function() {

                            appState.department =
                                match.departmentName;

                            appState.semester =
                                match.semesterName;

                            appState.subject =
                                match.subject;

                            input.value = "";

                            results.innerHTML = "";

                            showMaterial();

                        }
                    );

                    results.appendChild(item);

                }
            );

            if (!matches.length) {

                results.innerHTML = `

                    <p class="muted">
                        No matching subjects found.
                    </p>

                `;

            }

        }
    );

}


/* =========================================================
   THEME
   ========================================================= */

function setupTheme() {

    const button =
        getElement("theme-toggle");

    const saved =
        localStorage.getItem(
            "au-notes-theme"
        );

    if (saved === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

    }

    if (!button) return;

    button.addEventListener(
        "click",
        function() {

            const dark =
                document.body.classList.toggle(
                    "dark-mode"
                );

            localStorage.setItem(
                "au-notes-theme",
                dark ? "dark" : "light"
            );

        }
    );

}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupSearch();

        setupTheme();

        showHome();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.goBack = goBack;

window.showHome = showHome;

window.showSemesters = showSemesters;

window.showSubjects = showSubjects;

window.showMaterial = showMaterial;

window.DATA = DATA;
