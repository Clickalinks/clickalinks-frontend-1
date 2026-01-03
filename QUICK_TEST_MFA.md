# Quick Test - MFA Endpoint

## The Problem
The HTML file shows "Failed to fetch" because local files (file:// protocol) can't make fetch requests to remote servers due to CORS restrictions.

## Solution: Test Directly in Browser

### Step 1: Test Root Endpoint
Open this URL directly in your browser:
```
https://clickalinks-backend-2.onrender.com/
```
**Expected**: Should show JSON like `{"status":"OK",...}`

### Step 2: Test MFA Setup Endpoint
Open this URL directly in your browser:
```
https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup
```

**If it works**, you should see JSON with:
- `success: true`
- `secret: "ABCDEFG..."` (long string)
- `qrCode: "data:image/png;base64,..."`
- `message: "MFA secret generated..."`

**If it doesn't work**, you'll see:
- "Cannot GET /api/admin/mfa/setup" (route not registered)
- Or an error page

### Step 3: Check Render Logs
After testing the URL, check Render logs for:
- `🔍 Registered admin routes:` - This will show if the route is registered
- `🔐 MFA setup middleware` - This will show if the request reached the handler
- Any error messages

## What to Report Back

Please tell me:
1. What you see when you open `https://clickalinks-backend-2.onrender.com/api/admin/mfa/setup`
2. What the Render logs show after you try the URL
3. Whether you see the route list in the logs (`🔍 Registered admin routes:`)

This will help us figure out if:
- The route is registered
- The request is reaching the handler
- There's an error in the handler

