# MECH-KUTTY — AU Notes

This repository contains a static single-page site (SPA) for "AU Notes" — an Anna University engineering resource portal. The site is data-driven and loads academic content from JSON files in the `data/` folder.

This README documents the JSON schema, how to add subjects and PDFs, and describes key behaviors added by the latest updates.

---

## What I changed recently
- Made every department/semester/subject card fully clickable and keyboard accessible.
- Implemented hash routing for shareable URLs (no server routing needed):
  - Home: `#/` or no hash
  - Department: `#/dept/<deptId>` (e.g. `#/dept/mech`)
  - Semester: `#/dept/<deptId>/sem<N>` (e.g. `#/dept/mech/sem4`)
  - Subject: `#/dept/<deptId>/sem<N>/<subjectCode>` (e.g. `#/dept/mech/sem4/ME4301`)
- Search is global (header) and works on subject code, subject name, unit names and department names.
- Added Popular Subjects and Recently Added sections on the homepage, generated from JSON.
- Subject detail pages show unit cards and resource cards. Available resources are clickable; missing resources show "⏳ Coming Soon".
- Improved mobile navigation (hamburger) and touch targets.
- Added keyboard navigation for search results and unit deep-linking support.

---

## JSON schema (recommended)
Place department data under `data/<deptFolder>/sem<N>.json`.

Two supported shapes for `sem<N>.json`:
1) Array of subject objects (recommended):

```json
[
  {
    "code": "ME4301",
    "name": "THERMAL ENGINEERING",
    "updated": "2026-08-29",
    "popular": true,
    "units": [
      { "name": "Basic Concepts and Properties of Pure Substances", "notes": "data/mechanical/ME4301_unit1.pdf" },
      { "name": "Gas Power Cycles", "notes": "data/mechanical/ME4301_unit2.pdf" }
    ],
    "pyqs": [ { "year": "2024", "link": "data/mechanical/ME4301_PYQ_2024.pdf" } ],
    "videos": [ { "title": "Lecture 1", "channel": "Channel", "url":"https://youtube.com/..." } ],
    "questionBank": "data/mechanical/ME4301_QB.pdf",
    "importantQuestions": "data/mechanical/ME4301_IMP.pdf",
    "formulaSheet": "data/mechanical/ME4301_FORM.pdf",
    "solvedProblems": "data/mechanical/ME4301_SOLVED.pdf"
  }
]
```

2) Object with `semester` and `subjects` (legacy):

```json
{
  "semester": 4,
  "subjects": [ ... same subject objects ... ]
}
```

Notes:
- If a resource is not available, omit the field or set it to null; do not use `"#"` as a link placeholder.
- Use relative repository paths for PDFs (e.g. `data/mechanical/...pdf`) so links work on GitHub Pages.

---

## How to add a subject
1. Upload PDF files to `data/<deptFolder>/` (create folder if it does not exist).
2. Edit `data/<deptFolder>/sem<N>.json` and add a subject object following the schema above.
3. Add `"updated": "YYYY-MM-DD"` to show up in Recently Added.
4. Commit the change — the site will load JSON dynamically.

---

## How to add a PDF
1. Add the PDF to the repo (e.g., `data/mechanical/ME4301_unit1.pdf`).
2. In the subject JSON, set the resource field to the relative path (e.g., `units[0].notes = "data/mechanical/ME4301_unit1.pdf"`).
3. Commit. Links open in a new tab.

---

## Developer notes
- Data loader supports both array and `{semester, subjects}` shapes.
- Search indexing is lazy and happens on first search; for very large datasets this can take time — consider pre-building an index if performance becomes an issue.
- Search keyboard: use ArrowDown/ArrowUp to navigate results and Enter to open.
- Unit deep-linking: search result entries that contain a unit will open the subject page; when available the UI will attempt to scroll to the unit card automatically.

---

If you'd like, I can:
- Populate other departments' JSON files using available syllabus PDFs (needs manual review),
- Add an admin page to preview and edit JSON within the browser (requires more work), or
- Add automatic PDF metadata extraction & indexing (experimental).

If you want me to proceed with populating other departments from your B.E.Mech.pdf automatically, confirm and I will attempt to extract headings/topics and draft JSON entries (you will need to review them).
