package com.mysite.clover.LectureProgress;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentLectureProgressDto {

  private Long progressId;
  private Long lectureId;
  private String lectureTitle;
  private Integer orderNo;
  private Boolean completedYn;
  private LocalDateTime lastWatchedAt;
}