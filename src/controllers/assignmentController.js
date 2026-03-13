const { db } = require('../db');
const path = require('path');
const fs = require('fs');

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// GET /api/assignments
function getAssignments(req, res) {
  const { group_id, type, search } = req.query;
  let sql = `
    SELECT a.*, g.name AS group_name
    FROM assignments a
    JOIN groups g ON a.group_id = g.id
    WHERE a.user_id = ?
  `;
  const params = [req.user.id];

  if (group_id) { sql += ' AND a.group_id = ?'; params.push(group_id); }
  if (type) { sql += ' AND a.type = ?'; params.push(type); }
  if (search) { sql += ' AND a.title LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY a.created_at DESC';

  const assignments = db.prepare(sql).all(...params).map(a => ({
    ...a,
    tags: JSON.parse(a.tags || '[]'),
    total: db.prepare('SELECT COUNT(*) AS c FROM group_members WHERE group_id = ?').get(a.group_id)?.c || 0
  }));

  res.json(assignments);
}

// POST /api/assignments
function createAssignment(req, res) {
  const { title, description, group_id, deadline, type, tags } = req.body;
  if (!title || !group_id || !deadline)
    return res.status(400).json({ error: 'Sarlavha, guruh va deadline majburiy' });

  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND user_id = ?').get(group_id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });

  let file_name = null, file_path = null, file_type = null, file_size = null;
  if (req.file) {
    file_name = req.file.originalname;
    file_path = req.file.filename;
    file_size = formatSize(req.file.size);
    const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
    const typeMap = { pdf: 'pdf', pptx: 'pptx', docx: 'docx', mp4: 'video', jpg: 'img', jpeg: 'img', png: 'img', webp: 'img' };
    file_type = typeMap[ext] || ext;
  }

  const tagsJson = JSON.stringify(tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : []);

  const result = db.prepare(`
    INSERT INTO assignments (user_id, group_id, title, description, deadline, type, tags, file_name, file_path, file_type, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, group_id, title, description || '', deadline, type || 'yakka', tagsJson, file_name, file_path, file_type, file_size);

  // Bildirishnoma
  db.prepare('INSERT INTO notifications (user_id, text) VALUES (?, ?)').run(
    req.user.id, `${group.name} ga yangi topshiriq: ${title}`
  );

  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...assignment, tags: JSON.parse(assignment.tags), group_name: group.name });
}

// GET /api/assignments/:id
function getAssignment(req, res) {
  const a = db.prepare(`
    SELECT a.*, g.name AS group_name
    FROM assignments a JOIN groups g ON a.group_id = g.id
    WHERE a.id = ? AND a.user_id = ?
  `).get(req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  // Ko'rildi count oshir
  db.prepare('UPDATE assignments SET views = views + 1 WHERE id = ?').run(a.id);
  res.json({ ...a, tags: JSON.parse(a.tags || '[]'), views: a.views + 1 });
}

// PUT /api/assignments/:id
function updateAssignment(req, res) {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  const { title, description, deadline, type, tags } = req.body;
  const tagsJson = tags ? JSON.stringify(Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : a.tags;

  db.prepare(`
    UPDATE assignments SET title=?, description=?, deadline=?, type=?, tags=? WHERE id=?
  `).run(title || a.title, description ?? a.description, deadline || a.deadline, type || a.type, tagsJson, a.id);

  res.json(db.prepare('SELECT * FROM assignments WHERE id = ?').get(a.id));
}

// DELETE /api/assignments/:id
function deleteAssignment(req, res) {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!a) return res.status(404).json({ error: 'Topshiriq topilmadi' });

  // Faylni o'chir
  if (a.file_path) {
    const filePath = path.join(__dirname, '../../uploads', a.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM assignments WHERE id = ?').run(a.id);
  res.json({ message: 'Topshiriq o\'chirildi' });
}

module.exports = { getAssignments, createAssignment, getAssignment, updateAssignment, deleteAssignment };
