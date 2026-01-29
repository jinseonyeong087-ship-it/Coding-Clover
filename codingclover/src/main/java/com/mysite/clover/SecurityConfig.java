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
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysite.clover.Users.ApiLoginFail;
import com.mysite.clover.Users.ApiLoginFilter;
import com.mysite.clover.Users.ApiLoginSuccess;
import com.mysite.clover.Users.SocialLoginService;
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
  private final SocialLoginService socialLoginService;
  private final ClientRegistrationRepository clientRegistrationRepository;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // 1. 강사 및 관리자 전용 경로를 가장 먼저 설정 (우선순위)
            .requestMatchers(new AntPathRequestMatcher("/instructor/**")).hasRole("INSTRUCTOR")
            .requestMatchers(new AntPathRequestMatcher("/admin/**")).hasRole("ADMIN")
            
            // 2. 누구나 접근 가능한 경로
            .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/student/**")).permitAll()
            
            // 3. 나머지 모든 경로는 허용하되, 위 조건들을 먼저 체크함
            .requestMatchers(new AntPathRequestMatcher("/**")).permitAll()
            .anyRequest().authenticated()

            // 아이디/비밀번호 찾기
            .requestMatchers("/auth/register", "/auth/status", "/auth/findId", "/auth/findPassword").permitAll()
        )
        .formLogin(form -> form.disable())
        .addFilterBefore(apiLoginFilter(), UsernamePasswordAuthenticationFilter.class)
        .logout(logout -> logout
            .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
            .logoutSuccessUrl("/")
            .invalidateHttpSession(true))
        .oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint(authorization -> authorization
                .authorizationRequestResolver(authorizationRequestResolver(clientRegistrationRepository)))
            .userInfoEndpoint(userInfo -> userInfo
                .userService(socialLoginService))
            .defaultSuccessUrl("http://localhost:5173", true))
        .exceptionHandling(e -> e
            // 인증되지 않은 요청에 대해 로그인 페이지 리다이렉트 대신 401 상태 코드 반환
            // (브라우저의 fetch 요청이 CORS 오류 없이 실패를 감지할 수 있도록 함)
            .authenticationEntryPoint(new org.springframework.security.web.authentication.HttpStatusEntryPoint(
                org.springframework.http.HttpStatus.UNAUTHORIZED)));
    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("http://localhost:5173");
    configuration.addAllowedOrigin("http://localhost:5174");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public ApiLoginFilter apiLoginFilter() {
    ApiLoginFilter filter = new ApiLoginFilter(objectMapper);
    filter.setAuthenticationManager(authenticationManager());
    filter.setAuthenticationSuccessHandler(apiLoginSuccess());
    filter.setAuthenticationFailureHandler(apiLoginFail());
    filter.setSecurityContextRepository(
        new org.springframework.security.web.context.HttpSessionSecurityContextRepository());
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

  private OAuth2AuthorizationRequestResolver authorizationRequestResolver(
      ClientRegistrationRepository clientRegistrationRepository) {

    DefaultOAuth2AuthorizationRequestResolver defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
        clientRegistrationRepository, "/oauth2/authorization");

    return new OAuth2AuthorizationRequestResolver() {
      @Override
      public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(
          jakarta.servlet.http.HttpServletRequest request) {
        org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest req = defaultResolver
            .resolve(request);
        return customize(req);
      }

      @Override
      public org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest resolve(
          jakarta.servlet.http.HttpServletRequest request, String clientRegistrationId) {
        org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest req = defaultResolver
            .resolve(request, clientRegistrationId);
        return customize(req);
      }

      private org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest customize(
          org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest req) {
        if (req == null)
          return null;

        String registrationId = req
            .getAttribute(org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames.REGISTRATION_ID);
        org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest.Builder builder = org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest
            .from(req);

        if ("google".equals(registrationId)) {
          builder.additionalParameters(params -> params.put("prompt", "select_account"));
        } else if ("naver".equals(registrationId)) {
          builder.additionalParameters(params -> params.put("auth_type", "reprompt"));
        }

        return builder.build();
      }
    };
  }
}