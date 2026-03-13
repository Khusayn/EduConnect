const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../educonnect.db');
const db = new Database(DB_PATH);

// WAL mode - tezroq ishlash uchun
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDB() {
  db.exec(`
    -- Foydalanuvchilar
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      subject     TEXT DEFAULT '',
      school      TEXT DEFAULT '',
      experience  INTEGER DEFAULT 0,
      bio         TEXT DEFAULT '',
      role        TEXT DEFAULT 'Teacher',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- Guruhlar
    CREATE TABLE IF NOT EXISTS groups (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      name        TEXT NOT NULL,
      subject     TEXT NOT NULL,
      grade       TEXT DEFAULT '',
      icon        TEXT DEFAULT '📚',
      color       TEXT DEFAULT 'blue',
      code        TEXT UNIQUE NOT NULL,
      join_type   TEXT DEFAULT 'code',
      description TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Guruh a'zolari (o'quvchilar)
    CREATE TABLE IF NOT EXISTS group_members (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id   INTEGER NOT NULL,
      user_id    INTEGER,
      name       TEXT NOT NULL,
      joined_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    -- Topshiriqlar
    CREATE TABLE IF NOT EXISTS assignments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      group_id    INTEGER NOT NULL,
      title       TEXT NOT NULL,
      description TEXT DEFAULT '',
      deadline    TEXT NOT NULL,
      type        TEXT DEFAULT 'yakka',
      tags        TEXT DEFAULT '[]',
      file_name   TEXT,
      file_path   TEXT,
      file_type   TEXT,
      file_size   TEXT,
      views       INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
    );

    -- Arxiv (fayllar)
    CREATE TABLE IF NOT EXISTS archive (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      name       TEXT NOT NULL,
      file_path  TEXT NOT NULL,
      type       TEXT NOT NULL,
      size       TEXT NOT NULL,
      folder     TEXT DEFAULT 'Umumiy',
      tags       TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Hamjamiyat postlari
    CREATE TABLE IF NOT EXISTS posts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      channel    TEXT DEFAULT 'Umumiy',
      body       TEXT NOT NULL,
      file_name  TEXT,
      file_path  TEXT,
      file_type  TEXT,
      file_size  TEXT,
      likes      INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Post like'lar
    CREATE TABLE IF NOT EXISTS post_likes (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id  INTEGER NOT NULL,
      user_id  INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Post saqlanganlar
    CREATE TABLE IF NOT EXISTS post_saves (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id  INTEGER NOT NULL,
      user_id  INTEGER NOT NULL,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Izohlar
    CREATE TABLE IF NOT EXISTS comments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id    INTEGER NOT NULL,
      user_id    INTEGER NOT NULL,
      body       TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Bildirishnomalar
    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      text       TEXT NOT NULL,
      read       INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database tayyor:', DB_PATH);
}

module.exports = { db, initDB };
