import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaWindows, FaPlaystation, FaXbox, FaMobileAlt, FaApple, FaExternalLinkAlt } from 'react-icons/fa';
import { SiNintendo, SiLinux, SiSteam, SiEpicgames, SiGogdotcom } from 'react-icons/si';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../api/api';
import './styles/GameDetail.css';

const platformIconMap = {
  pc: <FaWindows  title="PC"          />,
  playstation: <FaPlaystation title="PlayStation" />,
  xbox: <FaXbox      title="Xbox"        />,
  nintendo: <SiNintendo title="Nintendo"    />,
  android: <FaMobileAlt title="Android"      />,
  ios: <FaApple     title="iOS"          />,
  mac: <FaApple     title="Mac"          />,
  linux: <SiLinux     title="Linux"        />,
};

const storeIconMap = {
  steam: <SiSteam />,      // store.steampowered.com
  epic:  <SiEpicgames />,  // epicgames.com
  gog:   <SiGogdotcom />,  // gog.com
};

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [suggestedGames, setSuggestedGames] = useState([]);
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

    const fetchSuggested = async () => {
      try {
        const { data } = await api.get(`suggested-games/${id}/`);
        setSuggestedGames(data);
      } catch (err) {
        console.error('Erro ao buscar jogos sugeridos', err);
      }
    };

    fetchDetails();
    checkUserGames();
    fetchSuggested();
  }, [id, isLoggedIn]);

  /* ------------------------------------ */
  // Helpers
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

  const renderRatingBars = () => {
    if (!game?.ratings?.length) return null;
    return (
      <div className="rating-breakdown">
        {game.ratings.map((r) => (
          <div key={r.id} className="rating-row">
            <span className="r-title">{r.title}</span>
            <div className="r-bar"><div style={{ width: `${r.percent}%` }} /></div>
            <span className="r-percent">{r.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStores = () => {
    if (!game?.stores?.length) return null;
    return (
      <div className="stores-wrapper">
        {game.stores.map(({ store }, idx) => {
          const name = store.name;
          const domain = store.domain ? `https://${store.domain}` : '#';
          const iconKey = Object.keys(storeIconMap).find((k) => name.toLowerCase().includes(k));
          return (
            <a key={idx} href={domain} target="_blank" rel="noreferrer" className="store-btn">
              {iconKey && <span className="s-icon">{storeIconMap[iconKey]}</span>}
              {name}
              <FaExternalLinkAlt style={{ marginLeft: 4, fontSize: '.75rem' }} />
            </a>
          );
        })}
      </div>
    );
  };

  const renderSuggested = () => {
    if (!suggestedGames.length) return null;
    return (
      <div className="suggested-section">
        <h3>Você pode gostar de…</h3>
        <div className="suggested-grid">
          {suggestedGames.map((g) => (
            <Link key={g.rawg_id} to={`/game/${g.rawg_id}`} className="suggested-card">
              <img src={g.cover_url} alt={g.title} />
              <p>{g.title}</p>
              <span>⭐ {g.rating}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  /* ------------------------------------ */
  if (loading) return <Spinner label="Carregando detalhes…" />;
  if (!game)    return <div className="game-detail-error">Jogo não encontrado.</div>;

  return (
    <div className="game-detail-container">
      <Navbar />

      {/* HERO */}
      <section className="game-hero">
        <img src={game.cover_url} alt={game.title} className="game-cover" />
        <h1>{game.title}</h1>
        <div className="game-meta">
          {game.released && <span className="badge">{game.released}</span>}
          {game.metacritic && <span className="badge metacritic">Meta {game.metacritic}</span>}
          <span className="badge">⭐ {game.rating}</span>
        </div>
        <div className="platform-icons">{renderPlatforms()}</div>
      </section>

      {/* MAIN INFO */}
      <section className="game-info">
        {game.description && <p className="description">{game.description}</p>}
        {game.tags?.length > 0 && (
          <div className="tags-wrapper">
            {game.tags.slice(0, 15).map((t) => (<span key={t.id} className="tag">{t.name}</span>))}
          </div>
        )}
        {renderRatingBars()}
        {renderStores()}
        <div className="credits">
          {game.developers?.length > 0 && (<p><strong>Desenvolvedora:</strong> {game.developers.map((d) => d.name).join(', ')}</p>)}
          {game.publishers?.length > 0 && (<p><strong>Publicadora:</strong> {game.publishers.map((p) => p.name).join(', ')}</p>)}
        </div>
        {game.website && (
          <a href={game.website} target="_blank" rel="noreferrer" className="external-btn">🌐 Site Oficial <FaExternalLinkAlt style={{ marginLeft: 4 }} /></a>
        )}
        {renderSuggested()}
        {isLoggedIn && (
          added ? (<div className="already-added">✓ Já adicionado ao seu perfil</div>) : (
            <button className="add-btn" onClick={async () => {
              try {
                await api.post('add-game/', { title: game.title, status: 'wishlist' });
                setAdded(true);
              } catch (err) {
                alert('Erro ao adicionar jogo.');
              }
            }}>+ Adicionar ao perfil</button>
          ))}
      </section>
    </div>
  );
}
