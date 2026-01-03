import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import FormData from 'form-data';
// Initialize Firebase Admin first (before importing services that depend on it)
import './config/firebaseAdmin.js';
import { sendAdConfirmationEmail, sendAdminNotificationEmail, generateInvoiceHTML, sendContactFormEmail } from './services/emailService.js';
import shuffleRoutes from './routes/shuffle.js';
import promoCodeRoutes from './routes/promoCode.js';
import adminRoutes from './routes/admin.js';

// Verify admin routes loaded correctly
console.log('🔍 Admin routes import check:');
console.log('  - Type:', typeof adminRoutes);
console.log('  - Is router:', adminRoutes && typeof adminRoutes.stack !== 'undefined');
console.log('  - Stack length:', adminRoutes?.stack?.length || 'N/A');
import { performGlobalShuffle } from './services/shuffleService.js';
import {
  securityHeaders,
  generalRateLimit,
  promoCodeRateLimit,
  paymentRateLimit,
  adminRateLimit,
  requestTimeout,
  sanitizeError,
  sanitizeLogData
} from './middleware/security.js';
import { validateCheckoutSession, checkValidation } from './middleware/inputValidation.js';

// Load environment variables
dotenv.config();

console.log('🔄 Starting server initialization...');
console.log('🔑 ADMIN_API_KEY check:', process.env.ADMIN_API_KEY ? `SET (${process.env.ADMIN_API_KEY.substring(0, 10)}...)` : 'NOT SET');
console.log('🔍 Checking ADMIN_PASSWORD_HASH...');
console.log('🔍 ADMIN_PASSWORD_HASH exists?', !!process.env.ADMIN_PASSWORD_HASH);
console.log('🔍 ADMIN_PASSWORD_HASH length:', process.env.ADMIN_PASSWORD_HASH?.length || 0);

// CRITICAL: Check for ADMIN_PASSWORD_HASH (required, no plain text fallback)
if (!process.env.ADMIN_PASSWORD_HASH) {
  console.error('❌ CRITICAL: ADMIN_PASSWORD_HASH not set in environment variables');
  console.error('❌ Server cannot start without ADMIN_PASSWORD_HASH');
  console.error('');
  console.error('To generate a password hash:');
  console.error('  const bcrypt = require("bcryptjs");');
  console.error('  const hash = bcrypt.hashSync("your-strong-password", 10);');
  console.error('  console.log(hash);');
  console.error('');
  console.error('Then set ADMIN_PASSWORD_HASH=<hash> in your environment variables');
  process.exit(1);
}
console.log('✅ ADMIN_PASSWORD_HASH is configured');

// Check MFA configuration
if (process.env.ADMIN_MFA_ENABLED === 'true') {
  if (!process.env.ADMIN_MFA_SECRET) {
    console.warn('⚠️ ADMIN_MFA_ENABLED is true but ADMIN_MFA_SECRET is not set');
    console.warn('⚠️ MFA will not work until ADMIN_MFA_SECRET is configured');
  } else {
    console.log('✅ MFA is enabled and configured');
  }
} else {
  console.log('ℹ️ MFA is disabled (set ADMIN_MFA_ENABLED=true to enable)');
}


const app = express();

// CRITICAL: Trust proxy for rate limiting behind Render.com or other proxies
// This allows express-rate-limit to correctly identify users via X-Forwarded-For header
app.set('trust proxy', true);
console.log('✅ Trust proxy enabled (for rate limiting behind proxy)');

// SECURITY: Apply security headers first
app.use(securityHeaders);
console.log('✅ Security headers configured (helmet)');

// SECURITY: Apply request timeout
app.use(requestTimeout);
console.log('✅ Request timeout configured (30 seconds)');

// SECURITY: Apply general rate limiting to all routes
app.use(generalRateLimit);
console.log('✅ General rate limiting configured (100 req/15min)');

