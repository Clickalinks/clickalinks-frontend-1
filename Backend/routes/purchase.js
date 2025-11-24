const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY_NEW);

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { squareNumber, duration, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Advertising Square #${squareNumber}`,
              description: `${duration} days of advertising`
            },
            unit_amount: amount, // in pennies (e.g., £10 = 1000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://clickanlinks-frontend.web.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://clickanlinks-frontend.web.app'}/purchase`,
      metadata: {
        squareNumber: squareNumber,
        duration: duration
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;