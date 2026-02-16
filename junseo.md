# 🧑‍💻 준서(Junseo) 백엔드 시스템 심층 분석 (Deep Dive)

이 문서는 **준서(wnstj999)**님이 구현한 시스템의 **완전한 기술 명세**입니다. 단순한 요약이 아니라, **어떤 파일의 몇 번째 줄에서 어떤 코드가 실행되는지** 상세하게 분석하여, 면접이나 코드 리뷰 시 "이 코드는 이 줄에서 이렇게 동작합니다"라고 자신 있게 설명할 수 있도록 작성했습니다.

---

## 1. 📢 Notice (공지사항) 시스템 상세 분석

### 🎯 핵심 로직: 왜 서비스 단에서 필터링을 하나요?
보통은 SQL `WHERE` 절로 거르지만, 여기서는 **자바 Stream API 활용 능력**을 보여주기 위해 서비스 계층에서 로직을 처리했습니다. `HIDDEN`(작성 중) 상태인 글을 제외하고 `VISIBLE`(공개) 글만 걸러냅니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `NoticeService.java` (공지 필터링 로직)
> **위치**: `src/main/java/com/mysite/clover/Notice/NoticeService.java`

```java
20: @Transactional(readOnly = true)
21: public List<Notice> getVisibleNotices() {
22:     // [Step 1] DB에서 일단 모든 공지사항을 가져옵니다.
23:     List<Notice> all = noticeRepository.findAllByOrderByCreatedAtDesc();
24: 
25:     // [Step 2] 자바 8 Stream API를 사용하여 'VISIBLE' 상태인 것만 메모리에서 필터링합니다.
26:     List<Notice> visible = all.stream()
27:             .filter(notice -> {
28:                 // 디버깅을 위해 로그를 출력하고 true/false를 반환합니다.
29:                 return notice.getStatus() == NoticeStatus.VISIBLE;
30:             })
31:             .toList();
32:     
33:     return visible;
34: }
```
*   **Line 23**: `noticeRepository.findAll...`로 DB의 모든 데이터를 조회합니다.
*   **Line 26-31**: **핵심 로직**입니다. `.filter()` 메서드 안에서 `getStatus() == VISIBLE` 조건을 검사하여, 참인 요소만 리스트로 다시 수집(`toList`)합니다.

---

## 2. ❓ QnA & Notification (질문 및 알림) 상세 분석

### 🎯 핵심 로직: 서비스 간의 책임 분리
질문을 저장하는 `QnaService`가 알림을 전송하는 로직까지 구구절절 가지고 있으면 코드가 지저분해집니다. 따라서 **"질문 저장"**과 **"알림 전송"**을 명확히 분리하고, 필요한 시점에 **메서드 호출**로 연결했습니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `QnaService.java` (질문 등록 및 알림 트리거)
> **위치**: `src/main/java/com/mysite/clover/Qna/QnaService.java`

```java
43: @Transactional
44: public void create(String title, String question, Users users, Course course) {
45:     // [Step 1] 질문 엔티티 생성 및 데이터 세팅
46:     Qna q = new Qna();
47:     q.setTitle(title);
        // ... (중략)
52:     qnaRepository.save(q); // DB에 질문 저장 (Insert)
53: 
54:     // [Step 2] 저장이 완료되면 즉시 NotificationService를 호출합니다. (이벤트 발생)
55:     notificationService.createNotification(
56:         course.getCreatedBy(), // 수신자: 강좌 개설자(강사)
57:         "NEW_QNA_QUESTION",    // 알림 타입
58:         "'" + course.getTitle() + "' 강좌에 새로운 질문이..." // 내용
59:         "/instructor/qna/" + q.getQnaId() // 클릭 시 이동할 링크
60:     );
61: }
```
*   **Line 52**: 먼저 질문을 DB에 커밋합니다. 질문 ID가 생성되어야 알림 링크를 만들 수 있기 때문입니다.
*   **Line 55**: 다른 서비스인 `NotificationService`의 메서드를 호출하여 책임을 넘깁니다.

#### 2️⃣ `NotificationService.java` (알림 실제 생성)
> **위치**: `src/main/java/com/mysite/clover/Notification/NotificationService.java`

```java
21: public void createNotification(Users user, String type, String title, String linkUrl) {
22:     Notification notification = new Notification();
23:     notification.setUser(user); // 알림 받을 사람
24:     notification.setType(type); // 알림 종류
        // ...
28:     notificationRepository.save(notification); // 알림 테이블에 저장
29: }
```
*   **Line 21-29**: 이 메서드는 **누가 호출했는지 신경 쓰지 않습니다.** 오직 알림 데이터를 받아서 DB에 저장하는 역할만 수행합니다. 재사용성이 높습니다.

