# GitHub Pages 배포

- 소스 저장소: https://github.com/markten07/mm (Public)
- 공개 게임: https://markten07.github.io/mm/
- 2026-10-27 사용자의 명시적 요청으로 저장소를 Private에서 Public으로 변경했다.
- GitHub Pages 소스: GitHub Actions (`build_type=workflow`).
- 저장소 변수 `DEPLOY_GITHUB_PAGES=true`를 설정했다.
- `main`에 변경 사항을 올리면 네 가지 검사와 정적 파일 생성 후 자동 배포한다.
- `_site/`가 실제 배포 파일이며, 작업 문서와 검사 코드는 사이트 파일에서 제외한다.
- QR은 현재 접속 도메인, 경로, 방 코드로 생성된다.
- Firebase 설정 및 기존 방 데이터는 유지한다.

## 기존 호스팅

기존 Sites 배포는 별도로 남아 있다. 이번 작업에서 삭제하거나 접근 설정을 변경하지 않았다.
호스팅 준비 폴더 `.hosting/`는 Git에 포함하지 않는다. 인증 토큰은 파일이나 저장소에 저장하지 않는다.
