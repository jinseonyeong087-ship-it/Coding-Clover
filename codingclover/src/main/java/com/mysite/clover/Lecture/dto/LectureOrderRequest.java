package com.mysite.clover.Lecture.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class LectureOrderRequest {
  private List<OrderItem> orders;

  @Getter
  @Setter
  public static class OrderItem {
    private Long lectureId;
    private Integer orderNo;
  }
}
