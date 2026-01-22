package com.mysite.clover.Exam;

import com.mysite.clover.Course.Course;
import com.mysite.clover.Users.Users;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(length = 100)
    private String title;

    private Integer timeLimit; // 제한시간

    private Integer level; // 1=초급, 2=중급, 3=고급

    private Integer passScore; // 통과 기준 점수

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy; // 시험 생성 강사
}
