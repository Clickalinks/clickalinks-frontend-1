# 🔍 Final Diagnosis: Firestore Backend Access Issue

## Current Status
- ✅ Database exists: `purchasedsquares` in `europe-west2`
- ✅ Permissions added: "Cloud Datastore User" role
- ❌ Backend still can't access: Getting `5 NOT_FOUND` errors

## Possible Causes

### 1. Permissions Haven't Propagated Yet ⏰
**Solution:** Wait 5-10 minutes after adding permissions, then test again.

### 2. Wrong IAM Role
The "Cloud Datastore User" role might not be sufficient. Try adding:
- **Firebase Admin SDK Administrator Service Agent** (if not already added)
- **Cloud Datastore User** (already added)

### 3. Database Region Issue
Database is in `europe-west2` but Admin SDK might be defaulting to `us-central1`.

**Solution:** Firestore Admin SDK should auto-detect, but if not working, we might need to specify the database explicitly.

### 4. Service Account Needs More Permissions
Try adding these additional roles:
- **Firebase Admin SDK Administrator Service Agent**
- **Service Account User**

---

## Next Steps

### Option 1: Wait and Retry (Easiest)
1. Wait 5-10 minutes
2. Run test again:
   ```powershell
   cd C:\Clickalinks\Backend
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
   node test-with-location.js
   ```

### Option 2: Add More Permissions
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=clickalinks-frontend
2. Find: `firebase-adminsdk-fbsvc@clickalinks-frontend.iam.gserviceaccount.com`
3. Click Edit (pencil icon)
4. Add these roles:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Service Account User**
5. Save and wait 5 minutes

### Option 3: Check Database Status
1. Go to: https://console.firebase.google.com/project/clickalinks-frontend/firestore/databases
2. Click on "purchasedsquares" database
3. Check if there are any warnings or errors
4. Verify the database is in "Native" mode (not Datastore mode)

---

## Why Frontend Works But Backend Doesn't

- **Frontend:** Uses Firebase Client SDK with API keys (works immediately)
- **Backend:** Uses Firebase Admin SDK with service account (needs IAM permissions)

The frontend can write because it uses different authentication. The backend needs explicit IAM roles.

---

## Test After Waiting/Fixing

Once permissions propagate or you add more roles:

```powershell
cd C:\Clickalinks\Backend
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
node test-with-location.js
```

**Expected Success Output:**
```
✅ Write successful to purchasedSquares!
✅ Read successful from purchasedSquares!
✅ SUCCESS! Collection purchasedSquares is accessible!
```

---

## If Still Not Working

If after waiting 10+ minutes and adding all roles it still doesn't work:

1. **Check Google Cloud Console Logs:**
   - Go to: https://console.cloud.google.com/logs
   - Filter by service account
   - Look for permission errors

2. **Try Creating a New Service Account:**
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=clickalinks-frontend
   - Create new service account
   - Grant all Firebase roles
   - Download new key
   - Replace `firebase-service-account.json`

3. **Verify Database Mode:**
   - Make sure database is in "Native" mode (not "Datastore" mode)
   - Native mode = Firestore
   - Datastore mode = Legacy (different API)

