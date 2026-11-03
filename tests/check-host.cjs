const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8');
const state={window:{}};vm.createContext(state);vm.runInContext(fs.readFileSync('assets/host-state.js','utf8'),state);
const H=state.window.HOST_STATE;
const valid={yun:'han',han:'yun',bak:'yun',yu:'yun'};
assert.equal(H.votes({yun:'yun',stranger:'han',bak:'missing'}).done,0);
assert.equal(H.votes(valid).done,4);assert.equal(H.votes(valid).counts.yun,3);
assert(!('voters' in H.votes(valid)));
const usage=H.usage({a:'yun#1',b:'yun#2',c:'yun#2',d:'han#2',e:'bad#2',f:'bak#3'},2,3);
assert.equal(usage.find(x=>x.key==='yun').used,2);assert.equal(usage.find(x=>x.key==='yun').left,1);
assert.equal(usage.find(x=>x.key==='han').used,1);assert.equal(usage.find(x=>x.key==='bak').used,0);
const elements={};
const context={HOST_STATE:H,ROUNDS:[{vote:1},{vote:2}],ri:0,votes:{v1:{yun:'han',han:'yun',bak:'yun'}},
 NAMES:{yun:'윤꽃집',han:'한소설',bak:'백비서',yu:'유감독'},window:{HOST_UI:{render(){}}},
 $:s=>elements[s]||(elements[s]={innerHTML:'',textContent:''}),toast(){},clearInterval(){},tick:null,
 startRound:i=>context.started=i,saveGM:s=>context.saved=s,ONLINE:true,pushRound:i=>context.pushed=i,show:s=>context.shown=s};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('function voteSummary('),html.indexOf('const ALLCLUE=')),context);
vm.runInContext(html.slice(html.indexOf('function advanceRound(){'),html.indexOf("$('#skip').onclick")),context);
vm.runInContext(html.slice(html.indexOf('function showGate(){'),html.indexOf('function startReveal(){')),context);
context.paintVote();const pending=elements['#script'].innerHTML;
assert(pending.includes('3<small> / 4명 제출'));
for(const name of Object.values(context.NAMES))assert(!pending.includes(name),'Do not reveal a voter or target before completion');
assert(!pending.includes('host-vote-results'));
H.allowIncompleteVotes=false;
context.advanceRound();assert.equal(context.started,undefined);
assert.equal(context.showGate(),false);assert.equal(context.shown,undefined);
context.votes.v1=valid;context.paintVote();assert(elements['#script'].innerHTML.includes('host-vote-results'));
const resultRows=elements['#script'].innerHTML.split('host-vote-results')[1].split('host-vote-next')[0];
for(const name of Object.values(context.NAMES))assert.equal(resultRows.split(name).length-1,1,'Results show each candidate once, without voter lists');
context.advanceRound();assert.equal(context.started,1);
context.ri=1;context.votes.v2={yun:'han',han:'yun',bak:'yun'};context.started=undefined;
context.advanceRound();assert.equal(context.started,undefined);assert.equal(context.showGate(),false);
context.votes.v2=valid;assert.equal(context.showGate(),true);assert.equal(context.shown,'#s-gate');assert.equal(context.saved,'gate');
// Test mode bypasses both progression guards without exposing partial results.
H.allowIncompleteVotes=true;context.started=undefined;context.shown=undefined;
context.votes.v2={};context.advanceRound();assert.equal(context.started,2);
assert.equal(context.showGate(),true);assert.equal(context.shown,'#s-gate');
context.paintVote();assert(!elements['#script'].innerHTML.includes('host-vote-results'));
// The deadline stops at zero. It cannot silently advance or reveal an unfinished vote.
let now=1000,callback;
const timer={tick:null,paused:false,timerExpired:false,left:1,deadline:2000,ri:10,Date:{now:()=>now},
 clearInterval(){},setInterval:fn=>(callback=fn,1),paint(){},toast(){},saveGM(){timer.saves=(timer.saves||0)+1;},startRound(){throw Error('No automatic advancement');}};
vm.createContext(timer);vm.runInContext(html.slice(html.indexOf('function run(){'),html.indexOf('/* 진상 */')),timer);
timer.run();now=2500;callback();assert.equal(timer.left,0);assert(timer.paused);assert(timer.timerExpired);assert.equal(timer.saves,1);
callback();assert.equal(timer.saves,1,'Expired timer must announce/save only once');
const plus={};timer.$=()=>plus;
vm.runInContext(html.slice(html.indexOf("$('#plus').onclick ="),html.indexOf("$('#rvPlay').onclick =")),timer);
plus.onclick();assert.equal(timer.left,60);assert.equal(timer.deadline,62500);assert(!timer.paused);assert(!timer.timerExpired);
now=3500;callback();assert.equal(timer.left,59);
timer.paused=true;plus.onclick();assert.equal(timer.left,119);assert(timer.paused,'Extending a manually paused timer keeps it paused');
// A reload restores an expired or manually paused timer rather than starting a new phase.
const openCode=html.slice(html.indexOf('async function openRoom(){'),html.indexOf('let deadline=0'));
const saved={room:'ABCD',stage:'round',ri:10,left:0,paused:true,deadline:100,unseen:['ice','ice','unknown']};
const restore={ALLCLUE:{ice:{}},unseenShown:[],netReady:true,ONLINE:false,ROOM:null,sessionStorage:{getItem:()=>JSON.stringify(saved)},ROUNDS:Array.from({length:11},()=>({})),
 roomRef:()=>({once:async()=>({exists:()=>true})}),paintRoom(){},paintRoomCard(){},watchVotes(){},
 startRound:i=>{restore.ri=i;restore.left=180;restore.paused=false;},$:()=>({}),Date:{now:()=>100000},paint(){},saveGM(){},console};
