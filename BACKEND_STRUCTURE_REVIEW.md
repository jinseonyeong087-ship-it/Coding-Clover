# 백엔드 구조 및 코드 리뷰 가이드

이 문서는 `Coding-Clover` 프로젝트의 백엔드 구조를 분석하고, 효과적인 코드 리뷰를 진행하기 위한 가이드를 제공합니다.

## 1. 프로젝트 개요 (Overview)

*   **Framework**: Spring Boot
*   **Language**: Java
*   **Build Tool**: Gradle
*   **Root Package**: `com.mysite.clover`

## 2. 패키지 구조 (Package Structure)

이 프로젝트는 **기능(Feature) 기반 패키징** 구조를 따르고 있습니다. 각 기능별로 Controller, Service, Repository, Entity가 하나의 패키지 내에 모여 있어, 관련 코드의 응집도가 높습니다.

### 주요 패키지 목록

| 패키지명 (Feature) | 설명 | 주요 포함 파일 예시 |
| :--- | :--- | :--- |
| **Users** | 사용자 인증 및 관리 | `UsersController`, `UsersService`, `UsersRepository`, `UsersSecurityService` |
| **Course** | 강의/코스 관리 | `CourseController`, `CourseService`, `CourseRepository`, `Course` |
| **Lecture** | 세부 강의 콘텐츠 관리 | `LectureController`, `LectureService` |
| **Problem** | 문제 은행 및 풀이 | `ProblemController`, `ProblemService` |
| **Submission** | 코드 제출 및 결과 | `Submission` 관련 로직 |
| **Exam** | 시험 관리 | `Exam` 관련 로직 |
| **Enrollment** | 수강 신청 관리 | `Enrollment` 관련 로직 |
| **CommunityPost** | 커뮤니티 게시글 | 게시판 기능 |
| **Qna** / **QnaAnswer** | 질문 및 답변 | Q&A 기능 |
| **AdminProfile** / **InstructorProfile** / **StudentProfile** | 프로필 관리 | 각 역할별 프로필 상세 |

### 공통 설정 및 유틸리티

*   `SecurityConfig.java`: Spring Security 설정 (인증/인가).
*   `WebConfig.java`: Web MVC 설정 (CORS 등).
*   `CodingcloverApplication.java`: 메인 클래스.
*   `DataNotFoundException.java`: 공통 예외 처리.

---

## 3. 핵심 비즈니스 로직 흐름 (Execution Flows)

주요 기능의 실행 흐름과 데이터 이동 경로를 상세히 기술합니다.

### A. 회원가입 (User Signup)

이 흐름은 새로운 사용자가 시스템에 등록하는 과정입니다.

1.  **Request `POST /auth/register`**
    *   **도착지**: `UsersController.signup(@RequestBody Map<String, String> userMap)`
    *   **입력값**: JSON 형태의 사용자 정보 (`loginId`, `password`, `name`, `email`, `role` 등)가 `userMap`으로 전달됩니다.
2.  **Controller 처리**
    *   `UsersController`에서 1차 검증(비밀번호 일치 확인)을 수행합니다.
    *   문제가 없으면 `UsersService.create(...)` 메서드를 호출하여 비즈니스 로직을 위임합니다.
3.  **Service 처리 (`UsersService`)**
    *   `create` 메서드에서 새로운 `Users` 엔티티 객체를 생성합니다.
    *   **비밀번호 암호화**: `passwordEncoder`를 사용하여 평문 비밀번호를 암호화하여 저장합니다.
    *   **역할/상태 설정**: 요청받은 `role`에 따라 초기 권한(`STUDENT`, `INSTRUCTOR`, `ADMIN`)과 상태(`ACTIVE`, `SUSPENDED`)를 구분하여 설정합니다. (예: 강사는 승인 대기 상태로 시작)
    *   `UsersRepository.save(user)`를 호출하여 DB에 저장합니다.
4.  **Database**
    *   `UsersRepository` (JPA)가 실제로 DB에 `INSERT` 쿼리를 실행합니다.
5.  **Response**
    *   성공 시: `HTTP 200 OK`와 성공 메시지 JSON 반환.
    *   실패 시(중복 ID 등): `HTTP 400 Bad Request`와 에러 메시지 반환.

### B. 강좌 생성 (Create Course) - 강사 전용

강사가 새로운 강좌 개설을 요청하는 흐름입니다.

1.  **Request `POST /instructor/course/new`**
    *   **도착지**: `CourseController.createCourse(...)`
    *   **권한 체크**: `@PreAuthorize("hasRole('INSTRUCTOR')")`에 의해 강사 권한이 없는 요청은 Spring Security 단계에서 차단(`403 Forbidden`)됩니다.
    *   **입력값**: `CourseCreateRequest` DTO로 매핑되어 제목, 설명, 가격 등을 받습니다. `@Valid` 어노테이션에 의해 유효성 검사가 먼저 실행됩니다.
2.  **Controller 처리**
    *   유효성 검사 에러(`BindingResult`) 발생 시 즉시 에러 응답을 보냅니다.
    *   `Principal` 객체에서 현재 로그인한 강사의 ID를 추출합니다.
    *   `UsersRepository`를 통해 실제 강사 유저 엔티티를 조회합니다.
    *   `CourseService.create(...)`를 호출하여 생성 로직을 수행합니다.
