const express = require('express');
const path = require('path');
const { testConnection } = require('./models/db');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3002;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Static Files (CSS, JS, Images)
app.use('/order', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/order', orderRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[App2] Kantin Order jalan di port ${PORT}`);
  await testConnection();
});