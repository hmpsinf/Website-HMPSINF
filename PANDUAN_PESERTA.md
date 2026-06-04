# Tutorial Membangun Sistem Manajemen Event Kampus
**Durasi:** 3–4 Jam | **Stack:** Laravel 10 + Bootstrap 4 (SB Admin 2) + MySQL + SweetAlert2

Selamat datang di Bootcamp Laravel Dasar! Pada bootcamp ini, kita akan membangun **Sistem Manajemen Event Kampus**. Aplikasi ini adalah *Admin Panel* atau *CMS (Content Management System)* yang berfungsi mengelola data acara kampus secara dinamis.

Kita akan membangun aplikasi dengan satu tabel utama (CRUD) yang memiliki fitur:
- Tampilan tabel dengan **Pagination**
- **Upload Gambar** (Poster Event)
- Konfirmasi Hapus yang interaktif menggunakan **SweetAlert2**
- Validasi form yang aman

---

## 📦 SESI 1 — Setup Project & Template

Pada sesi ini, kita akan melakukan instalasi awal Laravel, mengonfigurasi database, dan mengintegrasikan template admin.

### 1.1 Buat Project Laravel
Buka terminal/Command Prompt, lalu jalankan perintah berikut untuk membuat folder project baru:
```bash
composer create-project laravel/laravel event-kampus
cd event-kampus
```

### 1.2 Buat Database & Konfigurasi Lingkungan
Buka aplikasi database manager kamu (misal: phpMyAdmin atau DBeaver), lalu buat satu database baru bernama:
`event_kampus`

