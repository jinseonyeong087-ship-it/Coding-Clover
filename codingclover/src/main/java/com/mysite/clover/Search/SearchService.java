package com.mysite.clover.Search;

import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Lecture.LectureRepository;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersRole;
import com.mysite.clover.Notice.NoticeRepository;
import com.mysite.clover.Problem.ProblemRepository;
import com.mysite.clover.CommunityPost.CommunityPostRepository;
import com.mysite.clover.Search.dto.SearchResultDto;
import com.mysite.clover.Course.Course;
import com.mysite.clover.Lecture.Lecture;
import com.mysite.clover.Notice.Notice;
import com.mysite.clover.Problem.Problem;
import com.mysite.clover.CommunityPost.CommunityPost;
import com.mysite.clover.Qna.Qna;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Qna.QnaRepository;
// import com.mysite.clover.CodingTest.CodingTestRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final UsersRepository userRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final NoticeRepository noticeRepository;
    private final CommunityPostRepository communityPostRepository;
    private final QnaRepository qnaRepository;
    private final ProblemRepository problemRepository;

    public Page<?> totalSearch(String role, String category, String keyword, Pageable pageable) {
        String upperCategory = category.toUpperCase();

        // 1. 공통 검색 도메인 (관리자, 학생, 강사 모두 접근 가능)
        switch (upperCategory) {
            // 강좌 검색
            case "COURSE":
                Page<Course> courses = courseRepository.findByTitleContaining(keyword, pageable);
                return courses.map(course -> SearchResultDto.builder()
                        .id(course.getCourseId())
                        .title(course.getTitle())
                        .authorName(course.getInstructorName())
                        .regDate(course.getCreatedAt())
                        .status(course.getProposalStatus().name())
                        .proposalStatus(course.getProposalStatus().name())
                        .category("COURSE")
                        .instructorName(course.getInstructorName())
                        .thumbnailUrl(course.getThumbnailUrl())
                        .level(course.getLevel())
                        .build());
            // 강의 검색
            case "LECTURE":
                Page<Lecture> lectures = lectureRepository.findByTitleContaining(keyword, pageable);
                return lectures.map(lecture -> SearchResultDto.builder()
                        .id(lecture.getLectureId())
                        .title(lecture.getTitle())
                        .authorName(lecture.getCreatedBy() != null ? lecture.getCreatedBy().getName() : "Unknown")
                        .regDate(lecture.getCreatedAt())
                        .status(lecture.getApprovalStatus().name())
                        .category("LECTURE")
                        .build());
            // 공지사항 검색
            case "NOTICE":
                Page<Notice> notices = (Page<Notice>) noticeRepository.findByTitleContaining(keyword, pageable);
                return notices.map(notice -> SearchResultDto.builder()
                        .id(notice.getNoticeId())
                        .title(notice.getTitle())
                        .authorName(notice.getCreatedBy() != null ? notice.getCreatedBy().getName() : "관리자")
                        .regDate(notice.getCreatedAt())
                        .status(notice.getStatus().name())
                        .category("NOTICE")
                        .build());
            // 커뮤니티 검색
            case "COMMUNITY":
                Page<CommunityPost> posts = (Page<CommunityPost>) communityPostRepository.findByTitleContaining(keyword,
                        pageable);
                return posts.map(post -> SearchResultDto.builder()
                        .id(post.getPostId())
                        .title(post.getTitle())
                        .authorName(post.getUser() != null ? post.getUser().getName() : "익명")
                        .regDate(post.getCreatedAt())
                        .status(post.getStatus().name())
                        .category("COMMUNITY")
                        .build());
            // QnA 검색
            case "QNA":
                Page<Qna> qnas = (Page<Qna>) qnaRepository.findByTitleContaining(keyword, pageable);
                return qnas.map(qna -> SearchResultDto.builder()
                        .id(qna.getQnaId())
                        .title(qna.getTitle())
                        .authorName(qna.getUsers() != null ? qna.getUsers().getName() : "익명")
                        .regDate(qna.getCreatedAt())
                        .status(qna.getStatus().name())
                        .category("QNA")
                        .build());
            // 코딩 테스트 검색
            case "CODING_TEST":
                Page<Problem> problems = (Page<Problem>) problemRepository.findByTitleContaining(keyword, pageable);
                return problems.map(problem -> SearchResultDto.builder()
                        .id(problem.getProblemId())
                        .title(problem.getTitle())
                        .authorName("관리자")
                        .regDate(problem.getCreatedAt())
                        .status(problem.getDifficulty().name())
                        .category("CODING_TEST")
                        .build());
        }

        // 2. 권한별 차등 검색 (사용자 관련)
        if ("ADMIN".equals(role)) {
            // 관리자는 학생과 강사를 모두 검색 가능
            if ("STUDENT".equals(upperCategory)) {
                Page<Users> students = userRepository.findByRoleAndNameContaining(UsersRole.STUDENT, keyword, pageable);
                return students.map(user -> SearchResultDto.builder()
                        .id(user.getUserId())
                        .title(user.getName())
                        .email(user.getEmail())
                        .loginId(user.getLoginId())
                        .regDate(user.getCreatedAt())
                        .status(user.getStatus().name())
                        .category("STUDENT")
                        .build());
            }
            if ("INSTRUCTOR".equals(upperCategory)) {
                Page<Users> instructors = userRepository.findByRoleAndNameContaining(UsersRole.INSTRUCTOR, keyword,
                        pageable);
                return instructors.map(user -> SearchResultDto.builder()
                        .id(user.getUserId())
                        .title(user.getName())
                        .email(user.getEmail())
                        .loginId(user.getLoginId())
                        .regDate(user.getCreatedAt())
                        .status(user.getStatus().name())
                        .category("INSTRUCTOR")
                        .build());
            }
        } else {
            // 학생과 강사는 '강사 목록'만 검색 가능 (학생 정보 검색 차단)
            if ("INSTRUCTOR".equals(upperCategory)) {
                Page<Users> instructors = userRepository.findByRoleAndNameContaining(UsersRole.INSTRUCTOR, keyword,
                        pageable);
                return instructors.map(user -> SearchResultDto.builder()
                        .id(user.getUserId())
                        .title(user.getName())
                        .email(user.getEmail())
                        .loginId(user.getLoginId())
                        .regDate(user.getCreatedAt())
                        .status(user.getStatus().name())
                        .category("INSTRUCTOR")
                        .build());
            }
        }

        return Page.empty();
    }
}