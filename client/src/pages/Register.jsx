import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PET_TYPES = [
  { value: 'cat', label: 'Kedi', icon: '🐱' },
  { value: 'dog', label: 'Köpek', icon: '🐶' },
  { value: 'other', label: 'Diğer', icon: '🐾' },
];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', full_name: '', pet_name: '', pet_type: 'cat'
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return; }
    setLoading(true);
    try {
      const r = await api.post('/auth/register', form);
      login(r.data.token, r.data.user);
      toast.success(`Hoş geldin, ${r.data.user.username}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ fontSize: '2.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#00C9A7,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>◉</div>
        <h1 className="auth-title">PetCircle'a Katıl</h1>
        <p className="auth-subtitle">Tüylü dostunla çembere gir! 🐾</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ad Soyad</label>
            <input className="form-input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Adın Soyadın" required />
          </div>
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input className="form-input" value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} placeholder="tatlı_hayvan_sahibi" required />
          </div>
          <div className="form-group">
            <label>E-posta</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ornek@email.com" required />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="En az 6 karakter" required />
          </div>

          <hr className="divider" />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: -4 }}>Evcil hayvanın hakkında</div>

          <div className="form-group">
            <label>Evcil hayvanının adı</label>
            <input className="form-input" value={form.pet_name} onChange={e => set('pet_name', e.target.value)} placeholder="Pamuk, Max, Boncuk..." />
          </div>

          <div className="form-group">
            <label>Evcil hayvan türü</label>
            <div className="pet-type-grid">
              {PET_TYPES.map(pt => (
                <button key={pt.value} type="button"
                  className={`pet-type-btn ${form.pet_type === pt.value ? 'selected' : ''}`}
                  onClick={() => set('pet_type', pt.value)}
                >
                  <span>{pt.icon}</span>{pt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur ◉'}
          </button>
        </form>

        <div className="auth-switch">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </div>
      </div>
    </div>
  );
}
