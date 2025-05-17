// AchievementsModal.jsx – lista expandida de conquistas em modal
import { FaTimes } from 'react-icons/fa';

/**
 * Props:
 * - isOpen: boolean para exibir ou esconder
 * - onClose: função para fechar
 * - achievements: array com { id, name, description, image }
 */
export default function AchievementsModal({ isOpen, onClose, achievements }) {
  if (!isOpen) return null;

  return (
    <div className="achievements-modal">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>🏆 Todas as Conquistas</h2>
        <div className="modal-achievements-grid">
          {achievements.map((a) => (
            <div key={a.id} className="achievement-card">
              <img src={a.image} alt={a.name} />
              <div>
                <strong>{a.name}</strong>
                <p>{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
