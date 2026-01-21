package com.mysite.clover.Lecture;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LectureRequest {
    private String title;
    private int orderNo;
    private String videoUrl;
    private int duration;
}
