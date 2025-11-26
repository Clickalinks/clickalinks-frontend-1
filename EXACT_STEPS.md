# EXACT STEPS - Copy and Paste These Commands

## What You Need:
- Your Firebase private key JSON file (you have this!)
- PowerShell open

---

## STEP 1: Open PowerShell

1. Press `Windows Key + X`
2. Click "Windows PowerShell" or "Terminal"
3. You should see: `PS C:\Users\YourName>`

---

## STEP 2: Navigate to Backend Folder

**Copy and paste this EXACT command:**

```powershell
cd C:\Clickalinks\Backend
```

Press Enter. You should now see: `PS C:\Clickalinks\Backend>`

---

## STEP 3: Copy Your Firebase Key File

**You need to tell PowerShell where YOUR file is.**

**Example:** If your file is at `C:\Users\YourName\Downloads\clickalinks-frontend-abc123.json`

**Copy and paste this command (BUT CHANGE THE PATH TO YOUR FILE):**

```powershell
Copy-Item "C:\Users\YourName\Downloads\clickalinks-frontend-abc123.json" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"
```

**HOW TO FIND YOUR FILE PATH:**
1. Open File Explorer
2. Navigate to where your Firebase JSON file is
3. Right-click on the file
4. Click "Properties"
5. Copy the "Location" path
6. The full path = Location + "\" + filename

**Example:**
- Location: `C:\Users\John\Downloads`
- Filename: `clickalinks-frontend-abc123.json`
- Full path: `C:\Users\John\Downloads\clickalinks-frontend-abc123.json`

---

## STEP 4: Tell Firebase Admin Where the File Is

**Copy and paste this EXACT command:**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
```

Press Enter. (You won't see any output - that's OK!)

---

## STEP 5: Verify the File Was Copied

**Copy and paste this EXACT command:**

```powershell
dir firebase-service-account.json
```

**You should see:** The file listed. If you see "file not found", go back to Step 3.

---

## STEP 6: Test Firebase Admin

**Copy and paste this EXACT command:**

```powershell
node test-shuffle.js
```

**What should happen:**
- You'll see messages like "Testing shuffle system..."
- Then "Getting shuffle stats..."
- Then "Performing shuffle..."
- Finally: "✅ Shuffle test PASSED!"

**If you see an error:** Copy the error message and tell me what it says.

---

## STEP 7: Generate Admin Secret Key

**Copy and paste this EXACT command:**

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**You'll see:** A long string of random letters and numbers

**COPY THIS STRING** - you'll need it later!

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

## STEP 8: Test Shuffle Endpoint

**Copy and paste this command (BUT REPLACE "your-secret-key" with the string from Step 7):**

```powershell
$secret = "your-secret-key-here"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

**Example (if your secret is `abc123`):**
```powershell
$secret = "abc123"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

**You should see:** A success message with shuffle results.

---

## ✅ DONE!

If all steps worked, you're ready to deploy!

---

## 🚨 IF YOU GET ERRORS:

**Error: "Cannot find module 'firebase-admin'"**
**Fix:** Run this command:
```powershell
npm install
```

**Error: "Firebase Admin not initialized"**
**Fix:** Check Step 4 - make sure you set the environment variable correctly.

**Error: "Cannot find file"**
**Fix:** Check Step 3 - make sure you copied the file correctly.

**Error: "Unauthorized"**
**Fix:** Check Step 7 - make sure you copied the secret key correctly.

---

## 📝 QUICK REFERENCE - All Commands in Order:

```powershell
# 1. Navigate to Backend
cd C:\Clickalinks\Backend

# 2. Copy Firebase key file (CHANGE THE PATH!)
Copy-Item "YOUR_FILE_PATH_HERE" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"

# 3. Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"

# 4. Verify file exists
dir firebase-service-account.json

# 5. Test Firebase Admin
node test-shuffle.js

# 6. Generate secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 7. Test shuffle endpoint (REPLACE secret with your key from step 6)
$secret = "your-secret-key-here"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

