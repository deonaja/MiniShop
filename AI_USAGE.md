# AI Usage

## Tools yang dipakai

- **Claude Code** (Anthropic) — dipakai sebagai asisten utama untuk scaffold backend & frontend, menulis API, logika checkout, test, dokumentasi, sekaligus menjalankan & memverifikasi aplikasi secara end-to-end.

## Bagaimana AI dipakai

- Men-generate data model Laravel (migration, model, factory, seeder), controller REST, Form Request, API Resource, dan `CheckoutService` yang transaksional.
- Men-generate SPA React (catalog, detail produk, cart/checkout, login admin, CRUD produk, list order) beserta styling Tailwind dan cart client-side berbasis Context.
- Menulis feature test PHPUnit dan mengiterasinya sampai semua lulus.
- Memverifikasi aplikasi yang berjalan: smoke test API, proxy Vite→Laravel, checkout nyata (pengurangan stok + penolakan over-order), dan pengecekan tampilan responsif via screenshot.

Semua kode hasil AI sudah ditinjau ulang dan aplikasi dipastikan berjalan sebelum dikumpulkan.

## Contoh prompt krusial

**1. Checkout transaksional (inti requirement — kurangi stok saat checkout)**

> "Implementasikan checkout di Laravel sebagai service: bungkus dalam DB transaction, kunci baris produk terkait dengan `lockForUpdate`, gabungkan baris `product_id` yang duplikat sebelum cek stok, tolak dengan error validasi 422 jika ada qty yang melebihi stok tersedia, kurangi stok, lalu buat order dengan snapshot `product_name`/`price` di tiap order item supaya edit produk di kemudian hari tidak mengubah order lama."

**2. Cart client-side dengan validasi stok**

> "Buat cart React sebagai Context + useReducer yang dipersist ke localStorage. Cart sepenuhnya di sisi client dan baru jadi order di database saat checkout. Batasi qty tiap baris maksimal sebesar stok produk saat ditambah atau diubah, sediakan totalItems/totalPrice, dan saat checkout kirim `{items:[{product_id, qty}]}` ke `/api/checkout`, tampilkan pesan error stok dari server bila mengembalikan 422."
