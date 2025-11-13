import express from 'express';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ FIXED: PROPER CORS HANDLING
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', stripe: 'Configured' });
});

// ✅ FIXED PAYMENT ENDPOINT
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `ClickALinks Ad - Square #${squareNumber}`,
            description: `${duration}-day campaign for ${businessName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://clickalinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://clickalinks-frontend.web.app/checkout`,
      customer_email: contactEmail,
    });

    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});