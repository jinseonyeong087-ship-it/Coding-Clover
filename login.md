# 로그인 프로세스 및 세션/쿠키 처리 흐름

이 문서는 React 프론트엔드와 Spring Boot 백엔드(Spring Security) 간의 로그인 처리 과정, 파일 간 이동 경로, 그리고 세션 쿠키(`JSESSIONID`)가 생성되고 전달되는 흐름을 설명합니다.

---

## 📌 전체 흐름도 (Flowchart)

1. **Client (React)**: 로그인 요청 (`POST /auth/login`)
2. **Server (SecurityConfig)**: 필터 체인 진입
3. **Filter (ApiLoginFilter)**: 요청 가로채기 및 ID/PW 추출
4. **Service (UsersSecurityService)**: DB 조회 및 검증
5. **Success Handler (ApiLoginSuccess)**: 로그인 성공 처리 & 응답 전송
6. **Auto-Magic**: 세션 생성 및 쿠키(`JSESSIONID`) 발급

---

## 📂 단계별 상세 설명

### 1. 요청 시작 (Frontend)
- **위치**: React 로그인 컴포넌트
- **행동**: 사용자가 로그인 버튼 클릭.
- **통신**:
  ```http
  POST /auth/login
  Content-Type: application/json
  Body: { "loginId": "user123", "password": "password123" }
  ```

### 2. 보안 설정 진입 (SecurityConfig.java)
- **역할**: 문지기 (모든 요청의 진입점)
- **로직**:
  - `filterChain` 메서드 내에서 URL 패턴 등을 검사합니다.
  - `.addFilterBefore(apiLoginFilter(), ...)` 설정에 의해 로그인 요청을 `ApiLoginFilter`로 전달합니다.

### 3. 인증 필터 (ApiLoginFilter.java)
- **역할**: 검문소 (데이터 추출 및 인증 위임)
- **메서드**: `attemptAuthentication`
- **동작**:
  1. 요청 본문(JSON)을 읽어 `loginId`와 `password`를 파싱합니다.
  2. `UsernamePasswordAuthenticationToken`을 생성합니다.
  3. `getAuthenticationManager().authenticate(token)`을 호출하여 실제 인증을 요청합니다.

### 4. 사용자 조회 (UsersSecurityService.java)
- **역할**: 신원 조회 (DB 확인)
- **메서드**: `loadUserByUsername`
- **동작**:
  1. `UsersRepository`를 통해 DB에서 `loginId`로 회원을 조회합니다.
  2. 회원이 존재하면 비밀번호(암호화된 값)를 대조합니다.
  3. 일치할 경우, 사용자 정보와 권한(Role)이 담긴 `UserDetails` 객체를 반환합니다.

### 5. 세션 생성 및 쿠키 발급 (핵심!)
- **일어나는 곳**: 인증 성공 직후, 프레임워크 내부 처리
- **설정 파일**: `SecurityConfig.java`
- **관련 코드**:
  ```java
  filter.setSecurityContextRepository(
      new HttpSessionSecurityContextRepository()
  );
  ```
- **매커니즘**:
  1. 인증이 성공하면 서버는 **메모리(HttpSession)**에 사용자 인증 정보(Context)를 저장합니다.
  2. 이 세션을 식별할 수 있는 고유 ID (**JSESSIONID**)를 생성합니다.
  3. **자동으로** HTTP 응답 헤더에 쿠키 설정 명령을 포함시킵니다.
  - **Header**: `Set-Cookie: JSESSIONID=A1B2C3D4...; Path=/; HttpOnly`

### 6. 성공 응답 (ApiLoginSuccess.java)
- **역할**: 최종 응답 (클라이언트에게 알림)
- **메서드**: `onAuthenticationSuccess`
- **동작**:
  - `ObjectMapper`를 사용하여 JSON 응답을 작성합니다.
  - 예: `{ "message": "로그인 성공", "role": "STUDENT" }`
  - 상태 코드 `200 OK`를 반환합니다.

### 7. 클라이언트 처리 (Browser)
- **동작**:
  1. `200 OK` 응답을 받으면 로그인 성공으로 간주하고 페이지를 이동합니다.
  2. **(중요)** 브라우저는 응답 헤더의 `Set-Cookie`를 보고, **`JSESSIONID` 쿠키를 브라우저 저장소에 자동으로 저장**합니다.
  3. 이후 발생하는 모든 API 요청에 브라우저가 알아서 이 쿠키를 헤더에 실어 보냅니다.
