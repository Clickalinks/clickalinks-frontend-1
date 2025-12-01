/**
 * Image Optimization Utilities
 * Uses Intersection Observer for lazy loading and image optimization
 */

/**
 * Create Intersection Observer for lazy image loading
 */
export const createImageObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px', // Start loading 50px before image enters viewport
    threshold: 0.01,
    ...options
  };

  if (!window.IntersectionObserver) {
    // Fallback for browsers without Intersection Observer
    return {
      observe: (element) => {
        // Load immediately if no Intersection Observer support
        if (element && callback) {
          callback(element);
        }
      },
      unobserve: () => {},
      disconnect: () => {}
    };
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        // Unobserve after loading to prevent re-triggering
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);
  
  return observer;
};

/**
 * Optimize image URL for better performance
 * Adds width/height parameters for responsive loading
 */
export const optimizeImageUrl = (url, width = 200, height = 200) => {
  if (!url || typeof url !== 'string') return url;
  
  // For Firebase Storage URLs, we can't modify them easily
  // But we can ensure they're properly formatted
  if (url.includes('firebasestorage')) {
    return url;
  }
  
  // For other URLs, could add optimization parameters
  return url;
};

/**
 * Preload critical images
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'));
      return;
    }

    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Batch preload images with concurrency limit
 */
export const preloadImages = async (urls, maxConcurrent = 5) => {
  const results = [];
  const queue = [...urls];
  
  const loadBatch = async () => {
    while (queue.length > 0) {
      const batch = queue.splice(0, maxConcurrent);
      const batchPromises = batch.map(url => 
        preloadImage(url).catch(err => ({ error: err, url }))
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
  };
  
  await loadBatch();
  return results;
};

