package com.mysite.clover.ChatBot;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @GetMapping("/ask")
    public ChatDto ask(@RequestParam String message) {
        // ai 질문 받는 곳
        String Chatanswer = chatClient.prompt()
        .user(message)
        .call()
        .content();
        // DTO 에 담기 (json 형식을 위함)
        return new ChatDto(Chatanswer);
    }
}   