import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import FormData from 'form-data';
import { sendAdConfirmationEmail } from './services/emailService.js';
import shuffleRoutes from './routes/shuffle.js';
import promoCodeRoutes from './routes/promoCode.js';

// Load environment variables
dotenv.config();

console.log('🔄 Starting server initialization...');


const app = express();

// 🔍 DEBUG: Check what key is being loaded
console.log('🔑 Environment check:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('Key starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NO KEY');
console.log('Key length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 10000;

// CRITICAL: Handle OPTIONS requests FIRST, before cors() middleware
// This ensures x-api-key header is always allowed in preflight responses
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://clickalinks-frontend.web.app',
    'https://clickalinks-frontend.firebaseapp.com',
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ];
  
  // Set CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // CRITICAL: Explicitly allow x-api-key header (all case variations)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-API-Key, X-API-KEY, x-API-key, X-api-key, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  console.log('🚨 OPTIONS preflight handled:', {
    origin: origin,
    path: req.path,
    requestedHeaders: req.headers['access-control-request-headers'] || ''
  });
  
  return res.status(204).end();
});

// CORS middleware for non-OPTIONS requests
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://clickalinks-frontend.web.app',
    'https://clickalinks-frontend.firebaseapp.com',
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-api-key',
    'X-API-Key',
    'X-API-KEY',
    'x-API-key',
    'X-api-key',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['x-api-key', 'X-API-Key']
}));

console.log('✅ CORS configured: OPTIONS handler + cors() middleware');

// Increase body size limit for logo uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Shuffle admin routes
app.use('/', shuffleRoutes);
console.log('✅ Shuffle routes registered');

// Promo code routes
app.use('/api/promo-code', promoCodeRoutes);
console.log('✅ Promo code routes registered at /api/promo-code');

// Log all registered routes for debugging
app.use((req, res, next) => {
  console.log(`📡 Request: ${req.method} ${req.path}`);
  next();
});

// Test CORS endpoint - for debugging
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test endpoint',
    headers: {
      origin: req.headers.origin,
      'x-api-key': req.headers['x-api-key'] ? 'present' : 'missing'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'ClickaLinks Backend Server is running! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      testCors: '/api/test-cors',
      testStripe: '/api/test-stripe',
      createCheckout: '/api/create-checkout-session',
      checkSession: '/api/check-session/:id',
      purchasedSquares: '/api/purchased-squares',
      sendConfirmationEmail: '/api/send-confirmation-email',
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working! ✅',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test Stripe key endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    console.log('🔑 Testing Stripe key...');
    
    // Try to make a simple Stripe API call
    const balance = await stripe.balance.retrieve();
    
    res.json({
      success: true,
      message: 'Stripe key is VALID! 🎉',
      keyInfo: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        startsWith: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NO KEY',
        length: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0
      },
      balance: {
        available: balance.available[0]?.amount || 0,
        currency: balance.available[0]?.currency || 'gbp'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Stripe key test failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      keyInfo: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        startsWith: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NO KEY',
        length: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('💰 Payment request received from:', req.headers.origin);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      amount, 
      businessName, 
      squareNumber, 
      duration, 
      contactEmail,
      pageNumber = 1,
      website = ''
    } = req.body;

    // Validate required fields
    if (!amount || !squareNumber || !duration || !contactEmail) {
      console.log('❌ Missing required fields:', { amount, squareNumber, duration, contactEmail });
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
          unit_amount: Math.round(amount * 100), // Convert to pence
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`,
      customer_email: contactEmail,
      metadata: {
        squareNumber: squareNumber.toString(),
        pageNumber: pageNumber.toString(),
        duration: duration.toString(),
        contactEmail: contactEmail,
        website: website
      }
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('🔗 Success URL will be:', `https://clickalinks-frontend.web.app/success?session_id=${session.id}`);
    console.log('🔗 Session URL (Stripe):', session.url);
    
    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    console.error('❌ Full error details:', error);
    
    res.status(500).json({ 
      success: false,
      error: error.message,
      keyInfo: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        startsWith: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'NO KEY'
      }
    });
  }
});

