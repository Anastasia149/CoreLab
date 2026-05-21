import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import './ProfilePage.css';

const DELETE_CONFIRM_WORD = 'Удалить';

export const ProfileAccountSection: React.FC = observer(() => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);

  const canConfirmDelete = deleteConfirm.trim() === DELETE_CONFIRM_WORD;

  const handleLogout = async () => {
    setAccountError('');
    await store.logout();
    navigate('/', { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete || accountBusy) return;
    setAccountError('');
    setAccountBusy(true);
    try {
      await store.deleteAccount();
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setAccountError(err.response?.data?.message || 'Не удалось удалить аккаунт');
    } finally {
      setAccountBusy(false);
    }
  };

  const closeDeletePanel = () => {
    setDeleteOpen(false);
    setDeleteConfirm('');
    setAccountError('');
  };

  return (
    <section className="profile-account-section" aria-labelledby="profile-account-title">
      <h3 id="profile-account-title" className="profile-account-title">
        Аккаунт
      </h3>
      <p className="profile-account-desc">
        Выход завершает сессию на этом устройстве. Удаление аккаунта необратимо.
      </p>

      {accountError && (
        <div className="profile-message profile-message--error" role="alert">
          {accountError}
        </div>
      )}

      <div className="profile-account-actions">
        <button
          type="button"
          className="profile-logout-button"
          onClick={handleLogout}
          disabled={accountBusy}
        >
          Выйти из аккаунта
        </button>
        {!deleteOpen ? (
          <button
            type="button"
            className="profile-delete-toggle"
            onClick={() => setDeleteOpen(true)}
            disabled={accountBusy}
          >
            Удалить аккаунт
          </button>
        ) : (
          <div className="profile-delete-panel">
            <p className="profile-delete-warning">
              Все ваши данные будут удалены без возможности восстановления. Чтобы подтвердить,
              введите слово <strong>{DELETE_CONFIRM_WORD}</strong> в поле ниже.
            </p>
            <label className="profile-delete-label" htmlFor="profile-delete-confirm">
              Подтверждение
            </label>
            <input
              id="profile-delete-confirm"
              type="text"
              className="profile-input profile-delete-input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_CONFIRM_WORD}
              autoComplete="off"
              disabled={accountBusy}
            />
            <div className="profile-delete-buttons">
              <button
                type="button"
                className="profile-delete-cancel"
                onClick={closeDeletePanel}
                disabled={accountBusy}
              >
                Отмена
              </button>
              <button
                type="button"
                className="profile-delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={!canConfirmDelete || accountBusy}
              >
                {accountBusy ? 'Удаление…' : 'Удалить аккаунт навсегда'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
