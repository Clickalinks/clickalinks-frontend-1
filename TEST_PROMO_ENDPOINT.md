# Test Promo Code Endpoint

## Wait for Render to Redeploy

Render is currently redeploying with the latest code. **Wait 2-3 minutes**, then test:

---

## Test 1: Check if Endpoint Exists

```powershell
Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/api/promo-code/validate" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"code":"TEST"}'
```

**Expected Response:**
```json
{
  "success": false,
  "valid": false,
  "error": "Promo code not found or inactive"
}
```

If you get this JSON response (even if it says "not found"), the endpoint is working! ✅

---

## Test 2: Create 200 Promo Codes

Once the endpoint works, run:

```powershell
cd C:\Clickalinks\Backend
$env:ADMIN_API_KEY="6cc24eab41af376017cded8495cdc9e445a3d59ca0b2f75df6f17d77cc52dfce"
node scripts/create-200-promo-codes.js
```

---

## Check Deployment Status

1. Go to **Render.com** → Your Backend Service
2. Click **Events** tab
3. Look for the latest deployment:
   - ✅ **"Deploy succeeded"** - Ready to test!
   - ⏳ **"Deploying..."** - Still deploying (wait)

---

## Check Logs for Promo Code Endpoints

After deployment, check **Logs** tab. You should see:

```
✅ Promo code validation available at: POST /api/promo-code/validate
✅ Promo code bulk create available at: POST /api/promo-code/bulk-create
```

If you see these lines, the endpoints are loaded! ✅

---

## If Still Getting HTML Response

If you still get HTML instead of JSON:

1. **Check Render logs** for import errors
2. **Verify** `services/promoCodeService.js` exists
3. **Check** if `firebase-admin` is installed (required for promo code service)

---

## Quick Fix: Check Package Dependencies

The promo code service uses `firebase-admin`. Make sure it's in `package.json`:

```bash
cd Backend
cat package.json | Select-String "firebase-admin"
```

If it's missing, add it:
```bash
npm install firebase-admin
git add package.json package-lock.json
git commit -m "Add firebase-admin dependency"
git push origin main
```