---

## 3. 🔐 Users (인증) - Custom JSON Login 상세 분석

### 🎯 핵심 로직: SPA(React)를 위한 JSON 통신
Spring Security의 기본 `UsernamePasswordAuthenticationFilter`는 `x-www-form-urlencoded` 방식만 처리하고, 로그인 성공 시 리다이렉트를 수행합니다. 우리는 **JSON (`application/json`)**으로 ID/PW를 받고, **JSON으로 응답**해야 하므로 필터와 핸들러를 커스터마이징했습니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `ApiLoginFilter.java` (JSON 요청 가로채기)
> **위치**: `src/main/java/com/mysite/clover/Users/ApiLoginFilter.java`

```java
41: Map<String, String> loginData = objectMapper.readValue(request.getInputStream(),
42:     new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
43: 
45: String loginId = loginData.get("loginId");
46: String password = loginData.get("password");
52: UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(loginId, password);
```
*   **Line 41**: `request.getParameter()` 대신 `request.getInputStream()`을 통해 HTTP Body의 원본 데이터를 읽어옵니다. Jackson(`objectMapper`)을 사용해 JSON을 Map으로 변환합니다.
*   **Line 52**: 추출한 ID/PW로 인증 토큰을 만들어서 매니저에게 넘깁니다.

#### 2️⃣ `ApiLoginSuccess.java` (JSON 응답 보내기)
> **위치**: `src/main/java/com/mysite/clover/Users/ApiLoginSuccess.java`

```java
36: Map<String, Object> responseData = Map.of(
37:     "message", "로그인 성공",
38:     "userId", user.getUserId(),
        // ...
43:     "status", user.getStatus());
44: 
45: objectMapper.writeValue(response.getWriter(), responseData);
```
*   **Line 36-43**: 프론트엔드가 필요한 사용자 정보를 `Map`에 담습니다.
*   **Line 45**: `response.sendRedirect(...)`를 하지 않고, `response.getWriter()`에 직접 JSON 문자열을 써서 응답합니다. 이를 통해 페이지 새로고침 없는 로그인이 가능합니다.

---

## 4. 💻 Problem & Executor (코딩 테스트 엔진) 상세 분석 🔥

### 🎯 핵심 로직: 격리된 샌드박스 (Sandbox)
사용자 코드를 메인 서버 프로세스에서 직접 실행하면 위험합니다. 따라서 **'파일 생성 -> 프로세스 분리 -> 타임아웃 감시'**의 3단계 안전장치를 `JavaNativeExecutor`에 구현했습니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `ProblemController.java` (실행 요청)
> **위치**: `src/main/java/com/mysite/clover/Problem/ProblemController.java`

```java
79: ExecutionResponse response = codeExecutor.run(request);
```
*   **Line 79**: 컨트롤러는 복잡한 실행 과정을 모릅니다. 단지 `request`(코드)를 주고 `response`(결과)를 받을 뿐입니다.

#### 2️⃣ `JavaNativeExecutor.java` (실행 엔진)
> **위치**: `src/main/java/com/mysite/clover/Problem/JavaNativeExecutor.java`

```java
23: try {
24:   // [Step 1] 격리: 임시 폴더 생성
25:   tempDir = Files.createTempDirectory("java-exec-");
26: 
27:   // [Step 2] 파일화: 메모리의 코드를 main.java 파일로 저장
28:   File sourceFile = new File(tempDir.toFile(), "main.java");
30:   Files.write(sourceFile.toPath(), request.getCode().getBytes(StandardCharsets.UTF_8));
31: 
33:   // [Step 3] 컴파일: javac 명령 실행
34:   ProcessBuilder compileBuilder = new ProcessBuilder("javac", "-encoding", "UTF-8", sourceFile.getAbsolutePath());
35:   Process compileProcess = compileBuilder.start();
37:   boolean compiled = compileProcess.waitFor(5, TimeUnit.SECONDS); // 5초 컴파일 제한
53: 
57:   // [Step 4] 실행: java 명령 실행
58:   ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", "main");
59:   Process runProcess = runBuilder.start();
60: 
74:   // [Step 5] 감시: 10초 타임아웃 (무한루프 방지)
75:   boolean finished = runProcess.waitFor(10, TimeUnit.SECONDS);
76: 
77:   if (!finished) {
78:     runProcess.destroyForcibly(); // [중요] 시간 초과 시 강제 종료
79:     return ExecutionResponse.builder().error("시간 초과 (10초)").build();
80:   }
```
*   **Line 25**: `java-exec-293848` 같은 랜덤 이름의 폴더를 만듭니다. 동시 접속자가 있어도 파일이 섞이지 않습니다.
*   **Line 57-59**: `ProcessBuilder`를 통해 JVM을 새로 띄웁니다.
*   **Line 74**: 이 줄이 핵심입니다. 코드가 끝날 때까지 무작정 기다리지 않고, **최대 10초까지만** 기다립니다.

