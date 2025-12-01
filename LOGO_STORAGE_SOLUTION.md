# Logo Storage Solution - Using Purchase ID Instead of Square Number

## Problem Identified

**Current Issue:**
- Logos are stored with filename: `square-{squareNumber}-{timestamp}`
- When shuffle happens, square numbers change
- Logo URL is stored in Firestore, but if it references square number in path, it breaks
- Logos show spinning loader because URL might be invalid after shuffle

## Solution: Use Unique Purchase ID

**New Approach:**
- Logo filename: `purchase-{uniqueId}-{timestamp}` (never changes)
- Logo URL stored in Firestore `logoData` field (permanent Firebase Storage URL)
- Square number can change during shuffle, but logo URL stays the same
- Logo always loads correctly regardless of shuffle

## How It Works

### 1. **Logo Upload** (BusinessDetails.js)
```javascript
// Generate unique purchase ID
const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

// Upload with purchase ID (not square number)
const uploadResult = await saveLogoToStorage(logoData, purchaseId);

// Store the permanent Firebase Storage URL
firebaseLogoURL = uploadResult.url; // This URL never changes
```

### 2. **Firestore Storage** (savePurchaseToFirestore.js)
```javascript
// Store logo URL (not path) in Firestore
logoData: firebaseLogoURL, // Permanent URL, survives shuffle
squareNumber: purchaseData.squareNumber, // Can change during shuffle
```

### 3. **Shuffle Process** (AdGrid.js)
```javascript
// When shuffling, only squareNumber changes
// logoData URL stays the same
newPurchasesState[newSquareNumber] = {
  ...purchase, // Includes logoData URL
  squareNumber: newSquareNumber, // Only this changes
  pageNumber: newPageNumber
};
```

### 4. **Logo Display** (AdGrid.js)
```javascript
// Logo URL is retrieved from Firestore document
const logoUrl = purchase.logoData; // Permanent URL, always works
```

## Key Benefits

✅ **Logo persists through shuffle** - URL never changes
✅ **No broken links** - Logo always loads correctly
✅ **Fair placement** - Shuffle works perfectly
✅ **Simple solution** - Just use permanent Firebase Storage URLs

## What Changed

1. **firebaseStorage.js**: Now accepts `purchaseId` instead of `squareNumber`
2. **BusinessDetails.js**: Generates unique purchase ID before upload
3. **Firestore**: Stores permanent logo URL (not path with square number)

## Testing

After these changes:
1. Upload a logo → Should upload with `purchase-{id}` filename
2. Check Firestore → Should have permanent logo URL in `logoData`
3. Shuffle squares → Logo should still load correctly
4. Check browser console → Logo URL should be valid Firebase Storage URL

## Important Notes

- **Logo URLs are permanent** - Firebase Storage URLs don't change
- **Square numbers are temporary** - They change during shuffle
- **Always store the URL** - Not the path with square number
- **Shuffle only changes squareNumber** - logoData stays the same

