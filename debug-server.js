console.log('🔍 STEP 1: Starting debug...');

import express from 'express';
console.log('🔍 STEP 2: Express imported');

import cors from 'cors';
console.log('🔍 STEP 3: CORS imported');

import dotenv from 'dotenv';
console.log('🔍 STEP 4: dotenv imported');

import Stripe from 'stripe';
console.log('🔍 STEP 5: Stripe imported');

console.log('🔍 STEP 6: Loading environment variables...');
dotenv.config();

console.log('🔍 STEP 7: Checking Stripe key...');
console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('Stripe key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));

try {
  console.log('🔍 STEP 8: Creating Express app...');
  const app = express();
  
  console.log('🔍 STEP 9: Initializing Stripe...');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const PORT = process.env.PORT || 3001;
  console.log('🔍 STEP 10: Port set to:', PORT);

  console.log('🔍 STEP 11: Setting up middleware...');
  app.use(cors({
    origin: ['http://localhost:3000']
  }));
  app.use(express.json());

  console.log('🔍 STEP 12: Setting up routes...');
  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });

  console.log('🔍 STEP 13: Starting server...');
  app.listen(PORT, () => {
    console.log('🎉 SUCCESS: Server is running on port', PORT);
    console.log('✅ Server should NOT exit now!');
  });

} catch (error) {
  console.log('❌ ERROR caught in try-catch:', error.message);
}