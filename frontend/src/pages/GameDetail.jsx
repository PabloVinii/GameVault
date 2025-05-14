import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/api';
import './styles/GameDetail.css';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const isLoggedIn = !!localStorage.getItem('access');

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await api.get(`game-info/${id}/`);
        setGame(res.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do jogo', err);
      } finally {
        setLoading(false);
      }
    };

    const checkUserGames = async () => {
      if (isLoggedIn) {
        try {
          const res = await api.get('usergames/');
          const userHasGame = res.data.some(ug => ug.game.rawg_id === parseInt(id));
          setAdded(userHasGame);
        } catch (err) {
          console.error('Erro ao verificar se jogo já foi adicionado', err);
        }
      }
    };

    fetchGameDetails();
    checkUserGames();
  }, [id, isLoggedIn]);

  const handleAddToProfile = async () => {
    try {
      await api.post('add-game/', {
        title: game.title,
        status: 'wishlist',
        rating: null,
        review: '',
      });
      alert(`"${game.title}" adicionado à sua lista!`);
      setAdded(true);
    } catch (err) {
      alert('Erro ao adicionar jogo.');
      console.error(err);
    }
  };

  if (loading) return <div className="game-detail-loading">Carregando...</div>;
  if (!game) return <div className="game-detail-error">Jogo não encontrado.</div>;

  return (
    <div className="game-detail-container">
      <Navbar />
      <div className="game-detail-content">
        <img src={game.cover_url} alt={game.title} className="game-detail-cover" />
        <div className="game-detail-info">
          <h1>{game.title}</h1>
          <p><strong>Gênero:</strong> {game.genre}</p>
          <p><strong>Plataforma:</strong> {game.platform}</p>
          <p><strong>Nota RAWG:</strong> ⭐ {game.rating}</p>
          {game.description && (
            <p className="game-detail-description">{game.description}</p>
          )}

          {isLoggedIn && (
            added ? (
              <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Já adicionado ao seu perfil</span>
            ) : (
              <button
                onClick={handleAddToProfile}
                className="game-card-button"
              >
                + Adicionar ao perfil
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
