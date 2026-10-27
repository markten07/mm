(() => {
  // A fictional neutral guide drawn in SVG; no character or plot secrets.
  const portrait=`<svg viewBox="0 0 80 100" role="img" aria-label="사건 담당 형사"><path d="M5 100V81Q12 64 40 64Q68 64 75 81V100" fill="#42546a"/><path d="M29 67L40 83L51 67" fill="#e8e1d2"/><path d="M37 80H43L46 100H34Z" fill="#aa8652"/><ellipse cx="40" cy="42" rx="21" ry="26" fill="#d9b698"/><path d="M19 40V27Q22 8 42 11Q64 12 62 39L53 25Q37 34 23 29Z" fill="#24313f"/><path d="M28 43H34M46 43H52" stroke="#24313f" stroke-width="3" stroke-linecap="round"/><path d="M35 57Q40 60 45 57" fill="none" stroke="#785b4d" stroke-width="2"/><path d="M16 80L24 69L36 96M64 80L56 69L44 96" fill="none" stroke="#8497a7" stroke-width="2"/><path d="M60 83L65 86L63 92H57L55 86Z" fill="#ddbd7b"/></svg>`;
  const lines=[
    ['사건을 풀기 전에, 함께 지켜야 할 약속을 확인하겠습니다.','화면의 네 가지 규칙을 함께 읽어주세요.'],
    ['여러분 각자의 이야기를 먼저 확인해주세요. 비밀은 혼자 읽어야 합니다.','휴대폰의 ‘내 역할 확인하기’를 누르고 질문을 순서대로 읽어주세요. 정체는 혼자 확인하세요.'],
    ['이제 한 분씩 자신을 소개해주세요. 예시 문장을 읽어도 괜찮습니다.','각자 1분 30초 동안 이름, 관계, 사건 당시 위치를 말해주세요.'],
    ['현장 조사를 시작하겠습니다. 어떤 공간에 단서가 남아 있을까요?','휴대폰 조사 탭에서 공간의 카드 더미를 눌러주세요.'],
    ['찾아낸 증거를 함께 살펴보겠습니다. 작은 단서도 도움이 됩니다.','단서함을 열고, 한 명씩 단서 이름과 발견 장소를 말해주세요.'],
    ['지금 누구를 의심하고 있는지 확인하겠습니다.','휴대폰에서 인물 카드를 선택하고 투표를 제출해주세요.'],
    ['앞선 이야기에서 궁금했던 점을 떠올리며 다시 조사해주세요.','휴대폰 조사 탭에서 남은 공간의 단서를 찾아주세요.'],
    ['이번에는 증거를 바탕으로 서로에게 질문해보겠습니다.','단서 이름을 말하고 질문하세요. 추궁받으면 규칙에 따라 답해주세요.'],
    ['마지막 조사입니다. 아직 확인하지 못한 공간을 살펴보세요.','남은 조사 기회를 쓰고 단서함에서 증거를 정리해주세요.'],
    ['마지막으로 각자의 생각을 듣겠습니다.','각자 1분 30초 동안 의심하는 인물, 근거, 자신의 결백을 말해주세요.'],
    ['이제 마지막 판단을 내릴 시간입니다.','휴대폰에서 최종 범인을 선택하고 투표를 제출해주세요.']
  ];
  const box=document.createElement('aside');box.className='ux-host';box.setAttribute('aria-label','담당 형사의 진행 안내');
  document.getElementById('rdesc').insertAdjacentElement('afterend',box);
  function update(){const line=lines[ri];if(!line)return;box.innerHTML=`${portrait}<div><small>사건 담당 형사 · 진행 안내</small><p>${line[0]}</p><span><b>지금 할 일</b> · ${line[1]}</span></div>`;}
  const original=startRound;startRound=function(i){original(i);update();};update();
})();
