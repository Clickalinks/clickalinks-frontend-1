# 🔧 Render.com Environment Variables Setup

## Step-by-Step Instructions

### 1. Go to Render.com Dashboard
- Visit: https://dashboard.render.com
- Log in to your account

### 2. Select Your Backend Service
- Click on your backend service (e.g., `clickalinks-backend-2`)

### 3. Go to Environment Tab
- Click on **"Environment"** in the left sidebar

### 4. Add These Variables

Click **"Add Environment Variable"** for each one:

#### Variable 1: SMTP_HOST
- **Key:** `SMTP_HOST`
- **Value:** `smtp.ionos.com`
- Click **Save**

#### Variable 2: SMTP_PORT
- **Key:** `SMTP_PORT`
- **Value:** `587`
- Click **Save**

#### Variable 3: SMTP_SECURE
- **Key:** `SMTP_SECURE`
- **Value:** `false`
- Click **Save**

#### Variable 4: SMTP_USER
- **Key:** `SMTP_USER`
- **Value:** `ads@clickalinks.com`
- Click **Save**

#### Variable 5: SMTP_PASS
- **Key:** `SMTP_PASS`
- **Value:** `[Your email password here]` ⚠️ Replace with actual password
- Click **Save**

#### Variable 6: EMAIL_FROM
- **Key:** `EMAIL_FROM`
- **Value:** `ClickaLinks <ads@clickalinks.com>`
- Click **Save**

#### Variable 7: SUPPORT_EMAIL
- **Key:** `SUPPORT_EMAIL`
- **Value:** `support@clickalinks.com` (or `ads@clickalinks.com` if you don't have support email)
- Click **Save**

#### Variable 8: FRONTEND_URL
- **Key:** `FRONTEND_URL`
- **Value:** `https://clickalinks-frontend.web.app`
- Click **Save**

### 5. Verify All Variables Are Added

You should see all 8 variables listed:
- ✅ SMTP_HOST
- ✅ SMTP_PORT
- ✅ SMTP_SECURE
- ✅ SMTP_USER
- ✅ SMTP_PASS
- ✅ EMAIL_FROM
- ✅ SUPPORT_EMAIL
- ✅ FRONTEND_URL

### 6. Redeploy Backend

After adding all variables:
- Render will automatically redeploy, OR
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Wait for deployment to complete (usually 2-3 minutes)

### 7. Check Deployment Logs

- Go to **"Logs"** tab
- Look for: `🚀 Server running on port...`
- Should see: `✅ Email service configured` (if email is working)

---

## Quick Copy-Paste Reference

```
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ads@clickalinks.com
SMTP_PASS=your-password-here
EMAIL_FROM=ClickaLinks <ads@clickalinks.com>
SUPPORT_EMAIL=support@clickalinks.com
FRONTEND_URL=https://clickalinks-frontend.web.app
```

⚠️ **Important:** Replace `your-password-here` with your actual email password!

---

## Troubleshooting

### If Port 587 Doesn't Work:
Try port 465 with SSL:
- Change `SMTP_PORT` to `465`
- Change `SMTP_SECURE` to `true`

### If Authentication Fails:
- Double-check the password is correct
- Make sure you're using the full email address (`ads@clickalinks.com`) as SMTP_USER
- Verify the email account is active in IONOS

### Check Logs:
- Go to Render.com → Your Service → Logs
- Look for email-related errors
- Should see: `✅ Confirmation email sent successfully` on success

---

## Next: Test Email

After deployment, we'll test sending a confirmation email!