// Check Stripe configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Initialize Stripe - handle missing key gracefully
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
  console.warn('⚠️ Stripe functionality will not work until STRIPE_SECRET_KEY is set');
  // Create a dummy stripe object to prevent crashes
  stripe = null;
}
const PORT = process.env.PORT || 10000;

// CRITICAL: Manual CORS handling - NO cors() middleware to avoid conflicts
// Handle ALL requests including OPTIONS preflight
const allowedOrigins = [
  'http://localhost:3000',
  'https://clickalinks-frontend.web.app',
  'https://clickalinks-frontend.firebaseapp.com',
  'https://clickalinks-frontend-1.onrender.com',
  'https://clickalinks.com',  // Custom domain (without www)
  'https://www.clickalinks.com'  // Custom domain (with www)
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // CRITICAL: Handle OPTIONS preflight requests FIRST
  // Must set headers BEFORE checking origin for preflight to work
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight - must include origin if it's allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // CRITICAL: Check what headers the browser is requesting
    const requestedHeaders = req.headers['access-control-request-headers'] || '';
    
    // Build allowed headers list - include x-api-key in lowercase first (most common)
    // Include all case variations to be safe
    const allowedHeadersList = [
      'Content-Type',
      'Authorization', 
      'x-api-key',  // Lowercase - most common
      'X-API-Key',
      'X-API-KEY',
      'x-admin-token',  // Admin authentication token
      'X-Admin-Token',
      'X-ADMIN-TOKEN',
      'Accept',
      'Origin',
      'X-Requested-With'
    ].join(', ');
    
    // CRITICAL: Always set these headers for OPTIONS requests
    // Browser needs these in preflight response to allow the actual request
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', allowedHeadersList);
    res.setHeader('Access-Control-Max-Age', '86400');
    
    console.log('🚨 OPTIONS preflight handled:', {
      origin: origin,
      path: req.path,
      requestedHeaders: requestedHeaders,
      allowedHeaders: allowedHeadersList,
      originAllowed: origin && allowedOrigins.includes(origin)
    });
    
    return res.status(204).end();
  }
  
  // For non-OPTIONS requests, set CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Always set these headers for actual requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-API-Key, X-API-KEY, x-admin-token, X-Admin-Token, X-ADMIN-TOKEN, Accept, Origin, X-Requested-With');
  
  next();
});

console.log('✅ CORS configured: Manual handling (no cors() middleware)');

// SECURITY: Reduced body size limit for most endpoints (1MB)
// Only file upload endpoints will use larger limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
console.log('✅ Body size limit configured (1MB default)');

// Shuffle admin routes
app.use('/', shuffleRoutes);
console.log('✅ Shuffle routes registered');

// Promo code routes
app.use('/api/promo-code', promoCodeRoutes);
console.log('✅ Promo code routes registered at /api/promo-code');

// Admin authentication routes - MUST be before any catch-all routes
console.log('========================================');
console.log('🔍 Registering admin routes...');
console.log('🔍 Admin routes type:', typeof adminRoutes);
console.log('🔍 Admin routes exists?', !!adminRoutes);
console.log('🔍 Admin routes stack exists?', !!(adminRoutes && adminRoutes.stack));
console.log('🔍 Admin routes stack length:', adminRoutes?.stack?.length || 0);
console.log('========================================');

// Add test route directly to verify routing works (BEFORE the router)
app.get('/api/admin/test-direct', (req, res) => {
  console.log('✅ Direct test route hit!');
  res.json({ success: true, message: 'Direct route works!', path: req.path, url: req.url });
});

// Mount admin router
app.use('/api/admin', (req, res, next) => {
  console.log(`🔍 Admin middleware hit: ${req.method} ${req.path} (original: ${req.originalUrl})`);
  console.log(`🔍 Admin middleware - baseUrl: ${req.baseUrl}, route: ${req.route}`);
  next();
}, adminRoutes);
console.log('✅ Admin authentication routes registered at /api/admin');

