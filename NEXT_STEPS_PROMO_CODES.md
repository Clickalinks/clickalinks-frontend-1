# Next Steps: Promo Code System

## ✅ What's Been Completed

1. ✅ **Backend Promo Code Service** (`Backend/services/promoCodeService.js`)
   - Validation logic
   - Usage tracking
   - Bulk creation
   - Multiple discount types

2. ✅ **Backend API Routes** (`Backend/routes/promoCode.js`)
   - `/api/promo-code/validate` - Validate codes
   - `/api/promo-code/apply` - Track usage
   - `/api/promo-code/create` - Create single code (admin)
   - `/api/promo-code/bulk-create` - Create multiple codes (admin)
   - `/api/promo-code/list` - List all codes (admin)

3. ✅ **Frontend Integration**
   - `Payment.js` - Validates codes via backend API
   - `Success.js` - Tracks usage after purchase
   - Handles `free_days` discount type (extends duration)

4. ✅ **Firestore Rules** - Updated to allow promo code reads

5. ✅ **Script to Create 200 Codes** (`Backend/scripts/create-200-promo-codes.js`)

---

## 🚀 What You Need to Do Next

### Step 1: Update Firestore Rules

Copy the updated rules from `firestore-rules-complete.txt` to Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the entire content from `firestore-rules-complete.txt`
3. Paste and click "Publish"

**Important:** The rules now include:
```javascript
match /promoCodes/{promoId} {
  allow read: if true;  // Frontend can validate codes
  allow write: if false; // Only backend can create/update
}
```

---

### Step 2: Deploy Backend

Push the new code to Render.com:

```bash
cd Backend
git add .
git commit -m "Add promo code system with backend validation"
git push backend main
```

**Wait for deployment to complete** (check Render.com dashboard)

---

### Step 3: Set Environment Variables

In Render.com → Your Backend Service → Environment:

Add/verify:
- `ADMIN_API_KEY` - Your secure admin API key (for creating promo codes)
- `BACKEND_URL` - `https://clickalinks-backend-2.onrender.com` (or your URL)

---

### Step 4: Create 200 Promo Codes

Run the script to create 200 codes for your 10 free days campaign:

```bash
cd Backend
node scripts/create-200-promo-codes.js
```

**What happens:**
- Creates 200 unique codes (e.g., `FREE10ABC123`, `FREE10XYZ789`)
- Each code gives 10 free days
- Each code can only be used once
- Codes saved to `promo-codes-200.txt`

**Distribute these codes** to your 200 businesses!

---

### Step 5: Test a Promo Code

1. Go to your website
2. Select a square and proceed to payment
3. Enter one of the promo codes (e.g., `FREE10ABC123`)
4. Click "Apply"
5. Verify:
   - Code validates successfully
   - Duration extends by 10 days (if `free_days` type)
   - Or discount applies (if `percent`/`fixed` type)

---

### Step 6: Deploy Frontend (Optional)

If you made changes to `Payment.js` or `Success.js`:

```bash
cd frontend
npm run build
firebase deploy
```

---

## 📋 Promo Code Features

### Discount Types Supported:

1. **`percent`** - Percentage discount (e.g., 25% off)
2. **`fixed`** - Fixed amount discount (e.g., £10 off)
3. **`free`** - 100% off (free purchase)
4. **`free_days`** - Adds free days to campaign duration (e.g., +10 days)

### Usage Tracking:

- Each code tracks how many times it's been used
- Can set `maxUses` limit (e.g., 1 = one-time use)
- Automatically deactivates when max uses reached

### Expiry Dates:

- Set `expiryDate` to make codes expire
- Set `startDate` to activate codes in the future

---

## 🎯 Example: Creating Custom Promo Codes

### Using PowerShell:

```powershell
# Create a 25% off code
$body = @{
    code = "SUMMER25"
    discountType = "percent"
    discountValue = 25
    description = "25% off summer campaign"
    maxUses = 50
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

## 🔍 Monitoring

### Check Promo Code Usage:

```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  https://clickalinks-backend-2.onrender.com/api/promo-code/list
```

### View in Firestore:

1. Go to Firebase Console → Firestore Database
2. Open `promoCodes` collection
3. See all codes, usage counts, expiry dates, etc.

---

## ❓ Troubleshooting

### Code not validating?
- Check Firestore rules allow `read` on `promoCodes`
- Verify code exists in Firestore
- Check backend logs on Render.com

### Usage not tracking?
- Verify `applyPromoCode` endpoint is called after purchase
- Check `Success.js` calls `/api/promo-code/apply`
- Verify `purchaseId` is passed correctly

### Free days not applying?
- Verify `discountType` is `free_days`
- Check `freeDays` value is passed to `Success.js`
- Verify duration calculation includes free days

---

## 📞 Support

If you encounter issues:
1. Check backend logs on Render.com
2. Check browser console for frontend errors
3. Verify Firestore rules are published
4. Test promo code validation endpoint directly

---

**You're all set!** 🎉 The promo code system is ready to use. Just follow the steps above to deploy and create your 200 codes.

