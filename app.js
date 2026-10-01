const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// === YOUR WHATSAPP CREDENTIALS - FILL THESE ===
const VERIFY_TOKEN = "mota_verify_2024";
const WHATSAPP_TOKEN = "YOUR_WHATSAPP_TOKEN_HERE"; // From Meta Developers
const PHONE_NUMBER_ID = "YOUR_PHONE_ID_HERE"; // From Meta Developers

const MOTA_PROMPTS = {
  menu: `🚗 Welcome to Mota! Byo Ride!
1️⃣ Book a Ride
2️⃣ Check Price
3️⃣ My Trips
4️⃣ Support

Reply with number Malume!`,
  pickup: `Sharp! Where to pick you? 📍
E.g Ascot Shops`,
  dropoff: (pick) => `Pickup: ${pick} ✅
Where to drop you?`,
  price: (f,t) => `💰 ${f} → ${t}
Price: $3.50 / ZiG 94.50
ETA: 8 mins
Confirm? YES`
};

async function sendWhatsApp(to, text){
  try{
    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,{
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    },{
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
    });
    console.log("Mota replied to", to);
  } catch(e){ console.log("Send error", e.response?.data); }
}

app.get('/', (req,res)=> res.send('Mota Live with Prompts 🚗'));
app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']===VERIFY_TOKEN) res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = msg?.from;
  if(msg && from){
    const text = (msg.text?.body || '').toLowerCase();
    let reply = MOTA_PROMPTS.menu;
    if(text.includes('hi')||text==='1'||text==='menu') reply = MOTA_PROMPTS.menu;
    else if(text==='1'||text.includes('book')||text.includes('ride')) reply = MOTA_PROMPTS.pickup;
    else if(text.includes('to')){
      const p = text.split(' to ');
      reply = MOTA_PROMPTS.price(p[0], p[1]);
    } else if(text.includes('yes')) reply = `✅ Ride confirmed Malume! Driver Sipho White Honda Fit ABC1234 5mins away!`;

    await sendWhatsApp(from, reply);
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT||10000, ()=> console.log('Mota running'));
