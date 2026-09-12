# ACADRIX PDF-First Library

Study PDFs are stored directly in this repository. The website discovers them automatically from GitHub.

## Upload workflow

For Mechanical Engineering, place a PDF in:

`data/pdfs/mechanical/<regulation>/sem<semester>/<subject-code>/`

Examples:

- `data/pdfs/mechanical/r2025/sem2/MA25C02/`
- `data/pdfs/mechanical/r2025/sem1/MA25C01/`
- `data/pdfs/mechanical/r2025/sem1/ME25C03/`
- `data/pdfs/mechanical/r2021/sem5/ME3592/`

## The new rule

**Upload PDF → commit → done.**

You do NOT need to:

- convert the PDF into JSON
- paste the PDF text into ChatGPT
- create a question bank just to display the PDF
- edit subject JSON merely to make the PDF appear

The ACADRIX subject dashboard checks the corresponding GitHub folder and lists every `.pdf` file automatically.

## Naming

Use clear filenames, for example:

- `Unit_1_Notes.pdf`
- `Unit_2_Notes.pdf`
- `Question_Paper_April_May_2024.pdf`
- `Full_Notes.pdf`
- `Important_Questions.pdf`

The filename is displayed as the resource title.

## Important

GitHub Pages must finish deploying the commit before a newly uploaded PDF appears on the live website. Existing structured quiz JSON remains available for the R-2025 Quick Quiz; PDFs are now the default method for large study-material resources.
