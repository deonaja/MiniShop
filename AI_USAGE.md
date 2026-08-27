# AI Usage

## Tools yang dipakai

- **Claude Code** (Anthropic) — satu-satunya AI assistant, dipakai untuk perencanaan, implementasi, testing, verifikasi, dan dokumentasi.

## Cara saya memakai AI

Pendekatan saya: **rencanakan dulu, review ketat, baru eksekusi** — bukan menyerahkan semua mentah-mentah ke AI.

- **Diskusi & perencanaan dulu.** Sebelum ngoding, saya diskusi arah teknis lalu mengarahkan penyusunan runbook `SETUP_AND_BUILD.md` (keputusan stack, data model, daftar endpoint, dan urutan fase — termasuk "checkout transaksional `lockForUpdate` + kurangi stok"). AI yang menuliskan drafnya, tapi saya yang menentukan keputusan & preset (mis. password DB), dan **mereview drafnya sebelum satu baris kode pun dibuat**.
- **Kurasi tooling sendiri.** Saya memilih skill referensi yang dipakai (`laravel-patterns`, `laravel-security`, `react-patterns`, `frontend-design`, `api-design`) dan menolak yang overkill, dengan alasan fokus ke kualitas kode (softdev), bukan pamer.
- **Infra manual.** Install PostgreSQL dan sebagian download saya kerjakan sendiri (lebih hemat & andal); AI hanya menyiapkan skrip + panduan.
- **Review iteratif + fact-check.** Saya memverifikasi output AI di tiap tahap dan mengoreksi bila melenceng dari requirement — misalnya mempertanyakan standar testing yang tidak ada di soal, dan mengarahkan perbaikan UX secara spesifik.

## Contoh prompt yang saya pakai (verbatim)

**1. Menyusun runbook rencana — inilah yang memuat logika krusial (checkout + cart):**

> "aku mending nyusun 1 md yang kalo dijalanin bakal setup semua-muanya yang kita rencanakan tanpa ada stop dengan loop goal yang bagus. masuk secara logika ga?"
>
> "preset aja postgres123, review md yang bakal kamu buat dulu."

Hasilnya `SETUP_AND_BUILD.md` yang jadi acuan implementasi — memuat spesifikasi krusial: **checkout transaksional dengan `lockForUpdate` + pengurangan stok**, dan **cart client-side**. Eksekusi build lalu saya picu dengan prompt singkat: *"aku mau jalanin SETUP_AND_BUILD.md, coba baca konteks"* dan *"lanjut frontend"*.

**2. Mengarahkan perbaikan kualitas UX (review-driven):**

> "banyak design system yang bikin ux jelek, harus diperhatikan. 1. pas klik tombol add, user ga feel mencet tombolnya jadi rasanya ke-tambah di cart. 2. modal new product: input price buat jelas dolarnya, category buat dropdown yang bisa diinput custom, auto filter input admin jadi upper case awalan. 3. highlight menu admin, jangan campur dengan menu user, jangan terlalu lebay."

## Catatan jujur

Beberapa hal yang sempat dimasukkan AI tapi **tidak ada di soal** saya coret setelah dicek — misalnya target coverage test 80% yang ternyata berasal dari konfigurasi global saya, bukan brief Roketin. Testing akhirnya dibatasi ke 2 logika yang memang disebut krusial di soal (kalkulasi cart + pengurangan stok).
