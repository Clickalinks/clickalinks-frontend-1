# How to Fix ADMIN_PASSWORD_HASH

## The Problem
Your `ADMIN_PASSWORD_HASH` in Render is currently set to literally `"<hash>"` (the text), but it needs to be an actual bcrypt hash (a long string like `$2a$10$abcdef...`).

## Solution: Generate a Real Hash

### Option 1: Generate Hash in Node.js (Recommended)

1. **Open terminal/command prompt**

2. **Navigate to your Backend folder**:
   ```bash
   cd C:\Clickalinks\Backend
   ```

3. **Run this command** (replace `YOUR_PASSWORD` with your actual admin password):
   ```bash
   node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('YOUR_PASSWORD', 10); console.log('\n✅ Password hash:\n' + hash + '\n');"
   ```

   **Example** (if your password is "MySecurePass123!"):
   ```bash
   node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('MySecurePass123!', 10); console.log('\n✅ Password hash:\n' + hash + '\n');"
   ```

4. **You'll get output like**:
   ```
   ✅ Password hash:
   $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
   ```

5. **Copy that ENTIRE string** (starts with `$2a$10$`)

### Option 2: Edit the Script File

1. Open `generate-password-hash.js` in your editor
2. Change `'your-password-here'` to your actual password
3. Run: `node generate-password-hash.js`
4. Copy the hash it outputs

## Set in Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your backend service**: "clickalinks-backend-2"
3. **Click "Environment" tab**
4. **Find `ADMIN_PASSWORD_HASH`**
5. **Click to edit it**
6. **Replace the value**:
   - ❌ **Remove**: `<hash>` (or whatever is there)
   - ✅ **Paste**: The entire hash string you generated (starts with `$2a$10$`)
7. **Click "Save Changes"**
8. **Restart your service** (it should auto-restart, but you can manually trigger it)

## Important Notes

- ✅ The hash is a **long string** starting with `$2a$10$`
- ✅ Copy the **ENTIRE string** (usually 60 characters long)
- ❌ **NOT** just the symbol `#`
- ❌ **NOT** the text `<hash>`
- ✅ The hash should look like: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

## Verify It Worked

After setting the hash and restarting:
1. Check Render logs
2. You should see: `✅ ADMIN_PASSWORD_HASH is configured`
3. If you don't see this, the hash format is wrong

## Example Hash Format

A valid bcrypt hash looks like this:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

It has:
- `$2a$` at the start
- `10$` (cost factor)
- Then a long string of letters/numbers

---

**Need help?** If you're not sure what password to use, choose a strong password like:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Example: `MyAdminPass123!@#`

