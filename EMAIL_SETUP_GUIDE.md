# 📧 Email Setup Guide for ClickaLinks

## Overview
The email service sends confirmation emails when users upload ads. You can use one of these options:

1. **SendGrid** (Recommended for production) - Free tier: 100 emails/day
2. **SMTP** (Gmail, Outlook, custom SMTP) - Easy setup
3. **Resend** (Modern alternative) - Free tier: 3,000 emails/month

---

## Option 1: SendGrid (Recommended) ⭐

### Step 1: Create SendGrid Account
1. Go to: https://sendgrid.com
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key
1. Go to: **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `clickalinks-production`
4. Select **Full Access** permissions
5. Copy the API key (you'll only see it once!)

### Step 3: Set Environment Variable
Add to your `.env` file or Render.com environment variables:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="ClickaLinks <noreply@clickalinks.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

### Step 4: Verify Sender (Important!)
1. Go to: **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details
4. Check your email and click verification link

**Note:** SendGrid requires sender verification. Use your domain email for better deliverability.

---

## Option 2: SMTP (Gmail/Outlook)

### For Gmail:

#### Step 1: Enable App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Other (Custom name)**
3. Name it: `ClickaLinks`
4. Copy the 16-character password

#### Step 2: Set Environment Variables
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM="ClickaLinks <your-email@gmail.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

### For Outlook/Office 365:

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM="ClickaLinks <your-email@outlook.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

### For Custom SMTP:

```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
EMAIL_FROM="ClickaLinks <noreply@yourdomain.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

---

## Option 3: Resend (Modern Alternative)

### Step 1: Create Resend Account
1. Go to: https://resend.com
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key
1. Go to: **API Keys**
2. Click **Create API Key**
3. Name it: `clickalinks-production`
4. Copy the API key

### Step 3: Add Domain (Optional but Recommended)
1. Go to: **Domains**
2. Add your domain (e.g., `clickalinks.com`)
3. Add DNS records as instructed
4. Wait for verification

### Step 4: Set Environment Variables
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="ClickaLinks <noreply@yourdomain.com>"
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

**Note:** You'll need to update `emailService.js` to support Resend if using this option.

---

## Testing Email Setup

### Test via API:
```bash
curl -X POST https://your-backend-url.onrender.com/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "contactEmail": "your-email@example.com",
    "businessName": "Test Business",
    "squareNumber": 1,
    "pageNumber": 1,
    "selectedDuration": 30,
    "finalAmount": 30,
    "transactionId": "test-123",
    "paymentStatus": "paid"
  }'
```

### Check Logs:
Check your backend logs for:
- `✅ Confirmation email sent successfully` - Success!
- `⚠️ No email service configured` - Setup incomplete
- `❌ Error sending confirmation email` - Check configuration

---

## Render.com Setup

1. Go to your Render.com dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add all environment variables from above
5. Click **Save Changes**
6. Redeploy your service

---

## Troubleshooting

### Emails Not Sending?

1. **Check Environment Variables:**
   ```bash
   # Verify variables are set
   echo $SENDGRID_API_KEY  # or SMTP_USER, etc.
   ```

2. **Check Backend Logs:**
   - Look for email-related errors
   - Check if transporter is created successfully

3. **Test SMTP Connection:**
   ```bash
   # Test Gmail SMTP
   telnet smtp.gmail.com 587
   ```

4. **Check Spam Folder:**
   - Emails might be going to spam
   - Verify sender email domain

5. **SendGrid Issues:**
   - Verify sender email is verified
   - Check API key permissions
   - Review SendGrid activity logs

### Common Errors:

- **"Email service not configured"** → Set environment variables
- **"Authentication failed"** → Check SMTP credentials or SendGrid API key
- **"Connection timeout"** → Check SMTP port and firewall settings
- **"Sender not verified"** → Verify sender email in SendGrid

---

## Email Template Customization

Edit `Backend/services/emailService.js` to customize:
- Email subject line
- HTML template design
- Email content
- Branding colors

---

## Production Recommendations

1. **Use SendGrid or Resend** (better deliverability than SMTP)
2. **Verify your domain** (improves email deliverability)
3. **Set up SPF/DKIM records** (prevents emails going to spam)
4. **Monitor email delivery** (check SendGrid/Resend dashboards)
5. **Set up email bounces handling** (handle invalid emails)

---

## Free Tier Limits

- **SendGrid:** 100 emails/day (free forever)
- **Resend:** 3,000 emails/month (free forever)
- **Gmail SMTP:** 500 emails/day (free)
- **Outlook SMTP:** 300 emails/day (free)

For higher volumes, upgrade to paid plans.

---

## Next Steps

1. Choose an email provider (SendGrid recommended)
2. Set up your account and get API key
3. Add environment variables to Render.com
4. Test email sending
5. Monitor email delivery

**Questions?** Check the provider's documentation or contact support.

