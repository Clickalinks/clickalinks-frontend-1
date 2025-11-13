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
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ],
  credentials: true
}));

// Middleware
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/create-checkout-session', async (req, res) => {
  console.log('🔄 Creating checkout session...', req.body);
  
  try {
    const { amount, businessName, squareNumber, duration, contactEmail, currency = 'gbp' } = req.body;

    console.log('💰 Amount:', amount);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `ClickALinks Ad - Square #${squareNumber}`,
              description: `${duration}-day campaign for ${businessName}`,
            },
            unit_amount: amount * 100, // Convert to pennies
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://www.clickalinks.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.clickalinks.com/checkout`,
      customer_email: contactEmail,
      metadata: {
        businessName: businessName,
        squareNumber: squareNumber,
        duration: duration
      }
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('🔗 Checkout URL:', session.url); // ADD THIS LINE
    
    // Make sure you're returning the URL, not sessionId
    res.json({ url: session.url });
    
  } catch (error) {
    console.error('❌ Checkout session error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});