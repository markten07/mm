/* QR links follow the deployed directory and the current room; no external QR service. */
const QR_ORDER=[1,2,3,4];
for(let i=QR_ORDER.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[QR_ORDER[i],QR_ORDER[j]]=[QR_ORDER[j],QR_ORDER[i]];}
function playerJoinUrl(number){
  const url=new URL(`${number}.html`,new URL('.',location.href));
  if(ONLINE&&/^[A-HJ-NP-Z2-9]{4}$/.test(ROOM||''))url.searchParams.set('r',ROOM);
  return url.href;
}
function roleQrSvg(url){
  const code=qrcode(0,'M');code.addData(url,'Byte');code.make();
  return code.createSvgTag({cellSize:4,margin:16,scalable:true});
}
function paintQR(){
  const box=document.getElementById('qrbox');if(!box)return;
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname)||location.protocol==='file:';
  box.innerHTML=`<div class="qrlab">각자 다른 QR을 스캔하세요 · 인물은 무작위입니다</div><div class="qrgrid">${QR_ORDER.map((n,i)=>`<button class="qrc" data-qr="${n}" aria-label="단말 ${'ABCD'[i]} QR 크게 보기">${roleQrSvg(playerJoinUrl(n))}<span>단말 ${'ABCD'[i]}</span></button>`).join('')}</div>${local?'<div class="qrwarn">휴대폰으로 접속하려면 공개 배포 주소에서 진행자 화면을 열어주세요.</div>':''}`;
  box.querySelectorAll('[data-qr]').forEach(b=>b.onclick=()=>{
    const url=playerJoinUrl(Number(b.dataset.qr));
    openModal(`<div class="qrpop">${roleQrSvg(url)}<div class="qrurl"></div><button class="b1" id="closeRoleQr">닫기</button></div>`);
    document.querySelector('.qrpop .qrurl').textContent=url;
    document.getElementById('closeRoleQr').onclick=closeModal;
  });
}
