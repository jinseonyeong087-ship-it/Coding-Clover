package com.mysite.clover;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
            .requestMatchers(new AntPathRequestMatcher("/**")).permitAll())
        .csrf((csrf) -> csrf.disable()) // H2 콘솔이나 API 테스트 시 불편할 수 있어 예외적으로 disable (필요에 따라 설정)
        .formLogin((formLogin) -> formLogin
            .loginPage("/auth/login")
            .defaultSuccessUrl("/"))
        .logout((logout) -> logout
            .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
            .logoutSuccessUrl("/")
            .invalidateHttpSession(true));
    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
