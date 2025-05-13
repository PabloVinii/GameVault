import { useEffect, useState } from 'react';
import api from '../api/api';
import AddGameForm from '../components/AddGameForm';

export default function Dashboard() {
  const [games, setGames] = useState([]);

  const fetchGames = async () => {
    try {
      const res = await api.get('usergames/');
      setGames(res.data);
    } catch (err) {
      alert('Erro ao buscar jogos');
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div>
      <h2>Meus Jogos</h2>
      <AddGameForm onGameAdded={fetchGames} />
      <ul>
        {games.map((ug) => (
          <li key={ug.id} style={{ marginBottom: '1rem' }}>
            <img src={ug.game.cover_url} alt={ug.game.title} width={100} />
            <div>
              <strong>{ug.game.title}</strong>
              <p>Status: {ug.status}</p>
              <p>Nota: {ug.rating || '—'}</p>
              <p>Comentário: {ug.review || '—'}</p>
              <small>{ug.game.genre} - {ug.game.platform}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
