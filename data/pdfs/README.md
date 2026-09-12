# ACADRIX PDF-First Library

Study PDFs are stored directly in this repository. The website discovers them automatically from GitHub.

## Upload workflow

For Mechanical Engineering, place each PDF in the correct category:

`data/pdfs/mechanical/<regulation>/sem<semester>/<subject-code>/<category>/`

Supported categories:

- `notes` — Notes / Study Materials
- `pyq` — Previous Year Question Papers (PYQ)
- `important-questions` — Important Questions
- `syllabus` — Syllabus
- `lab-manual` — Lab Manual / Practical Resources

Examples:

- `data/pdfs/mechanical/r2025/sem2/MA25C02/notes/Unit_1_Notes.pdf`
- `data/pdfs/mechanical/r2025/sem2/MA25C02/pyq/April_May_2025.pdf`
- `data/pdfs/mechanical/r2025/sem1/MA25C01/notes/Full_Notes.pdf`
- `data/pdfs/mechanical/r2025/sem1/MA25C01/important-questions/Unit_1_Important.pdf`
- `data/pdfs/mechanical/r2021/sem5/ME3592/pyq/November_December_2024.pdf`
- `data/pdfs/mechanical/r2021/sem5/ME3592/lab-manual/Metrology_Lab_Manual.pdf`

## The new rule

**Upload PDF → put it in the correct category → commit → done.**

You do NOT need to:

- convert the PDF into JSON
- paste the PDF text into ChatGPT
- create a question bank just to display the PDF
- edit subject JSON merely to make the PDF appear

The ACADRIX subject dashboard checks all five category folders and lists every `.pdf` file automatically.

## Naming

Use clear filenames, for example:

- `Unit_1_Notes.pdf`
- `Unit_2_Notes.pdf`
- `Question_Paper_April_May_2024.pdf`
- `Full_Notes.pdf`
- `Important_Questions.pdf`
- `Lab_Manual.pdf`
- `Syllabus.pdf`

The filename is displayed as the resource title.

## Important

GitHub Pages must finish deploying the commit before a newly uploaded PDF appears on the live website. Existing structured quiz JSON remains available for the R-2025 Quick Quiz; PDFs are now the default method for large study-material resources.
