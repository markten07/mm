# 실제 캐릭터 화면 · 기억 연출 적용

- 적용일: 2026-11-03
- 실제 화면: 1.html(윤꽃집), 2.html(한소설), 3.html(백비서), 4.html(유감독)
- 진입 → 인물의 정면 초상과 빛나는 기억 → 개인별 5개 장면 → 마지막 범인 여부 확인 → 기억 수첩.
- 첫 안내 후 1~5컷은 확인 버튼 없이 이어진다. 범인 여부를 담은 마지막 장면과 수첩의 정체 확인만 눌러 공개한다.
- 본래의 ME, 단서, 조사 횟수, 투표·서버 규칙은 변경하지 않는다.

## 인물별 이야기와 정보 범위

- 윤꽃집: 한소설의 배신 → 파티의 망신 위협 → 상석 물잔 → 다른 사람이 마신 물. 실제 식당 방문과 말할 화장실 알리바이를 구분한다.
- 한소설: 결혼 계약의 위협 → 투자 실패와 돈 문제 → 테이블 확인을 부탁한 뒤 주방에서 한 행동 → 자신의 자리에 앉은 아내. 아내가 자리를 바꾼 이유 및 실제 사망 원인은 알지 못한다.
- 백비서: 말하지 못한 사랑 → 한소설과 갈라놓으려던 편지 → 서재 물병 → 자신이 목격한 사실. 식당 물잔의 준비자와 주방 안 행동을 알지 못한다.
- 유감독: 불리한 계약과 해외 진출 기대 → 깨진 약속과 한소설에 대한 불신 → 홍대표 몫의 과일청 → 17:40~18:05 통화 → 만찬. 다른 인물의 준비 및 실제 사망 원인은 알지 못한다.

## 기억 수첩

관계, 시간별 전체 행적, 질문별 참고, 배경·남은 기록, 정체, 자기소개를 다시 찾을 수 있다. 백비서와 유감독의 선택적 회의 참고도 유지한다. 자세한 내용은 항목별로 펼친다. 다음 장면 이미지는 해당 인물의 것만 미리 읽는다.

게임 중 재입장하는 사람을 위해 기억을 다 읽기 전에도 첫 화면의 ‘기억 수첩 바로 보기’, 상단 인물명, 하단 ‘내 역할’에서 수첩을 연다. 이 이동은 기억 읽기 완료로 기록하지 않는다. 범인 여부는 수첩에서도 별도 확인을 거친다. 덮기와 움직임 설정 변경 후 펼친 설명과 읽던 스크롤 위치를 복원한다.

## 보호와 게임 연결

- 화면 덮기·포커스 이탈·백그라운드 전환 시 전체 기억 화면을 가린다.
- 조사·단서함으로 이동할 때 모달을 닫아 본게임을 가리지 않는다. 돌아오면 덮기 상태에서 이어본다.
- 마지막 정체는 장면 이동과 덮기 후 재잠금한다. 이전에 확인한 적이 있어도 가려진 상태로 완료를 건너뛸 수 없다.
- 서버 단계 변경은 읽던 장면을 강제로 넘기지 않는다. 수첩에서는 자기소개·조사·단서함의 현재 단계 행동을 제공한다.
- 투표는 캐릭터북 및 덮기 모달보다 우선하며, 본게임의 투표 화면으로 전환한다.
- 진행자 안내도 ‘기억 받기 → 여섯 장면 → 마지막 정체 → 기억 수첩’에 맞췄다.

## 검증

- 네 가지 Node 검사 및 정적 빌드 통과.
- 네 인물 모두 실제 1~4.html의 오프라인 진입, 1~5컷 무확인 진행, 마지막 비밀 잠금·공개·수첩 확인.
- 관계·전체 배경·남은 기록·회의 참고가 수첩에 유지됨을 확인.
- 모바일 390×844 확인. 320×568에서 가로 넘침 없이 다음 버튼 유지, 긴 내용 내부 스크롤 가능. 1280×800에서 이미지·글의 두 영역 배치 확인.
- 새 서버 시험 방 UPQ4에 진행자와 네 참가자를 연결했다. 기존 방은 변경하지 않았다.
- 자기소개 안내 → 예시, 1차 조사 안내 → 조사 보드, 실제 물잔 단서 확보와 자동 보관(유감독), 1차 회의 안내 → 해당 단서함 연결 확인.
- 덮기 모달을 연 윤꽃집을 포함해 네 인물 모두 1차 투표로 전환. 네 명 제출 후 진행자 4/4 집계 확인. 2차 조사로 넘어가면 읽던 장면을 가린 채 복귀하며 이어보기를 누르면 기존 위치가 유지됨을 확인.
- 시험 종료 때 GM 타이머 일시정지. 시험 탭은 정리한다. 다섯 시험 화면의 error/warn 로그는 비어 있었다.
- 브라우저의 휴대폰 크기에서 검증했으며 실제 휴대폰 OS의 앱 전환 미리보기는 현장 확인 대상이다.

