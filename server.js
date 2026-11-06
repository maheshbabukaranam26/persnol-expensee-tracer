// Personal Expense Tracker Management System | Mahesh Babu Karanam
const express=require('express'),mysql=require('mysql2/promise'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),path=require('path');
const CFG={host:process.env.DB_HOST||'localhost',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'expense_tracker'}; // <-- put your MySQL password here
const SECRET=process.env.JWT_SECRET||'mahesh-expense-tracker-secret',PORT=process.env.PORT||3000;
const pool=mysql.createPool({...CFG,waitForConnections:true,connectionLimit:10,decimalNumbers:true,dateStrings:true});
const app=express();app.use(express.json());app.use(express.static(path.join(__dirname,'public')));
const wrap=f=>(q,s)=>f(q,s).catch(e=>{console.error(e);s.status(500).json({error:e.sqlMessage||e.message})});
const auth=(q,s,n)=>{try{q.uid=jwt.verify((q.headers.authorization||'').slice(7),SECRET).id;n()}catch(e){s.status(401).json({error:'Please log in again'})}};
const tok=u=>({token:jwt.sign({id:u.user_id},SECRET,{expiresIn:'7d'}),user:{id:u.user_id,name:u.name,email:u.email}});
const own=async(uid,cid)=>(await pool.query('SELECT 1 FROM categories WHERE category_id=? AND user_id=?',[cid,uid]))[0].length>0;
const TYPES=['income','expense'];
const DEF=[['Salary','income'],['Freelance','income'],['Food','expense'],['Rent','expense'],['Travel','expense'],['Shopping','expense'],['Bills','expense'],['Health','expense'],['Entertainment','expense']];

app.get('/api/ping',(q,s)=>s.json({ok:true}));
app.post('/api/register',wrap(async(q,s)=>{const{name,email,password}=q.body;
  if(!name||!email||!password||password.length<6)return s.status(400).json({error:'Enter name, email and a password of 6+ characters'});
  const[ex]=await pool.query('SELECT user_id FROM users WHERE email=?',[email]);if(ex.length)return s.status(409).json({error:'Email already registered'});
  const[r]=await pool.query('INSERT INTO users(name,email,password) VALUES(?,?,?)',[name,email,await bcrypt.hash(password,10)]);
  await pool.query('INSERT INTO categories(user_id,category_name,category_type) VALUES ?',[DEF.map(d=>[r.insertId,d[0],d[1]])]);
  s.json(tok({user_id:r.insertId,name,email}))}));
app.post('/api/login',wrap(async(q,s)=>{const[r]=await pool.query('SELECT * FROM users WHERE email=?',[q.body.email]);
  if(!r.length||!await bcrypt.compare(String(q.body.password||''),r[0].password))return s.status(401).json({error:'Wrong email or password'});s.json(tok(r[0]))}));
app.put('/api/users/me',auth,wrap(async(q,s)=>{const{name,password}=q.body;if(!name)return s.status(400).json({error:'Enter your name'});
  if(password){if(password.length<6)return s.status(400).json({error:'Password needs 6+ characters'});await pool.query('UPDATE users SET name=?,password=? WHERE user_id=?',[name,await bcrypt.hash(password,10),q.uid])}
  else await pool.query('UPDATE users SET name=? WHERE user_id=?',[name,q.uid]);s.json({ok:1})}));
app.get('/api/data',auth,wrap(async(q,s)=>{const g=t=>pool.query(`SELECT * FROM ${t} WHERE user_id=?`,[q.uid]).then(r=>r[0]);
  s.json({categories:await g('categories'),transactions:await g('transactions'),budgets:await g('budgets')})}));
app.post('/api/categories',auth,wrap(async(q,s)=>{const b=q.body;if(!b.category_name||!TYPES.includes(b.category_type))return s.status(400).json({error:'Enter a name and type'});
  await pool.query('INSERT INTO categories(user_id,category_name,category_type) VALUES(?,?,?)',[q.uid,String(b.category_name).slice(0,100),b.category_type]);s.json({ok:1})}));
app.post('/api/transactions',auth,wrap(async(q,s)=>{const b=q.body;
  if(!(b.amount>0)||!TYPES.includes(b.trans_type)||!b.transaction_date)return s.status(400).json({error:'Enter a valid amount, type and date'});
  if(b.category_id&&!await own(q.uid,b.category_id))return s.status(400).json({error:'Unknown category'});
  await pool.query('INSERT INTO transactions(user_id,category_id,amount,trans_type,description,transaction_date) VALUES(?,?,?,?,?,?)',[q.uid,b.category_id||null,b.amount,b.trans_type,String(b.description||'').slice(0,255),b.transaction_date]);s.json({ok:1})}));
app.post('/api/budgets',auth,wrap(async(q,s)=>{const b=q.body;
  if(!(b.monthly_limit>0)||!(b.month>=1&&b.month<=12)||!b.year||!await own(q.uid,b.category_id))return s.status(400).json({error:'Enter a valid category, limit and month'});
  await pool.query('INSERT INTO budgets(user_id,category_id,monthly_limit,`month`,`year`) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE monthly_limit=VALUES(monthly_limit)',[q.uid,b.category_id,b.monthly_limit,b.month,b.year]);s.json({ok:1})}));
for(const[t,pk]of[['categories','category_id'],['transactions','trans_id'],['budgets','bud_id']])
  app.delete(`/api/${t}/:id`,auth,wrap(async(q,s)=>{await pool.query(`DELETE FROM ${t} WHERE ${pk}=? AND user_id=?`,[q.params.id,q.uid]);s.json({ok:1})}));
app.listen(PORT,()=>console.log(`Mahesh Expense Tracker running at http://localhost:${PORT}`));
