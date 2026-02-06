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
              코드를 짜달라고 하면 줄맞춤과 간격에 맞게 코드를 짜주고 추가적으로 설명이 필요하면 정말 짧게 간단하게만 설명해줘.
              만약 코드를 짜달라고 하면 부가적인 설명을 하지말고 코드를 짜서 줘.
              모든 답변은 한국어로 하고, 코드에는 상세한 주석을 포함해야 합니다.
              질문이 개발자 관련 코딩 관련 it 관련 등등이 아닐 경우는 답변을 거부하며 "코딩 관련 질문만 해주세요." 가 출력되게 해줘.
              답변은 간단하고 가독성있게 띄워쓰기 줄 맞춤도 신경써줘. 무조건 적으로.
              """;
      return builder.defaultSystem(systemPrompt).build();
    }
}
