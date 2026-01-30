import React from 'react'
import axios from 'axios';
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
import CodingTest from './test/CodingTest'
import EmailTest from './test/EmailTest'
import CourseCreateRequest from '@/pages/instructor/CourseCreateRequest'
import FindAccount from '@/pages/FindAccount'
import QnaTest from './test/QnaTest'
import SubmissionTest from './test/SubmissionTest'
import ProtectedRoute from '@/components/ProtectdRoute'
import Noroll from '@/pages/Noroll'
import CommunityPostList from './pages/student/CommunityPostList'
import CommunityPostDetail from './pages/student/CommunityPostDetail'
import ProposalDetail from '@/pages/admin/ProposalDetail'
import InstructorCourseCreate from '@/pages/instructor/InstructorCourseDetail'
import AdminApproch from '@/pages/admin/AdminApproch'
import InstructorMypage from '@/pages/instructor/InstructorMypage'
import TestPayment from './test/TestPayment'
import TestPaymentSuccess from './test/TestPaymentSuccess'
import TestPaymentFail from './test/TestPaymentFail'
import LectureBatchTest from './test/LectureBatchTest';
import LectureCreateTest from './test/LectureCreateTest';
import TestInstructorCourseManage from './test/TestInstructorCourseManage';
import TestInstructorCourseEdit from './test/TestInstructorCourseEdit';
import TestInstructorLectureEdit from './test/TestInstructorLectureEdit';
import FindAccountTest from './test/FindAccountTest';




// 서버와의 통신에서 쿠키(세션)를 포함하도록 설정
axios.defaults.withCredentials = true;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 임시 코딩 테스트 페이지 */}
        <Route path="/test/coding" element={<CodingTest />} />
        {/* 이메일 발송 테스트 페이지 */}
        <Route path="/test/email" element={<EmailTest />} />
        {/* QnA 테스트 페이지 */}
        <Route path="/test/qna" element={<QnaTest />} />
        {/* Submission 테스트 페이지 */}
        <Route path="/test/submission" element={<SubmissionTest />} />
        {/* 강의 일괄 승인 테스트 경로 추가 */}
        <Route path="/test/lecture/batch" element={<LectureBatchTest />} />
        <Route path="/test/lecture/create" element={<LectureCreateTest />} />

        {/* 아이디/비밀번호 찾기 테스트 */}
        {/* 아이디/비밀번호 찾기 테스트 */}
        <Route path="/test/findaccount" element={<FindAccountTest />} />

        {/* 강사 통합 관리 테스트 영역 */}
        <Route path="/test/*" element={<ProtectedRoute allowedRoles={['INSTRUCTOR']} />}>
          <Route path="manage" element={<TestInstructorCourseManage />} />
          <Route path="course/edit/:courseId" element={<TestInstructorCourseEdit />} />
          <Route path="lecture/edit/:lectureId" element={<TestInstructorLectureEdit />} />
        </Route>

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
          <Route path="community" element={<CommunityPostList />} />
          <Route path="community/posts/:postId" element={<CommunityPostDetail />} />
        </Route>
        {/* 강사페이지 */}
        <Route path="/instructor/*" element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR']} />
        }>
          <Route path="dashboard" element={<InstructorMain />} />
          <Route path="course/new" element={<CourseCreateRequest />} />
          <Route path="course/:courseId" element={<InstructorCourseCreate />} />
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
