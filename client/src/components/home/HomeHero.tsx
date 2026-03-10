import React from 'react';

type Props = {
  onStart: () => void;
  onCatalog: () => void;
};

const HomeHero: React.FC<Props> = ({ onStart, onCatalog }) => {
  return (
    <section className="home-hero">
      <div className="home-hero-left">
        <div className="home-badges">
          <span className="home-badge">Небольшие группы</span>
          <span className="home-badge">80% практики</span>
          <span className="home-badge">Карьерный менеджер</span>
        </div>
        <h1 className="home-title">
          Запусти свою карьеру в IT — обучение с нуля до первой работы!
        </h1>
        <p className="home-subtitle">
          Научим востребованной профессии и поможем с трудоустройством.
        </p>
        <div className="home-actions">
          <button className="home-cta" onClick={onStart}>
            Начать обучение
          </button>
          <button className="home-secondary" onClick={onCatalog}>
            Каталог курсов
          </button>
        </div>
      </div>
      <div className="home-hero-right">
        <div className="home-hero-card home-hero-card-main" />
        <div className="home-hero-card home-hero-card-top" />
        <div className="home-hero-card home-hero-card-bottom" />
      </div>
    </section>
  );
};

export default HomeHero;
