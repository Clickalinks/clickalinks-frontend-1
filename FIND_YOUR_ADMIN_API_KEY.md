# 🔑 Where is Your Admin API Key?

## Quick Answer

Your Admin API Key needs to be set in **TWO places**:

1. **Backend** (Render.com): `ADMIN_API_KEY` environment variable
2. **Frontend** (`.env` file): `REACT_APP_ADMIN_API_KEY` environment variable

**Both should have the SAME value!**

---

## 🔍 How to Find/Set Your Admin API Key

### Option 1: Check if You Already Have One

#### Backend (Render.com):
1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Click on your backend service (`clickalinks-backend-2`)
3. Go to **Environment** tab
4. Look for `ADMIN_API_KEY` or `ADMIN_SECRET_KEY`
5. **Copy the value** (this is your key!)

#### Frontend (Local `.env` file):
1. Open `frontend/.env` file
2. Look for `REACT_APP_ADMIN_API_KEY=`
3. If it's empty or missing, you need to set it

---

### Option 2: Generate a New Key

If you don't have a key yet, generate one:

#### PowerShell (Windows):
```powershell
# Generate and copy to clipboard
$key = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$key | Set-Clipboard
Write-Host "Generated key (copied to clipboard): $key"
```

#### Online Generator:
1. Go to: https://www.random.org/strings/
2. Set:
   - **Length**: 32 characters
   - **Character set**: Alphanumeric (A-Z, a-z, 0-9)
3. Click "Generate Strings"
4. Copy one of the generated strings

---

## 📝 Setting Up Your Admin API Key

### Step 1: Set Backend Key (Render.com)

1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Click on your backend service (`clickalinks-backend-2`)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `ADMIN_API_KEY`
   - **Value**: `YOUR_GENERATED_KEY_HERE` (paste your key)
6. Click **Save Changes**
7. Render will automatically redeploy

### Step 2: Set Frontend Key (Local `.env`)

1. Open `frontend/.env` file
2. Add or update this line:
   ```env
   REACT_APP_ADMIN_API_KEY=YOUR_GENERATED_KEY_HERE
   ```
   (Use the SAME key as in Step 1)
3. Save the file
4. **Restart your frontend dev server** (if running)

---

## ✅ Verify It's Working

### Test Backend:
```powershell
# Replace YOUR_KEY with your actual key
$headers = @{
    "x-api-key" = "YOUR_KEY"
}

Invoke-RestMethod -Uri "https://clickalinks-backend-2.onrender.com/admin/shuffle/stats" `
    -Method Get `
    -Headers $headers
```

If it works, you'll see shuffle statistics. If not, check your key.

### Test Frontend:
1. Go to Admin Dashboard → Shuffle tab
2. If you see statistics, your key is working!
3. If you see "ADMIN_API_KEY not configured", check your `.env` file

---

## 🔧 Current Configuration

Based on your code:

- **Backend shuffle route** accepts: `ADMIN_API_KEY` (or `ADMIN_SECRET_KEY` for backward compatibility)
- **Backend promo code routes** use: `ADMIN_API_KEY`
- **Frontend** sends: `REACT_APP_ADMIN_API_KEY` (must match backend `ADMIN_API_KEY`)

**Recommendation**: Use `ADMIN_API_KEY` everywhere for consistency.

---

## 🚨 Common Issues

### "ADMIN_API_KEY not configured"
- **Frontend**: Check `frontend/.env` has `REACT_APP_ADMIN_API_KEY=your_key`
- **Backend**: Check Render.com Environment tab has `ADMIN_API_KEY=your_key`

### "Unauthorized: Invalid admin API key"
- Keys don't match between frontend and backend
- Check for extra spaces or typos
- Make sure both use the exact same value

### Shuffle not working
- Verify key is set in both places
- Check browser console for errors
- Verify backend is running and accessible

---

## 📋 Quick Checklist

- [ ] Generated a secure 32-character key
- [ ] Set `ADMIN_API_KEY` in Render.com backend environment
- [ ] Set `REACT_APP_ADMIN_API_KEY` in `frontend/.env` file
- [ ] Both keys have the SAME value
- [ ] Restarted frontend dev server after updating `.env`
- [ ] Tested shuffle from admin dashboard

---

## 💡 Pro Tip

**Keep your key secure!**
- Never commit it to Git (it's in `.gitignore`)
- Never share it publicly
- Store it in a password manager
- Use different keys for development and production (optional)

---

**Once both keys are set with the same value, your shuffle system will work!** 🎉

