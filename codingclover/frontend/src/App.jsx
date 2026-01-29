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
import FindAccount from '@/pages/FindAccount'
import QnaTest from './pages/QnaTest'
import SubmissionTest from './pages/SubmissionTest'
import ProtectedRoute from '@/components/ProtectdRoute'
import Noroll from '@/pages/Noroll'
import CommunityPostTest from './pages/CommunityPostTest'
import ProposalDetail from '@/pages/admin/ProposalDetail'
import CourseCreateRequest from '@/pages/instructor/CourseCreateRequest'
import AdminApproch from '@/pages/admin/AdminApproch'
import InstructorMypage from '@/pages/instructor/InstructorMypage'
import InstructorCourseDetail from '@/pages/instructor/InstructorCourseDetail'
import TestPayment from '@/pages/payment/TestPayment'
import TestPaymentSuccess from '@/pages/payment/TestPaymentSuccess'
import TestPaymentFail from '@/pages/payment/TestPaymentFail'

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

        {/* 결제 테스트 (프론트/백엔드 연동) */}
        <Route path="/test/payment/checkout" element={<TestPayment />} />
        <Route path="/test/payment/success" element={<TestPaymentSuccess />} />
        <Route path="/test/payment/fail" element={<TestPaymentFail />} />
        {/* 로그인 관련 */}
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/findaccount" element={FindAccount} />
        {/* <Route path="/auth/oauth element={FindAccount} /> 소셜 로그인 아이콘도 없음*/}
        {/* 권한 없음 페이지 */}
        <Route path="/noroll" element={<Noroll />} />
        <Route path="/course/level/:level" element={<Level />} />
        <Route path="/course/:id" element={<Enroll />} />
        {/* 디비 연동하고 /student/course/{courseId}/enroll로 경로수정 */}
        {/* 럭쳐 링크 수정 필요함 */}
        {/* 수강생 페이지 */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']} />
        }>
          <Route path="mypage" element={<MyPage />} />
          <Route path="course/:courseId/lectures" element={<Lecture />} />
        </Route>
        {/* 강사페이지 */}
        <Route path="/instructor/*" element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR']} />
        }>
          <Route path="dashboard" element={<InstructorMain />} />
          <Route path="course/new" element={<CourseCreateRequest />} />
          <Route path="course/:courseId" element={<InstructorCourseDetail />} />
          <Route path="mypage" element={<InstructorMypage />} />
        </Route>
        {/* 관리자 */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="dashboard" element={<AdminMain />} />
          <Route path="course/:courseId" element={<ProposalDetail />} />
          <Route path="users/instructors/:userId" element={<AdminApproch />} />
        </Route>
        {/*관리자 프로필 <Route path="/api/admin/profile" element={<AdminProfile />} /> */}
        {/*강사 프로필 <Route path="/api/instructor/profile" element={<InstructorProfile />} /> */}
        {/*수강생 프로필 <Route path="/api/student/profile" element={<StudentProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
