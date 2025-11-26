/**
 * Test script for shuffle functionality
 * Run this to test if Firebase Admin is properly configured
 */

import dotenv from 'dotenv';
dotenv.config();

import { performGlobalShuffle, getShuffleStats } from './services/shuffleService.js';

async function testShuffle() {
  console.log('🧪 Testing shuffle system...\n');
  
  try {
    // Test 1: Get stats
    console.log('📊 Step 1: Getting shuffle stats...');
    const stats = await getShuffleStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));
    console.log('');
    
    // Test 2: Perform shuffle
    console.log('🔄 Step 2: Performing shuffle...');
    const result = await performGlobalShuffle();
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('');
    
    // Test 3: Get stats after shuffle
    console.log('📊 Step 3: Getting stats after shuffle...');
    const statsAfter = await getShuffleStats();
    console.log('Stats after:', JSON.stringify(statsAfter, null, 2));
    
    if (result.success) {
      console.log('\n✅ Shuffle test PASSED!');
      process.exit(0);
    } else {
      console.log('\n❌ Shuffle test FAILED:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

testShuffle();

