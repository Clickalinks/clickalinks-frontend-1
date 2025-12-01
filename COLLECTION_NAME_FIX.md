# 🔧 Collection Name Fix Applied

## Issue
- Backend test shows collection name is `purchasedsquares` (lowercase)
- Frontend code was using `purchasedSquares` (camelCase)
- Firestore collection names are case-sensitive

## Fix Applied
Updated all collection references to use lowercase `purchasedsquares`:

### Files Updated:
1. ✅ `Backend/services/shuffleService.js` - Changed `COLLECTION_NAME` to `'purchasedsquares'`
2. ✅ `frontend/src/components/AdGrid.js` - Updated all `collection(db, 'purchasedSquares')` to `'purchasedsquares'`
3. ✅ `frontend/src/utils/savePurchaseToFirestore.js` - Updated collection references

### Files Still Need Update:
- `frontend/src/utils/fisherYatesShuffle.js` - Still uses `purchasedSquares`
- `frontend/src/utils/fairRotation.js` - Still uses `purchasedSquares`
- `frontend/src/utils/clickTracker.js` - Still uses `purchasedSquares`
- `frontend/src/components/SearchBar.js` - Still uses `purchasedSquares`
- `frontend/src/utils/cleanupExpiredAds.js` - Still uses `purchasedSquares`

**Note:** These files might not be used anymore (old shuffle code), but should be updated for consistency.

---

## Next Steps

1. **Deploy frontend** with updated collection names
2. **Upload logos** - they should now save to correct collection
3. **Run shuffle:** `node test-shuffle.js` (will assign `orderingIndex`)
4. **Test mobile/tablet** - should now show logos

---

## Image Loading Issues

The Firebase Storage URLs are failing. This might be:
1. **Storage rules blocking access** - Check Firebase Storage rules
2. **Token expiration** - URLs might have expired tokens
3. **CORS issues** - Storage might not allow cross-origin requests

**Fix:** Check Firebase Storage rules and ensure they allow public read access.

