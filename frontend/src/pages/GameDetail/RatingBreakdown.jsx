/**
 * Props:
 * - ratings: array de objetos com id, title, percent
 */
export default function RatingBreakdown({ ratings }) {
  if (!ratings?.length) return null;

  return (
    <div className="rating-breakdown">
      {ratings.map((r) => (
        <div key={r.id} className="rating-row">
          <span className="r-title">{r.title}</span>
          <div className="r-bar">
            <div style={{ width: `${r.percent}%` }} />
          </div>
          <span className="r-percent">{r.percent.toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
