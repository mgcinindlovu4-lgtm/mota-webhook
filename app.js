const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "mota_verify_2024";
const PHONE_NUMBER_ID = "1334966083037170";
// REPLACE BELOW WITH YOUR FULL EAA TOKEN FROM META PAGE
const WHATSAPP_TOKEN = "PASTE_FULL_EAA_TOKEN_HERE";

const MENU = `🚗 Welcome to Mota! Byo Ride!
1️⃣ Book a Ride
2️⃣ Check Price
3️⃣ My Trips
4️⃣ Support

Reply with number Malume!`;

async function send(to, text){
  try{
    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,{
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    },{ headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  }catch(e){ console.log(e.response?.data); }
}

app.get('/', (req,res)=> res.send('Mota Live 🚗'));
app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']===VERIFY_TOKEN) res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
  const m = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if(m){
    const from = m.from;
    const txt = (m.text?.body||'').toLowerCase();
    let reply = MENU;
    if(txt.includes('hi')||txt==='1'||txt==='menu') reply = MENU;
    else if(txt.includes('book')||txt==='1') reply = "Sharp! Where to pick you? 📍\nE.g Ascot Shops";
    else if(txt.includes('ascot')||txt.includes('town')||txt.includes('luveve')) reply = `💰 ${m.text.body} → Town\nPrice: $3.50 ETA 8mins\nConfirm? YES`;
    else if(txt.includes('yes')) reply = "✅ Ride confirmed! Driver Sipho - White Honda Fit ABC1234 - 5 mins!";
    await send(from, reply);
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT||10000, ()=> console.log('Mota running'));