Selanjutnya, buka file `.env` di dalam root project Laravel kamu, dan sesuaikan bagian *Database Connection*:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=event_kampus
DB_USERNAME=root
DB_PASSWORD=
```
*(Sesuaikan DB_USERNAME dan DB_PASSWORD dengan konfigurasi server lokal kamu).*

### 1.3 Integrasi Template SB Admin 2
Untuk tampilan, kita akan menggunakan template siap pakai bernama **SB Admin 2**.
1. **Download File Template:** Silakan download file `sbadmin-event-kampus.zip` yang telah disediakan oleh instruktur.
2. **Ekstrak File:** Ekstrak file zip tersebut. Di dalamnya akan ada folder `css/`, `js/`, dan `vendor/`.
3. **Copy ke Public:** Copy ketiga folder tersebut (`css`, `js`, `vendor`) dan paste ke dalam folder `public/` di project Laravel kamu.

### 1.4 Buat Layout Master (Starter)
Buat file baru di `resources/views/layouts/admin.blade.php`. File ini akan menjadi "kerangka utama" (sidebar, navbar, footer) yang membungkus semua halaman aplikasi kita.

Silakan **Copy - Paste** kode layout starter ini ke dalam file `admin.blade.php`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Event Kampus | @yield('title', 'Dashboard')</title>

    {{-- SB Admin 2 CSS --}}
    <link href="{{ asset('vendor/fontawesome-free/css/all.min.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="{{ asset('css/sb-admin-2.min.css') }}" rel="stylesheet">
    
    {{-- Custom CSS untuk reduce sidebar spacing --}}
    <style>
        body, html { font-family: 'Outfit', sans-serif !important; }
        @media (min-width: 768px) { .sidebar .nav-item .nav-link { padding: 0.5rem 1rem !important; } }
        .sidebar .nav-item { margin-bottom: 0 !important; }
        .sidebar-brand { justify-content: flex-start !important; }
        .sidebar-brand-text { font-size: 0.85rem !important; }
        .sidebar.toggled .sidebar-brand { justify-content: center !important; }
        .topbar { box-shadow: none !important; border-bottom: 1px solid #e3e6f0; }
        .card { box-shadow: none !important; border: 1px solid #e3e6f0 !important; }
        .table-responsive { border: 1px solid #e3e6f0; }
    </style>
</head>

<body id="page-top">
<div id="wrapper">

    {{-- ===== SIDEBAR ===== --}}
    <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
        <a class="sidebar-brand d-flex align-items-center" href="{{ url('/') }}">
            <div class="sidebar-brand-icon rotate-n-15"><i class="fas fa-calendar-check"></i></div>
            <div class="sidebar-brand-text mx-3">Event Kampus</div>
        </a>
        <hr class="sidebar-divider">
        <div class="sidebar-heading">Data Master</div>
        <li class="nav-item {{ request()->routeIs('events.*') ? 'active' : '' }}">
            <a class="nav-link" href="{{ route('events.index') }}">
                <i class="fas fa-fw fa-calendar-alt"></i><span>Event</span>
            </a>
        </li>
        <hr class="sidebar-divider d-none d-md-block">
        <div class="text-center d-none d-md-inline">
            <button class="rounded-circle border-0" id="sidebarToggle"></button>
        </div>
    </ul>

    {{-- ===== CONTENT WRAPPER ===== --}}
    <div id="content-wrapper" class="d-flex flex-column">
        <div id="content">
            {{-- TOPBAR --}}
            <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3"><i class="fa fa-bars"></i></button>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item dropdown no-arrow">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown">
                            <span class="mr-2 d-none d-lg-inline text-gray-600 small">Administrator</span>
                            <img class="img-profile rounded-circle" src="https://ui-avatars.com/api/?name=Admin&color=7F9CF5&background=EBF4FF">
                        </a>
                    </li>
                </ul>
            </nav>

            {{-- MAIN CONTENT --}}
            <div class="container-fluid">
                <div class="d-sm-flex align-items-center justify-content-between mb-4">
                    <h1 class="h3 mb-0 text-gray-800">@yield('title', 'Dashboard')</h1>
                    @yield('action-button')
                </div>
                
                {{-- DYNAMIC CONTENT DARI BLADE LAIN --}}
                @yield('content')
            </div>
        </div>

        {{-- Footer --}}
        <footer class="sticky-footer bg-white">
            <div class="container my-auto">
                <div class="copyright text-center my-auto">
                    <span>Event Kampus &copy; {{ date('Y') }}</span>
                </div>
            </div>
        </footer>
    </div>
</div>

{{-- JS Scripts --}}
<script src="{{ asset('vendor/jquery/jquery.min.js') }}"></script>
<script src="{{ asset('vendor/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('vendor/jquery-easing/jquery.easing.min.js') }}"></script>
<script src="{{ asset('js/sb-admin-2.min.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
    @if(session('success'))
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: '{{ session('success') }}', showConfirmButton: false, timer: 2000 });
    @endif

    // Script konfirmasi hapus otomatis untuk tombol class .btn-delete
    $('.btn-delete').on('click', function(e) {
        e.preventDefault();
        let form = $(this).closest('form');
        Swal.fire({
            title: 'Yakin hapus data?', text: "Data yang dihapus tidak bisa dikembalikan!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#e74a3b', cancelButtonColor: '#858796',
            confirmButtonText: 'Ya, Hapus!'
        }).then((result) => {
            if (result.isConfirmed) form.submit();
        })
    });
</script>
</body>
</html>
```

### 1.5 Link Storage (Untuk Upload Gambar)
Agar gambar poster yang nanti kita upload dapat diakses melalui URL public, jalankan perintah ini di terminal:
```bash
php artisan storage:link
```

---

## 🗄️ SESI 2 — Database (Migration, Model, & Seeder)

Pada sesi ini, kita akan merancang tabel database dan membuat data awalan (dummy).

### 2.1 Buat Migration & Model
Jalankan perintah ini untuk membuat Model `Event` beserta file Migration-nya secara otomatis:
```bash
php artisan make:model Event -m
```

### 2.2 Atur Struktur Tabel (Migration)
Buka folder `database/migrations/` dan cari file yang berakhiran `_create_events_table.php`. Buka file tersebut dan ubah *method* `up()` menjadi:

