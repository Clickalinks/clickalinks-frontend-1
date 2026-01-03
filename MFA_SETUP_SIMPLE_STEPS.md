# MFA Setup - Simple Step-by-Step Guide

## 🎯 Goal
Set up Multi-Factor Authentication (MFA) for your admin login using Render.

---

## ✅ Step 1: Get Your MFA Secret

### In Your Web Browser:

1. Open a new browser tab
2. Go to: `https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup`
   (Replace with your actual Render backend URL if different)

3. You should see a JSON response that looks like:
```json
{
  "success": true,
  "secret": "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "otpauthUrl": "otpauth://totp/ClickALinks%20Admin?secret=...",
  "message": "MFA secret generated...",
  "instructions": [...]
}
```

4. **COPY the `secret` value** - You'll need this in Step 3
   - It's a long string of letters and numbers (base32 encoded)
   - Example: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`

5. **(Optional) Save the QR code**:
   - The `qrCode` value is a base64 image
   - You can use an online base64 decoder or just use the secret directly

---

## ✅ Step 2: Set Up Authenticator App on Your Phone

1. **Download an authenticator app** (if you don't have one):
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android)
   - Microsoft Authenticator (iOS/Android)

2. **Open the app** and tap:
   - "Add Account" or "+" or "Scan QR Code"

3. **Two options**:
   
   **Option A - Scan QR Code:**
   - If you saved the QR code image, scan it
   - OR take a screenshot of the QR code displayed in a QR code viewer
   
   **Option B - Manual Entry (Easier):**
   - Choose "Enter a setup key" or "Manual Entry"
   - **Account Name**: `ClickALinks Admin`
   - **Key/Secret**: Paste the `secret` you copied in Step 1
   - **Type**: Time-based (TOTP)
   - Tap "Add" or "Save"

4. **Verify it's working**: You should see "ClickALinks Admin" with a 6-digit code that updates every 30 seconds

---

## ✅ Step 3: Add Environment Variables in Render

### A. Go to Render Dashboard

1. Open: https://dashboard.render.com
2. Log in with your Render account

### B. Find Your Backend Service

1. Click on **"Services"** in the left sidebar (or on your dashboard)
2. Find and click on your backend service name
   - Usually something like "clickalinks-backend" or "clickalinks-backend-2"

### C. Add Environment Variables

1. **Click on "Environment"** tab (top menu or left sidebar)

2. **Add ADMIN_MFA_SECRET**:
   - Click the **"Add Environment Variable"** button (or **"Add"**)
   - **Key** (variable name): `ADMIN_MFA_SECRET`
   - **Value**: Paste the secret you copied in Step 1
     - Example: `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`
   - Click **"Save Changes"** or **"Add"**

3. **Add ADMIN_MFA_ENABLED**:
   - Click **"Add Environment Variable"** again
   - **Key**: `ADMIN_MFA_ENABLED`
   - **Value**: `true` (lowercase, no quotes, just the word true)
   - Click **"Save Changes"** or **"Add"**

### D. Verify Your Variables

You should now see these 3 environment variables:
```
ADMIN_PASSWORD_HASH = $2a$10$... (your existing hash)
ADMIN_MFA_SECRET = ABCDEFGHIJKLMNOPQRSTUVWXYZ234567 (new)
ADMIN_MFA_ENABLED = true (new)
```

---

## ✅ Step 4: Restart Your Service

### Option 1: Manual Deploy
1. Still in Render dashboard, on your service page
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait for deployment (2-5 minutes)
5. Check the logs - you should see: `✅ MFA is enabled and configured`

### Option 2: Auto-Deploy (If Connected to Git)
1. Render will auto-deploy when it detects environment variable changes
2. Just wait a few minutes and check the logs

---

## ✅ Step 5: Test MFA Login

1. **Go to your admin login page**:
   - Usually: `https://your-frontend-url.com/admin` or similar
   - Or wherever you access the admin dashboard

2. **Enter your admin password** and click "Unlock Dashboard"

3. **You should see a NEW screen** asking for:
   - "Multi-Factor Authentication"
   - "Enter the 6-digit code from your authenticator app"
   - An input field for 6 digits

4. **Open your authenticator app** on your phone

5. **Find "ClickALinks Admin"** in the app

6. **Enter the 6-digit code** shown next to it

7. **Click "Verify Code"**

8. **Success!** ✅ You should now be logged into the admin dashboard!

---

## 🔧 Troubleshooting

### "MFA not configured" error
- Go back to Render → Environment tab
- Make sure both variables are set:
  - `ADMIN_MFA_SECRET` = (your secret)
  - `ADMIN_MFA_ENABLED` = `true` (lowercase)
- Restart your service

### "Invalid MFA code" error
- Make sure you're entering the current 6-digit code
- Codes change every 30 seconds - wait for it to refresh if needed
- Double-check you're looking at "ClickALinks Admin" in your app

### Can't see the MFA setup endpoint
- Make sure your backend is running on Render
- Check the URL is correct: `https://your-backend-url.onrender.com/api/admin/mfa/setup`
- Try accessing your backend root first: `https://your-backend-url.onrender.com/`

### QR code doesn't work
- Use manual entry instead (Option B in Step 2)
- Just paste the secret directly into your authenticator app

---

## 📋 Quick Checklist

Copy and check off as you go:

- [ ] Opened `/api/admin/mfa/setup` in browser
- [ ] Copied the `secret` value
- [ ] Installed authenticator app on phone
- [ ] Added "ClickALinks Admin" to authenticator app using the secret
- [ ] Went to Render dashboard → My Service → Environment
- [ ] Added `ADMIN_MFA_SECRET` with the secret value
- [ ] Added `ADMIN_MFA_ENABLED` with value `true`
- [ ] Restarted/deployed my Render service
- [ ] Tested login - password works
- [ ] Tested login - MFA code works
- [ ] ✅ MFA is fully working!

---

## 💡 Pro Tips

1. **Save the secret somewhere safe** - If you lose your phone, you'll need it to set up MFA again
2. **Test immediately** - Set up MFA and test login right away to make sure it works
3. **Keep authenticator app backed up** - Some apps (like Authy) can sync across devices

---

## 🆘 Need Help?

If you're stuck:
1. Check the Render service logs for any errors
2. Make sure all 3 environment variables are set correctly
3. Verify the secret is correct (no extra spaces, complete string)
4. Try disabling MFA temporarily (`ADMIN_MFA_ENABLED=false`) to test login without it

---

**That's it!** Once you complete these steps, your admin login will be protected with MFA. 🔒

