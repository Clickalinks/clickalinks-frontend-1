# 📧 IONOS Email Setup for ClickaLinks

## Overview
Your domain `clickalinks.com` is hosted with IONOS, and you'll be using `ads@clickalinks.com` for sending confirmation emails.

---

## Step 1: Set Up Email Account in IONOS

1. **Log in to IONOS:**
   - Go to: https://www.ionos.com
   - Log in to your account

2. **Create Email Account:**
   - Navigate to **Email** → **Email Accounts**
   - Click **Create Email Account**
   - Email address: `ads@clickalinks.com`
   - Set a strong password (you'll need this for SMTP)
   - Click **Create**

3. **Verify Email Account:**
   - Check your email inbox for verification
   - Log in to webmail to confirm it works: https://webmail.ionos.com

---

## Step 2: Get SMTP Settings

IONOS SMTP settings:
- **SMTP Host:** `smtp.ionos.com`
- **SMTP Port:** `587` (TLS) or `465` (SSL)
- **SMTP Security:** TLS (recommended) or SSL
- **SMTP Username:** `ads@clickalinks.com` (full email address)
- **SMTP Password:** The password you set for the email account

---

## Step 3: Configure Environment Variables

Add these to your **Render.com backend environment variables**:

```bash
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your-email-password-here
EMAIL_FROM="ClickaLinks <ads@clickalinks.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

**Important:** 
- Replace `your-email-password-here` with the actual password for `ads@clickalinks.com`
- Keep `SMTP_SECURE=false` for port 587 (TLS)
- If using port 465 (SSL), set `SMTP_SECURE=true`

---

## Step 4: Alternative Port 465 (SSL) Configuration

If port 587 doesn't work, try port 465 with SSL:

```bash
SMTP_HOST=smtp.ionos.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your-email-password-here
EMAIL_FROM="ClickaLinks <ads@clickalinks.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

---

## Step 5: Test Email Configuration

### Option A: Test via Backend API

After deploying, test with:

```bash
curl -X POST https://clickalinks-backend-2.onrender.com/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "contactEmail": "your-test-email@example.com",
    "businessName": "Test Business",
    "squareNumber": 1,
    "pageNumber": 1,
    "selectedDuration": 30,
    "finalAmount": 30,
    "transactionId": "test-123",
    "paymentStatus": "paid"
  }'
```

### Option B: Test via Upload

1. Upload a test ad on your website
2. Check the email address you provided
3. Check spam folder if not received

---

## Troubleshooting IONOS SMTP

### Common Issues:

1. **"Authentication failed"**
   - Verify email password is correct
   - Make sure you're using the full email address (`ads@clickalinks.com`) as username
   - Check if 2FA is enabled (may need app password)

2. **"Connection timeout"**
   - Try port 465 with `SMTP_SECURE=true` instead of 587
   - Check firewall settings
   - Verify IONOS allows SMTP from your server IP

3. **"Emails going to spam"**
   - Set up SPF record in IONOS DNS settings
   - Set up DKIM record (if available)
   - Verify sender email domain

4. **"Port 587 not working"**
   - Switch to port 465 with SSL
   - Set `SMTP_SECURE=true`
   - Update `SMTP_PORT=465`

---

## IONOS DNS Records (Optional - Improves Deliverability)

To improve email deliverability, add these DNS records in IONOS:

### SPF Record:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.ionos.com ~all
```

### DKIM Record (if available):
Check IONOS email settings for DKIM keys and add them to DNS.

---

## Render.com Setup Steps

1. **Go to Render Dashboard:**
   - Navigate to your backend service
   - Click **Environment** tab

2. **Add Environment Variables:**
   - Click **Add Environment Variable**
   - Add each variable from Step 3 above
   - Click **Save Changes**

3. **Redeploy:**
   - Render will automatically redeploy
   - Or click **Manual Deploy** → **Deploy latest commit**

4. **Check Logs:**
   - Go to **Logs** tab
   - Look for email-related messages
   - Should see: `✅ Confirmation email sent successfully`

---

## Testing Checklist

- [ ] Email account `ads@clickalinks.com` created in IONOS
- [ ] Can log in to webmail successfully
- [ ] Environment variables added to Render.com
- [ ] Backend redeployed
- [ ] Test email sent via API
- [ ] Received test email in inbox
- [ ] Uploaded test ad and received confirmation email

---

## Support

If you encounter issues:
1. Check Render.com backend logs for error messages
2. Verify email account password is correct
3. Try both port 587 and 465
4. Check IONOS email account settings
5. Contact IONOS support if SMTP is blocked

---

## Next Steps

Once you've set up the email account and added environment variables:
1. Deploy the backend
2. Test with a real ad upload
3. Verify emails are being sent
4. Check spam folder if needed

Let me know when you've set it up and we can test it together! 🚀

