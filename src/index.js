require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik fayllar (yuklangan fayllar)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ─────────────────────────────────────────────
app.use('/api', require('./routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint topilmadi' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Xato:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: 'Fayl juda katta (max 100MB)' });
  res.status(500).json({ error: err.message || 'Server xatosi' });
});

// ── Start ──────────────────────────────────────────────
initDB();
app.listen(PORT, () => {
  console.log(`🚀 EduConnect backend ishlamoqda: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
