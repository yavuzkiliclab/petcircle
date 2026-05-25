import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post('/auth/login', form);
      login(r.data.token, r.data.user);
      toast.success(`Hoş geldin, ${r.data.user.username}! ◉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ login: 'whisker_mom', password: 'demo1234' });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ fontSize: '2.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#00C9A7,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>◉</div>
        <h1 className="auth-title">PetCircle</h1>
        <p className="auth-subtitle">Tüylü dostların dünyası 🐾</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kullanıcı adı veya e-posta</label>
            <input
              className="form-input"
              value={form.login}
              onChange={e => setForm(p => ({ ...p, login: e.target.value }))}
              placeholder="kullanici_adi veya email"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <button
          onClick={fillDemo}
          style={{ marginTop: 12, width: '100%', padding: '10px', background: 'rgba(0,201,167,0.07)', border: '1px dashed rgba(0,201,167,0.35)', borderRadius: 10, color: 'var(--pink)', fontSize: 13, cursor: 'pointer' }}
        >
          🎭 Demo hesabıyla dene (whisker_mom / demo1234)
        </button>

        <div className="auth-switch">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </div>
      </div>
    </div>
  );
}
