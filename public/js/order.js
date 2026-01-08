
const p=new URLSearchParams(location.search);
const id=p.get('id');
let sec=1800;
const amt=(Math.random()*0.01+0.01).toFixed(4);
document.getElementById('a').innerText=amt;

function copy(){navigator.clipboard.writeText('TL6pvvYphpWshdqJ99mSZCq9izYqt2evyX');}

setInterval(()=>{
 sec--;
 if(sec<=0){document.getElementById('s').innerText='已超时';return;}
 const m=String(Math.floor(sec/60)).padStart(2,'0');
 const s=String(sec%60).padStart(2,'0');
 document.getElementById('t').innerText=`${m}:${s}`;
 fetch('/api/order/status?id='+id).then(r=>r.json()).then(d=>{
  if(d.status==='PAID'){location.href='success.html';}
  if(d.status==='EXPIRED'){document.getElementById('s').innerText='已超时';}
 });
},1000);
