# Kantin Project
Proyek Virtualisasi dan Keamanan Jaringan

## Deskripsi

Repository ini berisi implementasi dua aplikasi web sederhana yang berjalan menggunakan Docker Compose pada Ubuntu Server (DMZ), menggunakan Nginx sebagai Reverse Proxy, MySQL sebagai database server pada jaringan LAN, serta Suricata IDS sebagai sistem monitoring keamanan jaringan.

---

# Spesifikasi Sistem

## Hardware

- RAM minimal 8 GB
- Processor minimal Dual Core

## Software

- Oracle VirtualBox
- MikroTik CHR
- Ubuntu Server 24.04
- Docker Engine
- Docker Compose
- Nginx
- MySQL Server
- Suricata IDS

---

# Topologi

                    Internet
                        │
                  MikroTik Router
               ┌────────┴────────┐
               │                 │
             DMZ               LAN
        7.7.7.0/30      192.168.56.0/24
               │                 │
        Ubuntu Server        Ubuntu Server
          (DMZ)                 (LAN)
               │                 │
        ┌─────────────┐        MySQL
        │             │
   Docker Compose
        │
   ┌──────────────┐
   │              │
App1 Admin    App2 Order
   │              │
   └──────┬───────┘
          │
     Nginx Reverse Proxy
          │
     Suricata IDS


---

# Clone Repository

```bash
git clone https://github.com/USERNAME/kantin-project.git
cd kantin-project
```

---

# Menjalankan Database

Masuk ke Ubuntu LAN.

Install MySQL.

```bash
sudo apt update
sudo apt install mysql-server -y
```

Import database.

```bash
mysql -u root -p < db/init.sql
```

Pastikan database berhasil dibuat.

---

# Menjalankan Docker

Masuk ke Ubuntu DMZ.

Pastikan Docker telah terpasang.

```bash
docker --version
docker compose version
```

Jalankan aplikasi.

```bash
docker compose up -d --build
```

Cek container.

```bash
docker ps
```

---

# Konfigurasi Nginx

Salin file konfigurasi.

```bash
sudo cp config/nginx/kantin /etc/nginx/sites-available/
```

Aktifkan.

```bash
sudo ln -s /etc/nginx/sites-available/kantin \
/etc/nginx/sites-enabled/
```

Reload.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

# Konfigurasi Suricata

Install Suricata.

```bash
sudo apt install suricata -y
```

Salin custom rules.

```bash
sudo cp config/suricata/local.rules \
/var/lib/suricata/rules/
```

Restart.

```bash
sudo systemctl restart suricata
```

---

# Pengujian

Cek Docker.

```bash
docker ps
```

Cek Nginx.

```bash
sudo systemctl status nginx
```

Cek Suricata.

```bash
sudo systemctl status suricata
```

Monitoring log.

```bash
sudo tail -f /var/log/suricata/fast.log
```

---

# Struktur Repository

```
app1/
app2/
db/
docker-compose.yml
config/
README.md
```

---

# Author

Kelompok
Virtualisasi dan Keamanan Jaringan
