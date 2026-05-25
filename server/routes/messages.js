const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getOrCreateConversation(uid1, uid2) {
  const p1 = Math.min(uid1, uid2), p2 = Math.max(uid1, uid2);
  let conv = db.prepare('SELECT * FROM conversations WHERE participant_1=? AND participant_2=?').get(p1, p2);
  if (!conv) {
    const r = db.prepare('INSERT INTO conversations (participant_1,participant_2) VALUES (?,?)').run(p1, p2);
    conv = db.prepare('SELECT * FROM conversations WHERE id=?').get(r.lastInsertRowid);
  }
  return conv;
}

// Unread message count
router.get('/unread', authMiddleware, (req, res) => {
  const count = db.prepare(`
    SELECT COUNT(*) as c FROM messages m
    JOIN conversations c ON m.conversation_id=c.id
    WHERE (c.participant_1=? OR c.participant_2=?) AND m.sender_id!=? AND m.read=0
  `).get(req.userId, req.userId, req.userId).c;
  res.json({ count });
});

// List all conversations
router.get('/conversations', authMiddleware, (req, res) => {
  const convs = db.prepare(`
    SELECT c.*,
      CASE WHEN c.participant_1=? THEN c.participant_2 ELSE c.participant_1 END as other_id
    FROM conversations c
    WHERE c.participant_1=? OR c.participant_2=?
    ORDER BY c.last_message_at DESC
  `).all(req.userId, req.userId, req.userId);

  const result = convs.map(conv => {
    const other = db.prepare('SELECT id,username,full_name,avatar_url,pet_type,pet_name FROM users WHERE id=?').get(conv.other_id);
    const lastMsg = db.prepare('SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1').get(conv.id);
    const unread = db.prepare('SELECT COUNT(*) as c FROM messages WHERE conversation_id=? AND sender_id!=? AND read=0').get(conv.id, req.userId).c;
    return { ...conv, other_user: other, last_message: lastMsg || null, unread_count: unread };
  });

  res.json(result);
});

// Get messages with a user (GET /api/messages/:userId)
router.get('/:userId', authMiddleware, (req, res) => {
  const otherUser = db.prepare('SELECT id,username,full_name,avatar_url,pet_type,pet_name FROM users WHERE id=?').get(req.params.userId);
  if (!otherUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  const conv = getOrCreateConversation(req.userId, parseInt(req.params.userId));

  // Mark messages as read
  db.prepare('UPDATE messages SET read=1 WHERE conversation_id=? AND sender_id!=?').run(conv.id, req.userId);

  const messages = db.prepare(`
    SELECT m.*,u.username,u.avatar_url FROM messages m
    JOIN users u ON m.sender_id=u.id
    WHERE m.conversation_id=?
    ORDER BY m.created_at ASC
    LIMIT 100
  `).all(conv.id);

  res.json({ conversation: conv, other_user: otherUser, messages });
});

// Get messages by username (GET /api/messages/u/:username)
router.get('/u/:username', authMiddleware, (req, res) => {
  const otherUser = db.prepare('SELECT id,username,full_name,avatar_url,pet_type,pet_name FROM users WHERE username=?').get(req.params.username);
  if (!otherUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  const conv = getOrCreateConversation(req.userId, otherUser.id);
  db.prepare('UPDATE messages SET read=1 WHERE conversation_id=? AND sender_id!=?').run(conv.id, req.userId);

  const messages = db.prepare(`
    SELECT m.*,u.username,u.avatar_url FROM messages m
    JOIN users u ON m.sender_id=u.id
    WHERE m.conversation_id=?
    ORDER BY m.created_at ASC LIMIT 100
  `).all(conv.id);

  res.json({ conversation: conv, other_user: otherUser, messages });
});

// Send message to user by userId
router.post('/:userId', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Mesaj boş olamaz' });

  const otherUser = db.prepare('SELECT id FROM users WHERE id=?').get(req.params.userId);
  if (!otherUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if (otherUser.id === req.userId) return res.status(400).json({ error: 'Kendinize mesaj gönderemezsiniz' });

  const conv = getOrCreateConversation(req.userId, otherUser.id);
  const result = db.prepare('INSERT INTO messages (conversation_id,sender_id,content) VALUES (?,?,?)').run(conv.id, req.userId, content.trim());
  db.prepare("UPDATE conversations SET last_message_at=datetime('now') WHERE id=?").run(conv.id);

  const msg = db.prepare('SELECT m.*,u.username,u.avatar_url FROM messages m JOIN users u ON m.sender_id=u.id WHERE m.id=?').get(result.lastInsertRowid);
  res.status(201).json(msg);
});

// Send message by username
router.post('/u/:username', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Mesaj boş olamaz' });

  const otherUser = db.prepare('SELECT id FROM users WHERE username=?').get(req.params.username);
  if (!otherUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  if (otherUser.id === req.userId) return res.status(400).json({ error: 'Kendinize mesaj gönderemezsiniz' });

  const conv = getOrCreateConversation(req.userId, otherUser.id);
  const result = db.prepare('INSERT INTO messages (conversation_id,sender_id,content) VALUES (?,?,?)').run(conv.id, req.userId, content.trim());
  db.prepare("UPDATE conversations SET last_message_at=datetime('now') WHERE id=?").run(conv.id);

  const msg = db.prepare('SELECT m.*,u.username,u.avatar_url FROM messages m JOIN users u ON m.sender_id=u.id WHERE m.id=?').get(result.lastInsertRowid);
  res.status(201).json(msg);
});

// Poll for new messages after a given ID
router.get('/:userId/poll', authMiddleware, (req, res) => {
  const afterId = parseInt(req.query.after) || 0;
  const otherUser = db.prepare('SELECT id FROM users WHERE id=?').get(req.params.userId);
  if (!otherUser) return res.status(404).json({ error: 'Bulunamadı' });

  const conv = getOrCreateConversation(req.userId, otherUser.id);
  db.prepare('UPDATE messages SET read=1 WHERE conversation_id=? AND sender_id!=?').run(conv.id, req.userId);

  const messages = db.prepare(`
    SELECT m.*,u.username,u.avatar_url FROM messages m
    JOIN users u ON m.sender_id=u.id
    WHERE m.conversation_id=? AND m.id>?
    ORDER BY m.created_at ASC
  `).all(conv.id, afterId);

  res.json(messages);
});

module.exports = router;
