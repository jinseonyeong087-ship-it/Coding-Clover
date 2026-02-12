# 백엔드 모듈 아키텍처 분석

## 개요
Coding-Clover 시스템의 백엔드는 크게 3개의 핵심 모듈로 구성되어 있습니다:
- **Student Profile**: 학생 프로필 관리
- **Instructor Profile**: 강사 프로필 및 승인 관리
- **Enrollment**: 수강신청 및 수강상태 관리

각 모듈은 **Spring Boot + JPA 아키텍처**를 따르며, **Controller → Service → Repository → Entity** 구조로 설계되어 있습니다.

---

## 1. Student Profile 모듈 📚

### 클래스 구성
```
StudentProfile/
├── StudentProfile.java          (Entity) - 학생 프로필 엔티티
├── StudentProfileController.java (REST API) - HTTP 요청 처리
├── StudentProfileService.java   (Business Logic) - 비즈니스 로직
├── StudentProfileRepository.java (Data Access) - 데이터베이스 접근
└── StudentProfileDto.java       (DTO) - 데이터 전송 객체
```

### 데이터 흐름
```
Frontend → Controller → Service → Repository → Database
                ↓          ↓         ↓
               DTO    Business    Entity
                     Logic
```

### 핵심 기능
- **프로필 조회**: `getStudentProfileByLoginId()` - loginId 또는 email로 학생 프로필 조회
- **프로필 업데이트**: `updateStudentProfile()` - 학습수준, 관심분야 수정
- **Users 연관관계**: `@OneToOne` 매핑으로 Users 테이블과 1:1 관계

### 핵심 로직 위치
- **StudentProfileService.java**: 메인 비즈니스 로직
  - 프로필이 없으면 기본값("미설정") 반환
  - 생성과 수정을 하나의 메서드로 처리 (`createOrUpdateProfile`)

---

## 2. Instructor Profile 모듈 👨‍🏫

### 클래스 구성
```
InstructorProfile/
├── InstructorProfile.java          (Entity) - 강사 프로필 엔티티
├── InstructorProfileController.java (REST API) - HTTP 요청 처리  
├── InstructorProfileService.java   (Business Logic) - 비즈니스 로직
├── InstructorProfileRepository.java (Data Access) - 데이터베이스 접근
├── InstructorProfileDto.java       (DTO) - 데이터 전송 객체
└── InstructorStatus.java          (Enum) - 강사 승인 상태
```

### 상태 관리 (InstructorStatus)
```
APPLIED → APPROVED → REJECTED
   ↑         ↓
   └─── REAPPLIED
```

### 핵심 기능
- **신청**: `applyInstructor()` - 강사 지원서 제출 (이력서 파일 업로드 포함)
- **승인/반려**: `approveInstructor()`, `rejectInstructor()` - 관리자 승인 처리
- **재신청**: 반려 후 다시 신청 가능
- **파일 관리**: 이력서 업로드/다운로드 (BLOB 저장)

### 핵심 로직 위치
- **InstructorProfileService.java**: 
  - 상태 변경 로직
  - 파일 업로드/다운로드 처리
  - 관리자 승인 프로세스

---

## 3. Enrollment 모듈 🎓

### 클래스 구성 (가장 복잡)
```
Enrollment/
├── Enrollment.java              (Entity) - 수강 엔티티
├── EnrollmentController.java    (REST API) - HTTP 요청 처리
├── EnrollmentService.java       (Business Logic) - 비즈니스 로직
├── EnrollmentRepository.java    (Data Access) - 데이터베이스 접근
├── EnrollmentStatus.java        (Enum) - 수강 상태
├── StudentEnrollmentDto.java    (DTO) - 학생용 DTO
├── InstructorEnrollmentDto.java (DTO) - 강사용 DTO
├── AdminEnrollmentDto.java      (DTO) - 관리자용 DTO
└── CancelRequestDto.java        (DTO) - 취소 요청용 DTO
```

### 상태 관리 (EnrollmentStatus)
```
ENROLLED (수강중) → COMPLETED (완료)
    ↓
CANCELLED (취소)

※ 취소 요청 플로우:
ENROLLED → isCancelRequested=true → CANCELLED (관리자 승인 후)
```

### 역할별 View (DTO 분리)
- **StudentEnrollmentDto**: 학생이 보는 수강 정보
- **InstructorEnrollmentDto**: 강사가 보는 수강생 정보  
- **AdminEnrollmentDto**: 관리자가 보는 전체 수강 정보
- **CancelRequestDto**: 취소 요청 처리용

### 핵심 기능
1. **수강 취소 요청**: `requestCancel()` - 학생이 취소 요청
2. **취소 요청 승인/반려**: `approveCancelRequest()`, `rejectCancelRequest()`
3. **즉시 취소**: `cancelMyEnrollment()` - 포인트 환불 포함
4. **강제 취소**: `adminCancelEnrollment()` - 관리자 권한

### 핵심 로직 위치
- **EnrollmentService.java**: 
  - 취소 요청 워크플로우
  - 결제/환불 처리 연동
  - 진도율 계산 로직
  - 알림 서비스 연동

---

## 데이터 흐름 종합

### 일반적인 CRUD 흐름
```
Frontend Request
    ↓
@RestController (HTTP 처리)
    ↓
@Service (비즈니스 로직 + @Transactional)
    ↓
@Repository (JPA 쿼리)
    ↓
@Entity (DB 테이블 매핑)
    ↓
Database
```

### 모듈간 의존성
```
Enrollment 모듈
    ↓
├── Users (사용자 정보)
├── Course (강좌 정보)  
├── PaymentService (결제/환불)
├── NotificationService (알림)
└── LectureProgressService (진도관리)
```

---

## 핵심 설계 패턴

### 1. 계층 분리 (Layered Architecture)
- **Controller**: HTTP 요청/응답 처리
- **Service**: 비즈니스 로직 (트랜잭션 관리)
- **Repository**: 데이터 접근
- **Entity**: 도메인 객체

### 2. DTO 패턴
- **목적별 DTO 분리**: Student/Instructor/Admin 각각의 View
- **데이터 은닉**: 필요한 정보만 노출
- **API 안정성**: Entity 변경이 API에 미치는 영향 최소화

### 3. 상태 패턴
- **EnrollmentStatus**: 수강 상태 관리
- **InstructorStatus**: 강사 승인 상태 관리
- **명확한 상태 전환**: 비즈니스 규칙을 코드로 표현

### 4. 트랜잭션 관리
- **@Transactional**: 데이터 일관성 보장
- **롤백 처리**: 환불 실패 시 수강 취소도 롤백
- **읽기 전용**: `@Transactional(readOnly = true)` 성능 최적화

---

## 특별히 주목할 점

### Enrollment 모듈의 복잡성
- **가장 복잡한 비즈니스 로직**: 결제, 환불, 알림, 진도 등 여러 시스템 연동
- **다양한 액터**: 학생, 강사, 관리자 각각 다른 권한과 뷰
- **상태 관리**: 단순한 CRUD가 아닌 복잡한 워크플로우

### Profile 모듈의 단순성
- **기본적인 CRUD**: 생성, 조회, 수정, 삭제
- **일대일 관계**: Users 테이블과 단순한 확장 관계
- **상태 변화 최소**: InstructorProfile만 승인 상태 관리

이러한 구조로 **관심사의 분리**와 **단일 책임 원칙**을 잘 지키고 있으며, 각 모듈이 독립적으로 발전할 수 있는 **확장 가능한 아키텍처**를 구성하고 있습니다.