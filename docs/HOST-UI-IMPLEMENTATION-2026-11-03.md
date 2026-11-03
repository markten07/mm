# 진행자 화면 개선 및 검증

## 규칙 화면 최종 수정

사용자 피드백에 따라 아래의 규칙 4페이지 구성을 철회했다. 현재는 2×2 카드에 네 규칙을 동시에 표시하며, 규칙별 클릭과 다음 단계 잠금은 없다. 규칙 화면의 탐정 안내는 숨겨 카드에 공간을 배정했다. 번호·핵심 제목을 강조하고 기존 규칙 설명은 모두 유지했다. 자동 검사도 네 규칙 동시 표시 및 클릭 없이 다음 단계 진행을 검증하도록 변경했다.

## 2026-11-04 단계별 화면 구성

규칙을 한 장씩 넘기는 4페이지로 변경하고, 마지막 규칙을 본 뒤 다음 단계로 이동하도록 구성했다. 타이머 갱신은 규칙 페이지를 초기화하지 않는다. 규칙·투표에서는 탐정 안내를 축소하고 낮은 화면의 투표에서는 별도 탐정 안내를 생략한다. 추가 증거 공개 이력은 긴 목록 대신 수량과 다시 보기 버튼으로 표시하고 한 장씩 이전·다음으로 확인한다. 반응형 간격·텍스트 크기를 조절하되 화면 밖 내용을 강제로 잘라내는 방식은 쓰지 않았다. 규칙 이동 및 단계별 영역 표시를 자동 검사했다. 이번 변경 후 브라우저의 모든 화면 크기에서 무스크롤 여부를 직접 검증한 것은 아니다.

## 2026-11-04 테스트용 임시 변경

사용자 요청으로 `assets/host-state.js`의 `allowIncompleteVotes`를 true로 설정했다. 중간·최종 투표가 미완료여도 진행자가 다음 단계와 진상 공개 준비로 이동할 수 있다. 미완료 투표의 이름·득표수는 계속 숨긴다. 화면 버튼과 미완료 상태의 진상 공개 준비 안내에 테스트 진행임을 표시한다. 전원 제출을 다시 필수로 만들 때는 이 값을 false로 변경한다. 자동 검사에서 일반 모드의 차단과 테스트 모드의 진행 허용을 모두 확인했다.

## 적용 내용

- 투표 중에는 제출 인원만 표시. 누가 투표했는지와 득표수는 숨김. 유효한 네 명의 투표가 모이면 후보별 합계만 공개.
- 중간·최종 투표 모두 전원 제출 전 다음 단계 차단. 최종 진상 공개 진입에도 동일한 검사 적용.
- 시간 종료 시 현재 단계 유지. 1분 연장으로 재개하거나 진행자가 다음 단계 선택. 수동 일시정지 및 새로고침 복구 유지.
- 서버의 players와 taken 기록으로 입장 기록 및 해당 조사 회차의 사용·남은 횟수 표시.
- 입장은 실시간 접속 상태 또는 역할 읽기 완료가 아님을 화면에서 안내.
- 지금 할 일, 시간, 참가자 현황, 접을 수 있는 상세 방법, 하단 진행 버튼으로 화면 정리.
- 완료된 투표에서는 지금 할 일도 결과 확인 안내로 변경.
- 탐정 초상 교체. 안내는 기본 글로 제공하고 ‘안내 듣기’를 선택한 경우에만 음성 재생.
- 모바일 390px에서 상단 두 줄 구성과 음성 버튼 글자 유지, 후보별 결과 2열 적용.

## 실제 서버 검증: NXCT

사용자가 승인한 테스트 방에만 네 역할을 입장시켰다.

1. 입장 수 3/4 → 4/4 실시간 반영.
2. 윤꽃집이 조사 카드 한 장 획득 → 진행자에 1번 사용 / 2번 남음 표시, 단서함에 한 장 유지.
3. 중간 투표 3/4 상태에 이름·득표수 미노출, 다음 버튼 비활성화.
4. 자연 타이머 종료 후 00:00에서 단계 유지. 1분 연장 후 01:00부터 재개.
5. 네 번째 투표 후 후보별 합계 공개 및 다음 버튼 활성화.
6. 2차 조사 진입 시 각자 0번 사용 / 3번 남음으로 회차별 표시.
7. 최종 조사·변론·최종 투표 단계 전달 확인.
8. 최종 투표도 3/4에서 공개 차단, 4/4에서 결과 공개.
9. 최종 투표 일시정지 후 새로고침 시 NXCT·02:35·일시정지·결과 복구.
10. 진행자 및 네 참가자 탭에서 수집된 콘솔 오류 없음.
11. 최종 네 명 제출 후 진상 공개 준비 화면 정상 진입.

모바일 화면은 브라우저 390×844 뷰포트로 확인했다. 실제 휴대폰 여러 대, 네트워크 단절 상황, 음성 품질의 실기기 확인은 별도이다. 입장 현황은 실시간 온라인 인원이 아니다.

## 자동 검사

check-host, check-game, check-experience, check-rolebook, check-player-shell, check-memory-portal, check-deployment 통과. 정적 사이트 빌드 통과. 새 check-host 검사를 GitHub Actions에 추가했다.

## 탐정 이미지

선택 자산: `assets/host-detective-v2.png`

imagegen skill / 내장 이미지 도구 사용. 신규 생성 후 얼굴 그림자를 강화하는 편집 1회. 불투명 배경. 생성 원본도 별도로 유지했다.

생성 프롬프트:

> Use case: stylized-concept. Asset: original detective narrator portrait for a Korean mansion murder mystery game, to replace a flat cartoon policeman. Create a cinematic realistic noir bust portrait of a fictional anonymous adult detective, centred and facing the viewer, cropped from chest upward, full hat visible with breathing room. Wears a charcoal felt fedora, dark grey textured trench coat over a black shirt. His face is an almost completely black, featureless shadow beneath the brim; only a subtle natural mouth is visible, no visible eyes, no glowing eyes, no visible nose detail. Calm approachable composure, not threatening, no smile with teeth. Warm muted brass rim light on hat and coat, restrained cool shadow, realistic fabric and photographic film texture. Match the mood of serious cinematic Korean mystery character portraits in a dim mansion. Plain near-black charcoal background blends into a dark UI, no scenery or props. Chest and shoulders occupy lower half, hat and head prominent enough to read at small UI size. Square image. No text, no badge, no gun, no cartoon, no vector, no chibi, no superhero mask, no fantasy glow. This is a new fictional character, not based on an actor.

편집 프롬프트:

> Use case: lighting-weather. Edit this detective portrait only: keep the exact hat, coat, realistic cinematic photography style, composition and background. Make ALL face skin and ears and neck almost entirely featureless solid near-black shadow, including cheeks, chin, jaw and nose. Only a subtle narrow mouth line should remain visible within the black face. No eyes, no skin patches, no human chin highlights. Retain warm rim light on hat and outer coat only. The effect should be an anonymous shadow-faced narrator in a serious mansion mystery, not a cartoon. Preserve the natural mouth shape, no teeth. No text.

로컬 변경이며 GitHub 업로드 및 공개 배포는 아직 수행하지 않았다.
