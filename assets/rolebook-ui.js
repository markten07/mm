/* Mobile rolebook, isolated in a Shadow DOM; game data and navigation stay in the host. */
(() => {
  const profile=window.ROLEBOOK_PROFILES[MYKEY], d=ME;
  if(!profile||!window.ROLEBOOK_MEMORIES?.[MYKEY]) return;
  const frames=[...window.ROLEBOOK_MEMORIES[MYKEY],{label:'나만 아는 진실',place:'현재 · 나의 역할',image:`portrait-${profile.image}.png`,art:'portrait truth',final:true}];
  const host=document.createElement('section');
  host.hidden=true;host.id='mobile-rolebook';host.setAttribute('aria-label',`${d.name} 캐릭터북`);
  host.style.cssText='position:fixed;inset:0;z-index:60;background:#101211;';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<link rel="stylesheet" href="assets/character-book-sample.css?v=5"><link rel="stylesheet" href="assets/rolebook-host.css?v=3"><link rel="stylesheet" href="assets/character-memory.css?v=2"><link rel="stylesheet" href="assets/rolebook-memory-host.css?v=2"><div class="rb-viewport"><div class="memory-app"><header class="topbar"><button type="button" class="rb-identity" data-act="notebook" aria-label="기억 수첩 열기"><img src="assets/portrait-${profile.image}.png" alt=""><span><strong>${d.name}</strong><small id="rb-phase">나의 기억</small></span></button><div class="tools"><button type="button" id="rb-motion" aria-pressed="false" aria-label="움직임 줄이기">움직임</button><button type="button" id="rb-cover" aria-label="화면 덮기">덮기</button></div></header><main id="rb-main" tabindex="-1"></main><footer class="memory-footer" id="rb-action"></footer><nav class="bottom-nav" aria-label="기본 메뉴"><button type="button" data-dest="book" aria-current="page">내 역할</button><button type="button" data-dest="inv">조사</button><button type="button" data-dest="kit">단서함 <span id="rb-count"></span></button></nav></div></div><dialog id="rb-private" aria-labelledby="rb-private-title"><div class="cover-content"><span class="eyebrow">잠시, 현실로</span><div class="covered-orb" aria-hidden="true"></div><h2 id="rb-private-title">기억을 덮어두었습니다.</h2><p>주변에 화면이 보이지 않을 때<br>읽던 곳으로 돌아오세요.</p><button type="button" class="primary" id="rb-resume">이어서 보기 ↗</button><small>마지막 역할 비밀은 다시 가려져 있어요.</small></div></dialog>`;
  document.body.appendChild(host);
  const $=s=>root.querySelector(s),main=$('#rb-main'),actions=$('#rb-action'),viewport=main;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const st={route:'home',page:0,started:false,done:false,topic:'',time:profile.before,answer:-1,visible:false,read:false,scrolls:{},expanded:{},visited:0,covered:false,reduced:reduced.matches};
  const warmed=new Set();
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
  const gate=content=>st.visible?`<div class="identity-controls"><span>나만 보는 비밀</span><button type="button" data-act="hide">다시 가리기</button></div>${content}`:`<section class="identity-gate" aria-label="가려진 역할 정보">${objectArt('drawer')}<h2>이 내용은 당신만 확인하세요.</h2><p>다른 사람에게 화면이 보이지 않는지<br>확인한 뒤 아래 버튼을 눌러주세요.</p><button type="button" class="primary-button" data-act="reveal">내 비밀 확인하기</button><small>확인 후 다시 가릴 수 있어요.<br>다른 화면으로 이동하면 자동으로 가려져요.</small></section>`;
  const verdict=()=>`<div class="verdict"><span>다른 사람에게 보여주지 마세요</span><h2>${d.verdict.t}</h2><p>${d.verdict.p}</p></div>${block('기억할 사실',profile.rule,'rule')}`;
  const rules=()=>`${block(d.culprit?'실제 행동과 알리바이를 구분해요':'실제로 한 일은 사실대로 답해요',profile.rule,'rule')}${block('아는 것과 모르는 것을 구분해요',profile.limits)}${block('비밀을 먼저 모두 말할 필요는 없어요','자기소개는 이름·직업·관계로 시작하세요. 질문받은 내용에 맞춰 답하고, 모르는 일은 모른다고 말해도 괜찮습니다.')}`;
  const quote=()=>`<div class="speech-example"><span>그대로 읽어도 괜찮아요</span><p>“${d.selfIntro}”</p></div>`;
  const meeting=()=>`<p class="lead">${profile.meeting.intro}</p><div class="record-cards rb-meeting-cards">${profile.meeting.cards.map(([art,title,fact,say])=>`<article class="rb-meeting-card"><div class="rb-meeting-heading"><span class="record-art">${objectArt(art)}</span><h2>${title}</h2></div><p>${fact}</p>${more('대화에서 이렇게 말할 수 있어요',`<p>“${say}”</p>`)}</article>`).join('')}</div>${block('모르는 부분은 모른다고 말해요',profile.meeting.boundary,'rule')}${more('내 비밀에 관해 질문받았다면',`<p>${profile.meeting.privateNote}</p>`)}<p class="context-note">필요할 때만 참고하세요. 메모를 모두 읽거나 발표할 필요는 없어요.</p>`;
  const finalGate=()=>st.visible?`<div class="scene-kicker"><span>현재 · 나의 역할</span><button type="button" data-act="hide">다시 가리기</button></div><h1>${d.verdict.t}</h1><div class="memory-lines"><p>${d.verdict.p}</p><p>${profile.rule}</p></div>`:`<div class="secret-gate"><span class="gate-symbol">${lock}</span><span class="eyebrow">나만 아는 진실</span><h1>잠시, 주변을<br>확인해주세요.</h1><p>당신의 범인 여부가 담겨 있습니다.<br>다른 사람에게 보이지 않게 확인하세요.</p><button type="button" class="reveal-button" data-act="reveal">내 비밀 확인하기 ↗</button><small>장면을 나가면 다시 가려집니다.</small></div>`;
  const lock='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>';
  function memoryScene(){
    const f=frames[st.page],hidden=f.final&&!st.visible;
    return `<section class="scene-screen ${hidden?'secret-hidden':''}" aria-label="${st.page+1}번째 기억"><div class="scene-art ${f.art||''}" aria-hidden="true"><img src="assets/${f.image}" alt=""><div class="scene-shade"></div></div><nav class="scene-progress" aria-label="기억 장면"><div class="scene-count"><span>${d.name}의 기억</span><span><b>${String(st.page+1).padStart(2,'0')}</b> / 06</span></div><ol>${frames.map((f,i)=>`<li><button type="button" data-memory="${i}" ${i>st.visited?'disabled':''} ${i===st.page?'aria-current="step"':''} aria-label="${i+1}번째 장면: ${f.label}"><i></i><span>${f.label}</span></button></li>`).join('')}</ol></nav><div class="scene-content"><div class="scene-copy">${f.final?finalGate():`<div class="scene-kicker"><span>${f.place}</span></div><h1>${f.title}</h1><div class="memory-lines">${f.lines.map(t=>`<p>${t}</p>`).join('')}</div><details class="scene-detail"><summary>${f.detailTitle}<span aria-hidden="true">＋</span></summary><p>${f.detail}</p></details>`}</div><span class="illustration-note">기억을 돕는 연출 이미지 · 실제 단서가 아닙니다</span></div></section>`;
  }
  function memoryIntro(){return `<section class="intro-screen"><div class="intro-art"><img src="assets/portrait-${profile.image}.png" alt="${d.name}의 정면 초상"><div class="portrait-vignette"></div><div class="memory-stone" aria-hidden="true"><i></i><b></b></div><span class="art-caption">${d.name} / MEMORY</span></div><div class="intro-copy"><span class="eyebrow">다른 사람의 삶으로 들어가는 순간</span><h1>이 기억은,<br>이제 당신의 것입니다.</h1><p>${d.name}이 되어, 그날을 떠올려보세요.</p><div class="intro-meta"><span>6개의 장면</span><i></i><span>소리 없이 · 직접 넘기기</span></div><p class="privacy-hint">${lock}<span>당신만 보는 기억입니다.<br>주변에 화면이 보이지 않는지 확인해주세요.</span></p><button type="button" class="rb-text-button rb-notebook-shortcut" data-act="notebook">기억 수첩 바로 보기 ↗</button></div></section>`;}
  const topics=[...(profile.meeting?[['meeting','회의에서 무슨 말을 하지?','직접 아는 사실과 대화 참고']]:[]),['relations','누가 누구였지?','인물 관계'],['timeline','그때 나는 어디 있었지?','시간별 행적'],['answers','이 질문에 어떻게 답하지?','질문별 참고'],['background','왜 그랬고, 무엇이 남았지?','배경과 남은 기록'],['secret','내 비밀 다시 확인하기','범인 여부와 역할 원칙']];
  const topicLinks=()=>`<div class="topic-links">${topics.map(([key,title,label])=>`<button type="button" data-topic="${key}"><div><strong>${title}</strong><span>${label}</span></div><span aria-hidden="true">→</span></button>`).join('')}</div>`;
  const key=()=>st.route==='brief'?`brief:${st.page}`:st.route==='reference'?`reference:${st.topic}:${st.topic==='timeline'?st.time:''}`:st.route==='notebook'||st.route==='home'&&st.done?'notebook':'home';
  function remember(){if(st.covered)return;st.scrolls[key()]=viewport.scrollTop;st.expanded[key()]=Array.from(main.querySelectorAll('details')).map(e=>e.open);}
  function navigate(route,opts={}){remember();st.visible=false;Object.assign(st,opts,{route});paint(st.scrolls[key()]||0);}
  function reference(){
    const title=st.topic==='intro'?'첫 자기소개':topics.find(t=>t[0]===st.topic)?.[2];
    let body='';
    if(st.topic==='intro')body=quote();
    if(st.topic==='relations')body=relations();
    if(st.topic==='meeting'&&profile.meeting)body=meeting();
    if(st.topic==='timeline')body=`<p class="lead">확인할 시각을 선택하세요.</p><div class="time-picker" role="group" aria-label="행적 시각">${memories.map((r,i)=>`<button type="button" data-time="${i}" aria-pressed="${st.time===i}">${r.t}${['사건 전','당일 아침'].includes(r.t)?' '+(memories.slice(0,i).filter(x=>x.t===r.t).length+1):''}</button>`).join('')}</div>${profile.scenes.filter(sc=>sc.t.split(' → ')[0]===memories[st.time].t).map(scene).join('')}${timeline([memories[st.time]])}${block('행동의 배경',profile.recap)}`;
    if(st.topic==='answers')body=`<p class="lead">받은 질문을 누르면 사실과 답변 예시를 볼 수 있어요.</p><div class="answer-list">${profile.answers.map(([q,fact,say,note],i)=>`<div><button type="button" data-answer="${i}" aria-expanded="${st.answer===i}"><span>${q}</span><span>${st.answer===i?'−':'＋'}</span></button>${st.answer===i?`<div class="answer-body">${block('내가 아는 사실',fact)}${block(d.culprit?'게임에서 말할 수 있는 예시 · 사실과 다를 수 있음':'이렇게 말할 수 있어요','“'+say+'”','spoken-answer')}${block('기억할 점',note)}</div>`:''}</div>`).join('')}</div>`;
    if(st.topic==='background')body=`<p class="lead">필요한 이야기를 골라 펼쳐보세요.</p>${more('왜 그런 선택을 했나요?',motive()+thought())}${more(profile.contextTitle,profile.contexts.map(([t,b])=>block(t,b)).join(''))}${more('내 배경 전체 확인하기',d.truth.map(t=>block(t.h,t.p)).join(''))}${more('내 행동이 남긴 기록',records())}${more('대화할 때의 원칙',rules()+block('연기 참고',profile.tips)+block('말투',d.persona.tone.join(' · '))+'<ul>'+d.persona.act.map(t=>'<li>'+t+'</li>').join('')+'</ul>')}`;
    if(st.topic==='secret')body=gate(`${verdict()}${motive()}${profile.contexts.map(([t,b])=>block(t,b)).join('')}${more('내 배경 전체 보기',d.truth.map(t=>block(t.h,t.p)).join(''))}`);
    return `<section class="reference-screen"><div class="reference-heading"><button type="button" class="back-button" data-act="notebook" aria-label="기억 수첩으로 돌아가기">←</button><h1>${st.topic==='intro'?'첫 자기소개':title}</h1></div>${body}</section>`;
  }
  function stageTask(){
    if(!ONLINE)return null;
    const phase=srvPhase||'';
    if(phase.includes('조사'))return {title:phase,body:'원하는 공간의 맨 위 카드를 선택하세요. 확보한 단서는 내 단서함에 자동 보관됩니다.',label:'조사 보드 열기',dest:'inv'};
    if(phase.includes('회의'))return {title:phase,body:'찾은 단서의 이름과 발견 장소를 말로 공유하세요. 단서 내용은 다른 사람에게 자동 공유되지 않아요.',label:'단서함 확인하기',dest:'kit'};
    if(phase==='자기소개')return {title:phase,body:'이름·직업·홍대표와의 관계를 말해주세요. 준비된 예시를 그대로 읽어도 괜찮아요.',label:'자기소개 예시 보기',action:'intro'};
    if(phase==='최종 변론')return {title:phase,body:'확보한 단서와 진술을 떠올리며 의심하는 인물과 근거를 말해주세요.',label:'내 단서 확인하기',dest:'kit'};
    if(phase==='진상 공개')return {title:phase,body:'공용 화면에서 사건의 진상을 함께 확인해주세요.'};
    if(phase==='롤카드 확인')return {title:phase,body:'기억 받기를 눌러 여섯 장면을 따라가세요. 마지막 정체는 혼자 볼 수 있을 때 확인하세요.'};
    return {title:phase||'진행 대기',body:'공용 화면의 진행 안내를 확인해주세요. 내 역할은 미리 읽어볼 수 있어요.'};
  }
  function leaveBook(dest){
    remember();conceal();tab=dest;nav=[];
    document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===tab));render();
  }
  function followStage(){const task=stageTask();if(task?.dest)leaveBook(task.dest);else if(task?.action==='intro')navigate('reference',{topic:'intro'});}
  function home(){
    if(!st.done&&st.route!=='notebook')return memoryIntro();
    return `<section class="notebook"><aside id="rb-stage-task" class="rb-stage-task" aria-label="현재 게임 단계" hidden></aside><div class="notebook-heading"><img src="assets/portrait-${profile.image}.png" alt=""><span class="eyebrow">${st.done?'기억의 끝, 당신의 시작':'필요한 기억부터 찾아보세요'}</span><h1>${st.done?'이제, '+d.name+'입니다.':d.name+'의 기억 수첩'}</h1><p>대화하다 기억이 흐려지면<br>필요한 내용만 다시 찾아보세요.</p></div>${topicLinks()}<div class="notebook-intro"><span class="eyebrow">첫 인사, 이렇게 시작해도 좋아요</span><p>“${d.selfIntro.split('<br>')[0]}”</p><button type="button" data-intro class="rb-text-button">자기소개 전체 보기 ↗</button></div><button type="button" class="restart-reading" data-act="restart">${st.started?'기억 처음부터 다시 보기':'여섯 장면으로 기억 받기'} ↗</button></section>`;
  }
  function action(name){
    if(name==='start'){st.started=true;navigate('brief');}
    else if(name==='restart'){st.page=0;st.started=true;st.scrolls={};st.expanded={};navigate('brief');}
    else if(name==='next'){if(frames[st.page].final&&!st.visible)return;if(st.page===frames.length-1){st.done=true;navigate('home');}else {st.visited=Math.max(st.visited,st.page+1);navigate('brief',{page:st.page+1});}}
    else if(name==='prev')navigate('brief',{page:st.page-1});
    else if(name==='home')navigate('home');
    else if(name==='notebook')navigate('notebook');
    else if(name==='stage')followStage();
    else if(name==='reveal'){st.visible=true;st.read=true;paint(viewport.scrollTop);}
    else if(name==='hide'){st.visible=false;paint(viewport.scrollTop);}
    else if(name==='cover'){conceal();restoreCover();}
  }
  function paint(scroll=0){
    const brief=st.route==='brief',notebook=st.route==='notebook'||st.route==='home'&&st.done,gated=brief&&frames[st.page].final&&!st.visible;
    $('.memory-app').classList.toggle('intro-mode',st.route==='home'&&!st.done);
    $('.memory-app').classList.toggle('is-memory',brief);
    $('.memory-app').classList.toggle('is-reference',st.route==='reference'||notebook);
    host.classList.toggle('rb-covered',st.covered);host.classList.toggle('reduced-motion',st.reduced);
    $('#rb-motion').textContent=st.reduced?'움직임 꺼짐':'움직임';$('#rb-motion').setAttribute('aria-pressed',String(st.reduced));
    main.innerHTML=brief?memoryScene():st.route==='reference'?reference():home();
    actions.innerHTML=brief?`<div class="footer-inner"><div class="scene-controls"><button type="button" class="previous" data-act="${st.page?'prev':'home'}" aria-label="${st.page?'이전 장면':'시작 화면으로'}">← <span>${st.page?'이전':'처음'}</span></button><button type="button" class="primary" data-act="next" ${gated?'disabled':''}>${gated?'내 비밀을 먼저 확인해주세요':frames[st.page].final?'기억 수첩 열기':'다음 기억'} <span aria-hidden="true">↗</span></button></div><span class="footer-note">${gated?'마지막 정체는 당신만 확인하세요.':'자동으로 넘어가지 않아요. 천천히 확인하세요.'}</span></div>`:`<div class="footer-inner"><button type="button" class="primary" ${st.route==='home'||notebook?'id="rb-home-primary"':''} data-act="${st.route==='reference'?'notebook':notebook?'cover':'start'}"><span>${st.route==='reference'?'기억 수첩으로 돌아가기':notebook?'화면 덮고 다음 안내 기다리기':st.started?'읽던 기억 이어보기':d.name+'의 기억 받기'}</span><span aria-hidden="true">↗</span></button></div>`;
    root.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>action(b.dataset.act));
    main.querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>{if(!b.disabled)navigate('brief',{page:Number(b.dataset.memory)});});
    main.querySelector('[data-intro]')?.addEventListener('click',()=>navigate('reference',{topic:'intro'}));
    main.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>navigate('reference',{topic:b.dataset.topic}));
    main.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{remember();st.time=Number(b.dataset.time);paint(st.scrolls[key()]||0);});
    main.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{st.answer=st.answer===Number(b.dataset.answer)?-1:Number(b.dataset.answer);paint(viewport.scrollTop);});
    main.querySelectorAll('details').forEach((el,i)=>{el.open=st.expanded[key()]?.[i]||false;});
    if(!host.hidden&&!st.covered)main.focus({preventScroll:true});viewport.scrollTop=scroll;
    // Warm only this player's next image; do not download every role's artwork.
    const next=frames[brief?Math.min(st.page+1,frames.length-1):1]?.image;
    if(next&&!warmed.has(next)){warmed.add(next);const img=new Image();img.src='assets/'+next;}
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
    if(homePrimary&&(st.done||st.route==='notebook')){homePrimary.dataset.act=task?.label?'stage':'cover';homePrimary.querySelector('span').textContent=task?.label||'화면 덮고 다음 안내 기다리기';}

  }
  function conceal(){remember();st.visible=false;st.covered=true;if($('#rb-private').open)$('#rb-private').close();paint(st.scrolls[key()]||0);}
  function restoreCover(){if(!host.hidden&&st.covered&&!$('#rb-private').open)$('#rb-private').showModal();}
  function resumeCover(){st.covered=false;$('#rb-private').close();paint(st.scrolls[key()]||0);}
  $('#rb-cover').onclick=()=>action('cover');$('#rb-resume').onclick=resumeCover;
  $('#rb-private').addEventListener('cancel',e=>{e.preventDefault();resumeCover();});
  $('#rb-motion').onclick=()=>{remember();st.reduced=!st.reduced;paint(st.scrolls[key()]||0);};
  reduced.addEventListener('change',e=>{remember();st.reduced=e.matches;paint(st.scrolls[key()]||0);});
  root.querySelectorAll('[data-dest]').forEach(b=>b.onclick=()=>{
    if(b.dataset.dest==='book'){navigate('notebook');return;}
    leaveBook(b.dataset.dest);
  });
  const originalRender=render, originalNet=dockNet;
  const gameApp=document.getElementById('app');
  rBook=function(){M().innerHTML='';host.hidden=document.getElementById('gate').style.display!=='none';gameApp.inert=!host.hidden;sync();restoreCover();};
  render=function(){if(tab!=='book'||srvVote){if(!host.hidden){remember();conceal();}host.hidden=true;gameApp.inert=false;}originalRender();};
  dockNet=function(){originalNet();sync();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!host.hidden){conceal();restoreCover();}});
  window.addEventListener('blur',()=>{if(!host.hidden){conceal();restoreCover();}});
  window.addEventListener('pagehide',()=>{if(!host.hidden)conceal();});
  window.addEventListener('pageshow',e=>{if(e.persisted&&!host.hidden)restoreCover();});
  paint();render();
})();
