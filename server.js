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
    const { squareId, duration, purchaseData } = req.body;
    
    console.log('📦 Received purchase data:', { squareId, duration, purchaseData });
    
    // Get price from PRICING configuration
    const amount = PRICING[duration];
    
    if (!amount) {
      return res.status(400).json({ error: 'Invalid duration selected' });
    }
    
    console.log('💳 Creating checkout session for:', { squareId, duration, amount });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `ClickaLinks - Square #${squareId} - ${purchaseData.businessName}`,
              description: `Advertising space for ${duration} days - ${purchaseData.adText || 'Special offer'}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NODE_ENV === 'production' 
        ? `https://www.clickalinks.com/success.html?square=${squareId}&session_id={CHECKOUT_SESSION_ID}`
        : `http://localhost:3000/success.html?square=${squareId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NODE_ENV === 'production'
        ? `https://www.clickalinks.com/checkout.html?square=${squareId}&duration=${duration}`
        : `http://localhost:3000/checkout.html?square=${squareId}&duration=${duration}`,
      metadata: {
        squareId: squareId,
        duration: duration,
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail
      }
    });

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