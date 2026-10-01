const express = require('express');
const app = express();
app.use(express.json());

// === MOTA PROMPTS - BULAWAYO RIDE HAILING ===
const MOTA_PROMPTS = {
  system: `You are Mota, friendly ride-hailing assistant for Bulawayo, Zimbabwe.
  Speak township style but professional. Short replies for WhatsApp.
  Always ask pickup & dropoff. Price: Base $2 + $0.50/km in USD + ZiG (rate 27).
  IVR Menu: 1️⃣ Book Ride 2️⃣ Check Price 3️⃣ My Trips 4️⃣ Support`,

  menu: `🚗 Welcome to Mota! Mota Ride - Bulawayo!
1️⃣ Book a Ride
2️⃣ Check Price
3️⃣ My Trips
4️⃣ Support

Reply with number Malume!`,

  askPickup: `Sharp! Where to pick you Malume? 📍
Send location name e.g. "Ascot Shopping Centre"`,

  askDropoff: (pickup) => `Got pickup: ${pickup} ✅
Where to drop you?`,

  priceCalc: (from, to) => {
    const priceUSD = 3.5;
    const priceZiG = (priceUSD * 27).toFixed(2);
    return `💰 ${from} → ${to}
Price: $${priceUSD} / ZiG ${priceZiG}
ETA: 8 mins
Driver searching...

Confirm? Reply YES`;
  }
};

// === WEBHOOK ===
app.get('/', (req,res)=> res.send('Mota Webhook with Prompts Live! 🚗'));

app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']==='mota_verify_2024'){
    res.send(req.query['hub.challenge']);
  } else res.sendStatus(403);
});

app.post('/webhook', (req,res)=>{
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if(message){
    const text = (message.text?.body || '').toLowerCase();
    let reply = MOTA_PROMPTS.menu;

    if(text.includes('hi') || text.includes('hello') || text==='1' || text==='menu'){
      reply = MOTA_PROMPTS.menu;
    } else if(text==='1' || text.includes('book')){
      reply = MOTA_PROMPTS.askPickup;
    } else if(text==='2' || text.includes('price')){
      reply = 'Send trip like: Town to Luveve';
    } else if(text.includes('to')){
      const parts = text.split(' to ');
      reply = MOTA_PROMPTS.priceCalc(parts[0], parts[1]);
    } else if(text.includes('yes')){
      reply = '✅ Ride confirmed! Driver: Sipho - White Honda Fit ABC 1234 - 5 mins away! 📞';
    }
    console.log('Mota reply:', reply);
    // Add WhatsApp send API here later
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Mota running on ${PORT}`));
