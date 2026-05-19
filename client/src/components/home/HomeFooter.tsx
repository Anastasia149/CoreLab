import React from 'react';
import { Icon } from '@iconify/react';
import './HomeFooter.css';

const HomeFooter: React.FC = () => {
  return (
    <footer className="home-footer">
      <div className="home-footer-top">
        <div className="home-footer-brand">
          <Icon icon="icomoon-free:book" className="home-footer-logo" />
          <div className="home-footer-name">CoreLab</div>
        </div>
        <div className="home-footer-columns">
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
    </footer>
  );
};

export default HomeFooter;
