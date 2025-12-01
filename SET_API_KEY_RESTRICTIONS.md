# 🔒 Set API Key Application Restrictions

## Current Status
✅ **API restrictions:** Already set (24 Firebase APIs selected)  
❌ **Application restrictions:** Still set to "None" (needs to be fixed!)

---

## Step-by-Step Instructions

### 1. Set Application Restrictions

In the **"Application restrictions"** section:

1. **Click the radio button:** `Websites` (HTTP referrers)

2. **Click "Add an item"** button

3. **Add each of these referrers one by one:**

   ```
   https://clickalinks-frontend.web.app/*
   ```

   Click "Add an item" again, then add:
   ```
   https://clickalinks-frontend.firebaseapp.com/*
   ```

   Click "Add an item" again, then add:
   ```
   https://www.clickalinks.com/*
   ```

   Click "Add an item" again, then add:
   ```
   http://localhost:3000/*
   ```

4. **You should see 4 referrers listed:**
   - `https://clickalinks-frontend.web.app/*`
   - `https://clickalinks-frontend.firebaseapp.com/*`
   - `https://www.clickalinks.com/*`
   - `http://localhost:3000/*`

---

### 2. Save Changes

1. **Scroll to the bottom** of the page
2. **Click "SAVE"** button
3. **Wait for confirmation** (usually takes a few seconds)

---

### 3. Verify

After saving, you should see:
- ✅ **Application restrictions:** Websites (HTTP referrers) - 4 items
- ✅ **API restrictions:** Restrict key - 24 APIs

---

## What This Does

- **Prevents unauthorized use:** API key can ONLY be used from your domains
- **Blocks abuse:** Even if someone steals the key, they can't use it from other websites
- **Allows local development:** `localhost:3000` is included for testing

---

## Important Notes

- ⚠️ **Don't use wildcards like `*://*/*`** - too permissive
- ✅ **Use specific domains** with `/*` at the end
- ✅ **Include `localhost`** for local development
- ✅ **Save changes** before closing the page

---

## After Saving

Once you've saved:
1. ✅ Copy your API key (if you haven't already)
2. ✅ Create `.env` file with the new key
3. ✅ Test locally
4. ✅ Deploy

Let me know when you've saved the restrictions! 🚀

