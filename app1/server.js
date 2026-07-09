const express = require('express');
const path = require('path');
const { testConnection } = require('./models/db');
const menuRoutes = require('./routes/menu');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', menuRoutes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[App1] Kantin Admin jalan di port ${PORT}`);
  await testConnection();
});
