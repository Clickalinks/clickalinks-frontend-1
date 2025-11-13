import express from 'express';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ ULTRA-SIMPLE CORS - ALLOW EVERYTHING
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// ✅ SIMPLE HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// ✅ SIMPLE PAYMENT ENDPOINT
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('💰 Payment request received:', req.body);
    
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: `ClickALinks - Square #${squareNumber}`,
            description: `${duration} days for ${businessName}`,
          },
          unit_amount: amount * 100, // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://clickalinks-frontend.web.app/success',
      cancel_url: 'https://clickalinks-frontend.web.app/',
      customer_email: contactEmail,
    });

    console.log('✅ Stripe session created:', session.id);
    
    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('❌ Stripe error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});