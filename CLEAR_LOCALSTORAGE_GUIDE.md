# How to Clear localStorage and Start Fresh

## 🔍 The Problem

After deleting Firestore and Firebase Storage, data keeps reappearing because:

1. **localStorage still has purchase data** - Browser's local storage wasn't cleared
2. **Auto-sync runs on page load** - `syncLocalStorageToFirestore()` automatically recreates documents
3. **Logos are gone** - But purchase data references them, causing broken logo URLs

## ✅ Solution: Clear Browser localStorage

### **Method 1: Using Browser DevTools (Recommended)**

1. **Open Browser DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Go to Application Tab:**
   - Click "Application" tab (Chrome/Edge)
   - Click "Storage" tab (Firefox)

3. **Clear Local Storage:**
   - Expand "Local Storage" in left sidebar
   - Click on your site URL (e.g., `http://localhost:3000` or your domain)
   - Right-click → "Clear" or click "Clear All" button
   - **OR** manually delete these keys:
     - `squarePurchases`
     - `pendingPurchases`
     - `businessFormData`
     - `logoPath_*` (any keys starting with `logoPath_`)
     - `purchaseId_*` (any keys starting with `purchaseId_`)

4. **Refresh Page:**
   - Press `F5` or `Ctrl+R` to refresh
   - Data should no longer reappear

### **Method 2: Using Console (Quick)**

1. **Open Browser Console:**
   - Press `F12` → Click "Console" tab

2. **Run This Command:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

   This clears ALL localStorage and refreshes the page.

### **Method 3: Clear Specific Keys Only**

If you want to keep some data but remove purchases:

```javascript
// Clear purchase-related data only
localStorage.removeItem('squarePurchases');
localStorage.removeItem('pendingPurchases');
localStorage.removeItem('businessFormData');

// Clear all logo paths
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('logoPath_') || key.startsWith('purchaseId_')) {
    localStorage.removeItem(key);
  }
});

// Refresh page
location.reload();
```

## 🔧 Why This Happens

The app has an **auto-sync feature** that:
- Runs on every page load
- Checks localStorage for purchases
- Automatically recreates them in Firestore if they have `paymentStatus: 'paid'`

This is a **safety feature** to prevent data loss, but it means:
- ✅ If Firestore fails, localStorage backup restores data
- ⚠️ If you delete Firestore manually, localStorage recreates it

## 🎯 After Clearing localStorage

1. ✅ Firestore will stay empty (no auto-sync)
2. ✅ Firebase Storage will stay empty (no logos)
3. ✅ You can start fresh with new purchases
4. ✅ New purchases will work normally

## 🚨 Important Notes

- **localStorage is per-browser** - Clear it in each browser you use
- **localStorage persists** - It doesn't clear when you close the browser
- **IndexedDB cache** - Also check Application tab → IndexedDB and clear if needed

## 🔍 Verify localStorage is Cleared

After clearing, check console:
```javascript
console.log('squarePurchases:', localStorage.getItem('squarePurchases'));
console.log('pendingPurchases:', localStorage.getItem('pendingPurchases'));
```

Should show `null` for both.

