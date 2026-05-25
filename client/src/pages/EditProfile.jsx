import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { useSettings, COUNTRIES } from '../context/SettingsContext';
import Avatar from '../components/Avatar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PET_TYPES = [
  { value: 'cat', labelKey: 'cat', icon: '🐱' },
  { value: 'dog', labelKey: 'dog', icon: '🐶' },
  { value: 'other', labelKey: 'other', icon: '🐾' },
];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { t, theme, setTheme, petFilter, setPetFilter, compact, setCompact, language, setLanguage } = useSettings();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    pet_name: user?.pet_name || '',
    pet_type: user?.pet_type || 'other',
    city: user?.city || '',
    country: user?.country || 'TR',
    pet_breed: user?.pet_breed || '',
    pet_birthdate: user?.pet_birthdate || '',
    pet_gender: user?.pet_gender || '',
    pet_color: user?.pet_color || '',
    pet_weight: user?.pet_weight || '',
    pet_neutered: user?.pet_neutered ? '1' : '0',
    pet_vaccinated: user?.pet_vaccinated ? '1' : '0',
    pet_blood_type: user?.pet_blood_type || '',
    pet_skills: user?.pet_skills ? user.pet_skills.split('|').join(', ') : '',
    pet_likes: user?.pet_likes ? user.pet_likes.split('|').join(', ') : '',
    pet_dislikes: user?.pet_dislikes ? user.pet_dislikes.split('|').join(', ') : '',
    pet_favorite_food: user?.pet_favorite_food || '',
    pet_traits: user?.pet_traits ? user.pet_traits.split('|').join(', ') : '',
    pet_lineage: user?.pet_lineage || '',
    pet_awards: user?.pet_awards ? user.pet_awards.split('|').join('\n') : '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAvatar = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = e => setAvatarPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    const pipeFields = ['pet_skills', 'pet_likes', 'pet_dislikes', 'pet_traits'];
    const newlineFields = ['pet_awards'];
    Object.entries(form).forEach(([k, v]) => {
      if (pipeFields.includes(k)) {
        fd.append(k, v.split(',').map(s => s.trim()).filter(Boolean).join('|'));
      } else if (newlineFields.includes(k)) {
        fd.append(k, v.split('\n').map(s => s.trim()).filter(Boolean).join('|'));
      } else {
        fd.append(k, v);
      }
    });
    fd.append('language', language);
    fd.append('pet_filter', petFilter);
    if (avatarFile) fd.append('avatar', avatarFile);
    try {
      const r = await api.put('/auth/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(r.data);
      toast.success(language === 'tr' ? 'Profil güncellendi!' : 'Profile updated!');
      navigate(`/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || (language === 'tr' ? 'Güncelleme başarısız' : 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  const displayUser = avatarPreview ? { ...user, avatar_url: avatarPreview } : user;

  return (
    <div className="edit-profile-page">
      <BackButton fallback="/profile" />
      <h2 className="page-header">✏️ {t('editProfileTitle')}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Avatar */}
        <div className="avatar-edit-wrap">
          <Avatar user={displayUser} size={80} />
          <div>
            <button type="button" className="avatar-edit-btn" onClick={() => fileRef.current?.click()}>
              {t('changePhoto')}
            </button>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, GIF</div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatar(e.target.files[0])} />
          </div>
        </div>

        {/* Basic info */}
        <div className="form-group">
          <label>{t('fullName')}</label>
          <input className="form-input" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
        </div>

        <div className="form-group">
          <label>{t('bio')}</label>
          <textarea
            className="form-input"
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder={t('bioPlaceholder')}
            rows={3}
            maxLength={160}
            style={{ resize: 'vertical' }}
          />
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>{form.bio.length}/160</div>
        </div>

        {/* Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>{t('city')}</label>
            <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder={t('cityPlaceholder')} maxLength={60} />
          </div>
          <div className="form-group">
            <label>{t('country')}</label>
            <select className="form-input" value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="divider" />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: -4 }}>🐾 {t('petInfo')}</div>

        <div className="form-group">
          <label>{t('petName')}</label>
          <input className="form-input" value={form.pet_name} onChange={e => set('pet_name', e.target.value)} placeholder={t('petNamePlaceholder')} maxLength={50} />
        </div>

        <div className="form-group">
          <label>{t('petType')}</label>
          <div className="pet-type-grid">
            {PET_TYPES.map(pt => (
              <button key={pt.value} type="button"
                className={`pet-type-btn ${form.pet_type === pt.value ? 'selected' : ''}`}
                onClick={() => set('pet_type', pt.value)}
              >
                <span>{pt.icon}</span>{t(pt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>📋 Hayvan Detayları</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Irk / Cins</label>
            <input className="form-input" value={form.pet_breed} onChange={e => set('pet_breed', e.target.value)} placeholder="British Shorthair, Golden..." maxLength={60} />
          </div>
          <div className="form-group">
            <label>Doğum Tarihi</label>
            <input className="form-input" type="date" value={form.pet_birthdate} onChange={e => set('pet_birthdate', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Cinsiyet</label>
            <div className="pet-type-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {['Erkek', 'Dişi'].map(g => (
                <button key={g} type="button" className={`pet-type-btn ${form.pet_gender === g ? 'selected' : ''}`} onClick={() => set('pet_gender', g)}>
                  {g === 'Erkek' ? '♂️' : '♀️'} {g}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Renk / Desen</label>
            <input className="form-input" value={form.pet_color} onChange={e => set('pet_color', e.target.value)} placeholder="Beyaz, Tekir, Sarman..." maxLength={40} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Ağırlık</label>
            <input className="form-input" value={form.pet_weight} onChange={e => set('pet_weight', e.target.value)} placeholder="4.5 kg" maxLength={20} />
          </div>
          <div className="form-group">
            <label>Kan Grubu</label>
            <input className="form-input" value={form.pet_blood_type} onChange={e => set('pet_blood_type', e.target.value)} placeholder="A, B, DEA 1.1+" maxLength={20} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
          <div className="settings-toggle-row" style={{ margin: 0, background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>✂️ Kısırlaştırılmış</div>
            <button type="button" className={`settings-toggle${form.pet_neutered === '1' ? ' on' : ''}`}
              onClick={() => set('pet_neutered', form.pet_neutered === '1' ? '0' : '1')} />
          </div>
          <div className="settings-toggle-row" style={{ margin: 0, background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>💉 Aşılı</div>
            <button type="button" className={`settings-toggle${form.pet_vaccinated === '1' ? ' on' : ''}`}
              onClick={() => set('pet_vaccinated', form.pet_vaccinated === '1' ? '0' : '1')} />
          </div>
        </div>

        <div className="form-group">
          <label>Karakter Özellikleri <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>(virgülle ayır)</span></label>
          <input className="form-input" value={form.pet_traits} onChange={e => set('pet_traits', e.target.value)} placeholder="Oyuncu, Sevecen, Meraklı" maxLength={200} />
        </div>

        <div className="form-group">
          <label>Yetenekler <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>(virgülle ayır)</span></label>
          <input className="form-input" value={form.pet_skills} onChange={e => set('pet_skills', e.target.value)} placeholder="Pati ver, Otur, Yüzme" maxLength={200} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label>Sevdikleri <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>(virgülle ayır)</span></label>
            <input className="form-input" value={form.pet_likes} onChange={e => set('pet_likes', e.target.value)} placeholder="Park gezisi, Oyun topu" maxLength={300} />
          </div>
          <div className="form-group">
            <label>Sevmedikleri <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>(virgülle ayır)</span></label>
            <input className="form-input" value={form.pet_dislikes} onChange={e => set('pet_dislikes', e.target.value)} placeholder="Yağmur, Veteriner" maxLength={200} />
          </div>
        </div>

        <div className="form-group">
          <label>En Sevdiği Yemek</label>
          <input className="form-input" value={form.pet_favorite_food} onChange={e => set('pet_favorite_food', e.target.value)} placeholder="Ton balığı, Tavuk..." maxLength={80} />
        </div>

        <div className="form-group">
          <label>Soy Bilgisi</label>
          <input className="form-input" value={form.pet_lineage} onChange={e => set('pet_lineage', e.target.value)} placeholder="Anne: Bella | Baba: Shadow" maxLength={150} />
        </div>

        <div className="form-group">
          <label>Ödüller <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11 }}>(her satır ayrı ödül)</span></label>
          <textarea className="form-input" value={form.pet_awards} onChange={e => set('pet_awards', e.target.value)} placeholder={'Birinci ödül 2023\nİkinci ödül 2022'} rows={2} maxLength={400} style={{ resize: 'vertical' }} />
        </div>

        <hr className="divider" />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>⚙️ {t('settings')}</div>

        {/* Language */}
        <div className="form-group">
          <label>{t('language')}</label>
          <div className="pet-type-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button type="button" className={`pet-type-btn ${language === 'tr' ? 'selected' : ''}`} onClick={() => setLanguage('tr')}>
              🇹🇷 {t('turkish')}
            </button>
            <button type="button" className={`pet-type-btn ${language === 'en' ? 'selected' : ''}`} onClick={() => setLanguage('en')}>
              🇬🇧 {t('english')}
            </button>
          </div>
        </div>

        {/* Dark mode toggle */}
        <div className="settings-toggle-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{t('darkMode')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{theme === 'dark' ? '🌙' : '☀️'}</div>
          </div>
          <button
            type="button"
            className={`settings-toggle${theme === 'dark' ? ' on' : ''}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>

        {/* Compact mode toggle */}
        <div className="settings-toggle-row">
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{t('compactMode')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{compact ? '⬛' : '⬜'}</div>
          </div>
          <button
            type="button"
            className={`settings-toggle${compact ? ' on' : ''}`}
            onClick={() => setCompact(!compact)}
          />
        </div>

        {/* Pet filter */}
        <div className="form-group">
          <label>{t('petFilter')}</label>
          <div className="pet-type-grid">
            {[
              { value: 'all', label: t('all'), icon: '🐾' },
              { value: 'cat', label: t('cat'), icon: '🐱' },
              { value: 'dog', label: t('dog'), icon: '🐶' },
            ].map(opt => (
              <button key={opt.value} type="button"
                className={`pet-type-btn ${petFilter === opt.value ? 'selected' : ''}`}
                onClick={() => setPetFilter(opt.value)}
              >
                <span>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
}
