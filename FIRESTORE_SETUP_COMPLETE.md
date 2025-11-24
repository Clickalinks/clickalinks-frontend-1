# Firestore Setup Guide - Complete Instructions

## 📁 About Build vs Public Folders

### **DO NOT DELETE EITHER FOLDER!**

- **`public/` folder**: Source files for your React app (index.html, logo, favicon, etc.)
  - This is where you put static assets
  - Required for development (`npm start`)
  - Files here are copied to `build/` during build

- **`build/` folder**: Compiled production build (created when you run `npm run build`)
  - Contains optimized JavaScript, CSS, and assets
  - This is what gets deployed to production
  - Can be regenerated anytime with `npm run build`
  - Safe to delete if you want to clean up, but will be recreated on next build

**Summary**: Keep both! `public` is your source, `build` is your output.

---

## 🔥 Firestore "Start Collection" Option

### What is "Start Collection"?

When you see "Start collection" in Firestore Database, it means:
- The collection doesn't exist yet
- Firestore is asking if you want to manually create it

### Do You Need to Manually Create It?

**NO!** You don't need to manually create the collection. Here's why:

1. **Firestore creates collections automatically** when you write the first document
2. Your app will create `purchasedSquares` collection automatically when it saves the first purchase
3. The "Start collection" button is just for manual testing/exploration

### What You ACTUALLY Need to Do:

**Set up Firestore Security Rules** (this is the critical step):

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **clickalinks-frontend**
3. Click **Firestore Database** > **Rules** tab
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to purchasedSquares collection
    match /purchasedSquares/{squareId} {
      allow read: if true; // Public read access
      allow write: if true; // Allow writes (creates collection automatically)
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **Publish**

### After Setting Rules:

- Your app will automatically create the `purchasedSquares` collection when it saves the first document
- You'll see it appear in Firestore Database automatically
- No need to manually "Start collection"

---

## 🧪 Testing Firestore Connection

### Option 1: Use Browser Console (Easiest)

1. Open your website in browser
2. Open browser console (F12)
3. Paste this code and press Enter:

```javascript
// Test Firestore write
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "XsxVvIS4mIRSzDzG2RtsbJ_I1p25-rjuupbwWCffz6g",
  authDomain: "clickalinks-frontend.firebaseapp.com",
  projectId: "clickalinks-frontend",
  storageBucket: "clickalinks-frontend.firebasestorage.app",
  messagingSenderId: "568043553622",
  appId: "1:568043553622:web:d8e928c8b26e2847e50cf7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test write
const testDoc = doc(db, 'purchasedSquares', '999');
await setDoc(testDoc, {
  status: 'active',
  businessName: 'Test Business',
  squareNumber: 999,
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  test: true
});

console.log('✅ Test document written!');

// Test read
const snapshot = await getDocs(collection(db, 'purchasedSquares'));
console.log(`📊 Total documents: ${snapshot.size}`);
snapshot.forEach(doc => {
  console.log(`📄 Document ${doc.id}:`, doc.data());
});
```

### Option 2: Test Through Your App

1. Upload a logo and complete payment
2. Check browser console for:
   - `🔥 ATTEMPTING FIRESTORE SAVE`
   - `✅ Firestore setDoc() completed successfully!`
   - `✅ VERIFICATION SUCCESS`

---

## ✅ Checklist

- [ ] Firestore security rules are published (see above)
- [ ] Tested Firestore write (using browser console or app)
- [ ] Documents appear in Firestore Database after payment
- [ ] Logos appear on squares after payment

---

## 🐛 Troubleshooting

### "Permission denied" error
- **Fix**: Check Firestore rules are published correctly

### "Collection doesn't exist" 
- **Fix**: This is normal! Collection will be created automatically on first write

### Documents not appearing
- **Fix**: Check browser console for errors, verify rules are published

