const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kantin_db',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log(`[App1] Berhasil konek ke MySQL di ${dbConfig.host}:${dbConfig.port}`);
      return;
    } catch (err) {
      console.error(`[App1] Percobaan ${i}/${retries} gagal konek DB: ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  console.error('[App1] Gagal konek ke database setelah beberapa percobaan.');
}

module.exports = { pool, testConnection, dbConfig };
