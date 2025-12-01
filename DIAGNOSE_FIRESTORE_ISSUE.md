# 🔍 Diagnosing Firestore Backend Access Issue

## Problem
- Frontend can see/upload to Firestore (you saw documents in console)
- Backend CANNOT read/write to Firestore (getting `5 NOT_FOUND` errors)
- Shuffle can't run because it can't access Firestore

## Root Cause
The backend service account likely:
1. **Doesn't have Firestore permissions** - needs "Cloud Datastore User" role
2. **OR pointing to wrong project** - service account project doesn't match frontend project
3. **OR database location mismatch** - service account can't find the database

---

## ✅ SOLUTION: Grant Service Account Permissions

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select project: **clickalinks-frontend** (or whatever your project ID is)

### Step 2: Go to IAM & Admin
1. Click **"IAM & Admin"** in left menu
2. Click **"IAM"** (or "Service Accounts")

### Step 3: Find Your Service Account
1. Look for: `firebase-adminsdk-fbsvc@clickalinks-frontend.iam.gserviceaccount.com`
2. Or search for: `firebase-adminsdk`

### Step 4: Grant Permissions
1. Click the **pencil icon** (Edit) next to the service account
2. Click **"ADD ANOTHER ROLE"**
3. Add these roles:
   - **Cloud Datastore User** (for Firestore access)
   - **Firebase Admin SDK Administrator Service Agent** (if available)
4. Click **"SAVE"**

### Step 5: Wait 1-2 Minutes
Permissions can take a minute to propagate.

### Step 6: Test Again
```powershell
cd C:\Clickalinks\Backend
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
node test-write-read.js
```

---

## Alternative: Check Project ID Match

### Verify Service Account Project Matches Frontend Project

**Frontend Project ID:** `clickalinks-frontend` (from `frontend/src/firebase.js`)

**Service Account Project ID:** Check with:
```powershell
cd C:\Clickalinks\Backend
Get-Content firebase-service-account.json | ConvertFrom-Json | Select-Object project_id
```

**They MUST match!** If they don't match:
1. Download a NEW service account key from Firebase Console
2. Make sure you select the CORRECT project (`clickalinks-frontend`)
3. Replace `firebase-service-account.json` with the new key

---

## Quick Check: Verify Service Account

Run this to see what project the service account is for:

```powershell
cd C:\Clickalinks\Backend
Get-Content firebase-service-account.json | ConvertFrom-Json | Select-Object project_id, client_email | Format-List
```

**Expected Output:**
```
project_id  : clickalinks-frontend
client_email: firebase-adminsdk-fbsvc@clickalinks-frontend.iam.gserviceaccount.com
```

If `project_id` is different, that's the problem!

---

## After Fixing Permissions

Once backend can access Firestore:

1. **Upload logos through frontend** (they should save to Firestore)
2. **Run shuffle:**
   ```powershell
   node test-shuffle.js
   ```
3. **Verify documents have `orderingIndex`** in Firestore Console

---

## 🆘 Still Not Working?

If permissions are correct but still getting errors:

1. **Check Firestore Database Location:**
   - Go to Firebase Console > Firestore Database
   - Check the database location (e.g., `us-central1`)
   - Make sure it's initialized

2. **Verify Service Account Key:**
   - Download a fresh key from Firebase Console
   - Replace the old one
   - Make sure it's for the correct project

3. **Check Google Cloud Billing:**
   - Firestore requires billing to be enabled
   - Go to Google Cloud Console > Billing
   - Make sure billing is active

