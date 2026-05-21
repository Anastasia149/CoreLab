import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../index';
import { ThemeSettingsSection } from '../../common/ThemeSettingsSection';
import '../../common/SettingsPage.css';
import './StudentSettings.css';

const StudentSettings: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const logout = () => {
    store.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="settings-page">
      <h2 className="settings-page-title">Настройки</h2>

      <div className="settings-card">
        <ThemeSettingsSection />
      </div>

      <div className="settings-card">
        <h4 className="settings-block-title">Аккаунт</h4>
        <p className="settings-block-desc">Выход из текущего профиля на этом устройстве.</p>
        <button type="button" className="settings-logout-btn" onClick={logout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default StudentSettings;
