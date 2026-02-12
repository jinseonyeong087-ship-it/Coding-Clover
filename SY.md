# 백엔드 아키텍처 & 데이터 흐름 분석

## 🏗️ 전체 시스템 구조

Coding-Clover 백엔드는 **3개 핵심 모듈**로 구성되어 있으며, 각각 **Spring Boot + JPA**를 기반으로 한 **계층형 아키텍처(Layered Architecture)**를 따릅니다.

```
┌─────────────────┬─────────────────┬─────────────────┐
│ Student Profile │ Instructor Profile │   Enrollment    │
│   (학생 관리)    │    (강사 관리)     │   (수강 관리)    │
└─────────────────┴─────────────────┴─────────────────┘
         ↓                ↓                ↓
┌────────────────────────────────────────────────────┐
│            Controller Layer (REST API)            │
└────────────────────────────────────────────────────┘
         ↓                ↓                ↓
┌────────────────────────────────────────────────────┐
│         Service Layer (Business Logic)            │
└────────────────────────────────────────────────────┘
         ↓                ↓                ↓
┌────────────────────────────────────────────────────┐
│       Repository Layer (Data Access)              │
└────────────────────────────────────────────────────┘
         ↓                ↓                ↓
┌────────────────────────────────────────────────────┐
│           Database (JPA Entities)                 │
└────────────────────────────────────────────────────┘
```

---

## 🎯 1. Student Profile 모듈 - 학생 프로필 관리

### 📋 모듈 구성
```
StudentProfile/
├── StudentProfileController.java  → REST API 엔드포인트
├── StudentProfileService.java     → 비즈니스 로직
├── StudentProfileRepository.java  → 데이터 접근
├── StudentProfile.java           → JPA 엔티티
├── StudentProfileDto.java        → 데이터 전송 객체
```

### 🔄 데이터 흐름 (학생 프로필 조회)
```
Frontend Request: GET /api/student/mypage
         ↓
🌐 StudentProfileController.getStudentProfile()
   ├── Input: Principal (Spring Security)
   ├── Process: principal.getName() → loginId 추출
   └── Call: studentProfileService.getStudentProfileByLoginId(loginId)
         ↓
📋 StudentProfileService.getStudentProfileByLoginId()
   ├── Input: String loginId
   ├── Process: loginId → Users 조회, 프로필 정보 조합
   ├── Repository Call: 
   │   ├── usersRepository.findByLoginId() → Users Entity
   │   └── studentProfileRepository.findByUserId() → StudentProfile Entity
   └── Output: StudentProfileDto
         ↓
💾 Repository Layer
   ├── StudentProfileRepository extends JpaRepository<StudentProfile>
   ├── Database Query: SELECT * FROM student_profile WHERE user_id = ?
   └── Return: Optional<StudentProfile>
         ↓
📤 Response: StudentProfileDto JSON
```

### 🔧 핵심 비즈니스 로직
- **프로필 없음 처리**: 기본값("미설정") 반환으로 안정적 처리
- **생성과 수정 통합**: `createOrUpdateProfile()` 단일 메서드로 처리

---

## 👨‍🏫 2. Instructor Profile 모듈 - 강사 승인 시스템

### 📋 모듈 구성
```
InstructorProfile/
├── InstructorProfileController.java  → REST API 엔드포인트
├── InstructorProfileService.java     → 승인 워크플로우 로직
├── InstructorProfileRepository.java  → 데이터 접근
├── InstructorProfile.java           → JPA 엔티티
├── InstructorProfileDto.java        → 데이터 전송 객체
├── InstructorStatus.java            → 상태 관리 Enum
```

