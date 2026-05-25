const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const posts = db.prepare('SELECT COUNT(*) as c FROM posts').get().c;
  const likes = db.prepare('SELECT COUNT(*) as c FROM likes').get().c;
  const comments = db.prepare('SELECT COUNT(*) as c FROM comments').get().c;
  const follows = db.prepare('SELECT COUNT(*) as c FROM follows').get().c;
  const messages = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;

  const topUsers = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, u.pet_type, u.pet_name,
      COUNT(f.follower_id) as follower_count,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
    FROM users u LEFT JOIN follows f ON f.following_id = u.id
    GROUP BY u.id ORDER BY follower_count DESC LIMIT 10
  `).all();

  const topPosts = db.prepare(`
    SELECT p.*, u.username, u.avatar_url,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p JOIN users u ON p.user_id = u.id
    ORDER BY like_count DESC LIMIT 6
  `).all();

  const postsPerDay = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count
    FROM posts
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY day ORDER BY day ASC
  `).all();

  const recentUsers = db.prepare(`
    SELECT id, username, full_name, avatar_url, pet_type, created_at
    FROM users ORDER BY created_at DESC LIMIT 8
  `).all();

  res.json({ users, posts, likes, comments, follows, messages, topUsers, topPosts, postsPerDay, recentUsers });
});

module.exports = router;
