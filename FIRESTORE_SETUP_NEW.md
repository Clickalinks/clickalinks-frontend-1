# 🆕 Fresh Firestore Database Setup - Complete Guide

## ✅ Step 1: Enable Firestore Database

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project: **clickalinks-frontend**

2. **Enable Firestore:**
   - Click **Firestore Database** in the left sidebar
   - If you see "Get started" or "Create database", click it
   - Choose **Production mode** (we'll set rules manually)
   - Select **Europe (europe-west2)** as location (or your preferred region)
   - Click **Enable**

---

## ✅ Step 2: Set Firestore Security Rules

1. **Go to Rules Tab:**
   - In Firestore Database, click the **Rules** tab

2. **Copy and Paste These Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // purchasedSquares collection - stores all ad purchases
    match /purchasedSquares/{purchaseId} {
      // Public read access (needed to display ads on website)
      allow read: if true;
      
      // Allow writes (creates collection automatically on first save)
      // In production, you might want to add validation:
      // allow create: if request.resource.data.keys().hasAll(['status', 'squareNumber', 'businessName']);
      allow write: if true;
      
      // Allow updates (for shuffle, click tracking, etc.)
      allow update: if true;
      
      // Allow delete (for cleanup)
      allow delete: if true;
    }
    
    // clickAnalytics collection - tracks ad clicks
    match /clickAnalytics/{clickId} {
      // Public read (for analytics dashboard)
      allow read: if true;
      
      // Allow writes (for click tracking)
      allow write: if true;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Click "Publish"** (top right button)

---

## ✅ Step 3: Verify Database is Ready

The database is ready when:
- ✅ Firestore Database shows "No data" (empty is good!)
- ✅ Rules are published
- ✅ No errors in Rules tab

**You don't need to manually create collections!** They will be created automatically when your app saves the first document.

---

## ✅ Step 4: Test Firestore Connection

### **Option A: Use Browser Console**

1. Open your website: `http://localhost:3000` (or your domain)
2. Press **F12** → Click **Console** tab
3. Type this (one line at a time):

```javascript
// Test 1: Check if Firebase is loaded
console.log('Firebase loaded:', typeof firebase !== 'undefined' ? 'Yes' : 'No');
```

4. If Firebase is loaded, test write:

```javascript
// Test 2: Write a test document
import('./src/firebase.js').then(({db}) => {
  import('firebase/firestore').then(({doc, setDoc}) => {
    const testRef = doc(db, 'purchasedSquares', 'test-999');
    setDoc(testRef, {
      status: 'active',
      businessName: 'Test Business',
      squareNumber: 999,
      test: true,
      createdAt: new Date()
    }).then(() => {
      console.log('✅ Firestore write successful!');
      alert('✅ Firestore is working! Check Firebase Console to see the test document.');
    }).catch(err => {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.code + ' - ' + err.message);
    });
  });
});
```

### **Option B: Use Test Page**

I've created a test page for you. Open:
- `http://localhost:3000/test-firestore.html` (if running locally)

---

## ✅ Step 5: Clear Browser Storage

Before testing, clear all browser storage:

1. **Open DevTools (F12)** → **Application** tab
2. **Clear Local Storage:**
   - Expand **Local Storage** → Click your site URL
   - Click **Clear All** or delete individual keys
3. **Clear IndexedDB:**
   - Expand **IndexedDB**
   - Right-click `clickalinks-cache` → **Delete database**
4. **Refresh page**

---

## ✅ Step 6: Test Complete Purchase Flow

1. **Select a square** on your website
2. **Upload a logo**
3. **Fill in business details**
4. **Complete payment** (or use test mode)
5. **Check Firebase Console:**
   - Go to Firestore Database
   - You should see `purchasedSquares` collection appear
   - Click on it to see your purchase document

---

## 📊 Expected Collections

After your first purchase, you'll see:

### **purchasedSquares** collection
- **Document ID:** `purchase-{timestamp}-{random}` (unique purchase ID)
- **Fields:**
  - `purchaseId`: Unique ID
  - `squareNumber`: Current square assignment (1-2000)
  - `pageNumber`: Page number (1-10)
  - `businessName`: Business name
  - `logoData`: Firebase Storage URL
  - `dealLink`: Business website/deal link
  - `contactEmail`: Contact email
  - `status`: "active"
  - `paymentStatus`: "paid"
  - `startDate`: Start date
  - `endDate`: End date
  - `clickCount`: Number of clicks
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### **clickAnalytics** collection (created when clicks are tracked)
- **Document ID:** Auto-generated
- **Fields:**
  - `squareNumber`: Square that was clicked
  - `businessName`: Business name
  - `pageNumber`: Page number
  - `timestamp`: When clicked
  - `userAgent`: Browser info
  - `referrer`: Where user came from

---

## 🔧 Troubleshooting

### **Error: "Missing or insufficient permissions"**
- **Fix:** Check Firestore Rules are published
- **Fix:** Make sure rules allow `read: if true` and `write: if true`

### **Error: "Collection not found"**
- **Normal!** Collections are created automatically on first write
- Just save a purchase and the collection will appear

### **No data appearing after purchase**
- Check browser console for errors
- Verify Firestore Rules are published
- Check that `logoData` field contains a valid URL

### **Test document appears but real purchases don't**
- Check browser console for specific error messages
- Verify Firebase config in `frontend/src/firebase.js` is correct
- Check that payment was successful

---

## ✅ Success Checklist

- [ ] Firestore Database enabled
- [ ] Security Rules published
- [ ] Test document can be written
- [ ] Test document can be read
- [ ] Browser storage cleared
- [ ] First purchase saved successfully
- [ ] Logo appears on grid

---

## 🎉 You're Ready!

Your Firestore database is now set up and ready to use. The app will automatically:
- Create collections when needed
- Save purchases with unique IDs
- Track clicks
- Handle shuffling

**No manual collection creation needed!** Everything happens automatically. 🚀

