import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import purchaseRoutes from './routes/purchase.js';

dotenv.config();

// Pricing configuration
const PRICING = {
  10: 1000,   // £10.00 for 10 days
  20: 2000,   // £20.00 for 20 days  
  30: 3000    // £30.00 for 30 days
};

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CORS middleware - UPDATED TO FIX THE ISSUE
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.0.240:3000',
      'https://www.clickalinks.com',
      'https://clickalinks.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// ⬇️ ADD WEBHOOK HERE ⬇️
// Stripe Webhook (must be before express.json)
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`❌ Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('💰 Payment successful for square:', session.metadata.squareId);
    // TODO: Save to database
  }

  res.json({received: true});
});

// JSON middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use purchase routes
app.use('/api', purchaseRoutes);

// ADD THIS TEST ROUTE TO DEBUG FRONTEND
app.get('/test-connection', (req, res) => {
  console.log('✅ Test connection received from frontend');
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    pricing: PRICING
  });
});

// Main checkout route
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { squareId, duration, purchaseData, currency = 'GBP' } = req.body;
    
    console.log('📦 Received purchase data:', { squareId, duration, purchaseData, currency });
    
    // Currency conversion rates
    const CURRENCY_RATES = {
      USD: 1.3,  // £1 = $1.30
      EUR: 1.1,  // £1 = €1.10
      GBP: 1     // Base currency
    };
    
    // Get base price and convert if needed
    const baseAmount = PRICING[duration];
    const convertedAmount = Math.round(baseAmount * CURRENCY_RATES[currency]);
    
    console.log('💱 Currency conversion:', { baseAmount, currency, convertedAmount });
    
    if (!baseAmount) {
      return res.status(400).json({ error: 'Invalid duration selected' });
    }
    
    console.log('💳 Creating checkout session for:', { squareId, duration, convertedAmount });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `ClickaLinks - Square #${squareId} - ${purchaseData.businessName}`,
              description: `Advertising space for ${duration} days - ${purchaseData.adText || 'Special offer'}`,
            },
            unit_amount: convertedAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NODE_ENV === 'production' 
        ? `https://www.clickalinks.com/success?square=${squareId}&session_id={CHECKOUT_SESSION_ID}`
        : `http://localhost:3000/success?square=${squareId}&session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: process.env.NODE_ENV === 'production'
        ? `https://www.clickalinks.com/checkout?square=${squareId}&duration=${duration}`
        : `http://localhost:3000/checkout?square=${squareId}&duration=${duration}`,
      metadata: {
        squareId: squareId,
        duration: duration,
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail,
        currency: currency // Store currency in metadata
      }
    }); // ← THIS WAS MISSING!

    console.log('✅ Session created with URL:', session.url);
    res.json({ id: session.id, url: session.url });
    
  } catch (error) {
    console.error('❌ Stripe API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Payment endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test-connection`);
  console.log(`🌐 Network URL: http://192.168.0.240:${PORT}/test-connection`);
});