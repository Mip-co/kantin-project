const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');

// Halaman utama: menu yang Tersedia + form buat pesanan
router.get('/', async (req, res) => {
  try {
    const [menus] = await pool.query(
      "SELECT * FROM menus WHERE status = 'Tersedia' ORDER BY nama_menu ASC"
    );
    res.render('index', { menus, error: req.query.error || null });
  } catch (err) {
    res.render('index', { menus: [], error: 'Gagal memuat menu: ' + err.message });
  }
});

// Buat pesanan baru
router.post('/orders', async (req, res) => {
  const { menu_id, qty } = req.body;
  if (!menu_id || !qty) {
    return res.redirect('/');
  }
  try {
    await pool.query(
      "INSERT INTO orders (menu_id, qty, status) VALUES (?, ?, 'Diproses')",
      [menu_id, qty]
    );
  } catch (err) {
    console.error('[App2] Gagal buat pesanan:', err.message);
  }
  res.redirect('/orders');
});

// Lihat daftar pesanan (join ke menus supaya nama menu ikut tampil)
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.qty, o.status, m.nama_menu, m.harga
      FROM orders o
      LEFT JOIN menus m ON o.menu_id = m.id
      ORDER BY o.id DESC
    `);
    res.render('orders', { orders, error: req.query.error || null });
  } catch (err) {
    res.render('orders', { orders: [], error: 'Gagal memuat pesanan: ' + err.message });
  }
});

// Ubah status pesanan (Diproses / Selesai / Dibatalkan)
router.post('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['Diproses', 'Selesai', 'Dibatalkan'];
  if (!allowed.includes(status)) {
    return res.redirect('/orders');
  }
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  } catch (err) {
    console.error('[App2] Gagal update status pesanan:', err.message);
  }
  res.redirect('/orders');
});

// Batalkan pesanan (shortcut khusus, sama efeknya dengan set status = Dibatalkan)
router.post('/orders/:id/cancel', async (req, res) => {
  try {
    await pool.query("UPDATE orders SET status = 'Dibatalkan' WHERE id = ?", [req.params.id]);
  } catch (err) {
    console.error('[App2] Gagal batalkan pesanan:', err.message);
  }
  res.redirect('/orders');
});

module.exports = router;
