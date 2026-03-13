const { db } = require('../db');
const crypto = require('crypto');

function genCode(name) {
  const prefix = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3) || 'GRP';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${suffix}`;
}

// GET /api/groups
function getGroups(req, res) {
  const groups = db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS students,
      (SELECT COUNT(*) FROM assignments WHERE group_id = g.id) AS assignments
    FROM groups g
    WHERE g.user_id = ?
    ORDER BY g.created_at DESC
  `).all(req.user.id);
  res.json(groups);
}

// POST /api/groups
function createGroup(req, res) {
  const { name, subject, grade, icon, color, join_type, description } = req.body;
  if (!name || !subject) return res.status(400).json({ error: 'Nom va fan majburiy' });

  const code = genCode(name);
  const result = db.prepare(`
    INSERT INTO groups (user_id, name, subject, grade, icon, color, code, join_type, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, name, subject, grade || '', icon || '📚', color || 'blue', code, join_type || 'code', description || '');

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);

  // Bildirishnoma
  db.prepare('INSERT INTO notifications (user_id, text) VALUES (?, ?)').run(
    req.user.id, `Yangi guruh yaratildi: ${name}`
  );

  res.status(201).json({ ...group, students: 0, assignments: 0 });
}

// GET /api/groups/:id
function getGroup(req, res) {
  const group = db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS students,
      (SELECT COUNT(*) FROM assignments WHERE group_id = g.id) AS assignments
    FROM groups g WHERE g.id = ? AND g.user_id = ?
  `).get(req.params.id, req.user.id);

  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });

  const members = db.prepare('SELECT * FROM group_members WHERE group_id = ? ORDER BY joined_at DESC').all(group.id);
  res.json({ ...group, members });
}

// PUT /api/groups/:id
function updateGroup(req, res) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });

  const { name, subject, grade, icon, color, join_type, description } = req.body;
  db.prepare(`
    UPDATE groups SET name=?, subject=?, grade=?, icon=?, color=?, join_type=?, description=? WHERE id=?
  `).run(name || group.name, subject || group.subject, grade || group.grade,
         icon || group.icon, color || group.color, join_type || group.join_type,
         description ?? group.description, group.id);

  res.json(db.prepare('SELECT * FROM groups WHERE id = ?').get(group.id));
}

// DELETE /api/groups/:id
function deleteGroup(req, res) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });
  db.prepare('DELETE FROM groups WHERE id = ?').run(group.id);
  res.json({ message: 'Guruh o\'chirildi' });
}

// POST /api/groups/:id/members
function addMember(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Ism majburiy' });

  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });

  const result = db.prepare('INSERT INTO group_members (group_id, name) VALUES (?, ?)').run(group.id, name);
  res.status(201).json(db.prepare('SELECT * FROM group_members WHERE id = ?').get(result.lastInsertRowid));
}

// DELETE /api/groups/:id/members/:memberId
function removeMember(req, res) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });
  db.prepare('DELETE FROM group_members WHERE id = ? AND group_id = ?').run(req.params.memberId, group.id);
  res.json({ message: 'A\'zo o\'chirildi' });
}

module.exports = { getGroups, createGroup, getGroup, updateGroup, deleteGroup, addMember, removeMember };
