<p align="center">
  <img src="https://res.cloudinary.com/dxujag3yy/image/upload/v1770508758/hmpsinf/logo.png" alt="HMPSINF Logo" width="80" height="80" />
</p>

<h1 align="center">Website Resmi HMPSINF</h1>

<p align="center">
  <strong>Himpunan Mahasiswa Program Studi Informatika</strong><br/>
  Fakultas Sains dan Teknologi Universitas Nurul Huda
</p>

---

## 📋 Deskripsi

Website resmi **HMPSINF (Himpunan Mahasiswa Program Studi Informatika)** — Fakultas Sains dan Teknologi Universitas Nurul Huda. Platform ini berfungsi sebagai pusat informasi, media publikasi, dan pengelolaan kegiatan organisasi secara digital.

Website ini memiliki dua sisi utama:
- **Halaman Publik** — Menampilkan informasi organisasi kepada umum
- **Panel Admin** — Dashboard untuk mengelola seluruh konten website

---

## ✨ Fitur

### 🌐 Halaman Publik

| Halaman | Deskripsi |
|---------|-----------|
| **Beranda** | Landing page dengan hero section, statistik, berita terbaru, dan event terkini |
| **Profil** | Visi & misi, sejarah, pengurus inti, dan struktur divisi |
| **Berita** | Daftar berita dengan kategori, pencarian, dan halaman detail lengkap |
| **Event** | Informasi kegiatan/acara dengan timeline dan detail kontak |
| **Pengumuman** | Pengumuman resmi organisasi |
| **Program Kerja** | Daftar program kerja per periode dan divisi |
| **Galeri** | Dokumentasi foto kegiatan |
| **Unduhan** | Dokumen-dokumen yang dapat diunduh publik |
| **Kontak** | Informasi kontak dan media sosial |

### 🔐 Panel Admin

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Analytics real-time: metrik konten, chart views, tren publikasi, dan aktivitas terbaru |
| **Manajemen Berita** | CRUD berita dengan rich text editor (TipTap), kategori, thumbnail, dan SEO metadata |
| **Manajemen Event** | Kelola event dengan timeline, lokasi, kontak, dan link pendaftaran |
| **Manajemen Pengumuman** | Buat dan kelola pengumuman dengan status publish/draft |
| **Manajemen Divisi** | Kelola divisi dan anggota beserta foto dan kontak sosial media |
| **Pengurus Inti** | Kelola data pengurus inti per periode kepengurusan |
| **Program Kerja** | Tracking program kerja dengan status, prioritas, dan timeline |
| **Galeri Foto** | Upload dan kelola galeri foto dengan integrasi Cloudinary |
| **Dokumen** | Upload dan kategorisasi dokumen organisasi |
| **Halaman Profil** | Edit konten visi & misi dan sejarah organisasi |
| **Popup** | Konfigurasi popup pengumuman di halaman utama |
| **Sponsorship** | Kelola logo dan pengaturan section sponsor |
| **Pengaturan** | Konfigurasi umum website dan profil admin |

---

