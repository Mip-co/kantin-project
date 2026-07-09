const express = require('express');
const path = require('path');
const { testConnection } = require('./models/db');
const orderRoutes = require('./routes/order');

const app = express();
const PORT = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', orderRoutes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[App2] Kantin Order jalan di port ${PORT}`);
  await testConnection();
});
