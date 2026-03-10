import React from 'react';
import { Icon } from '@iconify/react';

const HomeFooter: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="home-footer">
      <div className="home-footer-top">
        <div className="home-footer-brand">
          <Icon icon="icomoon-free:book" className="home-footer-logo" />
          <div className="home-footer-name">Courses</div>
        </div>
        <div className="home-footer-columns">
          <div className="home-footer-col">
            <div className="home-footer-title">Направления</div>
            <button className="home-footer-link">Frontend</button>
            <button className="home-footer-link">Python</button>
            <button className="home-footer-link">iOS</button>
            <button className="home-footer-link">UX/UI</button>
          </div>
          <div className="home-footer-col">
            <div className="home-footer-title">Компания</div>
            <button className="home-footer-link">О нас</button>
            <button className="home-footer-link">Блог</button>
            <button className="home-footer-link">Контакты</button>
          </div>
          <div className="home-footer-col">
            <div className="home-footer-title">Поддержка</div>
            <button className="home-footer-link">FAQ</button>
            <button className="home-footer-link">Помощь</button>
            <button className="home-footer-link">Политика конфиденциальности</button>
          </div>
        </div>
      </div>
      <div className="home-footer-bottom">
        <div className="home-footer-copy">© {year} Courses</div>
        <div className="home-footer-socials">
          <button className="home-footer-social" aria-label="Telegram">
            <Icon icon="simple-icons:telegram" />
          </button>
          <button className="home-footer-social" aria-label="YouTube">
            <Icon icon="logos:youtube-icon" />
          </button>
          <button className="home-footer-social" aria-label="GitHub">
            <Icon icon="simple-icons:github" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
