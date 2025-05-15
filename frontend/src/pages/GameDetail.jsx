import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { FaWindows, FaPlaystation, FaXbox, FaMobileAlt, FaApple } from 'react-icons/fa';
import { SiNintendo, SiLinux } from 'react-icons/si';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../api/api';
import './styles/GameDetail.css';

const platformIconMap = {
  pc: <FaWindows title="PC" />,
  playstation: <FaPlaystation title="PlayStation" />,
  xbox: <FaXbox title="Xbox" />,
  nintendo: <SiNintendo title="Nintendo" />,
  android: <FaMobileAlt title="Android" />,
  ios: <FaApple title="iOS" />,
  mac: <FaApple title="Mac" />,
  linux: <SiLinux title="Linux" />,
};

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const isLoggedIn = !!localStorage.getItem('access');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`game-info/${id}/`);
        setGame(data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do jogo', err);
      } finally {
        setLoading(false);
      }
    };

    const checkUserGames = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('usergames/');
        const has = res.data.some((ug) => ug.game.rawg_id === parseInt(id));
        setAdded(has);
      } catch (err) {
        console.error('Erro ao verificar se jogo já foi adicionado', err);
      }
    };

    fetchDetails();
    checkUserGames();
  }, [id, isLoggedIn]);

  const renderPlatforms = () => {
    if (!game?.platform) return null;
    const uniques = [...new Set(game.platform.split(',').map((p) => p.trim().toLowerCase()))];
    return uniques.map((key) => {
      const matched = Object.keys(platformIconMap).find((slug) => key.includes(slug));
      return matched ? (
        <span key={matched} style={{ marginRight: '6px', fontSize: '1.1rem' }}>
          {platformIconMap[matched]}
        </span>
      ) : null;
    });
  };

  if (loading) return <Spinner label="Carregando detalhes…" />;
  if (!game)    return <div className="game-detail-error">Jogo não encontrado.</div>;

  return (
    <div className="game-detail-container">
      <Navbar />
      <section className="game-hero">
        <img src={game.cover_url} alt={game.title} className="game-cover" />
        <h1>{game.title}</h1>
        <div className="game-meta">
          <span className="badge">{game.released || 'TBA'}</span>
          {game.metacritic && <span className="badge metacritic">Meta {game.metacritic}</span>}
          <span className="badge">⭐ {game.rating}</span>
        </div>
        <div className="platform-icons">{renderPlatforms()}</div>
      </section>

      <section className="game-info">
        {game.description && <p className="description">{game.description}</p>}

        {game.tags?.length > 0 && (
          <div className="tags-wrapper">
            {game.tags.slice(0, 10).map((t) => (
              <span key={t.id} className="tag">{t.name}</span>
            ))}
          </div>
        )}

        {game.screenshots?.length > 0 && (
          <div className="screenshots-grid">
            {game.screenshots.map((s) => (
              <img key={s.id} src={s.image} alt="Screenshot" />
            ))}
          </div>
        )}

        {isLoggedIn && (
          added ? (
            <div className="already-added">✓ Já adicionado ao seu perfil</div>
          ) : (
            <button className="add-btn" onClick={async () => {
              try {
                await api.post('add-game/', { title: game.title, status: 'wishlist' });
                setAdded(true);
              } catch (err) {
                alert('Erro ao adicionar jogo.');
              }
            }}>
              + Adicionar ao perfil
            </button>
          )
        )}
      </section>
    </div>
  );
}
