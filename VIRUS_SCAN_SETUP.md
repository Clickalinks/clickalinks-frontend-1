# Virus Scanning Setup Guide

## Overview
The application now includes virus/malware scanning for uploaded logos to ensure security.

## Setup Options

### Option 1: VirusTotal API (Recommended for Production)

1. **Get VirusTotal API Key**
   - Go to: https://www.virustotal.com/gui/join-us
   - Sign up for a free account
   - Get your API key from: https://www.virustotal.com/gui/user/[your-username]/apikey

2. **Add API Key to Backend**
   - Add to your backend `.env` file:
     ```
     VIRUSTOTAL_API_KEY=your_api_key_here
     ```
   - Restart your backend server

3. **Rate Limits**
   - Free tier: 4 requests per minute
   - Paid tiers available for higher limits

### Option 2: Basic Validation (Current Default)

If VirusTotal API key is not configured, the system will:
- ✅ Check file type (images only)
- ✅ Check file size (2MB limit)
- ✅ Block suspicious file extensions (.exe, .bat, etc.)
- ⚠️ **Does NOT scan for viruses** - only basic validation

## How It Works

1. **User uploads logo** → File is validated
2. **Virus scan** → File sent to backend for scanning
3. **Backend scans** → Uses VirusTotal API (if configured) or basic validation
4. **Result** → Safe files proceed, unsafe files are blocked

## Testing

### Test Safe File
1. Upload a normal image (PNG, JPG, etc.)
2. Should pass validation and scan
3. Logo should upload successfully

### Test Unsafe File
1. Try uploading a non-image file
2. Should be blocked with error message
3. Upload should fail

## Backend Endpoint

**POST** `/api/scan-file`

**Request:**
```json
{
  "fileData": "data:image/png;base64,...",
  "fileName": "logo.png"
}
```

**Response (Safe):**
```json
{
  "success": true,
  "safe": true,
  "message": "File is safe",
  "scanId": "abc123"
}
```

**Response (Unsafe):**
```json
{
  "success": true,
  "safe": false,
  "message": "File flagged by 5 antivirus engines",
  "scanId": "abc123",
  "positives": 5,
  "total": 60
}
```

## Troubleshooting

### "Virus scan unavailable"
- **Cause**: Backend not responding or VirusTotal API error
- **Action**: Check backend logs, verify API key

### "Security scan failed"
- **Cause**: File flagged as unsafe
- **Action**: Upload a different file

### Uploads blocked even for safe files
- **Cause**: VirusTotal API rate limit exceeded
- **Action**: Wait a minute or upgrade API plan

## Production Recommendations

1. **Use VirusTotal API** for real virus scanning
2. **Set up monitoring** for scan failures
3. **Consider ClamAV** for self-hosted alternative
4. **Add logging** for all scan results
5. **Set up alerts** for repeated failures

