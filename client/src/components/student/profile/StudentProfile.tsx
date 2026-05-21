import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../../../index';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import '../../common/ProfilePage.css';
import { ProfileAccountSection } from '../../common/ProfileAccountSection';
import { getAvatarFileTypeError } from '../../../utils/avatarFile';

const StudentProfile: React.FC = observer(() => {
  const { store } = useContext(Context);
  const [name, setName] = useState(store.user?.name || '');
  const [email, setEmail] = useState(store.user?.email || '');
  const [avatar, setAvatar] = useState(store.user?.avatar || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (store.user) {
      setName(store.user.name || '');
      setEmail(store.user.email || '');
      setAvatar(store.user.avatar || '');
    }
  }, [store.user]);

  const handleSave = async () => {
    setMessage('');
    try {
      await store.updateUserProfile({
        name,
        email,
        avatar: avatar || null,
      });
      setMessage('Профиль успешно обновлен!');
    } catch (error: any) {
      setMessage(`Ошибка: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    const typeError = getAvatarFileTypeError(file);
    if (typeError) {
      setMessage(`Ошибка: ${typeError}`);
      input.value = '';
      return;
    }
    setMessage('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!store.user) {
    return (
      <div className="profile-page profile-page--loading" role="status">
        Загрузка…
      </div>
    );
  }

  const messageTone = message.startsWith('Ошибка') ? 'error' : 'success';

  return (
    <div className="profile-page">
      <div className="profile-card">
        {message && (
          <div
            className={`profile-message profile-message--${messageTone}`}
            role="status"
          >
            {message}
          </div>
        )}

        <div className="profile-card-layout">
          <aside className="profile-card-aside" aria-label="Фото профиля">
            <div className="profile-avatar-upload-area">
              <div className="profile-avatar-preview-wrap">
                {avatar ? (
                  <img src={avatar} alt="" className="profile-avatar-preview" />
                ) : (
                  <Icon
                    icon="solar:user-bold"
                    className="profile-avatar-placeholder-icon"
                    aria-hidden
                  />
                )}
              </div>
              <input
                id="profile-avatar-input"
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={handleAvatarChange}
                className="profile-file-input"
                aria-label="Выбрать изображение профиля"
              />
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="profile-upload-button"
                  onClick={() => document.getElementById('profile-avatar-input')?.click()}
                >
                  Выбрать фото
                </button>
                <p className="profile-avatar-hint">Только JPG или PNG</p>
              </div>
            </div>
          </aside>

          <div className="profile-card-main">
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-name">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:account-outline" />
                  </span>
                  Имя
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="profile-input"
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="profile-email">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:email-outline" />
                  </span>
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="profile-save-button" onClick={handleSave}>
          Сохранить изменения
        </button>

        <ProfileAccountSection />
      </div>
    </div>
  );
});

export default StudentProfile;
