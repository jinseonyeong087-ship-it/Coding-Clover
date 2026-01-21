package com.mysite.clover.Course;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/instructor/course")
public class CourseController {

    private final CourseService cs;
    private final UsersRepository ur;

    // 강좌 목록 (JSON 반환)
    @GetMapping
    public List<Course> list() {
        return cs.getList();
    }

    // 강좌 생성 (JSON 요청)
    /**
     * @param courseForm
     * @param principal
     */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/new")
    public void create(
            @RequestBody @Valid CourseForm courseForm,
            Principal principal) {
                
        Users user = ur.findByLoginId(principal.getName())
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        cs.create(
            courseForm.getTitle(),
            courseForm.getDescription(),
            courseForm.getLevel(),
            courseForm.getPrice(),
            user,                 // created_by
            CourseStatus.PENDING  
            //proposal_status
        );
                
    }
}
