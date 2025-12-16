# Step-by-Step Guide: Configure Render Environment Variables

## ✅ Step 1: Changes Committed and Pushed
✓ Your email redesign changes have been committed and pushed to GitHub successfully!

---

## 📋 Step 2: Configure Environment Variables in Render

### **Step 2.1: Access Your Render Dashboard**
1. Open your web browser
2. Go to: **https://dashboard.render.com**
3. Log in with your Render account credentials

### **Step 2.2: Navigate to Your Backend Service**
1. Click on **"Services"** in the left sidebar (or look for your backend service in the dashboard)
2. Find and click on your **Backend Service** (e.g., "clickalinks-backend-2" or similar)

### **Step 2.3: Access Environment Variables**
1. In your backend service page, click on the **"Environment"** tab (located at the top menu)
2. You should see a list of existing environment variables (if any)

### **Step 2.4: Add/Verify Required Environment Variables**

Click **"Add Environment Variable"** button for each variable you need to add or verify:

#### **A. Email Configuration (SMTP) - REQUIRED**

These are likely already set, but verify they exist:

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `SMTP_HOST` | `smtp.ionos.co.uk` | Your SMTP server hostname |
| `SMTP_PORT` | `465` | SMTP port (usually 465) |
| `SMTP_SECURE` | `true` | Set to `true` for direct SSL/TLS (default), or `false` for STARTTLS |
| `SMTP_USER` | `ads@clickalinks.com` | Your email address |
| `SMTP_PASS` | `your_password_here` | Your email password |

**How to add:**
- Click "Add Environment Variable"
- **Key:** `SMTP_HOST`
- **Value:** `smtp.ionos.co.uk`
- Click "Save"
- Repeat for each variable above

#### **B. URL Configuration - RECOMMENDED (Important!)**

These ensure invoice download and "View Ad" buttons work correctly:

| Variable Name | Example Value | Where to Find |
|--------------|---------------|---------------|
| `BACKEND_URL` | `https://clickalinks-backend-2.onrender.com` | **Your Render backend service URL** (check the "Settings" tab for your service URL) |
| `FRONTEND_URL` | `https://clickalinks-frontend.web.app` | **Your Firebase/website frontend URL** |

**How to find your BACKEND_URL:**
1. In your Render backend service page
2. Click on the **"Settings"** tab
3. Look for **"Service URL"** or **"Live URL"**
4. Copy the full URL (e.g., `https://clickalinks-backend-2.onrender.com`)
5. Use this exact URL as your `BACKEND_URL` value

**How to add:**
- Click "Add Environment Variable"
- **Key:** `BACKEND_URL`
- **Value:** Paste your Render backend URL (e.g., `https://clickalinks-backend-2.onrender.com`)
- Click "Save"
- Repeat for `FRONTEND_URL`

#### **C. Email Display Configuration - RECOMMENDED**

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `EMAIL_FROM` | `"ClickaLinks" <ads@clickalinks.com>` | Display name and email for outgoing emails |
| `SUPPORT_EMAIL` | `support@clickalinks.com` | Support contact email (shown in email footers) |

**How to add:**
- Click "Add Environment Variable"
- **Key:** `EMAIL_FROM`
- **Value:** `"ClickaLinks" <ads@clickalinks.com>` (use your actual email)
- Click "Save"
- Repeat for `SUPPORT_EMAIL`

#### **D. Admin Notifications - OPTIONAL**

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `ADMIN_NOTIFICATION_EMAIL` | `stentar-pants@hotmail.com` | Email to receive admin notifications |

---

## ✅ Step 3: Verify Your Environment Variables

After adding all variables:

1. **Review the list** - Make sure all variables are present:
   - ✓ SMTP_HOST
   - ✓ SMTP_PORT
   - ✓ SMTP_SECURE
   - ✓ SMTP_USER
   - ✓ SMTP_PASS
   - ✓ BACKEND_URL (your actual Render URL)
   - ✓ FRONTEND_URL (your actual frontend URL)
   - ✓ EMAIL_FROM (optional but recommended)
   - ✓ SUPPORT_EMAIL (optional but recommended)

2. **Check Values** - Verify:
   - `BACKEND_URL` matches your actual Render backend service URL
   - `FRONTEND_URL` matches your actual frontend URL
   - SMTP credentials are correct

3. **Click "Save Changes"** at the bottom of the page (if available)

---

## 🚀 Step 4: Deploy/Redeploy Your Service

After saving environment variables:

### **Option A: Manual Deploy (Recommended)**
1. Go to your backend service page in Render
2. Click on the **"Manual Deploy"** dropdown button
3. Select **"Deploy latest commit"**
4. Wait for deployment to complete (usually 2-5 minutes)
5. Check the "Events" or "Logs" tab to verify deployment success

### **Option B: Auto-Deploy**
- If auto-deploy is enabled, Render will automatically deploy when you pushed to GitHub
- Check the "Events" tab to see if deployment is in progress or complete

---

## 🧪 Step 5: Test Your Emails

After deployment is complete:

1. **Make a test purchase** on your website
2. **Check your email inbox** for:
   - ✅ **First email:** Welcome email (should be colorful, exciting, NO invoice)
   - ✅ **Second email:** Invoice email (should arrive 2 seconds later, professional)
3. **Test the invoice download button:**
   - Open the invoice email
   - Click "Download Invoice" button
   - Verify the invoice HTML downloads and displays correctly
   - Verify the invoice footer shows: "Clicado Media UK Ltd - Registered in England & Wales, Registration Number: 16904433"
4. **Test the "View Your Live Ad" button:**
   - Open the welcome email
   - Click "🚀 View Your Live Ad" button
   - Verify it opens the correct page on your frontend

---

## 🔍 Step 6: Troubleshooting

### **If emails are not sending:**

1. **Check Render Logs:**
   - Go to your backend service → **"Logs"** tab
   - Look for email-related errors
   - Common issues:
     - SMTP connection errors (check SMTP credentials)
     - "No email service configured" (check SMTP variables are set)

2. **Verify SMTP Settings:**
   - Confirm `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` are correct
   - For IONOS: `SMTP_SECURE` should be `false`

3. **Check Environment Variables:**
   - Ensure variables are saved (not just typed)
   - Variables are case-sensitive (use exact names shown above)

### **If invoice download doesn't work:**

1. **Verify BACKEND_URL:**
   - Must match your actual Render backend URL exactly
   - Check in Render → Settings → Service URL
   - Should start with `https://`

2. **Check Backend Logs:**
   - Look for errors when accessing `/api/invoice/download`

### **If "View Ad" button doesn't work:**

1. **Verify FRONTEND_URL:**
   - Must match your actual frontend URL
   - Should be your Firebase hosting URL or custom domain

---

## 📝 Quick Checklist

Before considering setup complete, verify:

- [ ] All SMTP variables are set (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS)
- [ ] BACKEND_URL matches your actual Render backend URL
- [ ] FRONTEND_URL matches your actual frontend URL
- [ ] EMAIL_FROM is set (optional but recommended)
- [ ] SUPPORT_EMAIL is set (optional but recommended)
- [ ] Changes have been deployed (check Render deployment status)
- [ ] Test purchase sends welcome email (no invoice)
- [ ] Invoice email arrives separately (2 seconds later)
- [ ] Invoice download button works
- [ ] "View Ad" button works
- [ ] Invoice shows company registration details in footer

---

## 🎉 Success!

Once all steps are complete and emails are working, you're all set! Your email system now sends:
1. **Welcome Email** - Exciting, colorful, no invoice
2. **Invoice Email** - Professional, clean, with download option

Both emails are now separate and properly formatted!

