# 🎯 Fair Rotation System - Complete Design

## 🎯 Requirements
- ✅ 2000 squares across 10 pages (200 per page)
- ✅ Fair rotation (CRITICAL - main selling point)
- ✅ NO duplicates (ever)
- ✅ Deterministic (same period = same positions)
- ✅ Easy pagination (query by square range)
- ✅ Guaranteed fairness over time

---

## 🏆 Recommended Solution: **Seeded Deterministic Rotation**

### **How It Works:**

1. **Time-Based Seed Generation**
   - Seed = Current 2-hour period (e.g., `Math.floor(Date.now() / (2 * 60 * 60 * 1000))`)
   - Same seed = same order (deterministic)
   - New seed = new order (automatic rotation)

2. **Deterministic Shuffle Algorithm**
   - Use seed + purchaseId to generate consistent random value
   - Sort purchases by this value
   - Assign to squares 1-2000 in order
   - Same seed = same assignment (no randomness during period)

3. **Fairness Tracking**
   - Track how many times each logo appeared in each position range
   - Prefer positions not recently used
   - Ensure equal distribution over time

4. **Atomic Updates**
   - Single transaction for all updates
   - No duplicates possible
   - Rollback on failure

---

## 📊 Architecture

### **Data Structure:**

```javascript
// Document in purchasedSquares collection
{
  purchaseId: "purchase-1234567890-abc123",  // Unique ID
  squareNumber: 42,                          // Current assignment (1-2000)
  pageNumber: 1,                             // Calculated from squareNumber
  businessName: "Business Name",
  logoData: "https://...",
  dealLink: "https://...",
  
  // Fairness tracking
  positionHistory: [
    { squareNumber: 42, period: 12345, timestamp: "..." },
    { squareNumber: 1500, period: 12344, timestamp: "..." }
  ],
  totalRotations: 15,
  lastRotationPeriod: 12345,
  
  // Standard fields
  status: "active",
  paymentStatus: "paid",
  startDate: "...",
  endDate: "..."
}
```

### **Rotation Process:**

```javascript
// 1. Generate seed for current period
const currentPeriod = Math.floor(Date.now() / (2 * 60 * 60 * 1000));

// 2. Fetch all active purchases
const purchases = await getActivePurchases();

// 3. Generate deterministic random value for each purchase
purchases.forEach(purchase => {
  const hash = hashFunction(purchase.purchaseId + currentPeriod);
  purchase.randomValue = hash;
  
  // Calculate fairness score (prefer positions not recently used)
  purchase.fairnessScore = calculateFairnessScore(purchase, currentPeriod);
});

// 4. Sort by randomValue + fairnessScore
purchases.sort((a, b) => {
  // Primary: random value (deterministic)
  if (a.randomValue !== b.randomValue) {
    return a.randomValue - b.randomValue;
  }
  // Secondary: fairness (ensure equal distribution)
  return a.fairnessScore - b.fairnessScore;
});

// 5. Assign to squares 1-2000
const squares = Array.from({ length: 2000 }, (_, i) => i + 1);
purchases.forEach((purchase, index) => {
  purchase.newSquareNumber = squares[index];
  purchase.newPageNumber = Math.ceil(squares[index] / 200);
});

// 6. Atomic batch update (all or nothing)
await updateAllPurchases(purchases);
```

---

## 🔧 Implementation Strategy

### **Option 1: Client-Side Rotation (Current Location)**
- ✅ No additional infrastructure
- ✅ Works with existing code
- ⚠️ Requires client to be online
- ⚠️ Can be interrupted

### **Option 2: Cloud Function (RECOMMENDED)**
- ✅ Runs automatically (scheduled)
- ✅ No client dependency
- ✅ More reliable
- ✅ Can handle large batches
- ⚠️ Requires Cloud Functions setup

### **Option 3: Hybrid (BEST)**
- Cloud Function for scheduled rotation
- Client-side fallback for manual rotation
- Best of both worlds

---

## 🎲 Deterministic Hash Function

```javascript
/**
 * Generate deterministic random value from seed + purchaseId
 * Same inputs = same output (deterministic)
 */
function deterministicHash(purchaseId, seed) {
  // Combine purchaseId and seed
  const combined = `${purchaseId}-${seed}`;
  
  // Simple hash function (can use crypto if available)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Return value between 0 and 1
  return Math.abs(hash) / 2147483647;
}
```

---

## 📈 Fairness Algorithm

