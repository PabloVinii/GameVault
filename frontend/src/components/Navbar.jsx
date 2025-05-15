// Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="nav-links">
        <Link to="/discover">🏠 Home</Link>
        <Link to="/dashboard">🎮 Meu Perfil</Link>
      </div>

      <button className="nav-btn" onClick={logout}>Sair</button>
    </nav>
  );
}