3.  **Service 처리 (`CourseService`)**
    *   `create` 메서드는 `@Transactional`로 묶여 있어 원자성이 보장됩니다.
    *   `Course` 엔티티를 생성하고 DTO 값들을 매핑합니다.
    *   초기 승인 상태는 `PENDING`(승인 대기)으로 설정됩니다.
    *   `CourseRepository.save(course)`를 통해 DB에 저장합니다.
4.  **Response**
    *   정상 처리 시 문자열 메시지("강좌 개설 신청이 완료되었습니다.")를 반환합니다.

### C. 강좌 목록 조회 (Get Courses) - 역할별 분기

사용자의 역할에 따라 다른 데이터를 조회하는 흐름입니다.

1.  **Request**
    *   전체 공개 강좌: `GET /course`
    *   관리자 전체 조회: `GET /admin/course`
    *   강사 본인 강좌: `GET /instructor/course`
2.  **Controller 처리 (`CourseController`)**
    *   요청 엔드포인트에 따라 다른 메서드가 실행됩니다.
    *   **DTO 변환**: 조회 결과인 `Course` 엔티티는 그대로 반환되지 않고, 목적에 맞는 DTO(`StudentCourseDto`, `AdminCourseDto`, `InstructorCourseDto`)로 변환됩니다. 이는 보안상 중요 정보 노출을 막고 필요한 데이터만 전달하기 위함입니다.
3.  **Service 처리 (`CourseService`)**
    *   `getPublicList()`: `ProposalStatus.APPROVED`인 강좌만 조회.
    *   `getList()` (관리자용): 모든 상태의 강좌 조회.
    *   `getInstructorList(user)`: 해당 유저가 생성한 강좌만 조회.
4.  **Database**
    *   `CourseRepository`에서 조건에 맞는 `SELECT` 쿼리(JPA Query Method)가 실행됩니다.

---

## 4. 코드 리뷰 체크리스트 (Code Review Checklist)

코드 리뷰 시 다음 항목들을 중점적으로 확인합니다.

### A. 아키텍처 및 계층 분리 (Architecture & Layers)
- [ ] **Controller**: 요청 처리에만 집중하고 있는가? 비즈니스 로직이 Service로 적절히 위임되었는가?
- [ ] **Service**: 트랜잭션(`@Transactional`) 관리가 적절한가? 비즈니스 로직이 명확한가?
- [ ] **Repository**: DB 접근 로직만 포함하는가? 복잡한 쿼리는 별도로 관리되는가?
- [ ] **DTO 사용**: Entity가 Controller에서 직접 반환되지 않고, DTO를 통해 데이터가 전달되는가? (`Course` 패키지에는 `dto` 폴더가 존재함, 다른 패키지도 확인 필요)

### B. REST API 디자인 (REST API Design)
- [ ] **URI 네이밍**: 리소스 중심의 URL 설계가 되었는가? (예: `/api/courses` vs `/api/getCourse`)
- [ ] **HTTP Method**: GET, POST, PUT, DELETE가 용도에 맞게 사용되었는가?
- [ ] **Status Code**: 성공/실패 시 적절한 HTTP 상태 코드를 반환하는가?

### C. 데이터베이스 및 성능 (Database & Performance)
- [ ] **N+1 문제**: 연관 관계 조회 시 불필요한 쿼리가 발생하지 않는가? (Lazy Loading 및 Fetch Join 확인)
- [ ] **인덱싱**: 검색 조건에 자주 사용되는 컬럼에 인덱스가 고려되었는가?

### D. 보안 (Security)
- [ ] **권한 체크**: `@PreAuthorize` 등을 통해 API별 접근 권한이 올바르게 제어되는가?
- [ ] **입력 검증**: 사용자 입력 값에 대한 유효성 검사(Validation)가 수행되는가?

### E. 코드 스타일 및 품질 (Code Quality)
- [ ] **네이밍 컨벤션**: 클래스, 메서드, 변수명이 명확하고 일관성 있는가?
- [ ] **중복 코드**: 동일한 로직이 여러 곳에 흩어져 있지 않은가?

---

## 5. 상세 모듈 분석 (Deep Dive)

### `Users` 모듈
*   **보안 통합**: `UsersSecurityService`, `ApiLoginFilter` 등이 존재하여 Spring Security와 밀접하게 연동됨.
*   **리뷰 포인트**: JWT 또는 세션 기반 인증 흐름이 올바른지, 비밀번호 암호화가 적용되었는지 확인.

### `Course` 모듈
*   **구조**: `dto` 패키지가 분리되어 있어 데이터 전송 객체 관리가 잘 되고 있는지 확인 필요.
*   **리뷰 포인트**: 강의 생성 시 `Instructor`와의 연관 관계 설정 로직 확인.

### `Problem` & `Submission` 모듈
*   **핵심 로직**: 코딩 테스트 플랫폼의 핵심인 채점 로직이나 문제 출제 로직이 포함될 것으로 예상.
*   **리뷰 포인트**: 채점 프로세스의 효율성 및 동시성 처리 고려 여부.

---

이 문서를 바탕으로 Pull Request 생성 시 또는 정기 코드 리뷰 시 활용하시기 바랍니다.