```php
public function up(): void
{
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->string('nama_event');
        $table->string('poster')->nullable();
        $table->text('deskripsi')->nullable();
        $table->date('tanggal');
        $table->string('tempat');
        $table->integer('kuota');
        $table->integer('peserta_terdaftar')->default(0);
        $table->timestamps();
    });
}
```

Jalankan migrasi untuk membuat tabel di MySQL:
```bash
php artisan migrate
```

### 2.3 Atur Mass Assignment (Model)
Buka file `app/Models/Event.php`. Tambahkan properti `$fillable` agar Laravel mengizinkan proses simpan data:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_event', 'poster', 'deskripsi', 'tanggal', 
        'tempat', 'kuota', 'peserta_terdaftar'
    ];
}
```

### 2.4 Buat Data Dummy (Seeder)
Buat file seeder untuk Event:
```bash
php artisan make:seeder EventSeeder
```

Buka `database/seeders/EventSeeder.php` dan isi dengan data dummy berikut:
```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::create([
            'nama_event' => 'Bootcamp Laravel Dasar',
            'deskripsi' => 'Belajar membuat sistem informasi event kampus.',
            'tanggal' => '2024-10-25',
            'tempat' => 'Lab Komputer A',
            'kuota' => 50,
            'peserta_terdaftar' => 10,
            'poster' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80',
        ]);

        Event::create([
            'nama_event' => 'Workshop UI/UX Design',
            'deskripsi' => 'Mengenal dasar-dasar desain antarmuka.',
            'tanggal' => '2024-10-28',
            'tempat' => 'Aula Utama',
            'kuota' => 100,
            'peserta_terdaftar' => 100,
            'poster' => 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80',
        ]);
    }
}
```

Daftarkan `EventSeeder` ke dalam file induk `database/seeders/DatabaseSeeder.php`:
```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            EventSeeder::class,
        ]);
    }
}
```

Jalankan perintah ini untuk mengeksekusi Seeder:
```bash
php artisan db:seed
```

---

## 🛣️ SESI 3 — Route & Controller Dasar

### 3.1 Buat Controller Resource
Gunakan opsi `--resource` untuk membuat controller yang sudah berisi method CRUD lengkap:
```bash
php artisan make:controller EventController --resource
```

### 3.2 Setup Route
Buka file `routes/web.php`, hapus isinya, dan ganti menjadi:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;

// Arahkan halaman utama langsung ke daftar event
Route::get('/', function () {
    return redirect()->route('events.index');
});

Route::resource('events', EventController::class);
```

---

## 🖥️ SESI 4 — Membuat Tampilan (Views)

Pada sesi ini, kita akan merakit halaman aplikasi. Ingat: **Struktur HTML dasar bisa kamu ambil dari file HTML mentah (dummy) yang ada di materi zip instruktur**. Di sini, kita akan membedah HTML-nya dengan sintaks Laravel Blade.

### 4.1 Menampilkan Daftar Event (Index)
Buka `app/Http/Controllers/EventController.php` dan update method `index`:
```php
public function index()
{
    $events = \App\Models\Event::latest()->paginate(10);
    return view('events.index', compact('events'));
}
```

Buat file `resources/views/events/index.blade.php`. 
*(Note: Buka file dummy `event-index.html` dari zip instruktur untuk melihat UI dasarnya, lalu ganti data tabel dengan variabel dinamis seperti di bawah ini)*:

