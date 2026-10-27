# 배포 준비 상태

- 소스 저장소: https://github.com/markten07/mm (Private)
- GitHub 계정 인증 및 main 업로드 완료.
- 최초 업로드 커밋: 60f08d1d1ab4866ddeceec1f9be2dd01177e239b
- GitHub Actions 검사/정적 파일 묶음 생성 성공: https://github.com/markten07/mm/actions/runs/40444325100
- 현재 GitHub 요금제는 이 Private 저장소의 Pages를 지원하지 않는다는 422 응답을 반환했다. 저장소 공개 여부는 변경하지 않았다.
- `_site/`는 실제 배포 파일이며 HTML 6개와 assets를 포함한다. 작업 문서와 검사 코드는 사이트 배포 묶음에서 제외한다.
- QR은 현재 배포 주소와 현재 방 코드를 사용한다. 예전 사이트 주소에 고정되지 않는다.

## 공개 링크를 만들기 위한 남은 선택

1. GitHub에서 Private Pages를 지원하는 요금제를 사용한 뒤 Pages를 활성화하거나,
2. 저장소는 Private로 유지하고 별도 호스팅 서비스로 게임 파일을 전송해 공개 배포한다.

Sites 호스팅은 비공개 초안 등록만 되었으며, 게임 소스 전송 단계가 자동 승인 검토에서 차단되었다. 다른 서비스에 비공개 게임 소스를 전송할 명시적 사용자 승인이 필요하다는 이유다. 사이트 업로드·저장 버전·공개 배포는 실행되지 않았다. 재시도 시에는 `.hosting/mm-site/.openai/hosting.json`의 기존 프로젝트 ID를 재사용해야 한다.
호스팅 준비 폴더 `.hosting/`는 Git에 포함하지 않는다. 인증 토큰은 파일이나 저장소에 저장하지 않는다.
