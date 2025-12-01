# Promo Code System Setup Guide

## Overview
This guide explains how to set up and use the production-ready promo code system for ClickaLinks.

## Features
- ✅ Backend validation (Firestore)
- ✅ Usage tracking and limits
- ✅ Expiry dates
- ✅ Multiple discount types (percent, fixed, free, free_days)
- ✅ Admin API for creating/managing codes
- ✅ Automatic usage tracking

---

## Step 1: Update Firestore Rules

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Promo codes collection
    match /promoCodes/{promoId} {
      // Allow public read for validation (frontend needs to check codes)
      allow read: if true;
      // Only backend can write (via Admin SDK)
      allow write: if false;
    }
    
    // Existing rules for purchasedSquares and clickAnalytics...
    match /purchasedSquares/{purchaseId} {
      allow read, write: if true;
    }
    
    match /clickAnalytics/{analyticsId} {
      allow read, write: if true;
    }
  }
}
```

**Note:** Promo codes are read-only from the frontend (for validation). Only the backend can create/update them.

---

## Step 2: Deploy Backend

The backend already includes:
- `Backend/services/promoCodeService.js` - Core promo code logic
- `Backend/routes/promoCode.js` - API endpoints
- Integration in `Backend/server.js`

**Deploy to Render.com:**
```bash
cd Backend
git add .
git commit -m "Add promo code system"
git push backend main
```

---

## Step 3: Create 200 Promo Codes for 10 Free Days

Run the script to create 200 promo codes:

```bash
cd Backend
node scripts/create-200-promo-codes.js
```

**Requirements:**
- Set `ADMIN_API_KEY` in your `.env` file (or Render.com environment variables)
- Set `BACKEND_URL` (defaults to `https://clickalinks-backend-2.onrender.com`)

**What it does:**
- Creates 200 unique codes with prefix `FREE10`
- Each code gives 10 free days
- Each code can only be used once (`maxUses: 1`)
- Codes are saved to `promo-codes-200.txt` for distribution

---

## Step 4: Test a Promo Code

1. Go to the payment page
2. Enter a promo code (e.g., `FREE10ABC123`)
3. Click "Apply"
4. The discount should be applied

**For free_days promo codes:**
- The price stays the same
- The duration extends by the number of free days
- Example: 30-day campaign + 10 free days = 40 days total

---

## Step 5: Create Custom Promo Codes (Admin)

### Option A: Using the API

```bash
curl -X POST https://clickalinks-backend-2.onrender.com/api/promo-code/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -d '{
    "code": "SUMMER2024",
    "discountType": "percent",
    "discountValue": 25,
    "description": "25% off summer campaign",
    "maxUses": 100,
    "expiryDate": "2024-12-31"
  }'
```

### Option B: Using PowerShell

```powershell
$body = @{
    code = "SUMMER2024"
    discountType = "percent"
    discountValue = 25
    description = "25% off summer campaign"
    maxUses = 100
    expiryDate = "2024-12-31"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "YOUR_ADMIN_API_KEY"
}

Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/api/promo-code/create" `
    -Method Post `
    -Body $body `
    -Headers $headers
```

---

## Discount Types

### 1. `percent` - Percentage Discount
```json
{
  "discountType": "percent",
  "discountValue": 50  // 50% off
}
```

### 2. `fixed` - Fixed Amount Discount
```json
{
  "discountType": "fixed",
  "discountValue": 10  // £10 off
}
```

### 3. `free` - 100% Off (Free Purchase)
```json
{
  "discountType": "free",
  "discountValue": 100  // 100% off (free)
}
```

### 4. `free_days` - Free Days (Extends Duration)
```json
{
  "discountType": "free_days",
  "discountValue": 10  // Adds 10 free days to campaign duration
}
```

---

## API Endpoints

### Validate Promo Code
```
POST /api/promo-code/validate
Body: { "code": "FREE10ABC123", "originalAmount": 30 }
```

### Apply Promo Code (Track Usage)
```
POST /api/promo-code/apply
Body: { "code": "FREE10ABC123", "purchaseId": "purchase-123" }
```

### Create Promo Code (Admin)
```
POST /api/promo-code/create
Headers: { "x-api-key": "YOUR_ADMIN_API_KEY" }
Body: { "code": "...", "discountType": "...", ... }
```

### Bulk Create Promo Codes (Admin)
```
POST /api/promo-code/bulk-create
Headers: { "x-api-key": "YOUR_ADMIN_API_KEY" }
Body: { "count": 200, "prefix": "FREE10", ... }
```

### List All Promo Codes (Admin)
```
GET /api/promo-code/list?active=true
Headers: { "x-api-key": "YOUR_ADMIN_API_KEY" }
```

---

## Environment Variables

Add to Render.com environment variables:

```env
ADMIN_API_KEY=your-secure-admin-api-key-here
BACKEND_URL=https://clickalinks-backend-2.onrender.com
```

---

## Frontend Integration

The frontend (`Payment.js`) already:
- ✅ Validates promo codes via backend API
- ✅ Applies discounts
- ✅ Handles free_days (extends duration)
- ✅ Passes promo code info to Success.js

The frontend (`Success.js`) already:
- ✅ Tracks promo code usage after purchase
- ✅ Displays correct duration (including free days)

---

## Next Steps

1. ✅ Deploy backend with promo code routes
2. ✅ Update Firestore rules
3. ✅ Create 200 promo codes using the script
4. ✅ Test promo code validation
5. ✅ Distribute codes to businesses

---

## Troubleshooting

### Promo code not validating
- Check Firestore rules allow `read` on `promoCodes`
- Check backend logs for validation errors
- Verify code exists in Firestore

### Usage not tracking
- Check `applyPromoCode` endpoint is called after purchase
- Verify `purchaseId` is passed correctly
- Check Firestore rules allow `update` on `promoCodes`

### Free days not applying
- Verify `discountType` is `free_days`
- Check `freeDays` is passed to `Success.js`
- Verify duration calculation includes free days

---

## Support

For issues or questions, check:
- Backend logs on Render.com
- Firestore console for promo code documents
- Browser console for frontend errors

