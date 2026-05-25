export default function Avatar({ user, size = 40, ring = false, className = '' }) {
  if (!user) return null;

  const inner = user.avatar_url
    ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
    : <AvatarPlaceholder user={user} size={ring ? size - 8 : size} />;

  if (ring) {
    return (
      <div className={`avatar-ring ${className}`} style={{ width: size, height: size, flexShrink: 0 }}>
        <div className="avatar-inner" style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg)', background: 'var(--bg3)' }}>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)' }}>
      {inner}
    </div>
  );
}

function AvatarPlaceholder({ user, size }) {
  const initials = (user.full_name || user.username || '?')[0].toUpperCase();
  const gradients = [
    ['#FF3D9A','#FF6EC7'], ['#9B59FF','#FF3D9A'], ['#FF3D9A','#FFB347'],
    ['#00D4FF','#9B59FF'], ['#00E5A0','#00D4FF'],
  ];
  const idx = (user.username || '').charCodeAt(0) % gradients.length;
  const [c1, c2] = gradients[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 800, fontSize: size * 0.38,
    }}>
      {initials}
    </div>
  );
}
