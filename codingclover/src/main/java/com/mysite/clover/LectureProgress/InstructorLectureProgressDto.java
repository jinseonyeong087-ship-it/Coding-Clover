package com.mysite.clover.LectureProgress;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InstructorLectureProgressDto {
    
    private Long lectureId;
    private String lectureTitle;

    private Long studentId;
    private String studentName;

    //수강 완료 여부
    private Boolean completedYn;
    private LocalDateTime lastWatchedAt;
}