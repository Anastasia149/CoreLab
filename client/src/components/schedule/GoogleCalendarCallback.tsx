import React, { useEffect, useState } from 'react';
import { connectGoogleCalendar } from '../../services/googleCalendarService';

const GoogleCalendarCallback: React.FC = () => {
  const [message, setMessage] = useState('Подключаем Google Календарь…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setMessage('Не удалось подключить Google Календарь.');
      if (window.opener) {
        window.opener.postMessage({ type: 'google-calendar-error' }, window.location.origin);
      }
      return;
    }

    if (!code) {
      setMessage('Код авторизации не получен.');
      return;
    }

    connectGoogleCalendar(code)
      .then((result) => {
        setMessage(`Готово. Синхронизировано событий: ${result.synced}.`);
        if (window.opener) {
          window.opener.postMessage(
            { type: 'google-calendar-connected', synced: result.synced },
            window.location.origin
          );
          window.close();
        }
      })
      .catch(() => {
        setMessage('Ошибка при подключении Google Календаря.');
        if (window.opener) {
          window.opener.postMessage({ type: 'google-calendar-error' }, window.location.origin);
        }
      });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <p>{message}</p>
      <p style={{ color: '#64748b', fontSize: 14 }}>Это окно можно закрыть.</p>
    </div>
  );
};

export default GoogleCalendarCallback;
