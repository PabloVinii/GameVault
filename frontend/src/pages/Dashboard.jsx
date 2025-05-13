import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get('games/');
        setGames(res.data);
      } catch (err) {
        alert('Erro ao buscar jogos. Verifique se você está logado.');
        console.error(err);
      }
    };

    fetchGames();
  }, []);

  return (
    <div>
      <h2>Meus Jogos</h2>
      {games.length === 0 ? (
        <p>Nenhum jogo adicionado ainda.</p>
      ) : (
        <ul>
          {games.map((game) => (
            <li key={game.id}>
              <strong>{game.title}</strong> - {game.platform} - {game.status}
              {game.rating && <> - Nota: {game.rating}/10</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
