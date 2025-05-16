// ... (imports e configs mantidos)
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaMobileAlt,
  FaApple,
  FaExternalLinkAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import {
  SiNintendo,
  SiLinux,
  SiSteam,
  SiEpicgames,
  SiGogdotcom,
} from 'react-icons/si';

import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../api/api';
import './styles/GameDetail.css';

const platformIconMap = {
  pc: <FaWindows title="PC" />, playstation: <FaPlaystation title="PlayStation" />, xbox: <FaXbox title="Xbox" />,
  nintendo: <SiNintendo title="Nintendo" />, android: <FaMobileAlt title="Android" />, ios: <FaApple title="iOS" />,
  mac: <FaApple title="Mac" />, linux: <SiLinux title="Linux" />,
};
const storeIconMap = {
  steam: <SiSteam />, epic: <SiEpicgames />, gog: <SiGogdotcom />,
};

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [suggestedGames, setSuggestedGames] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const isLoggedIn = Boolean(localStorage.getItem('access'));

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [gRes, sugRes, achRes] = await Promise.all([
          api.get(`game-info/${id}/`),
          api.get(`suggested-games/${id}/`),
          api.get(`game-achievements/${id}/`),
        ]);
        setGame(gRes.data);
        setSuggestedGames(sugRes.data);
        setAchievements(achRes.data);

        if (isLoggedIn) {
          const profRes = await api.get('usergames/');
          const exists = profRes.data.some((ug) => ug.game.rawg_id === parseInt(id));
          setAdded(exists);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do jogo', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    window.scrollTo(0, 0);
  }, [id, isLoggedIn]);

  const renderPlatforms = () => {
    if (!game?.platform) return null;
    const uniques = [...new Set(game.platform.split(',').map((p) => p.trim().toLowerCase()))];
    return uniques.map((key) => {
      const matched = Object.keys(platformIconMap).find((slug) => key.includes(slug));
      return matched ? (
        <span key={matched} className="platform-icon">{platformIconMap[matched]}</span>
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
              {name} <FaExternalLinkAlt style={{ marginLeft: 4, fontSize: '.75rem' }} />
            </a>
          );
        })}
      </div>
    );
  };

  const renderScreenshots = () => {
    if (!game?.screenshots?.length) return null;
    return (
      <section className="screenshots-section">
        <h3>Screenshots</h3>
        <div className="screenshots-grid">
          {game.screenshots.map((sc) => (
            <img key={sc.id} src={sc.image} alt={`${game.title} screenshot`} />
          ))}
        </div>
      </section>
    );
  };

  const renderAchievements = () => {
    if (!achievements.length) return null;
    return (
      <section className="achievements-section">
        <h3>🏆 Conquistas Steam</h3>
        <div className="achievements-grid">
          {achievements.slice(0, 6).map((a) => (
            <div key={a.id} className="achievement-card">
              <img src={a.image} alt={a.name} />
              <div>
                <strong>{a.name}</strong>
                <p>{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSuggested = () => {
    if (!suggestedGames.length) return null;
    return (
      <section className="suggested-section">
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
      </section>
    );
  };

  if (loading) return <Spinner label="Carregando detalhes…" />;
  if (!game) return <div className="game-detail-error">Jogo não encontrado.</div>;

  return (
    <div className="game-detail-page">
      <Navbar />
      <header
        className="game-hero"
        style={{ backgroundImage: `url(${game.background_image || game.cover_url})` }}
      >
        <div className="hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Voltar
          </button>
          <div className="hero-content">
            <h1>{game.title}</h1>
            <div className="game-meta">
              {game.released && <span className="badge">{game.released}</span>}
              {game.metacritic && <span className="badge metacritic">Meta {game.metacritic}</span>}
              <span className="badge">⭐ {game.rating}</span>
            </div>
            <div className="platform-icons">{renderPlatforms()}</div>
          </div>
        </div>
      </header>

      <main className="game-info">
        {game.description && (
          <section className="description-section">
            <h3>Sobre</h3>
            <p dangerouslySetInnerHTML={{ __html: game.description }} />

            <div className="credits-section">
              {game.developers?.length > 0 && (
                <p><strong>Desenvolvedora:</strong> {game.developers.map((d) => d.name).join(', ')}</p>
              )}
              {game.publishers?.length > 0 && (
                <p><strong>Publicadora:</strong> {game.publishers.map((p) => p.name).join(', ')}</p>
              )}
            </div>
          </section>
        )}

        {game.tags?.length > 0 && (
          <section className="tags-section">
            {game.tags.slice(0, 15).map((t) => (
              <span key={t.id} className="tag">{t.name}</span>
            ))}
          </section>
        )}

        {renderRatingBars()}
        {renderStores()}
        {renderScreenshots()}
        {renderAchievements()}

        {game.website && (
          <a href={game.website} target="_blank" rel="noreferrer" className="external-btn">
            🌐 Site Oficial <FaExternalLinkAlt style={{ marginLeft: 4 }} />
          </a>
        )}

        {isLoggedIn && (
          added ? (
            <div className="already-added">✓ Já adicionado ao seu perfil</div>
          ) : (
            <button
              className="add-btn"
              onClick={async () => {
                try {
                  await api.post('add-game/', {
                    title: game.title,
                    status: 'wishlist',
                  });
                  setAdded(true);
                } catch (err) {
                  alert('Erro ao adicionar jogo.');
                }
              }}
            >
              + Adicionar ao perfil
            </button>
          )
        )}

        {renderSuggested()}
      </main>
    </div>
  );
}