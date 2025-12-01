# Admin Promo Codes Setup Guide

## Overview

The Admin Promo Codes page allows you to create and manage promo codes directly from the admin dashboard. You can create single codes or bulk create hundreds of codes at once.

## Access

1. Go to `/admin` on your website
2. Enter the admin password
3. Click on the **🎫 Coupon Manager** tab

## Setup Instructions

### Step 1: Set Admin API Key

The admin page needs the `ADMIN_API_KEY` to authenticate with the backend API.

**For Local Development:**

1. Create a `.env` file in the `frontend/` directory (if it doesn't exist)
2. Add this line:
   ```
   REACT_APP_ADMIN_API_KEY=your_admin_api_key_here
   REACT_APP_BACKEND_URL=https://clickalinks-backend-2.onrender.com
   ```
3. Replace `your_admin_api_key_here` with your actual `ADMIN_API_KEY` from Render.com
4. Restart your development server (`npm start`)

**For Production (Firebase Hosting):**

1. Go to Firebase Console → Your Project → Hosting
2. Click on "Environment Variables" or go to Project Settings → General
3. Add environment variable:
   - **Name:** `REACT_APP_ADMIN_API_KEY`
   - **Value:** Your `ADMIN_API_KEY` (same as in Render.com)
4. Also add:
   - **Name:** `REACT_APP_BACKEND_URL`
   - **Value:** `https://clickalinks-backend-2.onrender.com`
5. Redeploy your frontend

**Note:** The `ADMIN_API_KEY` should be the same value you set in Render.com for the backend.

## Features

### Create Single Promo Code

1. Click **➕ Create Single Code** tab
2. Fill in the form:
   - **Promo Code:** Enter a code (e.g., `FREE10-TEST123`) or click "Generate" for a random code
   - **Discount Type:** Choose from:
     - **Free Days:** Adds free days to the purchase (e.g., 10 free days)
     - **Percentage Off:** Percentage discount (e.g., 50% off)
     - **Fixed Amount Off:** Fixed discount in £ (e.g., £10 off)
     - **100% Free:** Makes the purchase completely free
   - **Discount Value:** The value based on the discount type
   - **Description:** A description of the promo (shown to users)
   - **Maximum Uses:** How many times the code can be used (1 = one-time use)
   - **Start Date** (Optional): When the code becomes active
   - **Expiry Date** (Optional): When the code expires
3. Click **✅ Create Promo Code**

### Bulk Create Promo Codes

1. Click **📦 Bulk Create** tab
2. Fill in the form:
   - **Number of Codes:** How many codes to create (1-1000)
   - **Prefix:** Prefix for all codes (e.g., `FREE10`)
   - Each code will be: `PREFIX-XXXXXX` (random 6-character suffix)
   - **Discount Type:** Same as single create
   - **Discount Value:** Same as single create
   - **Description:** Description for all codes
   - **Maximum Uses:** Uses per code (1 = one-time use per code)
   - **Start Date** (Optional): When codes become active
   - **Expiry Date** (Optional): When codes expire
3. Click **✅ Create [N] Promo Codes**

**Example:** Creating 200 codes with prefix `FREE10` will create:
- `FREE10-ABC123`
- `FREE10-XYZ789`
- `FREE10-DEF456`
- ... (198 more)

### View All Promo Codes

The bottom section shows all promo codes with:
- Code
- Discount Type
- Discount Value
- Description
- Usage (used / max uses)
- Status (Active, Used, or Expired)
- Created Date

### Export Codes

Click **📥 Export Codes** to download all promo codes as a text file (one code per line).

### Refresh

Click **🔄 Refresh** to reload the promo codes list from the database.

## Discount Types Explained

### Free Days (`free_days`)
- Adds free days to the customer's selected duration
- Example: Customer selects 30 days, uses code with 10 free days → Gets 40 days total
- The purchase is still free (no payment required)

### Percentage Off (`percent`)
- Applies a percentage discount to the purchase amount
- Example: 50% off a £30 purchase = £15 final price

### Fixed Amount Off (`fixed`)
- Deducts a fixed amount from the purchase
- Example: £10 off a £30 purchase = £20 final price

### 100% Free (`free`)
- Makes the entire purchase free
- No payment required

## Usage Tracking

- Each promo code tracks how many times it's been used
- When `usedCount >= maxUses`, the code is marked as "Used" and cannot be used again
- Codes can be set to expire on a specific date

## Security

- The admin page requires the admin password
- API calls require the `ADMIN_API_KEY` header
- Only users with the admin password can access the promo code manager

## Troubleshooting

### "ADMIN_API_KEY not configured" Error

**Solution:** Make sure you've set `REACT_APP_ADMIN_API_KEY` in your `.env` file (local) or Firebase environment variables (production).

### "Failed to load promo codes" Error

**Possible causes:**
1. Backend API is not accessible
2. `ADMIN_API_KEY` is incorrect
3. Backend routes are not deployed

**Solution:**
1. Check that `REACT_APP_BACKEND_URL` is correct
2. Verify `ADMIN_API_KEY` matches the one in Render.com
3. Check Render.com logs to see if backend is running

### Codes Not Appearing

**Solution:**
1. Click **🔄 Refresh** to reload from database
2. Check browser console for errors
3. Verify backend API is responding

## Example: Creating 200 Codes for Launch Campaign

1. Go to **📦 Bulk Create** tab
2. Set:
   - **Number of Codes:** `200`
   - **Prefix:** `FREE10`
   - **Discount Type:** `Free Days`
   - **Discount Value:** `10`
   - **Description:** `10 Free Days - Launch Campaign`
   - **Maximum Uses:** `1`
3. Click **✅ Create 200 Promo Codes**
4. Wait for success message
5. Click **📥 Export Codes** to download the list
6. Distribute codes to businesses

## Notes

- Promo codes are stored in Firestore (`promoCodes` collection)
- Codes are case-insensitive (automatically converted to uppercase)
- The frontend validates codes in real-time during checkout
- Usage is tracked automatically when codes are applied

