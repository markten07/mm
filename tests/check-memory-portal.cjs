const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function fixture({visible=true,reduced=false}={}){
 const nodes={};
 const make=()=>({hidden:false,inert:false,innerHTML:'',attrs:{},classes:new Set(),style:{setProperty(){}},events:{},setAttribute(k,v){this.attrs[k]=v;},querySelector(s){return nodes[s]||(nodes[s]=make());},focus(){this.focused=true;},addEventListener(k,v){this.events[k]=v;},getBoundingClientRect(){return{left:0,top:0,width:390,height:844};}});
 const prepare=node=>{node.classList={add:c=>node.classes.add(c),remove:c=>node.classes.delete(c)};return node;};
 const overlay=prepare(make()),intro=prepare(make()),scene=prepare(make()),content=prepare(make());
 const stage={querySelector:s=>s==='.intro-screen'?intro:s==='.scene-screen'?scene:make()};
 const root={appendChild(node){node.parentNode={host:make()};}};
 const timers=[],cleared=[];let covers=0;
 const c={window:{},document:{createElement:()=>overlay,documentElement:make()},setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout:id=>cleared.push(id)};
 vm.createContext(c);vm.runInContext(fs.readFileSync('assets/memory-portal.js','utf8'),c);
 const portal=c.window.MemoryPortal.create({root,stage,content,portrait:'portrait-han.png',images:['own-1.png','own-2.png','unused.png'],canPlay:()=>visible,isReduced:()=>reduced,onCover(){covers++;}});
 return{portal,overlay,intro,content,scene,nodes,timers,cleared,setVisible(v){visible=v;},setReduced(v){reduced=v;},get covers(){return covers;}};
}
// Arrival begins at visible entry, not behind the join gate; rendering it again does not restart it.
{
 const f=fixture({visible:false});f.portal.present();assert.equal(f.intro.classes.size,0);
 f.setVisible(true);f.portal.present();assert(f.intro.classes.has('portal-arriving'));
 f.portal.present();assert.equal(f.intro.classes.size,1);
}
// Repeated taps must not queue another entry or complete twice.
{
 const f=fixture();let entered=0;
 f.portal.play(()=>entered++);f.portal.play(()=>entered++);
 assert.equal(f.timers.length,1);assert.equal(f.content.inert,true);assert.equal(f.overlay.hidden,false);
 assert(!f.nodes['.portal-fragments'].innerHTML.includes('unused.png'));
 f.nodes['[data-portal="skip"]'].onclick();assert.equal(entered,1);assert.equal(f.content.inert,false);assert(f.overlay.hidden);
 f.timers[0]();assert.equal(entered,1);assert(f.scene.classes.has('portal-emerged'));
}
// Privacy, route changes and vote takeover cancel the timer without committing the story route.
{
 const f=fixture();let entered=0;f.portal.play(()=>entered++);
 f.portal.cancel();f.timers[0]();assert.equal(entered,0);assert.equal(f.content.inert,false);assert(f.overlay.hidden);
 f.portal.play(()=>entered++);f.setVisible(false);f.timers[1]();assert.equal(entered,0);assert(f.overlay.hidden);
}
// Cover is available during the animation and never reveals the first memory behind it.
{
 const f=fixture();let entered=0;f.portal.play(()=>entered++);f.nodes['[data-portal="cover"]'].onclick();
 f.timers[0]();assert.equal(f.covers,1);assert.equal(entered,0);assert.equal(f.content.inert,false);
}
// Reduced motion and the natural timeout both complete without leaving a blocking overlay.
{
 const f=fixture({reduced:true});let entered=0;f.portal.present();assert(f.intro.classes.has('portal-ready'));
 f.portal.play(()=>entered++);assert.equal(entered,1);assert.equal(f.timers.length,0);
 f.setReduced(false);f.portal.play(()=>entered++);f.timers[0]();assert.equal(entered,2);assert(f.overlay.hidden);assert.equal(f.content.inert,false);
}
for(const name of ['1.html','2.html','3.html','4.html','character-memory-sample.html']){
 const html=fs.readFileSync(name,'utf8');assert(html.includes('assets/memory-portal.js'));
}
console.log('PASS: visible arrival, single entry, immediate skip, cover/cancellation races, role-only fragments and reduced-motion entry');
