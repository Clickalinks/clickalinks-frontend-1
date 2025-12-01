/**
 * Performance utilities
 * Remove console.logs in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const perfLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const perfWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

export const perfError = (...args) => {
  // Always log errors, even in production
  console.error(...args);
};

