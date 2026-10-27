# 배포 준비 상태

- 소스 저장소: https://github.com/markten07/mm (Private)
- GitHub 계정 인증 및 main 업로드 완료.
- 최초 업로드 커밋: 60f08d1d1ab4866ddeceec1f9be2dd01177e239b
- GitHub Actions 검사/정적 파일 묶음 생성 성공: https://github.com/markten07/mm/actions/runs/40444325100
- 현재 GitHub 요금제는 이 Private 저장소의 Pages를 지원하지 않는다는 422 응답을 반환했다. 저장소 공개 여부는 변경하지 않았다.
- `_site/`는 실제 배포 파일이며 HTML 6개와 assets를 포함한다. 작업 문서와 검사 코드는 사이트 배포 묶음에서 제외한다.
- QR은 현재 배포 주소와 현재 방 코드를 사용한다. 예전 사이트 주소에 고정되지 않는다.

## 공개 배포 완료

- 공개 게임: https://markten-mm.dnduf8507.chatgpt.site
- 호스팅: Sites, 공개 접속 허용. GitHub 저장소는 Private 유지.
- 2026-10-27 사용자가 Sites 파일 전송 및 공개 배포를 승인한 뒤 업로드했다.
- Sites 프로젝트: appgprj_6ae01aa9cd788191b0b6608cd31ab797
- 배포 소스 커밋(Sites 별도 저장소): c9d1668056fead25cf29701ba6fe51f579361987
- 저장 버전: appgprj_6ae01aa9cd788191b0b6608cd31ab797~appgver_ce3cf98d40788191a565fcf2f8aee174 (1)
- 배포: appgdep_6ae01ca906d48191a2b205846c6b4af4
- 네이티브 배포 결과: succeeded, 2026-10-27T03:38:37.176439+00:00
- GitHub Actions는 검사/파일 생성이며, Sites 자동 연속 배포는 설정하지 않았다.

이전 자동 승인 검토 차단은 사용자 명시 승인 후 해소되었다. 재배포 시 `.hosting/mm-site/.openai/hosting.json`의 기존 프로젝트 ID를 재사용한다.
호스팅 준비 폴더 `.hosting/`는 Git에 포함하지 않는다. 인증 토큰은 파일이나 저장소에 저장하지 않는다.
