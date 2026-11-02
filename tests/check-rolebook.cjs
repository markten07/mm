const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/rolebook-profiles.js','utf8'),context);
vm.runInContext(fs.readFileSync('assets/rolebook-memories.js','utf8'),context);
const profiles=context.window.ROLEBOOK_PROFILES;
for(const [file,key] of [['1.html','yun'],['2.html','han'],['3.html','bak'],['4.html','yu']]){
 const html=fs.readFileSync(file,'utf8');
 const match=html.match(/const ME = (\{[\s\S]*?\n\});/);
 assert(match,`${file}: role source`);
 const me=vm.runInNewContext('('+match[1]+')');
 const p=profiles[key];
 assert(p,`${file}: profile selected by role key`);
 assert.equal(p.timeline.length,me.timeline.length,`${file}: all original times represented`);
 assert.equal(p.records.length,me.trick.length,`${file}: all original records represented`);
 assert(p.before>0&&p.before<me.timeline.length);
 for(const [name] of me.rel)assert(p.labels[name],`${file}: relationship ${name}`);
 assert(fs.existsSync(`assets/portrait-${p.image}.png`));
 assert.equal(p.motive.length,3);
 assert(p.scenes.length>=2);
 assert(p.answers.every(a=>a.length===4&&a.every(Boolean)));
 assert(html.indexOf('assets/rolebook-profiles.js')<html.indexOf('assets/rolebook-ui.js'));
 const frames=context.window.ROLEBOOK_MEMORIES[key];
 assert.equal(frames.length,5,`${file}: five narrative memories before final identity`);
 for(const f of frames){
  assert(f.label&&f.place&&f.title&&f.detailTitle&&f.detail);
  assert.equal(f.lines.length,2,`${key}: concise narration`);
  assert(!f.final&&!f.private,`${key}: narrative memories are not repeatedly gated`);
  assert(fs.existsSync(`assets/${f.image}`),`${key}: missing memory ${f.image}`);
 }
 assert(html.indexOf('assets/rolebook-memories.js')<html.indexOf('assets/rolebook-ui.js'));
}
// These differences are essential to fair play: witnesses must not receive a killer's private facts.
const baek=JSON.stringify(profiles.bak);
assert(!baek.includes('수프에 살충제'));
assert(!baek.includes('윤꽃집이 범인'));
assert(profiles.bak.timeline[7][1].includes('직접 보지 못했습니다'));
assert(profiles.han.limits.includes('확인된 사실이 아닙니다'));
assert(profiles.yun.rule.includes('거짓 알리바이'));
const memory=context.window.ROLEBOOK_MEMORIES;
assert(!JSON.stringify(memory.bak).includes('수프에 살충제'));
assert(!JSON.stringify(memory.yu).includes('독이 든 얼음'));
assert(!JSON.stringify(memory.han).includes('윤꽃집이 범인'));
assert(memory.bak[4].lines.some(t=>t.includes('안에서 한 일은 못 봤다')));
assert(memory.yu[3].lines.some(t=>t.includes('17:40부터 18:05')));
assert(memory.yun[3].detail.includes('알리바이'));
for(const key of ['han','bak','yu'])assert(!profiles[key].rule.includes('거짓 알리바이를 말할 수'));
new vm.Script(fs.readFileSync('assets/rolebook-ui.js','utf8'));
console.log('PASS: four role mappings, full timeline/record coverage, relationship portraits, role-specific knowledge boundaries');
// Verify the rolebook overlay yields to real investigation/voting and never bypasses entry.
const ui=fs.readFileSync('assets/rolebook-ui.js','utf8');
const bridge=ui.slice(ui.indexOf('  const originalRender=render'),ui.indexOf("  document.addEventListener('visibilitychange'"));
const gameApp={inert:false},gate={style:{display:'none'}},main={innerHTML:'old rolebook'};
let renders=0,conceals=0;
const bridgeContext={host:{hidden:true},tab:'book',srvVote:0,M:()=>main,
 document:{getElementById:id=>id==='app'?gameApp:gate},sync(){},remember(){},conceal(){conceals++;},
 restoreCover(){},rBook(){},render(){renders++;if(bridgeContext.tab==='book'&&!bridgeContext.srvVote)bridgeContext.rBook();},dockNet(){}};
