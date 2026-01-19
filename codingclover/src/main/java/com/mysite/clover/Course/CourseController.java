package com.mysite.clover.Course;

import java.security.Principal;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 강좌 컨트롤러
@RequestMapping("/course")
@RequiredArgsConstructor
@Controller
public class CourseController {

    // 서비스 객체 주입
    private final CourseService cs;
    private final UsersService us;
    private final UsersRepository ur;

    // 강좌 목록
    @GetMapping("/list")
    public String list(Model model) {
        model.addAttribute("courseList", cs.getList());
        return "course_list";
    }

    // 강좌 생성 폼
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/create")
    public String courseCreate(CourseForm courseForm) {
        return "course_form";
    }

    // 강좌 생성 처리
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create")
    public String courseCreate(
            @Valid CourseForm courseForm,
            BindingResult bindingResult,
            Principal principal) {
        
        // 입력 오류 검사
        if (bindingResult.hasErrors()) {
            return "course_form";
        }

        // 현재 로그인한 사용자 가져오기
        Users user = ur.findByLoginId(principal.getName())
        .orElseThrow(() -> new RuntimeException("유저 없음"));

        // 강좌 생성
        cs.create(
                courseForm.getTitle(),
                courseForm.getDescription(),
                courseForm.getPrice(),
                user
        );

        return "redirect:/course/list";
    }
}
