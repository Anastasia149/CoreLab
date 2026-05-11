import React, { useContext, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import HomePage from './components/HomePage';
import StudentHome from './components/student/dashboard/StudentHome';
import { Context } from './index';
import { observer } from "mobx-react-lite";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import TeacherHome from './components/teacher/dashboard/TeacherHome';
import TeacherCourses from './components/teacher/courses/TeacherCourses';
import CreateCourse from './components/teacher/courses/CreateCourse';
import CourseDetail from './components/teacher/courses/CourseDetail';
import CreateLesson from './components/teacher/courses/CreateLesson';
import LessonDetail from './components/teacher/lessons/LessonDetail';
import EditLesson from './components/teacher/lessons/EditLesson';
import EditCourse from './components/teacher/courses/EditCourse';
import Loader from './components/common/Loader';
import NotFound from './components/common/NotFound';
import StudentSettings from './components/student/settings/StudentSettings';
import ScheduleHome from './components/student/schedule/ScheduleHome';
import StudentLayout from './components/student/dashboard/StudentLayout';
import StudentCoursesSearch from './components/student/courses/StudentCoursesSearch';
import StudentMyCourses from './components/student/courses/StudentMyCourses';

import SearchDetails from './components/student/courses/SearchDetails';
import StudentLessonDetail from './components/student/courses/StudentLessonDetail';
import CreateTest from './components/teacher/courses/CreateTest';

function App() {
  const {store} = useContext(Context);

  useEffect(()=>{
    store.checkAuth();
  }, [])

  if(store.isLoading){
    return <Loader size="full-page" />
  }

  const isStudent = store.isAuth && store.user?.role === 'student';
  const isTeacher = store.isAuth && store.user?.role === 'teacher';

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={store.isAuth ? <Navigate to={isStudent ? "/student" : "/teacher"} replace /> : <HomePage />} />
          <Route path="/student" element={isStudent ? <StudentLayout /> : <Navigate to="/" replace />}>
            <Route index element={<StudentHome />} />
            <Route path="my-courses" element={<StudentMyCourses />} />
            <Route path="courses" element={<StudentCoursesSearch />} />
            <Route path="search" element={<StudentCoursesSearch />} />
            <Route path="schedule" element={<ScheduleHome />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="courses/:id" element={<SearchDetails />} />
            <Route path="search/:id" element={<SearchDetails />} />
            <Route path="lesson/:lessonId" element={<StudentLessonDetail />} />
          </Route>

          <Route path="/teacher" element={isTeacher ? <TeacherHome /> : <Navigate to="/" replace />} />
          <Route path="/teacher/courses" element={isTeacher ? <TeacherCourses /> : <Navigate to="/" replace />} />
          <Route path="/teacher/create-course" element={isTeacher ? <CreateCourse /> : <Navigate to="/" replace />} />
          <Route path="/teacher/course/:id" element={isTeacher ? <CourseDetail /> : <Navigate to="/" replace />} />
          <Route path="/teacher/course/:id/edit" element={isTeacher ? <EditCourse /> : <Navigate to="/" replace />} />
          <Route path="/teacher/course/:courseId/create-lesson" element={isTeacher ? <CreateLesson /> : <Navigate to="/" replace />} />
          <Route path="/teacher/course/:courseId/create-test" element={isTeacher ? <CreateTest /> : <Navigate to="/" replace />} />
          <Route path="/teacher/lesson/:lessonId" element={isTeacher ? <LessonDetail /> : <Navigate to="/" replace />} />
          <Route path="/teacher/lesson/:lessonId/edit" element={isTeacher ? <EditLesson /> : <Navigate to="/" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
}

export default observer(App);