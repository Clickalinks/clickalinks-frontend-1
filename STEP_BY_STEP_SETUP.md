# Step-by-Step Setup Guide - Firebase Admin SDK

## 🎯 Goal: Configure Firebase Admin SDK and Test Shuffle

---

## STEP 1: Locate Your Firebase Private Key File

1. You should have downloaded a JSON file (e.g., `clickalinks-frontend-xxxxx.json`)
2. **Note the full path** to this file (e.g., `C:\Users\YourName\Downloads\clickalinks-frontend-xxxxx.json`)
3. **Copy this file** to your project folder for easier access:
   ```powershell
   # Example: Copy to Backend folder
   Copy-Item "C:\Users\YourName\Downloads\clickalinks-frontend-xxxxx.json" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"
   ```

---

## STEP 2: Test Firebase Admin Locally (Windows PowerShell)

Open PowerShell in your Backend folder:

```powershell
# Navigate to Backend folder
cd C:\Clickalinks\Backend

# Set environment variable pointing to your service account file
# Replace the path with YOUR actual file path!
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"

# Verify it's set
echo $env:GOOGLE_APPLICATION_CREDENTIALS

# Test the shuffle service
node test-shuffle.js
```

**Expected Output:**
- ✅ Should show stats and perform shuffle
- ❌ If you see "Firebase Admin not initialized" error, check the file path

---

## STEP 3: Generate Admin Secret Key

In the same PowerShell window:

```powershell
# Generate a secure random secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** - this is your `ADMIN_SECRET_KEY` (save it somewhere safe!)

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

## STEP 4: Set Environment Variables for Local Testing

Create a `.env` file in your Backend folder (if it doesn't exist):

```powershell
# In Backend folder
cd C:\Clickalinks\Backend

# Create or edit .env file
notepad .env
```

**Add these lines to .env file:**
```env
GOOGLE_APPLICATION_CREDENTIALS=C:\Clickalinks\Backend\firebase-service-account.json
ADMIN_SECRET_KEY=your-generated-secret-key-from-step-3
PORT=10000
```

**Save and close** the .env file.

---

## STEP 5: Test Shuffle Endpoint

**Option A: Test via Node Script (Easiest)**

```powershell
cd C:\Clickalinks\Backend
node test-shuffle.js
```

**Expected Output:**
```
🧪 Testing shuffle system...

📊 Step 1: Getting shuffle stats...
Stats: { success: true, totalActive: 4, ... }

🔄 Step 2: Performing shuffle...
✅ Global shuffle completed successfully!
   - Shuffled: 4 purchases
   - Duration: 1234ms

✅ Shuffle test PASSED!
```

**Option B: Test via API (Alternative)**

```powershell
# Make sure backend server is running (in another terminal)
# Then test the endpoint:
$secret = "your-admin-secret-key-from-step-3"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

---

## STEP 6: Verify Firestore Documents Have orderingIndex

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Select your project: **clickalinks-frontend**
3. Go to **Firestore Database**
4. Open the **purchasedSquares** collection
5. Click on any document
6. **Verify it has these fields:**
   - ✅ `orderingIndex` (number: 0, 1, 2, or 3)
   - ✅ `lastShuffled` (timestamp)

**If documents don't have `orderingIndex`:**
- The shuffle didn't run successfully
- Check backend logs for errors
- Make sure Firebase Admin is properly configured

---

## STEP 7: Configure for Render (Production)

### 7A: Convert Service Account JSON to Single-Line String

**Option 1: Using PowerShell (Recommended)**

```powershell
# Read the JSON file
$jsonContent = Get-Content "C:\Clickalinks\Backend\firebase-service-account.json" -Raw

# Convert to single-line (remove line breaks and extra spaces)
$jsonSingleLine = ($jsonContent -replace '\s+', ' ').Trim()

# Display it (copy this output)
$jsonSingleLine
```

**Option 2: Manual Method**
1. Open `firebase-service-account.json` in Notepad
2. Copy ALL content
3. Go to https://jsonformatter.org/json-minify
4. Paste and click "Minify"
5. Copy the minified result

### 7B: Set Environment Variables in Render

1. Go to **Render Dashboard**: https://dashboard.render.com/
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these variables:

   **Variable 1:**
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste the single-line JSON from Step 7A
   - **Click Save**

   **Variable 2:**
   - **Key**: `ADMIN_SECRET_KEY`
   - **Value**: Your secret key from Step 3
   - **Click Save**

6. **Redeploy** your backend service

---

## STEP 8: Test Production Shuffle Endpoint

After deploying to Render:

```powershell
# Replace with your actual Render URL
$renderUrl = "https://your-backend.onrender.com"
$secret = "your-admin-secret-key"

# Test health endpoint (no auth needed)
Invoke-RestMethod -Uri "$renderUrl/admin/shuffle/health" -Method GET

# Test shuffle endpoint (requires auth)
Invoke-RestMethod -Uri "$renderUrl/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

---

## STEP 9: Set Up Render Cron Job

1. Go to **Render Dashboard** > **Cron Jobs**
2. Click **New Cron Job**
3. Configure:
   - **Name**: `clickalinks-shuffle`
   - **Schedule**: `0 */2 * * *` (every 2 hours)
   - **Command**: `cd Backend && node cron-shuffle.js`
   - **Environment Variables**: Same as backend service
     - `FIREBASE_SERVICE_ACCOUNT`
     - `ADMIN_SECRET_KEY`
4. Click **Create Cron Job**

---

## STEP 10: Deploy Frontend

**Now you're ready to deploy frontend!**

```powershell
cd C:\Clickalinks\frontend

# Build the frontend
npm run build

# Deploy (depending on your deployment method)
# Firebase Hosting:
firebase deploy

# Or Render:
# Push to git and Render will auto-deploy
```

---

## 🚨 Troubleshooting

### Error: "Firebase Admin not initialized"
**Fix:**
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Verify the JSON file exists at that path
- Check file permissions

### Error: "Cannot find module 'firebase-admin'"
**Fix:**
```powershell
cd Backend
npm install firebase-admin
```

### Error: "Unauthorized" when testing shuffle
**Fix:**
- Check `ADMIN_SECRET_KEY` is set correctly
- Use correct header format: `Secret your-key`
- Make sure there are no extra spaces

### Documents don't have orderingIndex after shuffle
**Fix:**
- Check backend logs for errors
- Verify Firebase Admin has write permissions
- Check Firestore rules allow writes

### Frontend shows no logos after deploy
**Fix:**
- Run shuffle at least once before deploying frontend
- Verify documents have `orderingIndex` field
- Check browser console for errors

---

## ✅ Success Checklist

- [ ] Firebase service account JSON file located
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` environment variable set
- [ ] `test-shuffle.js` runs successfully
- [ ] Admin secret key generated and saved
- [ ] Shuffle endpoint tested locally
- [ ] Firestore documents have `orderingIndex` field
- [ ] Environment variables set in Render
- [ ] Production shuffle endpoint tested
- [ ] Cron job configured
- [ ] Frontend ready to deploy

---

## 📞 Quick Reference Commands

```powershell
# Set local environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"

# Test shuffle locally
cd C:\Clickalinks\Backend
node test-shuffle.js

# Generate admin secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test API endpoint
$secret = "your-secret-key"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

