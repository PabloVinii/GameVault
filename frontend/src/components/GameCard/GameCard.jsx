import { FaWindows, FaPlaystation, FaXbox, FaMobileAlt, FaApple } from 'react-icons/fa';
import { SiNintendo, SiLinux } from 'react-icons/si';
import './GameCard.css';

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

export default function GameCard({ game, added = false, onAddClick, showReview = false, userGameData = {} }) {
  // helper to pick icons based on platform string(s)
  const renderPlatformIcons = () => {
    if (!game.platform) return null;
    // we may receive comma‑separated or single string
    const raw = Array.isArray(game.platform) ? game.platform : game.platform.split(',');
    return raw.map((p) => {
      const key = p.trim().toLowerCase();
      const matched = Object.keys(platformIconMap).find((slug) => key.includes(slug));
      return matched ? <span key={matched} style={{ marginRight: '4px' }}>{platformIconMap[matched]}</span> : null;
    });
  };

  return (
    <div className="game-card">
      <img src={game.cover_url} alt={game.title} className="game-card-image" />
      <div className="game-card-body">
        <div style={{ fontSize: '0.9rem', marginBottom: '4px', color: '#ccc' }}>
          {renderPlatformIcons()}
        </div>
        <h4 className="game-card-title">{game.title}</h4>
        <small>{game.genre}</small>
        <p className="game-card-rating">⭐ {game.rating}</p>

        {added ? (
          <span className="game-card-added">✓ Já adicionado</span>
        ) : (
          onAddClick && (
            <button onClick={() => onAddClick(game.title)} className="game-card-button">+ Adicionar ao perfil</button>
          )
        )}

        {showReview && userGameData.status && (
          <div className="game-card-review">
            <p><strong>Status:</strong> {userGameData.status}</p>
            <p><strong>Nota:</strong> {userGameData.rating || '—'}</p>
            {userGameData.review && (
              <p className="game-card-review-text">“{userGameData.review}”</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
