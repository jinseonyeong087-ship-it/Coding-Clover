import React, { useEffect } from 'react'
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
import PointsHistory from './pages/student/PointsHistory'
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
import ProposalDetail from '@/pages/public/ProposalDetail'
import InstructorCourseDetail from '@/pages/instructor/InstructorCourseDetail'
import AdminApproch from '@/pages/admin/AdminApproch'
import InstructorMypage from '@/pages/instructor/InstructorMypage'
import Payment from './pages/Payment'
import LectureBatchTest from './test/LectureBatchTest';
import LectureCreateTest from './test/LectureCreateTest';
import TestInstructorCourseManage from './test/TestInstructorCourseManage';
import TestInstructorCourseEdit from './test/TestInstructorCourseEdit';
import TestInstructorLectureEdit from './test/TestInstructorLectureEdit';
import FindAccountTest from './test/FindAccountTest';
import TestSearch from './test/TestSearch';
import Notice from './pages/admin/Notice';
import NoticeDetail from './pages/admin/NoticeDetail';
import AdminLectureDetail from '@/pages/admin/AdminLectureDetail'
import AdminCourseList from '@/pages/admin/AdminCourseList'
import AdminInstructorList from '@/pages/admin/AdminInstructorList'
import StudentCourseDetail from '@/pages/student/StudentCourseDetail'
import CodingTestDetail from './pages/coding/CodingTestDetail';
import CodingTestList from './pages/coding/CodingTestList';
import CodingTestCreate from './pages/coding/CodingTestCreate';
import PaymentManagement from './pages/admin/PaymentManagement';
import StudentQnaList from './pages/student/StudentQnaList';
import StudentQnaDetail from './pages/student/StudentQnaDetail';
import ChatBot from './pages/student/ChatBot';




// 서버와의 통신에서 쿠키(세션)를 포함하도록 설정
axios.defaults.withCredentials = true;


function App() {

  useEffect(() => {
    // 앱 초기 로드 시 서버 세션 상태 확인
    axios.get('/auth/status')
      .then(response => {
        const { loggedIn } = response.data;
        // 서버는 로그아웃 상태인데, 클라이언트는 로그인 상태라고 믿고 있다면 (예: 서버 재시작)
        if (loggedIn === false && localStorage.getItem('loginId') === 'true') {
          console.log("세션 만료 감지: 자동 로그아웃 처리");
          localStorage.removeItem('loginId');
          localStorage.removeItem('users');
          // 상태 초기화를 위해 로그인 페이지로 이동 (알림 없음)
          window.location.href = '/';
        }
      })
      .catch(error => {
        console.error("세션 상태 확인 실패:", error);
      });
  }, []);
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
        {/*검색*/}
        <Route path="/test/search" element={<TestSearch />} />
        {/*공지사항 테스트*/}
        <Route path="/test/notice" element={<Notice />} />
        {/* 공지사항 */}
        <Route path="/notice" element={<Notice />} />
        <Route path="/notice/detail/:noticeId" element={<NoticeDetail />} />

        {/* 코딩 테스트 */}
        <Route path="/coding-test/:id" element={<CodingTestDetail />} />
        <Route path="/coding-test" element={<CodingTestList />} />
        <Route path="/coding-test/new" element={<CodingTestCreate />} />

        {/* 챗봇 ui확인용 라우터 */}
        <Route path="/ask" element={<ChatBot />} />

        {/* 아이디/비밀번호 찾기 테스트 */}
        {/* 아이디/비밀번호 찾기 테스트 */}
        <Route path="/test/findaccount" element={<FindAccountTest />} />

        {/* 강사 통합 관리 테스트 영역 */}
        <Route path="/test/*" element={<ProtectedRoute allowedRoles={['INSTRUCTOR']} />}>
          <Route path="manage" element={<TestInstructorCourseManage />} />
          <Route path="course/edit/:courseId" element={<TestInstructorCourseEdit />} />
          <Route path="lecture/edit/:lectureId" element={<TestInstructorLectureEdit />} />
        </Route>

        {/* 결제 관련 */}
        <Route path="/payment" element={<Payment />} />
        {/* 결제 테스트 (프론트/백엔드 연동) - 기존 경로 유지 */}
        <Route path="/test/payment/checkout" element={<Payment />} />
        {/* 로그인 관련 */}
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/findReques" element={<FindAccount />} />
        {/* <Route path="/auth/oauth element={FindAccount} /> 소셜 로그인 아이콘도 없음*/}
        {/* 권한 없음 페이지 */}
        <Route path="/noroll" element={<Noroll />} />
        <Route path="/course/level/:level" element={<Level />} />
        <Route path="/course/:courseId" element={<ProposalDetail />} />
        {/* 디비 연동하고 /student/course/{courseId}/enroll로 경로수정 */}
        {/* 럭쳐 링크 수정 필요함 */}
        {/* 수강생 페이지 */}
        {/* 커뮤니티 (전체 공개, 로그인 불필요) */}
        <Route path="/student/community" element={<CommunityPostList />} />
        <Route path="/student/community/posts/:postId" element={<CommunityPostDetail />} />
        {/* <Route path="/student/lecture/:lectureId" element={<StudentCourseDetail />} /> */}

        {/* 수강생 페이지 (로그인 필요) */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']} />
        }>
          <Route path="mypage" element={<MyPage />} />
          <Route path="points" element={<PointsHistory />} />
          <Route path="course/:courseId" element={<StudentCourseDetail />} />
          {/* <Route path="course/:courseId/lectures" element={<Lecture />} /> */}
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
          <Route path="course" element={<AdminCourseList />} />
          <Route path="course/:courseId" element={<ProposalDetail />} />
          <Route path="users/instructors/:userId" element={<AdminApproch />} />
          <Route path="course/:courseId/lectures" element={<AdminLectureDetail />} />
          <Route path="users/instructors" element={<AdminInstructorList />} />
          <Route path="payments" element={<PaymentManagement />} />
        </Route>
        {/*관리자 프로필 <Route path="/api/admin/profile" element={<AdminProfile />} /> */}
        {/*강사 프로필 <Route path="/api/instructor/profile" element={<InstructorProfile />} /> */}
        {/*수강생 프로필 <Route path="/api/student/profile" element={<StudentProfile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