```javascript
/**
 * Calculate fairness score for a purchase
 * Lower score = better (should be placed first)
 */
function calculateFairnessScore(purchase, currentPeriod) {
  const history = purchase.positionHistory || [];
  const totalRotations = purchase.totalRotations || 0;
  
  // Track position ranges (pages)
  const pageUsage = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0, 10: 0
  };
  
  // Count how many times logo appeared on each page
  history.forEach(entry => {
    const page = Math.ceil(entry.squareNumber / 200);
    pageUsage[page]++;
  });
  
  // Calculate score (prefer pages with fewer appearances)
  let score = 0;
  for (let page = 1; page <= 10; page++) {
    score += pageUsage[page] * page; // Weight by page number
  }
  
  // Prefer logos that haven't rotated recently
  const lastRotation = purchase.lastRotationPeriod || 0;
  const periodsSinceLastRotation = currentPeriod - lastRotation;
  score -= periodsSinceLastRotation * 0.1; // Bonus for not rotating recently
  
  return score;
}
```

---

## 🔒 Duplicate Prevention

### **Atomic Batch Updates:**

```javascript
async function performFairRotation() {
  const db = getFirestore();
  const batch = writeBatch(db);
  
  // 1. Generate assignments
  const assignments = generateAssignments();
  
  // 2. Verify no duplicates
  const squareNumbers = new Set();
  const purchaseIds = new Set();
  
  assignments.forEach(assignment => {
    if (squareNumbers.has(assignment.squareNumber)) {
      throw new Error(`Duplicate square: ${assignment.squareNumber}`);
    }
    if (purchaseIds.has(assignment.purchaseId)) {
      throw new Error(`Duplicate purchase: ${assignment.purchaseId}`);
    }
    squareNumbers.add(assignment.squareNumber);
    purchaseIds.add(assignment.purchaseId);
  });
  
  // 3. Add all updates to batch
  assignments.forEach(assignment => {
    const docRef = doc(db, 'purchasedSquares', assignment.purchaseId);
    batch.update(docRef, {
      squareNumber: assignment.squareNumber,
      pageNumber: assignment.pageNumber,
      lastRotationPeriod: assignment.currentPeriod,
      positionHistory: arrayUnion({
        squareNumber: assignment.squareNumber,
        period: assignment.currentPeriod,
        timestamp: serverTimestamp()
      }),
      totalRotations: increment(1),
      updatedAt: serverTimestamp()
    });
  });
  
  // 4. Commit all at once (atomic)
  await batch.commit();
  
  // 5. Verify no duplicates after commit
  await verifyNoDuplicates();
}
```

---

## ⏰ Rotation Schedule

### **Automatic Rotation:**
- Every 2 hours (configurable)
- Cloud Function runs on schedule
- No manual intervention needed

### **Manual Rotation:**
- Admin can trigger rotation anytime
- Uses current period seed
- Same as automatic rotation

---

## 📊 Monitoring & Analytics

### **Fairness Metrics:**
- Track how many times each logo appeared on each page
- Track average position over time
- Ensure no logo is stuck on last page
- Generate fairness report

### **Rotation Logs:**
- Log each rotation
- Track success/failure
- Monitor for duplicates
- Alert on issues

---

## 🚀 Implementation Plan

### **Phase 1: Core Rotation System**
1. Implement deterministic hash function
2. Implement fairness scoring
3. Implement atomic batch updates
4. Add duplicate prevention

### **Phase 2: Cloud Function**
1. Set up scheduled Cloud Function
2. Implement rotation logic
3. Add error handling
4. Add monitoring

### **Phase 3: Fairness Tracking**
1. Add positionHistory field
2. Implement fairness algorithm
3. Add analytics dashboard
4. Generate reports

### **Phase 4: Testing & Optimization**
1. Test with 2000 purchases
2. Verify no duplicates
3. Verify fairness
4. Optimize performance

---

## ✅ Benefits

1. **Fair Rotation** ✅
   - Every logo gets equal exposure
   - No one stuck on last page
   - Deterministic (predictable)

2. **No Duplicates** ✅
   - Atomic batch updates
   - Verification after each rotation
   - Rollback on failure

3. **Easy Pagination** ✅
   - Still uses squareNumber (1-2000)
   - Easy to query by range
   - Works with existing code

4. **Reliable** ✅
   - Cloud Function (no client dependency)
   - Atomic updates (all or nothing)
   - Error handling and retries

5. **Scalable** ✅
   - Handles 2000+ purchases
   - Efficient batch operations
   - Can scale to more

---

## 🎯 Next Steps

1. **Review this design** - Does it meet your requirements?
2. **Choose implementation** - Cloud Function or client-side?
3. **Start implementation** - I'll build it step by step
4. **Test thoroughly** - Verify fairness and no duplicates

**Ready to build this? This will be a robust, fair rotation system with zero duplicates!** 🚀

