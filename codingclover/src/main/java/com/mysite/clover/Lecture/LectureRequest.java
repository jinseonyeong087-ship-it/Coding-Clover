package com.mysite.clover.Lecture;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LectureRequest {
    private String title;
    private int orderNo;
    private String videoUrl;
    private int duration;
}
