const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');
const files=['index.html','1.html','2.html','3.html','4.html'];
for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1],{filename:file});
 assert(!html.includes("DB.ref('mm/'+ROOM"));
 assert(html.includes("DB.ref('mm/v2/rooms/'+ROOM"));
 if(file!=='index.html'){
  assert(!html.includes('value="${url}"'));
  // A saved room must not bypass the entry screen on reload.
  const gate=html.slice(html.indexOf('function showGate(){'),html.indexOf('\nshowGate();',html.indexOf('function showGate(){')));
  const controls={};let joins=0;
  const entry={location:{search:''},URLSearchParams,AV:{test:''},ME:{av:'test',name:'test'},netReady:true,
   sessionStorage:{getItem:()=> 'ABCD'},joinRoom:()=>joins++,render(){},dock(){},dockNet(){},toast(){},
   document:{getElementById:()=>({innerHTML:''})},$:key=>controls[key]||(controls[key]={value:'',disabled:false,addEventListener(){}})};
  vm.createContext(entry);vm.runInContext(gate+';showGate()',entry);
  assert.equal(joins,0);assert.equal(controls['#gc'].value,'');
  controls['#gc'].value='ABCD';controls['#gg'].onclick();assert.equal(joins,1);
  // Rejoining still restores both owned clues and the number of draws used.
  const restore=html.slice(html.indexOf('function restoreMine(full){'),html.indexOf('/* ══════════ 상태 ══════════ */'));
  const mine={ONLINE:true,MYKEY:'test',round:2,taken:{ice:'test#1',memo:'test#2',other:'han#2'},found:new Set(),roundDraw:[],locOfClue:c=>c,dock(){}};
  vm.createContext(mine);vm.runInContext(restore+';restoreMine(true)',mine);
  assert.deepEqual([...mine.found],['ice','memo']);assert.equal(mine.roundDraw.length,1);assert.equal(mine.roundDraw[0].c,'memo');

  const code=html.slice(html.indexOf('function tryDig('),html.indexOf('function emptyDig('));
  let claims=0,renders=0;
  const c={ONLINE:true,srvRound:0,round:1,nav:['detail'],render:()=>renders++,claim:()=>claims++};
  vm.createContext(c);vm.runInContext(code+';tryDig("site:dining",0)',c);
  assert.equal(claims,0);assert.equal(renders,1);
  c.srvRound=2;vm.runInContext('tryDig("site:dining",0)',c);assert.equal(claims,0);
 }
}
const html=fs.readFileSync('index.html','utf8');
const run=html.slice(html.indexOf('function run(){'),html.indexOf('/* 진상 */'));
let callback;
const c={tick:null,paused:false,left:60,deadline:61000,Date:{now:()=>11000},clearInterval:()=>{},setInterval:f=>(callback=f,1),paint:()=>{},toast:()=>{},startRound:()=>{}};
vm.createContext(c);vm.runInContext(run+';run()',c);callback();assert.equal(c.left,50);
c.paused=true;c.Date.now=()=>31000;callback();assert.equal(c.left,50);
// Creating a room must never replace an existing room.
const open=html.slice(html.indexOf('async function openRoom(){'),html.indexOf('let deadline=0'));
let attempts=0,restored=0;
const gm={netReady:true,ONLINE:false,ROOM:null,sessionStorage:{getItem:()=>null},newCode:()=>attempts?'BBBB':'AAAA',roomRef:()=>({transaction:async update=>{attempts++;if(attempts===1){assert.equal(update({at:123}),undefined);return {committed:false};}assert.equal(update(null).round,0);return {committed:true};}}),paintRoom:()=>{},paintRoomCard:()=>{},watchVotes:()=>{},saveGM:()=>{},Date,console};
vm.createContext(gm);
(async()=>{await vm.runInContext(open+';openRoom()',gm);assert.equal(attempts,2);assert.equal(gm.ONLINE,true);console.log('PASS: 5 HTML scripts, isolated storage, safe room creation, closed investigation, deadline timer');})().catch(e=>{console.error(e);process.exitCode=1;});
// New game resets the current GM session only; it must never delete the previous room.
const resetCode=html.slice(html.indexOf('function startNewGame(){'),html.indexOf("$('#newGame').onclick=startNewGame;"));
const resetControls={};let resets=0,removes=0,approved=false;
const resetContext={confirm:()=>approved,sessionStorage:{removeItem:key=>{assert.equal(key,'mmV2GM');removes++;}},
 $:key=>resetControls[key]||(resetControls[key]={}),toast(){},bgmStop(){},clearInterval(){},tick:null,
 clearProClock(){},proAudioStop(){},clearRevealClock(){},revAudioStop(){},location:{reload:()=>resets++},
 roomRef:()=>{throw new Error('New game must not delete the prior room');}};
vm.createContext(resetContext);vm.runInContext(resetCode,resetContext);
resetContext.startNewGame();assert.equal(resets,0);assert.equal(removes,0);
approved=true;resetContext.startNewGame();assert.equal(resets,1);assert.equal(removes,1);assert.equal(resetControls['#newGame'].disabled,true);
console.log('PASS: new-game cancel is inert, confirmed reset clears only GM session and preserves prior room');
