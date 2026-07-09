# Kantin Admin & Kantin Order — Proyek Virtualisasi & Keamanan Jaringan

Dua aplikasi web sederhana (Node.js + Express + EJS) yang berjalan sebagai container Docker
di **VM Ubuntu DMZ**, terhubung ke **satu database MySQL** yang berjalan di **VM LAN**
(192.168.56.0/24). Nginx reverse proxy diinstall langsung di Ubuntu Server (bukan di container).

| | Fungsi | Port | Tabel utama |
|---|---|---|---|
| **App1 — Kantin Admin** | Kelola menu (CRUD) | 3001 | `menus` |
| **App2 — Kantin Order** | Pemesanan menu (CRUD) | 3002 | `orders` (FK → `menus.id`) |

Kedua container jalan sebagai **non-root user**. Stack: Express + EJS + HTML/CSS polos
(tanpa React/Vue/Tailwind/Bootstrap/TypeScript/Auth, sesuai spesifikasi).

## Struktur folder

```
kantin-project/
├── app1/                     # Kantin Admin
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── routes/menu.js
│   ├── models/db.js
│   ├── views/index.ejs       # form tambah/edit + tabel daftar menu
│   └── public/css/style.css
├── app2/                     # Kantin Order
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── routes/order.js
│   ├── models/db.js
│   ├── views/index.ejs       # daftar menu Tersedia + form pesan
│   ├── views/orders.ejs      # daftar pesanan + ubah status/batalkan
│   └── public/css/style.css
├── db/init.sql               # bikin database, user, tabel menus+orders (FK), data dummy
├── docker-compose.yml        # hanya app1 & app2 (MySQL tidak ikut compose)
├── app1.env.example
├── app2.env.example
└── .gitignore
```

## Cara pakai di VM Ubuntu DMZ

### 1. Clone repo

```bash
git clone <url-repo-kamu> kantin-project
cd kantin-project
```

### 2. Siapkan file environment

```bash
cp app1.env.example app1.env
cp app2.env.example app2.env
nano app1.env   # isi DB_HOST dengan IP VM LAN, misal 192.168.56.10
nano app2.env   # sama persis, App1 & App2 pakai database yang sama
```

### 3. Build & jalankan

```bash
docker compose up -d --build
docker compose logs -f
```

Kalau muncul `Berhasil konek ke MySQL`, koneksi DMZ → LAN sudah tembus. Kalau gagal, cek:
- Firewall MikroTik: rule forward DMZ→LAN port 3306 sudah diizinkan?
- UFW di VM LAN: sudah izinkan port 3306 dari IP VM DMZ?
- MySQL di VM LAN sudah `bind-address` yang benar (bukan cuma `127.0.0.1`)?

### 4. Siapkan database di VM LAN

Jalankan sekali di VM LAN (host MySQL-nya), **bukan** di VM DMZ:

```bash
mysql -u root -p < db/init.sql
```

Ganti `GANTI_PASSWORD_KANTIN` di `db/init.sql` dengan password asli sebelum dijalankan,
lalu samakan dengan `DB_PASSWORD` di `app1.env` dan `app2.env`.

### 5. Tes langsung dari VM DMZ (sebelum dipasangi Nginx)

```bash
curl http://127.0.0.1:3001/          # App1 - Kantin Admin
curl http://127.0.0.1:3002/          # App2 - Kantin Order
```

Port sengaja di-bind ke `127.0.0.1` saja di `docker-compose.yml`, jadi container tidak
bisa diakses langsung dari luar VM — harus lewat Nginx yang jalan di host yang sama.

### 6. Setup Nginx di Ubuntu Server (host, bukan container)

Contoh konfigurasi dasar (sesuaikan domain/path sesuai kebutuhan):

```nginx
server {
    listen 80;
    server_name admin.kantin.local;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name order.kantin.local;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Fitur yang tersedia

**App1 — Kantin Admin**
- Tambah menu (nama_menu, harga, status)
- Lihat daftar menu
- Edit menu (form yang sama, terisi otomatis)
- Hapus menu — kalau menu masih dipakai di tabel `orders`, penghapusan otomatis
  ditolak oleh foreign key constraint dan pesan error tampil di halaman

**App2 — Kantin Order**
- Halaman utama hanya menampilkan menu berstatus **Tersedia**
- Buat pesanan (pilih menu + qty)
- Lihat daftar pesanan (join ke `menus`, menampilkan nama menu)
- Ubah status pesanan → Selesai
- Batalkan pesanan → Dibatalkan

## Catatan desain

- **Satu database** (`kantin_db`) dipakai bersama oleh App1 dan App2, sesuai spesifikasi.
- Foreign key `orders.menu_id → menus.id` menggunakan `ON DELETE RESTRICT`, supaya menu
  yang sudah pernah dipesan tidak bisa dihapus begitu saja — ini juga bagus untuk
  didemokan sebagai bagian dari "komunikasi antar aplikasi dan database".
- Semua form pakai method POST biasa (tanpa PUT/DELETE/method-override) supaya kode
  tetap sederhana sesuai permintaan.
