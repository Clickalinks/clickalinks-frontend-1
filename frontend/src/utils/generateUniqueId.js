/**
 * Generate unique ID for purchases
 * Uses timestamp + random string for uniqueness
 */
export const generateUniquePurchaseId = () => {
  return `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate UUID-like ID (alternative method)
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

