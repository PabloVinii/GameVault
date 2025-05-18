import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaMobileAlt,
  FaApple,
} from 'react-icons/fa';
import { SiNintendo, SiLinux } from 'react-icons/si';
import './styles/GameCard.css';

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

export default function GameCard({
  game,
  added = false,
  onAddClick,
  showReview = false,
  userGameData = {},
  onEdit,
  variant = "default", // "default" (Home) ou "dashboard"
}) {
  const isDashboard = variant === "dashboard";

  const renderPlatformIcons = () => {
    if (!game.platform) return null;
    const raw = Array.isArray(game.platform)
      ? game.platform
      : game.platform.split(',');
    return raw.map((p) => {
      const key = p.trim().toLowerCase();
      const matched = Object.keys(platformIconMap).find((slug) =>
        key.includes(slug)
      );
      return matched ? (
        <span key={matched} style={{ marginRight: '4px' }}>
          {platformIconMap[matched]}
        </span>
      ) : null;
    });
  };

  const statusLabel = {
    played: 'Jogado',
    playing: 'Jogando',
    wishlist: 'Wishlist',
  }[userGameData?.status];

  return (
    <div className={`game-card ${isDashboard ? 'dashboard' : ''}`}>
      <div className="game-card-cover">
        <img
          src={game.cover_url || game.background_image}
          alt={game.title}
          className="game-card-image"
        />

        {isDashboard && userGameData?.status && (
          <span className={`status-tag ${userGameData.status}`}>
            {statusLabel}
          </span>
        )}

        {isDashboard && userGameData?.rating !== null && (
          <span className="rating-badge">{userGameData.rating}</span>
        )}
      </div>

      <div className="game-card-body">
        <div style={{ fontSize: '0.9rem', marginBottom: '4px', color: '#ccc' }}>
          {renderPlatformIcons()}
        </div>
        <h4 className="game-card-title">{game.title}</h4>
        <small>{game.genre}</small>
        {!isDashboard && <p className="game-card-rating">⭐ {game.rating}</p>}

        {isDashboard && userGameData?.review && (
          <p className="review-snippet">“{userGameData.review}”</p>
        )}

        {isDashboard ? (
          <button
            className="edit-review-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            title="Editar"
            aria-label="Editar"
          >
            E
          </button>
        ) : added ? (
          <span className="game-card-added">✓ Já adicionado</span>
        ) : (
          onAddClick && (
            <div className="game-card-button-wrapper">
              <button
                type="button"
                className="game-card-button"
                onClick={() => onAddClick(game.title)}
              >
                +
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