## ⚙️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| **UI Library** | [React 19](https://react.dev) |
| **Bahasa** | [TypeScript](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Database** | [Turso](https://turso.tech) (libSQL — SQLite edge database) |
| **Media Storage** | [Cloudinary](https://cloudinary.com) |
| **Rich Text Editor** | [TipTap](https://tiptap.dev) |
| **Autentikasi** | JWT via [jose](https://github.com/panva/jose) + bcryptjs |
| **Charts** | [ApexCharts](https://apexcharts.com) |
| **Animasi** | [Framer Motion](https://motion.dev) |
| **Ikon** | [Lucide React](https://lucide.dev) |
| **Carousel/Slider** | [Swiper](https://swiperjs.com) |

---

## 🚀 Instalasi

### Prasyarat

- **Node.js** v18.x atau lebih baru (disarankan v20+)
- **npm** atau **yarn**
- Akun **Turso** (untuk database)
- Akun **Cloudinary** (untuk media storage)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone https://github.com/username/hmpsinf-website.git
   cd hmpsinf-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi environment**

   Buat file `.env.local` di root project:

   ```env
   # Database Turso
   TURSO_DATABASE_URL=libsql://nama-database.turso.io
   TURSO_AUTH_TOKEN=token_dari_turso

   # JWT Secret
   JWT_SECRET=ganti_dengan_secret_key_yang_kuat

   # Site Configuration
   NEXT_PUBLIC_SITE_NAME=HMPSINF
   NEXT_PUBLIC_SITE_URL=https://domain-anda.com
   NEXT_PUBLIC_CONTACT_EMAIL=email@contoh.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=cloud_name_anda
   CLOUDINARY_API_KEY=api_key_anda
   CLOUDINARY_API_SECRET=api_secret_anda
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=cloud_name_anda
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nama_upload_preset
   ```

4. **Setup database**

   ```bash
   npx tsx scripts/setup-new-database.ts
   ```

5. **Buat akun admin**

   ```bash
   npx tsx scripts/seed-admin.ts
   ```

6. **Jalankan development server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Proyek

```
hmpsinf/
├── public/                    # Aset statis (gambar, ikon, dsb.)
├── scripts/                   # Script utilitas (migrasi, seeding)
├── src/
│   ├── app/
│   │   ├── (public)/          # Halaman publik (beranda, berita, event, dll.)
│   │   ├── (admin)/           # Panel admin (dashboard, manajemen konten)
│   │   └── api/               # API routes (backend endpoints)
│   ├── components/            # Komponen React reusable
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── layout/                # Layout components (sidebar, header)
│   ├── lib/                   # Library utilities (database, auth, cloudinary)
│   └── types/                 # TypeScript type definitions
├── .env.local                 # Environment variables (tidak di-commit)
├── next.config.ts             # Konfigurasi Next.js
├── tailwind.config.ts         # Konfigurasi Tailwind CSS
└── tsconfig.json              # Konfigurasi TypeScript
```

---

## 🗄️ Skema Database

Website menggunakan **21 tabel** dengan **12 index** di Turso (libSQL):

| Grup | Tabel |
|------|-------|
| **Pengguna** | `users` |
| **Organisasi** | `hima_periods`, `hima_inti`, `divisions`, `division_members` |
| **Konten** | `news`, `news_categories`, `news_comments`, `events`, `pengumuman` |
| **Program** | `program_kerja` |
| **Media** | `galleries`, `gallery_images`, `documents`, `document_categories` |
| **Halaman** | `sejarah`, `visi_misi` |
| **Pengaturan** | `site_settings`, `popup_settings`, `sponsorship_settings`, `sponsorship_logos` |

> File SQL lengkap tersedia di [`scripts/migration-schema.sql`](scripts/migration-schema.sql)

---

## 🔒 Environment Variables

| Variable | Keterangan | Wajib |
|----------|------------|:-----:|
| `TURSO_DATABASE_URL` | URL database Turso | ✅ |
| `TURSO_AUTH_TOKEN` | Token autentikasi Turso | ✅ |
| `JWT_SECRET` | Secret key untuk JWT session | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary | ✅ |
| `CLOUDINARY_API_KEY` | API key Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name (client-side) | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset Cloudinary | ✅ |
| `NEXT_PUBLIC_SITE_NAME` | Nama situs yang ditampilkan | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL publik website | ✅ |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email kontak | ✅ |

---

## 📜 Scripts

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npx tsx scripts/setup-new-database.ts` | Setup schema database baru |
| `npx tsx scripts/seed-admin.ts` | Buat akun admin default |

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur/fitur-baru`)
5. Buat Pull Request

---

## 📄 Lisensi

Hak cipta © 2025–2026 **HMPSINF** — Fakultas Sains dan Teknologi Universitas Nurul Huda.  
Seluruh hak dilindungi.

---

<p align="center">
  Dibuat dengan ❤️ oleh Tim HMPSINF
</p>
