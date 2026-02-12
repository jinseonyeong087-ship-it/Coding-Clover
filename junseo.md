# 🧑‍💻 준서(Junseo) 백엔드 모듈별 구조 상세 분석

이 문서는 각 기능 모듈이 **어떤 클래스로 구성되어 있고**, **데이터가 어떻게 흐르며**, **핵심 로직이 어디에 있는지** 코드를 보지 않고도 머릿속에 그려질 수 있도록 구조 위주로 설명합니다.

---

## 1. 📢 Notice (공지사항) 구조

### 🏗️ 구성 요소
*   **Controller**: `NoticeController`
*   **Service**: `NoticeService`
*   **Repository**: `NoticeRepository`
*   **Entity**: `Notice`
*   **Enum**: `NoticeStatus` (VISIBLE / HIDDEN)

### 🔄 데이터 흐름 & 로직
1.  **조회 (Read)**:
    *   사용자가 공지 목록 요청 -> `Controller`가 `Service.getVisibleNotices()` 호출.
    *   `Service`는 DB에서 전체 조회 후, 자바 Stream API를 이용해 `status == VISIBLE`인 것만 필터링하여 반환.
2.  **작성 (Create - 관리자)**:
    *   `Controller` -> `Service.create()` 호출.
    *   DTO 없이 파라미터(`title`, `content`)를 받아 `Notice` 엔티티 생성 후 `Repository.save()`.

### 💡 면접 포인트
*   "왜 쿼리 메소드(`findByStatus`) 대신 전체 조회 후 필터링했나요?" -> "JPA 메서드 호환성 유지와 애플리케이션 레벨에서의 유연한 필터링 제어를 위함입니다."

---

## 2. ❓ QnA & Answer (질문과 답변) 구조

### 🏗️ 구성 요소
*   **QnA (질문)**: `QnaController`, `QnaService`, `QnaRepository`, `Qna` (Entity)
*   **Answer (답변)**: `QnaAnswerService`, `QnaAnswerRepository`, `QnaAnswer` (Entity)
*   **DTO**: `QnaDto` (질문+답변 포함)

### 🔄 데이터 흐름 & 로직
1.  **질문 등록**:
    *   `QnaService.create()` 실행 시 `NotificationService`를 호출하여 강사에게 **실시간 알림** 생성.
2.  **답변 등록**:
    *   강사가 답변 등록 -> `QnaAnswerService.create()` -> `Qna` 엔티티의 상태를 `ANSWERED`로 변경 (Dirty Checking).
3.  **조회 (상세)**:
    *   `QnaController`가 `QnaService`를 통해 질문을 가져오고, 해당 질문에 달린 답변들을 `QnaAnswerRepository`에서 별도로 조회하거나 연관관계로 가져와 `QnaDto`에 담아 반환.

### 💡 면접 포인트
*   "질문과 답변을 분리한 이유는?" -> "답변이 여러 개 달릴 수 있는 구조(1:N)를 유연하게 지원하고, 답변 채택 등 확장성을 고려했습니다."

---

## 3. 🔐 Users (회원 및 인증) 구조

### 🏗️ 구성 요소
*   **Controller**: `UsersController`
*   **Service**: `UsersService` (비즈니스 로직), `UsersSecurityService` (Spring Security 연동), `SocialLoginService` (OAuth2)
*   **Security**: `SecurityConfig`, `ApiLoginFilter`, `ApiLoginSuccess/Fail`

### 🔄 데이터 흐름 & 로직
1.  **일반 로그인**:
    *   요청(JSON) -> `ApiLoginFilter` (가로챔) -> `ObjectMapper` 파싱 -> `AuthenticationManager` 인증 시도 -> 성공 시 `ApiLoginSuccessHandler` 실행 (세션 생성 및 JSON 응답).
2.  **소셜 로그인**:
    *   OAuth2 인증 리다이렉트 -> `SocialLoginService.loadUser()` -> 제공자(Google/Kakao/Naver)별 속성 파싱 -> 이메일 기준으로 DB 조회 (없으면 자동 회원가입) -> 세션 생성.

---

## 4. 💻 Problem & Submission (코딩 테스트) 구조

### 🏗️ 구성 요소
*   **Core**: `ProblemController`, `CodeExecutor` (Interface), `JavaNativeExecutor` (Impl)
*   **Data**: `Problem` (문제 정보), `Submission` (제출 이력)
*   **DTO**: `ExecutionRequest` (코드, 입력), `ExecutionResponse` (출력, 에러, 시간), `GradingResult`

### 🔄 데이터 흐름 & 로직
1.  **코드 실행 요청**:
    *   `ProblemController` -> `JavaNativeExecutor.run()` 호출.
