# 🧩 코딩 테스트 시스템 설계 (Flexible Pattern)

이 설계의 핵심은 **"교체 가능한 부품"**으로 만드는 것입니다.
처음에는 **빠르고 쉬운 방식**으로 만들고, 나중에 **강력하고 안전한 방식**으로 언제든 갈아끼울 수 있게 설계합니다.

---

## 🏗️ 전체 구조도 (Architecture)

마치 전구 소켓과 같습니다. 소켓(Interface)은 그대로 두고 전구(Impl)만 갈아끼우면 됩니다.

```mermaid
[ 웹 브라우저 (React) ]
       ⬇️ (코드 전송)
[ 백엔드 컨트롤러 (Spring Boot) ]
       ⬇️ (실행 요청)
[[ 🔌 코드 실행기 인터페이스 (CodeExecutor) ]] 👈 핵심!
       ⬇️
       ⬇️ ----------------------------------
       ⬇️ (선택 1)                         ⬇️ (선택 2 - 나중)
[ ⚡ 단순 실행기 (ProcessBuilder) ]    [ 🐳 도커 실행기 (Docker) ]
       ⬇️                                  ⬇️
   (내 컴퓨터에서 바로 실행)           (안전한 방/컨테이너에서 실행)
```

---

## 🛠️ 상세 구현 전략

### 1단계: ⚡ 단순 실행기 (ProcessBuilder) - **현재 목표!**
가장 빨리 구현해서 눈으로 결과를 볼 수 있는 방식입니다.

*   **작동 원리**: 자바의 `cmd` 명령어를 코드로 칩니다.
*   **장점**:
    1.  구현이 쉽다 (코드 50줄).
    2.  팀원들이 **Docker를 설치할 필요가 없다**.
    3.  반응 속도가 매우 빠르다.
*   **단점**:
    1.  무한 루프 돌면 서버 렉 걸릴 수 있음 (타임아웃으로 방어 가능).
    2.  보안에 취약함 (나중에 보완).

### 2단계: 🐳 도커 실행기 (Docker) - **미래 목표**
여유가 생기면 갈아끼울 "고급 부품"입니다.

*   **작동 원리**: 코드를 실행할 때마다 **1회용 가상 컴퓨터**를 만듭니다.
*   **장점**:
    1.  서버가 절대 죽지 않음 (격리됨).
    2.  해킹 불가능 (파일 지워도 가상 컴퓨터만 지워짐).
*   **단점**:
    1.  구현이 어렵고 복잡함.
    2.  실행할 때마다 약간의 딜레이가 생김.

---

## 📝 우리가 만들 코드 (미리보기)

### 1. 껍데기 (Interface)
```java
// "자, 코드를 줄 테니 실행하고 결과를 다오."
public interface CodeExecutor {
    String run(String code); 
}
```

### 2. 가벼운 부품 (JavaNativeExecutor)
```java
// "내 컴퓨터에서 바로 돌릴게!"
@Service
@Primary // 일단 이걸 기본으로 쓴다!
public class JavaNativeExecutor implements CodeExecutor {
    public String run(String code) {
        // ProcessBuilder로 javac, java 실행...
        return "결과물";
    }
}
```

### 3. 무거운 부품 (DockerExecutor) - 나중에 구현
```java
// "안전하게 도커 방에서 돌릴게!"
@Service
// @Primary // 나중에 이것만 붙이면 교체 완료!
public class DockerExecutor implements CodeExecutor {
    public String run(String code) {
        // Docker 컨테이너 만들고 실행...
        return "결과물";
    }
}
```

---

## ✅ 결론
1.  우리는 **`CodeExecutor`라는 인터페이스**를 먼저 만듭니다.
2.  지금 당장은 **`ProcessBuilder` 방식**으로 구현체를 채워넣습니다.
3.  그러면 **오늘 안에** 웹에서 코드가 실행되는 걸 볼 수 있습니다! 🎉
