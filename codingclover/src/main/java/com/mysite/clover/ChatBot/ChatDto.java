package com.mysite.clover.ChatBot;

import java.time.LocalDateTime;

public class ChatDto {
  private String message;
  private LocalDateTime time;

  public ChatDto(String message) {
    this.message = message;
    this.time = LocalDateTime.now();
  }

  public String getMessage() {
    return message;
  }

  public LocalDateTime getTime() {
    return time;
  }
}
