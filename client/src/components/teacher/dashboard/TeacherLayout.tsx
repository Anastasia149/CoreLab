import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './components/TeacherSidebar';
import TeacherHeader from './components/TeacherHeader';
import './teacher.css';

const TeacherLayout: React.FC = () => {
  return (
    <div className="teacher-dashboard">
      <TeacherSidebar />
      <div className="teacher-main-content">
        <TeacherHeader />
        <Outlet /> 
      </div>
    </div>
  );
};

export default TeacherLayout;
