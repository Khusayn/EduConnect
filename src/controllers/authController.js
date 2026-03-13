const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
function register(req, res) {
  const { name, email, password, subject, school, experience, bio } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Ism, email va parol majburiy' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing)
    return res.status(409).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, subject, school, experience, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, email, hashed, subject || '', school || '', experience || 0, bio || '');

  const user = db.prepare('SELECT id, name, email, subject, school, experience, bio, role FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(user);

  res.status(201).json({ token, user });
}

// POST /api/auth/login
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email va parol majburiy' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user)
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const match = bcrypt.compareSync(password, user.password);
  if (!match)
    return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const { password: _, ...safeUser } = user;
  const token = generateToken(safeUser);

  res.json({ token, user: safeUser });
}

// GET /api/auth/me
function me(req, res) {
  const user = db.prepare('SELECT id, name, email, subject, school, experience, bio, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  res.json(user);
}

// PUT /api/auth/me
function updateMe(req, res) {
  const { name, subject, school, experience, bio } = req.body;
  db.prepare(`
    UPDATE users SET name=?, subject=?, school=?, experience=?, bio=? WHERE id=?
  `).run(name, subject, school, experience, bio, req.user.id);
  const updated = db.prepare('SELECT id, name, email, subject, school, experience, bio, role FROM users WHERE id = ?').get(req.user.id);
  res.json(updated);
}

module.exports = { register, login, me, updateMe };
