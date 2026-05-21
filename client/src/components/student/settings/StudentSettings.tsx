import React from 'react';
import { ThemeSettingsSection } from '../../common/ThemeSettingsSection';
import '../../common/SettingsPage.css';
import './StudentSettings.css';

const StudentSettings: React.FC = () => (
  <div className="settings-page">
    <h2 className="settings-page-title">Настройки</h2>

    <div className="settings-card">
      <ThemeSettingsSection />
    </div>
  </div>
);

export default StudentSettings;
