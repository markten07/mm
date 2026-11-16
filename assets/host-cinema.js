/* Uploaded films replace only the host prologue and reveal. Native controls handle playback. */
(function(){
  'use strict';
  const config={
    prologue:{src:'assets/video/prologue-v2.mp4',screen:'#s-pro',mount:'book',prefix:'pro',title:'프롤로그'},
    reveal:{src:'assets/video/reveal-v3.mp4',screen:'#s-rev',mount:'rvbody',prefix:'rv',title:'진상 공개'}
  };
  const records={};
  let current=null;
  const el=id=>document.getElementById(id);
  const finite=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
  function snapshot(){
    const data={};
    for(const [kind,r] of Object.entries(records))data[kind]={src:r.cfg.src,time:r.pending??finite(r.video.currentTime),completed:r.completed};
    return data;
  }
  function persist(r){if(current===r)saveGM(r.kind==='prologue'?'prologue':'reveal');}
  function status(r,message){
    el(r.cfg.prefix+'PlayState').textContent=message;
    const seconds=r.completed?0:Number.isFinite(r.video.duration)?Math.max(0,r.video.duration-r.video.currentTime):0;
    el(r.cfg.prefix+'Time').textContent=mmss(Math.ceil(seconds));
    el(r.cfg.prefix+'Prev').disabled=r.video.currentTime<.1;
  }
  function pauseOtherAudio(){
    clearProClock();proAudioStop();clearRevealClock();revAudioStop();bgmStop();
    if(window.speechSynthesis)window.speechSynthesis.cancel();
  }
  function leave(screen){
    if(!current||screen===current.cfg.screen)return;
    const r=current;current=null;r.video.pause();
    if(bgmOn)bgmStart();
  }
  function ended(r){
    if(current!==r)return;
    r.completed=true;r.video.pause();persist(r);
    if(r.kind==='prologue'){startRound(0);return;}
    status(r,'상영 완료 · 재생바로 원하는 부분을 다시 볼 수 있어요');
    el('rvSkip').textContent='처음부터 다시 보기';
  }
  function mount(kind){
    if(records[kind])return records[kind];
    const cfg=config[kind],container=el(cfg.mount),video=document.createElement('video');
    video.id=cfg.prefix+'Film';video.className='host-film-video';
    video.controls=true;video.playsInline=true;video.preload='metadata';
    video.setAttribute('aria-label',cfg.title+' 영상');
    video.setAttribute('playsinline','');
    const error=document.createElement('div');error.className='host-film-error';error.hidden=true;error.setAttribute('role','status');
    const label=document.createElement('p');label.textContent='영상을 불러오지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해주세요.';
    const retry=document.createElement('button');retry.className='b2';retry.textContent='다시 불러오기';
    error.append(label,retry);container.replaceChildren(video,error);
    document.querySelector(cfg.screen).classList.add('host-film');
    const r=records[kind]={kind,cfg,video,error,pending:null,completed:false,lastSave:-1};
    retry.onclick=()=>{r.pending=r.pending??finite(video.currentTime);error.hidden=true;video.load();};
    video.addEventListener('loadedmetadata',()=>{
      if(r.pending!==null){video.currentTime=Math.min(r.pending,Math.max(0,video.duration-.05));r.pending=null;}
      if(current===r)status(r,r.completed?'상영 완료':'재생 버튼을 눌러 시작하세요');
    });
    video.addEventListener('playing',()=>{if(current!==r)return;r.completed=false;error.hidden=true;if(kind==='reveal')el('rvSkip').textContent='상영 종료';pauseOtherAudio();status(r,'상영 중');persist(r);});
    video.addEventListener('pause',()=>{if(current===r){status(r,r.completed?'상영 완료':'일시정지');persist(r);}});
    video.addEventListener('timeupdate',()=>{
      if(current!==r)return;
      status(r,r.completed?'상영 완료':video.paused?'일시정지':'상영 중');
      const slot=Math.floor(video.currentTime/2);if(slot!==r.lastSave){r.lastSave=slot;persist(r);}
    });
    video.addEventListener('seeked',()=>{if(current===r)persist(r);});
    video.addEventListener('waiting',()=>{if(current===r)status(r,'영상을 불러오는 중이에요');});
    video.addEventListener('error',()=>{if(current===r){error.hidden=false;status(r,'영상 연결을 확인해주세요');}});
    video.addEventListener('ended',()=>ended(r));
    video.src=cfg.src;
    el(cfg.prefix+'Prev').textContent='10초 전';
    el(cfg.prefix+'Prev').onclick=()=>{video.currentTime=Math.max(0,video.currentTime-10);};
    el(cfg.prefix+'Skip').textContent=kind==='prologue'?'다음 진행 · 오프닝 규칙':'상영 종료';
    el(cfg.prefix+'Skip').onclick=()=>{
      if(kind==='prologue'){ended(r);return;}
      if(r.completed){r.completed=false;video.currentTime=0;play(r);return;}
      if(Number.isFinite(video.duration))video.currentTime=Math.max(0,video.duration-.05);
      ended(r);
    };
    return r;
  }
  function play(r){
    const result=r.video.play();
    if(result&&result.catch)result.catch(()=>{if(current===r)status(r,'영상의 재생 버튼을 눌러주세요');});
  }
  function open(kind,memory=null,autoplay=false){
    if(!config[kind])return;
    clearInterval(tick);pauseOtherAudio();
    if(current)current.video.pause();
    const r=mount(kind);current=r;r.video.pause();
    const valid=memory&&memory.src===r.cfg.src;
    r.completed=!!(valid&&memory.completed);r.pending=valid?finite(memory.time):0;
    if(r.video.readyState>=1){r.video.currentTime=Math.min(r.pending,Math.max(0,r.video.duration-.05));r.pending=null;}
    el(r.cfg.prefix+'Skip').textContent=kind==='prologue'?'다음 진행 · 오프닝 규칙':r.completed?'처음부터 다시 보기':'상영 종료';
    show(r.cfg.screen);el('hstat').textContent=r.cfg.title;
    if(kind==='reveal')el('pbar').style.width='100%';
    status(r,r.completed?'상영 완료':autoplay?'영상을 불러오는 중이에요':'보던 위치에서 일시정지 · 재생 버튼을 눌러주세요');
    persist(r);if(autoplay)play(r);
  }
  window.HOST_CINEMA={open,leave,snapshot,active:()=>current!==null};
})();
