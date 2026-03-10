import React, { useContext } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import '../components/LoginForm.css';
import { useFormFields } from '../hooks/useFormFields';

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

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.login(fields.email, fields.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-panel auth-panel-left">
          <div className="auth-logo-block">
            <Icon icon="icomoon-free:book" className="auth-logo-icon" />
            <div className="auth-logo-text">Courses</div>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-title">Войдите через</h2>

            <div className="auth-social-list">
              <button type="button" className="auth-social-button google">
                <Icon icon="logos:google-icon" className="auth-social-icon" />
                <span>Google</span>
              </button>
              <button type="button" className="auth-social-button facebook">
                <Icon icon="simple-icons:facebook" className="auth-social-icon" />
                <span>Facebook</span>
              </button>
            </div>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">или</span>
              <span className="auth-divider-line" />
            </div>

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
                  required
                />
              </label>

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
            <div className="auth-hero-card auth-hero-card-main" />
            <div className="auth-hero-card auth-hero-card-top" />
            <div className="auth-hero-card auth-hero-card-bottom" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(LoginForm);
