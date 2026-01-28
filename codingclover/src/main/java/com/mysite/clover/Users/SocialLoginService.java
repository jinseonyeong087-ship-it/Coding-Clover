package com.mysite.clover.Users;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
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

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        Users user = usersRepository.findByEmail(email)
                .orElseGet(() -> {
                    Users newUser = new Users();
                    newUser.setLoginId(registrationId + "_" + attributes.get("sub"));
                    newUser.setName(name);
                    newUser.setEmail(email);
                    newUser.setRole(UsersRole.STUDENT);
                    newUser.setStatus(UsersStatus.ACTIVE);
                    return usersRepository.save(newUser);
                });

        return oAuth2User;
    }
}