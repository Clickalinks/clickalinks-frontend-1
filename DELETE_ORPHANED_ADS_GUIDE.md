# Delete Orphaned Ads - Complete Guide

## 🔍 The Problem

You're seeing squares with "Active Ad" text that:
- ✅ Have business data (businessName, dealLink, contactEmail)
- ❌ Have NO valid logo (logo was deleted from Firebase Storage)
- ✅ Still clickable (opens dealLink)
- ❌ Show "Active Ad" placeholder instead of logo

**Why this happens:**
- Firestore documents still exist with business data
- But `logoData` field points to deleted logos (404 errors)
- App displays "Active Ad" when logo is missing/broken

## ✅ Solution: Delete Orphaned Firestore Documents

### **Method 1: Use Firebase Console (Easiest)**

1. **Go to Firebase Console:**
   - https://console.firebase.google.com
   - Select your project
   - Click **Firestore Database**

2. **Delete the Collection:**
   - Click on `purchasedSquares` collection
   - Click the **three dots** (⋮) next to collection name
   - Select **Delete collection**
   - Type `purchasedSquares` to confirm
   - Click **Delete**

3. **Clear IndexedDB Cache:**
   - Open browser DevTools (F12)
   - Go to **Application** tab
   - Expand **IndexedDB**
   - Right-click `clickalinks-cache` → **Delete database**
   - Refresh page

---

### **Method 2: Use Browser Console (Manual)**

1. **Open Console (F12)**

2. **Type this to check what's in Firestore:**
   ```javascript
   // This will show you what documents exist
   // (You'll need Firebase SDK loaded)
   ```

3. **Or use the HTML tool I created:**
   - Open `frontend/public/delete-orphaned-ads.html`
   - But you'll need to add your Firebase config first

---

### **Method 3: Quick Fix - Hide Squares Without Logos**

I can modify the code to **hide squares that don't have valid logos** instead of showing "Active Ad". This way:
- Squares with valid logos → Show normally
- Squares without logos → Hidden (treated as available)

**Would you like me to implement this?**

---

## 🎯 Recommended: Delete from Firebase Console

**Fastest way:**

1. Firebase Console → Firestore → `purchasedSquares` collection
2. Delete the entire collection
3. Clear IndexedDB cache (DevTools → Application → IndexedDB)
4. Refresh your page

**Result:**
- ✅ All orphaned ads deleted
- ✅ Grid shows only available squares
- ✅ Fresh start for new purchases

---

## 🔧 Alternative: Code Fix to Hide Orphaned Ads

If you want to keep some documents but hide the ones without logos, I can modify `AdGrid.js` to:

```javascript
// Only show squares with valid logos
if (!logoUrl || logoUrl is broken) {
  // Treat as available (don't show "Active Ad")
  return null;
}
```

**Should I implement this fix?**

---

## 📊 What You'll See After Deletion

**Before:**
- Squares with "Active Ad" text (no logo)
- Clickable → Opens dealLink
- Shows as "occupied"

**After:**
- All squares show as "available"
- No "Active Ad" placeholders
- Clean grid ready for new purchases

---

**Which method do you prefer?**
1. Delete from Firebase Console (fastest)
2. Code fix to hide orphaned ads (keeps some data)
3. Use the HTML tool (requires Firebase config)

