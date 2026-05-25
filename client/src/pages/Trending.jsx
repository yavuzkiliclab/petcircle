import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import BackButton from '../components/BackButton';
import api from '../api/axios';

const PERIODS = [
  { value: 'day', label: '24 Saat' },
  { value: 'week', label: 'Bu Hafta' },
  { value: 'month', label: 'Bu Ay' },
  { value: 'all', label: 'Tüm Zamanlar' },
];

export default function Trending() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [petFilter, setPetFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { fetchTrending(1, true); }, [period, petFilter]);

  const fetchTrending = async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const r = await api.get(`/posts/trending?period=${period}&pet_type=${petFilter}&page=${p}`);
      setPosts(prev => reset ? r.data.posts : [...prev, ...r.data.posts]);
      setHasMore(r.data.hasMore);
      setPage(p);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  const rankStyle = (i) => {
    if (i === 0) return 'gold';
    if (i === 1) return 'silver';
    if (i === 2) return 'bronze';
    return '';
  };

  const rankLabel = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  return (
    <div className="page-container">
      <div className="page-container-left" />
      <div className="trending-page page-container-span">
      <BackButton fallback="/" />
      <h2 className="page-header">🔥 En Çok Beğenilenler</h2>

      <div className="trending-header">
        {PERIODS.map(p => (
          <button key={p.value} className={`period-pill ${period === p.value ? 'active' : ''}`} onClick={() => setPeriod(p.value)}>
            {p.label}
          </button>
        ))}
      </div>

      <FilterBar value={petFilter} onChange={setPetFilter} />

      {loading ? (
        <div className="spinner" />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-text">Bu dönemde gönderi yok</div>
          <div className="empty-sub">Daha uzun bir dönem seç ya da fotoğraf paylaş!</div>
        </div>
      ) : (
        <>
          <div className="trending-grid">
            {posts.map((post, i) => (
              <div key={post.id} className="trending-item" onClick={() => navigate(`/post/${post.id}`)}>
                {post.media_type === 'video' ? (
                  <video src={post.image_url} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={post.image_url} alt="" loading="lazy" />
                )}
                <div className={`trending-rank ${rankStyle(i)}`}>{rankLabel(i)}</div>
                <div className="trending-overlay">
                  <div className="trending-likes">
                    <svg fill="white" viewBox="0 0 24 24" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {post.like_count}
                  </div>
                  <div className="trending-username">@{post.username}</div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="load-more-wrap">
              <button className="btn-load-more" onClick={() => fetchTrending(page + 1)} disabled={loadingMore}>
                {loadingMore ? 'Yükleniyor...' : 'Daha fazla'}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
