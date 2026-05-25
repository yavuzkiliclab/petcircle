export default function FilterBar({ value, onChange }) {
  const filters = [
    { value: 'all',    label: 'Tümü',      icon: '🐾' },
    { value: 'cat',    label: 'Kediler',    icon: '🐱' },
    { value: 'dog',    label: 'Köpekler',   icon: '🐶' },
    { value: 'bird',   label: 'Kuşlar',     icon: '🦜' },
    { value: 'rodent', label: 'Kemirgenler',icon: '🐹' },
    { value: 'other',  label: 'Diğer',      icon: '🐠' },
  ];
  return (
    <div className="filter-bar">
      {filters.map(f => (
        <button
          key={f.value}
          className={`filter-pill ${value === f.value ? 'active' : ''}`}
          onClick={() => onChange(f.value)}
        >
          <span>{f.icon}</span>
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
}
