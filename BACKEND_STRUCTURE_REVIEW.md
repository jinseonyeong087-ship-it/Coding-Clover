# 🧭 백엔드 코드 상세 리뷰 가이드 (CRUD 중심)

이 문서는 **"이 코드가 도대체 무슨 일을 하는가?"**를 CRUD(생성·조회·수정·삭제) 관점에서 라인 단위로 뜯어보는 상세 해설서입니다.
코드 리뷰를 하거나, 로직을 이해하려 할 때 이 문서를 옆에 펴두고 보시면 됩니다.

---

## 🏗️ 1. 전체 구조의 핵심 역할
코드 리뷰 시 제일 먼저 "이 파일이 무슨 역할을 하는 놈인지" 알아야 합니다.

| 역할 | 설명 | 리뷰할 때 확인할 것 (Check Point) |
| :--- | :--- | :--- |
| **Controller** | **손님 응대 (API)** | "입력값이 제대로 들어왔나?", "권한은 있나?", "서비스한테 일 떠넘겼나?" |
| **Service** | **요리 (비즈니스 로직)** | "**본인 확인**(작성자 체크) 했나?", "데이터를 정확하게 가공했나?", "Transaction 걸었나?" |
| **Repository** | **창고 (DB 쿼리)** | "쿼리가 너무 복잡하지 않나?", "엉뚱한 데이터를 가져오지 않나?" |

---

## 🔍 2. 도메인별 코드 해부 (Deep Dive)

### 📢 2-1. 커뮤니티 게시판 (CommunityPost)
가장 표준적인 **게시글 작성(Create)** 로직을 예로 들어 분석합니다.

#### **[Create] 게시글 작성 흐름**
1.  **Controller (`CommunityPostController.java`)** - *입구컷 담당*
    *   **코드 위치**: `@PostMapping("/api/community/posts/new")` 근처
    *   **하는 일**:
        1.  `@Valid Body` 확인: 제목이 비었는지, 내용이 너무 짧은지 검사합니다. -> *위반 시 즉시 에러 리턴*
        2.  `Principal` 확인: "너 로그인 했어?" 체크 -> *없으면 401 에러*
        3.  `Service.create(...)` 호출: "문제없네? 서비스야 이거 저장해."

2.  **Service (`CommunityPostService.java`)** - *실무 담당*
    *   **코드 위치**: `public void create(...)` 메서드
    *   **하는 일**:
        1.  **엔티티 생성**: 텅 빈 `CommunityPost` 종이를 꺼냅니다.
        2.  **데이터 채우기**: Controller가 준 제목, 내용을 채워 넣습니다.
        3.  **작성자 박제**: 로그인한 유저 정보를 `setUser`로 쾅 찍습니다. **(중요: 누가 썼는지 기록)**
        4.  **초기 상태 설정**: `setStatus(VISIBLE)` (처음엔 다 보이게 설정).
        5.  `Repository.save()`: "DB에 넣어!" 하고 던집니다.

#### **[Delete] 게시글 삭제 (삭제 vs 숨김)**
*   **리뷰 포인트**: 
    1.  **진짜 지우나?**: 코드를 보면 `repository.delete()`가 아니라 `post.setStatus(HIDDEN)`을 씁니다. (Soft Delete)
    2.  **니가 쓴 거 맞냐?**: `if (!post.getUser().getLoginId().equals(loginId))` 이 코드가 없으면 남의 글을 지울 수 있는 **치명적 버그**가 됩니다. 꼭 확인하세요.

---

### 🎓 2-2. 강좌 (Course)
강좌는 **관리자 승인**이라는 특이한 절차가 있습니다.

#### **[Create] 강좌 개설 신청**
*   **상태 값 확인**: `Service`에서 강좌를 처음 만들 때 `ProposalStatus`를 뭘로 저장하는지 보세요.
    *   `PENDING` (대기 중)이어야 맞습니다. 만약 `APPROVED`로 바로 저장되면 강사가 승인 없이 강의를 파는 사고가 터집니다.