### 🔄 데이터 흐름 (강사 지원 → 승인)
```
1️⃣ 강사 지원
Frontend: POST /api/instructor/apply (FormData with Resume File)
         ↓
🌐 InstructorProfileController.applyInstructor()
   ├── Input: MultipartFile resumeFile, InstructorProfileDto
   ├── Process: 파일 업로드 + 프로필 생성
   └── Call: instructorProfileService.applyInstructor()
         ↓
📋 InstructorProfileService.applyInstructor()
   ├── Input: InstructorProfileDto + MultipartFile
   ├── Process: 
   │   ├── File → BLOB 변환
   │   ├── InstructorProfile Entity 생성
   │   └── Status = APPLIED 설정
   └── Repository: save(InstructorProfile)


2️⃣ 관리자 승인
Frontend: POST /admin/instructor/{userId}/approve
         ↓
🌐 InstructorProfileController.approveInstructor()
   ├── Input: Long userId, Principal admin
   └── Call: instructorProfileService.approveInstructor()
         ↓
📋 InstructorProfileService.approveInstructor()
   ├── Input: Long userId
   ├── Process: 
   │   ├── InstructorProfile 조회
   │   ├── Status: APPLIED → APPROVED
   │   └── Users Role: STUDENT → INSTRUCTOR
   └── Repository: save() + 알림 서비스 호출
```

### 🔄 상태 관리 흐름
```
APPLIED (지원) → APPROVED (승인) ↗
       ↓                      REJECTED (반려)
    REAPPLIED (재지원) ←─────────────┘
```

---

## 🎓 3. Enrollment 모듈 - 수강 관리 시스템 (가장 복잡)

### 📋 모듈 구성
```
Enrollment/
├── EnrollmentController.java     → REST API (학생/강사/관리자 분리)
├── EnrollmentService.java        → 복잡한 비즈니스 로직
├── EnrollmentRepository.java     → 데이터 접근 (커스텀 쿼리 다수)
├── Enrollment.java              → JPA 엔티티 (상태 관리)
├── EnrollmentStatus.java        → 상태 Enum (ENROLLED/COMPLETED/CANCELLED)
├── StudentEnrollmentDto.java    → 학생용 View
├── InstructorEnrollmentDto.java → 강사용 View (단순화됨)
├── AdminEnrollmentDto.java      → 관리자용 View
└── CancelRequestDto.java        → 취소 요청용
```

### 🔄 데이터 흐름 1: 수강 취소 요청 (복잡한 워크플로우)

```
학생 취소 요청
Frontend: POST /student/enrollment/{enrollmentId}/cancel-request
         ↓
🌐 EnrollmentController.requestCancel()
   ├── Input: Long enrollmentId, Principal principal
   ├── Process: 
   │   ├── Principal → Users 조회
   │   ├── enrollmentId → Enrollment 조회
   │   └── 권한 검증 (본인 수강인지 확인)
   └── Call: enrollmentService.requestCancel(student, enrollment)
         ↓
📋 EnrollmentService.requestCancel()
   ├── Input: Users student, Enrollment enrollment
   ├── Validation:
   │   ├── 권한 검증: enrollment.getUser() == student?
   │   ├── 중복 검증: isCancelRequested() == false?
   │   └── 상태 검증: status == ENROLLED?
   ├── Process:
   │   ├── enrollment.requestCancel() → cancelledAt 설정 + flag 변경
   │   ├── Repository: save(enrollment)
   │   └── 관리자 알림 전송 (NotificationService 연동)
   └── Output: CancelRequestDto
         ↓
📤 Response: CancelRequestDto (진도율 포함)


관리자 승인/반려
Frontend: POST /admin/cancel-requests/{enrollmentId}/approve
         ↓
🌐 EnrollmentController.approveCancelRequest()
   └── Call: enrollmentService.approveCancelRequest(admin, enrollmentId)
         ↓
📋 EnrollmentService.approveCancelRequest()
   ├── Process:
   │   ├── Enrollment 조회 + 상태 검증
   │   ├── enrollment.cancel(admin) → Status: CANCELLED
   │   └── PaymentService.processCourseCancelRefund() 호출
   └── 학생 알림 전송
```

### 🔄 데이터 흐름 2: 진도율 계산 (여러 시스템 연동)

