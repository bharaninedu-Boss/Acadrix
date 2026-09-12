# ACADRIX — Engineering Study Hub

ACADRIX is a GitHub Pages study-resource portal for engineering students. The website keeps curriculum/navigation data lightweight and uses GitHub-hosted PDFs as the primary large-resource format.

## PDF-first architecture

**New rule: upload the PDF to GitHub and that's it.**

For Mechanical Engineering, upload files to:

`data/pdfs/mechanical/<regulation>/sem<semester>/<subject-code>/`

Examples:
- `data/pdfs/mechanical/r2025/sem2/MA25C02/`
- `data/pdfs/mechanical/r2025/sem1/MA25C01/`
- `data/pdfs/mechanical/r2025/sem1/ME25C03/`
- `data/pdfs/mechanical/r2021/sem5/ME3592/`

The ACADRIX subject dashboard uses the public GitHub Contents API to discover `.pdf` files in the subject folder. No PDF text needs to be copied into JSON and no ChatGPT/token processing is needed just to publish a PDF.

### Upload workflow
1. Open the repository on GitHub.
2. Open the correct subject folder under `data/pdfs/`.
3. Upload the PDF.
4. Commit to `main`.
5. GitHub Pages deploys it; the subject dashboard automatically lists it.

Clear filenames are recommended, such as `Unit_1_Notes.pdf`, `Full_Notes.pdf`, `Question_Paper_2024.pdf`, `Important_Questions.pdf`.

### Important technical note
GitHub Pages is a static host, so it cannot magically scan repository folders by itself. ACADRIX therefore reads the public GitHub folder listing at runtime. This means no manual resource JSON is required for PDFs, while the actual PDF remains a normal GitHub file served by GitHub Pages.

## Existing academic data
Semester JSON files remain useful for lightweight curriculum information: subject code, subject name, credits, units and other navigation metadata. They should not contain large copied PDF text.

R-2025 has a separate 1-mark quiz/question-bank system. Those small structured JSON files remain in place because the quiz needs question/answer data; they are separate from the new PDF-first study-material workflow.

## Regulation separation
R-2025 and R-2021 Mechanical Engineering resources remain separate. PDF folders preserve the same separation.

## Site
`https://bharaninedu-boss.github.io/Acadrix/`

## Repository
`https://github.com/bharaninedu-Boss/Acadrix`