## 그림 원칙

같은 저택의 짙은 목재, 버건디, 황동 조명과 푸른 창빛으로 통일했다. 글자는 HTML 자막으로 제공한다. 그림은 분위기와 행동의 장소를 떠올리는 연출이며 증거 실물·정확한 공간 배치가 아니다. 새 서명, 문서 내용, 숫자, 약물 투입 과정, 다른 인물의 비밀은 묘사하지 않는다. 기존 정면 초상, 저택 식당, 한소설 계약서·주방 이미지는 재사용했다.

## 이미지 제작: 내장 ImageGen

공통 프롬프트:

Use case: illustration-story. Asset type: ONE full-bleed vertical 1024x1536 cinematic still for the private character memory sequence of a Korean mansion murder mystery. Photographic realism, restrained psychological thriller, dark walnut furnishings, muted burgundy, warm antique brass practical lamps, cool blue ambient shadows, fine film grain. Upper and middle area holds the scene; bottom third naturally dark and uncluttered for HTML subtitles. No readable text, numbers, labels, signatures, logos, people, hands, blood, UI, borders, or collage. Atmospheric illustration only, never invent an evidentiary document or exact room geography. 

### assets/memory-flowers.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A small elegant neighborhood florist's work counter at dusk. A modest bouquet of pale flowers, greenery, wrapping paper and a closed plain manuscript on worn dark wood. Soft warm lamplight, defocused shop window in blue dusk. Sense of someone who once helped a writer and was abandoned. No poison, no document text.

### assets/memory-glass.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A close view of ONE ordinary crystal water glass with ice, beside a closed simple stainless steel tumbler, on the edge of a burgundy-clothed round dining table in a luxurious mansion. Warm candle reflections and very dim chandelier bokeh, rainy blue window far behind. Do not show a substance being added, chemicals, cutaways, unusual ice shapes, numbered seats or poison indicators. Glass and tumbler occupy the middle upper area.

### assets/memory-letters.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A few plain unmarked envelopes and a folded sheet lying on a discreet walnut writing desk in a mansion, soft amber lamp, a dark upholstered chair, moody blue rain light. An intimate restrained image suggesting unspoken affection and letters kept secret. No photos, hearts, handwriting, readable messages, seals, names or weapons. Envelopes in upper-middle, shadow below.

### assets/memory-bottle.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A single closed clear glass water bottle sitting on a dark walnut desk in an elegant mansion writer's study. Out-of-focus books, antique brass reading lamp and rain-blue window behind. Plain bottle, ordinary clear water, no labels. Muted burgundy and warm amber consistent with the same mansion dining room. No glasses, flowers, chemistry, poison symbols, added substances or hands. Upper-middle composition, bottom third dark.

### assets/memory-director.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A film director's quiet workspace inside the same old luxury mansion. A plain film clapperboard with NO lettering or numbers, a neatly stacked unmarked script and a few contract papers with only indistinct lines, on a dark walnut table. A warm antique reading lamp with a blue rainy window behind. No wedding ring. Sense of a career promised but withheld, not romantic. Mid-upper focal plane, cinematic dark negative space below.

### assets/memory-fruit.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A single closed glass jar of amber fruit preserve intended as an ordinary gift, on a dark walnut sideboard in the same burgundy and brass mansion. Modest cloth gift wrap alongside it, no labels, readable text or marks. Warm candle-like reflections, blue rain window bokeh. No chemical bottles, ingredients being added, smoking objects, medical symbols or hands. The jar must look like a normal fruit preserve, not a poison prop. Upper-middle composition with dark lower third.

### assets/memory-balcony.png

공통 프롬프트에 아래 문장을 이어 붙여 생성했다.

A quiet exterior stone balcony of the same luxury mansion at blue dusk. Rain-dark garden beyond an ornate dark railing, warm amber light spilling through an open doorway behind camera. A plain black smartphone with an unlit blank screen resting on the dry stone ledge under a covered part of the balcony. No person, cigarettes, smoke, text, time display or call log. The composition only evokes a director's outdoor business call; do not imply a visible alibi witness or an exact path. Phone and railing in upper-middle focal plane, lower third shadowed.

