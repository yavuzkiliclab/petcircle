import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import { useSettings, COUNTRIES } from '../context/SettingsContext';
import api from '../api/axios';

export default function Explore() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [petFilter, setPetFilter] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const [activeCountry, setActiveCountry] = useState('');
  const [tags, setTags] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    api.get('/posts/trending-tags').then(r => setTags(r.data)).catch(() => {});
    api.get('/users/suggested?limit=6').then(r => setSuggested(r.data)).catch(() => {});
    api.get('/users/nearby').then(r => setNearby(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchPosts(1, true); }, [petFilter, activeTag, activeCountry]);

  const fetchPosts = async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const tagParam = activeTag ? `&tag=${encodeURIComponent(activeTag)}` : '';
      const countryParam = activeCountry ? `&country=${encodeURIComponent(activeCountry)}` : '';
      const r = await api.get(`/posts/explore?page=${p}&pet_type=${petFilter}${tagParam}${countryParam}`);
      setPosts(prev => reset ? r.data.posts : [...prev, ...r.data.posts]);
      setHasMore(r.data.hasMore);
      setPage(p);
    } finally { setLoading(false); setLoadingMore(false); }
  };

  const handleTagClick = (tag) => setActiveTag(prev => prev === tag ? null : tag);

  const countryFlag = (code) => COUNTRIES.find(c => c.code === code)?.flag || '';
  const countryName = (code) => COUNTRIES.find(c => c.code === code)?.name || code;

  return (
    <div className="page-container">
      <div className="page-container-left" />
      <div className="explore-page page-container-span">
      <BackButton fallback="/" />

      {/* Trending hashtags */}
      {tags.length > 0 && (
        <div className="explore-tags-section">
          <div className="explore-tags-scroll">
            <button className={`explore-tag-chip${!activeTag ? ' active' : ''}`} onClick={() => setActiveTag(null)}>
              # {t('all')}
            </button>
            {tags.map(t2 => (
              <button
                key={t2.tag}
                className={`explore-tag-chip${activeTag === t2.tag ? ' active' : ''}`}
                onClick={() => handleTagClick(t2.tag)}
              >
                #{t2.tag}
                <span className="explore-tag-count">{t2.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Country filter */}
      <div className="explore-country-filter">
        <div className="explore-tags-scroll">
          <button
            className={`explore-tag-chip explore-country-chip${!activeCountry ? ' active' : ''}`}
            onClick={() => setActiveCountry('')}
          >
            🌍 {t('allCountries')}
          </button>
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              className={`explore-tag-chip explore-country-chip${activeCountry === c.code ? ' active' : ''}`}
              onClick={() => setActiveCountry(prev => prev === c.code ? '' : c.code)}
            >
              {c.flag} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby pets section */}
      {nearby.length > 0 && !activeTag && !activeCountry && (
        <div className="explore-suggested-section">
          <div className="explore-section-header">
            <span className="explore-section-title">📍 {t('nearYou')}</span>
          </div>
          <div className="explore-suggested-scroll">
            {nearby.map(u => (
              <div key={u.id} className="explore-suggested-card" onClick={() => navigate(`/${u.username}`)}>
                <Avatar user={u} size={56} />
                <div className="explore-suggested-name">{u.username}</div>
                <div className="explore-suggested-sub">{petIcon(u.pet_type)} {u.pet_name}</div>
                <div className="explore-suggested-loc">{countryFlag(u.country)} {u.city}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested users */}
      {suggested.length > 0 && !activeTag && !activeCountry && (
        <div className="explore-suggested-section">
          <div className="explore-section-header">
            <span className="explore-section-title">{t('suggestedUsers')}</span>
            <button className="explore-see-all" onClick={() => navigate('/search')}>{t('seeAll')}</button>
          </div>
          <div className="explore-suggested-scroll">
            {suggested.map(u => (
              <div key={u.id} className="explore-suggested-card" onClick={() => navigate(`/${u.username}`)}>
                <Avatar user={u} size={56} />
                <div className="explore-suggested-name">{u.username}</div>
                <div className="explore-suggested-sub">{petIcon(u.pet_type)} {u.pet_name}</div>
                {u.city && <div className="explore-suggested-loc">{countryFlag(u.country)} {u.city}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid header */}
      <div className="explore-grid-header">
        <h2 className="page-header" style={{ marginBottom: 0 }}>
          {activeTag ? `#${activeTag}` : activeCountry ? `${countryFlag(activeCountry)} ${countryName(activeCountry)}` : t('explore')}
        </h2>
        <FilterBar value={petFilter} onChange={v => setPetFilter(v)} />
      </div>

      {loading ? (
        <div className="spinner" />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{activeTag ? '#️⃣' : petFilter === 'cat' ? '🐱' : petFilter === 'dog' ? '🐶' : '📸'}</div>
          <div className="empty-text">{t('noPostsFound')}</div>
          <div className="empty-sub">{activeTag ? `#${activeTag} etiketi için gönderi yok` : t('shareFirst')}</div>
        </div>
      ) : (
        <>
          <div className="explore-grid">
            {posts.map(post => (
              <div key={post.id} className="explore-item" onClick={() => navigate(`/post/${post.id}`)}>
                {post.media_type === 'video' ? (
                  <>
                    <video src={post.image_url} className="explore-video" muted playsInline preload="metadata" />
                    <div className="explore-video-badge">▶</div>
                  </>
                ) : (
                  <img src={post.image_url} alt={post.caption || ''} loading="lazy" />
                )}
                <div className="explore-overlay">
                  <div className="explore-stat">
                    <svg fill="white" viewBox="0 0 24 24" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {post.like_count}
                  </div>
                  <div className="explore-stat">
                    <svg fill="white" viewBox="0 0 24 24" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {post.comment_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="load-more-wrap">
              <button className="btn-load-more" onClick={() => fetchPosts(page + 1)} disabled={loadingMore}>
                {loadingMore ? t('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

function petIcon(type) {
  return type === 'cat' ? '🐱' : type === 'dog' ? '🐶' : '🐾';
}
