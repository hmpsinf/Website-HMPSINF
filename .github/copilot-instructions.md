# HMPSINF Admin Dashboard — Copilot Instructions

## Architecture Overview

Student association (Himpunan Mahasiswa Program Studi Informatika) admin panel built on **Next.js 16 App Router**, **Tailwind CSS v4**, **TypeScript strict**, with **Turso (libSQL)** database and **Cloudinary** image storage.

### Key Stack
- **DB**: Turso via `@libsql/client` — `db.execute({ sql, args })` (see `src/lib/db.ts`)
- **Auth**: JWT via `jose` stored in `auth_token` cookie, middleware-protected (see `src/middleware.ts`, `src/lib/auth.ts`)
- **Images**: Cloudinary upload/delivery (see `src/lib/cloudinary.ts`)
- **Rich Text**: TipTap editor (`src/components/ui/RichTextEditor.tsx`)
- **IDs**: UUID v4 via `uuid` package (`import { v4 as uuidv4 } from "uuid"`)

### Route Groups
- `(admin)/` — sidebar layout with auth (AppSidebar + AppHeader)
- `(full-width-pages)/` — auth/error pages without sidebar
- `api/` — REST API routes

### Provider Hierarchy (`src/components/Providers.tsx`)
Theme → SiteSettings → Auth → Toast → Sidebar

## Conventions

### Language
All UI text is **Bahasa Indonesia** — labels, toast messages, error messages, button text. Examples: "Berhasil disimpan", "Gagal menghapus", "Batal", "Hapus", "Menyimpan...".

### API Route Pattern
```typescript
// Collection: src/app/api/{feature}/route.ts — GET (list+pagination+stats), POST (create)
// Item: src/app/api/{feature}/[id]/route.ts — GET, PUT, DELETE

// Auth check (required for mutation endpoints):
const user = await getCurrentUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Next.js 15+ async params:
{ params }: { params: Promise<{ id: string }> }
const { id } = await params;

// Image upload pattern:
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
const result = await cloudinary.uploader.upload(base64, { folder: "hmpsinf/..." });
```

GET list responses return: `{ items, pagination: { page, limit, total, totalPages }, stats }`.

### Admin Page Pattern
All admin pages are `"use client"` with this structure:
1. `PageBreadcrumb` from `@/components/common/PageBreadCrumb`
2. Stats cards (optional)
3. Search/filter bar
4. Content grid/list with skeleton loading states
5. Pagination
6. Modals for create/edit (fixed overlay `z-99999`)
7. `DeleteConfirmationModal` from `@/components/ui/modal/DeleteConfirmationModal`
8. Toast via `useToast()` from `@/components/ui/Toast` — `showToast('success'|'error'|'warning'|'info', message)`

### Skeleton Pattern (inline, no separate component)
```tsx
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-5 w-3/4" />
```

### Styling Conventions
- Cards: `rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`
- Card header: `border-b border-gray-200 px-6 py-4 dark:border-gray-800` with `text-lg font-semibold`
- Inputs: `rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:text-white`
- Primary button: `bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg`
- Danger button: `bg-error-500 hover:bg-error-600 text-white` or border variant with `text-red-600`
- Always include `dark:` variants for dark mode support
- Icons from `lucide-react`; sidebar icons from `@/icons/index`

### Adding Sidebar Navigation (`src/layout/AppSidebar.tsx`)
Add to `navItems` array (main menu) or `othersItems` (others section):
```typescript
// Direct link:
{ icon: <SomeIcon />, name: "Label", path: "/route" }
// Dropdown:
{ icon: <SomeIcon />, name: "Label", subItems: [{ name: "Sub", path: "/route", pro: false }] }
```

### Database
- Tables use TEXT PRIMARY KEY (UUID), TEXT dates with `DEFAULT CURRENT_TIMESTAMP`
- Booleans stored as INTEGER (0/1), converted in API: `row.is_open === 1`
- Migrations in `scripts/` — run with `npx tsx scripts/{name}.ts`
- New tables should include `ensureTable()` in API route as fallback

### File Upload
- Max size validated in API (typically 1-2MB)
- Cloudinary folders: `hmpsinf/{feature}` (e.g., `hmpsinf/events`, `hmpsinf/sejarah`)
- Always delete old Cloudinary image when replacing: `cloudinary.uploader.destroy(publicId)`
- Store both `image_url` and `image_public_id` in DB

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npx tsx scripts/*.ts # Run migrations/scripts
```
