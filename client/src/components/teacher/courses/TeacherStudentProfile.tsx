import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import Loader from '../../common/Loader';
import { ICourseStudent } from '../../../models/ICourseStudent';
import '../dashboard/TeacherLayout.css';
import './TeacherStudentProfile.css';

const TeacherStudentProfile: React.FC = () => {
  const { id: courseId, studentId } = useParams<{ id: string; studentId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [student, setStudent] = useState<ICourseStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !studentId) return;
    store
      .getCourseStudentProfile(Number(courseId), Number(studentId))
      .then((data) => setStudent(data || null))
      .finally(() => setLoading(false));
  }, [courseId, studentId, store]);

  const displayName = student?.name?.trim() || student?.email || 'Ученик';

  if (loading) {
    return (
      <div className="teacher-layout">
        <TeacherSidebar />
        <main className="teacher-content">
          <Loader size="inline" />
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="teacher-layout">
        <TeacherSidebar />
        <main className="teacher-content">
          <TeacherHeader name="Профиль ученика" />
          <p className="teacher-student-profile-missing">Ученик не найден.</p>
          <button
            type="button"
            className="teacher-student-profile-back"
            onClick={() => navigate(`/teacher/course/${courseId}`)}
          >
            <Icon icon="mdi:arrow-left" aria-hidden />
            Вернуться к курсу
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={displayName} />
        <div className="teacher-courses-page teacher-student-profile-page">
          <button
            type="button"
            className="teacher-student-profile-back"
            onClick={() => navigate(`/teacher/course/${courseId}`)}
          >
            <Icon icon="mdi:arrow-left" aria-hidden />
            Назад к курсу
          </button>

          <div className="teacher-student-profile-card">
            <div className="teacher-student-profile-avatar">
              {student.avatar ? (
                <img src={student.avatar} alt="" />
              ) : (
                <Icon icon="solar:user-circle-linear" aria-hidden />
              )}
            </div>
            <div className="teacher-student-profile-info">
              <h1>{displayName}</h1>
              <p className="teacher-student-profile-email">
                <Icon icon="mdi:email-outline" aria-hidden />
                {student.email}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(TeacherStudentProfile);
