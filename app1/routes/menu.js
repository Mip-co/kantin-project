const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');

// Halaman utama: form tambah + tabel daftar menu
router.get('/', async (req, res) => {
  try {
    const [menus] = await pool.query('SELECT * FROM menus ORDER BY id DESC');
    res.render('index', { menus, editMenu: null, error: req.query.error || null });
  } catch (err) {
    res.render('index', { menus: [], editMenu: null, error: 'Gagal memuat data: ' + err.message });
  }
});

// Tambah menu baru
router.post('/menus', async (req, res) => {
  const { nama_menu, harga, status } = req.body;
  if (!nama_menu || !harga) {
    return res.redirect('/');
  }
  try {
    await pool.query(
      'INSERT INTO menus (nama_menu, harga, status) VALUES (?, ?, ?)',
      [nama_menu, harga, status || 'Tersedia']
    );
  } catch (err) {
    console.error('[App1] Gagal tambah menu:', err.message);
  }
  res.redirect('/');
});

// Tampilkan form edit (menu jadi terisi di form yang sama)
router.get('/menus/:id/edit', async (req, res) => {
  try {
    const [menus] = await pool.query('SELECT * FROM menus ORDER BY id DESC');
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.redirect('/');
    res.render('index', { menus, editMenu: rows[0], error: null });
  } catch (err) {
    res.redirect('/');
  }
});

// Simpan hasil edit
router.post('/menus/:id', async (req, res) => {
  const { nama_menu, harga, status } = req.body;
  try {
    await pool.query(
      'UPDATE menus SET nama_menu = ?, harga = ?, status = ? WHERE id = ?',
      [nama_menu, harga, status, req.params.id]
    );
  } catch (err) {
    console.error('[App1] Gagal update menu:', err.message);
  }
  res.redirect('/');
});

// Hapus menu
router.post('/menus/:id/delete', async (req, res) => {
  try {
    await pool.query('DELETE FROM menus WHERE id = ?', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    console.error('[App1] Gagal hapus menu:', err.message);
    // Kemungkinan besar gagal karena FK constraint (menu masih dipakai di tabel orders)
    res.redirect('/?error=' + encodeURIComponent('Menu tidak bisa dihapus, kemungkinan masih dipakai di data pesanan.'));
  }
});

module.exports = router;
