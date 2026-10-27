/* Mobile rolebook, isolated in a Shadow DOM; game data and navigation stay in the host. */
(() => {
  const profile=window.ROLEBOOK_PROFILES[MYKEY], d=ME;
  if(!profile) return;
  const host=document.createElement('section');
  host.hidden=true;host.id='mobile-rolebook';host.setAttribute('aria-label',`${d.name} 캐릭터북`);
  host.style.cssText='position:fixed;inset:0;z-index:60;background:#090d12;';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<link rel="stylesheet" href="assets/character-book-sample.css?v=5"><link rel="stylesheet" href="assets/rolebook-host.css?v=3"><div class="rb-viewport"><div class="play-app"><header class="app-header"><div class="header-identity"><img src="assets/portrait-${profile.image}.png" alt=""><div><strong>${d.name}</strong><span id="rb-phase">캐릭터북</span></div></div><div class="header-actions"><button type="button" class="icon-button" id="rb-cover" aria-label="화면 덮기">덮기</button></div></header><main id="rb-main" tabindex="-1"></main><div class="page-action" id="rb-action"></div><nav class="bottom-nav" aria-label="기본 메뉴"><button type="button" data-dest="book" aria-current="page">내 역할</button><button type="button" data-dest="inv">조사</button><button type="button" data-dest="kit">단서함 <span id="rb-count"></span></button></nav></div></div><dialog id="rb-private" aria-labelledby="rb-private-title"><div class="cover-inner"><span class="section-label">나만 보는 화면</span><h2 id="rb-private-title">화면을 덮어두었어요.</h2><p>혼자 볼 수 있을 때 이어서 읽으세요.</p><button type="button" class="primary-button" id="rb-resume">읽던 곳으로 돌아가기</button></div></dialog>`;
  document.body.appendChild(host);
  const $=s=>root.querySelector(s),main=$('#rb-main'),actions=$('#rb-action'),viewport=$('.rb-viewport');
  const st={route:'home',page:0,started:false,done:false,topic:'',time:profile.before,answer:-1,visible:false,read:false,scrolls:{},expanded:{}};
  const portraits={'한소설':'han','윤꽃집':'yoon','백비서':'baek','유감독':'yoo'};
  const block=(title,body,kind='')=>`<div class="fact-block ${kind}"><span>${title}</span><p>${body}</p></div>`;
  const more=(title,body)=>`<details class="more-context"><summary>${title}</summary><div>${body}</div></details>`;
  const thought=()=>`<div class="inner-voice"><span>${d.name}의 속마음</span><p>${profile.thought}</p></div>`;
  const objectArt=kind=>{
    const paths={
      table:'<path d="M12 28h56v9H12zM19 37v22M61 37v22M31 17h18M40 13v9"/>',
      soup:'<path d="M12 34h56c-2 17-12 24-28 24S14 51 12 34ZM8 60h64M29 25c-7-8 7-10 0-18M43 25c-7-8 7-10 0-18M57 25c-7-8 7-10 0-18"/>',
      chair:'<rect x="23" y="10" width="34" height="29" rx="6"/><path d="M19 40h42v10H19zM24 50v14M56 50v14M30 18h20"/>',
      phone:'<rect x="23" y="7" width="34" height="60" rx="6"/><path d="M34 14h12M35 59h10M30 28h20M30 36h15M30 44h18"/>',
      computer:'<rect x="10" y="12" width="60" height="40" rx="4"/><path d="M40 52v12M26 65h28M19 24h24M19 32h36M19 40h29"/>',
      drawer:'<rect x="14" y="12" width="52" height="49" rx="3"/><path d="M14 36h52M32 24h16M32 48h16M20 61v6M60 61v6"/>',
      bottle:'<path d="M29 8h22v12l7 9v35H22V29l7-9ZM29 15h22M22 38h36M30 46h20M30 53h16"/>',
      glass:'<path d="M20 10h40l-7 52H27ZM23 29h34M29 40l9-5 9 5-9 5Z"/>',
      flower:'<path d="M40 67V30M40 46Q19 33 22 50q9 8 18 3M40 39q21-13 18 4-9 8-18 3"/><circle cx="40" cy="20" r="11"/>',
      letter:'<rect x="10" y="18" width="60" height="40" rx="3"/><path d="m11 20 29 23 29-23M11 56l20-20M69 56 49 36"/>',
      witness:'<circle cx="40" cy="24" r="12"/><path d="M18 64v-8a22 22 0 0 1 44 0v8M30 57h20"/>'
    };
    return `<svg class="object-art" viewBox="0 0 80 76" aria-hidden="true">${paths[kind]}</svg>`;
  };

  const memories=d.timeline.map((r,i)=>({...r,place:profile.timeline[i][0],real:profile.timeline[i][1]}));
  const timeline=rows=>`<ol class="timeline">${rows.map(r=>`<li class="${r.key?'important':''}"><time>${r.t}</time><div><span class="rb-place">${r.place}</span><p>${r.real}</p>${d.culprit&&r.fake&&r.fake!=='동일'?`<div class="rb-alibi"><span>말할 알리바이 · 실제와 다름</span><p>${r.fake}</p></div>`:''}</div></li>`).join('')}</ol>`;
  const motive=()=>`<ol class="cause-path" aria-label="내 행동의 이유">${profile.motive.map(([label,title,body],i)=>`<li><span>0${i+1} · ${label}</span><strong>${title}</strong><p>${body}</p></li>`).join('')}</ol>`;
  const portrait=name=>portraits[name]?`<img src="assets/portrait-${portraits[name]}.png" alt="">`:`<span class="portrait-placeholder" aria-hidden="true">${name[0]}</span>`;
  const relations=()=>`<p class="relation-anchor"><img src="assets/portrait-${profile.image}.png" alt=""><span><b>${d.name}, 당신</b>과의 관계</span></p><div class="people-cards">${d.rel.map(([name,body])=>{const [label,summary]=profile.labels[name];return `<article class="person-card"><div class="person-heading">${portrait(name)}<div><h2>${name}</h2><span>${label}</span></div></div><p>${summary}</p>${more(name+' · 관계 자세히 보기',`<p>${body}</p>`)}</article>`;}).join('')}</div>`;
  const scene=sc=>`<article class="${sc.compare?'seat-scene':'event-scene'}"><header><time>${sc.t}</time><span>${sc.title}</span></header>${sc.panels?`<div class="scene-panels">${sc.panels.map(([place,name,art,body])=>`<section class="location-panel"><h2>${place}</h2>${portraits[name]?portrait(name):''}<strong>${name}${name===d.name?' · 당신':''}</strong>${objectArt(art)}<p>${body}</p></section>`).join('')}</div>`:`<div class="seat-comparison">${sc.compare.map(([label,name],i)=>`${i?'<span class="seat-arrow" aria-hidden="true">→</span>':''}<section><span>${label}</span>${objectArt(sc.art||'chair')}<strong>${name}</strong></section>`).join('')}</div>`}<p class="scene-caption">${sc.caption}</p><small class="visual-note">상황을 설명하는 그림입니다. 실제 공간 배치나 단서 실물은 아닙니다.</small></article>`;
  const records=()=>`<div class="record-cards">${d.trick.map((body,i)=>{const [art,title]=profile.records[i];return `<article class="record-card"><div class="record-art">${objectArt(art)}</div><div><h2>${title}</h2><p>${body}</p></div></article>`;}).join('')}</div><p class="visual-note">기억을 돕는 그림입니다. 실제 단서는 조사와 단서함에서 확인하세요.</p>`;
  const gate=content=>st.visible?`<div class="identity-controls"><span>나만 보는 비밀</span><button type="button" data-act="hide">다시 가리기</button></div>${content}`:`<section class="identity-gate" aria-label="가려진 역할 정보">${objectArt('drawer')}<h2>이 내용은 당신만 확인하세요.</h2><p>다른 사람에게 화면이 보이지 않는지<br>확인한 뒤 아래 버튼을 눌러주세요.</p><button type="button" class="primary-button" data-act="reveal">혼자 볼 준비가 됐어요 · 확인하기</button><small>확인 후 다시 가릴 수 있어요.<br>다른 화면으로 이동하면 자동으로 가려져요.</small></section>`;
  const verdict=()=>`<div class="verdict"><span>다른 사람에게 보여주지 마세요</span><h2>${d.verdict.t}</h2><p>${d.verdict.p}</p></div>${block('기억할 사실',profile.rule,'rule')}`;
  const rules=()=>`${block(d.culprit?'실제 행동과 알리바이를 구분해요':'실제로 한 일은 사실대로 답해요',profile.rule,'rule')}${block('아는 것과 모르는 것을 구분해요',profile.limits)}${block('비밀을 먼저 모두 말할 필요는 없어요','자기소개는 이름·직업·관계로 시작하세요. 질문받은 내용에 맞춰 답하고, 모르는 일은 모른다고 말해도 괜찮습니다.')}`;
  const quote=()=>`<div class="speech-example"><span>그대로 읽어도 괜찮아요</span><p>“${d.selfIntro}”</p></div>`;
  const meeting=()=>`<p class="lead">${profile.meeting.intro}</p><div class="record-cards rb-meeting-cards">${profile.meeting.cards.map(([art,title,fact,say])=>`<article class="rb-meeting-card"><div class="rb-meeting-heading"><span class="record-art">${objectArt(art)}</span><h2>${title}</h2></div><p>${fact}</p>${more('대화에서 이렇게 말할 수 있어요',`<p>“${say}”</p>`)}</article>`).join('')}</div>${block('모르는 부분은 모른다고 말해요',profile.meeting.boundary,'rule')}${more('내 비밀에 관해 질문받았다면',`<p>${profile.meeting.privateNote}</p>`)}<p class="context-note">필요할 때만 참고하세요. 메모를 모두 읽거나 발표할 필요는 없어요.</p>`;
  const pages=[
    ['나는 어떤 사람인가요?','피해자와의 관계 보기',()=>`<div class="brief-portrait"><img src="assets/portrait-${profile.image}.png" alt=""><div><span>${d.age}세 · ${d.job}</span><strong>${d.name}</strong><p>${profile.tag}</p></div></div>${block('어떤 마음으로 연기하나요?',d.persona.mood)}`],
    ['사람들과 어떤 사이인가요?','나만 아는 사실 확인하기',()=>`<p class="body-intro">얼굴과 관계부터 기억하세요. 자세한 내용은 필요할 때 펼쳐볼 수 있어요.</p>${relations()}`],
    ['나는 범인인가요?','내 행동의 이유 보기',()=>gate(verdict())],
    ['왜 그런 선택을 했나요?','사건의 배경 더 알아보기',()=>`${thought()}${motive()}`],
    [profile.contextTitle,'사건 전 행적 확인하기',()=>`${profile.contexts.map(([title,body])=>block(title,body)).join('')}${more('내 배경 전체 다시 확인하기',d.truth.map(t=>block(t.h,t.p)).join(''))}`],
    ['사건 전에는 무엇을 했나요?','사건 무렵의 행동 보기',()=>`<p class="body-intro">당신이 실제로 한 일입니다. 장소와 이유를 함께 읽어주세요.</p>${timeline(memories.slice(0,profile.before))}`],
    ['사건 무렵에는 어디 있었나요?','남아 있는 기록 확인하기',()=>`${profile.scenes.map(scene).join('')}${block('왜 이런 행동을 했나요?',profile.recap)}<h2 class="scene-after">시간순으로 다시 확인</h2>${timeline(memories.slice(profile.before))}${block('내가 아는 범위',profile.limits,'rule')}`],
    ['내 행동은 어디에 남아 있나요?','답변할 때의 원칙 확인하기',records],
    ['질문받으면 어떻게 말하나요?','첫 자기소개 준비하기',()=>`${rules()}${profile.meeting?more('회의에서 말이 막힐 때 참고하기',meeting()):''}${more('이 인물처럼 말하고 행동하기',`<p>${d.persona.tone.join(' · ')}</p><ul>${d.persona.act.map(t=>`<li>${t}</li>`).join('')}</ul>`)}`],
    ['첫마디는 어떻게 시작하나요?','역할 확인 마치기',()=>`${quote()}${block('이런 느낌으로 말해보세요',profile.tips)}${block('외울 필요는 없어요','게임 중 관계·행적·질문별 참고를 언제든 다시 찾을 수 있어요.')}`]
  ];
  const topics=[...(profile.meeting?[['meeting','회의에서 무슨 말을 하지?','직접 아는 사실과 대화 참고']]:[]),['relations','누가 누구였지?','인물 관계'],['timeline','그때 나는 어디 있었지?','시간별 행적'],['answers','이 질문에 어떻게 답하지?','질문별 참고'],['secret','내 비밀 다시 확인하기','나만 아는 배경']];
  const topicLinks=()=>`<div class="topic-links">${topics.map(([key,title,label])=>`<button type="button" data-topic="${key}"><div><strong>${title}</strong><span>${label}</span></div><span aria-hidden="true">→</span></button>`).join('')}</div>`;
  const key=()=>st.route==='brief'?`brief:${st.page}`:st.route==='reference'?`reference:${st.topic}:${st.topic==='timeline'?st.time:''}`:'home';
  function remember(){st.scrolls[key()]=viewport.scrollTop;st.expanded[key()]=Array.from(main.querySelectorAll('details')).map(e=>e.open);}
  function navigate(route,opts={}){remember();st.visible=false;Object.assign(st,opts,{route});paint(st.scrolls[key()]||0);}
  function reference(){
    const title=st.topic==='intro'?'첫 자기소개':topics.find(t=>t[0]===st.topic)?.[2];
    let body='';
    if(st.topic==='intro')body=quote();
    if(st.topic==='relations')body=relations();
    if(st.topic==='meeting'&&profile.meeting)body=meeting();
    if(st.topic==='timeline')body=`<p class="lead">확인할 시각을 선택하세요.</p><div class="time-picker" role="group" aria-label="행적 시각">${memories.map((r,i)=>`<button type="button" data-time="${i}" aria-pressed="${st.time===i}">${r.t}${['사건 전','당일 아침'].includes(r.t)?' '+(memories.slice(0,i).filter(x=>x.t===r.t).length+1):''}</button>`).join('')}</div>${profile.scenes.filter(sc=>sc.t.split(' → ')[0]===memories[st.time].t).map(scene).join('')}${timeline([memories[st.time]])}${block('행동의 배경',profile.recap)}`;
    if(st.topic==='answers')body=`<p class="lead">받은 질문을 누르면 사실과 답변 예시를 볼 수 있어요.</p><div class="answer-list">${profile.answers.map(([q,fact,say,note],i)=>`<div><button type="button" data-answer="${i}" aria-expanded="${st.answer===i}"><span>${q}</span><span>${st.answer===i?'−':'＋'}</span></button>${st.answer===i?`<div class="answer-body">${block('내가 아는 사실',fact)}${block(d.culprit?'게임에서 말할 수 있는 예시 · 사실과 다를 수 있음':'이렇게 말할 수 있어요','“'+say+'”','spoken-answer')}${block('기억할 점',note)}</div>`:''}</div>`).join('')}</div>`;
    if(st.topic==='secret')body=gate(`${verdict()}${motive()}${profile.contexts.map(([t,b])=>block(t,b)).join('')}${more('내 배경 전체 보기',d.truth.map(t=>block(t.h,t.p)).join(''))}`);
    return `<section class="reference-screen"><div class="reference-heading"><button type="button" class="back-button" data-act="home" aria-label="내 역할로 돌아가기">←</button><h1>${st.topic==='intro'?'첫 자기소개':title}</h1></div>${body}</section>`;
  }
  function stageTask(){
    if(!ONLINE)return null;
    const phase=srvPhase||'';
    if(phase.includes('조사'))return {title:phase,body:'원하는 공간의 맨 위 카드를 선택하세요. 확보한 단서는 내 단서함에 자동 보관됩니다.',label:'조사 보드 열기',dest:'inv'};
    if(phase.includes('회의'))return {title:phase,body:'찾은 단서의 이름과 발견 장소를 말로 공유하세요. 단서 내용은 다른 사람에게 자동 공유되지 않아요.',label:'단서함 확인하기',dest:'kit'};
    if(phase==='자기소개')return {title:phase,body:'이름·직업·홍대표와의 관계를 말해주세요. 준비된 예시를 그대로 읽어도 괜찮아요.',label:'자기소개 예시 보기',action:'intro'};
    if(phase==='최종 변론')return {title:phase,body:'확보한 단서와 진술을 떠올리며 의심하는 인물과 근거를 말해주세요.',label:'내 단서 확인하기',dest:'kit'};
    if(phase==='진상 공개')return {title:phase,body:'공용 화면에서 사건의 진상을 함께 확인해주세요.'};
    if(phase==='롤카드 확인')return {title:phase,body:'내 역할 확인하기를 눌러 질문을 순서대로 읽으세요. 정체는 혼자 볼 수 있을 때 확인하세요.'};
    return {title:phase||'진행 대기',body:'공용 화면의 진행 안내를 확인해주세요. 내 역할은 미리 읽어볼 수 있어요.'};
  }
  function leaveBook(dest){
    remember();conceal();tab=dest;nav=[];
    document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===tab));render();
  }
  function followStage(){const task=stageTask();if(task?.dest)leaveBook(task.dest);else if(task?.action==='intro')navigate('reference',{topic:'intro'});}
  function home(){return `<section class="home-screen"><aside id="rb-stage-task" class="rb-stage-task" aria-label="현재 게임 단계" hidden></aside><div class="task-label"><i></i>${st.done?'필요한 기록 다시 찾기':'지금 할 일'}</div><h1>${st.done?'내 역할을 확인했어요.':'내 역할부터 알아볼까요?'}</h1><p class="lead">${st.done?'진행자의 안내에 맞춰 참여하세요. 대화 중 궁금한 내용은 아래에서 다시 찾을 수 있어요.':'누가 되어 무엇을 해야 하는지, 한 화면씩 안내할게요. 내 역할은 나만 읽어요.'}</p><div class="home-profile"><img src="assets/portrait-${profile.image}.png" alt=""><div><span>당신이 맡을 인물</span><strong>${d.name}</strong><p>${d.age}세 · ${d.job}<br>${profile.tag}</p></div></div>${st.done?topicLinks():`<div class="what-to-read"><h2>이 순서로 이해하게 돼요</h2><p><span>1</span>나와 피해자의 관계</p><p><span>2</span>행동의 이유와 실제 동선</p><p><span>3</span>자기소개와 질문받았을 때의 말</p></div>`}${st.done?'<button type="button" class="restart-reading" data-act="restart">역할 안내 처음부터 다시 보기</button>':''}</section>`;}
  function action(name){
    if(name==='start'){st.started=true;navigate('brief');}
    else if(name==='restart'){st.page=0;st.started=true;st.scrolls={};st.expanded={};navigate('brief');}
    else if(name==='next'){if(st.page===2&&!st.read)return;if(st.page===pages.length-1){st.done=true;navigate('home');}else navigate('brief',{page:st.page+1});}
    else if(name==='prev')navigate('brief',{page:st.page-1});
    else if(name==='home')navigate('home');
    else if(name==='stage')followStage();
    else if(name==='reveal'){st.visible=true;st.read=true;paint(viewport.scrollTop);}
    else if(name==='hide'){st.visible=false;paint(viewport.scrollTop);}
    else if(name==='cover'){st.visible=false;paint(viewport.scrollTop);$('#rb-private').showModal();}
  }
  function paint(scroll=0){
    const brief=st.route==='brief',chapter=st.page<2?0:st.page<5?1:st.page<8?2:3;
    $('.play-app').classList.toggle('reading-mode',brief);$('.bottom-nav').hidden=brief;
    main.innerHTML=brief?`<section class="brief-screen"><div class="page-progress"><span>내 역할 확인</span><strong>${st.page+1}<span> / ${pages.length}</span></strong></div><div class="progress-track"><i style="width:${(st.page+1)*10}%"></i></div><ol class="reading-chapters" aria-label="역할 안내 순서">${['나의 관계','나의 비밀','사건 당일','대화 준비'].map((t,i)=>`<li ${i===chapter?'aria-current="step"':''}>${t}</li>`).join('')}</ol><h1>${pages[st.page][0]}</h1><div class="brief-body">${pages[st.page][2]()}</div><p class="page-footnote">읽은 뒤 아래 버튼으로 이어서 확인하세요.</p></section>`:st.route==='reference'?reference():home();
    actions.innerHTML=brief?`<button type="button" class="previous-page" data-act="${st.page?'prev':'home'}">← ${st.page?'이전':'홈'}</button><button type="button" class="primary-button" data-act="next" ${st.page===2&&!st.read?'disabled':''}><span>${st.page===2&&!st.read?'내 역할을 먼저 확인해주세요':pages[st.page][1]}</span><span aria-hidden="true">→</span></button>`:`<button type="button" class="primary-button" ${st.route==='home'?'id="rb-home-primary"':''} data-act="${st.route==='reference'?'home':st.done?'cover':'start'}"><span>${st.route==='reference'?'확인했어요 · 내 역할로':st.done?'화면 덮고 다음 안내 기다리기':st.started?'내 역할 이어서 확인하기':'내 역할 확인하기'}</span><span aria-hidden="true">→</span></button>`;
    root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>action(b.dataset.act));
    main.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>navigate('reference',{topic:b.dataset.topic}));
    main.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{remember();st.time=Number(b.dataset.time);paint(st.scrolls[key()]||0);});
    main.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{st.answer=st.answer===Number(b.dataset.answer)?-1:Number(b.dataset.answer);paint(viewport.scrollTop);});
    main.querySelectorAll('details').forEach((el,i)=>{el.open=st.expanded[key()]?.[i]||false;});
    if(!host.hidden)main.focus({preventScroll:true});viewport.scrollTop=scroll;
    sync();
  }
  function sync(){
    $('#rb-phase').textContent=ONLINE?`${ROOM} · ${srvPhase||'대기'}`:'오프라인 · 캐릭터북';
    $('#rb-count').textContent=found.size?String(found.size):'';
    const task=stageTask(),box=$('#rb-stage-task');
    if(box){
      box.hidden=!task;
      const signature=JSON.stringify(task);
      if(task&&box.dataset.phase!==signature){
        box.dataset.phase=signature;
        box.innerHTML=`<span>지금 할 일</span><h2></h2><p>${task.body}</p>${task.label?`<button type="button" class="secondary-button" id="rb-stage-go">${task.label} →</button>`:''}`;
        box.querySelector('h2').textContent=task.title;
        const button=$('#rb-stage-go');if(button)button.onclick=followStage;
      }
    }
    const homePrimary=$('#rb-home-primary');
    if(homePrimary&&st.done){homePrimary.dataset.act=task?.label?'stage':'cover';homePrimary.querySelector('span').textContent=task?.label||'화면 덮고 다음 안내 기다리기';}

  }
  function conceal(){st.visible=false;if($('#rb-private').open)$('#rb-private').close();paint(viewport.scrollTop);}
  $('#rb-cover').onclick=()=>action('cover');$('#rb-resume').onclick=()=>$('#rb-private').close();
  root.querySelectorAll('[data-dest]').forEach(b=>b.onclick=()=>{
    if(b.dataset.dest==='book'){navigate('home');return;}
    leaveBook(b.dataset.dest);
  });
  const originalRender=render, originalNet=dockNet;
  const gameApp=document.getElementById('app');
  rBook=function(){M().innerHTML='';host.hidden=document.getElementById('gate').style.display!=='none';gameApp.inert=!host.hidden;sync();};
  render=function(){if(tab!=='book'||srvVote){if(!host.hidden){remember();conceal();}host.hidden=true;gameApp.inert=false;}originalRender();};
  dockNet=function(){originalNet();sync();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!host.hidden)conceal();});
  window.addEventListener('pagehide',()=>{if(!host.hidden)conceal();});
  paint();render();
})();
