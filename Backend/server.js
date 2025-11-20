import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 10000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://clickalinks-frontend.web.app',
    'https://clickalinks-frontend.firebaseapp.com',
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running with FIXED CORS!',
    timestamp: new Date().toISOString(),
    frontend: 'https://clickalinks-frontend.web.app'
  });
});

// ✅ TEST CORS ENDPOINT
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS IS WORKING! 🎉',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// ✅ CHECK SESSION ENDPOINT (ADD THIS)
app.get('/api/check-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('🔍 Checking session:', sessionId);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        metadata: session.metadata
      }
    });
    
  } catch (error) {
    console.error('❌ Session check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ STRIPE PAYMENT ENDPOINT (UPDATED - NO DEAL DESCRIPTION)
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('💰 Payment request received from:', req.headers.origin);
    
    const { 
      amount, 
      businessName, 
      squareNumber, 
      duration, 
      contactEmail,
      pageNumber = 1,
      website = ''
      // Removed dealDescription
    } = req.body;

    // Validate required fields
    if (!amount || !squareNumber || !duration || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log(`🔄 Creating Stripe session for Square #${squareNumber}, Amount: £${amount}`);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `ClickALinks - Square #${squareNumber}`,
            description: `${duration} days advertising campaign`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://clickalinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://clickalinks-frontend.web.app/',
      customer_email: contactEmail,
      metadata: {
        squareNumber: squareNumber.toString(),
        pageNumber: pageNumber.toString(),
        duration: duration.toString(),
        contactEmail: contactEmail,
        website: website
        // Removed dealDescription from metadata
      }
    });

    console.log('✅ Stripe session created:', session.id);
    
    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      message: 'Redirect to Stripe Checkout'
    });
    
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for: clickalinks-frontend.web.app`);
});

// ✅ GET PURCHASED SQUARES ENDPOINT
app.get('/api/purchased-squares', async (req, res) => {
  try {
    // In a real app, you'd fetch from a database
    // For now, we'll return a sample response
    res.json({
      success: true,
      purchases: {},
      message: 'Backend connected but no database setup yet'
    });
  } catch (error) {
    console.error('Error fetching purchased squares:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// Simple in-memory storage (replace with database later)
let purchasedSquaresStorage = {};

// ✅ GET ALL PURCHASED SQUARES
app.get('/api/purchased-squares', async (req, res) => {
  try {
    console.log('📡 Fetching purchased squares from server storage');
    res.json({
      success: true,
      purchases: purchasedSquaresStorage,
      count: Object.keys(purchasedSquaresStorage).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching purchased squares:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ SYNC PURCHASE TO SERVER
app.post('/api/sync-purchase', async (req, res) => {
  try {
    const { squareNumber, purchaseData } = req.body;
    
    console.log(`💾 Syncing purchase for square ${squareNumber} to server`);
    
    purchasedSquaresStorage[squareNumber] = {
      ...purchaseData,
      lastSynced: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: `Purchase for square ${squareNumber} synced to server`,
      totalSquares: Object.keys(purchasedSquaresStorage).length
    });
    
  } catch (error) {
    console.error('Error syncing purchase:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});