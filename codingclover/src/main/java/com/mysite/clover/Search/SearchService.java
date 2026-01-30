package com.mysite.clover.Search;

import com.mysite.clover.Course.CourseRepository;
import com.mysite.clover.Lecture.LectureRepository;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersRole;
import com.mysite.clover.Notice.NoticeRepository;
import com.mysite.clover.Problem.ProblemRepository;
import com.mysite.clover.CommunityPost.CommunityPostRepository;
import com.mysite.clover.Qna.QnaRepository;
// import com.mysite.clover.CodingTest.CodingTestRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
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
                return courseRepository.findByTitleContaining(keyword, pageable);
            // 강의 검색
            case "LECTURE":
                return lectureRepository.findByTitleContaining(keyword, pageable);
            // 공지사항 검색
            case "NOTICE":
                return noticeRepository.findByTitleContaining(keyword, pageable);
            // 커뮤니티 검색
            case "COMMUNITY":
                return communityPostRepository.findByTitleContaining(keyword, pageable);
            // QnA 검색
            case "QNA":
                return qnaRepository.findByTitleContaining(keyword, pageable);
            // 코딩 테스트 검색
            case "CODING_TEST":
                return problemRepository.findByTitleContaining(keyword, pageable);
        }

        // 2. 권한별 차등 검색 (사용자 관련)
        if ("ADMIN".equals(role)) {
            // 관리자는 학생과 강사를 모두 검색 가능
            if ("STUDENT".equals(upperCategory)) 
                return userRepository.findByRoleAndNameContaining(UsersRole.STUDENT, keyword, pageable);
            if ("INSTRUCTOR".equals(upperCategory)) 
                return userRepository.findByRoleAndNameContaining(UsersRole.INSTRUCTOR, keyword, pageable);
        } else {
            // 학생과 강사는 '강사 목록'만 검색 가능 (학생 정보 검색 차단)
            if ("INSTRUCTOR".equals(upperCategory)) 
                return userRepository.findByRoleAndNameContaining(UsersRole.INSTRUCTOR, keyword, pageable);
        }

        return Page.empty();
    }

    public Page<?> searchByAdmin(String category, String keyword, Pageable pageable) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'searchByAdmin'");
    }
}