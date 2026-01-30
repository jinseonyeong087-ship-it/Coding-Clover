package com.mysite.clover.Notification;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mysite.clover.Users.Users;
import com.mysite.clover.Users.UsersRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;
  private final UsersRepository usersRepository;

  @GetMapping
  public ResponseEntity<List<NotificationDto>> getNotifications(Principal principal) {
    Users user = usersRepository.findByLoginId(principal.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));
    List<Notification> notifications = notificationService.getNotificationsByUser(user);
    List<NotificationDto> dtos = notifications.stream()
        .map(NotificationDto::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<Void> markAsRead(@PathVariable("id") Long id) {
    notificationService.markAsRead(id);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/read-all")
  public ResponseEntity<Void> markAllAsRead(Principal principal) {
    Users user = usersRepository.findByLoginId(principal.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));
    notificationService.markAllAsRead(user);
    return ResponseEntity.ok().build();
  }
}
