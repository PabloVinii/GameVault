import { useState } from 'react';
import api from '../api/api';

export default function AddGameForm({ onGameAdded }) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('played');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('add-game/', {
        title,
        status,
        rating,
        review,
      });

      if (res.status === 201) {
        alert('Jogo adicionado com sucesso!');
        setTitle('');
        setStatus('played');
        setRating('');
        setReview('');
        onGameAdded(); // atualiza a lista da dashboard
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar jogo: ' + err.response?.data?.error || 'Erro desconhecido');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do jogo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="played">Jogado</option>
        <option value="playing">Jogando</option>
        <option value="wishlist">Wishlist</option>
      </select>
      <input
        type="number"
        placeholder="Nota (1 a 10)"
        min={1}
        max={10}
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <textarea
        placeholder="Comentário"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button type="submit">Adicionar Jogo</button>
    </form>
  );
}
