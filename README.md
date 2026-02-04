# Coding-Clover
커밋
git fetch          원격 저장소 상태만 가져오기 (내 코드 안 바뀜)
git pull           원격(main) → 로컬(main) 동기화
git branch         현재 브랜치가 main인지 확인
git status         변경사항이 있는지 확인
git add .          변경 파일 스테이징
git commit -m ""   스테이징된 변경사항 커밋
git push origin main  원격(main)에 업로드
git push origin sub  원격(sub)에 업로드

풀
git branch         현재 브랜치가 main인지 확인
git fetch          원격 저장소 상태만 가져오기 (내 코드 안 바뀜)
git status         현재 작업 트리 상태 확인
git pull           원격(main) → 로컬(main) 동기화
git status         pull 이후 변경사항 재확인

최근 커밋과 현재 파일의 차이점 보는 명령어
git diff               j/k로 스크롤바 조작, q 연타해서 종료
git diff 커밋아이디     특정 커밋과 차이점 확인
q                      git diff 이후 나오기

커밋 아이디 확인하는 방법
git log --oneline --all    명령어 입력 후 노란색으로 표시되는 글자

익스텐션 깃 그래프(git grap) 설치면 깃 로그 보기 편함
https://codingapple.com/unit/git-diff-difftool-vscode/?id=37473

백 서버 켜기
.\gradlew bootRun

클린하고 켜기
.\gradlew clean bootRun

git checkout main: main 브랜치로 이동
git pull origin main: main 브랜치 최신화 (혹시 모를 충돌 방지)
git merge sub: sub 브랜치의 내용을 main에 합치기
git push origin main: 합친 내용을 깃허브(서버)에 올리기


챗봇 테스트방법
1. 백엔드 서버 켜기
2. http://localhost:3333/ask?message=(할말)
3. 답변보기

질문당 0.1~0.5원? 라고는 하지만 선영님 자산이니 다들 테스트는 한두번만~


수강생 페이지에서 - 결제는 카카오페이만