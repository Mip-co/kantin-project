-- =========================================================
-- Script inisialisasi database untuk Kantin Admin (App1) & Kantin Order (App2)
-- Dijalankan di server MySQL/MariaDB pada VM LAN (192.168.56.0/24)
-- Jalankan sebagai root: mysql -u root -p < init.sql
-- =========================================================

CREATE DATABASE IF NOT EXISTS kantin_db;

-- User bersama untuk App1 & App2 (satu database yang sama, sesuai spesifikasi)
-- GANTI password di bawah ini sebelum dipakai di lingkungan nyata!
CREATE USER IF NOT EXISTS 'kantin_user'@'%' IDENTIFIED BY 'GANTI_PASSWORD_KANTIN';
GRANT ALL PRIVILEGES ON kantin_db.* TO 'kantin_user'@'%';
FLUSH PRIVILEGES;

USE kantin_db;

CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_menu VARCHAR(150) NOT NULL,
    harga DECIMAL(10, 2) NOT NULL,
    status ENUM('Tersedia', 'Habis') NOT NULL DEFAULT 'Tersedia'
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    status ENUM('Diproses', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Diproses',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_menu
        FOREIGN KEY (menu_id) REFERENCES menus(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Data dummy menu
INSERT INTO menus (nama_menu, harga, status) VALUES
    ('Nasi Goreng', 15000, 'Tersedia'),
    ('Mie Ayam', 12000, 'Tersedia'),
    ('Es Teh Manis', 5000, 'Tersedia'),
    ('Gorengan', 3000, 'Habis');

-- Data dummy pesanan
INSERT INTO orders (menu_id, qty, status) VALUES
    (1, 2, 'Diproses'),
    (2, 1, 'Selesai'),
    (3, 3, 'Diproses');
