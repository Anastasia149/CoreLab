import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../../../index';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import '../../common/ProfilePage.css';
import { ProfileAccountSection } from '../../common/ProfileAccountSection';
import { getAvatarFileError, getAvatarMaxSizeLabel } from '../../../utils/avatarFile';
import {
  isEmailValid,
  isNameLengthValid,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '../../../constants/auth';

const TeacherProfile: React.FC = observer(() => {
  const { store } = useContext(Context);
  const [name, setName] = useState(store.user?.name || '');
  const [email, setEmail] = useState(store.user?.email || '');
  const [avatar, setAvatar] = useState(store.user?.avatar || '');
  const [aboutMe, setAboutMe] = useState(store.user?.aboutMe || '');
  const [certificates, setCertificates] = useState(store.user?.certificates || '');
  const [career, setCareer] = useState(store.user?.career || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (store.user) {
      setName(store.user.name || '');
      setEmail(store.user.email || '');
      setAvatar(store.user.avatar || '');
      setAboutMe(store.user.aboutMe || '');
      setCertificates(store.user.certificates || '');
      setCareer(store.user.career || '');
    }
  }, [store.user]);

  const handleSave = async () => {
    setMessage('');
    if (!isNameLengthValid(name)) {
      setMessage(`Имя должно быть от 1 до ${NAME_MAX_LENGTH} символов`);
      return;
    }
    if (!isEmailValid(email)) {
      setMessage('Введите корректный email');
      return;
    }
    try {
      await store.updateUserProfile({
        name,
        email,
        avatar: avatar || null,
        aboutMe,
        certificates,
        career,
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
    const fileError = getAvatarFileError(file);
    if (fileError) {
      setMessage(`Ошибка: ${fileError}`);
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
                id="teacher-profile-avatar-input"
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
                  onClick={() =>
                    document.getElementById('teacher-profile-avatar-input')?.click()
                  }
                >
                  Выбрать фото
                </button>
                <p className="profile-avatar-hint">
                  JPG или PNG, не более {getAvatarMaxSizeLabel()}
                </p>
              </div>
            </div>
          </aside>

          <div className="profile-card-main">
            <div className="profile-fields">
              <div className="profile-field">
                <label className="profile-label" htmlFor="teacher-profile-name">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:account-outline" />
                  </span>
                  Имя
                </label>
                <input
                  id="teacher-profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="profile-input"
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                  maxLength={NAME_MAX_LENGTH}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="teacher-profile-email">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:email-outline" />
                  </span>
                  Email
                </label>
                <input
                  id="teacher-profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={EMAIL_MAX_LENGTH}
                />
              </div>

              <div className="profile-field profile-field--textarea">
                <label className="profile-label" htmlFor="teacher-profile-about">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:text-box-outline" />
                  </span>
                  О себе
                  <span className="profile-optional-tag">необязательно</span>
                </label>
                <textarea
                  id="teacher-profile-about"
                  className="profile-textarea"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Коротко расскажите о себе, стиле преподавания или интересах"
                  rows={4}
                  maxLength={12000}
                />
              </div>
            </div>
          </div>

          <div className="profile-card-span">
            <div className="profile-fields profile-fields--full-width">
              <div className="profile-field profile-field--textarea">
                <label className="profile-label" htmlFor="teacher-profile-certificates">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:certificate-outline" />
                  </span>
                  Сертификаты, дипломы
                  <span className="profile-optional-tag">необязательно</span>
                </label>
                <textarea
                  id="teacher-profile-certificates"
                  className="profile-textarea"
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  placeholder="Образование, курсы, сертификаты — по желанию"
                  rows={4}
                  maxLength={12000}
                />
              </div>

              <div className="profile-field profile-field--textarea">
                <label className="profile-label" htmlFor="teacher-profile-career">
                  <span className="profile-label-icon" aria-hidden>
                    <Icon icon="mdi:briefcase-outline" />
                  </span>
                  Карьера
                  <span className="profile-optional-tag">необязательно</span>
                </label>
                <textarea
                  id="teacher-profile-career"
                  className="profile-textarea"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="Опыт работы, роли, проекты — по желанию"
                  rows={4}
                  maxLength={12000}
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

export default TeacherProfile;
