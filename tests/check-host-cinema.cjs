const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function fixture(){
 const nodes={};let saves=0,stops=0,round=null;
 function node(id){return nodes[id]||(nodes[id]={id,style:{},classList:{add(){}},children:[],events:{},textContent:'',
  currentTime:0,duration:0,readyState:0,paused:true,
  setAttribute(){},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},
  addEventListener(k,fn){this.events[k]=fn;},emit(k){this.events[k]?.();},
  pause(){if(!this.paused){this.paused=true;this.emit('pause');}},
  play(){this.paused=false;this.emit('playing');return Promise.resolve();},load(){this.loaded=true;}});}
 let serial=0;
 const c={window:{},document:{getElementById:node,querySelector:node,createElement:tag=>node(tag+(++serial))},
  clearInterval(){},tick:null,clearProClock(){},proAudioStop(){stops++;},clearRevealClock(){},revAudioStop(){stops++;},bgmStop(){stops++;},bgmOn:true,bgmStart(){},
  saveGM(){saves++;},mmss:s=>String(s),show:id=>c.window.HOST_CINEMA.leave(id),startRound:i=>{round=i;c.show('#s-round');}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('assets/host-cinema.js','utf8'),c);
 return {api:c.window.HOST_CINEMA,nodes,node,c,get saves(){return saves;},get stops(){return stops;},get round(){return round;},media:kind=>node(kind==='prologue'?'book':'rvbody').children[0],metadata(v,d=131){v.duration=d;v.readyState=1;v.emit('loadedmetadata');}};
}
const f=fixture();
f.api.open('prologue',null,true);let v=f.media('prologue');
assert(v.src.endsWith('prologue-v2.mp4'));assert(v.controls&&v.playsInline);assert(!v.paused);assert(f.stops>=3);
f.metadata(v);v.currentTime=48;v.emit('timeupdate');
const memory=f.api.snapshot().prologue;assert.equal(memory.time,48);assert(f.saves>0);
f.node('proPrev').onclick();assert.equal(v.currentTime,38);
f.node('proSkip').onclick();assert.equal(f.round,0);assert(v.paused);assert(!f.api.active());
// Restore after metadata, silently; restore newer film revisions only.
const r=fixture();r.api.open('prologue',memory,false);v=r.media('prologue');assert(v.paused);assert.equal(r.api.snapshot().prologue.time,48);
r.metadata(v);assert.equal(v.currentTime,48);assert(v.paused);
r.api.open('prologue',{src:'old.mp4',time:100},false);assert.equal(v.currentTime,0);
// Normal completion advances exactly once, and hidden/stale media cannot advance.
r.api.open('prologue',null,true);v.emit('ended');assert.equal(r.round,0);v.emit('ended');assert.equal(r.round,0);
// Reveal is independent, pauses prologue, restores position and supports replay.
f.api.open('prologue',null,true);const pro=f.media('prologue');
f.api.open('reveal',null,true);const rev=f.media('reveal');f.metadata(rev,250.76);assert(pro.paused);assert(!rev.paused);
assert(rev.src.endsWith('reveal-v3.mp4'));rev.currentTime=122;rev.emit('seeked');const revMemory=f.api.snapshot().reveal;
f.api.open('reveal',revMemory,false);assert.equal(rev.currentTime,122);assert(rev.paused);
rev.emit('error');assert(!f.nodes.rvbody.children[1].hidden);f.nodes.rvbody.children[1].children[1].onclick();assert(rev.loaded);
f.node('rvSkip').onclick();assert(f.api.snapshot().reveal.completed);assert.equal(f.node('rvSkip').textContent,'처음부터 다시 보기');
f.node('rvSkip').onclick();assert.equal(rev.currentTime,0);assert(!rev.paused);assert.equal(f.node('rvSkip').textContent,'상영 종료');
f.api.leave('#s-round');assert(rev.paused);assert(!f.api.active());
const html=fs.readFileSync('index.html','utf8');assert(html.includes('saved.media?.prologue'));assert(html.includes('saved.media?.reveal'));assert(html.includes('window.HOST_CINEMA?.snapshot()'));
for(const name of ['assets/video/prologue-v2.mp4','assets/video/reveal-v3.mp4']){assert(fs.statSync(name).size<100*1024*1024);}
console.log('PASS: uploaded films, controls, no overlapping audio, skip/end progression, silent position restore, seek/save, revision guard, retry, reveal replay, stale media isolation');
