const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('assets/rolebook-profiles.js','utf8'),context);
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
}
// These differences are essential to fair play: witnesses must not receive a killer's private facts.
const baek=JSON.stringify(profiles.bak);
assert(!baek.includes('수프에 살충제'));
assert(!baek.includes('윤꽃집이 범인'));
assert(profiles.bak.timeline[7][1].includes('직접 보지 못했습니다'));
assert(profiles.han.limits.includes('확인된 사실이 아닙니다'));
assert(profiles.yun.rule.includes('거짓 알리바이'));
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
 rBook(){},render(){renders++;if(bridgeContext.tab==='book'&&!bridgeContext.srvVote)bridgeContext.rBook();},dockNet(){}};
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
