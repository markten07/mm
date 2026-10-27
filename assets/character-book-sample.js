(() => {
  'use strict';
  const d=window.CHARACTER_SAMPLE;
  const $=s=>document.querySelector(s);
  const main=$('#book-content'),actions=$('#page-action');
  const state={route:'home',phase:'role',page:0,started:false,done:false,topic:'',time:'5',openAnswer:-1,practice:false,practiceFace:false,returnRoute:'home',scrolls:{},expanded:{},identityVisible:false,identityRead:false};
  const phases={role:{name:'역할 확인',title:'내 역할부터 알아볼까요?',desc:'지금은 각자 역할을 읽는 시간입니다. 누가 되어 무엇을 해야 하는지 한 화면씩 안내할게요.'},intro:{name:'자기소개',title:'이제 한소설로 인사해주세요.',desc:'이름과 직업, 피해자와의 관계를 말해주세요. 준비된 예시를 그대로 읽어도 괜찮습니다.'},investigate:{name:'1차 조사',title:'어떤 공간을 살펴볼까요?',desc:'공간의 맨 위 카드를 선택하세요. 확보한 단서는 내 단서함에 자동으로 보관됩니다.'},meeting:{name:'1차 회의',title:'찾은 단서를 말로 공유하세요.',desc:'단서 이름과 발견 장소를 한 명씩 이야기해주세요. 기억이 흐리면 내 행적도 다시 볼 수 있어요.'},vote:{name:'최종 투표',title:'누가 범인이라고 생각하나요?',desc:'확보한 단서와 다른 사람의 진술을 떠올려보세요. 실제 투표는 게임 화면에서 진행합니다.'}};
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  const textBlock=(title,text,kind='')=>`<div class="fact-block ${kind}"><span>${title}</span><p>${text}</p></div>`;
  const thought=text=>`<div class="inner-voice"><span>한소설의 속마음</span><p>${text}</p></div>`;
  // Context stays shared between the guided reading and the quick reference.
  const motive={
    fear:'아내 홍대표가 당신의 과거를 알아보려 하고 있었습니다. 결혼 계약에는 과거의 잘못이 드러나면 이혼하고, 당신에게 책임이 있다면 금전적 피해보상까지 해야 한다는 조항이 있었습니다.',
    money:'그런데 투자마저 실패해 큰돈이 필요해졌습니다. 과거가 드러날까 두려운 상황에서 돈 문제까지 겹치자, 당신은 아내가 죽은 뒤의 유산과 사망보험을 알아봤습니다.',
    decision:'당신은 결국 <b>아내를 죽이려는 계획을 세웠습니다.</b> 그 계획에 사용할 살충제를 본인 명의로 샀고, 만찬 당일 아내의 수프에 넣었습니다.',
    recap:'아내가 과거를 알아내면 이혼과 금전적 피해보상을 감당해야 했습니다. 투자 실패로 돈까지 필요해진 당신은 유산과 보험을 알아봤고, 아내를 죽이려 살충제를 준비했습니다.'
  };
  const disclosure=(title,body)=>`<details class="more-context"><summary>${title}</summary><div>${body}</div></details>`;
  const motiveMap=()=>`<ol class="cause-path" aria-label="살해 계획을 세운 배경"><li><span>01 · 위협</span><strong>과거가 드러날 위기</strong><p>아내가 내 과거를 조사하고 있었습니다. 드러나면 이혼과 금전적 배상을 감당해야 했습니다.</p></li><li><span>02 · 압박</span><strong>투자 실패로 돈까지 필요</strong><p>당신은 아내가 죽은 뒤의 유산과 사망보험을 알아봤습니다.</p></li><li><span>03 · 선택</span><strong>아내를 죽이려는 계획</strong><p>살충제를 본인 명의로 사서, 만찬 때 아내의 수프에 넣었습니다.</p></li></ol>`;
  // Symbolic illustrations convey known facts, never room geometry or evidence replicas.
  const objectArt=kind=>{
    const paths={
      table:'<path d="M12 28h56v9H12zM19 37v22M61 37v22M31 17h18M40 13v9"/>',
      soup:'<path d="M12 34h56c-2 17-12 24-28 24S14 51 12 34ZM8 60h64M29 25c-7-8 7-10 0-18M43 25c-7-8 7-10 0-18M57 25c-7-8 7-10 0-18"/>',
      chair:'<rect x="23" y="10" width="34" height="29" rx="6"/><path d="M19 40h42v10H19zM24 50v14M56 50v14M30 18h20"/>',
      phone:'<rect x="23" y="7" width="34" height="60" rx="6"/><path d="M34 14h12M35 59h10M30 28h20M30 36h15M30 44h18"/>',
      computer:'<rect x="10" y="12" width="60" height="40" rx="4"/><path d="M40 52v12M26 65h28M19 24h24M19 32h36M19 40h29"/>',
      drawer:'<rect x="14" y="12" width="52" height="49" rx="3"/><path d="M14 36h52M32 24h16M32 48h16M20 61v6M60 61v6"/>',
      witness:'<circle cx="40" cy="24" r="12"/><path d="M18 64v-8a22 22 0 0 1 44 0v8M30 57h20"/>'
    };
    return `<svg class="object-art" viewBox="0 0 80 76" aria-hidden="true">${paths[kind]}</svg>`;
  };
  const eventScene=()=>`<article class="event-scene"><header><time>19:30</time><span>같은 시각, 두 장소</span></header><div class="scene-panels"><section class="location-panel"><h2>식당</h2><img src="assets/portrait-baek.png" alt=""><strong>백비서</strong>${objectArt('table')}<p>당신의 지시로<br><b>테이블 확인 중</b></p></section><section class="location-panel"><h2>주방</h2><img src="assets/portrait-han.png" alt=""><strong>한소설 · 당신</strong>${objectArt('soup')}<p>아내의 수프에<br><b>살충제를 넣음</b></p></section></div><p class="scene-caption">백비서에게 테이블 확인을 부탁한 뒤,<br>당신은 주방으로 갔습니다.</p><small class="visual-note">장소별 행동을 설명하는 그림입니다. 실제 공간 배치는 아닙니다.</small></article>`;
  const seatScene=()=>`<article class="seat-scene"><header><time>19:40</time><span>식사가 시작됐습니다</span></header><div class="seat-comparison"><section><span>미리 정한 자리</span>${objectArt('chair')}<strong>한소설</strong><small>메모에 ‘내 자리(상석)’</small></section><span class="seat-arrow" aria-hidden="true">→</span><section><span>실제로 앉은 사람</span>${objectArt('chair')}<strong>홍대표</strong><small>당신의 아내</small></section></div><p>당신 자리로 정해둔 곳에 <b>아내가 앉아 있었습니다.</b></p><small class="visual-note">같은 자리의 계획과 실제 상황을 비교한 그림입니다.</small></article>`;
  const recordCards=()=>`<div class="record-cards">${[
    ['phone','휴대폰 · 구매 내역',d.trick[0]],
    ['computer','컴퓨터 · 검색기록',d.trick[1]],
    ['soup','주방 · 내가 한 행동',d.trick[2]],
    ['witness','백비서 · 목격',d.trick[3]],
    ['drawer','잠긴 서랍 · 문서',d.trick[4]]
  ].map(([kind,title,body])=>`<article class="record-card"><div class="record-art">${objectArt(kind)}</div><div><h2>${title}</h2><p>${body}</p></div></article>`).join('')}</div><p class="visual-note">그림은 기억을 돕는 표시입니다. 실제 단서의 내용은 조사에서 확인하세요.</p>`;
  const motiveBlocks=()=>textBlock('아내가 무엇을 알아보려 했나요?',motive.fear)+textBlock('돈 문제까지 겹쳤습니다',motive.money)+textBlock('그래서 무엇을 하기로 했나요?',motive.decision);
  // Keep the original order and facts, but explain the object of each action.
  const memoryCopy=[
    '아내를 죽이려는 계획에 사용할 <b>살충제(벌레약)를 본인 명의로 구매했습니다.</b>',
    '윤꽃집의 꽃집에 찾아가 편지에 관해 논쟁했습니다.',
    '손님을 맞이했습니다.',
    '윤꽃집을 창피 주려는 생각으로, 협박편지를 가지러 방에 올라갔습니다.',
    '편지를 든 채 윤꽃집과 마주쳐 말싸움을 했습니다.',
    '식당으로 먼저 가서 백비서에게 <b>식당 테이블을 확인해달라고 했습니다.</b> 백비서가 테이블을 확인하는 동안, 당신은 주방으로 가서 <b>아내의 수프에 살충제를 넣었습니다.</b>',
    '식사가 시작됐습니다. 홍대표는 <b>원래 내 자리에 앉아 있었습니다.</b>',
    '홍대표가 사망했습니다.'
  ];
  const memories=d.timeline.map((row,i)=>({...row,real:memoryCopy[i]||row.real}));
  const timelineRows=rows=>`<ol class="timeline">${rows.map(r=>`<li class="${r.key?'important':''}"><time>${r.t}</time><div><p>${r.real}</p></div></li>`).join('')}</ol>`;
  const relationMeta={
    '홍대표':{label:'아내 · 사건의 피해자',short:'경제와 일에서 당신보다 우위에 있던 사람'},
    '윤꽃집':{image:'yoon',label:'옛 연인 · 악연',short:'서로 적대하는 사이'},
    '유감독':{image:'yoo',label:'이해관계로 얽힌 사이',short:'협력하면서도 서로를 불신하는 관계'},
    '백비서':{image:'baek',label:'아내 편에 선 사람',short:'당신이 경계하는 상대'}
  };
  const relationRows=()=>`<p class="relation-anchor"><img src="assets/portrait-han.png" alt=""><span><b>한소설, 당신</b>과의 관계</span></p><div class="people-cards">${d.rel.map(([name,text])=>{const r=relationMeta[name];return `<article class="person-card"><div class="person-heading">${r.image?`<img src="assets/portrait-${r.image}.png" alt="">`:'<span class="portrait-placeholder" aria-hidden="true">홍</span>'}<div><h2>${name}</h2><span>${r.label}</span></div></div><p>${r.short}</p>${disclosure(name+' · 관계 자세히 보기',`<p>${text}</p>`)}</article>`;}).join('')}</div>`;
  const introQuote=()=>`<div class="speech-example"><span>그대로 읽어도 괜찮아요</span><p>“${d.selfIntro}”</p></div>`;
  const rules=()=>`${textBlock('사실대로 답해야 해요','당신은 범인이 아닙니다. 증거를 들어 추궁받으면 실제로 한 일을 사실대로 말해야 합니다.','rule')}${textBlock('추측은 추측이라고 말해요','협박편지를 윤꽃집이 보냈다고 믿지만, 확증은 없습니다.')}${textBlock('비밀을 먼저 모두 밝힐 필요는 없어요','자기소개에서는 이름·직업·관계부터 말하세요. 질문받았을 때에는 거짓말로 행동을 부인하지 마세요.')}`;
  const identityGate=content=>state.identityVisible?`<div class="identity-controls"><span>나만 보는 비밀</span><button type="button" data-action="hide-identity">다시 가리기</button></div>${content}`:`<section class="identity-gate" aria-label="가려진 역할 정보"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg><h2>이 내용은 당신만 확인하세요.</h2><p>다른 사람에게 화면이 보이지 않는지<br>확인한 뒤 아래 버튼을 눌러주세요.</p><button type="button" class="primary-button" data-action="reveal-identity">혼자 볼 준비가 됐어요 · 확인하기</button><small>확인 후 다시 가릴 수 있어요.<br>이 화면을 나갔다 돌아오면 자동으로 가려져요.</small></section>`;
  const pages=[
    {q:'나는 어떤 사람인가요?',next:'피해자와의 관계 보기',body:()=>`<div class="brief-portrait"><img src="assets/portrait-han.png" alt="한소설"><div><span>31세 · 소설가</span><strong>한소설</strong><p>오늘 축하받을 사람이었습니다.</p></div></div>${thought('내 소설이 영화가 되는 날이었다.<br>그런데 아내가 죽었다.')}${textBlock('지금의 감정',d.persona.mood)}`},
    {q:'사람들과 어떤 사이인가요?',next:'나만 아는 사실 확인하기',body:()=>`<p class="body-intro">얼굴과 관계부터 기억하세요. 자세한 사연은 필요할 때 펼쳐볼 수 있어요.</p>${relationRows()}`},
    {q:'나는 범인인가요?',next:'내가 불안한 이유 보기',body:()=>identityGate(`<div class="verdict"><span>다른 사람에게 보여주지 마세요</span><h2>${d.verdict.t}</h2><p>${d.verdict.p}</p></div>${textBlock('기억할 사실','아내를 죽이려 한 행동은 당신의 비밀입니다. 먼저 모두 말할 필요는 없지만 추궁받으면 사실대로 답해야 합니다.')}`)},
    {q:'나는 무엇이 두려운가요?',next:'편지와 좌석 이야기 보기',body:()=>`${thought('아내가 내 과거를 알아보고 있다.<br>들통나면 이혼에 배상까지…<br>투자도 망했는데, 그 돈을 어떻게 감당하지.')}${motiveMap()}${textBlock('그래서 아내에게 어떻게 대했나요?',d.truth[1].p)}${disclosure('결혼 계약의 조항 자세히 보기',`<p>${motive.fear}</p>`)}`},
    {q:'파티에서 무슨 생각이었나요?',next:'사건 전 행적 확인하기',body:()=>`${textBlock('협박편지는 누가 보냈을까요?',d.truth[3].p)}${textBlock('확인된 사실과 내 생각은 달라요','윤꽃집이 보냈다는 것은 당신의 믿음입니다. 확인된 증거가 있는 것은 아닙니다.','rule')}${textBlock('미리 정한 내 자리',d.truth[4].p)}`},
    {q:'만찬 전에는 무엇을 했나요?',next:'만찬 때의 행적 확인하기',body:()=>`<p class="body-intro">당신이 실제로 한 일입니다. 시간 순서대로 읽어주세요.</p>${timelineRows(memories.slice(0,5))}`},
    {q:'사건 무렵에는 어디 있었나요?',next:'남아 있는 기록 확인하기',body:()=>`${eventScene()}${textBlock('왜 이런 행동을 했나요?',motive.recap)}<h2 class="scene-after">그 뒤, 만찬에서는</h2>${seatScene()}${timelineRows(memories.slice(7))}${textBlock('내가 직접 아는 것','홍대표가 앉은 자리는 원래 당신 자리였습니다. 다른 사람이 왜 그 자리에 앉았는지까지 단정하지는 마세요.','rule')}`},
    {q:'내 행동은 어디에 남아 있나요?',next:'답변할 때의 원칙 확인하기',body:()=>`<p class="body-intro">당신의 행동과 연결된 기록입니다. 질문받으면 이 사실들을 떠올리세요.</p>${recordCards()}`},
    {q:'질문받으면 어떻게 말하나요?',next:'첫 자기소개 준비하기',body:rules},
    {q:'첫마디는 어떻게 시작하나요?',next:'역할 확인 마치기',body:()=>`${introQuote()}${textBlock('이런 느낌으로 말해보세요','슬픔과 짜증이 함께 드러나도 괜찮아요. 의심받으면 발끈하지만, 다른 사람의 말은 끝까지 들어주세요.')}${textBlock('외울 필요는 없어요','게임 중 내 역할에서 관계·시간별 행적·질문에 대한 참고를 다시 찾을 수 있어요.')}`}
  ];
  const answers=[
    {q:'살충제는 왜 샀고, 왜 수프에 넣었나요?',fact:motive.recap,say:'아내가 제 과거를 알아보려 했습니다. 들통나면 이혼하고 배상까지 해야 했어요. 투자가 망해 돈도 필요했고요. 유산과 보험을 알아봤고… 아내를 죽이려고 살충제를 샀습니다. 그걸 수프에 넣었습니다.',note:'살해하려 한 의도와 실제 사망 원인은 구분하세요. 당신이 아내를 죽이려 했다는 사실이 실제 범인이라는 뜻은 아닙니다.'},
    {q:'백비서에게 무엇을 확인하라고 했나요?',fact:'식당 테이블을 확인해달라고 했습니다. 백비서가 테이블을 확인하는 동안 당신은 주방으로 갔습니다.',say:'식당 테이블을 확인해달라고 했어요. 그동안 저는 주방에 갔습니다.',note:'테이블의 어떤 물건을 확인시켰는지까지는 설정에 없습니다. 질문받아도 세부 지시를 새로 만들어낼 필요는 없어요.'},
    {q:'19시 30분에 주방에서 뭘 했나요?',fact:'백비서에게 식당 테이블을 확인해달라고 한 뒤, 주방에서 아내의 수프에 살충제를 넣었습니다. 19:31경 주방에서 나오는 모습을 백비서가 목격했습니다.',say:'수프에 살충제를 넣었습니다. 시계를 본 건 아니라서, 시간은 대략 그쯤이었어요.',note:'직접 한 행동과 대략의 시간을 구분해주세요.'},
    {q:'협박편지는 윤꽃집이 보냈나요?',fact:'윤꽃집이 보냈다고 믿지만 확증은 없습니다.',say:'윤꽃집이 보냈다고 생각했어요. 하지만 확실한 증거는 없습니다.',note:'의심하는 내용과 확인된 사실은 다릅니다.'},
    {q:'보험과 유산은 왜 검색했나요?',fact:'계약서와 투자 실패 때문에 압박을 느껴 보험과 유산을 알아봤습니다.',say:'투자가 망했고 돈이 필요했습니다. 계약서 때문에 과거가 드러나는 것도 두려웠어요.',note:'실제로 한 행동을 부인하는 설명을 만들지 마세요.'},
    {q:'서랍에는 무엇이 들어 있나요?',fact:'좌석 메모와 정략결혼 계약서가 있습니다. 홍대표가 앉은 자리에 “내 자리(상석)”라고 적혀 있습니다.',say:'좌석을 미리 그려뒀어요. 아내가 앉았던 곳은 원래 제 자리였습니다.',note:'좌석에 관해 아는 사실을 말하고, 다른 사람의 이유는 단정하지 마세요.'}
  ];
  const topics=[['relations','누가 누구였지?','인물 관계'],['timeline','그때 나는 어디 있었지?','시간별 행적'],['answers','이 질문에 어떻게 답하지?','질문별 참고'],['secret','내 비밀 다시 확인하기','나만 아는 배경']];
  const topicLinks=()=>`<div class="topic-links">${topics.map(([key,q,desc])=>`<button type="button" data-topic="${key}"><div><strong>${q}</strong><span>${desc}</span></div>${arrow}</button>`).join('')}</div>`;
  function phaseAction(){
    if(state.phase==='role')return state.done?['화면 덮고 다음 안내 기다리기','cover']: [state.started?'내 역할 이어서 확인하기':'내 역할 확인하기','start'];
    return {intro:['자기소개 예시 보기','intro'],investigate:['조사 방법 연습하기','investigate'],meeting:['내 단서 확인하기','clues'],vote:['투표 전 내 기록 확인하기','answers']}[state.phase];
  }
  function home(){
    const p=phases[state.phase];
    return `<section class="home-screen"><div class="task-label"><i></i>지금 할 일</div><h1>${state.phase==='role'&&state.done?'역할을 확인했어요.':p.title}</h1><p class="lead">${state.phase==='role'&&state.done?'공용 화면의 다음 안내를 기다려주세요. 궁금한 내용은 아래에서 다시 찾을 수 있어요.':p.desc}</p>${state.phase==='role'&&!state.done?`<div class="home-profile"><img src="assets/portrait-han.png" alt="한소설"><div><span>당신이 맡을 인물</span><strong>한소설</strong><p>31세 · 소설가<br>홍대표의 남편</p></div></div><div class="what-to-read"><h2>이 순서로 이해하게 돼요</h2><p><span>1</span>나와 피해자의 관계</p><p><span>2</span>나만 아는 비밀과 실제 행적</p><p><span>3</span>첫 자기소개와 질문받았을 때의 말</p></div><p class="privacy-note">내 역할은 나만 읽어요. 주변에 화면을 보여주지 마세요.</p>`:`<div class="phase-summary"><span>내 역할</span><strong>한소설 · 소설가</strong><p>${state.phase==='meeting'?'확인한 내용을 모두 외우지 않아도 괜찮아요. 필요한 것만 찾아보고 대화에 참여하세요.':'언제든 내 기록을 다시 확인할 수 있어요.'}</p></div><h2 class="small-heading">필요한 내용만 빠르게 찾기</h2>${topicLinks()}${state.done?'<button type="button" class="restart-reading" data-action="restart">역할 안내 처음부터 다시 보기</button>':''}`}</section>`;
  }
  function briefing(){const page=pages[state.page];const chapter=state.page<2?0:state.page<5?1:state.page<8?2:3;return `<section class="brief-screen"><div class="page-progress"><span>내 역할 확인</span><strong>${state.page+1}<span> / ${pages.length}</span></strong></div><div class="progress-track"><i style="width:${(state.page+1)/pages.length*100}%"></i></div><ol class="reading-chapters" aria-label="역할 안내 순서">${['나의 관계','나의 비밀','사건 당일','대화 준비'].map((name,i)=>`<li ${chapter===i?'aria-current="step"':''}>${name}</li>`).join('')}</ol><h1>${page.q}</h1><div class="brief-body">${page.body()}</div><p class="page-footnote">${state.page===pages.length-1?'확인했다면 아래 버튼으로 마쳐주세요.':'읽은 뒤 아래 버튼으로 이어서 확인하세요.'}</p></section>`;}
  function backRow(title){return `<div class="reference-heading"><button type="button" class="back-button" data-back aria-label="이전 화면">←</button><h1>${title}</h1></div>`;}
  function reference(){
    if(state.topic==='intro')return `${backRow('첫 자기소개')}${introQuote()}${textBlock('자기소개에서는','이름·직업·피해자와의 관계부터 말하세요. 비밀을 먼저 모두 설명할 필요는 없어요.')}`;
    const topic=topics.find(t=>t[0]===state.topic);
    let body='';
    if(state.topic==='relations')body=`<p class="lead">이 사람들은 당신과 어떤 사이인지 확인하세요.</p>${relationRows()}`;
    if(state.topic==='timeline')body=`<p class="lead">확인할 시각을 누르면 바로 볼 수 있어요.</p><div class="time-picker" role="group" aria-label="행적 시각">${memories.map((r,i)=>`<button type="button" data-time="${i}" aria-pressed="${String(i)===state.time}">${r.t==='사건 전'?`사건 전 ${i+1}`:r.t}</button>`).join('')}</div>${state.time==='5'?eventScene():state.time==='6'?seatScene():`<article class="time-detail"><span>내 실제 행적</span><h2>${memories[Number(state.time)].t}</h2><p>${memories[Number(state.time)].real}</p></article>`}${[0,5].includes(Number(state.time))?textBlock('이 행동을 한 이유',motive.recap):''}<p class="context-note">직접 한 일과 아는 사실입니다. 다른 사람의 생각까지 추측할 필요는 없어요.</p>`;
    if(state.topic==='answers')body=`<p class="lead">받은 질문을 선택해 사실과 답변 예시를 확인하세요.</p><div class="answer-list">${answers.map((a,i)=>`<div><button type="button" data-answer="${i}" aria-expanded="${state.openAnswer===i}"><span>${a.q}</span><span aria-hidden="true">${state.openAnswer===i?'−':'＋'}</span></button>${state.openAnswer===i?`<div class="answer-body">${textBlock('내가 아는 사실',a.fact)}${textBlock('이렇게 말할 수 있어요','“'+a.say+'”','spoken-answer')}${textBlock('기억할 점',a.note)}</div>`:''}</div>`).join('')}</div>`;
    if(state.topic==='secret')body=identityGate(`<p class="privacy-note">당신만 보는 내용입니다.</p><div class="verdict"><span>나의 정체</span><h2>${d.verdict.t}</h2><p>${d.verdict.p}</p></div>${motiveBlocks()}${d.truth.filter((_,i)=>![0,2].includes(i)).map(t=>textBlock(t.h,t.p)).join('')}${rules()}`);
    return `<section class="reference-screen">${backRow(topic[2])}${body}</section>`;
  }
  function practiceCard(){return `<button type="button" class="practice-card ${state.practiceFace?'face-up':''}" data-practice ${state.practice?'disabled':''} aria-label="${state.practice?'확보한 연습 카드':state.practiceFace?'연습 카드 내용':'연습 카드 한 장 확인하기'}"><div class="practice-inner"><div class="practice-back" aria-hidden="${state.practiceFace}"><span>저택</span><strong>연습용 카드</strong><small>눌러서 앞면 보기</small></div><div class="practice-front" aria-hidden="${!state.practiceFace}"><span>연습용 · 실제 단서 아님</span><strong>파티 초대장</strong><p>한소설의 작품이 영화가 되는 것을 축하하는 자리입니다.</p><small>확보 즉시 자동 보관</small></div></div></button>`;}
  function investigation(){return `${backRow('조사 방법 연습')}<div class="practice-notice">시안 체험 · 실제 조사 기회는 쓰지 않아요</div><h2 class="practice-title">카드 한 장을 눌러보세요.</h2><p class="lead">뒷면을 누르면 내용이 공개되고<br>연습용 단서함에 자동 보관돼요.</p><div class="practice-table">${practiceCard()}</div><p class="context-note">${state.practice?'확보한 카드는 단서함에서 다시 읽을 수 있어요.':'본게임에서는 저택과 인물별 공간에 카드 더미가 놓여 있어요.'}</p>`;}
  function clues(){return `${backRow('내 단서함')}<div class="practice-notice">시안의 연습용 단서함</div>${state.practice?`<p class="lead">자동 보관된 연습 카드 1장</p><article class="collected-practice"><span>저택 · 연습용</span><h2>파티 초대장</h2><p>한소설의 작품이 영화가 되는 것을 축하하는 자리입니다.</p></article>`:`<div class="empty-state"><div aria-hidden="true">▱</div><h2>아직 확보한 카드가 없어요.</h2><p>본게임의 조사에서 카드를 공개하면<br>자동으로 이곳에 모여요.</p></div>`}<h2 class="small-heading">회의에서 기억이 흐리다면</h2>${topicLinks()}`;}
  function setAction(label,action,sub=''){
    actions.innerHTML=`${sub?`<span class="action-sub">${sub}</span>`:''}<button type="button" class="primary-button" data-action="${action}"><span>${label}</span><span aria-hidden="true">→</span></button>`;
  }
  function routeKey(){return state.route==='brief'?`brief:${state.page}`:state.route==='reference'?`reference:${state.topic}:${state.topic==='timeline'?state.time:''}`:state.route;}
  function go(route,opts={}){
    state.scrolls[routeKey()]=window.scrollY;
    state.expanded[routeKey()]=Array.from(main.querySelectorAll('details')).map(el=>el.open);
    if(state.route!=='reference'&&route==='reference')state.returnRoute=state.route;
    state.identityVisible=false;
    Object.assign(state,opts,{route});render(state.scrolls[routeKey()]||0);
  }
  function act(action){
    if(action==='start'){state.started=true;go('brief');}
    else if(action==='restart'){state.started=true;go('brief',{page:0});}
    else if(action==='next'){if(state.page<pages.length-1){go('brief',{page:state.page+1});}else{state.done=true;go('home');}}
    else if(action==='reveal-identity'){state.identityVisible=true;state.identityRead=true;render(window.scrollY);}
    else if(action==='hide-identity'){state.identityVisible=false;render(window.scrollY);}
    else if(action==='cover'){state.identityVisible=false;render(window.scrollY);$('#privacy-cover').showModal();}
    else if(action==='back')go(state.returnRoute);
    else if(action==='role')go('home');
    else if(action==='intro'||action==='answers')go('reference',{topic:action});
    else if(action==='investigate')go('investigate');
    else if(action==='clues')go('clues');
  }
  function render(scroll=0){
    const brief=state.route==='brief';
    $('.play-app').classList.toggle('reading-mode',brief);
    $('.bottom-nav').hidden=brief;
    $('#phase-label').textContent=phases[state.phase].name;
    main.innerHTML=state.route==='home'?home():brief?briefing():state.route==='reference'?reference():state.route==='investigate'?investigation():clues();
    if(brief){
      setAction(pages[state.page].next,'next',state.page===pages.length-1?'확인하면 현재 진행 단계로 돌아가요':'');
      if(state.page===2&&!state.identityRead){const next=actions.querySelector('[data-action="next"]');next.disabled=true;next.querySelector('span').textContent='내 역할을 먼저 확인해주세요';}
      // The progress is a reading position, not a claim that the player understands the role.
      actions.insertAdjacentHTML('afterbegin',state.page>0?'<button type="button" class="previous-page" data-previous aria-label="이전 내용">← 이전</button>':'<button type="button" class="previous-page" data-action="role">← 홈</button>');
    }else if(state.route==='home'){const [label,action]=phaseAction();setAction(label,action,state.phase==='role'&&!state.done?'한 화면씩, 내 속도에 맞춰 확인해요':'');}
    else if(state.route==='investigate'){if(state.practice)setAction('단서함에서 다시 보기','clues');else actions.innerHTML='<span class="action-sub">위의 카드를 눌러 체험해보세요</span>';}
    else if(state.route==='clues'){setAction(state.practice?'현재 단계로 돌아가기':'조사 방법 연습하기',state.practice?'role':'investigate');}
    else setAction('확인했어요 · 이전 화면으로','back');
    document.querySelectorAll('[data-nav]').forEach(b=>{const current=b.dataset.nav==='role'?['home','brief','reference'].includes(state.route):b.dataset.nav===state.route;if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#clue-count').hidden=!state.practice;
    main.querySelectorAll('details').forEach((el,i)=>{el.open=state.expanded[routeKey()]?.[i]||false;});
    bind();main.focus({preventScroll:true});window.scrollTo({top:scroll,behavior:'instant'});
  }
  function bind(){
    document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(b.dataset.action));
    main.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>go('reference',{topic:b.dataset.topic,time:b.dataset.topic==='timeline'?'5':state.time}));
    main.querySelector('[data-back]')?.addEventListener('click',()=>go(state.route==='reference'?state.returnRoute:'home'));
    actions.querySelector('[data-previous]')?.addEventListener('click',()=>go('brief',{page:state.page-1}));
    main.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time;render();});
    main.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const y=window.scrollY;state.openAnswer=state.openAnswer===Number(b.dataset.answer)?-1:Number(b.dataset.answer);render();window.scrollTo({top:y,behavior:'instant'});});
    main.querySelector('[data-practice]')?.addEventListener('click',()=>{
      if(state.practice)return;
      state.practiceFace=true;state.practice=true;
      const card=main.querySelector('[data-practice]');card.classList.add('face-up');card.disabled=true;card.setAttribute('aria-label','확보한 연습 카드');card.querySelector('.practice-back').setAttribute('aria-hidden','true');card.querySelector('.practice-front').setAttribute('aria-hidden','false');
      $('#clue-count').hidden=false;setAction('단서함에서 다시 보기','clues');actions.querySelector('[data-action]').onclick=()=>act('clues');
      toast('연습 카드가 단서함에 자동 보관됐어요');
    });
  }
  let toastTimer;
  function toast(message){const el=$('#sample-toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2200);}
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>act(b.dataset.nav));
  $('#cover-button').onclick=()=>act('cover');$('#resume-button').onclick=()=>$('#privacy-cover').close();
  $('#demo-button').onclick=()=>{
    $('#demo-options').innerHTML=Object.entries(phases).map(([key,p])=>`<button type="button" data-phase="${key}" aria-pressed="${state.phase===key}">${p.name}${state.phase===key?' · 현재':''}</button>`).join('');
    $('#demo-options').querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>{state.phase=b.dataset.phase;$('#phase-demo').close();go('home');});$('#phase-demo').showModal();
  };
  $('#demo-close').onclick=()=>$('#phase-demo').close();
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.identityVisible){state.identityVisible=false;render(window.scrollY);}});
  render();
})();
