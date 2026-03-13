const { db } = require('../db');
const path = require('path');
const fs = require('fs');

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// GET /api/archive
function getArchive(req, res) {
  const { folder, type, search } = req.query;
  let sql = 'SELECT * FROM archive WHERE user_id = ?';
  const params = [req.user.id];

  if (folder) { sql += ' AND folder = ?'; params.push(folder); }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY created_at DESC';

  const files = db.prepare(sql).all(...params).map(f => ({ ...f, tags: JSON.parse(f.tags || '[]') }));
  res.json(files);
}

// POST /api/archive
function uploadFile(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Fayl majburiy' });

  const { folder, tags } = req.body;
  const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
  const typeMap = { pdf: 'pdf', pptx: 'pptx', docx: 'docx', mp4: 'video', jpg: 'img', jpeg: 'img', png: 'img', webp: 'img' };
  const fileType = typeMap[ext] || ext;
  const tagsJson = JSON.stringify(tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : []);

  const result = db.prepare(`
    INSERT INTO archive (user_id, name, file_path, type, size, folder, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, req.file.originalname, req.file.filename, fileType,
         formatSize(req.file.size), folder || 'Umumiy', tagsJson);

  const file = db.prepare('SELECT * FROM archive WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...file, tags: JSON.parse(file.tags) });
}

// DELETE /api/archive/:id
function deleteFile(req, res) {
  const file = db.prepare('SELECT * FROM archive WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!file) return res.status(404).json({ error: 'Fayl topilmadi' });

  const filePath = path.join(__dirname, '../../uploads', file.file_path);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM archive WHERE id = ?').run(file.id);
  res.json({ message: 'Fayl o\'chirildi' });
}

// GET /api/archive/folders
function getFolders(req, res) {
  const folders = db.prepare(`
    SELECT folder, COUNT(*) AS count FROM archive WHERE user_id = ? GROUP BY folder ORDER BY folder
  `).all(req.user.id);
  res.json(folders);
}

module.exports = { getArchive, uploadFile, deleteFile, getFolders };
