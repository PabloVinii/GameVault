import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  return (
    <nav style={{
      background: '#111',
      color: '#fff',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/discover" style={{ color: '#fff', marginRight: '1rem' }}>🏠 Home</Link>
        <Link to="/dashboard" style={{ color: '#fff', marginRight: '1rem' }}>🎮 Meu Perfil</Link>
      </div>
      <button onClick={handleLogout} style={{ background: '#333', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Sair
      </button>
    </nav>
  );
}