```
관리자 수강 내역 조회
Frontend: GET /admin/enrollment
         ↓
🌐 EnrollmentController.getAllEnrollments()
   └── Call: enrollmentService.getAllEnrollments()
         ↓
📋 EnrollmentService.getAllEnrollments()
   ├── Repository: enrollmentRepository.findAllWithUserAndCourse()
   │   ├── JOIN 쿼리로 Enrollment + Users + Course 한번에 조회
   │   └── Return: List<Enrollment>
   ├── 진도율 계산 로직:
   │   ├── lectureProgressRepository.findByEnrollmentAndCompletedYnTrue()
   │   ├── lectureService.getLecturesForStudent()
   │   └── progressRate = (완료강의 / 전체강의) * 100
   └── Output: List<AdminEnrollmentDto>
         ↓ 
💾 Database Queries (N+1 문제 해결)
   ├── 1 Query: Enrollment + Users + Course (JOIN)
   ├── N Queries: 각 수강별 진도율 계산
   └── Exception Handling: 진도 계산 실패시 기본값
```

---

## 🔗 모듈 간 상호작용 & 의존성

### 💡 Enrollment 모듈의 외부 의존성
```
EnrollmentService
├── PaymentService          → 결제/환불 처리
├── NotificationService     → 알림 전송
├── LectureProgressService  → 진도율 계산
├── LectureService         → 강의 정보 조회
└── UsersRepository        → 사용자 정보 조회
```

### 🎯 트랜잭션 관리 전략
```java
@Transactional                    // 쓰기 작업
@Transactional(readOnly = true)   // 읽기 전용 (성능 최적화)

// 예시: 수강 취소 + 환불
@Transactional  
public void cancelMyEnrollment() {
    cancel(student, student, course);           // 1. 상태 변경
    paymentService.processDirectRefund(...);    // 2. 환불 처리
    // 환불 실패시 전체 롤백 → 데이터 일관성 보장
}
```

---

## 📊 DTO 설계 패턴 - 역할별 View 분리

### 🎭 같은 데이터, 다른 관점
```
Enrollment Entity (DB)
├── StudentEnrollmentDto    → 학생이 보는 수강 정보
├── InstructorEnrollmentDto → 강사가 보는 수강생 정보 (단순화)
├── AdminEnrollmentDto     → 관리자가 보는 전체 정보
└── CancelRequestDto       → 취소 요청 전용
```

### 🔒 정보 보안 & 캡슐화
- **Student**: 본인 수강 정보만 + 진도율
- **Instructor**: 수강생 상태만 (개인정보 최소화)
- **Admin**: 모든 정보 + 취소자/진도율/결제 정보

---

## ⚡ 성능 최적화 포인트

### 🚀 N+1 문제 해결
```java
// ❌ N+1 Problem
enrollments.forEach(e -> calculateProgress(e)); // N개 쿼리

// ✅ JOIN + Batch Processing
@Query("SELECT e FROM Enrollment e JOIN FETCH e.user JOIN FETCH e.course")
List<Enrollment> findAllWithUserAndCourse();
```

### 📈 읽기 최적화
- **@Transactional(readOnly = true)**: 읽기 전용 트랜잭션
- **Lazy Loading**: 필요한 연관 엔티티만 로드
- **DTO Projection**: 필요한 필드만 조회

---

## 🎯 면접 포인트 정리

### 💼 "Enrollment 모듈을 설명해주세요"
**답변 구조:**
1. **아키텍처**: "3계층 구조로 Controller-Service-Repository 패턴을 따릅니다"
2. **복잡성**: "결제, 환불, 알림, 진도관리 등 여러 시스템이 연동됩니다"
3. **상태 관리**: "ENROLLED → CANCELLED 상태 전환과 요청-승인 워크플로우"
4. **트랜잭션**: "수강취소+환불의 원자성을 @Transactional로 보장합니다"
5. **성능**: "JOIN 쿼리와 DTO 패턴으로 N+1 문제를 해결했습니다"

### 🔧 "왜 DTO를 역할별로 분리했나요?"
**답변:**
1. **보안**: 역할에 따른 정보 접근 제한
2. **성능**: 불필요한 데이터 전송 방지  
3. **유지보수**: 프론트엔드 요구사항 변경시 독립적 수정
4. **확장성**: 새로운 역할 추가시 기존 코드 영향 최소화

이러한 구조를 통해 **확장 가능하고 유지보수 쉬운 교육 플랫폼 백엔드**를 구현했습니다.