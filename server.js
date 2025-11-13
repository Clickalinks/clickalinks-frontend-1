import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is missing');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
  // Don't exit - let health check show the error
}

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body || 'No body');
  next();
});

// Health check
app.get('/health', (req, res) => {
  const stripeStatus = stripe ? 'Configured' : 'Failed';
  res.json({ 
    status: 'OK', 
    service: 'ClickALinks Backend',
    stripe: stripeStatus,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    stripeSecretKeyExists: !!process.env.STRIPE_SECRET_KEY,
    stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'MISSING',
    stripePublishableKeyExists: !!process.env.STRIPE_PUBLISHABLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ClickALinks Backend API',
    endpoints: ['GET /health', 'POST /api/create-checkout-session']
  });
});

// PAYMENT ENDPOINT - FIXED
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('💳 Payment request received:', req.body);
  
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe not configured - check server environment variables'
    });
  }

  try {
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    // Basic validation
    if (!amount || !businessName || !squareNumber || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { amount, businessName, squareNumber, duration }
      });
    }

    console.log('🔑 Using Stripe key:', process.env.STRIPE_SECRET_KEY?.substring(0, 12) + '...');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `ClickALinks Ad - Square #${squareNumber}`,
              description: `${duration}-day campaign for ${businessName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://clickalinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://clickalinks-frontend.web.app/checkout`,
      customer_email: contactEmail,
      metadata: {
        businessName,
        squareNumber: squareNumber.toString(),
        duration: duration.toString()
      }
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
      error: 'Payment processing failed',
      message: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Backend URL: https://clickalinks-backend.onrender.com`); // ✅ FIXED URL
  console.log(`🔑 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('_live_') ? 'LIVE' : 'TEST'}`);
});