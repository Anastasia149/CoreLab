import React, { useContext, useState } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { useFormFields } from '../hooks/useFormFields';
import {
  isEmailValid,
  isPasswordLengthValid,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../constants/auth';

import illustration from './home/pictures/Education-rafiki.svg';

const LoginForm: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (store.isAuth) {
      if (store.user?.role === 'teacher') {
        navigate('/teacher', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [store.isAuth, store.user?.role, navigate]);

  const { fields, handleChange } = useFormFields({
    email: '',
    password: ''
  });

  

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid(fields.email)) {
      setError('Введите корректный email');
      return;
    }
    if (!isPasswordLengthValid(fields.password)) {
      setError(`Пароль должен быть от ${PASSWORD_MIN_LENGTH} до ${PASSWORD_MAX_LENGTH} символов`);
      return;
    }
    setError('');
    try {
      await store.login(fields.email, fields.password);
    } catch (err) {
      setError('Неверный логин или пароль!');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-panel auth-panel-left">
          <div className="auth-logo-block">
            <Icon icon="icomoon-free:book" className="auth-logo-icon" />
            <div className="auth-logo-text">CoreLab</div>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-title">Вход</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon icon="mdi:email-outline" />
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={fields.email}
                  onChange={handleChange('email')}
                  className="auth-input"
                  maxLength={EMAIL_MAX_LENGTH}
                  required
                />
              </label>

              <label className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon icon="mdi:lock-outline" />
                </span>
                <input
                  type="password"
                  placeholder="Пароль"
                  value={fields.password}
                  onChange={handleChange('password')}
                  className="auth-input"
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  required
                />
              </label>
              {error && <div className="auth-error-message">{error}</div>}

              <div className="auth-forgot-row">
                <button type="button" className="auth-link-button">
                  Забыли пароль?
                </button>
              </div>

              <button type="submit" className="auth-submit-button">
                Войти
              </button>
            </form>

            <div className="auth-register-row">
              <span>Нет аккаунта?</span>
              <button
                type="button"
                className="auth-link-button"
                onClick={() => navigate('/register')}
              >
                Зарегистрироваться
              </button>
            </div>
          </div>
        </div>

        <div className="auth-panel auth-panel-right">
          <div className="auth-hero">
            <img src={illustration} alt="Education" className="auth-hero-illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(LoginForm);
