const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const authCtrl       = require('../controllers/authController');
const groupCtrl      = require('../controllers/groupController');
const assignCtrl     = require('../controllers/assignmentController');
const archiveCtrl    = require('../controllers/archiveController');
const postCtrl       = require('../controllers/postController');
const statsCtrl      = require('../controllers/statsController');

// ── Auth ──────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get ('/auth/me',       auth, authCtrl.me);
router.put ('/auth/me',       auth, authCtrl.updateMe);

// ── Stats ─────────────────────────────────────────────
router.get('/stats', auth, statsCtrl.getStats);

// ── Groups ────────────────────────────────────────────
router.get   ('/groups',                    auth, groupCtrl.getGroups);
router.post  ('/groups',                    auth, groupCtrl.createGroup);
router.get   ('/groups/:id',                auth, groupCtrl.getGroup);
router.put   ('/groups/:id',                auth, groupCtrl.updateGroup);
router.delete('/groups/:id',                auth, groupCtrl.deleteGroup);
router.post  ('/groups/:id/members',        auth, groupCtrl.addMember);
router.delete('/groups/:id/members/:memberId', auth, groupCtrl.removeMember);

// ── Assignments ───────────────────────────────────────
router.get   ('/assignments',      auth, assignCtrl.getAssignments);
router.post  ('/assignments',      auth, upload.single('file'), assignCtrl.createAssignment);
router.get   ('/assignments/:id',  auth, assignCtrl.getAssignment);
router.put   ('/assignments/:id',  auth, assignCtrl.updateAssignment);
router.delete('/assignments/:id',  auth, assignCtrl.deleteAssignment);

// ── Archive ───────────────────────────────────────────
router.get   ('/archive',          auth, archiveCtrl.getArchive);
router.post  ('/archive',          auth, upload.single('file'), archiveCtrl.uploadFile);
router.delete('/archive/:id',      auth, archiveCtrl.deleteFile);
router.get   ('/archive/folders',  auth, archiveCtrl.getFolders);

// ── Community Posts ───────────────────────────────────
router.get   ('/posts',                  auth, postCtrl.getPosts);
router.post  ('/posts',                  auth, upload.single('file'), postCtrl.createPost);
router.delete('/posts/:id',              auth, postCtrl.deletePost);
router.post  ('/posts/:id/like',         auth, postCtrl.toggleLike);
router.post  ('/posts/:id/save',         auth, postCtrl.toggleSave);
router.get   ('/posts/:id/comments',     auth, postCtrl.getComments);
router.post  ('/posts/:id/comments',     auth, postCtrl.addComment);

// ── Notifications ─────────────────────────────────────
router.get('/notifications',             auth, statsCtrl.getNotifications);
router.put('/notifications/read-all',    auth, statsCtrl.markAllRead);
router.put('/notifications/:id/read',    auth, statsCtrl.markRead);

// ── File download ─────────────────────────────────────
const path = require('path');
router.get('/files/:filename', auth, (req, res) => {
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ error: 'Fayl topilmadi' });
  });
});

module.exports = router;
