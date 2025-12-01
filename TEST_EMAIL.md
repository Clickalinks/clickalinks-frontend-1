# 📧 Test Email Configuration

## Option 1: Quick API Test (Recommended)

### Step 1: Test via API Endpoint

Use this command in your terminal or browser:

**Using curl (Terminal/PowerShell):**
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

**Using Browser (Postman/Insomnia):**
- URL: `https://clickalinks-backend-2.onrender.com/api/send-confirmation-email`
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "contactEmail": "your-test-email@example.com",
  "businessName": "Test Business",
  "squareNumber": 1,
  "pageNumber": 1,
  "selectedDuration": 30,
  "finalAmount": 30,
  "transactionId": "test-123",
  "paymentStatus": "paid"
}
```

**Replace `your-test-email@example.com` with your actual email address!**

### Step 2: Check Response

**Success Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully",
  "messageId": "some-message-id"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Step 3: Check Your Email

1. Check inbox of the email you used in the test
2. **Check spam folder** (emails might go there initially)
3. Look for subject: `🎉 Your ClickaLinks Ad is Live! - Square #1`

---

## Option 2: Real-World Test (Upload an Ad)

### Step 1: Upload a Test Ad
1. Go to your website
2. Select a square
3. Fill in business details
4. Upload a logo
5. Complete payment (or use promo code for free)

### Step 2: Check Email
- After successful upload, check the email address you provided
- You should receive a confirmation email automatically

---

## Check Backend Logs

### In Render.com:
1. Go to your backend service
2. Click **"Logs"** tab
3. Look for email-related messages:

**Success:**
```
✅ Confirmation email sent successfully: <message-id>
```

**Error:**
```
❌ Error sending confirmation email: <error message>
⚠️ Email service not configured
```

---

## Troubleshooting

### Email Not Received?

1. **Check Spam Folder** - Most common issue!
2. **Check Backend Logs** - Look for errors
3. **Verify Email Address** - Make sure it's correct
4. **Check SMTP Settings** - Verify password is correct

### Common Errors:

**"Email service not configured"**
- Check if all SMTP variables are set correctly
- Verify SMTP_PASS is correct

**"Authentication failed"**
- Wrong password
- Wrong SMTP_USER (should be full email: ads@clickalinks.com)
- Try port 465 with SMTP_SECURE=true

**"Connection timeout"**
- Try port 465 instead of 587
- Check firewall settings

---

## Next Steps After Testing

Once email is working:
1. ✅ Email confirmation system is live!
2. ✅ Users will receive emails automatically
3. ✅ Monitor backend logs for any issues
4. ✅ Check spam folder regularly

---

## Test Checklist

- [ ] API test sent successfully
- [ ] Received test email in inbox
- [ ] Email looks correct (HTML formatting)
- [ ] All details are accurate
- [ ] Links work correctly
- [ ] Real ad upload sends email automatically

