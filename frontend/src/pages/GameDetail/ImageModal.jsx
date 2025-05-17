// ImageModal.jsx – modal com zoom, navegação, ESC e preloading
// ----------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Props:
 * - images: array de { id, image }
 * - current: string (URL da imagem atual)
 * - onClose: função para fechar
 */
export default function ImageModal({ images, current, onClose }) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (current && images?.length) {
      const i = images.findIndex((img) => img.image === current);
      setIndex(i >= 0 ? i : 0);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [current, images]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // PRELOAD anterior e próxima imagem
  useEffect(() => {
    if (!images?.length) return;
    const preload = (imgUrl) => {
      const i = new Image();
      i.src = imgUrl;
    };
    const prevIndex = index === 0 ? images.length - 1 : index - 1;
    const nextIndex = index === images.length - 1 ? 0 : index + 1;
    preload(images[prevIndex].image);
    preload(images[nextIndex].image);
  }, [index, images]);

  if (!images?.length || !current) return null;

  const show = images[index];
  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="image-modal" onClick={onClose}>
      <div
        className={`image-modal-content ${visible ? 'animate-in' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal" onClick={onClose}><FaTimes /></button>

        <button className="nav-arrow left" onClick={prev}><FaChevronLeft /></button>
        <button className="nav-arrow right" onClick={next}><FaChevronRight /></button>

        <img src={show.image} alt="Screenshot" />
      </div>
    </div>
  );
}