// Debug: List all registered admin routes
console.log('🔍 Registered admin routes:');
try {
  if (adminRoutes.stack && adminRoutes.stack.length > 0) {
    adminRoutes.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`  ${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        console.log(`  Router: ${middleware.regexp}`);
      } else {
        console.log(`  Middleware: ${middleware.name || 'unnamed'}`);
      }
    });
  } else {
    console.log('  ⚠️ No routes found in adminRoutes.stack');
  }
} catch (error) {
  console.error('❌ Error listing admin routes:', error);
}



// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'ClickALinks Backend Server is running! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
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


// Create Stripe checkout session
// SECURITY: Apply payment-specific rate limiting and input validation
app.post('/api/create-checkout-session', 
  paymentRateLimit,
  validateCheckoutSession,
  checkValidation,
  async (req, res) => {
  try {
    const origin = req.headers.origin || 'unknown';
    console.log('💰 Payment request received from:', origin);
    // SECURITY: Sanitize log data
    const sanitizedBody = sanitizeLogData(req.body);
    console.log('📦 Request body:', JSON.stringify(sanitizedBody, null, 2));
    
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

    // CRITICAL: Reject zero or negative amounts - these should be handled client-side
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      console.log('❌ Invalid amount:', amount, 'Amount must be greater than 0');
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Zero or negative amounts should be processed as free purchases.'
      });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      });
    }
    
    console.log(`🔄 Creating Stripe session for Square #${squareNumber}, Amount: £${amount}`);
    
    // CRITICAL: Normalize FRONTEND_URL to remove www. prefix (Firebase Hosting SSL doesn't support www subdomain)
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Remove www. prefix if present (Firebase Hosting SSL certificates don't cover www subdomain)
    if (frontendUrl.includes('www.clickalinks-frontend.web.app')) {
      frontendUrl = frontendUrl.replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app');
      console.log('⚠️ Removed www. prefix from FRONTEND_URL for SSL compatibility');
    }
    // Ensure https:// for production
    if (frontendUrl.includes('clickalinks-frontend.web.app') && !frontendUrl.startsWith('https://')) {
      frontendUrl = frontendUrl.replace('http://', 'https://');
    }
    
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
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/`,
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
    if (isDevelopment) {
      console.error('❌ Full error details:', error);
    }
    
    res.status(500).json({ 
      success: false,
      error: sanitizeError(error, isDevelopment)
    });
  }
});

// Check session status
app.get('/api/check-session/:sessionId', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      });
    }
    
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
    
    // DO NOT send email here - it's sent from /api/send-confirmation-email endpoint
    // This prevents duplicate emails
    
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

// Test email configuration endpoint (for debugging)
app.get('/api/test-email-config', async (req, res) => {
  try {
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const hasGmail = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN);
    
    const config = {
      sendGrid: {
        configured: hasSendGrid,
        apiKey: hasSendGrid ? 'SET (hidden)' : 'NOT SET'
      },
      smtp: {
        configured: hasSMTP,
        host: process.env.SMTP_HOST || 'NOT SET',
        user: process.env.SMTP_USER || 'NOT SET',
        pass: process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
        port: process.env.SMTP_PORT || '465 (default)',
        secure: process.env.SMTP_SECURE || 'false (default)'
      },
      gmail: {
        configured: hasGmail,
        clientId: process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET',
        refreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'SET (hidden)' : 'NOT SET'
      },
      emailFrom: process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@clickalinks.com',
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'NOT SET'
    };
    
    const hasAnyConfig = hasSendGrid || hasSMTP || hasGmail;
    
    res.json({
      success: hasAnyConfig,
      configured: hasAnyConfig,
      message: hasAnyConfig ? 'Email service is configured' : '⚠️ NO EMAIL SERVICE CONFIGURED',
      config: config,
      recommendation: hasAnyConfig 
        ? 'Email service is configured. Check logs for sending errors.' 
        : 'Please configure SMTP_HOST, SMTP_USER, SMTP_PASS in Render environment variables.'
    });
  } catch (error) {
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
    
    console.log('📧 Email endpoint called with data:', {
      hasEmail: !!purchaseData.contactEmail,
      businessName: purchaseData.businessName,
      squareNumber: purchaseData.squareNumber,
      finalAmount: purchaseData.finalAmount,
      promoCode: purchaseData.promoCode,
      transactionId: purchaseData.transactionId
    });
    
    if (!purchaseData.contactEmail) {
      console.error('❌ Email endpoint: Missing contactEmail');
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }
    
    // Send customer confirmation email
    const result = await sendAdConfirmationEmail(purchaseData);
    
    // Send admin notification email (non-blocking but with better error handling)
    console.log('📧 Attempting to send admin notification email...');
    console.log('📧 Purchase data for admin notification:', {
      businessName: purchaseData.businessName,
      contactEmail: purchaseData.contactEmail,
      squareNumber: purchaseData.squareNumber,
      pageNumber: purchaseData.pageNumber,
      selectedDuration: purchaseData.selectedDuration,
      originalAmount: purchaseData.originalAmount,
      discountAmount: purchaseData.discountAmount,
      finalAmount: purchaseData.finalAmount,
      transactionId: purchaseData.transactionId,
      promoCode: purchaseData.promoCode
    });
    
    // FIXED: Call with only purchaseData parameter
    sendAdminNotificationEmail(purchaseData)
      .then(adminResult => {
        if (adminResult.success) {
          console.log('✅ Admin notification email sent successfully:', adminResult.messageId);
          console.log('✅ Email sent to: ads@clickalinks.com');
        } else {
          console.error('❌ Admin notification email failed:', adminResult.message || adminResult.error);
          console.error('❌ Error details:', adminResult.error);
          console.error('❌ This is likely due to SMTP authentication issues.');
          console.error('❌ Check IONOS control panel: Enable SMTP sending for ads@clickalinks.com');
          console.error('❌ Verify SMTP_PASS in Render.com matches email account password');
          console.error('❌ See IONOS_SMTP_FIX.md for detailed troubleshooting steps');
        }
      })
      .catch(err => {
        console.error('❌ Admin notification email error:', err.message);
        console.error('❌ Error code:', err.code);
        console.error('❌ Error response:', err.response);
        console.error('❌ Error command:', err.command);
        console.error('❌ Admin notification error stack:', err.stack);
        console.error('❌ Admin notification error details:', JSON.stringify(err, null, 2));
        console.error('🔧 TROUBLESHOOTING:');
        console.error('   1. Check IONOS control panel - enable SMTP sending');
        console.error('   2. Verify SMTP credentials in Render.com');
        console.error('   3. Check IONOS_SMTP_FIX.md for solutions');
      });
    
    if (result.success) {
      console.log('✅ Email endpoint: Both emails sent successfully');
      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
      });
    } else {
      console.error('❌ Email endpoint: Customer email failed:', result.error || result.message);
      res.status(500).json({
        success: false,
        error: result.message || 'Failed to send email',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Email endpoint error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message
    });
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

// Invoice view endpoint (for viewing in browser)
app.get('/api/invoice/view', async (req, res) => {
  try {
    const {
      tx: transactionId,
      inv: invoiceNumber,
      businessName,
      contactEmail,
      squareNumber,
      pageNumber,
      duration,
      originalAmount,
      discountAmount,
      finalAmount,
      promoCode,
      website
    } = req.query;

    console.log('📄 Invoice view requested:', {
      transactionId,
      invoiceNumber,
      businessName,
      squareNumber
    });

    // Use default values if not provided (for testing/preview)
    const purchaseData = {
      businessName: businessName || 'Sample Business',
      contactEmail: contactEmail || 'sample@example.com',
      squareNumber: parseInt(squareNumber) || 1,
      pageNumber: parseInt(pageNumber) || 1,
      selectedDuration: parseInt(duration) || 30,
      originalAmount: parseFloat(originalAmount) || 30,
      discountAmount: parseFloat(discountAmount) || 0,
      finalAmount: parseFloat(finalAmount) || 30,
      transactionId: transactionId || 'TEST-' + Date.now(),
      promoCode: promoCode || null,
      website: website || ''
    };

    // Generate invoice number if not provided
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      finalInvoiceNumber = `INV-${dateStr}-${random}`;
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(purchaseData, finalInvoiceNumber);

    // Set headers for HTML viewing (not download)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // Send invoice HTML for viewing
    res.send(invoiceHTML);

    console.log('✅ Invoice viewed:', finalInvoiceNumber);

  } catch (error) {
    console.error('❌ Error generating invoice view:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>Error</h1>
          <p>Failed to generate invoice view.</p>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Invoice download endpoint
app.get('/api/invoice/download', async (req, res) => {
  try {
    const {
      tx: transactionId,
      inv: invoiceNumber,
      businessName,
      contactEmail,
      squareNumber,
      pageNumber,
      duration,
      originalAmount,
      discountAmount,
      finalAmount,
      promoCode,
      website
    } = req.query;

    console.log('📄 Invoice download requested:', {
      transactionId,
      invoiceNumber,
      businessName,
      squareNumber
    });

    // Validate required fields
    if (!transactionId && !invoiceNumber) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Invoice Not Found</h1>
            <p>Transaction ID or Invoice Number is required.</p>
          </body>
        </html>
      `);
    }

    // Prepare purchase data for invoice generation
    const purchaseData = {
      businessName: businessName || 'N/A',
      contactEmail: contactEmail || '',
      squareNumber: parseInt(squareNumber) || 1,
      pageNumber: parseInt(pageNumber) || 1,
      selectedDuration: parseInt(duration) || 30,
      originalAmount: parseFloat(originalAmount) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      finalAmount: parseFloat(finalAmount) || 0,
      transactionId: transactionId || '',
      promoCode: promoCode || null,
      website: website || ''
    };

    // Generate invoice number if not provided (deterministic from transactionId)
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber && transactionId) {
      // Generate deterministic invoice number from transactionId
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      // Use a hash of transactionId for consistency
      const hash = transactionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const random = hash.toString(36).substring(0, 5).toUpperCase();
      finalInvoiceNumber = `INV-${dateStr}-${random}`;
    } else if (!finalInvoiceNumber) {
      // Fallback: generate random invoice number
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      finalInvoiceNumber = `INV-${dateStr}-${random}`;
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(purchaseData, finalInvoiceNumber);

    // Set headers for HTML file download
    const fileName = `Invoice-${finalInvoiceNumber}.html`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Send invoice HTML
    res.send(invoiceHTML);

    console.log('✅ Invoice downloaded:', fileName);

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>Error Generating Invoice</h1>
          <p>An error occurred while generating your invoice. Please contact support.</p>
          <p style="color: #666; font-size: 12px;">${isDevelopment ? error.message : 'Error ID: ' + Date.now()}</p>
        </body>
      </html>
    `);
  }
});

// Contact form endpoint
app.post('/api/contact', 
  generalRateLimit,
  async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      console.log('📧 Contact form submission received:', {
        name: name.substring(0, 20) + '...',
        email: email,
        subject: subject.substring(0, 30) + '...'
      });

      // Send email to support team
      const result = await sendContactFormEmail({ name, email, subject, message });

      if (result.success) {
        res.json({
          success: true,
          message: 'Your message has been sent successfully! We will get back to you soon.'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to send message. Please try again later.'
        });
      }
    } catch (error) {
      console.error('❌ Contact form error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred while sending your message. Please try again later.'
      });
    }
  }
);

// ============================================
// AUTO-SHUFFLE SCHEDULER
// ============================================
// Automatically shuffle squares every 2 hours
// This runs server-side, independent of frontend activity
const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

let shuffleIntervalId = null;
let isShuffling = false; // Prevent concurrent shuffles

/**
 * Calculate time until next shuffle based on 2-hour periods
 * Shuffles happen at: 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00
 */
function getTimeUntilNextShuffle() {
  const now = Date.now();
  const currentPeriod = Math.floor(now / SHUFFLE_INTERVAL);
  const nextShuffleTime = (currentPeriod + 1) * SHUFFLE_INTERVAL;
  return Math.max(0, nextShuffleTime - now);
}

/**
 * Perform automatic shuffle
 * This runs every 2 hours automatically
 */
async function performAutoShuffle() {
  // Prevent concurrent shuffles
  if (isShuffling) {
    console.log('⏭️ Shuffle already in progress, skipping...');
    return;
  }

  isShuffling = true;
  const startTime = Date.now();
  
  try {
    console.log('🔄 [AUTO-SHUFFLE] Starting automatic shuffle...');
    console.log(`🕐 [AUTO-SHUFFLE] Time: ${new Date().toISOString()}`);
    
    const result = await performGlobalShuffle();
    
    const duration = Date.now() - startTime;
    console.log(`✅ [AUTO-SHUFFLE] Completed successfully in ${duration}ms`);
    console.log(`📊 [AUTO-SHUFFLE] Shuffled ${result.shuffledCount || 0} squares`);
    console.log(`🌱 [AUTO-SHUFFLE] Seed used: ${result.seed || 'N/A'}`);
    
  } catch (error) {
    console.error('❌ [AUTO-SHUFFLE] Error during automatic shuffle:', error);
    console.error('❌ [AUTO-SHUFFLE] Error details:', error.message);
    console.error('❌ [AUTO-SHUFFLE] Stack:', error.stack);
  } finally {
    isShuffling = false;
  }
}

/**
 * Initialize auto-shuffle scheduler
 * Calculates time until next 2-hour boundary and schedules accordingly
 */
function initializeAutoShuffle() {
  // Calculate time until next shuffle
  const timeUntilNext = getTimeUntilNextShuffle();
  const nextShuffleDate = new Date(Date.now() + timeUntilNext);
  
  console.log('⏰ [AUTO-SHUFFLE] Initializing automatic shuffle scheduler...');
  console.log(`⏰ [AUTO-SHUFFLE] Next shuffle in: ${Math.floor(timeUntilNext / 1000 / 60)} minutes`);
  console.log(`⏰ [AUTO-SHUFFLE] Next shuffle at: ${nextShuffleDate.toISOString()}`);
  console.log(`⏰ [AUTO-SHUFFLE] Shuffle interval: Every 2 hours`);
  
  // Schedule first shuffle at the next 2-hour boundary
  setTimeout(() => {
    // Perform first shuffle
    performAutoShuffle().catch(err => {
      console.error('❌ [AUTO-SHUFFLE] Error in initial shuffle:', err);
    });
    
    // Then set up recurring interval
    shuffleIntervalId = setInterval(() => {
      performAutoShuffle().catch(err => {
        console.error('❌ [AUTO-SHUFFLE] Error in scheduled shuffle:', err);
      });
    }, SHUFFLE_INTERVAL);
    
    console.log('✅ [AUTO-SHUFFLE] Scheduler initialized and running');
  }, timeUntilNext);
}

// Start server AFTER all routes are defined
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Virus scan endpoint available at: POST /api/scan-file`);
  console.log(`✅ Email confirmation endpoint available at: POST /api/send-confirmation-email`);
  console.log(`✅ Contact form endpoint available at: POST /api/contact`);
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
  
  // Initialize auto-shuffle scheduler
  initializeAutoShuffle();
});