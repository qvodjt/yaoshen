
require('dotenv').config();
const express=require('express');
const sqlite3=require('sqlite3').verbose();
const axios=require('axios');
const app=express();
app.use(express.json());
app.use(express.static('public'));

const db=new sqlite3.Database('./db.sqlite');
db.serialize(()=>{
 db.run("CREATE TABLE IF NOT EXISTS orders(id TEXT,amount REAL,status TEXT,created INTEGER,shipped INTEGER DEFAULT 0)");
});

// create order
app.post('/api/order',(req,res)=>{
 const id='OD'+Date.now();
 db.run("INSERT INTO orders VALUES(?,?,?,?,0)",[id,req.body.amount,'PENDING',Date.now()]);
 res.json({id});
});

// status
app.get('/api/order/status',(req,res)=>{
 db.get("SELECT status FROM orders WHERE id=?",[req.query.id],(e,row)=>{
  res.json({status:row?row.status:'NONE'});
 });
});

// expire orders
setInterval(()=>{
 const limit=Date.now()-1800000;
 db.run("UPDATE orders SET status='EXPIRED' WHERE status='PENDING' AND created<?",[limit]);
},60000);

// tron listener
async function checkTron(){
 try{
  const url=`https://api.trongrid.io/v1/accounts/${process.env.USDT_ADDRESS}/transactions/trc20`;
  const r=await axios.get(url,{headers:{'TRON-PRO-API-KEY':process.env.TRON_API_KEY}});
  const txs=r.data.data||[];
  db.all("SELECT * FROM orders WHERE status='PENDING'",(e,os)=>{
   os.forEach(o=>{
    if(txs.find(t=>Number(t.value)/1e6===o.amount)){
     db.run("UPDATE orders SET status='PAID' WHERE id=?",[o.id]);
    }
   });
  });
 }catch(e){}
}
setInterval(checkTron,15000);

app.listen(process.env.PORT||3000);
