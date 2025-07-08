javascript
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path'); // ✅ Add this

const app = express();
app.use(express.json());
app.use(express.static('public')); // ✅ Serve static assets

// ✅ Respond to the homepage request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const shortcode = 'YOUR_SHORTCODE'; // Replace with your actual shortcode
const passkey = 'YOUR_PASSKEY';     // Replace with your actual passkey

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

function getTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

async function getToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`
}
}
);
  return response.data.access_token;
}

async function initiateSTKPush(phone, amount, accountRef, desc) {
  const token = await getToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: 'https://yourdomain.com/callback', // Change this
    AccountReference: accountRef,
    TransactionDesc: desc
};

  return axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
}
}
);
}

app.post('/api/pay', async (req, res) => {
  const { phone, amount, package} = req.body;
  try {
    await initiateSTKPush(phone, amount, package, `Payment for ${package}`);
    res.json({ message: 'STK Push sent to your phone. Please complete payment.'});
} catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment request failed. Try again later.'});
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Server running at http://localhost:${PORT}`));
