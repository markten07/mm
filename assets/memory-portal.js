/* Shared cinematic entry. It owns only presentation, never game or role state. */
(() => {
  const crystal=()=>`<svg viewBox="0 0 80 110" aria-hidden="true"><defs><linearGradient id="memory-crystal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7ffe7"/><stop offset=".3" stop-color="#96c3b4"/><stop offset=".58" stop-color="#efffd1"/><stop offset="1" stop-color="#658f89"/></linearGradient></defs><path d="M34 3 66 21 76 67 43 106 10 83 4 37Z" fill="url(#memory-crystal)"/><path d="m34 3 8 39 24-21M4 37l38 5-32 41m32-41 34 25-33 39-1-64" fill="none" stroke="#f5ffe6" stroke-opacity=".62" stroke-width="1"/><path d="m34 3 8 39 1 64-13-32Z" fill="#fff" opacity=".22"/></svg>`;
  const stone=()=>`<div class="memory-voyager" aria-hidden="true"><div class="voyager-flight"><i class="voyager-tail"></i><i class="voyager-wake"></i><span class="voyager-aura"></span><span class="voyager-crystal">${crystal()}</span><i class="voyager-ring"></i></div><span class="voyager-dust">${Array.from({length:8},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</span></div>`;
  function create({root,stage,content,portrait,images=[],canPlay=()=>true,isReduced=()=>false,onCover=()=>{}}){
    let arrived=false,currentIntro=null,playing=false,token=0,timer=null,complete=null,previousInert=false;
    const overlay=document.createElement('div');
    overlay.className='memory-portal';overlay.hidden=true;
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','기억 속으로 들어가기');
    overlay.innerHTML=`<div class="portal-visual" aria-hidden="true"><img class="portal-face" src="${portrait}" alt=""><div class="portal-fragments"></div><div class="portal-depth"><i></i><i></i><i></i></div><div class="portal-rays">${Array.from({length:14},(_,i)=>`<i style="--angle:${i*360/14}deg;--delay:${i%4*60}ms"></i>`).join('')}</div><div class="portal-heart"><span>${crystal()}</span></div><div class="portal-veil"></div></div><div class="portal-tools"><button type="button" data-portal="cover">화면 덮기</button><button type="button" data-portal="skip">바로 기억 보기 <span aria-hidden="true">↗</span></button></div><div class="portal-caption"><small>당신에게 남겨진 기억</small><p>이제, 그날의 내가 됩니다.</p></div>`;
    root.appendChild(overlay);
    const skip=overlay.querySelector('[data-portal="skip"]'),cover=overlay.querySelector('[data-portal="cover"]');
    function present(){
      const intro=stage.querySelector('.intro-screen');
      if(!canPlay()||!intro||intro===currentIntro)return;
      currentIntro=intro;
      intro.classList.add(arrived||isReduced()?'portal-ready':'portal-arriving');
      arrived=true;
    }
    function reset(){
      token++;clearTimeout(timer);timer=null;playing=false;complete=null;
      overlay.hidden=true;overlay.classList.remove('portal-playing');
      content.inert=previousInert;content.classList.remove('portal-diving');
    }
    function cancel(){if(playing)reset();}
    function finish(){
      if(!playing)return;
      const callback=complete,allowed=canPlay();
      reset();
      if(allowed){callback();if(!isReduced())stage.querySelector('.scene-screen')?.classList.add('portal-emerged');}
    }
    function play(callback){
      if(playing||!canPlay())return;
      if(isReduced()){callback();return;}
      playing=true;complete=callback;const run=++token;
      const source=stage.querySelector('.voyager-flight')?.getBoundingClientRect();
      const bounds=overlay.parentNode.host?.getBoundingClientRect()||document.documentElement.getBoundingClientRect();
      overlay.style.setProperty('--launch-x',`${source?source.left+source.width/2-(bounds.left+bounds.width/2):0}px`);
      overlay.style.setProperty('--launch-y',`${source?source.top+source.height/2-(bounds.top+bounds.height*.43):0}px`);
      // Only this role's illustrative stills; never reveal another character or verdict.
      overlay.querySelector('.portal-fragments').innerHTML=images.slice(0,2).map((src,i)=>`<img src="${src}" alt="" style="--fragment:${i}">`).join('');
      previousInert=content.inert;content.inert=true;content.classList.add('portal-diving');
      overlay.hidden=false;overlay.classList.add('portal-playing');skip.focus({preventScroll:true});
      // A bounded fallback also completes if animationend is lost in a browser.
      timer=setTimeout(()=>{if(run===token)finish();},1900);
    }
    skip.onclick=finish;
    cover.onclick=()=>{cancel();onCover();};
    overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish();}
      if(event.key==='Tab'){event.preventDefault();(event.target===skip?cover:skip).focus({preventScroll:true});}
    });
    return {present,play,cancel,skip:finish,get playing(){return playing;}};
  }
  window.MemoryPortal={stone,create};
})();
