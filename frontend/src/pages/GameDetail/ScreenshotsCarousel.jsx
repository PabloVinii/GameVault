// ScreenshotsCarousel.jsx – carrossel de screenshots com react-slick
// --------------------------------------------------------------------
import Slider from 'react-slick';

/**
 * Props:
 * - screenshots: array de { id, image }
 */
export default function ScreenshotsCarousel({ screenshots }) {
  if (!screenshots?.length) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <section className="screenshots-section">
      <h3>Screenshots</h3>
      <Slider {...settings}>
        {screenshots.map((sc) => (
          <div key={sc.id} className="screenshot-slide">
            <img src={sc.image} alt={`Screenshot`} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
