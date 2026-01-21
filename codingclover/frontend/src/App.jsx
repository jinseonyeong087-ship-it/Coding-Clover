import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import MainLogin from './pages/MainLogin'
import Register from './pages/Register'
import Enroll from './pages/student/Enroll'
import InstructorMain from './pages/instructor/InstructorMain'
import AdminMain from './pages/admin/AdminMain'
import Basic from './pages/student/Basic'

import CodingTest from './pages/CodingTest'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 임시 코딩 테스트 페이지 */}
        <Route path="/test/coding" element={<CodingTest />} />
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        {/* /auth/oauth 소셜 로그인 */}
        <Route path="/courses/level/basic" element={<Basic />} />
        {/* 중급강좌 <Route path="/courses/level/intermediate" element={<Intermediate />} /> */}
        {/* 고급강좌 <Route path="/courses/level/advanced" element={<Advanced />} /> */}

        <Route path="/enroll" element={<Enroll />} />
        {/* 디비 연동하고 /student/courses/{courseId}/enroll로 경로수정 */}
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
