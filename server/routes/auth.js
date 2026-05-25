const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password, full_name, pet_name, pet_type } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return res.status(400).json({ error: 'Kullanıcı adı sadece harf, rakam, _ ve . içerebilir' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(409).json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanımda' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const result = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, pet_name, pet_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, email, password_hash, full_name, pet_name || '', pet_type || 'other');

  const user = db.prepare('SELECT id, username, email, full_name, bio, avatar_url, pet_name, pet_type, city, country, language, pet_filter, pet_breed, pet_birthdate, pet_gender, pet_color, pet_weight, pet_neutered, pet_vaccinated, pet_blood_type, pet_skills, pet_likes, pet_dislikes, pet_favorite_food, pet_traits, pet_lineage, pet_awards, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı/e-posta ve şifre gerekli' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
  if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Hatalı şifre' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  const { password_hash, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, full_name, bio, avatar_url, pet_name, pet_type, city, country, language, pet_filter, pet_breed, pet_birthdate, pet_gender, pet_color, pet_weight, pet_neutered, pet_vaccinated, pet_blood_type, pet_skills, pet_likes, pet_dislikes, pet_favorite_food, pet_traits, pet_lineage, pet_awards, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  res.json(user);
});

router.put('/me', authMiddleware, upload.single('avatar'), (req, res) => {
  const {
    full_name, bio, pet_name, pet_type, city, country, language, pet_filter,
    pet_breed, pet_birthdate, pet_gender, pet_color, pet_weight,
    pet_neutered, pet_vaccinated, pet_blood_type,
    pet_skills, pet_likes, pet_dislikes, pet_favorite_food, pet_traits, pet_lineage, pet_awards,
  } = req.body;
  const updates = {};

  if (full_name !== undefined) updates.full_name = full_name;
  if (bio !== undefined) updates.bio = bio;
  if (pet_name !== undefined) updates.pet_name = pet_name;
  if (pet_type !== undefined) updates.pet_type = pet_type;
  if (city !== undefined) updates.city = city;
  if (country !== undefined) updates.country = country;
  if (language !== undefined) updates.language = language;
  if (pet_filter !== undefined) updates.pet_filter = pet_filter;
  if (pet_breed !== undefined) updates.pet_breed = pet_breed;
  if (pet_birthdate !== undefined) updates.pet_birthdate = pet_birthdate;
  if (pet_gender !== undefined) updates.pet_gender = pet_gender;
  if (pet_color !== undefined) updates.pet_color = pet_color;
  if (pet_weight !== undefined) updates.pet_weight = pet_weight;
  if (pet_neutered !== undefined) updates.pet_neutered = pet_neutered;
  if (pet_vaccinated !== undefined) updates.pet_vaccinated = pet_vaccinated;
  if (pet_blood_type !== undefined) updates.pet_blood_type = pet_blood_type;
  if (pet_skills !== undefined) updates.pet_skills = pet_skills;
  if (pet_likes !== undefined) updates.pet_likes = pet_likes;
  if (pet_dislikes !== undefined) updates.pet_dislikes = pet_dislikes;
  if (pet_favorite_food !== undefined) updates.pet_favorite_food = pet_favorite_food;
  if (pet_traits !== undefined) updates.pet_traits = pet_traits;
  if (pet_lineage !== undefined) updates.pet_lineage = pet_lineage;
  if (pet_awards !== undefined) updates.pet_awards = pet_awards;
  if (req.file) updates.avatar_url = `/uploads/${req.file.filename}`;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Güncellenecek alan bulunamadı' });
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.userId);

  const user = db.prepare('SELECT id, username, email, full_name, bio, avatar_url, pet_name, pet_type, city, country, language, pet_filter, pet_breed, pet_birthdate, pet_gender, pet_color, pet_weight, pet_neutered, pet_vaccinated, pet_blood_type, pet_skills, pet_likes, pet_dislikes, pet_favorite_food, pet_traits, pet_lineage, pet_awards, created_at FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

module.exports = router;
