package com.mysite.clover.Search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private Long id;
    private String title;
    private String authorName;
    private LocalDateTime regDate;
    private String status;
    private String category; // COURSE, NOTICE 등 구분용
}
