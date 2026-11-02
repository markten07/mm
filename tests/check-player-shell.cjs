const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const node=()=>({textContent:'',innerHTML:'',attrs:{},classList:{add(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},insertAdjacentHTML(){},appendChild(){},remove(){}});
for(const [key,name] of [['yun','윤꽃집'],['han','한소설'],['bak','백비서'],['yu','유감독']]){
 const header=node(),tabs=node(),phase=node(),count=node(),dot=node();
 const buttons=['book','inv','kit'].map(t=>({...node(),dataset:{t}}));
 tabs.querySelectorAll=()=>buttons;
 const nodes={'#app .hdr':header,'#tabs':tabs,'#dt':dot,'#player-phase':phase,'#player-kit-count':count};
 let rendered=0,docked=0,networked=0;
 const c={window:{},document:{querySelector:s=>nodes[s]},MYKEY:key,ME:{name},ONLINE:true,ROOM:'ABCD',srvPhase:'1차 조사',srvVote:0,tab:'book',found:new Set(),render(){rendered++;},dock(){docked++;},dockNet(){networked++;}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('assets/player-shell.js','utf8'),c);
 assert.equal(buttons[0].attrs['aria-current'],'page');
 assert.equal(phase.textContent,'ABCD · 1차 조사');
 assert.equal(count.textContent,'');
 assert(buttons.every(b=>b.innerHTML.includes('<svg')));
 c.tab='inv';c.render();assert.equal(rendered,1);
 assert.equal(buttons[1].attrs['aria-current'],'page');assert(!buttons[0].attrs['aria-current']);
 c.found.add('clue');c.dock();assert.equal(docked,1);assert.equal(count.textContent,'1');
 c.srvPhase='최종 투표';c.srvVote=2;c.render();c.dockNet();
 assert.equal(rendered,2);assert.equal(networked,1);assert.equal(phase.textContent,'ABCD · 최종 투표');
 assert(buttons.every(b=>!b.attrs['aria-current']),'Mandatory vote must not mark another screen as selected');
 c.srvVote=0;c.tab='kit';c.render();assert.equal(buttons[2].attrs['aria-current'],'page');
}
for(const name of ['1.html','2.html','3.html','4.html']){
 const html=fs.readFileSync(name,'utf8');
 assert(html.indexOf('assets/player-shell.js')<html.indexOf('assets/rolebook-ui.js'));
 assert(html.includes('assets/player-design-system.css'));
}
console.log('PASS: shared player navigation, role portraits, counters and phase updates preserve original render/dock behavior and mandatory voting');
