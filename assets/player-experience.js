/* Shared player UI. Claim ownership through the existing game transaction. */
(() => {
  let selection=null, selectionRound=null, activeDraw=null, dialog=null, returnGroup='site', viewer=null, activeView=null;
  const groups=[['site','저택'],...ORDER.map(k=>[k,`${NAMES[k]}의 공간`])];
  const label=l=>l.zone==='site'?`저택 · ${l.name}`:`${NAMES[l.owner]} · ${l.name}`;
  const clueLocation=id=>Object.values(LOC).find(l=>l.clues.includes(id));
  const groupFor=l=>l.zone==='site'?'site':l.owner;
  const groupName=k=>groups.find(([key])=>key===k)?.[1]||'저택';
  const groupPool=k=>Object.entries(LOC).filter(([,l])=>groupFor(l)===k).flatMap(([key])=>poolAt(key).map(value=>({c:typeof value==='string'?value:value.c,loc:key}))).filter(x=>!found.has(x.c));
  const emblem=k=>`<svg viewBox="0 0 120 96" aria-hidden="true" focusable="false"><path d="M15 82V38L60 12L105 38V82M9 82H111M25 33H95M31 82V48H48V82M72 82V48H89V82M51 82V57Q60 47 69 57V82"/><path d="M60 12V3M56 3H72"/><circle cx="60" cy="34" r="7"/>${k==='han'?'<path d="M41 66L60 70L79 66M60 70V80"/>':k==='yun'?'<path d="M60 77V53M60 61Q42 45 48 67M60 61Q78 45 72 67"/>':k==='yu'?'<circle cx="60" cy="66" r="12"/>':k==='bak'?'<path d="M49 56H71V76H49Z"/>':''}</svg>`;
  const back=k=>`<span class="ux-card-back ux-theme-${k}"><span class="ux-card-ornament">◆</span>${emblem(k)}<strong>${groupName(k)}</strong><small>현장 단서</small><span class="ux-card-ornament">◇</span></span>`;
  const originalMap=rMap;
  rMap=function(){
    $('#bk').classList.remove('on');
    if(ONLINE&&!srvRound){M().classList.remove('ux-board-main');originalMap();return;}
    M().classList.add('ux-board-main');
    $('#tt').textContent='조사 보드';
    const left=drawsLeft();
    M().innerHTML=`<div class="ux-board-heading"><div><small>INVESTIGATION BOARD</small><h2>${ROUND_NAME[round]}</h2></div><div class="ux-turns">조사 기회 <strong>${left}</strong>회</div></div>
      <p class="ux-board-instruction" role="status">${activeDraw?'선택한 카드를 확인하고 있어요.':left?'원하는 공간의 맨 위 카드를 눌러주세요.':'조사를 마쳤어요. 단서함에서 찾은 내용을 확인하세요.'}</p>
      <section class="ux-board" aria-label="다섯 공간의 조사 카드 보드">${groups.map(([k,name])=>{
        const n=groupPool(k).length, depth=Math.min(17,Math.max(0,n-1)*1.7);
        return `<article class="ux-tray ux-theme-${k} ${k==='site'?'ux-tray-mansion':''} ${!n?'ux-tray-empty':''}"><div class="ux-tray-name"><h3>${name}</h3><span>남은 <strong>${n}</strong>장</span></div>
          <div class="ux-stack" style="--depth:${depth}px">${n?Array.from({length:n-1},(_,i)=>`<i class="ux-stack-layer" aria-hidden="true" style="--offset:${(depth*(n-1-i)/(n-1)).toFixed(2)}px"></i>`).join(''):''}
          ${n?`<button class="ux-stack-top" data-deck="${k}" ${!left||activeDraw?'disabled':''} aria-label="${name}, 남은 ${n}장, 단서 한 장 가져오기">${back(k)}</button>`:`<div class="ux-empty-slot">${emblem(k)}<strong>카드 없음</strong><small>이번 조사에서<br>확보 가능한 카드가 없어요</small></div>`}</div>
          <p class="ux-tray-hint">${!n?'다른 공간을 살펴보세요':!left?'이번 조사 기회를 모두 썼어요':'맨 위 카드 한 장 가져오기'}</p></article>`;
      }).join('')}</section><p class="ux-board-note">장수는 이번 조사에서 내가 확보할 수 있는 카드 기준입니다.</p>${!ONLINE&&left===0&&round<3?'<button class="act g" id="ux-next-round">다음 조사 체험하기</button>':''}`;
    M().querySelectorAll('[data-deck]').forEach(b=>b.onclick=()=>drawCard(b.dataset.deck,b));
    const next=$('#ux-next-round');if(next)next.onclick=nextRound;
  };

  function getDialog(){
    if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.className='ux-draw-dialog';
    dialog.setAttribute('aria-label','조사 카드');
    document.body.appendChild(dialog);
    dialog.addEventListener('cancel',e=>{e.preventDefault();dismissCard();});
    return dialog;
  }
  function dismissCard(){
    if(activeDraw){
      activeDraw.dismissed=true;
      if(activeDraw.done)activeDraw=null;
    }
    if(dialog?.open)dialog.close();
    if(tab==='inv'&&!srvVote){nav=[];render();}
    const target=M().querySelector(`[data-deck="${returnGroup}"]:not(:disabled)`);
    if(target)target.focus();
    else {M().setAttribute('tabindex','-1');M().focus({preventScroll:true});}
  }
  function showBack(request,button){
    const box=getDialog(),r=button.getBoundingClientRect();
    box.innerHTML=`<div class="ux-card-flight" style="--from-x:${r.left+r.width/2-window.innerWidth/2}px;--from-y:${r.top+r.height/2-window.innerHeight/2}px"><div class="ux-flip-card"><div class="ux-flip-back">${back(request.group)}</div></div></div><p class="ux-draw-status" role="status">카드를 들어 올리고 있어요…</p><button class="ux-dialog-close" type="button">닫고 기다리기</button>`;
    box.querySelector('.ux-dialog-close').onclick=dismissCard;
    box.showModal();
  }
  // Both the collected thumbnail and expanded view use the exact same card face.
  function frontContent(id){
    const c=C[id],l=clueLocation(id);
    return `<div class="ux-source">${l?label(l):c.w}</div><small class="ux-front-kicker">단서함 보관 완료</small>${IMG[id]?`<div class="ux-clue-art">${IMG[id]}</div>`:''}<h2>${c.n}</h2><div class="ux-front-where">발견 위치 · ${c.w}</div><div class="ux-clue-copy">${c.d}</div>`;
  }
  function getViewer(){
    if(viewer)return viewer;
    viewer=document.createElement('dialog');viewer.className='ux-draw-dialog ux-kit-dialog';
    viewer.setAttribute('aria-label','보관한 단서 카드');
    document.body.appendChild(viewer);
    viewer.addEventListener('cancel',e=>{e.preventDefault();closeView();});
    return viewer;
  }
  function showFront(request,animate=true){
    const isKit=request.mode==='kit',c=C[request.c],box=isKit?getViewer():getDialog();
    box.innerHTML=`<div class="ux-card-flight ${isKit?'ux-kit-lift':'ux-card-centered'}"><div class="ux-flip-card ${isKit?'ux-kit-face':animate?'ux-turn-over':'ux-face-up'}">${isKit?'':`<div class="ux-flip-back" aria-hidden="true">${back(request.group)}</div>`}<article class="ux-flip-front ux-card-paper" aria-label="${c.n}"><div class="ux-front-scroll">${frontContent(request.c)}</div><div class="ux-front-actions"><button class="ux-mark" type="button" aria-pressed="${starred.has(request.c)}">${starred.has(request.c)?'★ 중요 표시함':'☆ 중요 표시하기'}</button><button class="ux-store" type="button">${isKit?'단서함으로 돌아가기':'보관 완료 · 조사 계속하기'}</button></div></article></div></div><p class="ux-draw-status" role="status">${isKit?'이미 보관된 카드입니다. 언제든 다시 읽을 수 있어요.':`단서함에 자동 보관됐어요 · 조사 기회 ${drawsLeft()}회 남음`}</p>`;
    if(isKit){
      const flight=box.querySelector('.ux-card-flight'),r=request.sourceRect;
      flight.style.setProperty('--from-x',`${r.left+r.width/2-window.innerWidth/2}px`);
      flight.style.setProperty('--from-y',`${r.top+r.height/2-window.innerHeight/2}px`);
      flight.style.setProperty('--from-scale',String(Math.min(1,r.width/Math.min(window.innerWidth*.92-10,380))));
    }
    if(!box.open)box.showModal();
    box.querySelector('.ux-mark').onclick=e=>{
      starred.has(request.c)?starred.delete(request.c):starred.add(request.c);
      e.currentTarget.textContent=starred.has(request.c)?'★ 중요 표시함':'☆ 중요 표시하기';
      e.currentTarget.setAttribute('aria-pressed',String(starred.has(request.c)));
    };
    box.querySelector('.ux-store').onclick=()=>isKit?closeView():storeCard(request);
    box.querySelector('.ux-store').focus({preventScroll:true});
  }
  function closeView(){
    const request=activeView;
    if(!request||request.closing)return;
    request.closing=true;
    const flight=viewer.querySelector('.ux-card-flight'),r=flight.getBoundingClientRect(),target=request.sourceRect;
    flight.style.setProperty('--to-x',`${target.left+target.width/2-(r.left+r.width/2)}px`);
    flight.style.setProperty('--to-y',`${target.top+target.height/2-(r.top+r.height/2)}px`);
    flight.style.setProperty('--to-scale',String(target.width/r.width));
    flight.classList.add('ux-return-to-kit');
    viewer.querySelectorAll('button').forEach(b=>b.disabled=true);
    setTimeout(()=>{
      if(activeView!==request)return;
      activeView=null;viewer.close();
      if(tab==='kit'&&!srvVote){
        rKit();window.scrollTo({top:request.scrollY,behavior:'instant'});
        M().querySelector(`[data-evidence="${request.c}"]`)?.focus({preventScroll:true});
      }
    },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:320);
  }
  function storeCard(request){
    if(request.storing)return;
    request.storing=true;
    const flight=dialog.querySelector('.ux-card-flight'),dockEl=document.querySelector('.dock'),r=flight.getBoundingClientRect(),d=dockEl?.getBoundingClientRect();
    flight.style.setProperty('--to-x',`${d?d.left+d.width/2-(r.left+r.width/2):0}px`);
    flight.style.setProperty('--to-y',`${d?d.top+d.height/2-(r.top+r.height/2):180}px`);
    flight.classList.add('ux-store-away');
    dialog.querySelectorAll('button').forEach(b=>b.disabled=true);
    setTimeout(()=>{if(activeDraw===request){dismissCard();toast('단서함에서 언제든 다시 볼 수 있어요');}},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:480);
  }
  function failDraw(request,message){
    if(activeDraw!==request)return;
    request.done=true;
    dismissCard();toast(message);
  }
  function drawCard(group,button){
    if(activeDraw||drawsLeft()<=0||(ONLINE&&(!srvRound||srvRound!==round))||srvVote)return;
    const pool=groupPool(group);
    if(!pool.length){rMap();return;}
    const pick=pool[Math.floor(Math.random()*pool.length)];
    const request={...pick,group,round,started:Date.now(),done:false,dismissed:false};
    activeDraw=request;returnGroup=group;
    M().querySelectorAll('[data-deck]').forEach(b=>b.disabled=true);
    showBack(request,button);
    try{
      claim(pick.c,ok=>{
        if(request.done)return;
        if(!ok){failDraw(request,'카드를 확보하지 못했어요. 다른 참가자가 가져갔거나 연결이 끊겼을 수 있어요. 조사 기회는 사용되지 않았어요.');return;}
        // A realtime snapshot may already have counted this successful claim.
        request.done=true;
        found.add(pick.c);
        if(ONLINE)taken[pick.c]=MYKEY+'#'+request.round;
        if(round===request.round&&!roundDraw.some(x=>x.c===pick.c))roundDraw.push({c:pick.c,loc:pick.loc});
        dock();
        if(request.dismissed||tab!=='inv'||srvVote||(ONLINE&&srvRound!==request.round)||round!==request.round){
          activeDraw=null;if(dialog?.open)dialog.close();render();toast('확보한 카드는 단서함에 저장됐어요');return;
        }
        // Keep the lift visible even when the claim response is immediate.
        setTimeout(()=>{
          if(activeDraw!==request||request.dismissed)return;
          if(srvVote||tab!=='inv'||round!==request.round||(ONLINE&&srvRound!==request.round)){dismissCard();return;}
          rMap();showFront(request);
        },Math.max(0,360-(Date.now()-request.started)));
      });
    }catch(e){failDraw(request,'연결을 확인하고 다시 조사해주세요.');}
  }
  const originalRender=render;
  render=function(){
    M().classList.toggle('ux-board-main',tab==='inv'&&!srvVote);
    if(activeDraw&&(srvVote||tab!=='inv'||round!==activeDraw.round||(ONLINE&&srvRound!==activeDraw.round))){
      activeDraw.dismissed=true;if(activeDraw.done)activeDraw=null;
      if(dialog?.open)dialog.close();
    }
    if(activeView&&(tab!=='kit'||srvVote)){activeView=null;if(viewer?.open)viewer.close();}
    originalRender();
  };
  rClue=function(top){
    nav=[];rMap();
    const l=clueLocation(top.c),request={c:top.c,group:l?groupFor(l):'site',round,done:true};
    activeDraw=request;returnGroup=request.group;showFront(request,false);
  };
  rKit=function(){
    $('#tt').textContent='내 단서함';
    M().innerHTML=`<div class="ux-guide"><strong>자동 보관된 단서 ${found.size}장</strong>조사에서 확보한 카드가 자동으로 모여요. 앞면 카드를 누르면 크게 읽을 수 있습니다.<br>회의 때 단서 이름과 발견 장소를 말로 공유해주세요.</div>`;
    if(!found.size){M().insertAdjacentHTML('beforeend','<div class="kempty">아직 확보한 카드가 없어요.<br>조사에서 카드를 공개하면 자동으로 보관돼요.</div>');return;}
    const card=id=>`<button class="ux-evidence ux-card-paper" data-evidence="${id}" aria-label="${C[id].n} 카드 확대하기"><div class="ux-front-scroll">${frontContent(id)}</div><span class="ux-mini-footer"><span>${starred.has(id)?'★ 중요 단서':'✓ 보관된 단서'}</span><span>확대해서 읽기 ↗</span></span></button>`;
    // Each physical card appears once; important cards keep their star in their own group.
    groups.forEach(([k,n])=>{const ids=[...found].filter(id=>{const l=clueLocation(id);return l&&(k==='site'?l.zone==='site':l.owner===k);});if(ids.length)M().insertAdjacentHTML('beforeend',`<h3 class="ux-kit-heading">${n} <span>${ids.length}장</span></h3><div class="ux-evidence-grid">${ids.map(card).join('')}</div>`);});
    M().querySelectorAll('[data-evidence]').forEach(b=>b.onclick=()=>openClue(b.dataset.evidence,b));
  };
  openClue=function(id,source){
    if(tab!=='kit'||srvVote||!found.has(id)||activeView)return;
    const origin=source||M().querySelector(`[data-evidence="${id}"]`);
    if(!origin)return;
    activeView={c:id,mode:'kit',sourceRect:origin.getBoundingClientRect(),scrollY:window.scrollY};
    showFront(activeView,false);
  };
  const originalClose=closeClue;
  closeClue=function(){if(activeView){closeView();return;}originalClose();};

  rVote=function(){
    if(selectionRound!==srvVote){selection=null;selectionRound=srvVote;}
    $('#tt').textContent=srvVote===1?'1차 투표':'최종 투표';
    $('#bk').classList.remove('on');
    const v=myVotes['v'+srvVote]||{},mine=v[MYKEY],done=Object.keys(v).length;
    M().innerHTML=`<div class="ux-guide"><strong>${srvVote===1?'지금 가장 의심스러운 사람은?':'범인은 누구라고 생각하나요?'}</strong>${srvVote===1?'현재의 의심을 나누는 중간 투표입니다. 최종 판정에는 반영되지 않아요.':'단서와 진술을 바탕으로 최종 범인을 지목해주세요.'}<br>자신은 선택할 수 없고, 제출한 투표는 바꿀 수 없습니다.</div>
      <div class="vopts">${ORDER.filter(k=>k!==MYKEY).map(k=>`<button class="vopt ${(mine||selection)===k?'ux-selected':''}" data-choice="${k}" aria-pressed="${(mine||selection)===k}" ${mine?'disabled':''}><span class="va">${AV[SUSPECTS[k].av]}</span><span class="vnm">${NAMES[k]}</span>${(mine||selection)===k?'<span class="vck">✓</span>':''}</button>`).join('')}</div>
      ${mine?`<div class="ux-guide" role="status"><strong>${NAMES[mine]} 님에게 투표했어요</strong>${done} / 4명 제출 완료 · ${done>=4?'공용 화면의 다음 안내를 확인해주세요.':'다른 참가자의 투표를 기다려주세요.'}</div>`:`<p class="ux-vote-help" id="ux-choice">${selection?NAMES[selection]+' 님을 선택했어요. 제출 전까지 다른 인물로 바꿀 수 있어요.':'인물 카드를 선택한 뒤 아래 버튼으로 제출해주세요.'}</p><button class="act ux-submit" id="ux-submit" ${selection?'':'disabled'}>${selection?NAMES[selection]+' 님에게 투표 제출':'먼저 인물을 선택해주세요'}</button>`}`;
    M().querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selection=b.dataset.choice;rVote();});
    const submit=$('#ux-submit');
    if(submit)submit.onclick=()=>{
      if(!ONLINE){toast('서버 연결을 확인한 뒤 다시 제출해주세요');return;}
      if(!selection)return;
      const target=selection,phase=srvVote;
      submit.disabled=true;submit.textContent='투표 제출 중…';
      M().querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);
      roomRef(`votes/v${phase}/${MYKEY}`).transaction(cur=>cur===null?target:undefined,(e,ok)=>{
        if(e){toast('투표를 저장하지 못했어요. 연결을 확인하고 다시 제출해주세요.');}
        else if(ok){toast('투표가 제출됐어요');}
        else{toast('이미 제출한 투표가 있습니다');}
        render();
      },false);
    };
  };
  const originalBook=rBook;
  rBook=function(){
    originalBook();
    const message={me:['내 역할부터 확인해주세요','자기소개 예시를 읽고, 비밀 카드는 혼자 볼 수 있을 때 열어주세요.'],truth:['나만 알고 있는 이야기','먼저 말할 필요는 없어요. 증거를 들어 추궁받았을 때의 답변은 대응법을 참고해주세요.'],tl:['사건 당일의 내 행적','시간 순서대로 읽고, 사건이 일어났을 때 어디에 있었는지 기억해주세요.'],plan:['질문받았을 때 참고하세요','내 정체와 게임 규칙에 맞춰 답해주세요. 범인 외에는 거짓말할 수 없습니다.']}[bTab];
    if(message){const sub=M().querySelector('.sub');if(sub)sub.insertAdjacentHTML('afterend',`<div class="ux-guide"><strong>${message[0]}</strong>${message[1]}</div>`);}
    const sec=$('#sec');if(sec){sec.setAttribute('aria-expanded',String(revealed));sec.setAttribute('aria-label',revealed?'내 비밀 다시 덮기':'내 비밀 열기');}
  };
})();
