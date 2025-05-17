// AchievementsSection.jsx – preview de conquistas + botão

/**
 * Props:
 * - achievements: array com { id, name, description, image }
 * - onOpenModal: função chamada ao clicar no botão “ver todas”
 */
export default function AchievementsSection({ achievements, onOpenModal }) {
  if (!achievements?.length) return null;

  return (
    <section className="achievements-section">
      <h3>🏆 Conquistas Steam</h3>
      <div className="achievements-grid">
        {achievements.slice(0, 6).map((a) => (
          <div key={a.id} className="achievement-card">
            <img src={a.image} alt={a.name} />
            <div>
              <strong>{a.name}</strong>
              <p>{a.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="view-all-btn" onClick={onOpenModal}>
        Ver todas as conquistas
      </button>
    </section>
  );
}
