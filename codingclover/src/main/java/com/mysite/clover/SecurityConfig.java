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
            .requestMatchers(new AntPathRequestMatcher("/student/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/debug/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/**")).permitAll())
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
            .defaultSuccessUrl("http://localhost:5173", true));
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
    DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver = new DefaultOAuth2AuthorizationRequestResolver(
        clientRegistrationRepository, "/oauth2/authorization");

    authorizationRequestResolver.setAuthorizationRequestCustomizer(
        authorizationRequestCustomizer -> authorizationRequestCustomizer
            .additionalParameters(params -> params.put("prompt", "select_account")));

    return authorizationRequestResolver;
  }
}