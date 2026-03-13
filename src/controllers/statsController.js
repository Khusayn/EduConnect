const { db } = require('../db');

// GET /api/notifications
function getNotifications(req, res) {
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(notifs);
}

// PUT /api/notifications/read-all
function markAllRead(req, res) {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Barchasi o\'qilgan deb belgilandi' });
}

// PUT /api/notifications/:id/read
function markRead(req, res) {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'O\'qildi' });
}

// GET /api/stats
function getStats(req, res) {
  const uid = req.user.id;
  const groups    = db.prepare('SELECT COUNT(*) AS c FROM groups WHERE user_id = ?').get(uid).c;
  const assignments = db.prepare('SELECT COUNT(*) AS c FROM assignments WHERE user_id = ?').get(uid).c;
  const archive   = db.prepare('SELECT COUNT(*) AS c FROM archive WHERE user_id = ?').get(uid).c;
  const posts     = db.prepare('SELECT COUNT(*) AS c FROM posts WHERE user_id = ?').get(uid).c;
  const unreadNotif = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0').get(uid).c;

  res.json([
    { label: 'Faol guruhlar',      value: groups,      icon: '👥', color: 'green'  },
    { label: 'Jami topshiriqlar',  value: assignments,  icon: '📋', color: 'blue'   },
    { label: 'Arxivdagi fayllar',  value: archive,      icon: '🗂️', color: 'orange' },
    { label: 'Hamjamiyat postlari',value: posts,        icon: '💬', color: 'purple' },
    { label: 'O\'qilmagan xabarlar', value: unreadNotif, icon: '🔔', color: 'red'  }
  ]);
}

module.exports = { getNotifications, markAllRead, markRead, getStats };
