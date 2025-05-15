import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import './styles/Discover.css';

const PAGE_SIZE = 20;
const GENRES = ['Action', 'RPG', 'Adventure', 'Indie', 'Shooter'];
const ORDER_OPTS = [
  { label: 'Lançamentos', field: 'released' },
  { label: 'Nota RAWG',   field: 'rating'   },
  { label: 'A-Z',         field: 'name'     },
];

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="discover-pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>⬅ Anterior</button>
      <span>{page} / {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Próxima ➡</button>
    </div>
  );
}

export default function Discover() {
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [orderField, setOrderField] = useState('');
  const [orderDesc, setOrderDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem('access');

  const fetchGames = async (p = 1) => {
    const qs = new URLSearchParams({ page: p, page_size: PAGE_SIZE });
    if (search) qs.append('search', search);
    if (genre) qs.append('genre', genre);
    if (orderField) qs.append('ordering', orderDesc ? `-${orderField}` : orderField);

    setLoading(true);
    try {
      const res = await api.get(`discover-games/?${qs.toString()}`);
      setGames(res.data.results);
      setTotalPages(Math.ceil(res.data.count / PAGE_SIZE));
      setPage(p);
    } catch (err) {
      alert('Erro ao buscar jogos');
      console.error(err);
    } finally {
      setLoading(false);
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
    setOrderField('');
    setOrderDesc(true);
    fetchGames(1);
  };

  const toggleOrder = (field) => {
    if (orderField !== field) {
      setOrderField(field);
      setOrderDesc(true);
    } else if (orderDesc) {
      setOrderDesc(false);
    } else {
      setOrderField('');
      setOrderDesc(true);
    }
    fetchGames(1);
  };

  return (
    <div className="discover-wrapper">
      <Navbar />
      <div className="discover-content">
        <aside className="discover-sidebar">
          <h2>Filtros</h2>
          <form className="discover-search" onSubmit={(e) => { e.preventDefault(); resetAndFetch(); }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jogo…" />
            <button className="btn-primary" type="submit">Buscar</button>
            {(search || genre || orderField) && (
              <button type="button" className="btn-secondary" onClick={clearFilters}>Limpar</button>
            )}
          </form>

          <h3>Ordenar por</h3>
          {ORDER_OPTS.map(({ label, field }) => {
            const active = orderField === field;
            const icon = active ? (orderDesc ? <FaArrowDown /> : <FaArrowUp />) : null;
            return (
              <button
                key={field}
                className={`filter-btn order${active ? ' active' : ''}`}
                onClick={() => toggleOrder(field)}
              >
                {label} {icon}
              </button>
            );
          })}

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

        <section className="discover-section">
          {loading ? (
            <div className="discover-loading">
  <div className="spinner"></div>
  <p style={{ marginTop: '1rem', color: '#ccc' }}>Carregando jogos...</p>
</div>
          ) : (
            <>
              <div className="discover-grid">
                {games.map((game) => (
                  <Link key={game.rawg_id} to={`/game/${game.rawg_id}`} style={{ textDecoration: 'none' }}>
                    <GameCard
                      game={game}
                      added={userGames.includes(game.title)}
                      onAddClick={(title) => {
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}
