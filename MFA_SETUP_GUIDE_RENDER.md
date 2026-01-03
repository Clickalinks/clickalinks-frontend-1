# MFA Setup Guide - Step by Step for Render

## Prerequisites
✅ You've already set `ADMIN_PASSWORD_HASH` in Render environment variables

---

## Step 1: Deploy Your Code to Render (If Not Already Done)

1. **Push your code changes to GitHub** (if using Git deployment)
   - Make sure all the MFA code changes are committed and pushed
   
2. **Or deploy manually** - Render should auto-deploy if connected to your repo

---

## Step 2: Get the MFA Secret and QR Code

### Option A: Using Browser (Easiest)

1. **Open your backend URL in browser** (e.g., `https://clickalinks-backend-2.onrender.com`)

2. **Navigate to the MFA setup endpoint**:
   ```
   https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup
   ```
   (Replace with your actual Render backend URL)

3. **You should see JSON response** with:
   - `secret`: A long string (base32 encoded)
   - `qrCode`: A data URL with the QR code image
   - `instructions`: Steps to complete setup

4. **Right-click and "Save image as"** on the QR code, OR:
   - Copy the `secret` value (you'll need it)
   - Copy the entire JSON response for reference

### Option B: Using Terminal/Command Line

```bash
# Replace with your Render backend URL
curl https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup
```

This will return JSON with the secret and QR code.

### Option C: Using Postman or API Client

1. Create a new GET request
2. URL: `https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup`
3. Send request
4. Copy the `secret` value from the response

---

## Step 3: Scan QR Code with Authenticator App

1. **Install an authenticator app** on your phone (if you don't have one):
   - **Google Authenticator** (iOS/Android) - Recommended
   - **Authy** (iOS/Android)
   - **Microsoft Authenticator** (iOS/Android)

2. **Open the app** and tap "Add Account" or "+"

3. **Scan the QR code**:
   - **Option A**: If you saved the QR code image, open it and scan
   - **Option B**: If you have the QR code in browser, use your phone camera to scan it
   - **Option C**: Choose "Enter a setup key" and manually enter the `secret`

4. **Verify the account is added** - You should see "ClickALinks Admin" with a 6-digit code that changes every 30 seconds

---

## Step 4: Add MFA Secret to Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Navigate to your Backend Service**:
   - Click on your backend service (e.g., "clickalinks-backend-2")

3. **Go to Environment Tab**:
   - Click on **"Environment"** in the left sidebar
   - Or click the **"Environment"** tab at the top

4. **Add New Environment Variables**:

   **a. Add ADMIN_MFA_SECRET:**
   - Click **"Add Environment Variable"** or **"Add"** button
   - **Key**: `ADMIN_MFA_SECRET`
   - **Value**: Paste the `secret` value you copied from Step 2
   - Click **"Save Changes"**

   **b. Add ADMIN_MFA_ENABLED:**
   - Click **"Add Environment Variable"** again
   - **Key**: `ADMIN_MFA_ENABLED`
   - **Value**: `true` (lowercase, no quotes)
   - Click **"Save Changes"**

5. **Verify both variables are added**:
   - You should see:
     - `ADMIN_PASSWORD_HASH` = (your hash)
     - `ADMIN_MFA_SECRET` = (your secret)
     - `ADMIN_MFA_ENABLED` = `true`

---

## Step 5: Restart Your Render Service

1. **In Render Dashboard**, go to your backend service

2. **Click "Manual Deploy"** → **"Deploy latest commit"** (if using Git)
   OR
   **Click "Restart"** button (if available)

3. **Wait for deployment to complete** (usually 2-5 minutes)
   - Watch the logs to ensure it starts successfully
   - You should see: `✅ MFA is enabled and configured` in the logs

---

## Step 6: Test MFA Login

1. **Open your frontend admin dashboard**:
   - Navigate to your admin login page
   - Usually: `https://your-frontend-url/admin` or similar

2. **Enter your admin password** and click "Unlock Dashboard"

3. **If MFA is working, you should see**:
   - A new screen asking for "Multi-Factor Authentication"
   - An input field for "Enter the 6-digit code from your authenticator app"

4. **Open your authenticator app** on your phone

5. **Enter the 6-digit code** shown in the app for "ClickALinks Admin"

6. **Click "Verify Code"**

7. **If correct, you should be logged in!** ✅

---

## Troubleshooting

### Issue: "MFA not configured" error
- **Check**: Is `ADMIN_MFA_SECRET` set in Render environment variables?
- **Check**: Is `ADMIN_MFA_ENABLED=true` (lowercase, no quotes)?
- **Solution**: Restart your Render service after adding variables

### Issue: "Invalid MFA code" error
- **Check**: Are you using the correct 6-digit code from your authenticator app?
- **Check**: Is the code still valid? (Codes expire after 30 seconds)
- **Solution**: Wait for the code to refresh and try again

### Issue: Can't access `/api/admin/mfa/setup` endpoint
- **Check**: Is your backend deployed and running?
- **Check**: Are you using the correct URL?
- **Solution**: Try accessing your backend root URL first to verify it's running

### Issue: QR code not displaying
- **Solution**: Use the `secret` value directly and manually enter it in your authenticator app
- Or use a QR code generator website to create a QR code from the `otpauthUrl` in the response

---

## Security Notes

⚠️ **Important**:
- **Keep the MFA secret secure** - Don't share it or commit it to Git
- **Backup your authenticator app** - If you lose your phone, you'll need the secret to set up MFA again
- **Consider saving the secret in a password manager** for backup

---

## Disabling MFA (If Needed)

If you need to disable MFA temporarily:

1. **Go to Render Dashboard** → Your Backend Service → Environment
2. **Change** `ADMIN_MFA_ENABLED` from `true` to `false`
3. **Save changes**
4. **Restart your service**

Note: Your `ADMIN_MFA_SECRET` will remain, so you can easily re-enable MFA by setting `ADMIN_MFA_ENABLED=true` again.

---

## Summary Checklist

- [ ] Step 1: Code deployed to Render
- [ ] Step 2: Got MFA secret from `/api/admin/mfa/setup` endpoint
- [ ] Step 3: Scanned QR code with authenticator app
- [ ] Step 4: Added `ADMIN_MFA_SECRET` to Render environment variables
- [ ] Step 4: Added `ADMIN_MFA_ENABLED=true` to Render environment variables
- [ ] Step 5: Restarted Render service
- [ ] Step 6: Tested login with MFA code
- [ ] ✅ MFA is working!

---

## Quick Reference: Environment Variables in Render

Your Render environment variables should look like this:

```
ADMIN_PASSWORD_HASH = $2a$10$... (your bcrypt hash)
ADMIN_MFA_SECRET = ABCDEFGHIJKLMNOPQRSTUVWXYZ234567 (your base32 secret)
ADMIN_MFA_ENABLED = true
```

**Note**: Variable names are case-sensitive. Make sure they're exactly:
- `ADMIN_PASSWORD_HASH`
- `ADMIN_MFA_SECRET`  
- `ADMIN_MFA_ENABLED`

