# Backend-Controlled Shuffle System Setup Guide

This guide explains how to set up the backend-controlled Fisher-Yates shuffle system.

## Overview

The shuffle system ensures:
- **Global consistency**: All users see the same shuffled order
- **Fairness**: Fisher-Yates algorithm ensures true randomness
- **Backend control**: Only backend can shuffle, preventing conflicts
- **Automatic rotation**: Cron job runs shuffle every 1-2 hours

## Architecture

1. **Backend (Node.js + Firestore Admin)**:
   - Fetches all 2000 active purchases
   - Runs Fisher-Yates shuffle
   - Assigns `orderingIndex` (0-1999) to each document
   - Writes back to Firestore using batch writes

2. **Frontend (React + Firebase)**:
   - Loads purchases sorted by `orderingIndex`
   - Splits into 10 pages (200 per page)
   - Displays in order - NO client-side shuffling

## Setup Steps

### 1. Install Dependencies

```bash
cd Backend
npm install firebase-admin
```

### 2. Configure Firebase Admin SDK

#### Option A: Service Account JSON (Recommended for Production)

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Convert JSON to environment variable string:
   ```bash
   # On Linux/Mac:
   cat service-account.json | jq -c
   
   # Or manually copy the JSON and minify it
   ```
5. Set in Render environment variables:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
   ```

#### Option B: Application Default Credentials (For Local Development)

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### 3. Set Admin Secret Key

Generate a secure random secret key:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in Render environment variables:
```
ADMIN_SECRET_KEY=your-generated-secret-key-here
```

### 4. Deploy Backend

```bash
cd Backend
npm install
npm start
```

### 5. Test Shuffle Endpoint

```bash
# Test shuffle manually
curl -X POST https://your-backend.onrender.com/admin/shuffle \
  -H "Authorization: Secret your-admin-secret-key" \
  -H "Content-Type: application/json"
```

### 6. Set Up Render Cron Job

1. Go to Render Dashboard > Cron Jobs
2. Click "New Cron Job"
3. Configure:
   - **Name**: `clickalinks-shuffle`
   - **Schedule**: `0 */2 * * *` (every 2 hours) or `0 * * * *` (every hour)
   - **Command**: `cd Backend && node cron-shuffle.js`
   - **Environment Variables**:
     - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
     - `ADMIN_SECRET_KEY`: Your admin secret key
     - `NODE_ENV`: `production`

### 7. Update Firestore Rules

The Firestore rules allow reads of `orderingIndex` but backend manages writes. Rules are already updated in `firestore-rules-complete.txt`.

### 8. Verify Frontend

The frontend has been updated to:
- Load purchases sorted by `orderingIndex`
- Split into pages (200 per page)
- Display in order

No additional frontend configuration needed.

## API Endpoints

### POST /admin/shuffle
Manually trigger a shuffle.

**Authentication**: Required (Admin Secret Key)
```
Authorization: Secret your-admin-secret-key
```

**Response**:
```json
{
  "success": true,
  "message": "Global shuffle completed successfully",
  "shuffledCount": 150,
  "batches": 1,
  "duration": 1234,
  "timestamp": "2025-01-XX..."
}
```

### GET /admin/shuffle/stats
Get shuffle statistics.

**Authentication**: Required (Admin Secret Key)

**Response**:
```json
{
  "success": true,
  "totalActive": 150,
  "withOrderingIndex": 150,
  "withoutOrderingIndex": 0,
  "lastShuffled": "2025-01-XX...",
  "needsShuffle": false
}
```

### GET /admin/shuffle/health
Health check (no authentication required).

## Testing

1. **Test Manual Shuffle**:
   ```bash
   curl -X POST http://localhost:10000/admin/shuffle \
     -H "Authorization: Secret your-secret"
   ```

2. **Check Stats**:
   ```bash
   curl http://localhost:10000/admin/shuffle/stats \
     -H "Authorization: Secret your-secret"
   ```

3. **Verify Frontend**:
   - Open website
   - Check browser console for shuffle logs
   - Verify purchases are displayed in order by `orderingIndex`

## Troubleshooting

### Error: "Firebase Admin not initialized"
- Check `FIREBASE_SERVICE_ACCOUNT` environment variable
- Verify JSON is properly formatted (no line breaks)

### Error: "Unauthorized"
- Check `ADMIN_SECRET_KEY` matches in request and environment
- Verify Authorization header format: `Secret your-key`

### Error: "No active purchases found"
- This is normal if no purchases exist yet
- Shuffle will run but won't update anything

### Frontend not showing shuffled order
- Check browser console for errors
- Verify `orderingIndex` field exists in Firestore documents
- Check Firestore rules allow reading `orderingIndex`

## Monitoring

Monitor shuffle operations:
- Check Render logs for cron job execution
- Monitor `/admin/shuffle/health` endpoint
- Check Firestore documents for `orderingIndex` and `lastShuffled` fields

## Security Notes

- **Admin Secret Key**: Keep secret, never commit to git
- **Firebase Service Account**: Keep secure, has full admin access
- **Cron Job**: Runs automatically, no manual intervention needed
- **Frontend**: Cannot modify `orderingIndex`, only backend can

