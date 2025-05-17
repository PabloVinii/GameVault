// TrailerSection.jsx – componente de player de trailer oficial
import ReactPlayer from 'react-player';

/**
 * Props:
 * - videoUrl: string (url do trailer oficial)
 */
export default function TrailerSection({ videoUrl }) {
  if (!videoUrl) return null;

  return (
    <section className="trailer-section">
      <h3>🎬 Trailer Oficial</h3>
      <div className="trailer-wrapper">
        <ReactPlayer url={videoUrl} controls width="100%" height="100%" />
      </div>
    </section>
  );
}
