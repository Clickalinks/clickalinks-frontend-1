# Troubleshooting: MFA Endpoint Not Working

## Quick Checks

### 1. Check Render Deployment Status
Go to Render Dashboard → Your Backend Service → Check:
- Is deployment status "Live" or still "Building"?
- Are there any error messages in the Logs tab?

### 2. Check Server Logs for Errors
In Render Dashboard → Logs tab, look for:
- ✅ `Admin authentication routes registered at /api/admin`
- ❌ Any errors about missing modules (speakeasy, qrcode, zxcvbn)
- ❌ Any errors about ADMIN_PASSWORD_HASH
- ❌ Any import errors

### 3. Test Other Admin Endpoints
Try these to see if admin routes work at all:
- `https://clickalinks-backend-2.onrender.com/api/admin/verify`
- `https://clickalinks-backend-2.onrender.com/` (root endpoint)

### 4. Check if Packages Are Installed
The server needs these new packages:
- `speakeasy`
- `qrcode`
- `zxcvbn`

If Render didn't install them, the server might have crashed on startup.

---

## Possible Issues and Fixes

### Issue 1: Server Crashed on Startup
**Symptom**: Deployment shows as "Live" but endpoint doesn't work

**Cause**: Missing `ADMIN_PASSWORD_HASH` environment variable

**Fix**:
1. Go to Render Dashboard → Your Service → Environment
2. Verify `ADMIN_PASSWORD_HASH` is set
3. If missing, add it
4. Restart the service

### Issue 2: Missing npm Packages
**Symptom**: Logs show "Cannot find module 'speakeasy'" or similar

**Fix**:
1. Go to Render Dashboard → Your Service
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. This forces npm install to run again

### Issue 3: Route Not Registered
**Symptom**: Other admin routes work but `/mfa/setup` doesn't

**Check**: Look at logs for the route registration message
**Fix**: May need to redeploy or check code

---

## Diagnostic Steps

### Step 1: Test Root Endpoint
```
https://clickalinks-backend-2.onrender.com/
```
Should return JSON with status.

### Step 2: Test Admin Verify Endpoint
```
https://clickalinks-backend-2.onrender.com/api/admin/verify
```
Should return an error about missing token (but confirms route exists).

### Step 3: Check Package.json
Make sure `package.json` includes:
```json
{
  "dependencies": {
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "zxcvbn": "^4.4.2"
  }
}
```

### Step 4: Force Rebuild
1. Render Dashboard → Your Service
2. "Manual Deploy" → "Clear build cache & deploy"
3. Wait 3-5 minutes
4. Try endpoint again

---

## Quick Fix: Test Locally First

If you want to test if the endpoint works locally:

1. Make sure `ADMIN_PASSWORD_HASH` is set in your `.env` file
2. Run: `cd Backend && npm install`
3. Run: `npm start`
4. Test: `http://localhost:10000/api/admin/mfa/setup`

If it works locally but not on Render, it's a deployment issue.

---

## Next Steps

1. **Check Render logs** - Most important!
2. **Verify environment variables** - ADMIN_PASSWORD_HASH must be set
3. **Clear cache and redeploy** - Forces fresh npm install
4. **Wait 5 minutes** after deployment completes
5. **Test again**

Let me know what you see in the Render logs!

