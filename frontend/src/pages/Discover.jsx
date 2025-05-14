import { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';

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
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>🎮 Descubra Jogos</h1>

          <div style={styles.grid}>
            {games.map((game) => {
              const alreadyAdded = userGames.includes(game.title);
              return (
                <div key={game.rawg_id} style={styles.card}>
                  <img
                    src={game.cover_url}
                    alt={game.title}
                    style={styles.image}
                  />
                  <div style={styles.cardContent}>
                    <h4 style={styles.cardTitle}>{game.title}</h4>
                    <small>{game.genre} - {game.platform}</small>
                    <p>⭐ {game.rating}</p>
                    {isLoggedIn && (
                      alreadyAdded ? (
                        <span style={styles.addedText}>✓ Já adicionado</span>
                      ) : (
                        <button
                          onClick={() => handleAddToProfile(game.title)}
                          style={styles.button}
                        >
                          + Adicionar ao perfil
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    background: '#1e1e1e',
    minHeight: '100vh',
    color: '#f0f0f0',
  },
  main: {
    padding: '2rem 1rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    color: '#111',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '0.5rem',
  },
  cardTitle: {
    margin: '0.5rem 0',
    fontWeight: 'bold',
  },
  addedText: {
    color: 'green',
    fontWeight: 'bold',
  },
  button: {
    background: '#111',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    marginTop: '0.5rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};
