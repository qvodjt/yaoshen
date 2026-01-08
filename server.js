
require('dotenv').config();
const express=require('express');
const axios=require('axios');
const sqlite3=require('sqlite3').verbose();
const app=express();

app.use(express.json());
app.use(express.static('public'));

const db=new sqlite3.Database('./db.sqlite');
db.serialize(()=>{
 db.run("CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY,name TEXT,price REAL,desc TEXT)");
 db.run("CREATE TABLE IF NOT EXISTS orders(id TEXT,amount TEXT,status TEXT,created INTEGER)");
});

app.post('/api/admin/login',(req,res)=>{
 if(req.body.user===process.env.ADMIN_USER && req.body.pass===process.env.ADMIN_PASS)
  return res.json({ok:true});
 res.json({ok:false});
});

app.get('/api/admin/products',(req,res)=>{
 db.all("SELECT * FROM products",(e,r)=>res.json(r||[]));
});

app.post('/api/admin/product',(req,res)=>{
 const p=req.body;
 db.run("INSERT INTO products(name,price,desc) VALUES(?,?,?)",[p.name,p.price,p.desc]);
 res.json({ok:true});
});

app.get('/api/admin/orders',(req,res)=>{
 db.all("SELECT * FROM orders ORDER BY created DESC",(e,r)=>res.json(r||[]));
});

app.get('/api/products',(req,res)=>{
 db.all("SELECT * FROM products",(e,r)=>res.json(r||[]));
});

app.post('/api/order/create',(req,res)=>{
 const id='OD'+Date.now();
 db.run("INSERT INTO orders VALUES(?,?,?,?)",[id,req.body.amount,'PENDING',Date.now()]);
 res.json({id,address:process.env.USDT_TRC20_ADDRESS});
});

app.get('/api/order/status',(req,res)=>{
 db.get("SELECT status FROM orders WHERE id=?",[req.query.id],(e,row)=>res.json({status:row?row.status:'NOT_FOUND'}));
});

async function checkTRC20() {
 try {
  const url='https://api.trongrid.io/v1/accounts/'+process.env.USDT_TRC20_ADDRESS+'/transactions/trc20';
  const r=await axios.get(url,{headers:{"TRON-PRO-API-KEY":process.env.TRON_API_KEY}});
  const txs=r.data.data||[];
  db.all("SELECT * FROM orders WHERE status='PENDING'",(e,orders)=>{
    orders.forEach(o=>{
      const hit=txs.find(t=>String(t.value)===String(o.amount));
      if(hit) db.run("UPDATE orders SET status='PAID' WHERE id=?",[o.id]);
    });
  });
 } catch(e){}
}
setInterval(checkTRC20,15000);

app.listen(3000,()=>console.log('running on 3000'));
