package com.mysite.clover.Users;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/auth")
@Controller
public class UsersController {

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }
}
