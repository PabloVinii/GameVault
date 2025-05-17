import { FaArrowLeft } from 'react-icons/fa';

/**
 * Props:
 * - game: objeto com title, background_image, cover_url, released, metacritic, rating
 * - platformIcons: array de ícones React (gerado no GameDetail)
 * - onBack: função para navegar para a página anterior
 */
export default function HeroHeader({ game, platformIcons, onBack }) {
  if (!game) return null;
  const {
    title,
    background_image,
    cover_url,
    released,
    metacritic,
    rating,
  } = game;

  return (
    <header
      className="game-hero"
      style={{ backgroundImage: `url(${background_image || cover_url})` }}
    >
      <div className="hero-overlay">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Voltar
        </button>

        <div className="hero-content">
          <h1>{title}</h1>

          <div className="game-meta">
            {released && <span className="badge">{released}</span>}
            {metacritic && (
              <span className="badge metacritic">Meta {metacritic}</span>
            )}
            {rating && <span className="badge">⭐ {rating}</span>}
          </div>

          <div className="platform-icons">{platformIcons}</div>
        </div>
      </div>
    </header>
  );
}
