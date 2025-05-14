import { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard/GameCard';
import { Link } from 'react-router-dom';
import './styles/Discover.css';

const PAGE_SIZE = 20;
const GENRES = ['Action', 'RPG', 'Adventure', 'Indie', 'Shooter'];
const ORDER_OPTS = [
  { label: 'Populares', value: '-rating' },
  { label: 'Lançamentos', value: '-released' },
  { label: 'Melhor Avaliados', value: '-metacritic' },
  { label: 'A‑Z', value: 'name' },
];

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="discover-pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        ⬅ Anterior
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Próxima ➡
      </button>
    </div>
  );
}

export default function Discover() {
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [order, setOrder] = useState('-rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isLoggedIn = !!localStorage.getItem('access');

  const fetchGames = async (p = 1, term = search, g = genre, o = order) => {
    const qs = new URLSearchParams({ page: p, page_size: PAGE_SIZE, ordering: o });
    if (term) qs.append('search', term);
    if (g) qs.append('genre', g);
    try {
      const res = await api.get(`discover-games/?${qs.toString()}`);
      setGames(res.data.results);
      setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
      setPage(p);
    } catch (err) {
      alert('Erro ao buscar jogos');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGames();
    (async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('usergames/');
        setUserGames(res.data.map((ug) => ug.game.title));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isLoggedIn]);

  const resetAndFetch = () => fetchGames(1);

  const clearFilters = () => {
    setSearch('');
    setGenre('');
    setOrder('-rating');
    fetchGames(1, '', '', '-rating');
  };

  return (
    <div className="discover-wrapper">
      <Navbar />
      <div className="discover-content">
        {/* Sidebar */}
        <aside className="discover-sidebar">
          <h2>Filtros</h2>
          <form onSubmit={(e) => { e.preventDefault(); resetAndFetch(); }} className="discover-search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jogo…"
            />
            <button className="btn-primary" type="submit">Buscar</button>
            {(search || genre || order !== '-rating') && (
              <button type="button" className="btn-secondary" onClick={clearFilters}>Limpar</button>
            )}
          </form>

          <h3>Ordenar por</h3>
          {ORDER_OPTS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-btn order${order === opt.value ? ' active' : ''}`}
              onClick={() => { setOrder(opt.value); resetAndFetch(); }}
            >
              {opt.label}
            </button>
          ))}

          <h3 style={{ marginTop: '1rem' }}>Gênero</h3>
          {GENRES.map((g) => (
            <button
              key={g}
              className={`filter-btn genre${genre === g ? ' active' : ''}`}
              onClick={() => { setGenre(genre === g ? '' : g); resetAndFetch(); }}
            >
              {g}
            </button>
          ))}
        </aside>

        {/* Grid & pagination */}
        <section className="discover-section">
          <div className="discover-grid">
            {games.map((game) => (
              <Link key={game.rawg_id} to={`/game/${game.rawg_id}`} style={{ textDecoration: 'none' }}>
                <GameCard
                  game={game}
                  added={userGames.includes(game.title)}
                  onAddClick={(title) => {
                    /* impede click duplo */
                    if (!isLoggedIn || userGames.includes(title)) return;
                    api.post('add-game/', { title, status: 'wishlist' }).then(() => {
                      setUserGames((prev) => [...prev, title]);
                    });
                  }}
                />
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={(p) => fetchGames(p)} />
        </section>
      </div>
    </div>
  );
}
