package com.mysite.clover.AiQuiz;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin
public class AiQuizController {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AiQuizController(ChatClient chatClient, ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @org.springframework.beans.factory.annotation.Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @PostMapping("/instructor/exam/ai-generate")
    public org.springframework.http.ResponseEntity<?> generateQuiz(@RequestBody AiQuizRequestDto request) {
        String script = request.getScript();
        int questionCount = request.getQuestionCount() > 0 ? request.getQuestionCount() : 3;

        // 1. 유튜브 자막 직접 서버 단위에서 파싱 (CORS 우회)
        if (request.getYoutubeUrl() != null && !request.getYoutubeUrl().trim().isEmpty()) {
            try {
                script = fetchYoutubeTranscript(request.getYoutubeUrl());
                // 토큰 제한을 위해 최대 15,000자로 요약 자르기
                if (script != null && script.length() > 15000) {
                    script = script.substring(0, 15000);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return org.springframework.http.ResponseEntity.status(500)
                        .body(java.util.Map.of("message", "유튜브 자막 추출 실패(제한된 영상이거나 자막이 없음): " + e.getMessage()));
            }
        }

        // script가 비어있는지 체크
        if (script == null || script.trim().isEmpty()) {
            return org.springframework.http.ResponseEntity.status(400)
                    .body(java.util.Map.of("message", "대본 내용 또는 유튜브 자막이 비어있습니다."));
        }

        String prompt = "너는 IT 개발 교육 전문가야. 다음은 강의 대본 혹은 요약 텍스트야.\n" +
                "이 내용을 바탕으로 수강생들의 이해도를 체크하기 위한 객관식(5지 선다) 문제 " + questionCount + "개를 출제해 줘.\n\n" +
                "조건 1: 반드시 제공된 텍스트 내용 안에서 출제해.\n" +
                "조건 2: 형태는 무조건 아래의 JSON 규격을 정확히 지켜서 대답해(다른 불필요한 말은 빼고 JSON만 응답해). 배열 항목 수가 딱 " + questionCount
                + "개가 되도록 맞춰.\n\n" +
                "{\"questions\": [\n" +
                "  {\n" +
                "    \"questionText\": \"문제 내용\",\n" +
                "    \"option1\": \"보기 1\",\n" +
                "    \"option2\": \"보기 2\",\n" +
                "    \"option3\": \"보기 3\",\n" +
                "    \"option4\": \"보기 4\",\n" +
                "    \"option5\": \"보기 5\",\n" +
                "    \"correctAnswer\": 1(1~5 사이의 정답 번호 숫자)\n" +
                "  }\n" +
                "]}\n\n" +
                "강의 대본: " + script;

        try {
            String aiAnswer = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // AI가 JSON 코드블럭(```json ... ```)으로 감싸서 리턴할 경우 파싱 전 제거
            aiAnswer = aiAnswer.trim();
            if (aiAnswer.startsWith("```json")) {
                aiAnswer = aiAnswer.substring(7);
            } else if (aiAnswer.startsWith("```")) {
                aiAnswer = aiAnswer.substring(3);
            }
            if (aiAnswer.endsWith("```")) {
                aiAnswer = aiAnswer.substring(0, aiAnswer.length() - 3);
            }

            // JSON 파싱
            return org.springframework.http.ResponseEntity
                    .ok(objectMapper.readValue(aiAnswer.trim(), AiQuizResponseDto.class));

        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "AI 문제 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // 유튜브 URL에서 VideoId 추출
    private String extractVideoId(String url) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern
                .compile("(?:v=|youtu\\.be/|embed/)([a-zA-Z0-9_-]{11})");
        java.util.regex.Matcher matcher = pattern.matcher(url);
        if (matcher.find())
            return matcher.group(1);
        throw new IllegalArgumentException("유효하지 않은 유튜브 URL입니다.");
    }

    // 서버 측 유튜브 STT(음성 인식) 자막 추출 핵심 로직
    private String fetchYoutubeTranscript(String url) throws Exception {
        String videoId = extractVideoId(url);
        String uuid = java.util.UUID.randomUUID().toString();
        // m4a 형식은 OpenAI Whisper API가 기본 지원하므로 ffmpeg가 필요없습니다.
        java.io.File audioFile = new java.io.File(System.getProperty("java.io.tmpdir"), "yt_audio_" + uuid + ".m4a");

        try {
            // 1. Download audio using yt-dlp (python module)
            ProcessBuilder pb = new ProcessBuilder(
                    "python", "-m", "yt_dlp",
                    "-f", "bestaudio[ext=m4a]",
                    "-o", audioFile.getAbsolutePath(),
                    url);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // wait for it with timeout 5 minutes
            boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.MINUTES);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("오디오 다운로드 시간이 초과되었습니다 (5분).");
            }
            if (process.exitValue() != 0) {
                java.io.InputStream is = process.getInputStream();
                String errorOutput = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                throw new RuntimeException("yt-dlp 오디오 다운로드 실패: " + errorOutput);
            }

            if (!audioFile.exists() || audioFile.length() == 0) {
                throw new RuntimeException("다운로드된 오디오 파​​일이 존재하지 않거나 용량이 0입니다.");
            }

            // 2. Upload to OpenAI Whisper STT API
            String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(
                    "https://api.openai.com/v1/audio/transcriptions").openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + openAiApiKey);
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (java.io.OutputStream os = conn.getOutputStream();
                    java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.OutputStreamWriter(os, "UTF-8"),
                            true)) {

                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"model\"").append("\r\n\r\n");
                writer.append("whisper-1").append("\r\n");

                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + audioFile.getName() + "\"")
                        .append("\r\n");
                writer.append("Content-Type: audio/mp4").append("\r\n\r\n");
                writer.flush();

                java.nio.file.Files.copy(audioFile.toPath(), os);
                os.flush();

                writer.append("\r\n").append("--" + boundary + "--").append("\r\n");
                writer.flush();
            }

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                java.io.InputStream errorStream = conn.getErrorStream();
                String errorResponse = errorStream != null ? new String(errorStream.readAllBytes(), "UTF-8") : "";
                throw new RuntimeException("OpenAI Whisper API 에러 (코드 " + responseCode + "): " + errorResponse);
            }

            try (java.io.InputStream is = conn.getInputStream()) {
                String responseBody = new String(is.readAllBytes(), "UTF-8");
                com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(responseBody);
                if (jsonNode.has("text")) {
                    return jsonNode.get("text").asText();
                } else {
                    throw new RuntimeException("Whisper 응답에 text 필드가 없습니다: " + responseBody);
                }
            }
        } finally {
            if (audioFile.exists()) {
                audioFile.delete();
            }
        }
    }
}
