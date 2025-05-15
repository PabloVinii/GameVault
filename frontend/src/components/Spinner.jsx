import './styles/Spinner.css';

export default function Spinner({ label }) {
  return (
    <div className="discover-loading">
      <div className="spinner" />
      {label && <p style={{ marginTop: '1rem', color: '#ccc' }}>{label}</p>}
    </div>
  );
}
