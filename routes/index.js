import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Fixed Stripe initialization with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is missing');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('Stripe initialization failed:', error.message);
}

// Stripe payment intent endpoint
router.post('/create-payment-intent', async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe not configured - check server logs'
    });
  }

  try {
    const { amount, currency = 'gbp' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;