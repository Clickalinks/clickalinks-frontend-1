# 🔧 Fix 500 Internal Server Error - Email Endpoint

## Problem
Getting `500 Internal Server Error` when calling email endpoint. This means the backend is crashing when trying to send email.

---

## Step 1: Check Render.com Logs for Exact Error

1. **Go to:** https://dashboard.render.com
2. **Click:** `clickalinks-backend-2` service
3. **Click:** **"Logs"** tab
4. **Look for the error** that happened when you ran the test

**Common errors you might see:**

### Error 1: SMTP Authentication Failed
```
❌ Error sending confirmation email: Invalid login: 535 Authentication failed
```
**Fix:** Check `SMTP_USER` and `SMTP_PASS` in Render.com environment variables

### Error 2: Connection Timeout
```
❌ Error sending confirmation email: Connection timeout
```
**Fix:** Check `SMTP_HOST` is correct (`smtp.ionos.com`)

### Error 3: Missing Environment Variable
```
❌ Error: SMTP_HOST is not defined
```
**Fix:** Add missing environment variables in Render.com

### Error 4: Port/SSL Issue
```
❌ Error sending confirmation email: ECONNREFUSED
```
**Fix:** Check `SMTP_PORT` (should be `587`) and `SMTP_SECURE` (should be `false`)

---

## Step 2: Verify IONOS SMTP Settings

Make sure these are correct in Render.com → Environment:

```
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your_actual_password_here
EMAIL_FROM=ClickaLinks <ads@clickalinks.com>
```

**Important:**
- `SMTP_USER` must be the **full email address** (`ads@clickalinks.com`)
- `SMTP_PASS` must be the **actual password** for that email account
- `SMTP_SECURE=false` for port 587 (TLS, not SSL)

---

## Step 3: Test IONOS Email Account

Before fixing the backend, verify the email account works:

1. **Try logging into:** https://webmail.ionos.com
2. **Use:** `ads@clickalinks.com` and your password
3. **If login fails:** The password might be wrong

---

## Step 4: Common IONOS SMTP Issues

### Issue 1: Wrong SMTP Server
**IONOS uses different SMTP servers:**
- **UK:** `smtp.ionos.co.uk` or `smtp.ionos.com`
- **US:** `smtp.ionos.com`
- **Germany:** `smtp.ionos.de`

**Try changing `SMTP_HOST` to:**
- `smtp.ionos.co.uk` (if UK account)
- `smtp.ionos.com` (if US/International)

### Issue 2: Port 465 vs 587
**IONOS supports both:**
- **Port 587** (TLS) - `SMTP_SECURE=false`
- **Port 465** (SSL) - `SMTP_SECURE=true`

**Try changing to port 465:**
```
SMTP_PORT=465
SMTP_SECURE=true
```

### Issue 3: Authentication Required
**IONOS requires:**
- Full email address as username
- Correct password
- SMTP authentication enabled in IONOS settings

---

## Step 5: Check Render.com Logs After Fix

After updating environment variables:

1. **Save changes** in Render.com (triggers redeploy)
2. **Wait 2-3 minutes** for redeploy
3. **Test again** with PowerShell command
4. **Check logs** for new error messages

---

## Step 6: Alternative - Use SendGrid (If IONOS Doesn't Work)

If IONOS SMTP continues to fail, you can use SendGrid:

1. **Sign up:** https://sendgrid.com (free tier available)
2. **Get API key** from SendGrid dashboard
3. **Add to Render.com:**
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```
4. **Remove SMTP variables** (SendGrid takes priority)

---

## Quick Fix Checklist

- [ ] Check Render.com logs for exact error message
- [ ] Verify `SMTP_USER` is full email (`ads@clickalinks.com`)
- [ ] Verify `SMTP_PASS` is correct password
- [ ] Try changing `SMTP_HOST` to `smtp.ionos.co.uk`
- [ ] Try changing port to `465` with `SMTP_SECURE=true`
- [ ] Test IONOS email login at webmail.ionos.com
- [ ] Check if SMTP is enabled in IONOS account settings

---

## What to Report Back

Please share:
1. **Exact error message** from Render.com logs
2. **IONOS account region** (UK/US/Germany)
3. **Whether you can login** to webmail.ionos.com
4. **Any IONOS-specific SMTP settings** you see in IONOS dashboard

This will help me provide a more specific fix! 🔍

