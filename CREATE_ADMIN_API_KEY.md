# How to Create Your ADMIN_API_KEY

## What is ADMIN_API_KEY?

`ADMIN_API_KEY` is a **secret password** that protects your admin endpoints (like creating promo codes). Only you should know this key.

---

## Step 1: Generate a Secure Key

You need to create a long, random string. Here are options:

### Option A: Use PowerShell (Windows)

```powershell
# Generate a random 32-character key
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Option B: Use Online Generator

1. Go to: https://www.random.org/strings/
2. Set:
   - **Length**: 32 characters
   - **Character set**: Alphanumeric (A-Z, a-z, 0-9)
   - **Unique**: Yes
3. Click "Generate Strings"
4. Copy one of the generated strings

### Option C: Use Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 2: Add to Render.com Environment Variables

1. Go to **Render.com** → Your Backend Service (`clickalinks-backend-2`)
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key**: `ADMIN_API_KEY`
   - **Value**: `YOUR_GENERATED_KEY_HERE` (paste the key you generated)
5. Click **Save Changes**
6. Render will automatically redeploy

---

## Step 3: Verify It's Set

After deployment, check Render.com logs. You should see the backend starting without errors.

---

## Step 4: Use the Key

### When Creating Promo Codes (PowerShell):

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "YOUR_ADMIN_API_KEY_HERE"
}

$body = @{
    count = 200
    prefix = "FREE10"
    discountType = "free_days"
    discountValue = 10
    description = "10 Free Days - Launch Campaign"
    maxUses = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/api/promo-code/bulk-create" `
    -Method Post `
    -Body $body `
    -Headers $headers
```

### When Running the Script:

The script (`create-200-promo-codes.js`) will automatically use the `ADMIN_API_KEY` from environment variables.

---

## Important Security Notes

1. **Never commit this key to Git** - It's already in `.gitignore`
2. **Never share this key publicly** - Keep it secret
3. **Use a strong, random key** - At least 32 characters
4. **Store it securely** - Write it down somewhere safe (password manager)

---

## Example Key Format

A good key looks like this:
```
aB3xK9mP2qR7vT5wY8zN1cF4hJ6lM0pQ9sU2vW5xZ8
```

**DO NOT use this example** - Generate your own!

---

## Quick PowerShell Command to Generate and Copy

```powershell
# Generate and copy to clipboard
$key = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$key | Set-Clipboard
Write-Host "Generated key (copied to clipboard): $key"
```

---

## Troubleshooting

### "ADMIN_API_KEY not set" error
- Check Render.com → Environment tab
- Make sure the key is exactly `ADMIN_API_KEY` (case-sensitive)
- Redeploy after adding the variable

### "Unauthorized" error when using the key
- Make sure you're using the exact same key in your request
- Check for extra spaces or characters
- Verify the key in Render.com matches what you're sending

---

**Once you've added the key to Render.com, you can create your 200 promo codes!**

