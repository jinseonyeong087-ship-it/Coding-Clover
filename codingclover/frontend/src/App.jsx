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
import MyPage from './pages/student/MyPage'
import CodingTest from './pages/CodingTest'
import EmailTest from './pages/EmailTest'
import CourseCreateRequest from '@/pages/instructor/CourseCreateRequest'
import FindAccount from '@/pages/FindAccount'
import QnaTest from './pages/QnaTest'
import SubmissionTest from './pages/SubmissionTest'
import ProtectedRoute from '@/components/ProtectdRoute'
import Noroll from '@/pages/Noroll'
import CommunityPostTest from './pages/CommunityPostTest'
import ProposalDetail from '@/pages/admin/ProposalDetail'
import InstructorCourseCreate from '@/pages/instructor/InstructorCourseDetail'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         {/* 커뮤니티 테스트 페이지 */}
        <Route path="/test/community" element={<CommunityPostTest />} />
        {/* 임시 코딩 테스트 페이지 */}
        <Route path="/test/coding" element={<CodingTest />} />
        {/* 이메일 발송 테스트 페이지 */}
        <Route path="/test/email" element={<EmailTest />} />
        {/* QnA 테스트 페이지 */}
        <Route path="/test/qna" element={<QnaTest />} />
        {/* Submission 테스트 페이지 */}
        <Route path="/test/submission" element={<SubmissionTest />} />
        {/* 로그인 관련 */}
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/findaccount" element={FindAccount} />
        {/* <Route path="/auth/oauth element={FindAccount} /> 소셜 로그인 아이콘도 없음*/}
        {/* 권한 없음 페이지 */}
        <Route path="/noroll" element={<Noroll />} />
        {/* 학생 강좌 */}
        <Route path="/course/level/:level" element={<Level />} />
        <Route path="/student/course/courseId/lectures" element={<Lecture />} />
        <Route path="/student/mypage" element={<MyPage />} />
        <Route path="/enroll" element={<Enroll />} />
        {/* 디비 연동하고 /student/course/{courseId}/enroll로 경로수정 */}
        {/* 럭쳐 링크 수정 필요함 */}
        {/* 강사페이지 */}
        <Route path="/instructor/*" element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR']} />
        }>
          <Route path="dashboard" element={<InstructorMain />} />
          <Route path="course/new" element={<CourseCreateRequest />} />
          <Route path="course/:courseId" element={<InstructorCourseCreate />} />
        </Route>
        {/* 관리자 */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="dashboard" element={<AdminMain />} />
          <Route path="course/:courseId/pending" element={<ProposalDetail />} />
        </Route>
        {/*관리자 프로필 <Route path="/api/admin/profile" element={<AdminProfile />} /> */}
        {/*강사 프로필 <Route path="/api/instructor/profile" element={<InstructorProfile />} /> */}
        {/*수강생 프로필 <Route path="/api/student/profile" element={<StudentProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
