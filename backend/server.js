require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'O\'yinlar Platformasi Serveri Ishlayapti' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

app.get('/games/sudoku', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB ga muvaffaqiyatli ulandi');
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishlayapti`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB ulanish xatosi:', err.message);
    process.exit(1);
  });
