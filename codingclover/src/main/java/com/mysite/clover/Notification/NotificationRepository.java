package com.mysite.clover.Notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mysite.clover.Users.Users;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserOrderByCreatedAtDesc(Users user);

  List<Notification> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(Users user, java.time.LocalDateTime date);

  long countByUserAndReadAtIsNull(Users user);
}
