# Firebase Storage Setup Guide

## 🔥 Critical: Firebase Storage Security Rules

Your logos are not appearing because Firebase Storage security rules need to be configured.

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **clickalinks-frontend**

### Step 2: Configure Storage Rules
1. Click **Storage** in the left sidebar
2. Click on the **Rules** tab
3. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all logo files (public)
    match /logos/{logoId} {
      allow read: if true;
      allow write: if true; // Allow uploads
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

### Step 3: Verify Storage Bucket
1. In Firebase Console, go to **Storage**
2. Check that your bucket name matches: `clickalinks-frontend.firebasestorage.app`
3. If different, update `firebase.js` with the correct bucket name

### Step 4: Test Upload
1. Try uploading a logo again
2. Check browser console (F12) for any errors
3. Check Firebase Console > Storage > Files to see if logo appears

## 🔍 Debugging Steps

### Check Browser Console
Open browser DevTools (F12) and look for:
- `✅ Logo uploaded to Firebase Storage successfully!`
- `✅ Saved to Firestore: [square number]`
- Any error messages with `❌`

### Check Firebase Console
1. **Storage > Files**: Should see logos in `logos/` folder
2. **Firestore > Data**: Should see document in `purchasedSquares` collection
3. Check that `logoData` field contains a Firebase Storage URL (starts with `https://firebasestorage.googleapis.com`)

### Common Issues

**Issue 1: "storage/unauthorized" error**
- **Fix**: Update Firebase Storage rules (see Step 2 above)

**Issue 2: Logo uploads but doesn't appear**
- **Fix**: Check that `logoData` is saved correctly in Firestore
- Check browser console for loading errors

**Issue 3: "storage/quota-exceeded"**
- **Fix**: Check your Firebase plan limits
- Upgrade plan if needed

## 📝 Verification Checklist

- [ ] Firebase Storage rules are published
- [ ] Storage bucket name matches in `firebase.js`
- [ ] Logo uploads successfully (check console)
- [ ] Logo URL is saved to Firestore
- [ ] Logo appears in AdGrid after payment

## 🚀 Quick Test

1. Upload a logo in Business Details form
2. Check browser console for: `✅ Logo uploaded to Firebase Storage`
3. Complete payment
4. Check console for: `✅ Saved to Firestore`
5. Navigate to the square's page
6. Logo should appear on the square

If logo still doesn't appear, check:
- Browser console for image loading errors
- Firebase Console > Storage for uploaded files
- Firebase Console > Firestore for saved data

