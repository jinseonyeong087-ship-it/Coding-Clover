# 🍀 코딩 클로버 기능 구현 지도 (CRUD Map)

이 문서는 **"어떤 기능이 어떤 파일의 몇 번째 줄에 있는지"** 아주 쉽게 찾을 수 있도록 정리한 지도입니다.
코드를 잘 모르는 분들도 **"게시글 작성 기능이 어디 있지?"** 하면 바로 찾아가실 수 있습니다.

---

## 🛠️ 들어가기 전에: 용어 설명
*   **Controller (컨트롤러)**: **"주문 받는 곳"** (식당 카운터). 사용자가 버튼을 누르면 가장 먼저 연락받는 파일입니다.
*   **Service (서비스)**: **"요리하는 곳"** (주방). 실제 데이터를 저장하고, 계산하고, 검사하는 핵심 작업장입니다.
*   **CRUD**: 데이터 관리의 기본 4박자. (**C**:만들기, **R**:읽기, **U**:수정하기, **D**:삭제하기)

---

## 1. 📢 커뮤니티 게시판 (Community)
> 사람들이 글을 쓰고 댓글을 다는 공간입니다. 가장 기능이 많고 완벽하게 구현되어 있습니다.

| 내가 하고 싶은 것 | 기능(CRUD) | 📂 여기를 보세요 (Controller) | 🛠️ 실제 작업하는 곳 (Service) |
| :--- | :---: | :--- | :--- |
| **글 쓰기** | **Create** | `CommunityPostController` (51번째 줄) | `CommunityPostService` (20번째 줄) |
| **글 목록 보기** | **Read** | `CommunityPostController` (35번째 줄) | `CommunityPostService` (37번째 줄) |
| **글 내용 보기** | **Read** | `CommunityPostController` (43번째 줄) | `CommunityPostService` (46번째 줄) |
| **내 글 수정하기** | **Update** | `CommunityPostController` (76번째 줄) | `CommunityPostService` (64번째 줄) |
| **내 글 지우기** | **Delete** | `CommunityPostController` (93번째 줄) | `CommunityPostService` (83번째 줄) |
| **댓글 달기** | **Create** | `CommunityPostController` (108번째 줄) | `CommunityPostService` (110번째 줄) |

---

## 2. 🔔 공지사항 (Notice)
> 관리자가 "필독하세요!" 하고 올리는 게시판입니다. 일반 회원은 보기만 할 수 있습니다.

| 내가 하고 싶은 것 | 기능(CRUD) | 📂 여기를 보세요 (Controller) | 🛠️ 실제 작업하는 곳 (Service) |
| :--- | :---: | :--- | :--- |
| **공지 목록 보기** | **Read** | `NoticeController` (35번째 줄) | `NoticeService` (21번째 줄) |
| **공지 내용 보기** | **Read** | `NoticeController` (43번째 줄) | `NoticeService` (27번째 줄) |
| **(관리자) 공지 등록** | **Create** | `NoticeController` (65번째 줄) | `NoticeService` (41번째 줄) |
| **(관리자) 공지 삭제** | **Delete** | `NoticeController` (86번째 줄) | `NoticeService` (62번째 줄) |

---

## 3. 🎓 강좌 및 수강신청 (Course & Enrollment)
> 선생님이 강의를 만들고, 학생이 수강 신청하는 기능입니다.

| 내가 하고 싶은 것 | 기능(CRUD) | 📂 여기를 보세요 (Controller) | 🛠️ 실제 작업하는 곳 (Service) |
| :--- | :---: | :--- | :--- |
| **강좌 개설 신청**<br>(선생님) | **Create** | `CourseController` (110번째 줄) | `CourseService` (62번째 줄) |
| **전체 강좌 구경** | **Read** | `CourseController` (33번째 줄) | `CourseService` (39번째 줄) |
| **수강 신청 하기**<br>(학생) | **Create** | `CourseController` (190번째 줄)<br>또는 `EnrollmentController` (30번째 줄) | `CourseService` (119번째 줄)<br>또는 `EnrollmentService` (88번째 줄) |
| **내 수강 목록** | **Read** | `EnrollmentController` (64번째 줄) | `EnrollmentService` (74번째 줄) |
| **강좌 승인 하기**<br>(관리자) | **Update** | `CourseController` (248번째 줄) | `CourseService` (160번째 줄) |

---

## 4. 🧩 코딩 문제 풀이 (Problem)
> 문제를 풀고 채점받는 곳입니다.

| 내가 하고 싶은 것 | 기능(CRUD) | 📂 여기를 보세요 (Controller) | 🛠️ 실제 작업하는 곳 |
| :--- | :---: | :--- | :--- |
| **문제 목록 보기** | **Read** | `ProblemController` (27번째 줄) | (바로 DB에서 가져옴) |
| **문제 풀고 채점** | **Create** | `ProblemController` (55번째 줄) | `SubmissionService` (18번째 줄)<br>*(결과 저장)* |
| **내 풀이 기록** | **Read** | `SubmissionController` (26번째 줄) | (바로 DB에서 가져옴) |

---

## 5. 👤 회원 가입 (Users)
> 사이트에 가입하는 기능입니다.

| 내가 하고 싶은 것 | 기능(CRUD) | 📂 여기를 보세요 (Controller) | 🛠️ 실제 작업하는 곳 (Service) |
| :--- | :---: | :--- | :--- |
| **회원 가입** | **Create** | `UsersController` (24번째 줄) | `UsersService` (14번째 줄) |
