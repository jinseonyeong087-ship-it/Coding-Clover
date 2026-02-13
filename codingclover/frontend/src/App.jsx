import React, { useEffect } from 'react'
import axios from 'axios';
import { Toaster } from 'sonner';
import { Routes, Route, BrowserRouter, Navigate, useParams } from 'react-router-dom'
import Home from './pages/Home'
import MainLogin from './pages/MainLogin'
import Register from './pages/Register'
import InstructorMain from './pages/instructor/InstructorMain'
import AdminMain from './pages/admin/AdminMain'
import Level from './pages/student/Level'
import MyPage from './pages/student/MyPage'
import PointsHistory from './pages/student/PointsHistory'
import CourseCreateRequest from '@/pages/instructor/CourseCreateRequest'
import FindAccount from '@/pages/FindAccount'
import ProtectedRoute from '@/components/ProtectdRoute'
import Norole from '@/components/Norole'
import CommunityPostList from './pages/student/CommunityPostList'
import CommunityPostDetail from './pages/student/CommunityPostDetail'
import ProposalDetail from '@/pages/public/ProposalDetail'
import InstructorCourseDetail from '@/pages/instructor/InstructorCourseDetail'
import InstructorCourseEdit from '@/pages/instructor/InstructorCourseEdit'
import AdminApproch from '@/pages/admin/AdminApproch'
import InstructorMypage from '@/pages/instructor/InstructorMypage'
import Payment from './pages/Payment'
import Notice from './pages/public/Notice';
import NoticeDetail from './pages/public/NoticeDetail';
import AdminLectureDetail from '@/pages/admin/AdminLectureDetail'
import AdminCourseList from '@/pages/admin/AdminCourseList'
import AdminInstructorList from '@/pages/admin/AdminInstructorList'
import AdminEnrollmentManagement from '@/pages/admin/AdminEnrollmentManagement'
import StudentCourseDetail from '@/pages/student/StudentCourseDetail'
import CodingTestDetail from './pages/coding/CodingTestDetail';
import CodingTestList from './pages/coding/CodingTestList';
import CodingTestCreate from './pages/coding/CodingTestCreate';
import PaymentManagement from './pages/admin/PaymentManagement';
import StudentQnaList from './pages/student/StudentQnaList';
import StudentQnaDetail from './pages/student/StudentQnaDetail';
import ChatBot from './pages/student/ChatBot';
import StudentLectureDetail from './pages/student/StudentLectureDetail';
import InstructorCourseList from './pages/instructor/InstructorCourseList';
import InstructorLecture from './pages/instructor/InstructorLecture';
import InstructorQnaList from './pages/instructor/InstructorQnaList';
import InstructorQnaDetail from './pages/instructor/InstructorQnaDetail';
import ExamList from './pages/instructor/ExamList';
import ExamCreate from './pages/instructor/ExamCreate';
import ExamResult from './pages/instructor/ExamResult';
import StudentExamList from './pages/student/StudentExamList';
import StudentExamTaking from './pages/student/StudentExamTaking';
import AdminExamList from './pages/admin/AdminExamList';
import AdminPropsalDetail from './pages/admin/AdminPropsalDetail';
import AdminLectureList from '@/pages/admin/AdminLectureList';
import AdminStudentList from '@/pages/admin/AdminStudentList';
import AdminStudentDetail from '@/pages/admin/AdminStudentDetail';
import AdminInstructorCourses from '@/pages/admin/AdminInstructorCourses';
import Search from '@/pages/Search';



// 서버와의 통신에서 쿠키(세션)를 포함하도록 설정
axios.defaults.withCredentials = true;


