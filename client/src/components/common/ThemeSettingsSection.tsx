import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { Context } from '../../index';
import './SettingsPage.css';

export const ThemeSettingsSection: React.FC = observer(() => {
  const { store } = useContext(Context);

  return (
    <div className="settings-theme-block">
      <h4 className="settings-block-title">Тема оформления</h4>
      <p className="settings-block-desc">
        Переключение между светлой и тёмной темой интерфейса.
      </p>
      <div className="theme-switch" role="group" aria-label="Тема оформления">
        <button
          type="button"
          className={`theme-switch-btn${store.theme === 'light' ? ' active' : ''}`}
          onClick={() => store.setTheme('light')}
        >
          <Icon icon="mdi:white-balance-sunny" />
          Светлая
        </button>
        <button
          type="button"
          className={`theme-switch-btn${store.theme === 'dark' ? ' active' : ''}`}
          onClick={() => store.setTheme('dark')}
        >
          <Icon icon="mdi:moon-waning-crescent" />
          Тёмная
        </button>
      </div>
    </div>
  );
});
