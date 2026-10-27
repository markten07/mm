const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');
function element(){
 const nodes={},events={};
 return {innerHTML:'',textContent:'',disabled:false,style:{setProperty(){}},classList:{remove(){},add(){},toggle(){}},setAttribute(){},focus(){},events,addEventListener(name,fn){events[name]=fn;},getBoundingClientRect:()=>({left:10,top:100,width:80,height:110}),
 querySelector(selector){return nodes[selector]||(nodes[selector]=element());},querySelectorAll:()=>[],insertAdjacentHTML(_p,html){this.innerHTML+=html;},showModal(){this.open=true;},close(){this.open=false;}};
}
function fixture(){
 const root=element(),elements={},dialog=element(),timers=[],claims=[],messages=[];
 const decks=['site','han','bak','yu','yun'].map(k=>({...element(),dataset:{deck:k}}));
 root.querySelectorAll=selector=>selector==='[data-deck]'?decks:[];
 const c={
 ORDER:['han','bak','yu','yun'],NAMES:{han:'한소설',bak:'백비서',yu:'유감독',yun:'윤꽃집'},MYKEY:'yun',
 LOC:{'site:dining':{zone:'site',name:'식당',clues:['ice','glass']},'site:kitchen':{zone:'site',name:'주방',clues:['dish']},'sus:han:0':{zone:'sus',owner:'han',name:'서재',clues:['letter']}},
 ONLINE:true,srvRound:1,round:1,ROUND_NAME:{1:'1차 조사'},srvVote:0,myVotes:{},tab:'inv',nav:[],taken:{},roundDraw:[],
 C:{ice:{n:'얼음',w:'식당 · 물잔',d:'증거 내용'},glass:{n:'유리잔',w:'식당',d:'유리잔 설명'},dish:{n:'접시',w:'주방',d:'접시 설명'}},IMG:{},found:new Set(),starred:new Set(),
 AV:{han:'초상',bak:'초상',yu:'초상'},SUSPECTS:{han:{av:'han'},bak:{av:'bak'},yu:{av:'yu'}},
 M:()=>root,$:selector=>elements[selector]||(elements[selector]=element()),
 poolAt:key=>c.LOC[key].clues.filter(id=>!c.taken[id]),drawsLeft:()=>Math.max(0,3-c.roundDraw.length),
 rMap(){root.innerHTML='closed';},render(){if(c.srvVote)c.rVote();else if(c.tab==='kit')c.rKit();else c.rMap();},emptyDig(){},rClue(){},rKit(){},closeClue(){},rBook(){},rVote(){},nextRound(){},
 claim(id,callback){claims.push({id,callback});},dock(){},toast:m=>messages.push(m),openClue(){},roomRef(){throw new Error('Must not submit during selection');},
 document:{createElement:()=>dialog,body:{appendChild(){}},querySelector:()=>element()},
 window:{innerWidth:390,innerHeight:844,scrollY:240,scrollTo(){},matchMedia:()=>({matches:false})},setTimeout:fn=>(timers.push(fn),timers.length),
 Math:Object.assign(Object.create(Math),{random:()=>0}),Date
 };
 vm.createContext(c);vm.runInContext(fs.readFileSync('assets/player-experience.js','utf8'),c);
 return {c,root,elements,dialog,decks,claims,messages,flush:()=>{while(timers.length)timers.shift()();}};
}
// Five groups are visible; the mansion combines locations without losing their source.
{
 const f=fixture();f.c.rMap();
 for(const k of ['site','han','bak','yu','yun'])assert(f.root.innerHTML.includes('ux-theme-'+k));
 assert(f.root.innerHTML.includes('저택, 남은 3장'));
 assert.equal((f.root.innerHTML.match(/ux-stack-layer/g)||[]).length,2);
 assert(f.root.innerHTML.includes('카드 없음'));
 f.decks[0].onclick();assert.equal(f.claims.length,1);assert(f.dialog.innerHTML.includes('들어 올리고'));
 f.c.render();f.decks[0].onclick();assert.equal(f.claims.length,1,'Live updates must not release the draw lock');
 f.claims[0].callback(true);f.flush();
 assert(f.c.found.has('ice'));assert.equal(f.c.roundDraw.length,1);assert(f.dialog.innerHTML.includes('저택 · 식당'));assert(f.dialog.innerHTML.includes('ux-turn-over'));
 f.dialog.querySelector('.ux-store').onclick();f.flush();assert(!f.dialog.open);assert(f.root.innerHTML.includes('저택, 남은 2장'));
 f.c.tab='kit';f.c.rKit();assert(f.root.innerHTML.includes('data-evidence="ice"'));assert(f.root.innerHTML.includes('저택 · 식당'));
}
// A snapshot can arrive before the transaction callback, including on the final draw.
{
 const f=fixture();f.c.roundDraw=[{c:'a'},{c:'b'}];f.c.rMap();f.decks[0].onclick();
 f.c.roundDraw.push({c:'ice',loc:'site:dining'});f.c.found.add('ice');f.c.taken.ice='yun#1';f.c.render();
 f.claims[0].callback(true);f.flush();assert.equal(f.c.roundDraw.length,3);assert(f.dialog.innerHTML.includes('보관 완료 · 조사 계속하기'));assert(f.dialog.innerHTML.includes('기회 0회'));
}
// Failed claims do not consume a turn. Leaving a pending request must not permit a second claim.
{
 const f=fixture();f.c.rMap();f.decks[0].onclick();f.dialog.querySelector('.ux-dialog-close').onclick();
 f.decks[0].onclick();assert.equal(f.claims.length,1);f.claims[0].callback(false);f.flush();
 assert.equal(f.c.roundDraw.length,0);assert.equal(f.c.found.size,0);assert(!f.dialog.open);
 f.decks[0].onclick();assert.equal(f.claims.length,2);
}
// A late successful response is saved, but cannot overwrite the next round or reopen its modal.
{
 const f=fixture();f.c.rMap();f.decks[0].onclick();f.c.round=2;f.c.srvRound=2;f.c.roundDraw=[];f.c.render();
 f.claims[0].callback(true);f.flush();assert(f.c.found.has('ice'));assert.equal(f.c.roundDraw.length,0);assert(!f.dialog.open);
}
// Taking the final available card leaves an empty tray.
{
 const f=fixture();f.c.taken.glass='han#1';f.c.taken.dish='han#1';f.c.rMap();f.decks[0].onclick();f.claims[0].callback(true);f.flush();
 f.dialog.querySelector('.ux-store').onclick();f.flush();assert(!f.root.innerHTML.includes('data-deck="site"'));assert(f.root.innerHTML.includes('ux-tray-empty'));
 f.c.srvRound=0;f.c.rMap();assert.equal(f.root.innerHTML,'closed');
}
// Saving is automatic: dismissing the revealed card without the continue button keeps it.
{
 const f=fixture();f.c.rMap();f.decks[0].onclick();f.claims[0].callback(true);f.flush();
 assert(f.c.found.has('ice'));assert(f.dialog.innerHTML.includes('단서함에 자동 보관됐어요'));
 f.dialog.events.cancel({preventDefault(){}});assert(!f.dialog.open);
 assert(f.c.found.has('ice'));assert.equal(f.c.roundDraw.length,1);assert.equal(f.claims.length,1);
 f.c.tab='kit';f.c.rKit();assert(f.root.innerHTML.includes('증거 내용'));assert(f.root.innerHTML.includes('발견 위치 · 식당 · 물잔'));
}
// Owned cards use the same face, enlarge face-up, and never claim or consume another draw.
{
 const f=fixture();f.c.tab='kit';f.c.found.add('ice');f.c.starred.add('ice');f.c.rKit();
 assert.equal((f.root.innerHTML.match(/data-evidence="ice"/g)||[]).length,1);
 assert(f.root.innerHTML.includes('ux-card-paper'));assert(f.root.innerHTML.includes('★ 중요 단서'));
 f.c.openClue('glass',element());assert(!f.dialog.open,'Unowned cards must not open');
 f.c.openClue('ice',element());assert(f.dialog.open);assert(f.dialog.innerHTML.includes('ux-kit-lift'));assert(f.dialog.innerHTML.includes('ux-kit-face'));
 assert(!f.dialog.innerHTML.includes('ux-flip-back'));assert(!f.dialog.innerHTML.includes('ux-turn-over'));
 assert(f.dialog.innerHTML.includes('증거 내용'));assert(f.dialog.innerHTML.includes('단서함으로 돌아가기'));
 f.c.render();assert(f.dialog.open,'Ordinary realtime rendering must not close the reader');
 const mark=f.dialog.querySelector('.ux-mark');mark.onclick({currentTarget:mark});
 f.dialog.querySelector('.ux-store').onclick();f.flush();assert(!f.dialog.open);assert(!f.c.starred.has('ice'));
 assert.equal(f.claims.length,0);assert.equal(f.c.roundDraw.length,0);assert.equal(f.c.found.size,1);
 assert(!f.root.innerHTML.includes('★ 중요 단서'));
}
// Existing voting flow remains explicit and resets selection at the next vote.
{
 const f=fixture(),{c,root,elements}=f;
 const choices=['han','bak','yu'].map(k=>({...element(),dataset:{choice:k}}));
 root.querySelectorAll=selector=>selector==='[data-choice]'?choices:[];
 c.srvVote=1;c.rVote();assert(root.innerHTML.includes('먼저 인물을 선택해주세요'));
 choices[0].onclick();assert(root.innerHTML.includes('한소설 님에게 투표 제출'));
 let submissions=0;
 c.roomRef=path=>({transaction(update,callback){submissions++;assert.equal(path,'votes/v1/yun');assert.equal(update(null),'han');assert.equal(update('bak'),undefined);c.myVotes={v1:{yun:'han'}};callback(null,true);}});
 elements['#ux-submit'].onclick();assert.equal(submissions,1);assert(root.innerHTML.includes('한소설 님에게 투표했어요'));
 c.srvVote=2;c.rVote();assert(root.innerHTML.includes('먼저 인물을 선택해주세요'));
}
for(const name of ['1.html','2.html','3.html','4.html']){
 const html=fs.readFileSync(name,'utf8');assert(html.includes('src="assets/player-experience.js"'));assert(html.includes('href="assets/player-experience.css"'));
}
console.log('PASS: five trays, pooled counts, stacked layers, claim lock, flip/store, last draw snapshot race, empty tray, late response, automatic save, face-up collection viewer, voting');