2.  **격리 실행 (Executor)**:
    *   `Files.createTempDirectory` (임시 폴더) -> `Main.java` 생성 -> `ProcessBuilder("javac")` -> `ProcessBuilder("java")` -> `Output/Error Stream` 캡처 -> `폴더 삭제`.
3.  **채점 및 저장**:
    *   실행 결과(`output`)와 문제의 정답(`expectedOutput`)을 문자열 비교.
    *   회원인 경우 `SubmissionService`를 통해 DB에 결과(`PASS`/`FAIL`), 코드, 실행 시간 저장.

---

## 5. 💳 Payment & Wallet (결제 및 지갑) 구조

### 🏗️ 구성 요소
*   **Controller**: `PaymentController`, `WalletController`
*   **Service**:
    *   `PaymentService` (토스 API, 환불 로직)
    *   `UserWalletService` (잔액 CRUD)
    *   `WalletHistoryService` (로그 기록)
    *   `WalletIntegrationService` (트랜잭션 통합)

### 🔄 데이터 흐름 & 로직
1.  **포인트 충전**:
    *   `PaymentController` -> `PaymentService.chargePoints()` (PG사 검증) -> `WalletIntegrationService.chargePoints()` (트랜잭션 시작)
    *   -> `UserWallet` 잔액 증가 (+) -> `WalletHistory` 기록 (CHARGE) -> `Payment` 기록 (PAID).
2.  **수강 신청 (포인트 사용)**:
    *   `WalletIntegrationService.usePoints()` 호출
    *   -> 잔액 확인 -> `UserWallet` 잔액 차감 (-) -> `WalletHistory` 기록 (USE).
3.  **환불**:
    *   `PaymentService.processDirectRefund()`
    *   -> `UserWallet` 잔액 복구 (+) -> `Notification` 알림 전송.

---

## 6. 🤖 ChatBot (AI 챗봇) 구조

### 🏗️ 구성 요소
*   **Controller**: `ChatController`
*   **Config**: `ChatConfig`
*   **Client**: `Spring AI ChatClient`

### 🔄 데이터 흐름 & 로직
1.  **초기화**: `ChatConfig`에서 시스템 프롬프트("너는 시니어 개발자다...")를 주입한 `ChatClient` 빈 생성.
2.  **요청**: `ChatController`에서 사용자 메시지 수신 -> `ChatClient.prompt().user(msg).call()` -> AI 응답 반환.
3.  **예외 처리**: `try-catch`로 감싸 AI 서버 오류 시에도 정해진 JSON 포맷(`ChatDto`)으로 에러 메시지 반환하여 프론트엔드 멈춤 방지.

---

## 7. 📧 Mail (이메일) 구조

### 🏗️ 구성 요소
*   **Controller**: `MailController`
*   **Service**: `MailService`
*   **Lib**: `JavaMailSender`

### 🔄 데이터 흐름 & 로직
1.  **인증 요청**:
    *   `MailService`에서 6자리 난수 생성.
    *   `MimeMessageHelper`로 HTML 본문 생성 후 발송.
2.  **검증**:
    *   생성된 난수를 DB가 아닌 `HttpSession`("emailAuthNumber")에 저장.
    *   사용자 입력값과 세션값을 비교하여 인증 처리 (Stateless한 REST API임에도 인증의 편의를 위해 세션 활용).

---

## 8. 🖼️ Image (이미지) 구조

### 🏗️ 구성 요소
*   **Service**: `ImageService`
*   **Lib**: `S3Template` (AWS), `Thumbnailator` (이미지 처리)

### 🔄 데이터 흐름 & 로직
1.  **업로드 요청**: `MultipartFile` 수신.
2.  **가공 및 저장**:
    *   (1) 원본: `UUID` 파일명 생성 -> S3 `original/` 폴더에 업로드.
    *   (2) 썸네일: `Thumbnailator`로 메모리 상에서 리사이징 -> S3 `thumb/` 폴더에 업로드.
3.  **반환**: 원본 URL과 썸네일 URL을 Map으로 반환.

---

## 9. 🔔 Notification (알림) 구조

### 🏗️ 구성 요소
*   **Service**: `NotificationService`
*   **Entity**: `Notification`

### 🔄 데이터 흐름 & 로직
*   **트리거 방식**: 별도의 Controller 요청보다는 다른 Service(`QnaService`, `PaymentService`)에서 이벤트 발생 시 `NotificationService.createNotification()`을 메서드 호출(Method Call) 방식으로 실행.
*   **조회**: 사용자는 `getNotificationsByUser`를 통해 본인의 **최근 7일간** 알림만 조회 (DB 부하 방지).
