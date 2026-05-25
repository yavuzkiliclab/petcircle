const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getUserProfile(targetId, viewerId) {
  const user = db.prepare('SELECT id, username, full_name, bio, avatar_url, pet_name, pet_type, city, country, pet_breed, pet_birthdate, pet_gender, pet_color, pet_weight, pet_neutered, pet_vaccinated, pet_blood_type, pet_skills, pet_likes, pet_dislikes, pet_favorite_food, pet_traits, pet_lineage, pet_awards, created_at FROM users WHERE id = ?').get(targetId);
  if (!user) return null;
  const postCount = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(targetId).c;
  const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(targetId).c;
  const followingCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').get(targetId).c;
  const isFollowing = viewerId ? !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(viewerId, targetId) : false;
  return { ...user, post_count: postCount, follower_count: followerCount, following_count: followingCount, is_following: isFollowing };
}

router.get('/search', authMiddleware, (req, res) => {
  const q = req.query.q || '';
  const petType = req.query.pet_type;
  if (q.length < 1) return res.json([]);
  let petWhere = '';
  if (petType && petType !== 'all') {
    if (petType === 'rodent') petWhere = ` AND pet_type IN ('rabbit','hamster','guinea_pig')`;
    else if (petType === 'other') petWhere = ` AND pet_type NOT IN ('cat','dog','bird','rabbit','hamster','guinea_pig')`;
    else petWhere = ` AND pet_type = '${petType.replace(/'/g, "''")}'`;
  }
  const countryWhere = req.query.country ? ` AND country = '${req.query.country.replace(/'/g, "''")}'` : '';
  const cityWhere = req.query.city ? ` AND city LIKE '%${req.query.city.replace(/'/g, "''")}%'` : '';
  const users = db.prepare(`SELECT id, username, full_name, avatar_url, pet_name, pet_type, city, country FROM users WHERE (username LIKE ? OR full_name LIKE ?)${petWhere}${countryWhere}${cityWhere} LIMIT 20`).all(`%${q}%`, `%${q}%`);
  res.json(users);
});

router.get('/suggested', authMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const me = db.prepare('SELECT city, country, pet_type FROM users WHERE id=?').get(req.userId);
  const notFollowing = `id != ${req.userId} AND id NOT IN (SELECT following_id FROM follows WHERE follower_id=${req.userId})`;

  // Friends-of-friends (people my followees follow)
  const fof = db.prepare(`
    SELECT DISTINCT u.id, u.username, u.full_name, u.avatar_url, u.pet_name, u.pet_type, u.city, u.country,
      2 as score
    FROM follows f1
    JOIN follows f2 ON f1.following_id = f2.follower_id
    JOIN users u ON f2.following_id = u.id
    WHERE f1.follower_id = ${req.userId} AND ${notFollowing}
    LIMIT 30
  `).all();

  // Same city
  const sameCity = me?.city ? db.prepare(`
    SELECT id, username, full_name, avatar_url, pet_name, pet_type, city, country,
      1 as score
    FROM users WHERE city=? AND ${notFollowing} LIMIT 20
  `).all(me.city) : [];

  // Same pet type
  const samePet = db.prepare(`
    SELECT id, username, full_name, avatar_url, pet_name, pet_type, city, country,
      1 as score
    FROM users WHERE pet_type=? AND ${notFollowing} LIMIT 20
  `).all(me?.pet_type || 'other');

  // Merge & dedupe, weighted by score
  const seen = new Set();
  const merged = [];
  for (const u of [...fof, ...sameCity, ...samePet]) {
    if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
  }

  // If not enough, fill with random
  if (merged.length < limit) {
    const more = db.prepare(`
      SELECT id, username, full_name, avatar_url, pet_name, pet_type, city, country
      FROM users WHERE ${notFollowing} ORDER BY RANDOM() LIMIT ?
    `).all(limit - merged.length + 5);
    for (const u of more) {
      if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
    }
  }

  res.json(merged.slice(0, limit));
});

// Nearby users (same city or country)
router.get('/nearby', authMiddleware, (req, res) => {
  const me = db.prepare('SELECT city, country FROM users WHERE id=?').get(req.userId);
  if (!me?.city && !me?.country) return res.json([]);
  const users = db.prepare(`
    SELECT id, username, full_name, avatar_url, pet_name, pet_type, city, country
    FROM users
    WHERE id != ?
      AND (city = ? OR country = ?)
    ORDER BY CASE WHEN city = ? THEN 0 ELSE 1 END, RANDOM()
    LIMIT 12
  `).all(req.userId, me.city || '', me.country || '', me.city || '');
  res.json(users);
});

// Stories row: followed users + self
router.get('/stories', authMiddleware, (req, res) => {
  const followed = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.avatar_url, u.pet_type, u.pet_name
    FROM follows f JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY RANDOM() LIMIT 10
  `).all(req.userId);
  res.json(followed);
});

router.get('/:username', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json(getUserProfile(target.id, req.userId));
});

router.get('/:username/posts', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'Bulunamadı' });
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;
  const posts = db.prepare(`
    SELECT p.*, u.username, u.full_name, u.avatar_url, u.pet_type,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as liked
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?
  `).all(req.userId, target.id, limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(target.id).c;
  res.json({ posts: posts.map(p => ({ ...p, liked: !!p.liked })), hasMore: offset + posts.length < total });
});

router.post('/:username/follow', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'Bulunamadı' });
  if (target.id === req.userId) return res.status(400).json({ error: 'Kendinizi takip edemezsiniz' });

  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.userId, target.id);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.userId, target.id);
    db.prepare("DELETE FROM notifications WHERE recipient_id=? AND sender_id=? AND type='follow'").run(target.id, req.userId);
    const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(target.id).c;
    return res.json({ is_following: false, follower_count: followerCount });
  }
  db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?,?)').run(req.userId, target.id);
  // Notification
  const exists = db.prepare("SELECT id FROM notifications WHERE recipient_id=? AND sender_id=? AND type='follow'").get(target.id, req.userId);
  if (!exists) db.prepare("INSERT INTO notifications (recipient_id, sender_id, type) VALUES (?,?,'follow')").run(target.id, req.userId);

  const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').get(target.id).c;
  res.json({ is_following: true, follower_count: followerCount });
});

router.get('/:username/followers', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'Bulunamadı' });
  const followers = db.prepare(`SELECT u.id, u.username, u.full_name, u.avatar_url, u.pet_type FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ? ORDER BY f.created_at DESC`).all(target.id);
  res.json(followers);
});

router.get('/:username/following', authMiddleware, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'Bulunamadı' });
  const following = db.prepare(`SELECT u.id, u.username, u.full_name, u.avatar_url, u.pet_type FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ? ORDER BY f.created_at DESC`).all(target.id);
  res.json(following);
});

module.exports = router;