---

## 5. 💳 Payment (결제) 상세 분석

### 🎯 핵심 로직: 트랜잭션과 교차 검증
결제는 돈이 오가는 민감한 기능입니다. **(1) 토스 서버 검증 (2) 포인트 지급 (3) 기록 저장** 이 세 가지가 한 치의 오차도 없이 동시에 성공하거나, 동시에 실패해야 합니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `PaymentService.java` (토스 검증)
> **위치**: `src/main/java/com/mysite/clover/Payment/PaymentService.java`

```java
65: @Transactional
66: public Payment confirmPayment(String orderId, String paymentKey, Integer amount, Long userId) {
67:     
68:     // [Step 1] 토스 서버에 승인 요청 (검증)
69:     confirmTossPayment(paymentKey, orderId, amount);
70: 
71:     // ... 유저 확인 ...
76:     Payment payment = new Payment();
        // ... 데이터 세팅 ...
85:     Payment savedPayment = paymentRepository.save(payment); // 결제 기록 저장
87:     return savedPayment;
88: }
```
*   **Line 69**: `confirmTossPayment` 내부에서 `RestTemplate`으로 토스 API를 호출합니다. 여기서 예외가 터지면(`throw Exception`) 아래 로직은 실행되지 않고 롤백됩니다.

#### 2️⃣ `WalletIntegrationService.java` (포인트 지급 트랜잭션)
> **위치**: `src/main/java/com/mysite/clover/UserWallet/WalletIntegrationService.java`

```java
19: @Transactional
20: public UserWallet chargePoints(Long userId, Integer amount, Long paymentId) {
21:     // [Step 2] 사용자 지갑 잔액 증가 (UPDATE)
22:     UserWallet wallet = userWalletService.chargePoints(userId, amount);
23:     
24:     // [Step 3] 충전 내역 히스토리 저장 (INSERT)
25:     walletHistoryService.recordCharge(userId, amount, paymentId);
26:     
27:     return wallet;
28: }
```
*   **Line 19**: `@Transactional`이 선언되어 있어, Line 22가 성공하고 Line 25가 실패하면 Line 22의 잔액 증가도 **자동으로 취소(Rollback)** 됩니다. 데이터 무결성의 핵심입니다.

---

## 6. 🧠 AI Problem Generator (자동 출제) 상세 분석

### 🎯 핵심 로직: 시스템 프롬프트 엔지니어링
AI는 지시 사항이 구체적일수록 좋은 결과를 냅니다. 프론트엔드에서 **"JSON 포맷을 지켜라"**, **"Scanner 쓰지 마라"**, **"클래스명은 main으로 해라"** 등의 강력한 제약 조건을 문자열로 조합하여 백엔드로 보냅니다.

### 📂 코드 워크스루 (Code Walkthrough)

#### 1️⃣ `CodingTestCreate.jsx` (프롬프트 조립)
> **위치**: `frontend/src/pages/coding/CodingTestCreate.jsx`

```javascript
134: const systemPrompt = `
135:   당신은 알고리즘 문제 출제 전문가입니다. 다음 조건에 맞춰 Java 코딩 테스트 문제를 하나 만들어주세요.
136:   ...
144:   1. Scanner나 BufferedReader 같은 입력 클래스를 사용하지 마십시오.
145:   2. 테스트에 필요한 입력값은 main 메서드 내부에 변수로 직접 선언(하드코딩)하십시오.
150:   [JSON 응답 형식 (엄격 준수)]
151:   {
152:     "title": "문제 제목",
154:     "baseCode": "...",
155:     "expectedOutput": "..."
156:   }
157: `;
```
*   **Line 134-157**: 여기가 AI의 뇌를 제어하는 부분입니다. 특히 **Line 150-156**에서 JSON 스키마를 예시로 명확히 보여주어 파싱 가능한 응답을 유도했습니다.

#### 2️⃣ `ChatController.java` (AI 호출 게이트웨이)
> **위치**: `src/main/java/com/mysite/clover/ChatBot/ChatController.java`

```java
19: @GetMapping("/ask")
20: public ChatDto ask(@RequestParam(value="message") String message) {
23:     String Chatanswer = chatClient.prompt()
24:         .user(message)
25:         .call()
26:         .content();
28:     return new ChatDto(Chatanswer);
```
*   **Line 23-26**: Spring AI의 `ChatClient`를 체이닝 메서드(`prompt().user().call().content()`)로 호출하여 간결하게 통신합니다. 백엔드는 내용을 해석하지 않고 토스만 합니다.
