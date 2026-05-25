const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const notifications = db.prepare(`
    SELECT n.*,
      u.username as sender_username, u.avatar_url as sender_avatar, u.full_name as sender_name,
      p.image_url as post_image
    FROM notifications n
    JOIN users u ON n.sender_id = u.id
    LEFT JOIN posts p ON n.post_id = p.id
    WHERE n.recipient_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(req.userId);
  res.json(notifications);
});

router.get('/unread-count', authMiddleware, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE recipient_id = ? AND read = 0').get(req.userId).c;
  res.json({ count });
});

router.put('/read-all', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE recipient_id = ?').run(req.userId);
  res.json({ message: 'Tümü okundu' });
});

router.put('/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND recipient_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Okundu' });
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ? AND recipient_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Silindi' });
});

module.exports = router;
