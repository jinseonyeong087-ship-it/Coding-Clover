package com.mysite.clover.Lecture;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class YoutubeService {

    @Value("${youtube.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    // URL에서 비디오 ID만 추출 (v=V6xZmoIyTR8 -> V6xZmoIyTR8)
    public String extractVideoId(String url) {
        Pattern pattern = Pattern.compile("(?:v=|youtu\\.be/|embed/)([a-zA-Z0-9_-]{11})");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) return matcher.group(1);
        throw new IllegalArgumentException("유효하지 않은 유튜브 URL입니다.");
    }

    // 유튜브 API 호출하여 재생 시간(초) 반환
    public int fetchDuration(String videoUrl) {
        String videoId = extractVideoId(videoUrl);
        String apiUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + videoId 
                      + "&part=contentDetails&key=" + apiKey;

        try {
            JsonNode response = restTemplate.getForObject(apiUrl, JsonNode.class);
            String isoDuration = response.get("items").get(0)
                                         .get("contentDetails").get("duration").asText();
            
            // ISO 8601(PT4M13S)을 초 단위로 변환
            return (int) Duration.parse(isoDuration).getSeconds();
        } catch (Exception e) {
            // 에러 발생 시 기본값 0 혹은 예외 처리
            return 0;
        }
    }
}