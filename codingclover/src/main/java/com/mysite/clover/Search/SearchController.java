package com.mysite.clover.Search;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
// 관리자 페이지에서 사용자 검색 기능을 제공하는 컨트롤러
public class SearchController {

    // 관리자 서비스
    private final SearchService searchService;

    // 관리자 검색 API
    @GetMapping

    // 관리자 검색 결과를 반환
    public ResponseEntity<Page<?>> adminSearch(
            // 검색 카테고리 (학생, 강사, 강좌, 기타)
            @RequestParam String category,
            // 검색어
            @RequestParam String keyword,
            // 프론트에서 현재 로그인한 유저의 ROLE을 보냄
            @RequestParam String role,
            // 페이징 정보
            Pageable pageable) {
        
        // 관리자 검색 서비스 호출
        Page<?> result = searchService.totalSearch(role, category, keyword, pageable);
        return ResponseEntity.ok(result);
    }
}