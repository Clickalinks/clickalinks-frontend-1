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
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
  process.exit(1);
}

// CORS - Allow everything temporarily to isolate the issue
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body || 'No body');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'ClickALinks Backend',
    stripe: 'Configured',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ClickALinks Backend API',
    endpoints: ['GET /health', 'POST /api/create-checkout-session']
  });
});

// PAYMENT ENDPOINT - SIMPLIFIED AND ROBUST
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('💳 Payment request received:', req.body);
  
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
            unit_amount: Math.round(amount * 100), // Convert to pennies
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://clickanlinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://clickanlinks-frontend.web.app/checkout`,
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

// Error handler
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Backend URL: https://clickalinks-backend-1.onrender.com`);
  console.log(`🔑 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('_live_') ? 'LIVE' : 'TEST'}`);
});