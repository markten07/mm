저택 살인사건 — 벌툰 머더미스터리 POC
─────────────────────────────────────
index.html   GM 진행 화면
1.html 윤꽃집(진범) / 2.html 한소설 / 3.html 백비서 / 4.html 유감독
assets/      이미지 · 스타일 · 나레이션 mp3 — 반드시 함께 올릴 것

[배포] GitHub 저장소에 통째로 업로드
       Settings > Pages > Deploy from a branch > main / (root)

[진행] 1. index.html → 방 코드 4자리 표시
       2. 플레이어 4명이 QR로 1~4.html 접속 후 방 코드 입력
       3. [시작하기] → 나레이션 + 프롤로그 5장 (약 1분 55초)
       4. 11단계 90분 자동 진행
       5. 최종 변론: [경찰이 추가로 확보한 증거] 버튼으로 하나씩 공개
       6. 최종 투표 후 [범인 확인하기] → 진상 공개 10장 (약 3분 17초)

[나레이션]
  프롤로그  assets/prologue-narration.mp3  113초
            장별 시작 시각: index.html 의 PRO_AT 배열 (ms)
            현재 0 / 22608 / 50868 / 62172 / 89302
  진상공개  assets/reveal-narration.mp3    197.4초
            슬라이드 시작 시각은 실행 시 자동 계산 (REV_AT)
            전체 길이가 다른 파일로 교체하면 RV_AUDIO_MS 만 수정

  * 음성과 자막이 어긋나면 위 숫자만 조정하면 됩니다

[2026-10-23 안전 업데이트]
  - 새 버전 저장 경로: mm/v2/rooms/{방코드}
  - 기존 mm/{방코드} 데이터 및 Firebase 설정/권한 규칙은 수정하지 않음
  - 새 방 생성은 트랜잭션으로 처리하며, 코드가 겹치면 다른 코드로 재시도
  - 진행자는 같은 탭 새로고침 시 기존 방과 진행 단계/타이머 복구
    프롤로그는 처음 화면으로, 진상 공개는 첫 장으로 돌아감
  - 플레이어 역할은 탭의 입장 토큰으로 점유. 새로고침하면 방 코드 입력 화면 표시
    같은 탭에서 같은 방으로 직접 재입장하면 기존 역할·단서·조사 횟수 복원
    다른 탭/기기로 역할을 옮기는 기능은 없음. 필요 시 진행자가 새 게임 생성
  - 새 게임 버튼은 새 방을 생성하며 이전 방 데이터는 삭제하지 않음
  - v1 진행 중인 방에는 수정본 플레이어로 접속 불가. 새 게임부터 적용

[반영 방법]
  index.html 및 1.html~4.html을 함께 게시해야 함 (기존 assets 유지).
  이 폴더에는 배포 설정 및 Firebase 보안 규칙 파일이 없음.
  실제 서버 설정/데이터는 이번 로컬 수정에서 변경하지 않았음.
  현재 Firebase 규칙이 새 경로를 허용하는지 게시 전 확인 필요.
  역할 점유와 조사 제한은 화면 코드 기준이며 서버 권한 강화를 대체하지 않음.

[검증]
  node tests/check-game.cjs
  HTML 스크립트 구문, 저장 경로 분리, 방 충돌, 조사 종료, 타이머 검사.

[화면 개선]
  개선 계획: docs/UX-IMPROVEMENT-PLAN.md
  영상 제작 구성안: docs/VIDEO-STORYBOARD.md
  개인 화면 공통: assets/player-experience.css / .js
  진행자 안내 공통: assets/host-guide.css / .js
  HTML과 위 assets 파일을 함께 게시해야 합니다.
  추가 검사: node tests/check-experience.cjs
  영상 파일 제작과 음성 진행자, 완료 인원 집계는 아직 포함되지 않았습니다.

[캐릭터북 디자인 시안]
  character-book-sample.html — 지금 할 일 + 한소설의 질문별 역할 안내 + 시간별 행적 찾기
  상단 ‘시안’ 버튼에서 역할 확인·조사·회의 등 단계별 안내 체험
  설계 설명: docs/CHARACTER-BOOK-SAMPLE.md
  기존 게임과 분리된 시안으로 방·단서·투표 데이터에 접근하지 않음.

[네 캐릭터 캐릭터북 적용]
  1.html~4.html 모두 시안 기반의 10개 질문형 캐릭터북을 사용합니다.
  인물별 동기·동선·행동 도식·기록 카드·질문별 참고를 제공합니다.
  정체는 눌러 확인하며, 조사·단서함은 기존 게임에 연결됩니다.
  필수 파일: assets/rolebook-ui.js, rolebook-profiles.js, rolebook-host.css,
            character-book-sample.css 및 기존 portrait 이미지.
  검증: node tests/check-rolebook.cjs (기존 게임/조사 검사도 함께 실행).
  상세: docs/CHARACTER-BOOK-LIVE.md
