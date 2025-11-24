# How to Access the Manual Sync Tool

## 📍 Location

The manual sync tool is located at:
```
frontend/public/manual-sync.html
```

## 🌐 How to Access It

### Option 1: Local Development (if running `npm start`)

1. Make sure your React app is running:
   ```bash
   cd frontend
   npm start
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/manual-sync.html
   ```

### Option 2: After Deploying to Firebase

1. Deploy your app to Firebase:
   ```bash
   cd frontend
   npm run deploy
   ```

2. Once deployed, access it at:
   ```
   https://clickalinks-frontend.web.app/manual-sync.html
   ```
   OR
   ```
   https://clickalinks-frontend.firebaseapp.com/manual-sync.html
   ```

### Option 3: Direct File Access (Local)

1. Navigate to: `C:\Clickalinks\frontend\public\manual-sync.html`
2. Right-click the file
3. Select "Open with" → Choose your web browser (Chrome, Firefox, Edge, etc.)

## 🎯 What the Tool Does

1. **Check localStorage** - Shows all purchases stored in your browser's localStorage
2. **Sync to Firestore** - Manually saves purchases from localStorage to Firestore
3. **Check Firestore** - Verifies what's currently in Firestore

## 📝 Step-by-Step Usage

1. **Open the tool** using one of the methods above
2. **Click "1. Check localStorage"** - This shows you what purchases are stored locally
3. **Click "2. Sync to Firestore"** - This saves any purchases from localStorage to Firestore
4. **Click "3. Check Firestore"** - This verifies the purchases were saved successfully

## ⚠️ Important Notes

- The tool runs in your browser, not in Firebase Console
- It uses the same Firebase configuration as your main app
- Make sure Firestore security rules allow writes (they should if you published them)
- The tool will show error messages if something goes wrong

## 🔍 Troubleshooting

If you can't access the tool:

1. **Check if the file exists**: Look in `frontend/public/manual-sync.html`
2. **If using local development**: Make sure `npm start` is running
3. **If deployed**: Make sure you deployed the latest version with `npm run deploy`
4. **Check browser console**: Press F12 and look for any errors

## 🎨 Visual Guide

The tool has a simple interface with buttons:
- **Blue buttons** for actions (Check localStorage, Sync to Firestore, Check Firestore)
- **Log area** at the bottom showing results
- **Color-coded messages**: 
  - Green = Success
  - Red = Error
  - Blue = Info

