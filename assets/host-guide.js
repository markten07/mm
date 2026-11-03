(() => {
  'use strict';
  const names={yun:'윤꽃집',han:'한소설',bak:'백비서',yu:'유감독'};
  const portraits={yun:'yoon',han:'han',bak:'baek',yu:'yoo'};
  const instructions=[
    ['함께 지킬 규칙을 읽어주세요.','네 가지 규칙을 함께 읽고 시작해요.'],
    ['휴대폰에서 내 역할을 확인해주세요.','‘기억 받기’를 누르고, 첫 장면의 정체와 비밀은 혼자 보세요. 다섯 기억을 본 뒤 서로 읽었는지 확인해요.'],
    ['한 사람씩 자신을 소개해주세요.','이름, 홍대표와의 관계, 사건이 일어났을 때 어디에 있었는지 말해요. 휴대폰의 자기소개 예시를 읽어도 돼요.'],
    ['휴대폰의 ‘조사’에서 카드 더미를 눌러주세요.','한 번 누르면 단서 한 장을 찾아요. 찾은 단서는 ‘단서함’에 자동으로 들어가요. 지금은 혼자 조사해요.'],
    ['찾은 단서를 한 사람씩 이야기해주세요.','휴대폰의 ‘단서함’을 열고 단서 이름과 찾은 장소를 말해요. 단서는 내가 말해줘야 다른 사람도 알 수 있어요.'],
    ['휴대폰에서 의심하는 사람을 골라 제출해주세요.','인물 카드를 고른 다음 ‘투표 제출’을 눌러요. 제출한 뒤에는 바꿀 수 없어요.'],
    ['한 번 더 단서를 찾아주세요.','휴대폰의 ‘조사’를 열고 카드 더미를 눌러요. 아직 풀리지 않은 질문을 떠올려보세요.'],
    ['단서를 보여주며 서로 질문해주세요.','먼저 단서 이름을 말하고 궁금한 것을 물어봐요. 질문을 받은 사람은 자기 역할의 대화 원칙에 맞게 답해요.'],
    ['마지막으로 단서를 찾아주세요.','남은 조사 기회를 쓰고 ‘단서함’을 살펴봐요. 놓친 것이 있다면 아래 추가 증거도 함께 확인해요.'],
    ['누가 범인인지, 왜 그렇게 생각하는지 말해주세요.','한 사람씩 1분 30초 동안 말해요. 의심하는 이유와 내가 범인이 아닌 이유를 이야기해요.'],
    ['마지막으로 범인이라고 생각하는 사람을 골라주세요.','휴대폰에서 인물 카드를 고르고 ‘투표 제출’을 눌러요. 제출한 뒤에는 바꿀 수 없어요.']
  ];
  let players=null,taken=null,drawLimit=3,connected=null,sync='done',subscribedRoom=null,lastStep=-1;
  const $id=id=>document.getElementById(id);
  function entryMarkup(){
    if(!ONLINE||players===null)return '<p class="host-status-empty">입장 기록을 확인하고 있어요.</p>';
    const joined=HOST_STATE.roles.filter(k=>!!players[k]).length;
    return `<div class="host-status-heading"><strong>입장 ${joined} / 4명</strong><span>${joined===4?'네 명 모두 들어왔어요.':'아직 안 들어온 사람을 기다려주세요.'}</span></div><div class="host-entry-list">${HOST_STATE.roles.map(k=>`<div class="${players[k]?'is-joined':''}"><span>${names[k]}</span><small>${players[k]?'입장 완료':'입장 대기'}</small></div>`).join('')}</div><p class="host-status-note">입장 기록이에요. 지금 휴대폰이 연결돼 있는지는 각자 확인해주세요.</p>`;
  }
  function renderPlayers(){
    const box=$id('host-players');
    const phase=INV_ROUND[ri];
    box.hidden=!phase;
    box.parentElement.hidden=!phase;
    box.parentElement.classList.toggle('is-without-players',!phase);
    if(!phase){box.innerHTML='';return;}
    if(!ONLINE||players===null){box.innerHTML='<p class="host-status-empty">조사 기록을 확인하고 있어요.</p>';return;}
    const info=phase&&taken!==null?HOST_STATE.usage(taken,phase,drawLimit):null;
    box.innerHTML=`<div class="host-status-heading"><strong>${phase?'이번 조사 현황':'참가자 입장'}</strong><span>${phase?'한 사람당 '+drawLimit+'번':'입장 '+HOST_STATE.roles.filter(k=>!!players[k]).length+' / 4명'}</span></div><div class="host-person-grid">${HOST_STATE.roles.map(k=>{
      const person=info?.find(x=>x.key===k);
      const status=!players[k]?'입장 대기':phase?(person?`${person.used}번 사용 · ${person.left}번 남음`:'조사 기록 확인 중'):'입장 완료';
      return `<div class="host-person ${players[k]?'is-joined':''}"><img src="assets/portrait-${portraits[k]}.png" alt="" width="32" height="36"><div><strong>${names[k]}</strong><span>${status}</span></div></div>`;
    }).join('')}</div><p class="host-status-note">${phase?'카드를 한 장 찾을 때마다 조사 기회를 한 번 써요.':'입장은 읽기 완료를 뜻하지 않아요. 모두 읽었는지 서로 물어봐주세요.'}</p>`;
  }
  function renderNetwork(){
    const box=$id('host-network');
    if(!ONLINE)box.textContent='연결 확인 중';
    else if(connected===false)box.textContent='인터넷 연결을 확인해주세요';
    else if(sync==='error'){
      box.innerHTML='단계 전달 실패 <button type="button" id="host-resync">다시 보내기</button>';
      $id('host-resync').onclick=()=>pushRound(gmStage==='round'?ri:ROUNDS.length);
    }else box.textContent=sync==='pending'?'참가자에게 단계 전달 중…':'방 연결됨';
  }
  function render(){
    $id('host-entry-status').innerHTML=entryMarkup();
    renderNetwork();
    $id('go').disabled=!ONLINE||connected===false;
    $id('prevStep').disabled=gmStage!=='round'||ri<=0;
    if(gmStage!=='round')return;
    const step=ROUNDS[ri],line=instructions[ri];
    const changed=lastStep!==ri;
    $id('s-round').dataset.mode=step.rules?'rules':step.vote?'vote':step.unseen?'evidence':step.inv?'investigation':'guide';
    if(changed&&step.rules)renderRules();
    $id('host-primary').textContent=line[0];
    if(!step.rules&&!step.unseen&&!step.vote)$id('host-secondary').innerHTML=step.s;
    else $id('host-secondary').textContent=line[1];
    if(step.vote&&voteSummary(step.vote).all){
      $id('host-primary').textContent='투표 결과를 함께 확인해주세요.';
      $id('host-secondary').textContent=step.vote===1?'아래 안내에 따라 의견을 나눈 뒤 ‘다음 진행 · 2차 조사’를 눌러요.':'모두 결과를 확인하면 ‘다음 진행 · 진상 공개 준비’를 눌러요.';
    }
    renderPlayers();
    $id('host-expired').hidden=!timerExpired;
    $id('host-expired').textContent=!HOST_STATE.allowIncompleteVotes&&step.vote&&!voteSummary(step.vote).all?'시간이 끝났어요. 아직 투표가 남아 있어요. 1분 연장을 누르고 기다려주세요.':'시간이 끝났어요. 1분 더 쓰거나 다음 단계로 넘어가세요.';
    $id('host-clock-note').textContent=timerExpired?'시간 종료':paused?'일시정지':'진행 중';
    $id('timer').parentElement.classList.toggle('is-paused',paused);
    $id('timer').parentElement.classList.toggle('is-expired',timerExpired);
    $id('pause').textContent=paused?'타이머 계속':'타이머 멈춤';
    $id('pause').disabled=timerExpired;
    const waiting=step.vote&&!voteSummary(step.vote).all;
    $id('skip').disabled=(!HOST_STATE.allowIncompleteVotes&&!!waiting)||connected===false||sync==='pending'||sync==='error';
    const nextTopic=ri===ROUNDS.length-1?'진상 공개 준비':ROUNDS[ri+1].n;
    $id('skip').textContent=waiting&&!HOST_STATE.allowIncompleteVotes?'투표를 모두 제출하면 다음 진행':'다음 진행 · '+nextTopic;
    const details=$id('host-help');details.classList.toggle('is-vote',!!step.vote);
    details.hidden=!step.rules&&!step.unseen&&!step.vote;
    $id('host-help-title').textContent=step.rules?'게임 규칙 · 함께 읽어주세요':step.unseen?'아직 찾지 못한 추가 증거':'투표 현황';
    if(changed){details.open=!!step.rules||!!step.vote||!!step.unseen;lastStep=ri;}
    if(step.rules){
      details.open=true;
    }
    if(step.vote)details.open=true;
    $id('host-players').parentElement.classList.toggle('is-vote',!!step.vote);
  }
  function renderRules(){
    const rules=ROUNDS[ri]?.rules;if(!rules)return;
    $id('script').innerHTML=`<div class="host-rules-heading">함께 지킬 네 가지 규칙</div><div class="host-rules-grid">${rules.map(([number,title,description])=>`<article class="host-rule-tile"><span class="host-rule-number">${number}</span><h2>${title}</h2><p>${description}</p></article>`).join('')}</div>`;
  }
  function roomChanged(){
    if(ONLINE&&ROOM!==subscribedRoom){
      subscribedRoom=ROOM;
      const fail=()=>{sync='error';render();};
      roomRef('players').on('value',s=>{players=s.val()||{};render();},fail);
      roomRef('taken').on('value',s=>{taken=s.val()||{};render();},fail);
      roomRef('draws').on('value',s=>{
        const n=Number(s.val());if([2,3,4].includes(n))drawLimit=n;
        document.querySelectorAll('#drawset [data-d]').forEach(b=>b.classList.toggle('on',Number(b.dataset.d)===drawLimit));render();
      },fail);
      DB.ref('.info/connected').on('value',s=>{connected=s.val()===true;render();});
    }
    render();
  }
  window.HOST_UI={render,roomChanged,syncState(value){sync=value;render();}};
  $id('hostOrder').onclick=()=>{
    openModal(`<h3>게임은 이렇게 진행해요</h3><p class="sub">지금 단계는 ${gmStage==='round'?ROUNDS[ri].n:gmStage==='intro'?'입장 준비':'이야기 재생'}예요.</p><ol class="host-order">${ROUNDS.map((r,i)=>`<li ${gmStage==='round'&&i===ri?'aria-current="step"':''}><span>${r.n}</span><small>${r.m}분</small></li>`).join('')}</ol><p class="sub">시간이 끝나면 연장하거나 다음 단계로 넘어가요.</p><button class="b1" id="host-order-close">닫기</button>`);
    $id('host-order-close').onclick=closeModal;
  };
  // Close and re-open by screen, never add a second timer or advance the game here.
  const originalShow=show;
  show=function(id){originalShow(id);if(id!=='#s-round')$id('prevStep').disabled=true;};
  roomChanged();
})();
