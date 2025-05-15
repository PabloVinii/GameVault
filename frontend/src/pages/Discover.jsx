import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowDown, FaArrowUp, FaBars } from 'react-icons/fa';
import api from '../api/api';
import Navbar from '../components/Navbar';
import GameCard from '../components/GameCard';
import Spinner from '../components/Spinner';
import useDebounce from '../hooks/useDebounce';
import './styles/Discover.css';

const PAGE_SIZE = 20;
const GENRES = ['Action', 'RPG', 'Adventure', 'Indie', 'Shooter'];
const ORDER_OPTS = [
  { label: 'Lançamentos', field: 'released' },
  { label: 'Nota RAWG',   field: 'rating'   },
  { label: 'A-Z',         field: 'name'     },
];

export default function Discover() {
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState(new Set());
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [order, setOrder] = useState({ field: '', desc: true });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('access'));

  // Evita chamadas excessivas enquanto o usuário digita
  const debouncedSearch = useDebounce(search, 500);

  const fetchGames = useCallback(async (p = 1) => {
    const qs = new URLSearchParams({
      page: p,
      page_size: PAGE_SIZE,
    });

    if (debouncedSearch) qs.append('search', debouncedSearch);
    if (genre) qs.append('genre', genre);
    if (order.field) qs.append('ordering', order.desc ? `-${order.field}` : order.field);

    setLoading(true);
    try {
      const { data } = await api.get(`discover-games/?${qs.toString()}`);
      setGames(data.results);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, order]);

  useEffect(() => {
    fetchGames(1);
  }, [fetchGames]);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      try {
        const { data } = await api.get('usergames/');
        setUserGames(new Set(data.map(ug => ug.game.rawg_id)));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [isLoggedIn]);

  const toggleOrder = (field) => {
    setOrder(prev => {
      if (prev.field !== field) return { field, desc: true };
      if (prev.desc)           return { field, desc: false };
      return { field: '', desc: true };
    });
  };

  const clearFilters = () => {
    setSearch('');
    setGenre('');
    setOrder({ field: '', desc: true });
    fetchGames(1);
  };

  const handleAddGame = async (game) => {
    if (!isLoggedIn || userGames.has(game.rawg_id)) return;
    try {
      await api.post('add-game/', { title: game.title, status: 'wishlist' });
      setUserGames(new Set([...userGames, game.rawg_id]));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="discover-wrapper">
        {/* Botão hambúrguer (fica acima da navbar com z-index alto) */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          <FaBars />
        </button>

        <div className="discover-content">
          <aside className={`discover-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <h2>Filtros</h2>
            {/* <- Adicionamos a classe discover-search para aplicar o CSS existente */}
            <form className="discover-search" onSubmit={e => e.preventDefault()}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar jogo…"
              />

              <button type="button" className="btn-primary" onClick={() => fetchGames(1)}>Buscar</button>

              {(debouncedSearch || genre || order.field) && (
                <button type="button" className="btn-secondary" onClick={clearFilters}>
                  Limpar
                </button>
              )}
            </form>

            <h3>Ordenar por</h3>
            {ORDER_OPTS.map(({ label, field }) => {
              const active = order.field === field;
              const icon = active ? (order.desc ? <FaArrowDown /> : <FaArrowUp />) : null;
              return (
                <button
                  key={field}
                  className={`filter-btn${active ? ' active' : ''}`}
                  onClick={() => { toggleOrder(field); fetchGames(1); }}
                >
                  {label} {icon}
                </button>
              );
            })}

            <h3 style={{ marginTop: '1rem' }}>Gênero</h3>
            {GENRES.map(g => (
              <button
                key={g}
                className={`filter-btn${genre === g ? ' active' : ''}`}
                onClick={() => { setGenre(genre === g ? '' : g); fetchGames(1); }}
              >
                {g}
              </button>
            ))}
          </aside>

          <section className="discover-section">
            {loading ? (
              <Spinner label="Carregando jogos…" />
            ) : (
              <>
                <div className="discover-grid">
                  {games.map(game => (
                    <Link key={game.rawg_id} to={`/game/${game.rawg_id}`} style={{ textDecoration: 'none' }}>
                      <GameCard
                        game={game}
                        added={userGames.has(game.rawg_id)}
                        onAddClick={() => handleAddGame(game)}
                      />
                    </Link>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={p => fetchGames(p)} />
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

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
