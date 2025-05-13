import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Discover() {
  const [games, setGames] = useState([]);

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

    fetchGames();
  }, []);

  return (
    <div>
      <h1>Descubra Jogos</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {games.map((game) => (
          <div key={game.rawg_id} style={{ width: '180px', border: '1px solid #ccc', padding: '0.5rem' }}>
            <img src={game.cover_url} alt={game.title} style={{ width: '100%' }} />
            <h4>{game.title}</h4>
            <p>{game.genre} - {game.platform}</p>
            <p>Nota: {game.rating}</p>
            {/*botão: "Adicionar ao perfil" */}
          </div>
        ))}
      </div>
    </div>
  );
}
