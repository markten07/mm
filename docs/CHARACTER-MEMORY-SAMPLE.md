# 한소설 · 기억 전이 시안

- 시안 페이지: `character-memory-sample.html`
- 공개 경로: https://markten07.github.io/mm/character-memory-sample.html
- 제작일: 2026-11-02
- 이미지와 짧은 독백, 직접 넘기기로 구성한 6컷 인터랙티브 시안. 영상 파일 및 음성 내레이션은 사용하지 않는다.
- 본게임의 네 캐릭터 화면 및 진행자 화면에는 아직 연결하지 않았다. 서버 통신·게임 데이터·진행 상태·브라우저 저장소를 사용하지 않는다.

## 장면 구성

1. 나의 얼굴: 한소설의 정면 초상, 직업과 홍대표와의 관계, 파티 목적.
2. 나의 두려움: 아내의 과거 조사, 결혼 계약의 이혼·금전적 배상 조건.
3. 나의 결심: 투자 실패, 유산과 보험, 살충제를 구입한 이유. 확인 전 비공개.
4. 나의 행동: 19:30 식당 확인을 부탁한 백비서와 주방의 한소설. 확인 전 비공개.
5. 어긋난 만찬: 19:40 상석의 홍대표, 20:00 사망. 자리 변경 이유는 모른다.
6. 나만 아는 진실: 살해 시도와 실제 범인 여부 구분, 추궁 시 사실대로 답하는 규칙. 확인 전 비공개.

원문 기준은 `2.html`, `assets/rolebook-profiles.js`의 한소설 설정이다. 다른 인물만 아는 범행이나 실제 사망 원인을 추가하지 않는다. 빚 액수, 약물 용량, 서명, 동선의 공간 배치 등 새 증거를 만들지 않는다.

## 조작과 보호

- 자동 넘김 없음. 이전·다음 및 이미 방문한 장면으로 이동 가능.
- 핵심 문장은 기본 노출, 보충 설명은 장면별 펼치기로 제공.
- 비밀 장면은 클릭 전 제목·본문·추가 설명을 DOM에 넣지 않는다.
- 다음 장면으로 이동하거나 덮기를 사용하면 비밀 재확인이 필요하다.
- 창 포커스 이탈, 백그라운드 전환, 페이지 이동 시 비밀을 가리고 덮는다.
- 새로고침하면 첫 화면으로 돌아간다. 진행 정보를 저장하지 않는다.
- 움직임 줄이기 버튼 및 OS의 reduced-motion 설정 지원.
- 마지막에는 관계·행적·비밀을 빠르게 다시 찾는 기억 수첩을 제공한다.
- 연출 이미지는 단서가 아니라는 문구를 표시한다.

## 검증

- 기존 네 가지 검사와 정적 빌드 통과.
- 브라우저에서 6컷을 끝까지 진행, 관계 목록과 8개 행적, 재열기·가리기·덮기·움직임 줄이기 확인.
- 390×844 모바일과 1280×800 데스크톱 확인. 320×568에서 가로 넘침이 없고 다음 버튼이 화면 안에 유지됨. 작은 화면의 본문·보충 설명은 내부 스크롤 가능.
- 덮기 상태에서 비밀 본문이 DOM에서 제거되고 main이 보이지 않음을 확인.
- 다른 페이지를 방문하고 뒤로 돌아왔을 때 첫 화면으로 복귀하며 비밀이 노출되지 않음을 확인.
- 실제 휴대폰 및 배경 전환의 OS 앱 전환 미리보기는 추가 현장 확인 대상이다.

## 이미지 제작 기록

내장 ImageGen 도구로 각각 생성했다. 기존 인물 사진과 저택 이미지는 재사용했다.

- 계약서 이미지: `assets/memory-han-contract.png`
- 주방 이미지: `assets/memory-han-kitchen.png`
- UI: `assets/character-memory.css`, `assets/character-memory.js`

### 계약서 이미지 최종 프롬프트

Use case: illustration-story. Asset type: cinematic still for a mobile Korean murder mystery game's private character-memory sequence. Create ONE full-bleed vertical portrait image, 1024x1536 composition. A close-up of an unsigned marriage contract and a simple wedding ring lying on a dark polished wooden writing desk, black fountain pen nearby. Papers only show small indistinct illegible writing, NO readable text, no headings, no symbols floating outside the scene. Camera looks diagonally down, papers in upper and middle two thirds, lower third is almost black negative space so HTML captions can overlay. Luxury old mansion study, understated contemporary Korean psychological thriller atmosphere, film photography realism, warm narrow desk-lamp light from left, very deep charcoal shadows, subtle muted bronze highlights, fine film grain, restrained, emotionally tense. Match the existing game's moody warm-brown and midnight-blue mansion photographic style. No people, no hands, no blood, no logos, no UI, no borders, no collage, no split panels. This is atmospheric illustration, not an evidentiary image: do not invent signatures, amounts, dates, names or legal clauses.

### 주방 이미지 최종 프롬프트

Use case: illustration-story. Asset type: ONE cinematic memory still for a mobile Korean murder mystery game. Full-bleed vertical portrait image 1024x1536 composition. An empty dark luxury mansion kitchen, seen at counter height. One small porcelain bowl of soup with fine steam on a stone countertop, positioned in the upper-middle area, an out-of-focus open doorway behind suggests an adjacent dining room. No people, no hands, no poison container or chemicals, no depiction of preparation steps. Match cinematic photographic realism of a restrained Korean psychological thriller, low-key warm amber practical light on bowl, deep cool black shadows, subtle fine film grain, antique luxurious wood in background. Bowl is naturally sized, not an extreme product shot. Keep bottom third mostly shadowed with uncluttered negative space for HTML captions. No readable text, no logos, no captions, no UI, no borders, no collage, no inset frames. The image conveys a character remembering a secret action but only the unoccupied kitchen and bowl are visible.
