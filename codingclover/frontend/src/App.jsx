import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import MainLogin from './pages/MainLogin'
import Register from './pages/Register'
import Enroll from './pages/student/Enroll'
import InstructorMain from './pages/instructor/InstructorMain'
import AdminMain from './pages/admin/AdminMain'
import Level from './pages/student/Level'
import Lecture from './pages/student/Lecture'
import CodingTest from './pages/CodingTest'
import EmailTest from './pages/EmailTest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 임시 코딩 테스트 페이지 */}
        <Route path="/test/coding" element={<CodingTest />} />
        {/* 이메일 발송 테스트 페이지 */}
        <Route path="/test/email" element={<EmailTest />} />
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        {/* /auth/oauth 소셜 로그인 */}
        <Route path="/course/level/1" element={<Level />} />
        <Route path="/course/level/2" element={<Intermediate />} />
        <Route path="/course/level/3" element={<Advanced />} />
        {/* <Route path="/student/course/courseId" element={<Basic />} /> */}
        <Route path="/student/course/courseId/lectures" element={<Lecture />} />
        {/* 럭쳐 링크 수정 필요함 */}

        <Route path="/enroll" element={<Enroll />} />
        {/* 디비 연동하고 /student/course/{courseId}/enroll로 경로수정 */}
        <Route path="/instructor/dashboard" element={<InstructorMain />} />
        <Route path="/admin/dashboard" element={<AdminMain />} />
        {/*관리자 프로필 <Route path="/api/admin/profile" element={<AdminProfile />} /> */}
        {/*강사 프로필 <Route path="/api/instructor/profile" element={<InstructorProfile />} /> */}
        {/*수강생 프로필 <Route path="/api/student/profile" element={<StudentProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
