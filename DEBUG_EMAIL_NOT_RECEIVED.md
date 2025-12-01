# 🔍 Debug: Email Not Received

## Where `ads@clickalinks.com` is Configured

The sender email `ads@clickalinks.com` is set in **Render.com Environment Variables**, NOT in code files.

**File:** `Backend/services/emailService.js` (line 215)
**Code:**
```javascript
from: process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`
```

This means:
- **Sender email** comes from `EMAIL_FROM` environment variable in Render.com
- **If `EMAIL_FROM` is not set**, it uses `SMTP_USER` instead
- **Recipient email** comes from the form you fill out (the `contactEmail` field)

---

## Step 1: Check Browser Console

After uploading a logo, open browser console (F12) and look for:

**Good signs:**
- `✅ Confirmation email sent successfully`
- No errors

**Bad signs:**
- `⚠️ Email send failed`
- `⚠️ Email send error`
- `404 Not Found`
- `500 Internal Server Error`

**Copy any errors you see.**

---

## Step 2: Check Render.com Logs

1. **Go to:** https://dashboard.render.com
2. **Click:** `clickalinks-backend-2` service
3. **Click:** **"Logs"** tab
4. **Look for email-related messages:**

**Good signs:**
- `Attempting to send email to YOUR_EMAIL@...`
- `✅ Email sent: ...`
- `messageId: ...`

**Bad signs:**
- `⚠️ No email address provided`
- `❌ Error sending email:`
- `Email transporter not configured`
- `SMTP authentication failed`

---

## Step 3: Verify Environment Variables

1. **Go to:** https://dashboard.render.com
2. **Click:** `clickalinks-backend-2` service
3. **Click:** **"Environment"** tab
4. **Check these variables exist:**

```
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your_password_here
EMAIL_FROM=ClickaLinks <ads@clickalinks.com>
```

**Important:**
- `SMTP_USER` = Your IONOS email address (for authentication)
- `EMAIL_FROM` = The sender email that appears in the "From" field
- `SMTP_PASS` = Your IONOS email password

---

## Step 4: Test Email Endpoint Directly

Run this in PowerShell (replace `YOUR_EMAIL` with the email you used):

```powershell
$body = @{
    contactEmail = "YOUR_EMAIL@example.com"
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

**Expected response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully",
  "messageId": "..."
}
```

**If you get an error, copy it here.**

---

## Step 5: Check Spam Folder

Sometimes emails go to spam. Check:
- **Spam/Junk folder**
- **Promotions tab** (Gmail)
- **All Mail folder**

---

## Common Issues & Fixes

### Issue 1: Email sent but not received
**Problem:** Email in spam or wrong address  
**Solution:** 
- Check spam folder
- Verify email address is correct
- Check Render.com logs for `messageId`

### Issue 2: SMTP authentication failed
**Problem:** Wrong email/password  
**Solution:**
- Verify `SMTP_USER` and `SMTP_PASS` in Render.com
- Test email/password in email client first

### Issue 3: No email address provided
**Problem:** Form didn't send email address  
**Solution:**
- Check browser console for errors
- Verify email field is filled in form

### Issue 4: Email service not configured
**Problem:** SMTP variables missing  
**Solution:**
- Add SMTP environment variables in Render.com
- Redeploy backend

---

## Quick Checklist

- [ ] Check browser console for errors
- [ ] Check Render.com logs for email status
- [ ] Verify SMTP environment variables exist
- [ ] Test endpoint directly with PowerShell
- [ ] Check spam folder
- [ ] Verify email address is correct

---

## Next Steps

1. **Check browser console** - Copy any errors
2. **Check Render.com logs** - Look for email messages
3. **Test endpoint** - Run PowerShell test
4. **Report back** - Tell me what you find!

Let me know what you see in the logs! 🔍

