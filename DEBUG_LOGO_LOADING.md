# Debug Logo Loading Issues

## Problem
Logos are uploaded successfully but not appearing on the grid (spinning loader).

## Debugging Steps

### 1. Check Browser Console
Look for these log messages:
- `✅ Square X: Logo URL found - https://...` (Logo is in Firestore)
- `⚠️ Square X: No logoData in Firestore document` (Logo missing)
- `📊 Squares with logos: X out of Y` (How many logos found)

### 2. Check Firestore Data
1. Go to Firebase Console → Firestore
2. Open document for your square (e.g., document ID `5` or `1405`)
3. Check these fields:
   - `logoData` - Should contain Firebase Storage URL
   - `status` - Should be `'active'`
   - `paymentStatus` - Should be `'paid'`
   - `squareNumber` - Should match the square number

### 3. Check Logo URL Format
Logo URL should look like:
```
https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/logos%2Fpurchase-XXXXX-XXXXX?alt=media&token=XXXXX
```

### 4. Test Logo URL Directly
1. Copy the `logoData` URL from Firestore
2. Paste it in a new browser tab
3. If it loads → Logo file exists, issue is in display logic
4. If it doesn't load → Logo file missing or Storage rules issue

### 5. Clear Cache and Reload
Open browser console and run:
```javascript
// Clear IndexedDB cache
import('./utils/cache').then(({ clearAllCache }) => {
  clearAllCache().then(() => {
    console.log('Cache cleared');
    window.location.reload();
  });
});

// Or manually clear localStorage
localStorage.removeItem('squarePurchases');
window.location.reload();
```

### 6. Check Real-Time Listener
The grid should update automatically when Firestore changes. Check console for:
- `🔄 Firestore real-time update received`
- `✅ Real-time update: Loaded X active squares`

If you don't see these, the listener might not be working.

## Common Issues

### Issue 1: Logo URL Missing from Firestore
**Symptom**: `⚠️ Square X: No logoData in Firestore document`
**Fix**: Check Success.js - ensure `logoData` is being saved

### Issue 2: Logo URL Invalid Format
**Symptom**: `⚠️ Square X: Invalid logo URL format`
**Fix**: Ensure logo URL starts with `https://` or `http://`

### Issue 3: Cache Showing Old Data
**Symptom**: Logo appears in Firestore but not on grid
**Fix**: Clear cache (see step 5 above)

### Issue 4: Real-Time Listener Not Updating
**Symptom**: No `🔄 Firestore real-time update received` messages
**Fix**: Check Firestore rules allow reads, refresh page

## Quick Fix Commands

### Force Reload Grid
```javascript
window.dispatchEvent(new Event('purchaseCompleted'));
```

### Check What's in Firestore
```javascript
// In browser console
import('./firebase').then(({ db }) => {
  import('firebase/firestore').then(({ collection, getDocs, query, where }) => {
    getDocs(query(collection(db, 'purchasedSquares'), where('status', '==', 'active')))
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`Square ${data.squareNumber}:`, {
            hasLogo: !!data.logoData,
            logoURL: data.logoData ? data.logoData.substring(0, 80) : 'MISSING',
            status: data.status,
            paymentStatus: data.paymentStatus
          });
        });
      });
  });
});
```

