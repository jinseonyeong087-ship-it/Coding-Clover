package com.mysite.clover;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysite.clover.Users.ApiLoginFail;
import com.mysite.clover.Users.ApiLoginFilter;
import com.mysite.clover.Users.ApiLoginSuccess;
import com.mysite.clover.Users.UsersRepository;
import com.mysite.clover.Users.UsersSecurityService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private final ObjectMapper objectMapper;
  private final UsersRepository usersRepository;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf((csrf) -> csrf.disable())
        .authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
            .requestMatchers(new AntPathRequestMatcher("/**")).permitAll())
        .formLogin((formLogin) -> formLogin.disable()) // 기본 폼 로그인 비활성화
        .addFilterBefore(apiLoginFilter(), UsernamePasswordAuthenticationFilter.class) // JSON 필터 추가
        .logout((logout) -> logout
            .logoutRequestMatcher(new AntPathRequestMatcher("/api/auth/logout")) /// auth/logout -> /api/auth/logout 통일
            .logoutSuccessUrl("/")
            .invalidateHttpSession(true));

    return http.build();
  }

  @Bean
  public ApiLoginFilter apiLoginFilter() {
    ApiLoginFilter filter = new ApiLoginFilter(objectMapper);
    filter.setAuthenticationManager(authenticationManager());
    filter.setAuthenticationSuccessHandler(apiLoginSuccess());
    filter.setAuthenticationFailureHandler(apiLoginFail());
    return filter;
  }

  @Bean
  public ApiLoginSuccess apiLoginSuccess() {
    return new ApiLoginSuccess(objectMapper, usersRepository);
  }

  @Bean
  public ApiLoginFail apiLoginFail() {
    return new ApiLoginFail(objectMapper);
  }

  @Bean
  public AuthenticationManager authenticationManager() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setPasswordEncoder(passwordEncoder());
    provider.setUserDetailsService(userDetailsService());
    return new ProviderManager(provider);
  }

  @Bean
  public UserDetailsService userDetailsService() {
    return new UsersSecurityService(usersRepository);
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
