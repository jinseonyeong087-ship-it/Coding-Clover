# 백엔드 주요 도메인 폴더 및 파일 리스트

나혜 담당 파일

## 1. CommunityPost (커뮤니티 게시글)
- `CommunityComment.java`
- `CommunityCommentRepository.java`
- `CommunityPost.java`
- `CommunityPostController.java`
- `CommunityPostRepository.java`
- `CommunityPostService.java`
- `PostStatus.java`
- **dto/**
    - `CommentRequest.java`
    - `CommentResponse.java`
    - `PostCreateRequest.java`
    - `PostResponse.java`

## 2. Course (강좌)
- `Course.java`
- `CourseController.java`
- `CourseProposalStatus.java`
- `CourseRepository.java`
- `CourseService.java`
- `RejectRequest.java`
- **dto/**
    - `AdminCourseDto.java`
    - `CourseCreateRequest.java`
    - `InstructorCourseDto.java`
    - `StudentCourseDto.java`

## 3. Exam (시험)
- `Exam.java`
- `ExamAnswer.java`
- `ExamAnswerRepository.java`
- `ExamController.java`
- `ExamQuestion.java`
- `ExamQuestionRepository.java`
- `ExamRepository.java`
- `ExamService.java`
- **dto/**
    - `AdminExamDto.java`
    - `ExamCreateRequest.java`
    - `ExamQuestionDto.java`
    - `ExamResultDto.java`
    - `ExamSubmissionRequest.java`
    - `InstructorExamDto.java`
    - `StudentExamDto.java`
    - `StudentExamQuestionDto.java`

## 4. ExamAttempt (시험 응시 기록)
- `ExamAttempt.java`
- `ExamAttemptRepository.java`
- **dto/**
    - `ExamAttemptDto.java`

## 5. Lecture (강의)
- `JsonIgnore.java`
- `Lecture.java`
- `LectureApprovalStatus.java`
- `LectureController.java`
- `LectureRepository.java`
- `LectureService.java`
- `LectureUploadType.java`
- `YoutubeService.java`
- **dto/**
    - `AdminLectureDto.java`
    - `BatchApprovalRequest.java`
    - `InstructorLectureDto.java`
    - `LectureCreateRequest.java`
    - `LecturePreviewDto.java`
    - `RejectRequest.java`
    - `StudentLectureDto.java`

## 6. LectureProgress (강의 진도)
- `AdminLectureProgressDto.java`
- `InstructorLectureProgressDto.java`
- `LectureProgress.java`
- `LectureProgressController.java`
- `LectureProgressRepository.java`
- `LectureProgressService.java`
- `StudentLectureProgressDto.java`

## 7. ScoreHistory (성적 이력)
- `ScoreHistory.java`
- `ScoreHistoryRepository.java`
- **dto/**
    - `ScoreHistoryDto.java`

## 8. Search (검색)
- `SearchController.java`
- `SearchService.java`
- **dto/**
    - `SearchResultDto.java`

## 준서가 한거

### 1. Problem (코딩 테스트 문제)
- `Problem.java`
- `ProblemController.java`
- `ProblemRepository.java`
- `ProblemDifficulty.java`
- `CodeExecutor.java`
- `JavaNativeExecutor.java`
- `ExecutionRequest.java`
- `ExecutionResponse.java`
- `GradingResult.java`

### 2. Submission (코드 제출 및 채점)
- `Submission.java`
- `SubmissionController.java`
- `SubmissionRepository.java`
- `SubmissionService.java`
- `SubmissionResponse.java`

### 3. Users (회원 관리 및 인증)
- `Users.java`
- `UsersController.java`
- `UsersRepository.java`
- `UsersService.java`
- `UsersRole.java`
- `UsersStatus.java`
- `UsersFindRequest.java`
- `UsersSecurityService.java`
- `SocialLoginService.java`
- `ApiLoginFilter.java`
- `ApiLoginSuccess.java`
- `ApiLoginFail.java`
- `StudentDTO.java`
- `InstructorDTO.java`

### 4. Qna (질문 게시판)
- `Qna.java`
- `QnaController.java`
- `QnaRepository.java`
- `QnaService.java`
- `QnaStatus.java`
- `QnaDto.java`

### 5. QnaAnswer (질문 답변)
- `QnaAnswer.java`
- `QnaAnswerRepository.java`
- `QnaAnswerService.java`

### 6. Notice (공지사항)
- `Notice.java`
- `NoticeController.java`
- `NoticeRepository.java`
- `NoticeService.java`
- `NoticeStatus.java`

### 7. Notification (알림)
- `Notification.java`
- `NotificationController.java`
- `NotificationRepository.java`
- `NotificationService.java`
- `NotificationDto.java`

### 8. ChatBot (AI 챗봇)
- `ChatConfig.java`
- `ChatController.java`
- `ChatDto.java`

### 9. Mail (이메일 인증)
- `MailController.java`
- `MailService.java`

### 10. Image (이미지 업로드)
- `ImageController.java`
- `ImageService.java`

### 11. Configuration & Global (설정 및 공통)
- `CodingcloverApplication.java`
- `SecurityConfig.java`
- `WebConfig.java`
- `DataNotFoundException.java`

### 12. Payment (결제 및 포인트)
- `Payment.java`
- `PaymentController.java`
- `PaymentRepository.java`
- `PaymentService.java`
- `PaymentStatus.java`
- `PaymentType.java`
- `PaymentSuccessDto.java`
- `PaymentWithUserDto.java`

### 13. UserWallet (지갑 및 포인트 변동)
- `UserWallet.java`
- `UserWalletRepository.java`
- `UserWalletService.java`
- `WalletController.java`
- `WalletIntegrationService.java`

### 14. WalletHistory (지갑 사용 내역)
- `WalletHistory.java`
- `WalletHistoryRepository.java`
- `WalletHistoryService.java`
- `WalletChangeReason.java`