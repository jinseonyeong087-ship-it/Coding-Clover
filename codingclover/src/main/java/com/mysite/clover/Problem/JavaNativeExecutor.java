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

      // 2. 소스 파일(main.java) 생성 (public class main 지원)
      File sourceFile = new File(tempDir.toFile(), "main.java");
      // 여기서 UTF-8로 저장해야 컴파일러가 깨지지 않음
      Files.write(sourceFile.toPath(), request.getCode().getBytes(StandardCharsets.UTF_8));

      // 3. 컴파일
      ProcessBuilder compileBuilder = new ProcessBuilder("javac", "-encoding", "UTF-8", sourceFile.getAbsolutePath());
      compileBuilder.directory(tempDir.toFile());
      Process compileProcess = compileBuilder.start();

      boolean compiled = compileProcess.waitFor(5, TimeUnit.SECONDS);

      // 컴파일 에러 캡처 (종료 후 읽기)
      // 주의: 컴파일러 출력이 버퍼를 가득 채우면 waitFor에서 멈출 수 있으나,
      // javac 에러 메시지는 보통 짧으므로 큰 문제는 안됨.
      // 완벽히 하려면 별도 스레드로 읽어야 하지만 여기선 순서만 바꿈.
      String compileError = readStream(compileProcess.getErrorStream());

      if (!compiled || compileProcess.exitValue() != 0) {
        return ExecutionResponse.builder()
            .output("")
            .error("컴파일 에러:\n" + compileError)
            .executionTime(System.currentTimeMillis() - startTime)
            .build();
      }

      // 4. 실행 (java -cp . main)
      // ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", "Main");
      // 윈도우 환경에서 한글 깨짐 방지를 위해 -Dfile.encoding=UTF-8 옵션 추가 고려 가능하나,
      // 현재 콘솔 출력(MS949)을 읽고 있으므로 주의 필요. 일단 그대로 둠.
      ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", "main");
      runBuilder.directory(tempDir.toFile());
      Process runProcess = runBuilder.start();

      // [핵심 수정] 입력값(System.in) 처리 - 입력이 없어도 닫아줘야 EOF가 전달됨
      try (java.io.OutputStream os = runProcess.getOutputStream()) {
        if (request.getInput() != null && !request.getInput().isEmpty()) {
          os.write(request.getInput().getBytes(StandardCharsets.UTF_8)); // UTF-8로 입력 전달
          os.flush();
        }
      } catch (IOException e) {
        // 스트림 쓰기 중 에러는 무시하거나 로그 (프로세스가 이미 종료되었을 수 있음)
        System.err.println("입력값 전달 중 에러: " + e.getMessage());
      }

      // 실행 결과 캡처
      // 10초 타임아웃 (무한루프 방지)
      boolean finished = runProcess.waitFor(10, TimeUnit.SECONDS);

      if (!finished) {
        runProcess.destroyForcibly(); // 강제 종료 강화
        return ExecutionResponse.builder()
            .output("")
            .error("시간 초과 (10초)")
            .executionTime(System.currentTimeMillis() - startTime)
            .build();
      }

      // 이미 종료된 프로세스의 스트림 읽기
      String output = readStream(runProcess.getInputStream(), "MS949");
      String error = readStream(runProcess.getErrorStream(), "MS949");

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
      deleteDirectory(tempDir.toFile());
    }
  }

  // 인코딩 파라미터 추가
  private String readStream(java.io.InputStream stream, String encoding) throws IOException {
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, encoding))) {
      return reader.lines().collect(Collectors.joining("\n"));
    }
  }

  // 오버로딩 (기존 호환성) - 컴파일 에러는 UTF-8로 읽어야 할 수도 있음 (javac 옵션에 따름)
  private String readStream(java.io.InputStream stream) throws IOException {
    return readStream(stream, "MS949");
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
