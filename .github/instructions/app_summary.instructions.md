---
description: HMPSINF admin dashboard project context — loaded for all source file interactions
applyTo: 'src/**'
---
HMPSINF admin dashboard: Next.js 16 App Router + Tailwind CSS v4 + TypeScript strict.
DB: Turso (libSQL) — `db.execute({ sql, args })`. Images: Cloudinary. Auth: JWT cookie via `jose`.
All UI text in Bahasa Indonesia. IDs are UUID v4. Booleans as INTEGER (0/1) in DB.
Admin pages are `"use client"` using: PageBreadcrumb, useToast(), DeleteConfirmationModal, skeleton loading, dark mode support.
API routes: auth via `getCurrentUser()`, async params (`await params`), FormData for uploads.
See `.github/copilot-instructions.md` for full patterns and conventions.