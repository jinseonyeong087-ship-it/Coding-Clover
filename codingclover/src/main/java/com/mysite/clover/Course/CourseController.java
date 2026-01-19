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
import com.mysite.clover.Users.UsersSecurityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/course")
@RequiredArgsConstructor
@Controller
public class CourseController {

    private final CourseService cs;
    private final UsersSecurityService uss;

    @GetMapping("/list")
    public String list(Model model) {
        model.addAttribute("courseList", cs.getList());
        return "course_list";
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/create")
    public String courseCreate(CourseForm courseForm) {
        return "course_form";
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create")
    public String courseCreate(
            @Valid CourseForm courseForm,
            BindingResult bindingResult,
            Principal principal) {

        if (bindingResult.hasErrors()) {
            return "course_form";
        }

        Users user = uss.getUser(principal.getName());

        cs.create(
                courseForm.getTitle(),
                courseForm.getDescription(),
                courseForm.getPrice(),
                user
        );

        return "redirect:/course/list";
    }
}
