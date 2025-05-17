// ScreenshotsCarousel.jsx – carrossel com modal fullscreen no clique
// --------------------------------------------------------------------
import { useState } from 'react';
import Slider from 'react-slick';
import ImageModal from './ImageModal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/ScreenshotsCarousel.css';

/**
 * Props:
 * - screenshots: array de { id, image }
 */
export default function ScreenshotsCarousel({ screenshots }) {
  const [selectedImage, setSelectedImage] = useState(null);
  if (!screenshots?.length) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <section className="screenshots-section">
      <h3>Screenshots</h3>
      <Slider {...settings} className="screenshots-slider">
        {screenshots.map((sc) => (
          <div key={sc.id} className="screenshot-slide">
            <img
              src={sc.image}
              alt="Screenshot"
              onClick={() => setSelectedImage(sc.image)}
              className="clickable-screenshot"
            />
          </div>
        ))}
      </Slider>

      <ImageModal
        images={screenshots}
        current={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}
