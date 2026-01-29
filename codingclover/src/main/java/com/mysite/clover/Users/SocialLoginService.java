package com.mysite.clover.Users;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocialLoginService extends DefaultOAuth2UserService {

    private final UsersRepository usersRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 어떤 소셜인지 구별함
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId = null;
        String email = null;
        String name = null;

        // 구글일때
        if ("google".equals(registrationId)) {
            providerId = (String) attributes.get("sub"); // 구글 ID는 문자열
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        }
        // 카카오일때
        else if ("kakao".equals(registrationId)) {
            // 카카오 id는 숫자여서 문자열로 바꾼다는데.. 왜지?
            providerId = String.valueOf(attributes.get("id"));
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount != null) {
                email = (String) kakaoAccount.get("email");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                if (profile != null) {
                    name = (String) profile.get("nickname");
                }

                if (name == null) {
                    Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
                    if (properties != null) {
                        name = (String) properties.get("nickname");
                    }
                }
            }
        }
        // 네이버일때
        else if ("naver".equals(registrationId)) {
            providerId = String.valueOf(attributes.get("id"));
            Map<String, Object> naverAccount = (Map<String, Object>) attributes.get("response");
            if (naverAccount != null) {
                email = (String) naverAccount.get("email");
                name = (String) naverAccount.get("name");
            }
        }

        String loginId = registrationId + "_" + providerId;

        // 사용자가 카카오 로그인 할때 이메일 제공을 거부했을 시에 임시로라도 이메일 주소 만듬
        String finalEmail = (email != null) ? email : loginId + "@codingclover.com";
        String finalName = (name != null) ? name : "Unknown";

        Users user = usersRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    Users newUser = new Users();
                    newUser.setLoginId(loginId);
                    newUser.setPassword(UUID.randomUUID().toString());
                    newUser.setName(finalName);
                    newUser.setEmail(finalEmail);
                    newUser.setRole(UsersRole.STUDENT);
                    newUser.setStatus(UsersStatus.ACTIVE);
                    return usersRepository.save(newUser);
                });

        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        Map<String, Object> newAttributes = new HashMap<>(attributes);
        newAttributes.put("email", finalEmail);

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                newAttributes,
                userNameAttributeName);
    }
}