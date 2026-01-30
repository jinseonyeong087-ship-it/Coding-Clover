package com.mysite.clover.Notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;

  public void createNotification(Users user, String type, String title, String linkUrl) {
    Notification notification = new Notification();
    notification.setUser(user);
    notification.setType(type);
    notification.setTitle(title);
    notification.setLinkUrl(linkUrl);
    notification.setCreatedAt(LocalDateTime.now());
    notificationRepository.save(notification);
  }

  public List<Notification> getNotificationsByUser(Users user) {
    return notificationRepository.findByUserOrderByCreatedAtDesc(user);
  }

  public void markAsRead(Long notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
    notification.setReadAt(LocalDateTime.now());
    notificationRepository.save(notification);
  }

  public void markAllAsRead(Users user) {
    List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
    for (Notification notification : notifications) {
      if (notification.getReadAt() == null) {
        notification.setReadAt(LocalDateTime.now());
      }
    }
    notificationRepository.saveAll(notifications);
  }
}
