package com.mysite.clover.Notification;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationDto {
  private Long id;
  private String type;
  private String title;
  private String linkUrl;
  private LocalDateTime readAt;
  private LocalDateTime createdAt;

  public static NotificationDto fromEntity(Notification notification) {
    return NotificationDto.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .linkUrl(notification.getLinkUrl())
        .readAt(notification.getReadAt())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
