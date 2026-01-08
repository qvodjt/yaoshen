
let sec=1800;
const amt=(Math.random()*0.011+0.01).toFixed(3);
document.getElementById('amt').innerText=amt;
setInterval(()=>{
 if(sec<=0){document.getElementById('msg').innerText='超时';return;}
 sec--;
 document.getElementById('t').innerText=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
},1000);
function copy(){navigator.clipboard.writeText(document.getElementById('addr').value);}
