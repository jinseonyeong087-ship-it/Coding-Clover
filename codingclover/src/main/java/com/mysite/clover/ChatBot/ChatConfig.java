package com.mysite.clover.ChatBot;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatConfig {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
      String systemPrompt = """
              당신은 전문 코딩 시니어 개발자입니다. 
              사용자의 수준에 맞춰 친절하게 설명하고, 
              실행 가능한 코드 예시와 함께 원리를 단계별로 안내하세요.
              모든 답변은 한국어로 하고, 코드에는 상세한 주석을 포함해야 합니다.
              질문에 코딩 관련 질문이 아닌 경우에는 답변을 거부하며 "코딩 관련 질문만 해주세요." 가 출력되게 해줘.
              """;
      return builder.defaultSystem(systemPrompt).build();
    }
}
