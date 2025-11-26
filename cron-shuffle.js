/**
 * Cron Job Script for Automatic Shuffle
 * This script runs on Render cron job every 1-2 hours
 * Performs global Fisher-Yates shuffle of all active purchases
 * 
 * Usage:
 *   node cron-shuffle.js
 * 
 * Environment Variables Required:
 *   - FIREBASE_SERVICE_ACCOUNT: JSON string of Firebase service account
 *   - ADMIN_SECRET_KEY: Secret key for admin operations (optional for cron)
 */

import { performGlobalShuffle, getShuffleStats } from './services/shuffleService.js';
import dotenv from 'dotenv';

dotenv.config();

async function runCronShuffle() {
  console.log('⏰ Cron shuffle job started at', new Date().toISOString());
  
  try {
    // Get current stats
    const statsBefore = await getShuffleStats();
    console.log('📊 Stats before shuffle:', statsBefore);
    
    // Perform shuffle
    const result = await performGlobalShuffle();
    
    if (result.success) {
      console.log('✅ Cron shuffle completed successfully');
      console.log(`   - Shuffled: ${result.shuffledCount} purchases`);
      console.log(`   - Duration: ${result.duration}ms`);
      
      // Get stats after shuffle
      const statsAfter = await getShuffleStats();
      console.log('📊 Stats after shuffle:', statsAfter);
      
      process.exit(0);
    } else {
      console.error('❌ Cron shuffle failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error in cron shuffle:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCronShuffle();
}

export default runCronShuffle;

