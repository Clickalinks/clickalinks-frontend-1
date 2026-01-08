# 🔍 Verify Firestore Rules - Step by Step

## Critical Issue: Real Payments Not Saving to Firestore

If purchases are not being saved after real payments, check the Firestore Security Rules.

---

## ✅ Step 1: Check Current Rules in Firebase Console

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select project: **clickalinks-frontend**
   - Click **Firestore Database** in left sidebar
   - Click **Rules** tab

2. **Verify Rules Match This:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Purchased Squares Collection
    match /purchasedSquares/{purchaseId} {
      // Allow public read access to all purchases (needed for displaying ads)
      allow read: if true;
      
      // IMPORTANT: Client-side writes disabled - backend uses Admin SDK
      // Admin SDK bypasses security rules entirely
      allow write: if false; // Disable direct client writes - use backend API
    }
    
    // Click Analytics Collection
    match /clickAnalytics/{clickId} {
      allow read: if true;
      allow write: if false; // Disable direct client writes - use backend API
    }
    
    // Promo Codes Collection
    match /promoCodes/{promoId} {
      allow read: if resource.data.active == true 
                  && (resource.data.expiresAt == null || resource.data.expiresAt.toMillis() > request.time.toMillis());
      allow write: if false;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **If rules DON'T match:**
   - Copy the rules above
   - Paste into Firebase Console Rules editor
   - Click **"Publish"** button (top right)
   - Wait for confirmation: "Rules published successfully"

---

## ✅ Step 2: Verify Backend Uses Admin SDK

The backend **MUST** use Firebase Admin SDK, which bypasses security rules.

**Check in Backend Code:**
- File: `Backend/routes/purchases.js`
- Line 14: `const db = admin.firestore();` ✅
- File: `Backend/server.js` (webhook)
- Line 237: `const db = admin.firestore();` ✅

**Admin SDK is correct** - it bypasses all security rules.

---

## ✅ Step 3: Test Firestore Write from Backend

Run this test script to verify backend can write:

```bash
cd Backend
node scripts/test-firestore-write.js
```

**Expected Output:**
```
✅ SUCCESS: Test document written to Firestore!
✅ VERIFIED: Document exists in Firestore
✅ Firestore write test PASSED
```

**If it fails:**
- Check Firebase Admin SDK initialization
- Verify service account credentials in Render.com environment variables
- Check project ID matches

---

## ✅ Step 4: Check Render.com Logs for Errors

When a purchase is attempted, check Render.com backend logs for:

### ✅ Good Signs:
```
✅ Purchase saved via API: purchase-...
✅ Purchase saved successfully to Firestore: purchase-...
```

### ❌ Error Signs:
```
❌ Error saving purchase: permission-denied
❌ Firestore write failed: PERMISSION_DENIED
❌ Missing or insufficient permissions
```

---

## ✅ Step 5: Common Issues & Fixes

### Issue 1: Rules Not Deployed
**Symptom:** Rules in code don't match Firebase Console
**Fix:** Copy rules to Firebase Console and click "Publish"

### Issue 2: Admin SDK Not Initialized
**Symptom:** Backend logs show "Firebase Admin not initialized"
**Fix:** Check `FIREBASE_SERVICE_ACCOUNT` in Render.com environment variables

### Issue 3: Project ID Mismatch
**Symptom:** Writes succeed but to wrong project
**Fix:** Verify `FIREBASE_PROJECT_ID` matches Firebase Console project ID

### Issue 4: Service Account Missing Permissions
**Symptom:** Permission denied even with Admin SDK
**Fix:** Verify service account has "Firebase Admin SDK Administrator Service Agent" role

---

## ✅ Step 6: Verify Purchase Save Flow

When a purchase is made:

1. **Frontend (Success.js)** → Calls `/api/purchases` endpoint
2. **Backend (routes/purchases.js)** → Uses Admin SDK to write to Firestore
3. **Webhook (server.js)** → Backup: Uses Admin SDK to write if Success page fails

**Both paths use Admin SDK** → Both bypass security rules ✅

---

## 🔧 Quick Fix: Update Rules Now

If you're not sure about the rules:

1. **Go to Firebase Console Rules:**
   https://console.firebase.google.com/project/clickalinks-frontend/firestore/rules

2. **Delete everything** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /purchasedSquares/{purchaseId} {
      allow read: if true;
      allow write: if false;
    }
    match /clickAnalytics/{clickId} {
      allow read: if true;
      allow write: if false;
    }
    match /promoCodes/{promoId} {
      allow read: if resource.data.active == true 
                  && (resource.data.expiresAt == null || resource.data.expiresAt.toMillis() > request.time.toMillis());
      allow write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Click "Publish"**

4. **Wait 10-30 seconds** for rules to propagate

5. **Test a purchase again**

---

## 📊 Expected Behavior

- ✅ **Frontend reads:** Should work (rules allow `read: if true`)
- ✅ **Backend writes:** Should work (Admin SDK bypasses rules)
- ❌ **Frontend writes:** Should fail (rules block `write: if false`)
- ✅ **Webhook writes:** Should work (Admin SDK bypasses rules)

If backend writes are failing, it's NOT a rules issue - it's an Admin SDK initialization issue.
