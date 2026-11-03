(() => {
  'use strict';
  // Isolated cinematic sample. All narrative facts come from 2.html and ROLEBOOK_PROFILES.han.
  // No Firebase, room data, game progression, browser storage, or other roles' secrets.
  const roleBrief={"secret":"아내를 죽이려고 수프에 살충제를 넣었습니다. 하지만 그 행동이 실제 사망 원인이라는 뜻은 아닙니다.","stance":"먼저 밝힐 필요는 없어요. 증거를 들어 추궁받으면 실제로 한 일을 사실대로 답하세요."};
  const scenes = [
    {label:'내 역할',place:'현재 · 나의 역할',image:'assets/portrait-han.png',art:'portrait truth',private:true,title:'당신은 범인이 아닙니다',lines:[roleBrief.secret,roleBrief.stance]},
    {
      label:'나의 얼굴', place:'오늘의 파티', image:'assets/portrait-han.png', art:'portrait',
      title:'오늘의 주인공은<br>나여야 했다.',
      lines:['내 이름은 한소설. 홍대표의 남편이자 소설가다.', '오늘은 내 소설의 영화화를 축하하는 날이었다.'],
      detailTitle:'이 인물을 어떻게 연기할까요?', detail:'슬픔과 짜증이 함께 드러납니다. 의심을 받으면 발끈하는 사람입니다. 하지만 다른 사람의 말도 끝까지 들어주세요.'
    },
    {
      label:'나의 두려움', place:'사건 전 · 결혼 계약', image:'assets/memory-han-contract.png', art:'contract',
      title:'과거가 드러나면,<br>모든 걸 잃는다.',
      lines:['아내가 내 과거를 알아보려 했다.', '계약대로라면 이혼. 내 잘못이라면 금전적 배상까지 해야 했다.'],
      detailTitle:'계약이 왜 두려웠나요?', detail:'과거의 잘못이 드러나면 이혼하고, 한소설에게 책임이 있으면 금전적 피해보상까지 해야 한다는 결혼 계약이 있었습니다. 계약서는 잠긴 서랍에 있습니다.'
    },
    {
      label:'나의 결심', place:'사건 전 · 돈과 선택', image:'assets/prologue-novel.png', art:'study',
      title:'돈이 필요했다.<br>나는 선을 넘기로 했다.',
      lines:['투자마저 실패했다. 나는 아내의 유산과 사망보험을 알아봤다.', '결국 아내를 죽이려 살충제를 내 이름으로 샀다.'],
      detailTitle:'왜 이런 선택을 했나요?', detail:'과거가 드러나면 이혼과 배상을 감당해야 한다는 두려움에 투자 실패까지 겹쳤습니다. 아내를 죽이려 한 것은 당신의 선택입니다. 유산과 보험을 실제로 받았다는 뜻은 아닙니다.'
    },
    {
      label:'나의 행동', place:'19:30 · 식당에서 주방으로', image:'assets/memory-han-kitchen.png', art:'kitchen',
      title:'그 사이,<br>나는 주방으로 갔다.',
      lines:['백비서에게 식당 테이블을 확인해달라고 했다.', '그가 확인하는 동안, 아내의 수프에 살충제를 넣었다.'],
      detailTitle:'백비서는 어디까지 봤나요?', detail:'19:31경 백비서가 당신이 주방에서 나오는 모습을 봤습니다. 주방 안에서 살충제를 넣는 장면을 직접 본 것은 아닙니다. 테이블의 어떤 물건을 확인시켰는지까지는 설정에 없습니다.',
    },
    {
      label:'어긋난 만찬', place:'19:40 → 20:00 · 식당', image:'assets/mansion-dining.png', art:'dining',
      title:'내 자리에,<br>아내가 앉아 있었다.',
      lines:['만찬이 시작됐다. 내가 상석으로 정해둔 자리에 아내가 있었다.', '20:00, 홍대표가 사망했다.'],
      detailTitle:'자리에서 기억해야 할 것은?', detail:'당신은 축하받는 주인공이니 상석에 앉으리라 생각했습니다. 잠긴 서랍의 좌석 메모에 ‘내 자리(상석)’라고 적었습니다. 아내가 그 자리에 앉은 이유까지는 모릅니다.'
    }
  ];
  const $ = s => document.querySelector(s);
  const main = $('#memory-main'), footer = $('#memory-footer'), cover = $('#privacy-cover');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {view:'intro', scene:0, visited:0, reveal:false, reduced:reduced.matches, covered:false, finished:false, reference:''};
  const lock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>';
  const portal=window.MemoryPortal.create({root:document.body,stage:main,content:document.querySelector('.memory-app'),portrait:'assets/portrait-han.png',images:scenes.slice(2,4).map(s=>s.image),canPlay:()=>!state.covered,isReduced:()=>state.reduced,onCover:()=>putCover()});
  const arrow = '<span aria-hidden="true">↗</span>';
  function intro() {
    return `<section class="intro-screen"><div class="intro-art"><img src="assets/portrait-han.png" alt="한소설의 정면 초상" fetchpriority="high"><div class="portrait-vignette"></div>${window.MemoryPortal.stone()}<span class="art-caption">HAN SOSEOL / MEMORY 01</span></div><div class="intro-copy"><span class="eyebrow">다른 사람의 삶으로 들어가는 순간</span><h1>이 기억은,<br>이제 당신의 것입니다.</h1><p>한소설이 되어, 그날을 떠올려보세요.</p><div class="intro-meta"><span>역할 확인 + 5개의 기억</span><i></i><span>소리 없이 · 직접 넘기기</span></div><p class="privacy-hint">${lock}<span>당신만 보는 기억입니다.<br>주변에 화면이 보이지 않는지 확인해주세요.</span></p></div></section>`;
  }
  function canJump(index){return index<=state.visited&&(!scenes[state.scene].private||state.reveal||index===state.scene);}
  function progress() {
    return `<nav class="scene-progress" aria-label="기억 장면"><div class="scene-count"><span>한소설의 기억</span><span>${state.finished?'<button type="button" class="notebook-back" data-action="notebook">기억 수첩 ↗</button>':''}<b>${String(state.scene+1).padStart(2,'0')}</b> / 06</span></div><ol>${scenes.map((s,i)=>`<li><button type="button" data-jump="${i}" ${!canJump(i)?'disabled':''} ${i===state.scene?'aria-current="step"':''} aria-label="${i+1}번째 장면: ${s.label}"><i></i><span>${s.label}</span></button></li>`).join('')}</ol></nav>`;
  }
  function scene() {
    const s=scenes[state.scene], hidden=s.private&&!state.reveal;
    const content=hidden?`<div class="secret-gate"><span class="gate-symbol">${lock}</span><span class="eyebrow">이 역할로 기억을 읽기 전에</span><h1>먼저, 당신의 역할을<br>확인해주세요.</h1><p>범인 여부 · 나만 아는 행동 · 대화 원칙<br>다른 사람에게 보이지 않게 확인하세요.</p><button type="button" class="reveal-button" data-action="reveal">내 역할과 비밀 확인하기 ${arrow}</button><small>장면을 나가면 다시 가려집니다.</small></div>`:s.private?`<section class="role-orientation" aria-label="나만 확인하는 역할"><div class="identity-controls"><span>다른 사람에게 보여주지 마세요</span><button type="button" data-action="hide">다시 가리기</button></div><span class="orientation-label">내 정체</span><h1>${s.title}</h1><dl><div><dt>나만 아는 행동</dt><dd>${roleBrief.secret}</dd></div><div><dt>대화할 때</dt><dd>${roleBrief.stance}</dd></div></dl></section>`:
      `<div class="scene-copy" key="${state.scene}"><div class="scene-kicker"><span>${s.place}</span>${s.private?'<button type="button" data-action="hide">'+lock+' 다시 가리기</button>':''}</div><h1>${s.title}</h1><div class="memory-lines">${s.lines.map(l=>`<p>${l}</p>`).join('')}</div><details class="scene-detail"><summary>${s.detailTitle}<span aria-hidden="true">＋</span></summary><p>${s.detail}</p></details></div>`;
    return `<section class="scene-screen ${s.private?'identity-scene':''} ${hidden?'secret-hidden':''}" aria-label="${state.scene+1}번째 기억"><div class="scene-art ${s.art} ${hidden?'veiled':''}" aria-hidden="true"><img src="${s.image}" alt=""><div class="scene-shade"></div></div>${progress()}<div class="scene-content">${content}<span class="illustration-note">기억을 돕는 연출 이미지 · 실제 단서가 아닙니다</span></div></section>`;
  }
  const refs = [
    ['relations','사람과 관계','얼굴을 누르듯, 관계를 떠올리기'],
    ['timeline','그날의 동선','시각별로 내가 한 일 확인하기'],
    ['secret','나의 비밀','역할과 행동을 혼자 다시 보기']
  ];
  function notebook() {
    return `<section class="notebook"><div class="notebook-heading"><img src="assets/portrait-han.png" alt="한소설"><span class="eyebrow">기억의 끝, 당신의 시작</span><h1>이제, 한소설입니다.</h1><p>대화하다 기억이 흐려지면<br>필요한 장면만 다시 찾아보세요.</p></div><div class="notebook-intro conversation-ready"><span class="eyebrow">대화는 이렇게 시작하세요</span><p>“한소설입니다. 소설을 씁니다.<br>홍대표는… 제 아내였습니다.”</p><small>이름·직업·관계로 인사하고, 질문받은 내용에 맞춰 답하세요.</small><button class="reference-back" type="button" data-reference="secret">내 비밀·대화 원칙 다시 확인 ↗</button></div><div class="recall-links">${refs.map(([key,t,desc])=>`<button type="button" data-reference="${key}"><span><b>${t}</b><small>${desc}</small></span>${arrow}</button>`).join('')}</div><div class="sample-note"><span>한 캐릭터의 연출을 살펴보는 시안입니다.</span><a href="character-book-sample.html">기존 캐릭터북과 비교하기 ↗</a></div></section>`;
  }
  function reference() {
    const relations=state.reference==='relations';
    const title=relations?'내 곁의 사람들':'그날, 내가 지나온 곳';
    const rows=relations?[
      ['홍','홍대표','아내 · 경제와 일에서 나보다 우위에 있던 사람'],
      ['yoon','윤꽃집','옛 연인 · 지금은 서로 적대하는 사이'],
      ['yoo','유감독','협력하면서도 서로를 불신하는 사이'],
      ['baek','백비서','아내 편에 선 사람 · 내가 경계하는 상대']
    ]:[];
    const times=[
      ['사건 전','협박편지 때문에 윤꽃집과 논쟁했다. 그가 발신자라고 믿지만 확증은 없다.'],
      ['15:00','파티 손님을 맞이했다.'],
      ['17:30','윤꽃집을 망신주려 협박편지를 가지러 내 방으로 갔다.'],
      ['17:40','편지를 든 채 윤꽃집과 마주쳐 말싸움을 했다.'],
      ['19:30','백비서에게 식당 테이블 확인을 부탁했다. 그 사이 주방에서 아내의 수프에 살충제를 넣었다.'],
      ['19:31경','백비서가 내가 주방에서 나오는 모습을 봤다.'],
      ['19:40','식사 시작. 내 자리로 정해둔 곳에 아내가 앉아 있었다.'],
      ['20:00','홍대표가 사망했다.']
    ];
    const content=relations?`<div class="relationship-list">${rows.map(([img,name,text])=>`<article>${img==='홍'?'<span class="missing-portrait" aria-hidden="true">홍</span>':`<img src="assets/portrait-${img}.png" alt="">`}<div><h2>${name}</h2><p>${text}</p></div></article>`).join('')}</div>`:`<ol class="recall-timeline">${times.map(([t,copy])=>`<li><time>${t}</time><p>${copy}</p></li>`).join('')}</ol>`;
    return `<section class="notebook reference"><button class="reference-back" type="button" data-action="notebook">← 기억 수첩</button><span class="eyebrow">한소설 · 다시 떠올리기</span><h1>${title}</h1>${content}</section>`;
  }
  function render(focus=true) {
    document.body.classList.toggle('reduced-motion',state.reduced);
    document.body.classList.toggle('intro-mode',state.view==='intro');
    $('#motion-toggle').setAttribute('aria-pressed',String(state.reduced));
    $('#motion-toggle').setAttribute('aria-label',state.reduced?'움직임 켜기':'움직임 줄이기');
    $('#motion-toggle span').textContent=state.reduced?'움직임 꺼짐':'움직임';
    main.innerHTML=state.view==='intro'?intro():state.view==='scene'?scene():state.view==='reference'?reference():notebook();
    if(state.view==='intro')footer.innerHTML=`<div class="footer-inner"><span class="footer-note">넘기는 속도는 당신이 정합니다.</span><button type="button" class="primary" data-action="start">한소설의 기억 받기 ${arrow}</button></div>`;
    else if(state.view==='scene') {
      const gated=scenes[state.scene].private&&!state.reveal;
      footer.innerHTML=`<div class="footer-inner"><div class="scene-controls"><button type="button" class="previous" data-action="previous" aria-label="${state.scene?'이전 장면':'시작 화면으로'}">← <span>${state.scene?'이전':'처음'}</span></button><button type="button" class="primary" data-action="next" ${gated?'disabled':''}>${gated?'내 역할과 비밀을 먼저 확인해주세요':scenes[state.scene].private?'이 역할로 기억 따라가기':state.scene===scenes.length-1?'대화 준비하기':'다음 기억'} ${arrow}</button></div><span class="footer-note">${gated?'역할을 확인한 뒤 이유와 행적을 읽어보세요.':state.scene===scenes.length-1?'첫 인사와 대화 원칙을 수첩에서 정리해요.':'자동으로 넘어가지 않아요. 천천히 확인하세요.'}</span></div>`;
    } else if(state.view==='reference')footer.innerHTML=`<div class="footer-inner"><button type="button" class="primary" data-action="notebook">기억 수첩으로 돌아가기 ${arrow}</button></div>`;
    else footer.innerHTML=`<div class="footer-inner"><button type="button" class="primary" data-action="restart">기억 처음부터 다시 보기 ${arrow}</button></div>`;
    main.scrollTop=0;
    if(focus)main.focus({preventScroll:true});
    portal.present();
  }
  function goScene(i) {
    if(i<0){state.view='intro';state.reveal=false;render();return;}
    if(i>=scenes.length){state.view='notebook';state.finished=true;state.reveal=false;render();return;}
    state.view='scene';state.scene=i;state.visited=Math.max(state.visited,i);state.reveal=false;render();
  }
  function conceal() {
    state.reveal=false;
    // Remove private copy from the DOM before displaying the opaque privacy cover.
    if((state.view==='scene'&&scenes[state.scene].private)||state.view==='reference')render(false);
  }
  function putCover() {
    if(state.covered)return;
    portal.cancel();state.covered=true;document.body.classList.add('is-covered');conceal();cover.showModal();
  }
  function resume() { cover.close();state.covered=false;document.body.classList.remove('is-covered');render(); }
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.action==='start'||button.dataset.action==='restart')portal.play(()=>goScene(0));
    else if(button.dataset.action==='previous')goScene(state.scene-1);
    else if(button.dataset.action==='next'){
      if(scenes[state.scene].private&&!state.reveal)return;
      goScene(state.scene+1);
    } else if(button.dataset.action==='reveal'){state.reveal=true;render();}
    else if(button.dataset.action==='hide'){conceal();render();}
    else if(button.dataset.action==='notebook'&&state.finished){state.view='notebook';state.reveal=false;render();}
    else if(button.dataset.jump!==undefined){const n=Number(button.dataset.jump);if(canJump(n))goScene(n);}
    else if(button.dataset.reference){
      if(button.dataset.reference==='secret')goScene(0);
      else {state.view='reference';state.reference=button.dataset.reference;state.reveal=false;render();}
    }
  });
  $('#motion-toggle').addEventListener('click',()=>{state.reduced=!state.reduced;render(false);});
  $('#cover-button').addEventListener('click',putCover);
  $('#resume-button').addEventListener('click',resume);
  cover.addEventListener('cancel',e=>{e.preventDefault();resume();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!state.covered){e.preventDefault();putCover();return;}
    if(state.covered||state.view!=='scene'||e.altKey||e.ctrlKey||e.metaKey)return;
    // Arrow navigation is inactive while interacting with disclosure/buttons.
    if(e.target.closest('button, a, summary'))return;
    if(e.key==='ArrowLeft'){e.preventDefault();goScene(state.scene-1);}
    else if(e.key==='ArrowRight'&&(!scenes[state.scene].private||state.reveal)){e.preventDefault();goScene(state.scene+1);}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)putCover();});
  window.addEventListener('blur',putCover);
  window.addEventListener('pagehide',()=>{portal.cancel();document.body.classList.add('is-covered');conceal();});
  window.addEventListener('pageshow',e=>{if(e.persisted&&!state.covered)putCover();});
  reduced.addEventListener('change',e=>{state.reduced=e.matches;if(e.matches)portal.skip();render(false);});
  // Warm the next image; images are illustrative, never additional evidence.
  for(const path of new Set(scenes.map(s=>s.image))){const img=new Image();img.src=path;}
  render(false);
})();
