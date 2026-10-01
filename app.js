const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ====== PUT YOUR REAL VALUES HERE ======
const VERIFY_TOKEN = "mota_verify_2024";
// Get this from developers.facebook.com -> WhatsApp -> API Setup -> Temporary token (starts EAA...)
const WHATSAPP_TOKEN = "EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
// Get this from same page -> Phone Number ID (numbers only)
const PHONE_NUMBER_ID = "123456789012345";

// ====== DO NOT CHANGE BELOW ======
console.log("Mota starting...");

app.get('/', (req, res) => {
  console.log("Root hit");
  res.send('Mota running - webhook at /webhook');
});

app.get('/webhook', (req, res) => {
  console.log("GET /webhook:", req.query);
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log("✅ VERIFIED!");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.log("❌ Verify failed");
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log("📩 Message received");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message) {
      const from = message.from;
      const text = message.text?.body || "hi";
      console.log(`From ${from}: ${text}`);

      // Reply back on WhatsApp
      await axios.post(
        `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: `Mota: I got your message "${text}" ✅` }
        },
        {
          headers: {
            Authorization: `Bearer ${EAASQkvA9xG4BShyLHE2OmBZCeKT2SD7V09V4hw9iMrUUFHNZCxaZCkAEomvJZAADwdIaTjkE43ynib6PNDy0PqJGaexN2C059o20MgxjPZAinxWsAdiQxZCpz18vWbQlLFi697iT8FZAoHK1dWfWxXA1NvZAMb9T6ZAFFZCWMmWHHCQKcoVH0Jz2ij39p7Klp73jB4RlHEt0ZACmgEVmbZA3loFZAAgmVLV4BsHMxZAGVyrtavbb9oBnPhsKe3dvHqAhBh75w0ZCuiI1oNyWRgUsFZBHqAaYeHcs}`,
            "Content-Type": "application/json"
          }
        }
      );
      console.log("✅ Reply sent to", from);
    }
  } catch (err) {
    console.log("❌ Reply error:", err.response?.data || err.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Mota live on ${PORT}`));
