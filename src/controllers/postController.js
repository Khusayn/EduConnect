const { db } = require('../db');
const path = require('path');

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// GET /api/posts
function getPosts(req, res) {
  const { channel, search } = req.query;
  let sql = `
    SELECT p.*, u.name AS author, u.subject,
      SUBSTR(u.name, 1, 1) || COALESCE(SUBSTR(u.name, INSTR(u.name, ' ') + 1, 1), '') AS author_initials,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked,
      EXISTS(SELECT 1 FROM post_saves WHERE post_id = p.id AND user_id = ?) AS saved
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [req.user.id, req.user.id];

  if (channel) { sql += ' AND p.channel = ?'; params.push(channel); }
  if (search) { sql += ' AND p.body LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY p.created_at DESC';

  const posts = db.prepare(sql).all(...params);
  res.json(posts);
}

// POST /api/posts
function createPost(req, res) {
  const { body, channel } = req.body;
  if (!body) return res.status(400).json({ error: 'Post matni majburiy' });

  let file_name = null, file_path = null, file_type = null, file_size = null;
  if (req.file) {
    file_name = req.file.originalname;
    file_path = req.file.filename;
    file_size = formatSize(req.file.size);
    const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
    const typeMap = { pdf: 'pdf', pptx: 'pptx', docx: 'docx', mp4: 'video', jpg: 'img', jpeg: 'img', png: 'img' };
    file_type = typeMap[ext] || ext;
  }

  const result = db.prepare(`
    INSERT INTO posts (user_id, body, channel, file_name, file_path, file_type, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, body, channel || 'Umumiy', file_name, file_path, file_type, file_size);

  const post = db.prepare(`
    SELECT p.*, u.name AS author, u.subject,
      0 AS likes, 0 AS comments_count, 0 AS liked, 0 AS saved
    FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(post);
}

// POST /api/posts/:id/like
function toggleLike(req, res) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });

  const existing = db.prepare('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?').get(post.id, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(post.id, req.user.id);

    // Post egasiga bildirishnoma (agar boshqa odam bo'lsa)
    if (post.user_id !== req.user.id) {
      const me = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
      db.prepare('INSERT INTO notifications (user_id, text) VALUES (?, ?)').run(
        post.user_id, `${me.name} sizning postingizdan like oldi`
      );
    }
  } else {
    db.prepare('INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)').run(post.id, req.user.id);
  }

  const likes = db.prepare('SELECT COUNT(*) AS c FROM post_likes WHERE post_id = ?').get(post.id).c;
  res.json({ liked: !existing, likes });
}

// POST /api/posts/:id/save
function toggleSave(req, res) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });

  const existing = db.prepare('SELECT * FROM post_saves WHERE post_id = ? AND user_id = ?').get(post.id, req.user.id);
  if (existing) {
    db.prepare('DELETE FROM post_saves WHERE post_id = ? AND user_id = ?').run(post.id, req.user.id);
  } else {
    db.prepare('INSERT OR IGNORE INTO post_saves (post_id, user_id) VALUES (?, ?)').run(post.id, req.user.id);
    if (post.user_id !== req.user.id) {
      const me = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
      db.prepare('INSERT INTO notifications (user_id, text) VALUES (?, ?)').run(
        post.user_id, `${me.name} sizning postingizni saqladi`
      );
    }
  }

  res.json({ saved: !existing });
}

// GET /api/posts/:id/comments
function getComments(req, res) {
  const comments = db.prepare(`
    SELECT c.*, u.name AS author FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).all(req.params.id);
  res.json(comments);
}

// POST /api/posts/:id/comments
function addComment(req, res) {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Izoh matni majburiy' });

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });

  const result = db.prepare('INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)').run(post.id, req.user.id, body);

  if (post.user_id !== req.user.id) {
    const me = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    db.prepare('INSERT INTO notifications (user_id, text) VALUES (?, ?)').run(
      post.user_id, `${me.name} postingizga izoh qoldirdi`
    );
  }

  const comment = db.prepare('SELECT c.*, u.name AS author FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?').get(result.lastInsertRowid);
  res.status(201).json(comment);
}

// DELETE /api/posts/:id
function deletePost(req, res) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!post) return res.status(404).json({ error: 'Post topilmadi' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
  res.json({ message: 'Post o\'chirildi' });
}

module.exports = { getPosts, createPost, toggleLike, toggleSave, getComments, addComment, deletePost };