vm.createContext(bridgeContext);vm.runInContext(bridge,bridgeContext);
bridgeContext.render();assert.equal(bridgeContext.host.hidden,false);assert.equal(gameApp.inert,true);assert.equal(main.innerHTML,'');
bridgeContext.tab='inv';bridgeContext.render();assert.equal(bridgeContext.host.hidden,true);assert.equal(gameApp.inert,false);assert.equal(conceals,1);
bridgeContext.tab='book';bridgeContext.render();bridgeContext.srvVote=1;bridgeContext.render();assert.equal(bridgeContext.host.hidden,true);assert.equal(gameApp.inert,false);
bridgeContext.srvVote=0;bridgeContext.render();assert.equal(bridgeContext.host.hidden,false);
gate.style.display='';bridgeContext.render();assert.equal(bridgeContext.host.hidden,true);assert.equal(gameApp.inert,false);
assert.equal(renders,6);
console.log('PASS: native navigation, vote takeover, entry gate, background focus isolation');
// Server phase names must map to a real action without changing the reading route.
const phaseFn=ui.slice(ui.indexOf('  function stageTask(){'),ui.indexOf('  function leaveBook('));
const phaseContext={ONLINE:true,srvPhase:''};vm.createContext(phaseContext);vm.runInContext(phaseFn,phaseContext);
for(const phase of ['1차 조사','2차 조사','최종 조사']){phaseContext.srvPhase=phase;assert.equal(phaseContext.stageTask().dest,'inv');}
for(const phase of ['1차 회의','2차 회의','최종 변론']){phaseContext.srvPhase=phase;assert.equal(phaseContext.stageTask().dest,'kit');}
phaseContext.srvPhase='자기소개';assert.equal(phaseContext.stageTask().action,'intro');
phaseContext.srvPhase='롤카드 확인';assert.equal(phaseContext.stageTask().dest,undefined);
phaseContext.srvPhase='진상 공개';assert.equal(phaseContext.stageTask().dest,undefined);
phaseContext.ONLINE=false;assert.equal(phaseContext.stageTask(),null);
console.log('PASS: live phase actions, introduction shortcut, role-reading and reveal stay non-forcing, offline stays isolated');
// A previous reveal must never let a revisited final identity advance while hidden.
const actionFn=ui.slice(ui.indexOf('  function action(name){'),ui.indexOf('  function paint(scroll=0){'));
const memoryState={page:5,read:true,visible:false,done:false,visited:5};
const transitions=[];
const actionContext={st:memoryState,frames:[{},{},{},{},{},{final:true}],navigate(route,opts={}){transitions.push(route);Object.assign(memoryState,opts,{route});}};
vm.createContext(actionContext);vm.runInContext(actionFn,actionContext);
actionContext.action('next');assert.equal(transitions.length,0);assert.equal(memoryState.done,false);
memoryState.visible=true;actionContext.action('next');assert.equal(memoryState.done,true);assert.equal(transitions.at(-1),'home');
memoryState.page=3;memoryState.visible=false;actionContext.action('next');assert.equal(memoryState.page,4);
console.log('PASS: six-scene role memories, role-specific image paths, final identity confirmation cannot be bypassed on revisit');
// Quick references must remain available before the optional memory sequence is complete.
memoryState.done=false;memoryState.visible=false;
actionContext.action('notebook');assert.equal(transitions.at(-1),'notebook');assert.equal(memoryState.done,false);
// Covering/repeated background events must save the live disclosure and scroll state first.
const rememberFn=ui.slice(ui.indexOf('  function remember(){'),ui.indexOf('  function navigate('));
const concealFn=ui.slice(ui.indexOf('  function conceal(){'),ui.indexOf('  function restoreCover('));
const preserveState={visible:true,covered:false,scrolls:{},expanded:{}};
let detailOpen=true;const paintScrolls=[];
const preserveContext={st:preserveState,key:()=> 'reference:background',viewport:{scrollTop:246},main:{querySelectorAll:()=>[{open:detailOpen}]},$:()=>({open:false}),paint(scroll){paintScrolls.push(scroll);}};
vm.createContext(preserveContext);vm.runInContext(rememberFn+concealFn,preserveContext);
preserveContext.conceal();assert.equal(preserveState.covered,true);assert.equal(preserveState.visible,false);
assert.equal(preserveState.scrolls['reference:background'],246);assert.equal(preserveState.expanded['reference:background'][0],true);
detailOpen=false;preserveContext.viewport.scrollTop=0;preserveContext.conceal();
assert.equal(preserveState.expanded['reference:background'][0],true);assert.equal(paintScrolls.at(-1),246);
console.log('PASS: notebook can open before reading completion; covering preserves expanded sections and reading position across repeated events');
