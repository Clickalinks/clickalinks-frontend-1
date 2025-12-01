# Clear localStorage - Multiple Methods

Since you can't paste into the console, here are **5 alternative methods**:

## ✅ Method 1: Use the HTML File (Easiest!)

1. **Open this file in your browser:**
   - Navigate to: `http://localhost:3000/clear-storage.html` (if running locally)
   - **OR** open `frontend/public/clear-storage.html` directly in your browser
   - **OR** I can create a simple page you can access

2. **Click the button** - It will clear localStorage and redirect you

---

## ✅ Method 2: Type Manually (Short Commands)

Since you can't paste, type these **short commands** one at a time:

**Step 1:** Type this (it's short):
```
localStorage.clear()
```
Press Enter

**Step 2:** Type this:
```
location.reload()
```
Press Enter

---

## ✅ Method 3: Use DevTools Application Tab (No Typing!)

1. Press **F12** → Click **Application** tab (Chrome) or **Storage** tab (Firefox)
2. In the left sidebar, expand **Local Storage**
3. Click on your website URL (e.g., `http://localhost:3000`)
4. You'll see all the keys on the right side
5. **Right-click** on each key → **Delete**:
   - `squarePurchases`
   - `pendingPurchases`
   - `businessFormData`
   - Any key starting with `logoPath_`
   - Any key starting with `purchaseId_`
6. Or click **Clear All** button at the top
7. Refresh the page

---

## ✅ Method 4: Bookmarklet (One-Click)

1. **Create a bookmark** with this URL:
   ```
   javascript:(function(){localStorage.clear();alert('localStorage cleared!');location.reload();})();
   ```

2. **Click the bookmark** when you need to clear localStorage

---

## ✅ Method 5: Address Bar (Type Directly)

1. Click in the **address bar** (where the URL is)
2. Type: `javascript:localStorage.clear();location.reload();`
3. Press Enter

---

## 🎯 Recommended: Method 1 (HTML File)

I've created a simple HTML page that you can open. Here's how:

1. **If running locally:**
   - Go to: `http://localhost:3000/clear-storage.html`

2. **Or open the file directly:**
   - Navigate to: `C:\Clickalinks\frontend\public\clear-storage.html`
   - Double-click it to open in your browser
   - Click the button

3. **Or I can add it to your app:**
   - I can add a route like `/clear-storage` that you can access

---

## 🔍 Verify It Worked

After clearing, check the console:
- Type: `localStorage.length`
- Should show `0` or a very small number

Or check DevTools → Application → Local Storage
- Should be empty or only have non-purchase keys

---

**Which method would you like to use? I recommend Method 1 (the HTML file) - it's the easiest!**

