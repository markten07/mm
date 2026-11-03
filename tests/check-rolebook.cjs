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
 assert(p.briefing.secret&&p.briefing.stance,`${key}: private action and speaking stance`);
 assert(p.scenes.length>=2);
 assert(p.answers.every(a=>a.length===4&&a.every(Boolean)));
 assert(html.indexOf('assets/rolebook-profiles.js')<html.indexOf('assets/rolebook-ui.js'));
 const frames=context.window.ROLEBOOK_MEMORIES[key];
 assert.equal(frames.length,5,`${file}: five narrative memories after private role briefing`);
 for(const f of frames){
  assert(f.label&&f.place&&f.title&&f.detailTitle&&f.detail);
  assert.equal(f.lines.length,2,`${key}: concise narration`);
  assert(!f.identity&&!f.private,`${key}: narrative memories are not repeatedly gated`);
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
 restoreCover(){},portal:{present(){}},rBook(){},render(){renders++;if(bridgeContext.tab==='book'&&!bridgeContext.srvVote)bridgeContext.rBook();},dockNet(){}};
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
// Private orientation comes first in every role, without changing the narrative facts.
const frameDeclaration=ui.match(/  const frames=.*;/)[0];
for(const [role,profile] of Object.entries(profiles)){
 const frameContext={MYKEY:role,profile,window:context.window};vm.createContext(frameContext);
 vm.runInContext(frameDeclaration+'\nthis.ordered=frames;',frameContext);
 assert.equal(frameContext.ordered.length,6);
 assert.equal(frameContext.ordered[0].identity,true);
 assert.equal(frameContext.ordered[0].image,`portrait-${profile.image}.png`);
 assert.equal(JSON.stringify(frameContext.ordered.slice(1)),JSON.stringify(memory[role]));
}
// Neither Next nor a previously visited progress button may bypass the hidden first role.
const actionFn=ui.slice(ui.indexOf('  function action(name){'),ui.indexOf('  function paint(scroll=0){'));
const visitFn=ui.slice(ui.indexOf('  function canVisitMemory('),ui.indexOf('  function memoryScene(){'));
const memoryState={page:0,read:false,visible:false,done:false,visited:0};
const transitions=[];
const actionContext={st:memoryState,frames:[{identity:true},{},{},{},{},{}],viewport:{scrollTop:0},paint(){},navigate(route,opts={}){transitions.push(route);Object.assign(memoryState,opts,{route,visible:false});}};
vm.createContext(actionContext);vm.runInContext(actionFn+visitFn,actionContext);
actionContext.action('next');assert.equal(transitions.length,0);assert.equal(memoryState.done,false);assert.equal(actionContext.canVisitMemory(1),false);
actionContext.action('reveal');assert.equal(memoryState.read,true);actionContext.action('next');
assert.equal(memoryState.page,1);assert.equal(memoryState.done,false);assert.equal(memoryState.visible,false);
for(let i=1;i<=5;i++)actionContext.action('next');
assert.equal(memoryState.done,true);assert.equal(transitions.at(-1),'home');
memoryState.page=0;memoryState.visible=false;memoryState.done=false;
assert.equal(actionContext.canVisitMemory(5),false);const transitionCount=transitions.length;
actionContext.action('next');assert.equal(transitions.length,transitionCount);
actionContext.action('reveal');assert.equal(actionContext.canVisitMemory(5),true);
// The public animation example follows the same first-briefing sequence and Han's exact summary.
const sample=fs.readFileSync('assets/character-memory.js','utf8'),sampleContext={};vm.createContext(sampleContext);
vm.runInContext(sample.slice(sample.indexOf('  const roleBrief='),sample.indexOf('  const $ ='))+'\nthis.preview={roleBrief,scenes};',sampleContext);
assert.equal(JSON.stringify(sampleContext.preview.roleBrief),JSON.stringify(profiles.han.briefing));
assert.equal(sampleContext.preview.scenes.length,6);assert.equal(sampleContext.preview.scenes[0].private,true);
assert(sampleContext.preview.scenes.slice(1).every(s=>!s.private));
assert(!profiles.han.briefing.stance.includes('거짓 알리바이'));assert(profiles.yun.briefing.stance.includes('거짓 알리바이'));
for(const key of ['han','bak','yu'])assert(profiles[key].briefing.stance.includes('사실대로'));
console.log('PASS: private role first, own action and speaking policy, six scenes, hidden-role navigation guard, ungated narrative completion and matching preview');
// Quick references must remain available before the optional memory sequence is complete.
memoryState.done=false;memoryState.visible=false;
actionContext.action('notebook');assert.equal(transitions.at(-1),'notebook');assert.equal(memoryState.done,false);
// Covering/repeated background events must save the live disclosure and scroll state first.
const rememberFn=ui.slice(ui.indexOf('  function remember(){'),ui.indexOf('  function navigate('));
const concealFn=ui.slice(ui.indexOf('  function conceal(){'),ui.indexOf('  function restoreCover('));
const preserveState={visible:true,covered:false,scrolls:{},expanded:{}};
let detailOpen=true;const paintScrolls=[];
const preserveContext={portal:{cancel(){}},st:preserveState,key:()=> 'reference:background',viewport:{scrollTop:246},main:{querySelectorAll:()=>[{open:detailOpen}]},$:()=>({open:false}),paint(scroll){paintScrolls.push(scroll);}};
vm.createContext(preserveContext);vm.runInContext(rememberFn+concealFn,preserveContext);
preserveContext.conceal();assert.equal(preserveState.covered,true);assert.equal(preserveState.visible,false);
assert.equal(preserveState.scrolls['reference:background'],246);assert.equal(preserveState.expanded['reference:background'][0],true);
detailOpen=false;preserveContext.viewport.scrollTop=0;preserveContext.conceal();
assert.equal(preserveState.expanded['reference:background'][0],true);assert.equal(paintScrolls.at(-1),246);
console.log('PASS: notebook can open before reading completion; covering preserves expanded sections and reading position across repeated events');
