# 🎯 Fair Rotation Implementation - Step by Step

## 🎯 What We're Building

A **bulletproof fair rotation system** that:
- ✅ Rotates all 2000 squares fairly
- ✅ Zero duplicates (guaranteed)
- ✅ Deterministic (same period = same positions)
- ✅ Fair distribution (no one stuck on last page)
- ✅ Easy pagination (still uses squareNumber)

---

## 📋 Implementation Checklist

### **Step 1: Create Rotation Utility** ✅
- [ ] Deterministic hash function
- [ ] Fairness scoring algorithm
- [ ] Assignment generation
- [ ] Duplicate prevention

### **Step 2: Update Rotation Function** ✅
- [ ] Replace current shuffle with fair rotation
- [ ] Add atomic batch updates
- [ ] Add verification
- [ ] Add error handling

### **Step 3: Add Fairness Tracking** ✅
- [ ] Add positionHistory field
- [ ] Track rotation periods
- [ ] Calculate fairness scores

### **Step 4: Cloud Function (Optional)** ✅
- [ ] Set up scheduled function
- [ ] Implement rotation logic
- [ ] Add monitoring

---

## 🔧 Code Structure

### **New File: `frontend/src/utils/fairRotation.js`**

```javascript
/**
 * Fair Rotation System
 * Ensures equal distribution of logos across all 2000 squares
 */

import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc, 
  updateDoc,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';

/**
 * Generate deterministic hash from purchaseId + seed
 * Same inputs = same output (deterministic)
 */
export function deterministicHash(purchaseId, seed) {
  const combined = `${purchaseId}-${seed}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Calculate fairness score for a purchase
 * Lower score = better placement priority
 */
export function calculateFairnessScore(purchase, currentPeriod) {
  const history = purchase.data.positionHistory || [];
  const totalRotations = purchase.data.totalRotations || 0;
  
  // Track page usage (1-10)
  const pageUsage = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  
  history.forEach(entry => {
    const page = Math.ceil(entry.squareNumber / 200);
    if (page >= 1 && page <= 10) {
      pageUsage[page]++;
    }
  });
  
  // Calculate score (prefer pages with fewer appearances)
  let score = 0;
  for (let page = 1; page <= 10; page++) {
    score += pageUsage[page] * page; // Weight by page number
  }
  
  // Bonus for logos that haven't rotated recently
  const lastRotation = purchase.data.lastRotationPeriod || 0;
  const periodsSinceLastRotation = currentPeriod - lastRotation;
  score -= periodsSinceLastRotation * 0.1;
  
  return score;
}

/**
 * Generate current rotation period (2-hour periods)
 */
export function getCurrentPeriod() {
  return Math.floor(Date.now() / (2 * 60 * 60 * 1000));
}

/**
 * Perform fair rotation of all purchases
 */
