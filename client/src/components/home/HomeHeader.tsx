import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const onLogin = React.useCallback(() => navigate('/login'), [navigate]);
  const onRegister = React.useCallback(() => navigate('/register'), [navigate]);

  return (
    <header className="home-header">
      <div className="home-header-left" onClick={() => navigate('/')}>
        <Icon icon="icomoon-free:book" className="home-logo-icon" />
        <div className="home-logo-text">Courses</div>
      </div>
      <nav className="home-nav">
        <button className="home-nav-link">Каталог курсов</button>
        <button className="home-nav-link">Преподаватели</button>
        <button className="home-nav-link">Журнал</button>
        <button className="home-nav-link">Школа</button>
      </nav>
      <div className="home-header-right">
        <button className="home-link" onClick={onLogin}>
          Войти
        </button>
        <button className="home-cta" onClick={onRegister}>
          Зарегистрироваться
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;
