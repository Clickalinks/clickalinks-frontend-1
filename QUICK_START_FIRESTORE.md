# 🚀 Quick Start - Fresh Firestore Setup

## ⚡ 3-Step Setup (5 minutes)

### **Step 1: Enable Firestore** (2 minutes)

1. Go to: https://console.firebase.google.com/
2. Select project: **clickalinks-frontend**
3. Click **Firestore Database** → **Create database**
4. Choose **Production mode**
5. Select region: **Europe (europe-west2)** or your preference
6. Click **Enable**

---

### **Step 2: Set Security Rules** (2 minutes)

1. In Firestore Database, click **Rules** tab
2. **Copy ALL rules from:** `firestore-rules-complete.txt`
3. **Paste** into the Rules editor
4. Click **Publish**

**Rules are also shown below for quick copy:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /purchasedSquares/{purchaseId} {
      allow read: if true;
      allow write: if true;
      allow update: if true;
      allow delete: if true;
    }
    match /clickAnalytics/{clickId} {
      allow read: if true;
      allow write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### **Step 3: Test Connection** (1 minute)

**Option A: Use Test Page**
1. Start your app: `npm start` (in frontend folder)
2. Open: `http://localhost:3000/test-firestore.html`
3. Click **"Test Firestore Write & Read"**
4. Should see: ✅ **All tests passed!**

**Option B: Browser Console**
1. Open your website
2. Press **F12** → **Console** tab
3. Type: `localStorage.clear()` → Enter
4. Refresh page
5. Try uploading a logo and completing a purchase

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Firestore Database shows "No data" (empty is correct!)
- [ ] Rules tab shows your rules (not default rules)
- [ ] Test page shows "All tests passed"
- [ ] No errors in browser console
- [ ] First purchase saves successfully

---

## 🎯 What Happens Next

**When you make your first purchase:**

1. App creates `purchasedSquares` collection automatically
2. Document saved with unique `purchaseId` (e.g., `purchase-1234567890-abc123`)
3. Logo uploaded to Firebase Storage
4. Square shows on grid with logo
5. Click tracking works automatically

**Collections created automatically:**
- `purchasedSquares` - Created on first purchase
- `clickAnalytics` - Created on first click

**No manual collection creation needed!** 🎉

---

## 🔧 Troubleshooting

### **"Missing or insufficient permissions"**
→ Check Rules are published (Step 2)

### **"Collection not found"**
→ Normal! Collection created on first write

### **Test fails**
→ Check Firebase config in `frontend/src/firebase.js`
→ Verify project ID matches: `clickalinks-frontend`

---

## 📚 Full Documentation

For detailed setup instructions, see: **`FIRESTORE_SETUP_NEW.md`**

---

**You're all set! Start making purchases and watch Firestore populate automatically.** 🚀

