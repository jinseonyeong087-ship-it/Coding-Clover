# 🍀 코딩 클로버 백엔드 전체 기능 명세 (Backend CRUD Map)

이 문서는 **"프론트엔드 연동 여부와 상관없이"** 현재 백엔드(Java/Spring Boot) 코드에 실제로 구현되어 있는 모든 기능을 정리한 지도입니다.
(백엔드 로직 자체는 개발되어 있으나, 프론트 화면이 아직 없는 기능까지 포함됩니다.)

---

## 1. 📢 커뮤니티 게시판 (CommunityPost)
> 게시글과 댓글에 대한 완전한 CRUD 로직이 `Controller`와 `Service`에 모두 구현되어 있습니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **게시글 작성** | 제목, 내용을 받아 저장하며 작성자를 기록함 (초기 상태: Visible) | `CommunityPostController` (`/api/community/posts/new`) |
| **게시글 목록** | 삭제되지 않은(Visible) 게시글만 필터링하여 최신순 조회 | `CommunityPostService` (`getVisiblePosts`) |
| **게시글 상세** | 특정 게시글의 내용을 조회하며 조회수 증가 로직 포함 | `CommunityPostController` (`/api/community/posts/{id}`) |
| **게시글 수정** | 작성자 본인 확인 후 제목과 내용 수정 | `CommunityPostService` (`updatePost`) |
| **게시글 삭제** | 작성자 본인 확인 후 실제 삭제 대신 '숨김(HIDDEN)' 상태로 변경 (**Soft Delete**) | `CommunityPostService` (`deletePost`) |
| **댓글 작성** | 특정 게시글에 종속된 댓글 저장 | `CommunityPostController` (`.../comments`) |
| **댓글 수정/삭제** | 댓글 작성자 본인 확인 후 수정 및 삭제 처리 | `CommunityPostService` (`updateComment`/`deleteComment`) |

---

## 2. � 회원 관리 (Users)
> 회원가입 로직과 인증(Security) 필터 연동이 완료되어 있습니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **회원가입** | 아이디, 비밀번호(암호화), 이름, 이메일, 역할(STUDENT/INSTRUCTOR) 저장 | `UsersController` (`/auth/register`) |
| **로그인 인증** | Spring Security 필터 체인에서 ID/PW 검증 및 세션/토큰 발급 | `SecurityConfig` & `UserSecurityService` |
| **내 정보 조회** | SecurityContext에서 현재 로그인한 유저 정보를 추출하여 반환 | `UsersController` (또는 각 도메인 마이페이지 로직) |

---

## 3. 🎓 강좌 관리 (Course)
> 강사, 관리자, 학생의 역할별 로직이 분리되어 정교하게 구현되어 있습니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **강좌 개설 신청** | (강사) 제목, 설명, 가격 등을 입력하여 생성. 초기 상태는 `PENDING` | `CourseController` (`/instructor/course/new`) |
| **본인 강좌 조회** | (강사) 본인이 만든 강좌 목록 조회 | `CourseService` (`getInstructorList`) |
| **강좌 수정** | (강사) 본인 강좌인지 확인 후 정보 수정 | `CourseController` (`/instructor/course/{id}/edit`) |
| **강좌 삭제** | (강사) 본인 강좌인지 확인 후 삭제 | `CourseController` (`/instructor/course/{id}/delete`) |
| **전체 강좌 조회** | (학생/비회원) 승인된(`APPROVED`) 공개 강좌만 조회 | `CourseService` (`getPublicList`) |
| **강좌 승인/반려** | (관리자) 대기 중인 강좌를 승인(`APPROVED`)하거나 반려(`REJECTED`) 처리 | `CourseController` (`/admin/course/...`) |

---

## 4. 📺 강의 콘텐츠 관리 (Lecture)
> 강좌(Course) 내에 속하는 상세 영상/수업(Lecture) 관리 로직입니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **강의 등록** | (강사) 특정 강좌에 포함될 영상 URL, 순서, 제목 등록 | `LectureController` (`/instructor/lecture/upload`) |
| **강의 목록 조회** | (강사) 승인 여부와 관계없이 본인이 올린 전체 강의 조회 | `LectureController` (`/instructor/lecture/{courseId}`) |
| **수강생용 강의 조회** | (학생) 해당 강좌의 '승인된' 강의만 순서대로 조회 | `LectureController` (`/student/lecture/...`) |
| **강의 승인/반려** | (관리자) 개별 강의 콘텐츠 검수 후 승인 또는 반려 | `LectureService` (`approve`/`reject`) |
| **강의 비활성화** | (관리자) 문제 있는 강의를 강제로 안 보이게 숨김 처리 (`INACTIVE`) | `LectureService` (`inactive`) |

---

## 5. 📝 수강 신청 (Enrollment)
> 학생의 수강 등록과 이력을 관리합니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **수강 신청** | 학생이 특정 강좌를 신청. **중복 신청 방지** 로직 포함 | `EnrollmentService` (`enrollCourse`) |
| **수강 취소** | 신청한 수강 내역 취소 (상태 변경 또는 삭제) | `EnrollmentService` (`cancelMyEnrollment`) |
| **내 수강 이력** | 학생 본인이 신청한 강좌 목록(Active) 조회 | `EnrollmentController` (`.../active`) |

---

## 6. 🔔 공지사항 (Notice)
> 관리자 전용 게시판 로직입니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **공지 등록** | (관리자) 제목, 내용 작성. 일반 게시판과 달리 관리자 권한 체크 필수 | `NoticeController` (`/admin/notice`) |
| **공지 수정/삭제** | (관리자) 등록된 공지사항 수정 및 삭제 로직 | `NoticeService` (`update`/`delete`) |
| **공지 조회** | (전체) 모든 사용자가 공지사항 목록 및 상세 내용 조회 | `NoticeController` (`/notice`) |

---

## 7. 🧩 코딩 문제 및 채점 (Problem/Submission)
> 문제 은행 및 채점 엔진 로직입니다.

| 기능 | 동작 설명 | 백엔드 구현 위치 |
| :--- | :--- | :--- |
| **문제 등록** | (관리자) 문제 지문, 난이도 등 기본 정보 저장 | `ProblemController` (`create`) |
| **문제 목록/상세** | 전체 문제 리스트 및 특정 문제 상세 조회 | `ProblemRepository` 직접 호출 |
| **코드 실행/채점** | 사용자가 제출한 코드를 **별도 프로세스로 실행**하여 테스트 케이스와 비교 판정 (**Pass/Fail**) | `ProblemController` (`submitCode`) & `JavaNativeExecutor` |
| **제출 이력 저장** | 채점 결과(성공 여부, 실행 시간)를 유저 정보와 함께 DB에 영구 저장 | `SubmissionService` (`create`) |
| **내 풀이 조회** | 유저별 제출 이력(내가 푼 문제들) 조회 | `SubmissionController` (`getHistory`) |
