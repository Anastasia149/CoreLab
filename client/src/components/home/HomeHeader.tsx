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
        <div className="home-logo-text">Knowlify</div>
      </div>
      <nav className="home-nav">
       
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
