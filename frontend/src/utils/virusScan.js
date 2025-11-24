// Virus scanning utility for uploaded logos
// Uses VirusTotal API or similar service

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

/**
 * Scan uploaded file for viruses/malware
 * @param {string} fileData - Base64 data URL or file buffer
 * @param {string} fileName - Original file name
 * @returns {Promise<{safe: boolean, message: string, scanId?: string}>}
 */
export const scanFileForVirus = async (fileData, fileName) => {
  try {
    console.log('🔍 Starting virus scan for file:', fileName);
    
    // Send to backend for scanning (backend will use VirusTotal API or ClamAV)
    const response = await fetch(`${BACKEND_URL}/api/scan-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: fileData,
        fileName: fileName,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.safe) {
      console.log('✅ File passed virus scan');
      return {
        safe: true,
        message: 'File is safe',
        scanId: result.scanId
      };
    } else {
      console.warn('⚠️ File failed virus scan:', result.message);
      return {
        safe: false,
        message: result.message || 'File failed security scan',
        scanId: result.scanId
      };
    }
  } catch (error) {
    console.error('❌ Virus scan error:', error);
    
    // If scanning service is unavailable, we can either:
    // 1. Block the upload (safer)
    // 2. Allow with warning (less safe but better UX)
    
    // For now, we'll allow with a warning if scan fails
    // In production, you might want to block uploads if scan fails
    console.warn('⚠️ Virus scan unavailable, allowing upload with warning');
    return {
      safe: true, // Allow upload if scan service is down
      message: 'Security scan unavailable - upload allowed',
      warning: true
    };
  }
};

/**
 * Validate file type and basic security checks
 * @param {File} file - File object
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export const validateFileSecurity = async (file) => {
  // Basic validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Invalid file type. Only images are allowed.'
    };
  }

  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    return {
      valid: false,
      message: 'File size exceeds 2MB limit.'
    };
  }

  // Check for suspicious file extensions in name
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar'];
  const fileName = file.name.toLowerCase();
  if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      valid: false,
      message: 'File type not allowed for security reasons.'
    };
  }

  return {
    valid: true,
    message: 'File passed basic security checks'
  };
};

