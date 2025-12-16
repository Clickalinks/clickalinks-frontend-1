# Email Service Diagnostics and Troubleshooting

## ✅ Improvements Made

1. **Enhanced Error Logging**: Added detailed logging throughout the email service to identify exactly where failures occur
2. **Configuration Test Endpoint**: Added `/api/test-email-config` to check email configuration without sending emails
3. **Better Error Messages**: Improved error messages to help diagnose SMTP/auth issues

## 🔍 How to Diagnose Email Issues

### Step 1: Check Email Configuration

Visit this URL in your browser (replace with your backend URL):
```
https://clickalinks-backend-2.onrender.com/api/test-email-config
```

This will show:
- Which email service is configured (SendGrid, SMTP, or Gmail)
- What environment variables are set
- Whether email service is properly configured

**Expected Result:**
```json
{
  "success": true,
  "configured": true,
  "message": "Email service is configured",
  "config": {
    "smtp": {
      "configured": true,
      "host": "smtp.ionos.co.uk",
      "user": "ads@clickalinks.com",
      ...
    }
  }
}
```

### Step 2: Check Render Logs

1. Go to Render Dashboard → Your Backend Service → **Logs** tab
2. Look for email-related log messages:
   - `📧 EMAIL SERVICE CALLED` - Email endpoint was hit
   - `✅ Email transporter created successfully` - SMTP is configured
   - `❌ EMAIL SERVICE NOT CONFIGURED` - Missing env variables
   - `❌ ERROR SENDING WELCOME EMAIL` - Email sending failed

### Step 3: Verify Environment Variables in Render

Go to Render → Your Backend Service → **Environment** tab and verify:

**Required for SMTP:**
- `SMTP_HOST` = `smtp.ionos.co.uk` (or your SMTP host)
- `SMTP_USER` = `ads@clickalinks.com` (your email address)
- `SMTP_PASS` = Your email password
- `SMTP_PORT` = `465`
- `SMTP_SECURE` = `true` (defaults to true - use direct SSL/TLS connection)

**Optional but Recommended:**
- `EMAIL_FROM` = `"ClickaLinks" <ads@clickalinks.com>`
- `SUPPORT_EMAIL` = `support@clickalinks.com`
- `ADMIN_NOTIFICATION_EMAIL` = `stentar-pants@hotmail.com`

### Step 4: Test Email Endpoint Manually

Use curl or Postman to test:

```bash
curl -X POST https://clickalinks-backend-2.onrender.com/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "contactEmail": "your-test-email@example.com",
    "businessName": "Test Business",
    "squareNumber": 1,
    "pageNumber": 1,
    "selectedDuration": 10,
    "originalAmount": 10,
    "discountAmount": 0,
    "finalAmount": 10,
    "transactionId": "test-123",
    "paymentStatus": "paid"
  }'
```

Check the response and Render logs for detailed error messages.

## 🐛 Common Issues and Fixes

### Issue 1: "Email service not configured"

**Cause:** Missing environment variables in Render

**Fix:**
1. Go to Render → Environment tab
2. Add missing variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
3. Save and redeploy

### Issue 2: "Authentication failed" or "Invalid credentials"

**Cause:** Incorrect SMTP password or username

**Fix:**
1. Verify `SMTP_USER` matches your email address exactly
2. Verify `SMTP_PASS` is correct (no extra spaces)
3. For IONOS: Check that SMTP is enabled in IONOS control panel
4. Try resetting your email password

### Issue 3: "Connection timeout" or "ECONNREFUSED"

**Cause:** Wrong SMTP host or port, or firewall blocking

**Fix:**
1. Verify `SMTP_HOST` is correct:
   - IONOS: `smtp.ionos.co.uk`
   - Gmail: `smtp.gmail.com`
   - Outlook: `smtp-mail.outlook.com`
2. Verify `SMTP_PORT`:
   - IONOS: `465` with `SMTP_SECURE=true` (default, uses direct SSL/TLS)
   - Gmail: `465` or `587` with `SMTP_SECURE=true`
3. Check IONOS control panel to ensure SMTP is enabled

### Issue 4: Emails sent but not received

**Cause:** Emails might be in spam folder, or email address is invalid

**Fix:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Render logs for message IDs (emails were sent successfully)
4. Try sending to a different email address

## 📋 Checklist

Before reporting email issues, verify:

- [ ] `/api/test-email-config` shows email service is configured
- [ ] All SMTP environment variables are set in Render
- [ ] SMTP credentials are correct
- [ ] SMTP is enabled in IONOS control panel (if using IONOS)
- [ ] Checked Render logs for specific error messages
- [ ] Checked spam folder for test emails
- [ ] Tried sending to a different email address

## 🔧 Next Steps After Diagnosis

1. **If configuration is missing**: Add environment variables in Render
2. **If credentials are wrong**: Update `SMTP_USER` and `SMTP_PASS`
3. **If connection fails**: Check SMTP host and port settings
4. **If emails send but not received**: Check spam folder and email address

## 📞 Need Help?

Check Render logs for detailed error messages. The improved logging will show:
- Exact error codes
- SMTP response messages
- Which step failed (transporter creation, email sending, etc.)

All error messages now include troubleshooting suggestions.

