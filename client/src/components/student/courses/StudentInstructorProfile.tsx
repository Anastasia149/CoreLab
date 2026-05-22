import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import Loader from '../../common/Loader';
import { ICourseInstructor } from '../../../models/ICourseInstructor';
import './StudentInstructorProfile.css';

function ProfileTextSection(props: {
  title: string;
  icon: string;
  text: string | null | undefined;
}) {
  const { title, icon, text } = props;
  const value = text?.trim();
  if (!value) return null;

  return (
    <section className="student-instructor-section">
      <h2 className="student-instructor-section-title">
        <Icon icon={icon} aria-hidden />
        {title}
      </h2>
      <p className="student-instructor-section-text">{value}</p>
    </section>
  );
}

const StudentInstructorProfile: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<ICourseInstructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    store
      .getCourseInstructorProfile(Number(courseId))
      .then((data) => setInstructor(data || null))
      .finally(() => setLoading(false));
  }, [courseId, store]);

  const displayName = instructor?.name?.trim() || 'Преподаватель';

  if (loading) {
    return <Loader size="inline" />;
  }

  if (!instructor) {
    return (
      <div className="student-instructor-profile-page">
        <p className="student-instructor-missing">Профиль преподавателя не найден.</p>
        <button
          type="button"
          className="student-instructor-back"
          onClick={() => navigate(`/student/my-courses/${courseId}`)}
        >
          <Icon icon="mdi:arrow-left" aria-hidden />
          Вернуться к курсу
        </button>
      </div>
    );
  }

  return (
    <div className="student-instructor-profile-page">
      <button
        type="button"
        className="student-instructor-back"
        onClick={() => navigate(`/student/my-courses/${courseId}`)}
      >
        <Icon icon="mdi:arrow-left" aria-hidden />
        Назад к курсу
      </button>

      <div className="student-instructor-card">
        <div className="student-instructor-avatar">
          {instructor.avatar ? (
            <img src={instructor.avatar} alt="" />
          ) : (
            <Icon icon="solar:user-circle-linear" aria-hidden />
          )}
        </div>
        <div className="student-instructor-info">
          <h1>{displayName}</h1>
          <p className="student-instructor-role">
            <Icon icon="mdi:school-outline" aria-hidden />
            Преподаватель курса
          </p>
        </div>
      </div>

      <ProfileTextSection title="О себе" icon="mdi:text-box-outline" text={instructor.aboutMe} />
      <ProfileTextSection
        title="Сертификаты и дипломы"
        icon="mdi:certificate-outline"
        text={instructor.certificates}
      />
      <ProfileTextSection title="Карьера" icon="mdi:briefcase-outline" text={instructor.career} />

      {!instructor.aboutMe?.trim() &&
        !instructor.certificates?.trim() &&
        !instructor.career?.trim() && (
          <p className="student-instructor-empty-details">
            Преподаватель пока не заполнил дополнительную информацию в профиле.
          </p>
        )}
    </div>
  );
};

export default observer(StudentInstructorProfile);
