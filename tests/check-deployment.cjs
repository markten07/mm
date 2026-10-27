const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const pages=['index.html','1.html','2.html','3.html','4.html','character-book-sample.html'];
for(const name of pages){
 const html=fs.readFileSync(name,'utf8');
 for(const m of html.matchAll(/\b(?:src|href)=["']([^"'<>]+)["']/g)){
  const url=m[1];if(/^(?:https?:|data:|#)/.test(url)||url.includes('${'))continue;
  const file=decodeURIComponent(url.split(/[?#]/)[0]);
  assert(fs.existsSync(path.resolve(path.dirname(name),file)),`${name}: missing ${file}`);
 }
}
const ctx={URL,location:{href:'https://markten07.github.io/mm/index.html?test=unused',hostname:'markten07.github.io',protocol:'https:'},ONLINE:true,ROOM:'ABCD'};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/vendor/qrcode-generator-1.4.4.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('assets/room-qr.js','utf8'),ctx);
for(let i=1;i<=4;i++){
 const url=ctx.playerJoinUrl(i);
 assert.equal(url,`https://markten07.github.io/mm/${i}.html?r=ABCD`);
 assert(ctx.roleQrSvg(url).includes('<svg'));
}
ctx.ROOM='WXYZ';assert(ctx.playerJoinUrl(1).endsWith('?r=WXYZ'));
ctx.ONLINE=false;assert.equal(ctx.playerJoinUrl(1),'https://markten07.github.io/mm/1.html');
ctx.location.href='http://localhost:8000/index.html';assert.equal(ctx.playerJoinUrl(2),'http://localhost:8000/2.html');
assert(!fs.readFileSync('index.html','utf8').includes('const QR_BASE='));
assert(fs.readFileSync('index.html','utf8').includes("if(typeof paintQR==='function')paintQR()"));
console.log('PASS: all static entry assets exist; QR follows deployment directory and current room, without old-host or offline-room leakage');
