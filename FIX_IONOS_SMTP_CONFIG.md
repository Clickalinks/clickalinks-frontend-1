# 🔧 Fix IONOS SMTP Authentication Error

## Problem
**Error:** `535 Authentication credentials invalid`

**Root Cause:** Using wrong SMTP server (`smtp.ionos.com` instead of `smtp.ionos.co.uk`)

---

## ✅ Correct IONOS SMTP Settings

Based on your IONOS email setup instructions:

```
SMTP_HOST=smtp.ionos.co.uk  ← CHANGE THIS!
SMTP_PORT=587
SMTP_SECURE=false  ← TLS (not SSL)
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your_password
EMAIL_FROM=ClickaLinks <ads@clickalinks.com>
```

**Key Changes:**
- ✅ `SMTP_HOST` = `smtp.ionos.co.uk` (NOT `smtp.ionos.com`)
- ✅ `SMTP_PORT` = `587` (correct)
- ✅ `SMTP_SECURE` = `false` (TLS, not SSL)
- ✅ Authentication = Required (Yes)

---

## Step 1: Update Render.com Environment Variables

1. **Go to:** https://dashboard.render.com
2. **Click:** `clickalinks-backend-2` service
3. **Click:** **"Environment"** tab
4. **Find:** `SMTP_HOST`
5. **Change from:** `smtp.ionos.com`
6. **Change to:** `smtp.ionos.co.uk`
7. **Click:** **"Save Changes"**

This will trigger a redeploy automatically.

---

## Step 2: Verify All Settings

Make sure these are set correctly:

```
SMTP_HOST=smtp.ionos.co.uk
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your_actual_password_here
EMAIL_FROM=ClickaLinks <ads@clickalinks.com>
```

---

## Step 3: Wait for Redeploy

After saving, wait 2-3 minutes for Render to redeploy.

---

## Step 4: Test Again

After redeploy, test the endpoint:

```powershell
$body = @{
    contactEmail = "ads@clickalinks.com"
    businessName = "Test Business"
    squareNumber = 1
    pageNumber = 1
    selectedDuration = 30
    finalAmount = 30
    transactionId = "test-123"
    paymentStatus = "paid"
    logoData = "https://example.com/logo.png"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/api/send-confirmation-email" -Method Post -Body $body -ContentType "application/json"
```

**Expected:** `{"success": true, "message": "Confirmation email sent successfully"}`

---

## Step 5: Check Logs

After testing, check Render.com logs. You should see:

```
✅ Confirmation email sent successfully: <messageId>
```

**If you still get errors:**
- Check that `SMTP_PASS` is correct
- Verify you can log into webmail.ionos.co.uk with the same credentials
- Check that SMTP is enabled in your IONOS account settings

---

## Summary

**The fix:** Change `SMTP_HOST` from `smtp.ionos.com` to `smtp.ionos.co.uk`

That's it! The authentication error should be fixed. 🚀