```html
@extends('layouts.admin')

@section('title', 'Data Event')

@section('action-button')
    <a href="{{ route('events.create') }}" class="btn btn-primary btn-sm shadow-sm">
        <i class="fas fa-plus fa-sm text-white-50 mr-1"></i> Tambah Event
    </a>
@endsection

@section('content')
<div class="card border mb-4">
    <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Daftar Event</h6>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-bordered table-hover" width="100%" cellspacing="0">
                <thead class="thead-light">
                    <tr>
                        <th width="5%">#</th>
                        <th width="10%">Poster</th>
                        <th>Nama Event</th>
                        <th>Tanggal</th>
                        <th>Tempat</th>
                        <th width="10%">Kuota</th>
                        <th width="10%">Daftar</th>
                        <th width="18%">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($events as $event)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td class="text-center">
                            @if($event->poster)
                                <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-thumbnail" width="50">
                            @else
                                <span class="text-muted small">Tidak ada</span>
                            @endif
                        </td>
                        <td>{{ $event->nama_event }}</td>
                        <td>{{ \Carbon\Carbon::parse($event->tanggal)->locale('id')->isoFormat('dddd, DD MMM YYYY') }}</td>
                        <td>{{ $event->tempat }}</td>
                        <td class="text-center">{{ $event->kuota }}</td>
                        <td class="text-center">
                            <span class="badge badge-{{ $event->peserta_terdaftar >= $event->kuota ? 'danger' : 'success' }}">
                                {{ $event->peserta_terdaftar }}/{{ $event->kuota }}
                            </span>
                        </td>
                        <td>
                            <a href="{{ route('events.show', $event) }}" class="btn btn-info btn-sm"><i class="fas fa-eye"></i></a>
                            <a href="{{ route('events.edit', $event) }}" class="btn btn-warning btn-sm"><i class="fas fa-edit"></i></a>
                            <form action="{{ route('events.destroy', $event) }}" method="POST" class="d-inline">
                                @csrf @method('DELETE')
                                <button class="btn btn-danger btn-sm btn-delete" type="submit"><i class="fas fa-trash"></i></button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center text-muted">Belum ada event. Tambahkan Sekarang</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="d-flex justify-content-end mt-3 ml-3">
            {{ $events->links('pagination::bootstrap-5') }}
        </div>
    </div>
</div>
@endsection
```

