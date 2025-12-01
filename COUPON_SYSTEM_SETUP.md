# 🎫 Coupon System - Complete Setup Guide

## ✅ What's Been Built

A complete coupon/promo code system has been implemented with:

### Backend Components:
1. **Backend Service** (`Backend/services/promoCodeService.js`)
   - Firestore-based promo code storage
   - Validation, creation, bulk creation, and usage tracking
   - Supports multiple discount types: percent, fixed, free, free_days

2. **Backend Routes** (`Backend/routes/promoCode.js`)
   - `POST /api/promo-code/validate` - Validate a promo code
   - `POST /api/promo-code/apply` - Track promo code usage
   - `POST /api/promo-code/create` - Create single promo code (admin)
   - `POST /api/promo-code/bulk-create` - Bulk create promo codes (admin)
   - `GET /api/promo-code/list` - List all promo codes (admin)

### Frontend Components:
1. **CouponManager Component** (`frontend/src/components/CouponManager.js`)
   - Admin interface for creating and managing promo codes
   - Single code creation
   - Bulk code creation (up to 1000 codes)
   - View all codes with stats

2. **Payment Integration** (`frontend/src/components/Payment.js`)
   - Promo code input field
   - Real-time validation
   - Discount calculation and display
   - Free purchase handling (when discount = 100%)

3. **Admin Dashboard** (`frontend/src/components/AdminDashboard.js`)
   - Added "Coupons" tab
   - Integrated CouponManager component

## 🔧 Setup Requirements

### 1. Environment Variables

#### Backend (.env in Backend folder):
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

ADMIN_API_KEY=your-secret-admin-api-key-here
```

#### Frontend (.env in frontend folder):
```env
REACT_APP_BACKEND_URL=https://clickalinks-backend-2.onrender.com
REACT_APP_ADMIN_API_KEY=your-secret-admin-api-key-here
```

### 2. Firestore Rules

The Firestore rules already include promo codes support:
```javascript
match /promoCodes/{promoId} {
  allow read: if true;  // Frontend can read for validation
  allow write: if false; // Only backend can write (via Admin SDK)
}
```

**Note:** Rules are already configured in `firestore-rules-complete.txt`

### 3. Firebase Admin Setup

The backend service automatically initializes Firebase Admin using:
1. `FIREBASE_SERVICE_ACCOUNT` environment variable (JSON string)
2. OR `GOOGLE_APPLICATION_CREDENTIALS` file path
3. OR Application Default Credentials

## 🚀 How to Use

### Creating Promo Codes (Admin):

1. **Access Admin Dashboard:**
   - Go to `/admin` route
   - Enter admin password

2. **Create Single Code:**
   - Click "Coupons" tab
   - Select "Create Single Code"
   - Fill in:
     - Code (or click Generate)
     - Discount Type (percent, fixed, free, free_days)
     - Discount Value
     - Description
     - Max Uses
     - Optional: Start Date, Expiry Date
   - Click "Create Promo Code"

3. **Bulk Create:**
   - Select "Bulk Create" tab
   - Enter prefix (e.g., "PROMO")
   - Set count (1-1000)
   - Configure discount settings
   - Click "Create X Promo Codes"

### Using Promo Codes (Customer):

1. **During Checkout:**
   - On payment page, find "Have a Promo Code?" section
   - Enter promo code
   - Click "Apply"
   - Discount is applied automatically

2. **Discount Types:**
   - **Percent:** Reduces price by percentage (e.g., 10% off)
   - **Fixed:** Reduces price by fixed amount (e.g., £10 off)
   - **Free:** Makes purchase 100% free
   - **Free Days:** Adds free days to duration (price stays same)

## 📊 Features

- ✅ Real-time validation
- ✅ Usage tracking
- ✅ Expiry date support
- ✅ Start date support
- ✅ Maximum uses limit
- ✅ Bulk code generation
- ✅ Export codes to text file
- ✅ Free purchase handling
- ✅ Free days support
- ✅ Admin dashboard integration

## 🔍 Testing

### Test Promo Code Creation:
1. Go to Admin Dashboard → Coupons
2. Create a test code: `TEST10` with 10% discount
3. Use it on payment page

### Test Validation:
```bash
curl -X POST https://clickalinks-backend-2.onrender.com/api/promo-code/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST10","originalAmount":10}'
```

## ⚠️ Important Notes

1. **Admin API Key:** Must be set in both backend and frontend `.env` files
2. **Firebase Admin:** Backend needs Firebase Admin credentials to write to Firestore
3. **Free Purchases:** When discount = 100%, payment is skipped and purchase is marked as paid
4. **Free Days:** Extends duration without reducing price
5. **Usage Tracking:** Promo code usage is automatically tracked when applied

## 🐛 Troubleshooting

### Promo codes not validating:
- Check backend logs for errors
- Verify Firestore rules allow reads
- Check ADMIN_API_KEY is set correctly

### Can't create promo codes:
- Verify ADMIN_API_KEY matches in backend and frontend
- Check Firebase Admin is initialized correctly
- Check backend logs for initialization errors

### Free purchases not working:
- Check promo code discount type is "free"
- Verify finalAmountAfterDiscount === 0
- Check browser console for errors

## 📝 Next Steps

1. Set up environment variables
2. Test creating a promo code
3. Test applying a promo code during checkout
4. Monitor usage in admin dashboard

