package com.mysite.clover.ChatBot;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.CrossOrigin;// Spring Security 차단 파악 용
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @GetMapping("/ask")
    public ChatDto ask(@RequestParam(value="message") String message) {
        try {
            // ai 질문 받는 곳
            String Chatanswer = chatClient.prompt()
            .user(message)
            .call()
            .content();
            // DTO 에 담기 (json 형식을 위함)
            return new ChatDto(Chatanswer);
        } catch (Exception e) {
            // 예외 발생 시 에러 메시지를 담은 DTO 반환 (프론트엔드 JSON 파싱 에러 방지)
            return new ChatDto("죄송합니다. AI 서비스 연결 중 오류가 발생했습니다: " + e.getMessage());
        }
        // (value="message") 추가
        // try catch 문으로 예외처리
    }
}   