import { useNavigate } from 'react-router-dom';

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }

  return (
    <button className="back-btn" onClick={handleBack} aria-label="Geri dön">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      <span>Geri</span>
    </button>
  );
}
