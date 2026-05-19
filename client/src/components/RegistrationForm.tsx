import React, { useContext } from "react";
import { Context } from '../index';
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import './RegistrationForm.css';
import { useFormFields } from '../hooks/useFormFields';

import illustration from './home/pictures/Education-rafiki.svg';

const RegistrationForm: React.FC = () => {
    const { fields, handleChange } = useFormFields({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as 'student' | 'teacher'
    });
    const {store} = useContext(Context);
    const navigate = useNavigate();
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const passwordsMatch = fields.password.length > 0 && fields.confirmPassword.length > 0 && fields.password === fields.confirmPassword;
    const canSubmit = fields.name.trim().length > 0 && fields.email.trim().length > 0 && passwordsMatch;
    const showMismatch = !passwordsMatch && fields.confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!canSubmit) return;
        setError(null);
        try {
            await store.registration(fields.name, fields.email, fields.password, fields.role);
            setSubmitted(true);
        } catch (e: any) {
            if (e.response?.data?.message) {
                setError(e.response.data.message);
            } else {
                setError('Произошла неизвестная ошибка');
            }
        }
    };
    return (
        <div className="auth-page register-page">
            <div className="auth-wrapper">
                <div className="auth-panel auth-panel-left">
                    <div className="auth-logo-block">
                        <Icon icon="icomoon-free:book" className="auth-logo-icon" />
                        <div className="auth-logo-text">CoreLab</div>
                    </div>

                    <div className="auth-left-content">
                        <h2 className="auth-title">{submitted ? 'Подтверждение email' : 'Регистрация'}</h2>

                        {!submitted ? (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <label className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Icon icon="mdi:account-outline" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    value={fields.name}
                                    onChange={handleChange('name')}
                                    className="auth-input"
                                    required
                                />
                            </label>

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

                            <label className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Icon icon="mdi:lock-check-outline" />
                                </span>
                                <input
                                    type="password"
                                    placeholder="Подтверждение пароля"
                                    value={fields.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    className="auth-input"
                                    required
                                />
                            </label>

                            <label className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <Icon icon="mdi:account-school-outline" />
                                </span>
                                <select
                                    value={fields.role}
                                    onChange={handleChange('role')}
                                    className="auth-input"
                                >
                                    <option value="student">Студент</option>
                                    <option value="teacher">Преподаватель</option>
                                </select>
                            </label>

                            {showMismatch && (
                                <div className="auth-error">Пароли не совпадают</div>
                            )}

                            {error && (
                                <div className="auth-error">
                                    {error} <Link to="/login" className="auth-link-button">Войти?</Link>
                                </div>
                            )}

                            <button type="submit" className="auth-submit-button" disabled={!canSubmit}>
                                Зарегистрироваться
                            </button>
                        </form>
                        ) : (
                        <div className="auth-info">
                            <div className="auth-info-title">Перейдите на почту для подтверждения email</div>
                            <div className="auth-register-row">
                                <span>Уже подтвердили?</span>
                                <button type="button" className="auth-link-button" onClick={() => navigate('/login')}>
                                    Войти
                                </button>
                            </div>
                        </div>
                        )}

                        <div className="auth-register-row">
                            <span>Уже есть аккаунт?</span>
                            <button type="button" className="auth-link-button" onClick={() => navigate('/login')}>
                                Войти
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

export default observer(RegistrationForm);
