package com.mysite.clover.Notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mysite.clover.Users.UsersRole;
import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UsersRepository usersRepository;

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
    // 7일 이내의 알림만 조회
    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
    return notificationRepository.findByUserAndCreatedAtAfterOrderByCreatedAtDesc(user, sevenDaysAgo);
  }

  public void markAsRead(Long notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
    notification.setReadAt(LocalDateTime.now());
    notificationRepository.save(notification);
  }

  public void deleteNotification(Long notificationId, Users user) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

    if (notification.getUser().getUserId() != user.getUserId()) {
      throw new SecurityException("No permission to delete this notification");
    }

    notificationRepository.delete(notification);
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

  public void notifyAdmins(String type, String title, String linkUrl) {
    List<Users> admins = usersRepository.findByRole(UsersRole.ADMIN);
    for (Users admin : admins) {
      createNotification(admin, type, title, linkUrl);
    }
  }

  public void notifyUsers(List<Users> users, String type, String title, String linkUrl) {
    for (Users user : users) {
      createNotification(user, type, title, linkUrl);
    }
  }

  public long countUnread(Users user) {
    return notificationRepository.countByUserAndReadAtIsNull(user);
  }
}
