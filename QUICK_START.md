# 🚀 Quick Start - 5 Minute Setup

## What You Need:
1. ✅ Firebase service account JSON file (you have this!)
2. ✅ Backend server running (already done!)

---

## STEP 1: Copy Service Account File to Backend Folder

```powershell
# Replace with YOUR actual file path
Copy-Item "C:\Users\YourName\Downloads\clickalinks-frontend-xxxxx.json" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"
```

---

## STEP 2: Set Environment Variable (PowerShell)

```powershell
cd C:\Clickalinks\Backend
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
```

---

## STEP 3: Generate Admin Secret

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** - this is your secret key!

---

## STEP 4: Test Shuffle

```powershell
node test-shuffle.js
```

**If you see "✅ Shuffle test PASSED!" - you're done!**

---

## STEP 5: Set Up Render (Production)

1. Go to Render Dashboard > Your Backend Service > Environment
2. Add variable: `FIREBASE_SERVICE_ACCOUNT` = (single-line JSON from your file)
3. Add variable: `ADMIN_SECRET_KEY` = (your secret from Step 3)
4. Redeploy backend

---

## That's It! 🎉

Now you can deploy the frontend!