### 4.2 Form Input Dinamis (Partial)
Karena form tambah (Create) dan Edit itu isinya sama, kita buat satu form yang bisa dipakai dua kali *(Don't Repeat Yourself / DRY)*.

Buat file `resources/views/events/_form.blade.php`:
*(Note: Referensi UI-nya dari `event-form.html`)*

```html
<div class="row">
    <div class="col-md-8">
        <div class="form-group">
            <label for="nama_event">Nama Event <span class="text-danger">*</span></label>
            <input type="text" name="nama_event" id="nama_event"
                class="form-control @error('nama_event') is-invalid @enderror"
                value="{{ old('nama_event', $event->nama_event ?? '') }}"
                placeholder="Contoh: Seminar Nasional IT 2024">
            @error('nama_event')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-4">
        <div class="form-group">
            <label for="tanggal">Tanggal <span class="text-danger">*</span></label>
            <input type="date" name="tanggal" id="tanggal" class="form-control @error('tanggal') is-invalid @enderror"
                value="{{ old('tanggal', $event->tanggal ?? '') }}">
            @error('tanggal')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-group">
            <label for="tempat">Tempat <span class="text-danger">*</span></label>
            <input type="text" name="tempat" id="tempat" class="form-control @error('tempat') is-invalid @enderror"
                value="{{ old('tempat', $event->tempat ?? '') }}" placeholder="Contoh: Aula Gedung A">
            @error('tempat')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-3">
        <div class="form-group">
            <label for="kuota">Kuota <span class="text-danger">*</span></label>
            <input type="number" name="kuota" id="kuota" class="form-control @error('kuota') is-invalid @enderror"
                value="{{ old('kuota', $event->kuota ?? '') }}" min="1" placeholder="100">
            @error('kuota')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-3">
        <div class="form-group">
            <label for="peserta_terdaftar">Pendaftar</label>
            <input type="number" name="peserta_terdaftar" id="peserta_terdaftar" class="form-control @error('peserta_terdaftar') is-invalid @enderror"
                value="{{ old('peserta_terdaftar', $event->peserta_terdaftar ?? '0') }}" min="0" placeholder="0">
            @error('peserta_terdaftar')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-12">
        <div class="form-group">
            <label for="deskripsi">Deskripsi</label>
            <textarea name="deskripsi" id="deskripsi" rows="3"
                class="form-control @error('deskripsi') is-invalid @enderror"
                placeholder="Deskripsi singkat event...">{{ old('deskripsi', $event->deskripsi ?? '') }}</textarea>
            @error('deskripsi')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
        </div>
    </div>

    <div class="col-md-12">
        <div class="form-group">
            <label for="poster">Poster Event <small class="text-muted">(Opsional, Format: JPG,PNG,JPEG | Max 2MB)</small></label>
            <input type="file" name="poster" id="poster" class="form-control-file @error('poster') is-invalid @enderror" accept="image/*">
            @error('poster')
                <div class="invalid-feedback">{{ $message }}</div>
            @enderror
            @if($event->poster ?? false)
                <div class="mt-2">
                    <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-thumbnail" width="150">
                </div>
            @endif
        </div>
    </div>
</div>
```

### 4.3 Simpan Data (Create & Store)
Di `EventController`, update method `create` dan `store`:

```php
public function create()
{
    return view('events.create');
}

public function store(\Illuminate\Http\Request $request)
{
    // Validasi data yang masuk
    $validated = $request->validate([
        'nama_event' => 'required|string|max:255',
        'poster'     => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        'tanggal'    => 'required|date',
        'tempat'     => 'required|string',
        'kuota'      => 'required|integer|min:1',
        'peserta_terdaftar' => 'nullable|integer|min:0',
        'deskripsi'  => 'nullable|string',
    ]);

    // Proses upload gambar
    if ($request->hasFile('poster')) {
        $image = $request->file('poster');
        $image->storeAs('public/posters', $image->hashName());
        $validated['poster'] = $image->hashName();
    }

    \App\Models\Event::create($validated);
    return redirect()->route('events.index')->with('success', 'Event berhasil ditambahkan!');
}
```

Lalu buat file halamannya di `resources/views/events/create.blade.php`:
*(Note: UI ini dirakit berdasarkan file `event-create.html`)*

```html
@extends('layouts.admin')
@section('title', 'Tambah Event')
@section('content')

<div class="card border mb-4">
    <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Form Tambah Event</h6>
    </div>
    <div class="card-body">
        <form action="{{ route('events.store') }}" method="POST" enctype="multipart/form-data">
            @csrf
            
            {{-- Panggil partial form yang sudah kita buat --}}
            @include('events._form')
            
            <a href="{{ route('events.index') }}" class="btn btn-secondary">Batal</a>
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save mr-1"></i> Simpan
            </button>
        </form>
    </div>
</div>

@endsection
```

### 4.4 Detail Event (Show)
Update method `show` di Controller:
```php
public function show(\App\Models\Event $event)
{
    return view('events.show', compact('event'));
}
```

Buat `resources/views/events/show.blade.php`:
*(Note: Dirakit dari file `event-show.html`)*

```html
@extends('layouts.admin')

@section('title', 'Detail Event')

@section('action-button')
    <a href="{{ route('events.index') }}" class="btn btn-secondary btn-sm shadow-sm">
        <i class="fas fa-arrow-left fa-sm text-white-50 mr-1"></i> Kembali
    </a>
@endsection

@section('content')
<div class="row">
    {{-- Kotak Poster --}}
    <div class="col-lg-4">
        <div class="card border mb-4">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Poster Event</h6>
            </div>
            <div class="card-body text-center">
                @if($event->poster)
                    <img src="{{ asset('storage/posters/' . $event->poster) }}" alt="Poster" class="img-fluid rounded mb-3" style="max-height: 250px;">
                @else
                    <div class="bg-light rounded p-4 mb-3 text-muted">
                        <i class="fas fa-image fa-3x mb-2"></i><br>Tidak ada poster
                    </div>
                @endif
            </div>
        </div>
    </div>

    {{-- Kotak Info --}}
    <div class="col-lg-8">
        <div class="card border mb-4">
            <div class="card-header py-3">
                <h6 class="m-0 font-weight-bold text-primary">Informasi Event</h6>
            </div>
            <div class="card-body">
                <table class="table table-borderless mb-0">
                    <tr>
                        <th width="25%">Nama Event</th>
                        <td>{{ $event->nama_event }}</td>
                    </tr>
                    <tr>
                        <th>Tanggal</th>
                        <td>{{ \Carbon\Carbon::parse($event->tanggal)->locale('id')->isoFormat('dddd, DD MMMM YYYY') }}</td>
                    </tr>
                    <tr>
                        <th>Tempat</th>
                        <td>{{ $event->tempat }}</td>
                    </tr>
                    <tr>
                        <th>Kuota</th>
                        <td><span class="badge badge-primary">{{ $event->kuota }} orang</span></td>
                    </tr>
                    <tr>
                        <th>Pendaftar</th>
                        <td><span class="badge badge-{{ $event->peserta_terdaftar >= $event->kuota ? 'danger' : 'success' }}">{{ $event->peserta_terdaftar }} orang</span></td>
                    </tr>
                    <tr>
                        <th>Deskripsi</th>
                        <td>{{ $event->deskripsi ?? '-' }}</td>
                    </tr>
                </table>
            </div>
            <div class="card-footer">
                <a href="{{ route('events.edit', $event) }}" class="btn btn-warning btn-sm">
                    <i class="fas fa-edit mr-1"></i> Edit
                </a>
                <form action="{{ route('events.destroy', $event) }}" method="POST" class="d-inline">
                    @csrf @method('DELETE')
                    <button class="btn btn-danger btn-sm btn-delete" type="submit">
                        <i class="fas fa-trash mr-1"></i> Hapus
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
```

### 4.5 Edit dan Hapus Data (Update & Destroy)
Terakhir, kita lengkapi fitur Edit & Hapus di Controller:

```php
public function edit(\App\Models\Event $event)
{
    return view('events.edit', compact('event'));
}

public function update(\Illuminate\Http\Request $request, \App\Models\Event $event)
{
    $validated = $request->validate([
        'nama_event' => 'required|string|max:255',
        'poster'     => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        'tanggal'    => 'required|date',
        'tempat'     => 'required|string',
        'kuota'      => 'required|integer|min:1',
        'peserta_terdaftar' => 'nullable|integer|min:0',
        'deskripsi'  => 'nullable|string',
    ]);

    if ($request->hasFile('poster')) {
        // Hapus file lama di server jika ada
        if ($event->poster) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete('posters/' . $event->poster);
        }
        
        $image = $request->file('poster');
        $image->storeAs('public/posters', $image->hashName());
        $validated['poster'] = $image->hashName();
    }

    $event->update($validated);
    return redirect()->route('events.index')->with('success', 'Event berhasil diperbarui!');
}

public function destroy(\App\Models\Event $event)
{
    if ($event->poster) {
        \Illuminate\Support\Facades\Storage::disk('public')->delete('posters/' . $event->poster);
    }

    $event->delete();
    return redirect()->route('events.index')->with('success', 'Event dihapus!');
}
```

Buat form halamannya di `resources/views/events/edit.blade.php`:
*(Note: Dibangun berdasarkan dummy `event-edit.html`)*

```html
@extends('layouts.admin')
@section('title', 'Edit Event')
@section('content')

<div class="card border mb-4">
    <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-warning">Form Edit Event</h6>
    </div>
    <div class="card-body">
        <form action="{{ route('events.update', $event) }}" method="POST" enctype="multipart/form-data">
            @csrf 
            @method('PUT')
            
            {{-- Panggil partial form --}}
            @include('events._form')
            
            <a href="{{ route('events.index') }}" class="btn btn-secondary">Batal</a>
            <button type="submit" class="btn btn-warning">
                <i class="fas fa-sync mr-1"></i> Update
            </button>
        </form>
    </div>
</div>

@endsection
```

### 🎯 Hasil Akhir
Jalankan lokal server kamu:
```bash
php artisan serve
```
Buka **http://127.0.0.1:8000** di browser. Aplikasi Manajemen Event Kampus kamu sudah jadi dengan fitur CRUD lengkap!
