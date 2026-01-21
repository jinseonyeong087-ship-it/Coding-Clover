# 📌 코딩 학습 LMS URL 구조 설계

## 🟦 공통 영역 (비로그인 / 로그인 공통)
/                      → 홈
/course                → 강좌 목록
/course/level/1        → 초급 강좌
/course/level/2        → 중급 강좌
/course/level/3        → 고급 강좌

/community              → 커뮤니티
/community/posts        → 게시글 목록
/community/posts/{id}   → 게시글 상세

/notice                → 공지사항
/notice/{id}           → 공지 상세

/auth/login             → 로그인
/auth/register          → 회원가입
/auth/oauth             → 소셜 로그인
/mypage            → 설정
/mypage/profile    → 회원 정보 수정
/mypage/password   → 비밀번호 변경


## 🟩 수강생 영역

(로그인 + 수강생 권한 필요)

/student/dashboard      → 수강생 대시보드

/student/course        → 내 강좌
/student/course/active → 수강 중 강좌
/student/course/completed → 수강 완료 강좌

/student/course/{courseId} → 강좌 상세
/student/course/{courseId}/lectures → 강의 목록
/student/lecture/{lectureId} → 강의 시청
/student/course/{courseId}/enroll → 수강 신청
/student/course/{courseId}/cancel → 수강 취소

### 📌 코딩 연습
/student/problem                 → 문제 목록
/student/problem/level/{level}   → 난이도별 문제 (EASY/MEDIUM/HARD)
/student/problem/{problemId}     → 문제 상세
/student/problem/{problemId}/submit → 코드 제출


### 📌 시험 / 평가
/student/exam               → 시험 목록
/student/exam/{examId}      → 시험 응시
/student/exam/{examId}/result → 개인 결과 상세

### 📌 출석 / 이력
/student/history             → 학습 로그
/student/history/exam       → 시험 응시 이력

### 📌 결제 / 수강권
/student/payment            → 결제 내역
<!-- /student/payments/credits    → 크레딧 현황 추후 구현-->
/student/payment/purchase  → 수강권 구매
/student/payment/refunds   → 환불 내역

### 📌 Q/A
/student/qna                 → 내 질문 목록
/student/qna/new             → 질문 등록
/student/qna/{id}            → 질문 상세


## 🟨 강사 영역

(강사 승인 후 접근 가능)

/instructor/dashboard        → 강사 대시보드

/instructor/course          → 강좌 관리
/instructor/course/new      → 강좌 개설 요청
/instructor/course/{id}     → 강좌 상세

### 📌 강의 / 과제 관리
/instructor/lecture         → 강의 관리
/instructor/lecture/upload  → 강의 업로드 요청

/instructor/course/{courseId}/exam
→ 해당 강좌의 시험 목록
/instructor/course/{courseId}/exam/{examId}/attempts
→ 시험 응시자 목록 (점수, 통과 여부)
/instructor/course/{courseId}/exam/{examId}/attempt/{attemptId}
→ 특정 수강생 시험 상세 (답안, 채점 결과)

/instructor/exam      → 시험 관리
/instructor/exam/new  → 시험 등록
/instructor/exam/{id} → 시험 상세

### 📌 Q/A / 정산
/instructor/qna              → 질문 관리
/instructor/qna/{id}         → 답변 등록 / 수정

<!-- 정산/계좌 관련 테이블 없음 추후 구현
/instructor/settlement       → 정산 내역
/instructor/account          → 계좌 정보 관리 -->

## 🟥 관리자 영역

(관리자 전용)

/admin/dashboard             → 관리자 대시보드

### 📌 회원 / 권한 관리
/admin/users                 → 전체 회원 관리
/admin/users/students        → 수강생 관리
/admin/users/instructors     → 강사 관리

### 📌 강좌 / 강의 승인
/admin/course               → 강좌 관리
/admin/course/pending       → 승인 대기 강좌
/admin/course/{id}/approve  → 승인
/admin/course/{id}/reject   → 반려
/admin/course/{id}/close    → 강좌 신규 모집 종료

/admin/lectures              → 강의 관리
/admin/lectures/{id}/inactive → 문제 있는 강의 차단

### 📌 결제 / 커뮤니티 / 시험
/admin/payment              → 결제 내역
<!-- /admin/refunds               → 환불 처리 추후 구현-->

/admin/community             → 커뮤니티 관리
<!-- /admin/reports               → 신고 처리 추후 구현 -->

/admin/problem/{problemId}/test-cases
/admin/problem                 → 코딩연습 관리
/admin/problem/question        → 코딩연습 문제 관리
/admin/problem/{id}/edit       → 코딩연습 문제 관리

### 📌 로그 / 공지
/admin/logs                  → 로그 조회
/admin/logs/exams            → 시험 로그

/admin/notice               → 공지 관리