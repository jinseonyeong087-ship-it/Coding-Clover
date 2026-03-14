package com.mysite.clover.ScoreHistory.dto;

import com.mysite.clover.ScoreHistory.ScoreHistory;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ScoreHistoryDto {
    private Long historyId;
    private String examTitle;    // 시험 제목
    private String courseTitle;  // 강좌 제목
    private String studentName;  // 학생 이름 (강사/관리자용)
    private Integer score;       // 점수
    private Boolean passed;      // 통과 여부
    private Integer attemptNo;   // 응시 회차
    private LocalDateTime createdAt;

    public static ScoreHistoryDto fromEntity(ScoreHistory history) {
        ScoreHistoryDto dto = new ScoreHistoryDto();
        dto.setHistoryId(history.getHistoryId());
        dto.setExamTitle(history.getExam().getTitle());
        dto.setCourseTitle(history.getExam().getCourse().getTitle());
        dto.setStudentName(history.getUser().getName());
        dto.setScore(history.getScore());
        dto.setPassed(history.getPassed());
        dto.setAttemptNo(history.getAttemptNo());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }
}