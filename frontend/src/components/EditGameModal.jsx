import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../api/api';
import './styles/EditGameModal.css';

/**
 * Props:
 *  - userGame: { id, status, rating, review }
 *  - onClose: () => void
 *  - onUpdated: (updatedUserGame) => void
 */
export default function EditGameModal({ userGame, onClose, onUpdated }) {
  const [status, setStatus] = useState(userGame.status);
  const [rating, setRating] = useState(userGame.rating ?? 0);
  const [review, setReview] = useState(userGame.review ?? '');
  const [submitting, setSubmitting] = useState(false);

  const STATUS_OPTIONS = [
    { value: 'played', label: 'Jogado' },
    { value: 'playing', label: 'Jogando' },
    { value: 'wishlist', label: 'Wishlist' },
  ];

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('egm-backdrop')) onClose();
  };

  const handleStarClick = (index) => {
    // Permite desmarcar clicando na mesma estrela
    setRating(index === rating ? 0 : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/usergames/${userGame.id}/`, {
        status,
        rating: rating || null, // envia null se 0 (sem nota)
        review,
      });
      onUpdated?.(data);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar jogo', err);
      alert('Não foi possível salvar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="egm-backdrop" onClick={handleBackdropClick}>
      <div className="egm-modal" role="dialog" aria-modal="true">
        <button className="egm-close" onClick={onClose} aria-label="Fechar modal">
          <FiX size={20} />
        </button>
        <h2>Editar jogo</h2>
        <form onSubmit={handleSubmit}>
          {/* Status */}
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

          {/* Rating */}
          <label className="egm-block-label">Sua nota</label>
          <div className="egm-stars">
            {Array.from({ length: 10 }).map((_, i) => {
              const idx = i + 1;
              return (
                <FaStar
                  key={idx}
                  size={22}
                  className={idx <= rating ? 'filled' : ''}
                  onClick={() => handleStarClick(idx)}
                />
              );
            })}
          </div>

          {/* Review text */}
          <label htmlFor="egm-review" className="egm-block-label">
            Comentário (opcional)
          </label>
          <textarea
            id="egm-review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Ex: Incrível ambientação e história envolvente…"
            rows={4}
          />

          <button type="submit" disabled={submitting} className="egm-save-btn">
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
