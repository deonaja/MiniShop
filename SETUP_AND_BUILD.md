# MiniShop — Setup & Build Runbook

> Runbook perencanaan yang disusun sebelum ngoding: keputusan stack yang dikunci,
> langkah setup sekali-jalan, dan build spec yang dieksekusi bertahap.
> (Path lokal & data pengiriman sudah dibersihkan dari versi repo ini.)

## 0. Keputusan terkunci
- Stack: **Laravel 11 + React (Vite + Tailwind) + PostgreSQL**, monorepo
- Cart: client-side (React Context) → masuk DB saat checkout
- Auth admin: Sanctum | Checkout: transaksional + `lockForUpdate`
- Fokus: **kualitas kode & kerapian (softdev)**, bukan showcase security
- DB pass lokal (dev only): `postgres123`

**Skill contekan (referensi, bukan ECC pipeline):**
`laravel-patterns`, `laravel-security`, `react-patterns`, `frontend-design`, `api-design`.
Tidak pakai: PRD/planner/architect/TDD-agent/multi-agent, `security-review`, `ui-styling`.

---

## 1. SETUP — jalankan SEKALI sebagai Administrator
Ganti `<PROJECT_ROOT>` dengan path folder project ini, simpan sebagai `setup.ps1`,
klik kanan → **Run as Administrator**.

```powershell
$ErrorActionPreference = "Stop"
$PROJECT = "<PROJECT_ROOT>"
$PGPASS  = "postgres123"

# 1) Defender exclusion (fix lock composer/npm saat nulis zip)
Add-MpPreference -ExclusionPath $PROJECT

# 2) Install PostgreSQL 17 silent (kalau belum ada)
if (-not (Test-Path "C:\Program Files\PostgreSQL\17\bin\psql.exe")) {
  winget install -e --id PostgreSQL.PostgreSQL.17 --silent `
    --accept-package-agreements --accept-source-agreements `
    --override "--mode unattended --unattendedmodeui minimal --superpassword $PGPASS --serverport 5432"
}
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# 3) Buat database minishop
$env:PGPASSWORD = $PGPASS
& psql -U postgres -h localhost -c "CREATE DATABASE minishop;" 2>$null

# 4) PATH php + composer (winget)
$PHPDIR = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe"
$env:Path += ";$PHPDIR"

# 5) Backend: dependency + env + migrate + seed
Set-Location "$PROJECT\backend"
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
php "$PHPDIR\composer.phar" install --no-interaction --prefer-dist
php artisan key:generate
# .env DB di-set sebelum langkah ini (lihat bagian 2)
php artisan migrate --seed

# 6) Frontend: dependency
Set-Location "$PROJECT\frontend"
npm install

Write-Host "`n=== SETUP SELESAI ===" -ForegroundColor Green
```

> Catatan: silent-install Postgres via winget `--override` kadang rewel (tergantung
> installer EDB). Kalau gagal, install manual GUI — script tetap lanjut karena ada
> guard `if not exists`.

---

## 2. Konfigurasi `.env` backend
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=minishop
DB_USERNAME=postgres
DB_PASSWORD=postgres123
```

---

## 3. BUILD SPEC — dieksekusi bertahap (ngoding), berurutan

**Data model**
- `products`(id, name, price, description, image_url, category, stock, timestamps)
- `orders`(id, total, status, created_at)
- `order_items`(id, order_id, product_id, product_name\*, price\*, qty)  \*snapshot
- `users`(admin, buat auth)

**Endpoint (REST — konsisten, pakai `api-design`)**
| Method | Path | Auth |
|---|---|---|
| GET | /api/products?search=&category= | publik |
| GET | /api/products/{id} | publik |
| POST/PUT/DELETE | /api/products[/{id}] | 🔒 Sanctum |
| GET | /api/orders[/{id}] | 🔒 Sanctum |
| POST | /api/checkout | publik |
| POST | /api/login | publik |

**Fase (checklist)**
- [x] Migration + factory + seeder (8–10 produk)
- [x] CRUD produk + search/filter kategori
- [x] Cart logic (client, Context) + validasi qty ≤ stok
- [x] Checkout transaksional (`lockForUpdate`, kurangi stok, buat order)
- [x] Test: kalkulasi cart + pengurangan stok
- [x] Auth Sanctum admin + seeder user admin
- [x] Frontend: catalog, detail, cart, checkout, admin CRUD, list order
- [x] Security standar: validasi (Form Request), CORS wajar, `.env` di-gitignore
- [x] README + AI_USAGE.md
- [x] (bonus) persist cart localStorage
- [ ] (bonus) deploy Vercel + Railway

**Sengaja di-skip:** TDD penuh/coverage 80%, ECC multi-agent, PRD, security showcase.

---

## 4. Jalankan & verifikasi
```powershell
# terminal 1
cd backend; php artisan serve         # http://127.0.0.1:8000
# terminal 2
cd frontend; npm run dev              # http://localhost:5173
```
Smoke: `GET /api/products` keluar 8–10 produk; checkout mengurangi stok; qty > stok ditolak.

---

## 5. Deliverables (sesuai brief)
Repo link · `README.md` (overview, tech stack + alasan, cara run, tabel endpoint,
known limitations) · `AI_USAGE.md` (tools + 1–2 contoh prompt krusial) ·
seed 5–10 produk · (nilai plus) deploy.
