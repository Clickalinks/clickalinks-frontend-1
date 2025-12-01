# Pre-Deployment Checklist

## ✅ Backend Status
- [x] Backend server running on port 10000
- [x] All endpoints available (shuffle, stats, health)
- [x] Dependencies installed (firebase-admin added)

## ⚠️ Before Deploying Frontend - REQUIRED STEPS:

### 1. Configure Firebase Admin SDK (CRITICAL)

**Option A: Set FIREBASE_SERVICE_ACCOUNT environment variable**

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Convert to single-line JSON string:
   ```bash
   # On Windows PowerShell:
   $json = Get-Content service-account.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
   $json
   ```
5. Copy the output and set in Render environment variables:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"clickalinks-frontend",...}
   ```

**Option B: For local testing, set GOOGLE_APPLICATION_CREDENTIALS**
```bash
# Windows PowerShell:
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
```

### 2. Set Admin Secret Key

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in environment variables:
```
ADMIN_SECRET_KEY=your-generated-secret-here
```

### 3. Test Shuffle Endpoint

**Test locally:**
```bash
cd Backend
node test-shuffle.js
```

**Test via API (after setting ADMIN_SECRET_KEY):**
```bash
# Windows PowerShell:
$secret = "your-admin-secret-key"
Invoke-RestMethod -Uri "http://localhost:10000/admin/shuffle" -Method POST -Headers @{"Authorization"="Secret $secret"}
```

### 4. Run Initial Shuffle

**IMPORTANT:** Run shuffle at least once before deploying frontend to assign `orderingIndex` values:

```bash
# Via API:
curl -X POST http://localhost:10000/admin/shuffle -H "Authorization: Secret your-secret"

# Or use test script:
cd Backend
node test-shuffle.js
```

### 5. Verify Firestore Documents

Check that documents have `orderingIndex` field:
- Go to Firebase Console > Firestore
- Open a document in `purchasedSquares` collection
- Verify it has `orderingIndex` field (0-1999)
- Verify it has `lastShuffled` timestamp

### 6. Update Firestore Rules

Copy rules from `firestore-rules-complete.txt` to Firebase Console > Firestore > Rules

### 7. Deploy Frontend

Once shuffle is working:
```bash
cd frontend
npm run build
# Deploy to Firebase/Render
```

## 🚨 Common Issues

### Error: "Firebase Admin not initialized"
- **Fix**: Set `FIREBASE_SERVICE_ACCOUNT` environment variable
- **Or**: Set `GOOGLE_APPLICATION_CREDENTIALS` for local testing

### Error: "Unauthorized"
- **Fix**: Set `ADMIN_SECRET_KEY` environment variable
- **Fix**: Use correct Authorization header format: `Secret your-key`

### Frontend shows no logos after deploy
- **Cause**: No `orderingIndex` values assigned yet
- **Fix**: Run shuffle at least once before deploying frontend

### Documents don't have orderingIndex
- **Cause**: Shuffle hasn't run yet
- **Fix**: Run shuffle manually via `/admin/shuffle` endpoint

## ✅ Ready to Deploy Checklist

- [ ] Firebase Admin SDK configured (FIREBASE_SERVICE_ACCOUNT set)
- [ ] ADMIN_SECRET_KEY set
- [ ] Shuffle endpoint tested and working
- [ ] Initial shuffle run successfully
- [ ] Firestore documents have `orderingIndex` field
- [ ] Firestore rules updated
- [ ] Frontend code updated (no client-side shuffle)
- [ ] Backend deployed and running

## 🎯 Quick Test Commands

```bash
# Test shuffle stats (no auth required)
curl http://localhost:10000/admin/shuffle/health

# Test shuffle (requires auth)
curl -X POST http://localhost:10000/admin/shuffle -H "Authorization: Secret your-key"

# Test via Node script
cd Backend
node test-shuffle.js
```

