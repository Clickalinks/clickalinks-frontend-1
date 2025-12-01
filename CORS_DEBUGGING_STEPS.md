# 🔍 CORS Debugging Steps

## Current Issue
CORS error persists: "Request header field x-api-key is not allowed by Access-Control-Allow-Headers in preflight response"

## ✅ What We've Done

1. ✅ Removed `cors()` middleware completely
2. ✅ Implemented manual CORS handling
3. ✅ Added explicit header setting with `res.setHeader()`
4. ✅ Added comprehensive logging

## 🔍 Debugging Steps

### Step 1: Check Render.com Logs

Go to Render.com → Your Backend Service → Logs

Look for when you make a request:
- `🔍 CORS Preflight OPTIONS:` - Should appear for OPTIONS requests
- `🔍 Setting Access-Control-Allow-Headers to:` - Shows what headers are being set
- `✅ CORS Preflight Response Headers:` - Shows final headers

**If you DON'T see these logs:**
- The OPTIONS handler isn't being hit
- There might be a routing issue
- The deployment might not have the latest code

### Step 2: Test CORS Directly

Open browser console and run:
```javascript
fetch('https://clickalinks-backend-2.onrender.com/api/test-cors', {
  method: 'GET',
  headers: {
    'x-api-key': 'test'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

This will show if CORS is working for a simple GET request.

### Step 3: Check OPTIONS Request

Open browser DevTools → Network tab
1. Make a request to `/admin/shuffle/stats`
2. Look for the OPTIONS request (preflight)
3. Click on it and check:
   - **Request Headers:** Should include `Access-Control-Request-Headers: x-api-key`
   - **Response Headers:** Should include `Access-Control-Allow-Headers: ...` with `x-api-key` in it

### Step 4: Verify Deployment

Check Render.com → Your Backend Service → Events
- Look for the latest deployment
- Check the commit hash matches your latest commit
- If it's an old commit, manually trigger deployment

### Step 5: Manual Deployment

If auto-deploy isn't working:
1. Go to Render.com → Your Backend Service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Test again

## 🎯 Expected Behavior

When you make a request with `x-api-key` header:

1. **Browser sends OPTIONS preflight:**
   ```
   OPTIONS /admin/shuffle/stats
   Headers:
     Origin: http://localhost:3000
     Access-Control-Request-Method: GET
     Access-Control-Request-Headers: x-api-key
   ```

2. **Server responds:**
   ```
   204 No Content
   Headers:
     Access-Control-Allow-Origin: http://localhost:3000
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD
     Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key, X-API-Key, ...
     Access-Control-Allow-Credentials: true
     Access-Control-Max-Age: 86400
   ```

3. **Browser sends actual request:**
   ```
   GET /admin/shuffle/stats
   Headers:
     Origin: http://localhost:3000
     x-api-key: your-api-key
   ```

## ⚠️ If Still Not Working

1. **Check Render.com logs** - Are OPTIONS requests being logged?
2. **Verify deployment** - Is the latest code deployed?
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
4. **Check network tab** - What headers are actually being sent/received?

---

**Next:** Check Render.com logs to see if OPTIONS requests are being handled.

