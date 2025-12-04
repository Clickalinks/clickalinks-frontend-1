/**
 * Test Global Shuffle
 * Verifies that the shuffle works across ALL 2000 squares, not just 200 per page
 */

import { performGlobalShuffle } from '../services/shuffleService.js';

async function testGlobalShuffle() {
  console.log('🧪 Testing Global Shuffle (All 2000 Squares)...\n');
  
  try {
    const result = await performGlobalShuffle();
    
    console.log('\n📊 SHUFFLE RESULTS:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Shuffled Count: ${result.shuffledCount}`);
    console.log(`   Duration: ${result.duration}ms`);
    
    if (result.pageDistribution) {
      console.log('\n🌍 PAGE DISTRIBUTION (Should show purchases across multiple pages):');
      const pages = Object.keys(result.pageDistribution).map(Number).sort((a, b) => a - b);
      pages.forEach(page => {
        console.log(`   Page ${page}: ${result.pageDistribution[page]} purchases`);
      });
      
      const pageSpread = pages.length;
      console.log(`\n✅ Global Shuffle Verification:`);
      console.log(`   Pages with purchases: ${pageSpread} out of 10 pages`);
      if (pageSpread > 1) {
        console.log(`   ✅ CONFIRMED: Purchases distributed across ${pageSpread} pages (GLOBAL SHUFFLE)`);
      } else {
        console.log(`   ⚠️ WARNING: Only ${pageSpread} page(s) have purchases - may indicate page-by-page shuffling`);
      }
    }
    
    if (result.page10Count !== undefined) {
      console.log(`\n📄 Page 10: ${result.page10Count} purchases`);
    }
    
    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing shuffle:', error);
    process.exit(1);
  }
}

testGlobalShuffle();