#### **[Update] 강좌 수정**
*   **권한 체크**: `CourseController`에서 `@PreAuthorize("hasRole('INSTRUCTOR')")`가 붙어있는지 확인하세요. 강사만 수정해야 합니다.
*   **본인 체크**: 역시 `Service` 로직 안에서 "강좌 개설자 ID == 현재 로그인한 ID" 검사 로직이 필수입니다.

---

### 🧩 2-3. 코딩 문제 (Problem & Submission)
여기는 구조가 약간 다릅니다. (Controller가 일을 좀 많이 함)

#### **[Submit] 코드 제출 및 채점**
*   **Controller (`ProblemController.java`)** 분석:
    *   보통의 컨트롤러와 다르게 여기서 **채점 로직(for문 돌면서 테스트케이스 비교)**을 직접 수행합니다.
    *   **작동 원리**:
        1.  DB에서 해당 문제의 `TestCase`(입력/정답 세트)를 다 가져옵니다.
        2.  사용자 코드를 `CodeExecutor`(별도 유틸)로 실행시킵니다.
        3.  `실행 결과` vs `정답` 문자열 비교 (`trim()`으로 공백 제거 후 비교).
        4.  다 맞으면 `PASS`, 하나라도 틀리면 `FAIL`.
        5.  마지막에 `SubmissionService`를 불러서 결과를 DB에 저장합니다.
*   **리뷰 포인트**: 
    *   "채점 로직이 컨트롤러에 있는 게 적절한가?" -> *장기적으로는 Service로 옮기는 게 좋습니다.* (나중에 비동기 채점 등으로 바뀔 수 있으므로)

---

### 👥 2-4. 수강 신청 (Enrollment)
중복 신청 방지가 핵심입니다.

#### **[Create] 수강 신청**
1.  **중복 체크 (`EnrollmentService.java`)**:
    *   `enrollmentRepository.existsByUserAndCourseAndStatus(...)`
    *   이 코드가 없으면 한 사람이 같은 강의를 100번 신청하는 버그가 생깁니다. 필수 체크 항목.

---

## ✅ 3. 코드 리뷰 체크리스트 (CRUD Action Plan)

리뷰(Review)할 때 눈에 불을 켜고 찾아야 할 **버그 유발 패턴**들입니다.

### � **"이러면 망한다"** 패턴 (반드시 수정 요청)
*   [ ] **Delete 메서드에 본인 확인이 없다.**
    *   -> "누구나 남의 데이터를 지울 수 있습니다. `Service`에 본인 확인 로직 추가해주세요."
*   [ ] **Password가 평문으로 저장된다.**
    *   -> `passwordEncoder.encode()` 안 쓰고 그냥 `setPw()` 했다면 즉시 중단.
*   [ ] **Entity를 통째로 Controller 밖으로 던진다.**
    *   -> `User` 엔티티를 그대로 리턴하면 비밀번호, 주민번호 다 나갑니다. `DTO`로 감싸세요.

### ⚠️ **"이러면 아쉽다"** 패턴 (개선 요청)
*   [ ] **Controller에서 Repository를 직접 부른다.**
    *   -> `ProblemController`처럼 급해서 바로 DB 부르는 경우. "Service 만들어서 거기로 이사시킵시다" 제안.
*   [ ] **반복되는 권한 체크**
    *   -> 매번 `if (admin)` 하기보다 메서드 위에 `@PreAuthorize` 어노테이션 쓰는 게 깔끔합니다.

---

## 4. 결론
이 문서를 보면서 **"데이터가 들어와서(Controller) -> 검증받고 가공돼서(Service) -> 저장되는(Repository)"** 흐름을 따라가 보세요. 
중간에 **"누구냐(권한)", "맞냐(유효성)", "진짜냐(본인확인)"** 이 세 가지 질문문 통과하면 좋은 코드입니다.