vm.createContext(restore);
(async()=>{await vm.runInContext(openCode+';openRoom()',restore);assert.equal(restore.ri,10);assert.equal(restore.left,0);assert(restore.paused);assert(restore.timerExpired);assert.deepEqual(Array.from(restore.unseenShown),['ice']);
 console.log('PASS: anonymous partial votes, valid four-person completion, normal/test progression guards, per-round draw counts, expiry stays put, extension/restart, paused extension, expired reload');
})().catch(e=>{console.error(e);process.exitCode=1;});

// All four rules remain visible together without click-through or a page gate.
const guideElements={};
function guideElement(id){
 return guideElements[id]||(guideElements[id]={innerHTML:'',textContent:'',hidden:false,disabled:false,open:false,dataset:{},classList:{toggle(){}},parentElement:{hidden:false,classList:{toggle(){}}}});
}
const guide={window:{},document:{getElementById:guideElement,querySelectorAll:()=>[]},
 HOST_STATE:H,ONLINE:false,gmStage:'intro',ri:0,INV_ROUND:{3:1,6:2,8:3},
 ROUNDS:[{n:'오프닝',rules:[['1','첫 규칙','설명1'],['2','둘째 규칙','설명2'],['3','셋째 규칙','설명3'],['4','마지막 규칙','설명4']]},{n:'롤카드 확인',s:'역할 읽기'},{n:'자기소개',s:'소개하기'},{n:'1차 조사',inv:1,s:'조사하기'},{n:'회의',s:'회의하기'},{n:'투표',vote:1}],
 timerExpired:false,paused:false,voteSummary:()=>({done:3,all:false}),show(){}};
vm.createContext(guide);vm.runInContext(fs.readFileSync('assets/host-guide.js','utf8'),guide);
guide.gmStage='round';guide.window.HOST_UI.render();
assert(!guideElement('skip').disabled);
for(const rule of guide.ROUNDS[0].rules)assert(guideElement('script').innerHTML.includes(rule[1]));
assert(!guideElement('script').innerHTML.includes('rule-next'));
guide.window.HOST_UI.render();assert(guideElement('script').innerHTML.includes('마지막 규칙'));
guide.ri=1;guide.window.HOST_UI.render();assert(guideElement('host-help').hidden);assert(guideElement('host-players').parentElement.hidden);
guide.ri=3;guide.window.HOST_UI.render();assert(!guideElement('host-players').parentElement.hidden);
guide.ri=5;guide.window.HOST_UI.render();assert(!guideElement('host-help').hidden);assert(guideElement('host-players').parentElement.hidden);
console.log('PASS: all four rules at once, no click-through gate, timer refresh retains rules, guide-only stages hide duplicate detail, investigation/vote layout visibility');

// Late transaction retries must not move a clue into a different investigation round.
for(const file of ['1.html','2.html','3.html','4.html']){
 const source=fs.readFileSync(file,'utf8');let update,complete;
 const claimState={ONLINE:true,srvRound:1,round:1,MYKEY:'yun',roomRef:()=>({transaction:(u,c)=>{update=u;complete=c;}})};
 vm.createContext(claimState);
 vm.runInContext(source.slice(source.indexOf('function claim(id, done){'),source.indexOf('/* 서버 기록으로 내 단서함')),claimState);
 let result;claimState.claim('ice',ok=>result=ok);assert.equal(update(null),'yun#1');
 claimState.round=2;claimState.srvRound=2;assert.equal(update(null),undefined);
 complete(null,false);assert.equal(result,false);
 claimState.srvRound=0;claimState.claim('ice',ok=>result=ok);assert.equal(result,false);
}
console.log('PASS: all four player claim retries stay in their original round; extra-evidence history restores without duplicate or unknown IDs');

// Reloading the prologue resumes the same scene silently instead of returning to entry.
const proRestore={netReady:true,ONLINE:false,ROOM:null,sessionStorage:{getItem:()=>JSON.stringify({room:'ABCD',stage:'prologue',prologue:{scene:2,elapsed:5000}})},
 roomRef:()=>({once:async()=>({exists:()=>true})}),paintRoom(){},paintRoomCard(){},watchVotes(){},
 PROLOGUE:[{},{},{},{}],pro:0,proElapsed:0,proFinished:true,proMode:'playing',proDuration:()=>12000,
 saveGM:stage=>proRestore.savedStage=stage,show:id=>proRestore.screen=id,paintPro(){},console};
vm.createContext(proRestore);
(async()=>{
 await vm.runInContext(openCode+';openRoom()',proRestore);
 assert.equal(proRestore.pro,2);assert.equal(proRestore.proElapsed,5000);assert.equal(proRestore.proMode,'paused');
 assert.equal(proRestore.screen,'#s-pro');assert.equal(proRestore.savedStage,'prologue');
 console.log('PASS: prologue reload restores scene and elapsed time without automatic audio');
})().catch(e=>{console.error(e);process.exitCode=1;});
