import { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard/GameCard';

export default function Discover() {
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const isLoggedIn = !!localStorage.getItem('access');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get('discover-games/');
        setGames(res.data);
      } catch (err) {
        alert('Erro ao buscar jogos populares');
        console.error(err);
      }
    };

    const fetchUserGames = async () => {
      if (isLoggedIn) {
        try {
          const res = await api.get('usergames/');
          setUserGames(res.data.map(ug => ug.game.title));
        } catch (err) {
          console.error('Erro ao buscar jogos do usuário', err);
        }
      }
    };

    fetchGames();
    fetchUserGames();
  }, [isLoggedIn]);

  const handleAddToProfile = async (title) => {
    try {
      const res = await api.post('add-game/', {
        title,
        status: 'wishlist',
        rating: null,
        review: '',
      });
      alert(`"${title}" adicionado à sua lista!`);
      setUserGames((prev) => [...prev, title]);
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert('Erro ao adicionar jogo.');
      }
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#1e1e1e', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />
      <main style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', padding: '1rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🎮 Descubra Jogos</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {games.map((game) => (
              <GameCard
                key={game.rawg_id}
                game={game}
                added={userGames.includes(game.title)}
                onAddClick={handleAddToProfile}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
