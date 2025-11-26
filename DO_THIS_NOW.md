# 🎯 DO THIS NOW - Copy and Paste These Commands

## Open PowerShell and run these commands ONE BY ONE:

---

### COMMAND 1: Go to Backend folder
```powershell
cd C:\Clickalinks\Backend
```

**Press Enter**

---

### COMMAND 2: Copy your Firebase key file
```powershell
Copy-Item "C:\Users\mr_un\Downloads\clickalinks-frontend-firebase-adminsdk-fbsvc-04eb0da2db.json" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"
```

**Press Enter** (You should see the prompt again - no error means success!)

---

### COMMAND 3: Set environment variable
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
```

**Press Enter** (No output is normal!)

---

### COMMAND 4: Verify file was copied
```powershell
dir firebase-service-account.json
```

**Press Enter** (You should see the file listed)

---

### COMMAND 5: Test Firebase Admin
```powershell
node test-shuffle.js
```

**Press Enter** and wait for results!

---

## ✅ What Should Happen:

You should see:
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

---

## 🚨 If You See Errors:

**Error: "Cannot find module 'firebase-admin'"**
**Fix:** Run this first:
```powershell
npm install
```

**Error: "Firebase Admin not initialized"**
**Fix:** Make sure you ran COMMAND 3 correctly.

**Error: "Cannot find file"**
**Fix:** Make sure you ran COMMAND 2 correctly.

---

## 📋 Copy All Commands at Once:

```powershell
cd C:\Clickalinks\Backend
Copy-Item "C:\Users\mr_un\Downloads\clickalinks-frontend-firebase-adminsdk-fbsvc-04eb0da2db.json" -Destination "C:\Clickalinks\Backend\firebase-service-account.json"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Clickalinks\Backend\firebase-service-account.json"
dir firebase-service-account.json
node test-shuffle.js
```

