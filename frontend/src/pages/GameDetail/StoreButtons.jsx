// StoreButtons.jsx – botões de lojas (Steam, Epic, GOG...)
import { FaExternalLinkAlt } from 'react-icons/fa';
import { SiSteam, SiEpicgames, SiGogdotcom } from 'react-icons/si';

const iconMap = {
  steam: <SiSteam />,
  epic: <SiEpicgames />,
  gog: <SiGogdotcom />,
};

/**
 * Props:
 * - stores: array com objetos no formato { store: { name, domain } }
 */
export default function StoreButtons({ stores }) {
  if (!stores?.length) return null;

  return (
    <div className="stores-wrapper">
      {stores.map(({ store }, idx) => {
        const name = store.name;
        const domain = store.domain ? `https://${store.domain}` : '#';
        const key = Object.keys(iconMap).find(k => name.toLowerCase().includes(k));

        return (
          <a key={idx} href={domain} target="_blank" rel="noreferrer" className="store-btn">
            {key && <span className="s-icon">{iconMap[key]}</span>}
            {name} <FaExternalLinkAlt style={{ marginLeft: 4, fontSize: '.75rem' }} />
          </a>
        );
      })}
    </div>
  );
}
