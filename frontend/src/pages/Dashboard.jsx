import { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard/GameCard';

export default function Dashboard() {
  const [games, setGames] = useState([]);

  const fetchGames = async () => {
    try {
      const res = await api.get('usergames/');
      setGames(res.data);
    } catch (err) {
      alert('Erro ao buscar seus jogos');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div style={{ background: '#1e1e1e', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />
      <main style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', padding: '1rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🎮 Minha Coleção</h1>

          {games.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Você ainda não adicionou nenhum jogo.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {games.map((ug) => (
                <GameCard
                  key={ug.id}
                  game={ug.game}
                  showReview={true}
                  userGameData={ug}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
