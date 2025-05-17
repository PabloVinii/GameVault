// GameDetail.jsx – coordenador das seções detalhadas do jogo
// -----------------------------------------------------------
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Seções modularizadas
import HeroHeader from './GameDetail/HeroHeader';
import RatingBreakdown from './GameDetail/RatingBreakdown';
import StoreButtons from './GameDetail/StoreButtons';
import TrailerSection from './GameDetail/TrailerSection';
import ScreenshotsCarousel from './GameDetail/ScreenshotsCarousel';
import AchievementsSection from './GameDetail/AchievementsSection';
import AchievementsModal from './GameDetail/AchievementsModal';
import SuggestedGrid from './GameDetail/SuggestedGrid';

// UI genérica
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../api/api';
import './styles/GameDetail.css';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE --------------------------------------------------------------
  const [game, setGame] = useState(null);
  const [screens, setScreens] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [suggestedGames, setSuggestedGames] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [showAchModal, setShowAchModal] = useState(false);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(localStorage.getItem('access'));

  // --- DATA FETCH --------------------------------------------------------
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          gameRes,          // detalhes
          screenshotsRes,   // screenshots
          suggestedRes,     // recomendados
          achievementsRes,  // conquistas
          trailerRes        // trailer
        ] = await Promise.all([
          api.get(`game-info/${id}/`),
          api.get(`game-screenshots/${id}/`),
          api.get(`suggested-games/${id}/`),
          api.get(`game-achievements/${id}/`),
          api.get(`game-trailer/${id}/`),
        ]);

        setGame(gameRes.data);
        setScreens(screenshotsRes.data);
        setSuggestedGames(suggestedRes.data);
        setAchievements(achievementsRes.data);
        setTrailer(trailerRes.data);

        if (isLoggedIn) {
          const prof = await api.get('usergames/');
          const exists = prof.data.some((ug) => ug.game.rawg_id === Number(id));
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

  // --- HELPERS -----------------------------------------------------------
  const renderPlatforms = () => {
    if (!game?.platform) return null;
    const icons = game.platform.split(',').map((p) => p.trim());
    return icons.map((text) => <span key={text} className="platform-icon">{text}</span>);
  };

  // --- RENDER ------------------------------------------------------------
  if (loading) return <Spinner label="Carregando detalhes…" />;
  if (!game)   return <div className="game-detail-error">Jogo não encontrado.</div>;

  return (
    <div className="game-detail-page">
      <Navbar />

      {/* HERO */}
      <HeroHeader
        game={game}
        platformIcons={renderPlatforms()}
        onBack={() => navigate(-1)}
      />

      <main className="game-info">
        {/* SOBRE */}
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

        {/* TAGS */}
        {game.tags?.length > 0 && (
          <section className="tags-section">
            {game.tags.slice(0, 15).map((t) => (
              <span key={t.id} className="tag">{t.name}</span>
            ))}
          </section>
        )}

        {/* RATING, LOJAS, TRAILER, SCREENSHOTS */}
        <RatingBreakdown ratings={game.ratings} />
        <StoreButtons stores={game.stores} />
        <TrailerSection videoUrl={trailer?.video_url} />
        <ScreenshotsCarousel screenshots={screens} />

        {/* CONQUISTAS */}
        <AchievementsSection
          achievements={achievements}
          onOpenModal={() => setShowAchModal(true)}
        />
        <AchievementsModal
          isOpen={showAchModal}
          onClose={() => setShowAchModal(false)}
          achievements={achievements}
        />

        {/* SITE + PERFIL */}
        {game.website && (
          <a href={game.website} target="_blank" rel="noreferrer" className="external-btn">
            🌐 Site Oficial
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
                  await api.post('add-game/', { title: game.title, status: 'wishlist' });
                  setAdded(true);
                } catch {
                  alert('Erro ao adicionar jogo.');
                }
              }}
            >
              + Adicionar ao perfil
            </button>
          )
        )}

        {/* RECOMENDADOS */}
        <SuggestedGrid suggested={suggestedGames} />
      </main>
    </div>
  );
}
