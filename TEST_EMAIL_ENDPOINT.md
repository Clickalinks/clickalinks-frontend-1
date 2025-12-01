# 📧 Test Email Endpoint

## Step 1: Check Browser Console

After uploading a logo, check the browser console (F12) for:

**Look for:**
- `✅ Confirmation email sent successfully` - Email was sent
- `⚠️ Email send failed` - Email failed
- `⚠️ Email send error` - Network error

**If you see errors, copy them here.**

---

## Step 2: Test Backend Endpoint Directly

Run this in PowerShell to test the endpoint:

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

**If you get 404:**
- Backend not deployed yet
- Need to check Render.com deployment

**If you get 500:**
- Email service not configured
- Check SMTP environment variables in Render.com

---

## Step 3: Check Render.com Logs

1. Go to: https://dashboard.render.com
2. Click on `clickalinks-backend-2` service
3. Click **"Logs"** tab
4. Look for:
   - `📧 Email service configured: smtp.ionos.com` - Email is configured
   - `⚠️ Email service not configured` - Email NOT configured
   - `✅ Email sent: ...` - Email was sent successfully
   - `❌ Error sending email:` - Email failed

---

## Step 4: Verify Environment Variables in Render.com

1. Go to: https://dashboard.render.com
2. Click on `clickalinks-backend-2` service
3. Click **"Environment"** tab
4. Check for these variables:

**Required for IONOS SMTP:**
- `SMTP_HOST` = `smtp.ionos.com`
- `SMTP_PORT` = `587`
- `SMTP_SECURE` = `false`
- `SMTP_USER` = `ads@clickalinks.com` (or your email)
- `SMTP_PASS` = `your_password`
- `EMAIL_FROM` = `ads@clickalinks.com` (or your email)

**If any are missing, add them and redeploy.**

---

## Common Issues

### Issue 1: 404 Not Found
**Problem:** Backend endpoint doesn't exist
**Solution:** Check Render.com deployment status

### Issue 2: Email service not configured
**Problem:** SMTP environment variables missing
**Solution:** Add SMTP variables in Render.com

### Issue 3: Email fails silently
**Problem:** SMTP credentials incorrect
**Solution:** Check email/password in Render.com

### Issue 4: Email goes to spam
**Problem:** Email content or sender reputation
**Solution:** Check spam folder, verify sender email

---

## Next Steps

1. ✅ Check browser console for errors
2. ✅ Test endpoint directly with PowerShell
3. ✅ Check Render.com logs
4. ✅ Verify environment variables
5. ✅ Check spam folder

Let me know what you find! 🔍

