# 백엔드 설정에서 필요한 것

## build.gradle 설정
gradledependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // CORS 처리를 위한 의존성 (선택)
    implementation 'org.springframework.boot:spring-boot-starter-security'
}


## CORS 설정 (WebConfig.java)
java.pa

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }

}


## SpringBoot에서 React 사용 시 폴더 구조

Coding-Clover/
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│           └── static/  (React 빌드 결과물 위치)
└── frontend/  (React 프로젝트)
    ├── public/
    ├── src/
    ├── package.json
    └── build/

# 프엔 파일 보려면 

## npm install
Coding-Clover/frontend/ 경로에서 npm install

## npm run dev
브라우저에서 띄우기
