import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../index';
import '../dashboard/student.css';

const StudentSettings: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const logout = () => {
    store.logout();
    navigate('/', { replace: true });
  };

  return (
    <div>
      <h2>Настройки</h2>
      <button className="student-logout-btn" onClick={logout}>Выйти из аккаунта</button>
    </div>
  );
};

export default StudentSettings;
