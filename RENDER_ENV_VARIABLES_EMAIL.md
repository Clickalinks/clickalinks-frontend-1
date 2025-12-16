# Render Environment Variables for Email Service

## Required Environment Variables

Your Render backend service needs the following environment variables configured for the email system to work properly:

### Email Service Configuration

1. **SMTP Configuration (Choose ONE method):**

   **Option A: SMTP (IONOS/Gmail/Outlook)**
   ```
   SMTP_HOST=smtp.ionos.co.uk
   SMTP_PORT=465
   SMTP_SECURE=false
   SMTP_USER=ads@clickalinks.com
   SMTP_PASS=your_email_password
   ```

   **Option B: SendGrid**
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

   **Option C: Gmail OAuth2**
   ```
   GMAIL_CLIENT_ID=your_client_id
   GMAIL_CLIENT_SECRET=your_client_secret
   GMAIL_REFRESH_TOKEN=your_refresh_token
   GMAIL_USER=your_gmail_address
   ```

### Email Content Configuration

2. **Email From Address (Optional but Recommended)**
   ```
   EMAIL_FROM="ClickaLinks" <ads@clickalinks.com>
   ```
   - If not set, defaults to: `"ClickaLinks" <SMTP_USER>`

3. **Support Email (Optional)**
   ```
   SUPPORT_EMAIL=support@clickalinks.com
   ```
   - Used in email footers
   - Defaults to: `support@clickalinks.com` if not set

### URL Configuration

4. **Backend URL (Required for Invoice Download)**
   ```
   BACKEND_URL=https://clickalinks-backend-2.onrender.com
   ```
   - Used for invoice download links
   - Defaults to: `https://clickalinks-backend-2.onrender.com` if not set
   - **IMPORTANT:** Update this to match your actual Render backend URL

5. **Frontend URL (Required for "View Ad" Links)**
   ```
   FRONTEND_URL=https://clickalinks-frontend.web.app
   ```
   - Used in welcome email for "View Your Live Ad" button
   - Defaults to: `https://clickalinks-frontend.web.app` if not set
   - **IMPORTANT:** Update this to match your actual frontend URL

### Admin Notifications

6. **Admin Notification Email (Optional)**
   ```
   ADMIN_NOTIFICATION_EMAIL=stentar-pants@hotmail.com
   ```
   - Email address to receive admin notifications
   - Defaults to: `stentar-pants@hotmail.com` if not set

## How to Add Environment Variables in Render

1. Go to your Render Dashboard
2. Select your Backend Service
3. Click on "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable with its value
6. Click "Save Changes"
7. Render will automatically redeploy

## Verification Checklist

- [ ] SMTP credentials are set (SMTP_HOST, SMTP_USER, SMTP_PASS)
- [ ] BACKEND_URL matches your actual Render backend URL
- [ ] FRONTEND_URL matches your actual frontend URL
- [ ] EMAIL_FROM is set (optional but recommended)
- [ ] SUPPORT_EMAIL is set (optional but recommended)

## Testing

After setting environment variables:
1. Make a test purchase
2. Check that welcome email is received (no invoice)
3. Check that invoice email is received separately (2 seconds later)
4. Verify invoice download link works

## Notes

- The email service will work with defaults, but it's recommended to set all variables for production
- BACKEND_URL and FRONTEND_URL should match your actual deployed URLs
- If emails aren't sending, check Render logs for SMTP connection errors

