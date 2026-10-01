const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// MOTA CREDENTIALS - FROM YOUR PHOTO
const VERIFY_TOKEN = "mota_verify_2024";
const PHONE_NUMBER_ID = "1334966083037170";
// PASTE YOUR FULL TOKEN FROM META PAGE - IT STARTS WITH EAA...
const WHATSAPP_TOKEN = "EAAQkvA9xG4B5pTcEg2T21J1WyYVcrI";

const MOTA_MENU = `🚗 Welcome to Mota! Byo Ride - Bulawayo!
1️⃣ Book a Ride
2️⃣ Check Price
3️⃣ My Trips
4️⃣ Support

Reply with number Malume!`;

async function sendMessage(to, text){
  try{
    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,{
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    },{
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" }
    });
    console.log("Sent to", to);
  }catch(err){
    console.log("Error", err.response?.data);
  }
}

app.get('/', (req,res)=> res.send('Mota Live with Prompts 🚗'));

app.get('/webhook', (req,res)=>{
  if(req.query['hub.verify_token']===VERIFY_TOKEN){
    res.send(req.query['hub.challenge']);
  } else res.sendStatus(403);
});

app.post('/webhook', async (req,res)=>{
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = msg?.from;
  if(msg && from){
    const body = (msg.text?.body || '').toLowerCase().trim();
    console.log("Mota got:", body, "from", from);
    let reply = MOTA_MENU;

    if(body === "hi" || body === "hello" || body === "menu" || body === "1"){
      reply = MOTA_MENU;
    } else if(body === "1" || body.includes("ride") || body.includes("book")){
      reply = "Sharp! Where to pick you Malume? 📍\nSend location e.g Ascot Shops";
    } else if(body.includes("ascot") || body.includes("town") || body.includes("luveve")){
      reply = `💰 ${body} → Town\nPrice: $3.50 / ZiG 94.50\nETA: 8 mins\n\nConfirm? Reply YES`;
    } else if(body === "yes" || body === "2" || body.includes("price")){
      reply = "✅ Ride confirmed! Driver: Sipho - White Honda Fit ABC 1234 - 5 mins away! 📞";
    }
    await sendMessage(from, reply);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Mota running on ${PORT}`));
