import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import HomeHeader from './home/HomeHeader';
import HomeHero from './home/HomeHero';
import HomeTracks from './home/HomeTracks';
import HomeFooter from './home/HomeFooter';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const onStart = React.useCallback(() => navigate('/register'), [navigate]);
  const onCatalog = React.useCallback(() => {}, []);

  return (
    <div className="home">
      <HomeHeader />

      <main className="home-main">
        <HomeHero onStart={onStart} onCatalog={onCatalog} />
        <HomeTracks />
      </main>
      <HomeFooter />
    </div>
  );
};

export default HomePage;
