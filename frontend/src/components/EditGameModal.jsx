import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../api/api';
import './styles/EditGameModal.css';

/**
 * Props:
 *  - userGame: { id, status, rating }
 *  - onClose: () => void
 *  - onUpdated: (updatedUserGame) => void
 */
export default function EditGameModal({ userGame, onClose, onUpdated }) {
  const [status, setStatus] = useState(userGame.status);
  const [rating, setRating] = useState(userGame.rating || 0);
  const [submitting, setSubmitting] = useState(false);

  const STATUS_OPTIONS = [
    { value: 'played', label: 'Jogado' },
    { value: 'playing', label: 'Jogando' },
    { value: 'wishlist', label: 'Wishlist' },
  ];

  const handleStarClick = (index) => {
    setRating(index === rating ? 0 : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/usergames/${userGame.id}/`, {
        status,
        rating: rating || null,
      });
      onUpdated(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar jogo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="egm-backdrop" onClick={onClose}>
      <div className="egm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="egm-close" onClick={onClose}>
          <FiX size={20} />
        </button>
        <h2>Editar jogo</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="status-select">Status</label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label>Nota</label>
          <div className="egm-stars">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => (
              <FaStar
                key={idx}
                className={idx <= rating ? 'filled' : ''}
                onClick={() => handleStarClick(idx)}
              />
            ))}
          </div>

          <button type="submit" disabled={submitting} className="egm-save-btn">
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
