# 🚨 URGENT: API Key Security Fix

## Problem
Your Firebase API key was exposed in GitHub and detected by Google Cloud Platform security.

**Exposed Key:** `AIzaSy...Zqk8` (found in build files)

---

## ✅ IMMEDIATE ACTIONS REQUIRED

### Step 1: Regenerate the API Key (DO THIS FIRST!)

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/clickalinks-frontend/settings/general
   - Or: Google Cloud Console → APIs & Services → Credentials

2. **Find the Exposed Key:**
   - Look for API key starting with `AIzaSy...Zqk8`
   - Click **"Edit"** (pencil icon)

3. **Regenerate the Key:**
   - Click **"Regenerate Key"** button
   - Confirm the regeneration
   - **Copy the NEW key immediately** (you won't see it again)

4. **Add API Key Restrictions:**
   - Under "API restrictions", select **"Restrict key"**
   - Choose: **"Firebase APIs"** or specific APIs you use
   - Under "Application restrictions", select **"HTTP referrers"**
   - Add your domains:
     - `https://clickalinks-frontend.web.app/*`
     - `https://clickalinks-frontend.firebaseapp.com/*`
     - `https://www.clickalinks.com/*`
     - `http://localhost:3000/*` (for development)

5. **Save Changes**

---

### Step 2: Update Your Code

I've already updated `frontend/src/firebase.js` to use environment variables.

**Now you need to:**

1. **Create `.env` file in `frontend/` directory:**
   ```bash
   cd frontend
   ```

2. **Create `.env` file with your NEW API key:**
   ```env
   REACT_APP_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
   REACT_APP_FIREBASE_AUTH_DOMAIN=clickalinks-frontend.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=clickalinks-frontend
   REACT_APP_FIREBASE_STORAGE_BUCKET=clickalinks-frontend.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=568043553622
   REACT_APP_FIREBASE_APP_ID=1:568043553622:web:d8e928c8b26e2847e50cf7
   ```

3. **Replace `YOUR_NEW_API_KEY_HERE` with the regenerated key**

---

### Step 3: Remove Exposed Key from Git History

**Option A: Remove from Recent Commits (Easier)**
```bash
# Remove build files from Git
git rm -r --cached frontend/build
git commit -m "Remove build files with exposed API key"
git push
```

**Option B: Clean Git History (More thorough, but complex)**
- Use `git filter-branch` or BFG Repo-Cleaner
- Or contact GitHub support for help

---

### Step 4: Update Firebase Hosting Environment Variables

If you're using Firebase Hosting:

1. **Go to Firebase Console → Hosting**
2. **Click "Add custom domain" or edit existing**
3. **Add environment variables:**
   - `REACT_APP_FIREBASE_API_KEY` = Your new key
   - (Other Firebase config vars)

**OR** if using GitHub Actions or CI/CD:
- Add environment variables in your deployment pipeline

---

### Step 5: Rebuild and Deploy

```bash
cd frontend
npm run build
# Deploy to Firebase Hosting
firebase deploy
```

---

## ✅ Verification Checklist

- [ ] API key regenerated in Firebase Console
- [ ] API key restrictions added (HTTP referrers)
- [ ] `.env` file created with new key
- [ ] `.env` is in `.gitignore` (already done)
- [ ] Code updated to use environment variables (already done)
- [ ] Build files removed from Git
- [ ] Frontend rebuilt and redeployed
- [ ] Test that website still works

---

## 🔒 Security Best Practices Going Forward

1. **Never commit API keys to Git**
2. **Always use environment variables**
3. **Add API key restrictions in Google Cloud Console**
4. **Don't commit `build/` folder** (add to `.gitignore`)
5. **Use different keys for dev/staging/production**

---

## 📋 Files Changed

- ✅ `frontend/src/firebase.js` - Now uses environment variables
- ✅ `frontend/.env.example` - Template for environment variables
- ✅ `frontend/.gitignore` - Updated to ignore `.env` files

---

## ⚠️ Important Notes

- **The old API key is compromised** - regenerate it immediately
- **Build files contain the old key** - remove them from Git
- **Environment variables are safe** - they're not committed to Git
- **API restrictions prevent abuse** - add them in Google Cloud Console

---

## Need Help?

If you need assistance:
1. Check Firebase Console for API key management
2. Review Google Cloud Console → APIs & Services → Credentials
3. Test locally with `.env` file before deploying

**DO THIS NOW - The exposed key could be abused!** 🚨

