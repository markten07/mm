/* One navigation vocabulary for the native game and the private rolebook. */
(() => {
  const paths={
    book:'<rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="9" r="2"/><path d="M8 16c0-3 8-3 8 0"/>',
    inv:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    kit:'<path d="M4 8h16v12H4zM3 4h18v4H3zM9 12h6"/>'
  };
  const icon=key=>`<svg class="player-nav-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[key]}</svg>`;
  window.PLAYER_UI={icon};
  const portrait={yun:'yoon',han:'han',bak:'baek',yu:'yoo'}[MYKEY];
  const header=document.querySelector('#app .hdr');
  header.classList.add('player-header');
  header.insertAdjacentHTML('afterbegin',`<div class="player-identity"><img src="assets/portrait-${portrait}.png" alt=""><span><strong>${ME.name}</strong><small id="player-phase"></small></span></div>`);
  const tabs=document.querySelector('#tabs'),dot=document.querySelector('#dt');
  tabs.classList.add('player-nav');tabs.setAttribute('role','navigation');tabs.setAttribute('aria-label','기본 메뉴');
  dot.remove();
  tabs.querySelectorAll('button').forEach(button=>{
    const key=button.dataset.t;
    button.innerHTML=`${icon(key)}<span>${{book:'내 역할',inv:'조사',kit:'단서함'}[key]}</span>${key==='kit'?'<span class="player-count" id="player-kit-count"></span>':''}`;
  });
  tabs.appendChild(dot); // Keep the original game counter hook without a second notification dot.
  function syncShell(){
    document.querySelector('#player-phase').textContent=ONLINE?`${ROOM} · ${srvPhase||'대기'}`:'오프라인 체험';
    document.querySelector('#player-kit-count').textContent=found.size?String(found.size):'';
    tabs.querySelectorAll('button').forEach(button=>{
      if(!srvVote&&button.dataset.t===tab)button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }
  const originalRender=render,originalDock=dock,originalNet=dockNet;
  render=function(){originalRender();syncShell();};
  dock=function(){originalDock();syncShell();};
  dockNet=function(){originalNet();syncShell();};
  syncShell();
})();
