import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing configuration (same as in server.js)
const PRICING = {
  10: 1000,   // £10.00 for 10 days
  20: 2000,   // £20.00 for 20 days  
  30: 3000    // £30.00 for 30 days
};

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { days } = req.body;
    
    // Validate days parameter
    if (!PRICING.hasOwnProperty(days)) {
      return res.status(400).json({ error: 'Invalid days selection' });
    }
    
    const amount = PRICING[days];
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'gbp',
      metadata: { 
        days: days,
        feature: 'clickalinks_premium'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log(`💰 Payment intent created for ${days} days: £${amount/100}`);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount
    });
    
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;