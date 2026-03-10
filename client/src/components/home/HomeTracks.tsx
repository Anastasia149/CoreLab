import React from 'react';
import { Icon } from '@iconify/react';
import { useTracks } from '../../hooks/useTracks';

const HomeTracks: React.FC = () => {
  const tracks = useTracks();

  return (
    <section className="home-tracks">
      <h2 className="home-section-title">Самые востребованные направления в IT</h2>
      <div className="home-track-grid">
        {tracks.map(t => (
          <div className="home-track" key={t.title}>
            <div className="home-track-icon">
              <Icon icon={t.icon} />
            </div>
            <div className="home-track-title">{t.title}</div>
            <button className="home-track-btn">Подробнее о курсе</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeTracks;
