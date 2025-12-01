# Deployment Guide - ClickALinks

## Prerequisites

1. **Firebase CLI installed**: If not installed, run:
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**: Run:
   ```bash
   firebase login
   ```

3. **Backend Environment Variable**: Make sure your backend has `FRONTEND_URL` set to your Firebase hosting URL (e.g., `https://clickalinks-frontend.web.app`)

---

## Step-by-Step Deployment

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Build the React App
```bash
npm run build
```
This creates an optimized production build in the `build/` folder.

### 4. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

**OR use the combined command:**
```bash
npm run deploy
```
(This runs both `npm run build` and `firebase deploy --only hosting`)

---

## Quick Deploy (All-in-One)

From the `frontend` directory:
```bash
npm run deploy
```

---

## Verify Deployment

After deployment, visit:
- **Your Firebase Hosting URL**: `https://clickalinks-frontend.web.app`
- **Alternative URL**: `https://clickalinks-frontend.firebaseapp.com`

---

## Backend Configuration

Make sure your backend server (on Render.com or wherever it's hosted) has the environment variable:

```
FRONTEND_URL=https://clickalinks-frontend.web.app
```

This ensures Stripe redirects correctly after payment.

---

## Troubleshooting

### If `firebase deploy` fails:
1. Check you're logged in: `firebase login`
2. Verify project: `firebase projects:list`
3. Check `.firebaserc` file has correct project ID

### If build fails:
1. Check for errors in terminal
2. Try: `npm install` first
3. Clear cache: `npm run build -- --no-cache`

### If deployment succeeds but site doesn't work:
1. Check Firebase Console → Hosting → Check deployment status
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors

---

## Development vs Production

- **Development**: `npm start` (runs on http://localhost:3000)
- **Production**: `npm run build` then `firebase deploy` (deploys to Firebase)

---

## Notes

- The `build/` folder is automatically created during build
- The `build/` folder is what gets deployed to Firebase
- Never commit the `build/` folder to git (it's in `.gitignore`)
- Always test locally with `npm start` before deploying

