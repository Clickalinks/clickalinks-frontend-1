# 🔍 Check Email Configuration - Troubleshooting Guide

## Step 1: Check Render.com Backend Logs

1. **Go to Render.com Dashboard:**
   - Visit: https://dashboard.render.com
   - Click on your backend service

2. **Check Logs Tab:**
   - Click **"Logs"** in the left sidebar
   - Look for these messages:

### ✅ Success Messages:
```
🚀 Server running on port 10000
✅ Email confirmation endpoint available at: POST /api/send-confirmation-email
📧 Email service configured: smtp.ionos.com
```

### ❌ Error Messages:
```
⚠️ Email service not configured - emails will not be sent
❌ Error sending confirmation email: [error message]
```

---

## Step 2: Test Endpoint Directly

### Check if endpoint exists:
```bash
curl https://clickalinks-backend-2.onrender.com/api/send-confirmation-email
```

**Expected:** Should return an error (method not allowed or 400), NOT 404

**If 404:** The endpoint isn't deployed properly

---

## Step 3: Check Email Service Configuration

### In Render.com Logs, look for:
- `📧 Email service configured: smtp.ionos.com` ✅
- `⚠️ Email service not configured` ❌

### If not configured, check:
1. All SMTP environment variables are set:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`

2. Password is correct (no typos)

---

## Step 4: Test Email Sending

### After fixing, test again:
```powershell
$body = @{
    contactEmail = "your-email@example.com"
    businessName = "Test Business"
    squareNumber = 1
    pageNumber = 1
    selectedDuration = 30
    finalAmount = 30
    transactionId = "test-123"
    paymentStatus = "paid"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/api/send-confirmation-email" -Method Post -Body $body -ContentType "application/json"
```

---

## Common Issues:

### 1. 404 Error
- **Cause:** Code not deployed or route not registered
- **Fix:** Redeploy backend, check logs for startup errors

### 2. Email Not Sent
- **Cause:** SMTP configuration wrong or email service not initialized
- **Fix:** Check logs for email service status, verify SMTP credentials

### 3. Authentication Failed
- **Cause:** Wrong password or SMTP settings
- **Fix:** Double-check `SMTP_PASS` and `SMTP_USER` values

### 4. Connection Timeout
- **Cause:** Wrong port or firewall blocking
- **Fix:** Try port 465 with `SMTP_SECURE=true`

---

## Next Steps:

1. Check Render.com logs first
2. Share the log output with me
3. We'll fix any issues found

