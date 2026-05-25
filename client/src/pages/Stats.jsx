import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import api from '../api/axios';
import BackButton from '../components/BackButton';

export default function Stats() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!data) return null;

  const maxCount = Math.max(...(data.postsPerDay.map(d => d.count)), 1);

  return (
    <div className="page-container">
      <div className="page-container-left" />
      <div className="stats-page page-container-span">
      <BackButton fallback="/" />
      <h2 className="page-header">📊 Uygulama İstatistikleri</h2>

      <div className="stats-grid">
        <StatCard label="Kullanıcı" value={data.users} icon="👥" color="var(--pink)" />
        <StatCard label="Gönderi" value={data.posts} icon="📷" color="var(--blue)" />
        <StatCard label="Beğeni" value={data.likes} icon="❤️" color="#E11D48" />
        <StatCard label="Yorum" value={data.comments} icon="💬" color="var(--purple)" />
        <StatCard label="Takip" value={data.follows} icon="👣" color="var(--green)" />
        <StatCard label="Mesaj" value={data.messages} icon="✉️" color="var(--gold)" />
      </div>

      {data.postsPerDay.length > 0 && (
        <div className="stats-card">
          <div className="stats-card-title">📅 Son 30 Gün — Gönderi Aktivitesi</div>
          <div className="stats-chart">
            {data.postsPerDay.map(d => (
              <div key={d.day} className="stats-bar-wrap" title={`${d.day}: ${d.count} gönderi`}>
                <div
                  className="stats-bar"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                />
                <div className="stats-bar-label">{d.day.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-two-col">
        <div className="stats-card">
          <div className="stats-card-title">🏆 En Çok Takipçili</div>
          {data.topUsers.map((u, i) => (
            <div key={u.id} className="stats-user-row" onClick={() => navigate(`/${u.username}`)}>
              <div className="stats-rank">#{i + 1}</div>
              <Avatar user={u} size={36} />
              <div className="stats-user-info">
                <div className="stats-user-name">{u.username}</div>
                <div className="stats-user-sub">
                  {u.follower_count} takipçi · {u.post_count} gönderi
                  {u.pet_type === 'cat' ? ' · 🐱' : u.pet_type === 'dog' ? ' · 🐶' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="stats-card">
          <div className="stats-card-title">🆕 Son Katılanlar</div>
          {data.recentUsers.map(u => (
            <div key={u.id} className="stats-user-row" onClick={() => navigate(`/${u.username}`)}>
              <Avatar user={u} size={36} />
              <div className="stats-user-info">
                <div className="stats-user-name">{u.username}</div>
                <div className="stats-user-sub">
                  {u.pet_type === 'cat' ? '🐱' : u.pet_type === 'dog' ? '🐶' : '🐾'} ·{' '}
                  {new Date(u.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.topPosts.length > 0 && (
        <div className="stats-card">
          <div className="stats-card-title">🔥 En Çok Beğenilen Gönderiler</div>
          <div className="stats-posts-grid">
            {data.topPosts.map((post, i) => (
              <div key={post.id} className="stats-post-item" onClick={() => navigate(`/post/${post.id}`)}>
                {post.media_type === 'video' ? (
                  <video src={post.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline preload="metadata" />
                ) : (
                  <img src={post.image_url} alt="" />
                )}
                <div className="stats-post-overlay">
                  <div className="stats-post-likes">❤️ {post.like_count}</div>
                  <div className="stats-post-user">@{post.username}</div>
                </div>
                <div className="stats-post-rank">#{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
      <div className="stat-card-value">{value?.toLocaleString('tr-TR')}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
