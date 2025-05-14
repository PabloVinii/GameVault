import './GameCard.css';

export default function GameCard({ game, added = false, onAddClick, showReview = false, userGameData = {} }) {
  return (
    <div className="game-card">
      <img
        src={game.cover_url}
        alt={game.title}
        className="game-card-image"
      />
      <div className="game-card-body">
        <h4 className="game-card-title">{game.title}</h4>
        <small>{game.genre} - {game.platform}</small>
        <p className="game-card-rating">⭐ {game.rating}</p>

        {added ? (
          <span className="game-card-added">✓ Já adicionado</span>
        ) : (
          onAddClick && (
            <button
              onClick={() => onAddClick(game.title)}
              className="game-card-button"
            >
              + Adicionar ao perfil
            </button>
          )
        )}

        {showReview && userGameData.status && (
          <div className="game-card-review">
            <p><strong>Status:</strong> {userGameData.status}</p>
            <p><strong>Nota:</strong> {userGameData.rating || '—'}</p>
            {userGameData.review && (
              <p className="game-card-review-text">
                “{userGameData.review}”
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
