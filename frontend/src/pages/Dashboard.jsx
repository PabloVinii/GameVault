import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './styles/Profile.css';
import EditGameModal from '../components/EditGameModal';

/**
 * Small reusable card to display numeric stats
 */
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [games, setGames] = useState([]);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // all | played | playing | wishlist
  const [editingUG, setEditingUG] = useState(null);

  /**
   * Fetches user games
   */
  const fetchGames = async () => {
    try {
      const res = await api.get('usergames/');
      setGames(res.data);
    } catch (err) {
      console.error('Erro ao buscar seus jogos', err);
    }
  };

  /**
   * Fetches current user profile (username / avatar).
   * Se você ainda não tem essa rota no backend, basta comentar este
   * bloco e setar estático ou pegar do localStorage.
   */
  const fetchUser = async () => {
    try {
      const { data } = await api.get('auth/user/'); // ajuste a rota conforme seu backend
      setUsername(data.username);
      setAvatarUrl(data.avatar || 'https://ui-avatars.com/api/?name=' + data.username);
    } catch (err) {
      // fallback simples se rota não existir
      const stored = localStorage.getItem('username');
      if (stored) {
        setUsername(stored);
        setAvatarUrl('https://ui-avatars.com/api/?name=' + stored);
      }
    }
  };

  useEffect(() => {
    fetchGames();
    fetchUser();
  }, []);

  /**
   * Memoise derived stats
   */
  const stats = useMemo(() => {
    const total = games.length;
    const played = games.filter((ug) => ug.status === 'played').length;
    const playing = games.filter((ug) => ug.status === 'playing').length;
    const wishlist = games.filter((ug) => ug.status === 'wishlist').length;
    const rated = games.filter((ug) => ug.rating !== null && ug.rating !== undefined);
    const avgRating = rated.length ? (rated.reduce((sum, g) => sum + g.rating, 0) / rated.length).toFixed(1) : '—';
    return { total, played, playing, wishlist, avgRating };
  }, [games]);

  /**
   * Lista de jogos visível considerando a aba selecionada (recalcula a cada render necessário).
   */
  const visibleGames = selectedTab === 'all'
    ? games
    : games.filter((ug) => ug.status === selectedTab);

  const handleDelete = async (userGameId) => {
    try {
      await api.delete(`/usergames/${userGameId}/`);
      toast.success('Jogo removido com sucesso!', { delay: 300 });
      setGames((prev) => prev.filter((g) => g.id !== userGameId));
    } catch (err) {
      if (err.response?.status !== 204) {
        toast.error('Erro ao remover jogo.');
        console.error(err);
        return;
      }
      // mesmo se cair aqui por status 204, ainda removemos
      toast.success('Jogo removido com sucesso!', { delay: 300 });
      setGames((prev) => prev.filter((g) => g.id !== userGameId));
    }
  };

  return (
    <div className="profile-page">
      <Navbar />

      {/* HEADER */}
      <header className="profile-header">
        <img className="profile-avatar" src={avatarUrl} alt="Avatar" />
        <div className="profile-meta">
          <h1>@{username || 'Meu Perfil'}</h1>
          <div className="profile-stats">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Jogando" value={stats.playing} />
            <StatCard label="Concluídos" value={stats.played} />
            <StatCard label="Wishlist" value={stats.wishlist} />
            <StatCard label="Nota média" value={stats.avgRating} />
          </div>
          <button className="edit-button" onClick={() => alert('TODO: abrir modal de edição')}>Editar Perfil</button>
        </div>
      </header>

      {/* TABS */}
      <nav className="tab-nav">
        {['all', 'playing', 'played', 'wishlist'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab === 'all' ? 'Todos' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* GAME GRID */}
      <main className="game-grid-wrapper">
        {visibleGames.length === 0 ? (
          <p className="empty-msg">Nenhum jogo nessa categoria.</p>
        ) : (
          <div className="game-grid">
            {visibleGames.map((ug) => (
              <Link key={ug.id} to={`/game/${ug.game.rawg_id}`} className="link-reset">
                <GameCard
                  game={ug.game}
                  showReview={true}
                  userGameData={ug}
                  onEdit={() => setEditingUG(ug)}
                  onDelete={() => handleDelete(ug.id)}
                  variant="dashboard"
                />
              </Link>
            ))}
          </div>
        )}
      </main>

      {editingUG && (
        <EditGameModal
          userGame={editingUG}
          onClose={() => setEditingUG(null)}
          onUpdated={(updated) => {
            setGames((prev) => prev.map((ug) => (ug.id === updated.id ? updated : ug)));
            setEditingUG(null);
          }}
        />
      )}
    </div>
  );
}
