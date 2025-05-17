// SuggestedGrid.jsx – grade de jogos sugeridos com nota e imagem
import { Link } from 'react-router-dom';

/**
 * Props:
 * - suggested: array de jogos com rawg_id, title, cover_url, rating
 */
export default function SuggestedGrid({ suggested }) {
  if (!suggested?.length) return null;

  return (
    <section className="suggested-section">
      <h3>Você pode gostar de…</h3>
      <div className="suggested-grid">
        {suggested.map((g) => (
          <Link key={g.rawg_id} to={`/game/${g.rawg_id}`} className="suggested-card">
            <img src={g.cover_url} alt={g.title} />
            <p>{g.title}</p>
            <span>⭐ {g.rating}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
