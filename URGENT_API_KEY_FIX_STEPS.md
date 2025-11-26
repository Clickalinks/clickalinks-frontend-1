# 🚨 URGENT: Fix Exposed API Key - Step by Step

## ⚠️ CRITICAL: Your API key is exposed in GitHub!

**Google detected:** API key `AIzaSy...Zqk8` in your GitHub repository.

---

## ✅ IMMEDIATE ACTIONS (Do These Now!)

### Step 1: Regenerate API Key in Firebase Console

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/clickalinks-frontend/settings/general
   - Scroll to "Your apps" section
   - Click on your web app (or create one if needed)

2. **Get Your Current Config:**
   - Copy all the values (you'll need them)
   - **DO NOT copy the API key yet** - we'll regenerate it

3. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials?project=clickalinks-frontend
   - Find the API key (starts with `AIzaSy`)
   - Click **"Edit"** (pencil icon)

4. **Regenerate the Key:**
   - Click **"Regenerate Key"**
   - Confirm
   - **Copy the NEW key immediately** (you won't see it again!)

5. **Add Restrictions:**
   - Under **"API restrictions"** → Select **"Restrict key"**
   - Choose: **"Firebase APIs"**
   - Under **"Application restrictions"** → Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     https://clickalinks-frontend.web.app/*
     https://clickalinks-frontend.firebaseapp.com/*
     https://www.clickalinks.com/*
     http://localhost:3000/*
     ```
   - Click **"Save"**

---

### Step 2: Create `.env` File

1. **Open PowerShell in `frontend` folder:**
   ```powershell
   cd C:\Clickalinks\frontend
   ```

2. **Create `.env` file:**
   ```powershell
   @"
   REACT_APP_FIREBASE_API_KEY=PASTE_YOUR_NEW_KEY_HERE
   REACT_APP_FIREBASE_AUTH_DOMAIN=clickalinks-frontend.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=clickalinks-frontend
   REACT_APP_FIREBASE_STORAGE_BUCKET=clickalinks-frontend.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=568043553622
   REACT_APP_FIREBASE_APP_ID=1:568043553622:web:d8e928c8b26e2847e50cf7
   REACT_APP_BACKEND_URL=https://clickalinks-backend-2.onrender.com
   "@ | Out-File -FilePath .env -Encoding utf8
   ```

3. **Edit `.env` file:**
   - Open `.env` in Notepad
   - Replace `PASTE_YOUR_NEW_KEY_HERE` with your regenerated API key
   - Save and close

---

### Step 3: Remove Build Files from Git

**Remove the exposed build files:**

```powershell
cd C:\Clickalinks
git rm -r --cached frontend/build
git commit -m "Remove build files with exposed API key"
git push origin main
```

---

### Step 4: Test Locally

```powershell
cd C:\Clickalinks\frontend
npm start
```

- Website should load normally
- Check browser console for errors
- If it works, proceed to deploy

---

### Step 5: Rebuild and Deploy

```powershell
cd C:\Clickalinks\frontend
npm run build
firebase deploy
```

---

## ✅ Verification Checklist

- [ ] API key regenerated in Google Cloud Console
- [ ] API key restrictions added (HTTP referrers)
- [ ] `.env` file created with new key
- [ ] `.env` is NOT committed to Git (check with `git status`)
- [ ] Build files removed from Git
- [ ] Frontend rebuilt and deployed
- [ ] Website works after deployment

---

## 🔒 What I Fixed in Code

✅ **Updated `frontend/src/firebase.js`:**
- Now uses `process.env.REACT_APP_FIREBASE_API_KEY`
- No hardcoded keys

✅ **Updated `frontend/.gitignore`:**
- Ignores `.env` files
- Ignores `build/` folder
- Ignores Firebase service account files

✅ **Created `frontend/.env.example`:**
- Template for environment variables
- Safe to commit (no real keys)

---

## ⚠️ Important Notes

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Never commit `build/` folder** - it's now in `.gitignore`
3. **API restrictions prevent abuse** - always add them
4. **Old key is compromised** - regenerate immediately

---

## 🆘 If Something Breaks

1. **Check `.env` file exists** in `frontend/` folder
2. **Verify API key is correct** (no extra spaces)
3. **Check browser console** for errors
4. **Verify API restrictions** allow your domain

---

## 📞 Next Steps After Fix

1. ✅ Regenerate API key
2. ✅ Create `.env` file
3. ✅ Remove build files from Git
4. ✅ Rebuild and deploy
5. ✅ Test website

**DO THIS NOW - The exposed key could be abused!** 🚨

