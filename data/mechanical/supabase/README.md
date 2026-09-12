# ACADRIX PYQ backend — Supabase

This directory contains the database foundation for the secure PYQ system.

## Architecture

- GitHub Pages remains the public ACADRIX frontend.
- Supabase Auth protects the admin area.
- Supabase Storage bucket `pyqs` stores PDF files privately.
- PostgreSQL tables `subjects` and `pyqs` store regulation, semester, subject, year and session metadata.
- Public users can read published metadata; they do not receive storage write access.
- Admin uploads should use authenticated server-side logic, not a GitHub token in browser code.

## Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `schema.sql`.
4. Create an admin user in Supabase Authentication.
5. Configure the ACADRIX frontend with the Supabase project URL and public anon key.
6. Add a server-side Edge Function for admin upload. The function should verify the authenticated user, validate PDF MIME type/size, upload to the private `pyqs` bucket, then insert the matching `pyqs` row.
7. Configure the public PYQ listing to query only `status = 'published'` rows and generate signed download URLs for PDFs.

## Important security rule

Never put a Supabase service-role key in GitHub Pages or browser JavaScript. Only the public anon key belongs in the frontend. All privileged storage/database writes must be authenticated and server-side.

## Migration from the current GitHub uploader

Keep the existing GitHub uploader until the Supabase backend has been tested. After successful migration, remove/disable `data/mechanical/pyq-upload.html` and remove GitHub write-token handling from the public site.
