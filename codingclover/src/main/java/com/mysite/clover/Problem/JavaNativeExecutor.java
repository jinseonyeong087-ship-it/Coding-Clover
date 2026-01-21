package com.mysite.clover.Problem;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class JavaNativeExecutor implements CodeExecutor {

  @Override
  public ExecutionResponse run(ExecutionRequest request) {
    long startTime = System.currentTimeMillis();
    Path tempDir = null;

    try {
      // 1. 임시 디렉토리 생성 (각 요청마다 별도 폴더 사용)
      tempDir = Files.createTempDirectory("java-exec-");

      // 2. 소스 파일(Main.java) 생성
      File sourceFile = new File(tempDir.toFile(), "Main.java");
      // 여기서 UTF-8로 저장해야 컴파일러가 깨지지 않음
      Files.write(sourceFile.toPath(), request.getCode().getBytes(StandardCharsets.UTF_8));

      // 3. 컴파일 (javac -encoding UTF-8 Main.java)
      ProcessBuilder compileBuilder = new ProcessBuilder("javac", "-encoding", "UTF-8", sourceFile.getAbsolutePath());
      compileBuilder.directory(tempDir.toFile());
      Process compileProcess = compileBuilder.start();

      // 컴파일 에러 캡처 (UTF-8로 읽기)
      String compileError = readStream(compileProcess.getErrorStream());
      boolean compiled = compileProcess.waitFor(5, TimeUnit.SECONDS);

      if (!compiled || compileProcess.exitValue() != 0) {
        return ExecutionResponse.builder()
            .output("")
            .error("컴파일 에러:\n" + compileError)
            .executionTime(System.currentTimeMillis() - startTime)
            .build();
      }

      // 4. 실행 (java -cp . Main) -> 윈도우 기본 인코딩 사용
      ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", "Main");
      runBuilder.directory(tempDir.toFile());
      Process runProcess = runBuilder.start();

      // 입력값(System.in)이 있다면 넣어주기
      if (request.getInput() != null && !request.getInput().isEmpty()) {
        runProcess.getOutputStream().write(request.getInput().getBytes());
        runProcess.getOutputStream().flush();
        runProcess.getOutputStream().close();
      }

      // 실행 결과 캡처
      // 10초 타임아웃 (무한루프 방지)
      boolean finished = runProcess.waitFor(10, TimeUnit.SECONDS);

      if (!finished) {
        runProcess.destroy(); // 강제 종료
        return ExecutionResponse.builder()
            .output("")
            .error("시간 초과 (10초)")
            .executionTime(System.currentTimeMillis() - startTime)
            .build();
      }

      String output = readStream(runProcess.getInputStream());
      String error = readStream(runProcess.getErrorStream());

      return ExecutionResponse.builder()
          .output(output)
          .error(error)
          .executionTime(System.currentTimeMillis() - startTime)
          .build();

    } catch (Exception e) {
      return ExecutionResponse.builder()
          .output("")
          .error("서버 내부 오류: " + e.getMessage())
          .executionTime(System.currentTimeMillis() - startTime)
          .build();
    } finally {
      // 5. 뒷정리 (임시 파일 삭제)
      // 파일 삭제 로직은 생략하거나 별도 유틸로 처리 (윈도우에서는 파일 락 때문에 바로 안 지워질 수도 있음)
      deleteDirectory(tempDir.toFile());
    }
  }

  private String readStream(java.io.InputStream stream) throws IOException {
    // 윈도우(MS949) 환경에 맞춰서 읽기
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, "MS949"))) {
      return reader.lines().collect(Collectors.joining("\n"));
    }
  }

  private void deleteDirectory(File directory) {
    if (directory == null || !directory.exists())
      return;
    File[] files = directory.listFiles();
    if (files != null) {
      for (File file : files) {
        file.delete();
      }
    }
    directory.delete();
  }
}
