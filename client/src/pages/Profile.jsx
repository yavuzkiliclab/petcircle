import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

function calcAge(birthdate) {
  if (!birthdate) return null;
  const bd = new Date(birthdate);
  const now = new Date();
  const years = now.getFullYear() - bd.getFullYear();
  const months = now.getMonth() - bd.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) return `${totalMonths} ay`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y} yıl ${m} ay` : `${y} yıl`;
}

function splitPipe(str) {
  if (!str) return [];
  return str.split('|').map(s => s.trim()).filter(Boolean);
}

function PetIdentityCard({ profile }) {
  const icon = profile.pet_type === 'cat' ? '🐱' : profile.pet_type === 'dog' ? '🐶' : '🐾';
  const age = calcAge(profile.pet_birthdate);
  const traits = splitPipe(profile.pet_traits);
  const skills = splitPipe(profile.pet_skills);
  const likes = splitPipe(profile.pet_likes);
  const dislikes = splitPipe(profile.pet_dislikes);
  const awards = splitPipe(profile.pet_awards);

  return (
    <div className="pet-id-card">
      <div className="pet-id-hero">
        <div className="pet-id-hero-icon">{icon}</div>
        <div>
          <div className="pet-id-name">{profile.pet_name || profile.full_name}</div>
          {profile.pet_breed && <div className="pet-id-breed">{profile.pet_breed}</div>}
        </div>
      </div>

      <div className="pet-id-stats">
        {age && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">{age}</div>
            <div className="pet-id-stat-label">Yaş</div>
          </div>
        )}
        {profile.pet_gender && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">{profile.pet_gender === 'Erkek' ? '♂️' : '♀️'} {profile.pet_gender}</div>
            <div className="pet-id-stat-label">Cinsiyet</div>
          </div>
        )}
        {profile.pet_color && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">{profile.pet_color}</div>
            <div className="pet-id-stat-label">Renk</div>
          </div>
        )}
        {profile.pet_weight && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">{profile.pet_weight}</div>
            <div className="pet-id-stat-label">Ağırlık</div>
          </div>
        )}
        {profile.pet_blood_type && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">{profile.pet_blood_type}</div>
            <div className="pet-id-stat-label">Kan Grubu</div>
          </div>
        )}
        {profile.city && (
          <div className="pet-id-stat">
            <div className="pet-id-stat-val">📍 {profile.city}</div>
            <div className="pet-id-stat-label">Şehir</div>
          </div>
        )}
      </div>

      {(profile.pet_neutered !== undefined || profile.pet_vaccinated !== undefined) && (
        <div className="pet-id-health">
          <span className={`pet-id-health-badge ${profile.pet_neutered ? 'yes' : 'no'}`}>
            {profile.pet_neutered ? '✓' : '✗'} Kısırlaştırılmış
          </span>
          <span className={`pet-id-health-badge ${profile.pet_vaccinated ? 'yes' : 'no'}`}>
            {profile.pet_vaccinated ? '✓' : '✗'} Aşılı
          </span>
        </div>
      )}

      {traits.length > 0 && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">✨ Karakter</div>
          <div className="pet-id-tags">
            {traits.map(t => <span key={t} className="pet-id-tag pet-id-trait">{t}</span>)}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">🎯 Yetenekler</div>
          <div className="pet-id-tags">
            {skills.map(s => <span key={s} className="pet-id-tag pet-id-skill">{s}</span>)}
          </div>
        </div>
      )}

      {(likes.length > 0 || dislikes.length > 0) && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">❤️ Sevdiği & Sevmediği</div>
          <div className="pet-id-tags">
            {likes.map(l => <span key={l} className="pet-id-tag pet-id-like">{l}</span>)}
            {dislikes.map(d => <span key={d} className="pet-id-tag pet-id-dislike">{d}</span>)}
          </div>
        </div>
      )}

      {profile.pet_favorite_food && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">🍽️ En Sevdiği Yemek</div>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{profile.pet_favorite_food}</div>
        </div>
      )}

      {profile.pet_lineage && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">🏛️ Soy Bilgisi</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{profile.pet_lineage}</div>
        </div>
      )}

      {awards.length > 0 && (
        <div className="pet-id-section">
          <div className="pet-id-section-title">🏆 Ödüller</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {awards.map(a => (
              <div key={a} className="pet-id-award">🥇 {a}</div>
            ))}
          </div>
        </div>
      )}

      {profile.pet_birthdate && (
        <div className="pet-id-section" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
            🎂 Doğum: {new Date(profile.pet_birthdate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isMe = me?.username === username;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/users/${username}`);
      setProfile(r.data);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const r = await api.get(`/users/${username}/posts`);
      setPosts(r.data.posts);
    } catch {}
  };

  const fetchFollowers = async () => {
    try {
      const r = await api.get(`/users/${username}/followers`);
      setFollowers(r.data);
    } catch {}
  };

  const fetchFollowing = async () => {
    try {
      const r = await api.get(`/users/${username}/following`);
      setFollowing(r.data);
    } catch {}
  };

  const handleTab = (t) => {
    setTab(t);
    if (t === 'followers') fetchFollowers();
    if (t === 'following') fetchFollowing();
  };

  const handleFollow = async () => {
    try {
      const r = await api.post(`/users/${username}/follow`);
      setProfile(p => ({ ...p, is_following: r.data.is_following, follower_count: r.data.follower_count }));
      toast.success(r.data.is_following ? `${username} takip ediliyor` : 'Takip bırakıldı');
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const petIcon = profile?.pet_type === 'cat' ? '🐱' : profile?.pet_type === 'dog' ? '🐶' : '🐾';

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!profile) return null;

  const hasPetDetails = profile.pet_breed || profile.pet_birthdate || profile.pet_traits || profile.pet_skills;

  const coverTag = profile.pet_type === 'cat' ? 'cat,kitten' : profile.pet_type === 'dog' ? 'dog,puppy' : profile.pet_type === 'bird' ? 'parrot' : profile.pet_type === 'rabbit' ? 'rabbit' : profile.pet_type === 'hamster' ? 'hamster' : 'pet,animal';

  return (
    <div className="page-container">
      <div className="page-container-left" />
      <div className="profile-page page-container-span">
      <BackButton fallback="/" />

      {/* Cover photo banner */}
      <div
        className="profile-cover-banner"
        style={{ backgroundImage: `url(https://loremflickr.com/1200/300/${coverTag}?lock=${profile.id * 7})` }}
      >
        <div className="profile-cover-gradient">
          <div className="profile-cover-meta">
            <span className="profile-cover-username">@{profile.username}</span>
            {profile.pet_name && (
              <span className="profile-cover-pet">{petIcon} {profile.pet_name}{profile.pet_breed ? ` · ${profile.pet_breed}` : ''}</span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <Avatar user={profile} size={120} />
        </div>
        <div className="profile-info">
          <div className="profile-top">
            <span className="profile-username">{profile.username}</span>
            {isMe ? (
              <Link to="/profile/edit">
                <button className="btn-edit-profile">Profili Düzenle</button>
              </Link>
            ) : (
              <>
                <button
                  className={`btn-follow-profile ${profile.is_following ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {profile.is_following ? 'Takip Ediliyor' : 'Takip Et'}
                </button>
                <Link to={`/messages/${profile.username}`}>
                  <button className="btn-edit-profile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Mesaj
                  </button>
                </Link>
              </>
            )}
          </div>

          <div className="profile-stats">
            <div className="profile-stat" style={{ cursor: 'pointer' }} onClick={() => handleTab('posts')}>
              <div className="profile-stat-num">{profile.post_count}</div>
              <div className="profile-stat-label">Gönderi</div>
            </div>
            <div className="profile-stat" style={{ cursor: 'pointer' }} onClick={() => handleTab('followers')}>
              <div className="profile-stat-num">{profile.follower_count}</div>
              <div className="profile-stat-label">Takipçi</div>
            </div>
            <div className="profile-stat" style={{ cursor: 'pointer' }} onClick={() => handleTab('following')}>
              <div className="profile-stat-num">{profile.following_count}</div>
              <div className="profile-stat-label">Takip</div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.full_name}</div>
            {profile.bio && <div className="profile-bio">{profile.bio}</div>}
            {profile.pet_name && (
              <div className="profile-pet-badge">{petIcon} {profile.pet_name}{profile.pet_breed ? ` · ${profile.pet_breed}` : ''}</div>
            )}
            {profile.city && (
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>📍 {profile.city}{profile.country && profile.country !== 'TR' ? `, ${profile.country}` : ''}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {[
          { id: 'posts', icon: '⊞', label: 'Gönderiler' },
          ...(hasPetDetails ? [{ id: 'pet', icon: petIcon, label: 'Kimlik Kartı' }] : []),
          { id: 'followers', icon: '👥', label: 'Takipçiler' },
          { id: 'following', icon: '👣', label: 'Takip' },
        ].map(t => (
          <button key={t.id} onClick={() => handleTab(t.id)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--pink)' : '2px solid transparent',
              color: tab === t.id ? 'var(--pink)' : 'var(--text3)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6
            }}
          >
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <div className="empty-text">Henüz gönderi yok</div>
            {isMe && <Link to="/new"><button className="btn-primary" style={{ marginTop: 12 }}>İlk gönderini paylaş</button></Link>}
          </div>
        ) : (
          <div className="profile-posts-grid">
            {posts.map(post => (
              <div key={post.id} className="explore-item" onClick={() => navigate(`/post/${post.id}`)}>
                {post.media_type === 'video' ? (
                  <>
                    <video src={post.image_url} className="explore-video" muted playsInline preload="metadata" />
                    <div className="explore-video-badge">▶</div>
                  </>
                ) : (
                  <img src={post.image_url} alt="" loading="lazy" />
                )}
                <div className="explore-overlay">
                  <div className="explore-stat">
                    <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {post.like_count}
                  </div>
                  <div className="explore-stat">
                    <svg fill="white" viewBox="0 0 24 24" width="14" height="14">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {post.comment_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'pet' && <PetIdentityCard profile={profile} />}

      {tab === 'followers' && <UserList users={followers} />}

      {tab === 'following' && <UserList users={following} />}
      </div>
    </div>
  );
}

function UserList({ users }) {
  const navigate = useNavigate();
  if (users.length === 0) {
    return <div className="empty-state"><div className="empty-icon">👻</div><div className="empty-text">Kimse yok</div></div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {users.map(u => (
        <div key={u.id}
          onClick={() => navigate(`/${u.username}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--card)', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border)' }}
        >
          <Avatar user={u} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{u.full_name} · {u.pet_type === 'cat' ? '🐱' : u.pet_type === 'dog' ? '🐶' : '🐾'} {u.pet_name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