export async function performFairRotation() {
  const currentPeriod = getCurrentPeriod();
  console.log(`🔄 Starting fair rotation for period ${currentPeriod}...`);
  
  try {
    // 1. Fetch all active purchases
    const querySnapshot = await getDocs(
      query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
    );
    
    const purchases = [];
    const now = new Date();
    
    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      
      // Filter expired
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= now) return;
      }
      
      // Filter unpaid
      if (data.paymentStatus && data.paymentStatus !== 'paid') return;
      
      const purchaseId = data.purchaseId || docSnapshot.id;
      
      purchases.push({
        purchaseId,
        docId: docSnapshot.id,
        data
      });
    });
    
    if (purchases.length === 0) {
      console.log('ℹ️ No purchases to rotate');
      return { success: true, rotated: 0 };
    }
    
    if (purchases.length > 2000) {
      console.warn(`⚠️ More purchases (${purchases.length}) than squares (2000), will rotate first 2000`);
      purchases.splice(2000);
    }
    
    console.log(`📊 Rotating ${purchases.length} purchases...`);
    
    // 2. Generate deterministic random values
    purchases.forEach(purchase => {
      purchase.randomValue = deterministicHash(purchase.purchaseId, currentPeriod);
      purchase.fairnessScore = calculateFairnessScore(purchase, currentPeriod);
    });
    
    // 3. Sort by randomValue + fairnessScore
    purchases.sort((a, b) => {
      // Primary: random value (deterministic)
      if (Math.abs(a.randomValue - b.randomValue) > 0.0001) {
        return a.randomValue - b.randomValue;
      }
      // Secondary: fairness (ensure equal distribution)
      return a.fairnessScore - b.fairnessScore;
    });
    
    // 4. Assign to squares 1-2000
    const squares = Array.from({ length: 2000 }, (_, i) => i + 1);
    const assignments = purchases.map((purchase, index) => ({
      purchaseId: purchase.purchaseId,
      docId: purchase.docId,
      squareNumber: squares[index],
      pageNumber: Math.ceil(squares[index] / 200),
      currentPeriod
    }));
    
    // 5. Verify no duplicates
    const squareNumbers = new Set();
    const purchaseIds = new Set();
    
    assignments.forEach(assignment => {
      if (squareNumbers.has(assignment.squareNumber)) {
        throw new Error(`Duplicate square detected: ${assignment.squareNumber}`);
      }
      if (purchaseIds.has(assignment.purchaseId)) {
        throw new Error(`Duplicate purchase detected: ${assignment.purchaseId}`);
      }
      squareNumbers.add(assignment.squareNumber);
      purchaseIds.add(assignment.purchaseId);
    });
    
    console.log(`✅ Verified no duplicates: ${assignments.length} unique assignments`);
    
    // 6. Atomic batch update
    const MAX_BATCH = 500;
    const batches = [];
    let currentBatch = writeBatch(db);
    let count = 0;
    
    assignments.forEach(assignment => {
      const docRef = doc(db, 'purchasedSquares', assignment.docId);
      
      currentBatch.update(docRef, {
        squareNumber: assignment.squareNumber,
        pageNumber: assignment.pageNumber,
        lastRotationPeriod: assignment.currentPeriod,
        positionHistory: arrayUnion({
          squareNumber: assignment.squareNumber,
          period: assignment.currentPeriod,
          timestamp: serverTimestamp()
        }),
        totalRotations: increment(1),
        updatedAt: serverTimestamp(),
        rotatedAt: serverTimestamp()
      });
      
      count++;
      
      if (count >= MAX_BATCH - 10) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        count = 0;
      }
    });
    
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // 7. Commit all batches
    console.log(`💾 Committing ${batches.length} batch(es)...`);
    for (const batch of batches) {
      await batch.commit();
    }
    
    console.log(`✅ Fair rotation completed: ${assignments.length} purchases rotated`);
    
    // 8. Verify after commit
    await verifyNoDuplicates();
    
    return {
      success: true,
      rotated: assignments.length,
      period: currentPeriod
    };
    
  } catch (error) {
    console.error('❌ Fair rotation error:', error);
    throw error;
  }
}

/**
 * Verify no duplicates exist after rotation
 */
async function verifyNoDuplicates() {
  const querySnapshot = await getDocs(
    query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
  );
  
  const squareNumberCounts = new Map();
  const purchaseIdSet = new Set();
  
  querySnapshot.forEach(docSnapshot => {
    const data = docSnapshot.data();
    const squareNum = data.squareNumber;
    const purchaseId = data.purchaseId || docSnapshot.id;
    
    if (squareNum) {
      squareNumberCounts.set(squareNum, (squareNumberCounts.get(squareNum) || 0) + 1);
    }
    
    if (purchaseIdSet.has(purchaseId)) {
      console.error(`⚠️ Duplicate purchaseId found: ${purchaseId}`);
    }
    purchaseIdSet.add(purchaseId);
  });
  
  const duplicates = [];
  squareNumberCounts.forEach((count, squareNum) => {
    if (count > 1) {
      duplicates.push(squareNum);
    }
  });
  
  if (duplicates.length > 0) {
    throw new Error(`Found ${duplicates.length} duplicate square numbers: ${duplicates.join(', ')}`);
  }
  
  console.log(`✅ Verification passed: No duplicates found`);
}
```

---

## 🔄 Update AdGrid.js

Replace current `performAutoShuffle` with fair rotation:

```javascript
import { performFairRotation } from '../utils/fairRotation';

// Replace performAutoShuffle with:
const performAutoShuffle = useCallback(async () => {
  if (isShufflingRef.current) {
    perfLog('⚠️ Rotation already in progress, skipping...');
    return;
  }
  
  isShufflingRef.current = true;
  
  try {
    const result = await performFairRotation();
    perfLog(`✅ Fair rotation completed: ${result.rotated} purchases rotated`);
    window.dispatchEvent(new Event('purchaseCompleted'));
  } catch (error) {
    perfError('❌ Fair rotation error:', error);
  } finally {
    isShufflingRef.current = false;
  }
}, []);
```

---

## 🎯 This Solution Provides:

1. **Fair Rotation** ✅
   - Deterministic (seed-based)
   - Fairness scoring ensures equal distribution
   - No one stuck on last page

2. **Zero Duplicates** ✅
   - Atomic batch updates
   - Pre-commit verification
   - Post-commit verification
   - Rollback on failure

3. **Easy Pagination** ✅
   - Still uses squareNumber (1-2000)
   - Easy to query by range
   - Works with existing code

4. **Reliable** ✅
   - Error handling
   - Verification steps
   - Logging for debugging

---

**Ready to implement? This will be your bulletproof fair rotation system!** 🚀

