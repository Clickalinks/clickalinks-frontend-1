# Firebase Storage CORS Fix Guide

## Problem
CORS errors when loading images from Firebase Storage:
- `ERR_FAILED` network errors
- `No 'Access-Control-Allow-Origin' header` errors

## Root Cause
1. **Fetch HEAD requests** - Firebase Storage doesn't allow HEAD requests from browsers without proper CORS configuration
2. **Storage Rules** - May not be published correctly
3. **File Access** - Files might not exist or rules block access

## Solution Applied

### 1. Removed Fetch HEAD Checks
- Removed `fetch(logoURL, { method: 'HEAD' })` calls that were causing CORS errors
- Browser's native `<img>` tag handles CORS automatically
- Image `onError` handler now only marks images as failed without network checks

### 2. Verify Storage Rules

**Go to Firebase Console → Storage → Rules**

Make sure these rules are published:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Logos folder - public read, authenticated write
    match /logos/{logoId} {
      // Allow anyone to read logos (needed for displaying on website)
      allow read: if true;
      
      // Allow authenticated users to write/delete logos
      // Max file size: 5MB to prevent abuse
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
    
    // Deny all other paths by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**OR for testing (more permissive):**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Logos folder - public read and write (for testing)
    match /logos/{logoId} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
    
    // Deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Verify Files Exist

1. Go to Firebase Console → Storage → Files
2. Check if files exist in the `logos/` folder
3. If files are missing, they need to be re-uploaded

### 4. Test Image URLs

Try opening a logo URL directly in your browser:
```
https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/logos%2Fsquare-14-1764028088477?alt=media&token=293d308c-b6df-4126-a2ca-b05dc1f8e27f
```

If it loads in the browser but not in your app:
- Check browser console for other errors
- Verify the URL is correct in Firestore documents

## Expected Behavior After Fix

1. ✅ Images load using native browser `<img>` tag (no CORS issues)
2. ✅ Failed images show "Active Ad" placeholder
3. ✅ No more `fetch()` CORS errors in console
4. ✅ Images display correctly if Storage rules allow public read

## If Images Still Don't Load

1. **Check Storage Rules** - Make sure `allow read: if true;` is set for `/logos/{logoId}`
2. **Check File Existence** - Verify files exist in Firebase Storage
3. **Check Firestore Data** - Verify `logoData` field contains valid Firebase Storage URLs
4. **Check Browser Console** - Look for other errors (not CORS related)

## Notes

- Firebase Storage automatically handles CORS for image requests via `<img>` tags
- The `fetch()` API requires explicit CORS headers, which Storage doesn't provide for HEAD requests
- Using native image loading avoids CORS issues entirely