// Check session status
app.get('/api/check-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
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
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// In-memory storage (replace with database later)
let purchasedSquaresStorage = {};

// Get purchased squares
app.get('/api/purchased-squares', async (req, res) => {
  try {
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

// Sync purchase to server
app.post('/api/sync-purchase', async (req, res) => {
  try {
    const { squareNumber, purchaseData } = req.body;
    
    purchasedSquaresStorage[squareNumber] = {
      ...purchaseData,
      lastSynced: new Date().toISOString()
    };
    
    // Send confirmation email (non-blocking)
    if (purchaseData.contactEmail && purchaseData.paymentStatus === 'paid') {
      sendAdConfirmationEmail(purchaseData).catch(err => {
        console.warn('⚠️ Email send failed (non-blocking):', err.message);
      });
    }
    
    res.json({
      success: true,
      message: `Purchase for square ${squareNumber} synced to server`
    });
    
  } catch (error) {
    console.error('Error syncing purchase:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send confirmation email endpoint
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const purchaseData = req.body;
    
    if (!purchaseData.contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    const result = await sendAdConfirmationEmail(purchaseData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message || 'Failed to send email'
      });
    }
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to track purchase flow
app.post('/api/debug-purchase', async (req, res) => {
  try {
    const { sessionId, squareNumber, step, data } = req.body;
    console.log('🔍 PURCHASE DEBUG:', {
      sessionId,
      squareNumber, 
      step,
      timestamp: new Date().toISOString(),
      data: data ? `Has logo: ${!!data.logoData}` : 'No data'
    });
    
    res.json({ success: true, logged: true });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Virus scanning endpoint using VirusTotal API
// Requires VIRUSTOTAL_API_KEY in environment variables
app.post('/api/scan-file', async (req, res) => {
  try {
    const { fileData, fileName } = req.body;
    
    if (!fileData) {
      return res.status(400).json({
        success: false,
        safe: false,
        message: 'No file data provided'
      });
    }

    // If VirusTotal API key is not configured, perform basic validation only
    if (!process.env.VIRUSTOTAL_API_KEY) {
      console.log('⚠️ VirusTotal API key not configured, performing basic validation');
      
      // Basic validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const fileType = fileData.split(';')[0].split(':')[1];
      
      if (!validTypes.includes(fileType)) {
        return res.json({
          success: true,
          safe: false,
          message: 'Invalid file type'
        });
      }

      // Check file size (from base64)
      const base64Data = fileData.split(',')[1];
      const fileSize = (base64Data.length * 3) / 4 / 1024 / 1024; // Approximate size in MB
      
      if (fileSize > 2) {
        return res.json({
          success: true,
          safe: false,
          message: 'File size exceeds 2MB limit'
        });
      }

      return res.json({
        success: true,
        safe: true,
        message: 'File passed basic validation (VirusTotal not configured)',
        scanId: `basic-${Date.now()}`
      });
    }

    // VirusTotal API integration
    const formData = new FormData();
    const buffer = Buffer.from(fileData.split(',')[1], 'base64');
    formData.append('file', buffer, fileName);

    const virusTotalResponse = await fetch('https://www.virustotal.com/vtapi/v2/file/scan', {
      method: 'POST',
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY
      },
      body: formData
    });

    if (!virusTotalResponse.ok) {
      throw new Error(`VirusTotal API error: ${virusTotalResponse.statusText}`);
    }

    const scanResult = await virusTotalResponse.json();
    
    // Wait a bit and check scan results
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportResponse = await fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${process.env.VIRUSTOTAL_API_KEY}&resource=${scanResult.resource}`);
    const report = await reportResponse.json();

    if (report.response_code === 1) {
      const positives = report.positives || 0;
      const safe = positives === 0;
      
      return res.json({
        success: true,
        safe: safe,
        message: safe ? 'File is safe' : `File flagged by ${positives} antivirus engines`,
        scanId: scanResult.scan_id,
        positives: positives,
        total: report.total || 0
      });
    }

    // If report not ready, assume safe for now (scan is in progress)
    return res.json({
      success: true,
      safe: true,
      message: 'Scan in progress',
      scanId: scanResult.scan_id
    });

  } catch (error) {
    console.error('❌ Virus scan error:', error);
    // On error, allow upload but log warning
    res.json({
      success: false,
      safe: true, // Allow upload if scan fails
      message: 'Scan service unavailable - upload allowed',
      warning: true
    });
  }
});

// Start server AFTER all routes are defined
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Virus scan endpoint available at: POST /api/scan-file`);
  console.log(`✅ Debug endpoint available at: POST /api/debug-purchase`);
  console.log(`✅ Email confirmation endpoint available at: POST /api/send-confirmation-email`);
  console.log(`✅ Promo code validation available at: POST /api/promo-code/validate`);
  console.log(`✅ Promo code bulk create available at: POST /api/promo-code/bulk-create`);
  console.log(`✅ Shuffle endpoint available at: POST /admin/shuffle`);
  console.log(`✅ Shuffle stats available at: GET /admin/shuffle/stats`);
  
  // Log email configuration status
  if (process.env.SMTP_HOST || process.env.SENDGRID_API_KEY) {
    console.log(`📧 Email service configured: ${process.env.SMTP_HOST || 'SendGrid'}`);
  } else {
    console.warn(`⚠️ Email service not configured - emails will not be sent`);
  }
});