# 저택 살인사건 — 머더미스터리

진행자 화면 한 개와 참가자 네 명의 휴대폰으로 진행하는 정적 웹 게임입니다.
GitHub 저장소: https://github.com/markten07/mm

## 화면

| 파일 | 용도 |
|---|---|
| `index.html` | 진행자·방 생성·공용 진행·투표 집계·진상 공개 |
| `1.html`~`4.html` | 네 인물의 캐릭터북·조사·단서함·투표 |
| `character-book-sample.html` | 서버와 분리된 디자인 검토용 시안 |

진행자가 생성한 방 코드로 참가자가 입장합니다. QR은 현재 사이트 주소와 방 코드로 생성되므로, 배포 경로가 바뀌어도 해당 사이트의 참가자 화면으로 연결됩니다.
새로고침 후 진행자는 같은 방의 진행을 복구합니다. 참가자는 직접 재입장하며, 같은 탭에서 같은 방으로 들어가면 기존 단서와 조사 횟수를 복구합니다.

## 로컬 실행

```sh
python3 -m http.server 8000
```

http://localhost:8000/ 에서 진행자 화면을 열어주세요. 휴대폰 QR 접속은 공개 배포 주소에서 확인합니다.

## 검사와 배포 파일 만들기

```sh
node tests/check-game.cjs
node tests/check-experience.cjs
node tests/check-rolebook.cjs
node tests/check-deployment.cjs
python3 scripts/build-site.py
```

`_site/` 폴더가 실제 배포 파일입니다. 검사 코드와 작업 문서는 이 폴더에 포함되지 않습니다. 일반 정적 호스팅에 업로드할 수 있으며, Node 서버나 별도 빌드는 필요하지 않습니다.

GitHub Pages는 GitHub Free에서 Public 저장소를 지원합니다. Private 저장소의 Pages 사용은 해당 GitHub 요금제에서 지원해야 합니다. 저장소 공개 여부는 배포를 위해 자동으로 변경하지 않습니다.

## 서버 연결

기존 Firebase Realtime Database 설정과 `mm/v2/rooms/{방코드}` 경로를 사용합니다. 배포 파일만 바꾸며, 데이터베이스 권한 규칙이나 기존 방 데이터를 변경하지 않습니다.
브라우저용 Firebase 설정은 정적 파일에 포함되어 있습니다. 서버 관리용 서비스 계정 키나 GitHub 토큰은 저장소에 넣지 않습니다.

## 구성

- `assets/rolebook-ui.js`: 공유 캐릭터북과 게임 화면 연결
- `assets/rolebook-profiles.js`: 인물별 행동 이유·행적·대화 참고
- `assets/player-experience.js`: 조사·자동 보관·단서함·투표 UI
- `assets/room-qr.js`: 현재 배포 주소와 방 코드 기반 QR
- `docs/`: 설계·검토·검증 기록

QR 라이브러리의 출처와 MIT 고지는 `assets/vendor/LICENSE-qrcode-generator.txt`를 참고하세요. 게임 콘텐츠 자체에 별도 오픈소스 라이선스를 부여한 것은 아닙니다.

## GitHub Actions

`main`에 올리면 네 가지 검사 후 사이트 파일을 묶어 `github-pages` 산출물을 생성합니다.
GitHub Pages를 지원하는 저장소에서 Pages의 소스를 GitHub Actions로 설정하고,
저장소 Actions 변수 `DEPLOY_GITHUB_PAGES=true`를 지정하면 자동 공개 배포합니다.
변수가 없으면 검사와 파일 생성만 실행하며, 비공개 저장소를 임의로 공개 전환하지 않습니다.