// 잘못된 알림 링크(/lecture/:lectureId)를 올바른 경로(/student/lecture/:lectureId)로 리다이렉트
const RedirectToStudentLecture = () => {
  const { lectureId } = useParams();
  return <Navigate to={`/student/lecture/${lectureId}`} replace />;
};

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

        {/*검색*/}
        <Route path="/search" element={<Search />} />

        {/* 공지사항 */}
        <Route path="/notice" element={<Notice />} />
        <Route path="/notice/detail/:noticeId" element={<NoticeDetail />} />

        {/* 코딩 테스트 */}
        <Route path="/coding-test/:id" element={<CodingTestDetail />} />
        <Route path="/coding-test" element={<CodingTestList />} />
        <Route path="/coding-test/new" element={<CodingTestCreate />} />

        {/* 챗봇 ui확인용 라우터 */}
        <Route path="/ask" element={<ChatBot />} />


        {/* 결제 관련 */}
        <Route path="/payment" element={<Payment />} />

        {/* 로그인 관련 */}
        <Route path="/auth/login" element={<MainLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/findReques" element={<FindAccount />} />
        {/* <Route path="/auth/oauth element={FindAccount} /> 소셜 로그인 아이콘도 없음*/}
        {/* <Route path="/auth/oauth" element={<FindAccount />} /> 소셜 로그인 아이콘도 없음 */}
        {/* 권한 없음 페이지 */}
        <Route path="/norole" element={<Norole />} />
        {/* <Route path="/course" element={<Level />} /> */}
        <Route path="/course/level/:level" element={<Level />} />
        <Route path="/course/:courseId" element={<StudentCourseDetail />} />

        {/* 디비 연동하고 /student/course/{courseId}/enroll로 경로수정 */}
        {/* 럭쳐 링크 수정 필요함 */}
        <Route path="/lecture/:lectureId" element={<RedirectToStudentLecture />} />
        {/* 수강생 페이지 */}
        {/* 커뮤니티 (전체 공개, 로그인 불필요) */}
        <Route path="/student/community" element={<CommunityPostList />} />
        <Route path="/student/community/posts/:postId" element={<CommunityPostDetail />} />
        <Route path="/student/qna" element={<StudentQnaList />} />
        <Route path="/student/qna/:qnaId" element={<StudentQnaDetail />} />
        {/* <Route path="/student/lecture/:lectureId" element={<StudentCourseDetail />} /> */}

        

        {/* 수강생 페이지 (로그인 필요) */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']} />
        }>
          <Route path="mypage" element={<MyPage />} />
          <Route path="points" element={<PointsHistory />} />
          <Route path="course/:courseId/lectures" element={<StudentLectureDetail />} />
          <Route path="lecture/:lectureId" element={<StudentLectureDetail />} />
          <Route path="exam" element={<StudentExamList />} />
          <Route path="exam/course/:courseId" element={<StudentExamList />} />
          <Route path="exam/taking/:examId" element={<StudentExamTaking />} />
        </Route>

        {/* 강사 허가 안 했을 때 집입가능하도록 */}
        <Route path="/instructor/mypage" element={<InstructorMypage />} />
        
        {/* 강사페이지 */}
        <Route path="/instructor/*" element={
          <ProtectedRoute allowedRoles={['INSTRUCTOR']} />
        }>
          <Route path="dashboard" element={<InstructorMain />} />
          <Route path="course/new" element={<CourseCreateRequest />} />
          <Route path="course" element={<InstructorCourseList />} />
          <Route path="course/edit/:courseId" element={<InstructorCourseEdit />} />
          <Route path="course/:courseId" element={<InstructorCourseDetail />} />
          <Route path="course/:courseId/lectures" element={<StudentLectureDetail />} />
          <Route path="lecture/upload" element={<InstructorLecture />} />
          <Route path="lecture/:lectureId" element={<InstructorCourseDetail />} />
          
          <Route path="qna" element={<InstructorQnaList />} />
          <Route path="qna/:qnaId" element={<InstructorQnaDetail />} />
          <Route path="exam/list" element={<ExamList />} />
          <Route path="exam/new" element={<ExamCreate />} />
          <Route path="exam/:examId" element={<ExamCreate />} />
          <Route path="exam/:examId/results" element={<ExamResult />} />
        </Route>
        {/* 관리자 */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="dashboard" element={<AdminMain />} />
          <Route path="course" element={<AdminCourseList />} />
          <Route path="course/:courseId" element={<AdminPropsalDetail />} />
          <Route path="users/instructors/:userId" element={<AdminApproch />} />
          <Route path="course/:courseId/lectures" element={<AdminLectureDetail />} />
          <Route path="lectures/:lectureId" element={<AdminLectureDetail />} />
          <Route path="users/instructors" element={<AdminInstructorList />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="enrollment" element={<AdminEnrollmentManagement />} />
          <Route path="exams" element={<AdminExamList />} />
          <Route path="lectures" element={<AdminLectureList />} />
          <Route path="users/students" element={<AdminStudentList />} />
          <Route path="users/students/:studentId" element={<AdminStudentDetail />} />
          <Route path="users/instructors/:userId/courses" element={<AdminInstructorCourses />} />
        </Route>
        {/*관리자 프로필 <Route path="/api/admin/profile" element={<AdminProfile />} /> */}
        {/*강사 프로필 <Route path="/api/instructor/profile" element={<InstructorProfile />} /> */}
        {/*수강생 프로필 <Route path="/api/student/profile" element={<StudentProfile />} /> */}
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;