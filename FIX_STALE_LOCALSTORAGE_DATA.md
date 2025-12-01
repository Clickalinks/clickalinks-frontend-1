# ✅ Fix: Stale "Active Ad" Squares After Firestore Deletion

## 🐛 Problem

Even after deleting all data from Firestore, the frontend was still showing "Active Ad" squares because:
1. **AdGrid.js** was merging `localStorage` data with Firestore data
2. Broken logo URLs (404 errors) were stored in `localStorage`
3. When Firestore was empty, squares from `localStorage` were still displayed

## 🔧 Solution

### 1. **AdGrid.js - Initial Load (`loadPurchasedSquares`)**
- **Before:** Merged `localStorage` data even when Firestore was empty
- **After:** 
  - If Firestore is empty → Clear all `localStorage` entries
  - If Firestore has data → Only show squares from Firestore, clean up stale `localStorage` entries
  - Firestore is now the **single source of truth**

### 2. **AdGrid.js - Real-time Listener (`onSnapshot`)**
- **Before:** Merged `localStorage` data in real-time updates
- **After:** 
  - Only use Firestore data
  - Clean up `localStorage` entries that don't exist in Firestore
  - Don't merge `localStorage` into display

### 3. **savePurchaseToFirestore.js - Broken Logo Cleanup**
- **Before:** Skipped syncing broken logos but left them in `localStorage`
- **After:** 
  - When a logo URL returns 404 → Remove from `localStorage` immediately
  - Prevents broken logos from showing on the grid

## 📝 Code Changes

### `frontend/src/components/AdGrid.js`

**Lines 389-441:** Changed localStorage merge logic
```javascript
// OLD: Merged localStorage even when Firestore empty
if (!purchases[squareNum]) {
  purchases[squareNum] = localData; // ❌ This caused stale data
}

// NEW: Clear localStorage if Firestore empty
if (querySnapshot.size === 0) {
  localStorage.removeItem('squarePurchases'); // ✅ Clear stale data
  // Also clear logo paths
}
```

**Lines 645-670:** Changed real-time listener merge logic
```javascript
// OLD: Merged localStorage in real-time
if (!purchases[squareNum]) {
  purchases[squareNum] = localData; // ❌ This caused stale data
}

// NEW: Only clean up, don't merge
if (!firestoreSquareNumbers.has(squareNum)) {
  delete localPurchases[squareNum]; // ✅ Remove stale entries
}
```

### `frontend/src/utils/savePurchaseToFirestore.js`

**Lines 245-248:** Added localStorage cleanup for broken logos
```javascript
// NEW: Remove broken logos from localStorage
if (!response.ok) {
  delete squarePurchases[squareNumber]; // ✅ Remove broken logo
  localStorage.removeItem(`logoPath_${squareNumber}`);
  continue; // Skip sync
}
```

## ✅ Expected Behavior

### Before Fix:
```
❌ Firestore empty → Still shows "Active Ad" squares from localStorage
❌ Broken logo URLs (404) still displayed
❌ Stale data persists after Firestore deletion
```

### After Fix:
```
✅ Firestore empty → All squares show "Ad Spot £1/day"
✅ Broken logo URLs removed from localStorage
✅ No stale data after Firestore deletion
✅ Firestore is single source of truth
```

## 🧪 Testing

1. **Clear Firestore:**
   - Delete all documents from `purchasedSquares` collection
   - Refresh frontend

2. **Expected Result:**
   - All squares should show "Ad Spot £1/day"
   - No "Active Ad" squares should appear
   - Console should show: `🗑️ Firestore is empty - clearing X stale entries from localStorage`

3. **Check localStorage:**
   - Open DevTools → Application → Local Storage
   - `squarePurchases` should be empty or cleared
   - No `logoPath_*` entries

4. **Test Broken Logos:**
   - If a logo URL returns 404, it should be removed from localStorage
   - Console should show: `⚠️ Logo URL is broken (404) for square X, skipping sync and removing from localStorage`

## 🚀 Deployment

1. **Commit changes:**
   ```powershell
   cd C:\Clickalinks\frontend
   git add src/components/AdGrid.js src/utils/savePurchaseToFirestore.js
   git commit -m "Fix: Clear localStorage when Firestore empty, prevent stale Active Ad squares"
   git push origin main
   ```

2. **Deploy frontend:**
   - Firebase Hosting will auto-deploy
   - Or manually deploy if needed

3. **Test on deployed site:**
   - Clear Firestore
   - Refresh deployed site
   - Verify no stale "Active Ad" squares appear

---

**The fix ensures Firestore is the single source of truth and prevents stale data from showing!** ✅

