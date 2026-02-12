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

##