import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where, doc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { cleanupExpiredAds } from '../utils/cleanupExpiredAds';
import { syncLocalStorageToFirestore } from '../utils/savePurchaseToFirestore';
import { perfLog, perfWarn, perfError } from '../utils/performance';
import { getCachedPurchases, cachePurchases, clearExpiredCache } from '../utils/cache';
import { createImageObserver } from '../utils/imageOptimizer';
import { debounce } from '../utils/debounce';
import { trackClick } from '../utils/clickTracker';
import './AdGrid.css';

// Helper function to detect mobile devices (NOT tablets)
// Tablets should use desktop layout, only phones use mobile layout
const isMobileDevice = () => {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent;
  
  // If width is >= 768px, it's tablet or desktop, not mobile
  if (width >= 768) return false;
  
  // For widths < 768px, check if it's actually a phone (not tablet)
  // Exclude iPad and Android tablets from mobile detection
  const isTablet = /iPad|Android/i.test(userAgent) && width >= 600;
  if (isTablet) return false;
  
  // Otherwise, it's a mobile phone
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

// Helper function to detect tablet devices (iPad, etc.)
const isTabletDevice = () => {
  const width = window.innerWidth;
  return (width >= 768 && width < 1024) || /iPad/i.test(navigator.userAgent);
};

const AdGrid = ({ start = 1, end = 200, pageNumber, isHome = false }) => {
  const navigate = useNavigate();
  const location = useLocation(); // For search highlighting
  const [selectedOccupiedSquare, setSelectedOccupiedSquare] = useState(null);
  const [purchasedSquares, setPurchasedSquares] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [timeUntilShuffle, setTimeUntilShuffle] = useState(0);
  const imageObserverRef = useRef(null);
  const imageRefsRef = useRef(new Map());

  // Memoize squares array to prevent React hook dependency issues
  const squares = useMemo(() => 
    Array.from({ length: end - start + 1 }, (_, index) => start + index),
    [start, end]
  );

  // Mobile detection with debouncing and orientation change handling
  useEffect(() => {
    let resizeTimeout;
    const checkScreenSize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        // Tablets (>= 768px) should NOT be treated as mobile
        setIsMobile(width < 768 && !isTabletDevice());
      }, 150); // Debounce resize events
    };
    
    // Initial check
    const width = window.innerWidth;
    setIsMobile(width < 768 && !isTabletDevice());
    
    // Handle resize and orientation changes
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', () => {
      // Force re-check after orientation change
      setTimeout(checkScreenSize, 200);
    });
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Set up Intersection Observer for lazy image loading
  // MOBILE OPTIMIZATION: Larger rootMargin for mobile to preload images earlier
  useEffect(() => {
    if (!imageObserverRef.current) {
      const rootMargin = isMobileDevice() ? '200px' : '100px'; // Preload earlier on mobile for smoother scrolling
      
      imageObserverRef.current = createImageObserver((imgElement) => {
        // Image is about to enter viewport - ensure it's loading
        // Note: src is already set, this just ensures visibility triggers load
        if (imgElement && imgElement.src) {
          // Force a reload check if image hasn't loaded yet
          if (!imgElement.complete || imgElement.naturalWidth === 0) {
            // Image hasn't loaded, trigger load by accessing src
            const currentSrc = imgElement.src;
            imgElement.src = '';
            imgElement.src = currentSrc;
          }
        }
      }, {
        rootMargin: rootMargin,
        threshold: 0.01
      });
    }

    return () => {
      if (imageObserverRef.current) {
        imageObserverRef.current.disconnect();
      }
    };
  }, []);

  // CRITICAL FIX: Check for cached images after purchases are loaded
  // This handles the refresh case where browser cache loads images before onLoad fires
  useEffect(() => {
    if (Object.keys(purchasedSquares).length > 0 && !isLoading) {
      // Small delay to ensure DOM is updated
      const checkCachedImages = setTimeout(() => {
        imageRefsRef.current.forEach((imgEl, pos) => {
          if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && purchasedSquares[pos]) {
            setLoadedImages(prev => {
              if (!prev.has(pos)) {
                perfLog(`✅ Square ${pos}: Image loaded from cache (useEffect check)`);
                return new Set([...prev, pos]);
              }
              return prev;
            });
            imgEl.style.opacity = '1';
            imgEl.style.display = 'block';
          }
        });
      }, 100);
      
      return () => clearTimeout(checkCachedImages);
    }
  }, [purchasedSquares, isLoading]);

  // Auto-shuffle timer and manual shuffle handler
  useEffect(() => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
    const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';
    const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

    const calculateTimeUntilShuffle = () => {
      const now = Date.now();
      const currentPeriod = Math.floor(now / SHUFFLE_INTERVAL);
      const nextShuffleTime = (currentPeriod + 1) * SHUFFLE_INTERVAL;
      return Math.max(0, Math.floor((nextShuffleTime - now) / 1000));
    };

    const triggerAutoShuffle = async () => {
      if (!ADMIN_API_KEY) {
        perfWarn('⚠️ ADMIN_API_KEY not configured. Auto-shuffle skipped.');
        return;
      }

      try {
        perfLog('🔄 Auto-shuffle triggered (2-hour interval)');
        const response = await fetch(`${BACKEND_URL}/admin/shuffle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ADMIN_API_KEY
          }
        });

        if (response.ok) {
          const result = await response.json();
          perfLog(`✅ Auto-shuffle completed: ${result.shuffledCount || 0} squares shuffled`);
          window.dispatchEvent(new CustomEvent('shuffleCompleted'));
        } else {
          perfWarn(`⚠️ Auto-shuffle failed: ${response.status}`);
        }
      } catch (error) {
        perfError('❌ Auto-shuffle error:', error);
      }
    };

    // Initialize timer
    setTimeUntilShuffle(calculateTimeUntilShuffle());

    // Update timer every second
    const timerInterval = setInterval(() => {
      setTimeUntilShuffle(calculateTimeUntilShuffle());
    }, 1000);

    // Auto-shuffle interval (2 hours)
    const shuffleInterval = setInterval(() => {
      triggerAutoShuffle();
    }, SHUFFLE_INTERVAL);

    return () => {
      clearInterval(timerInterval);
      clearInterval(shuffleInterval);
    };
  }, []);

  // Manual shuffle handler
  const handleManualShuffle = useCallback(async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
    const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

    if (!ADMIN_API_KEY) {
      alert('⚠️ ADMIN_API_KEY not configured. Please set REACT_APP_ADMIN_API_KEY in your .env file.');
      return;
    }

    if (!window.confirm('🔄 Shuffle all advertising squares now?\n\nThis will randomly rearrange all occupied squares.\n\nContinue?')) {
      return;
    }

    try {
      perfLog('🔄 Manual shuffle triggered');
      const response = await fetch(`${BACKEND_URL}/admin/shuffle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        const result = await response.json();
        perfLog(`✅ Manual shuffle completed: ${result.shuffledCount || 0} squares shuffled`);
        alert(`✅ Shuffle completed! ${result.shuffledCount || 0} squares shuffled.`);
        window.dispatchEvent(new CustomEvent('shuffleCompleted'));
        loadPurchasedSquares(true);
      } else {
        const errorText = await response.text();
        throw new Error(`Shuffle failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      perfError('❌ Manual shuffle error:', error);
      alert(`❌ Shuffle failed: ${error.message}`);
    }
  }, []);

  // Listen for shuffle completion events
  useEffect(() => {
    const handleShuffleCompleted = () => {
      perfLog('🔄 Shuffle completed event received, reloading purchases...');
      loadPurchasedSquares(true);
    };

    window.addEventListener('shuffleCompleted', handleShuffleCompleted);
    return () => {
      window.removeEventListener('shuffleCompleted', handleShuffleCompleted);
    };
  }, []);

        // Load purchased squares with caching
        useEffect(() => {
          let isSyncing = false;
          let isMounted = true;
          
          const loadPurchasedSquares = async (forceFresh = false) => {
            if (!isMounted) return; // Prevent state updates if unmounted
            
            try {
              // MOBILE FIX: Force fresh data on mobile - skip cache to prevent stale data
              if (isMobileDevice()) {
                // MOBILE: Always clear cache and fetch fresh data
                perfLog(`📱 Mobile device detected - forcing fresh data fetch`);
                try {
                  const { clearAllCache } = await import('../utils/cache');
                  await clearAllCache();
                  perfLog(`✅ Mobile cache cleared`);
                } catch (cacheError) {
                  perfWarn('⚠️ Mobile cache clear failed:', cacheError);
                }
              }
              
              // PERFORMANCE: Try cache first for instant load (desktop only)
              // BUT: Skip cache if forceFresh=true (e.g., after purchase completed)
              let cachedPurchases = {};
              if (!isMobileDevice() && !forceFresh) {
                perfLog(`🚀 Loading from cache for page ${pageNumber} (squares ${start}-${end})...`);
                cachedPurchases = await getCachedPurchases(start, end);
                
                if (Object.keys(cachedPurchases).length > 0 && isMounted) {
                  perfLog(`✅ Loaded ${Object.keys(cachedPurchases).length} squares from cache`);
                  setPurchasedSquares(cachedPurchases);
                  setIsLoading(false);
                }
              } else {
                if (forceFresh) {
                  perfLog(`🔄 Force fresh: Skipping cache, fetching fresh data from Firestore`);
                } else {
                  perfLog(`📱 Mobile: Skipping cache, fetching fresh data from Firestore`);
                }
              }
              
              // PERFORMANCE: Sync localStorage to Firestore in background (non-blocking)
              // Only sync once per session, don't wait for it
              if (!isSyncing && !sessionStorage.getItem('localStorageSynced')) {
                isSyncing = true;
                sessionStorage.setItem('localStorageSynced', 'true');
                // Run sync in background, don't await
                syncLocalStorageToFirestore().then(syncedCount => {
                  if (syncedCount > 0) {
                    perfLog(`✅ Synced ${syncedCount} purchase(s) from localStorage to Firestore`);
                  }
                  isSyncing = false;
                }).catch(syncError => {
                  perfError('❌ Error syncing localStorage to Firestore:', syncError);
                  isSyncing = false;
                });
              }
              
              // PERFORMANCE: Load all active purchases, filter client-side to avoid index requirement
              // Note: Firestore doesn't support range queries on squareNumber easily without composite index
              // We'll load all active and filter client-side, but use caching to minimize queries
              perfLog(`🔄 Loading purchased squares from Firestore for page ${pageNumber} (squares ${start}-${end})...`);
              
              // Load purchases from Firestore
              // NOTE: Collection name is 'purchasedSquares' in Firestore
              
              // PERFORMANCE: Use cache if available (desktop only), only query Firestore if cache is empty or mobile
              let querySnapshot;
              if (!isMobileDevice() && Object.keys(cachedPurchases).length > 0) {
                // Use cache, skip Firestore query for faster loading (desktop only)
                perfLog(`✅ Using cached data, skipping Firestore query for faster load`);
                querySnapshot = { size: 0, forEach: () => {} }; // Empty snapshot
              } else {
                // MOBILE/TABLET: Fetch fresh data
                const pageQuery = query(
                  collection(db, 'purchasedSquares'),
                  where('status', '==', 'active'),
                  where('paymentStatus', '==', 'paid')
                );
                querySnapshot = await getDocs(pageQuery);
                perfLog(`📊 Found ${querySnapshot.size} documents from Firestore`);
              }
        
        const purchases = {};
        const now = new Date();
        
        // CRITICAL: Use squareNumber as key for display, and purchaseId to prevent logo duplicates
        const squareToDocMap = new Map(); // Track squareNumber -> docId to detect duplicates
        const purchaseIdSet = new Set(); // Track purchaseIds to ensure each logo appears only once
        
        // Process purchases and map by squareNumber
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const docId = doc.id;
          const purchaseId = data.purchaseId || docId;
          
          // Filter: Only active, paid purchases with logos
          if (!data || data.status !== 'active') return;
          if (data.paymentStatus && data.paymentStatus !== 'paid') return;
          
          // Check expiration
          if (data.endDate) {
            const endDate = new Date(data.endDate);
            if (endDate < now) return;
          }
          
          // Must have valid logo
          const logoData = data.logoData;
          if (!logoData || typeof logoData !== 'string' || !logoData.trim()) return;
          if (!logoData.startsWith('http://') && !logoData.startsWith('https://') && !logoData.startsWith('data:')) return;
          
          // Prevent duplicates
          if (purchaseIdSet.has(purchaseId)) {
            perfWarn(`⚠️ Duplicate purchaseId: ${purchaseId}, skipping`);
            return;
          }
          purchaseIdSet.add(purchaseId);
          
          // Use squareNumber directly for mapping
          const purchaseSquareNumber = data.squareNumber;
          
          // Only include purchases in current page range
          if (purchaseSquareNumber >= start && purchaseSquareNumber <= end) {
            purchases[purchaseSquareNumber] = {
              ...data,
              purchaseId: purchaseId,
              docId: docId,
              squareNumber: purchaseSquareNumber
            };
          }
        });
        
        perfLog(`✅ Loaded ${querySnapshot.size} total purchases, showing ${Object.keys(purchases).length} on page ${pageNumber} (squares ${start}-${end})`);

        // CRITICAL FIX: Only use Firestore data - don't merge localStorage if Firestore is empty
        // If Firestore is empty, clear localStorage to prevent stale data from showing
        if (querySnapshot.size === 0) {
          // Firestore is empty - clear localStorage to prevent stale "Active Ad" squares
          const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
          if (Object.keys(localPurchases).length > 0) {
            perfLog(`🗑️ Firestore is empty - clearing ${Object.keys(localPurchases).length} stale entries from localStorage`);
            localStorage.removeItem('squarePurchases');
            // Also clear logo paths
            Object.keys(localPurchases).forEach(squareNum => {
              localStorage.removeItem(`logoPath_${squareNum}`);
            });
          }
        } else {
          // Firestore has data - clean up localStorage entries that don't exist in Firestore
          // Also clean up broken logo URLs (404 errors)
          const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
          const firestoreSquareNumbers = new Set(Object.keys(purchases).map(sq => String(sq)));
          let cleanedCount = 0;
          
          Object.keys(localPurchases).forEach(squareNum => {
            const localData = localPurchases[squareNum];
            
            // Remove if not in Firestore (Firestore is source of truth)
            if (!firestoreSquareNumbers.has(squareNum)) {
              delete localPurchases[squareNum];
              localStorage.removeItem(`logoPath_${squareNum}`);
              cleanedCount++;
              perfLog(`🗑️ Removed stale localStorage entry for square ${squareNum} (not in Firestore)`);
              return;
            }
            
            // Check for broken logo URLs (404)
            const logoData = localData.logoData;
            if (logoData && logoData.includes('firebasestorage.googleapis.com')) {
              // Mark for validation - will be checked async
              // For now, if Firestore has the square, use Firestore data (which is already in purchases)
              // Don't merge localStorage if Firestore has it
            }
            
            // Clean up unconfirmed/pending purchases
            const isActive = localData && localData.status === 'active';
            const hasConfirmedPayment = localData.paymentStatus === 'paid';
            
            if (!isActive || !hasConfirmedPayment) {
              delete localPurchases[squareNum];
              localStorage.removeItem(`logoPath_${squareNum}`);
              cleanedCount++;
              perfLog(`🗑️ Removed unconfirmed purchase from localStorage: square ${squareNum} (status: ${localData.status}, payment: ${localData.paymentStatus})`);
            }
          });
          
          // Save cleaned localStorage
          if (cleanedCount > 0) {
            localStorage.setItem('squarePurchases', JSON.stringify(localPurchases));
            perfLog(`✅ Cleaned ${cleanedCount} stale/broken entries from localStorage`);
          }
        }

        perfLog(`✅ Loaded ${Object.keys(purchases).length} active squares from Firestore`);
        
        // Debug: Log squares with logos
        const squaresWithLogos = Object.keys(purchases).filter(sq => purchases[sq].logoData);
        perfLog(`📊 Squares with logos: ${squaresWithLogos.length} out of ${Object.keys(purchases).length}`);
        if (squaresWithLogos.length > 0) {
          perfLog(`📋 Squares with logos: ${squaresWithLogos.slice(0, 10).join(', ')}${squaresWithLogos.length > 10 ? '...' : ''}`);
        }
        
        // PERFORMANCE: Cache the purchases for faster subsequent loads (non-blocking, desktop/tablet only)
        // MOBILE FIX: Don't cache on mobile phones to prevent stale data
        // TABLET FIX: Tablets use desktop caching behavior
        if (!isMobileDevice()) {
          cachePurchases(purchases).catch(err => {
            perfWarn('Cache write failed:', err);
          });
        } else {
          perfLog(`📱 Mobile phone: Skipping cache write to prevent stale data`);
        }
        
        // Debug: Log if no squares loaded
        if (Object.keys(purchases).length === 0) {
          perfWarn('⚠️ NO SQUARES LOADED! Check Firestore configuration.');
        }
        
        // CRITICAL: Update purchases, then check for cached images
        // Don't reset loadedImages - let browser cache work
        if (isMounted) {
        setPurchasedSquares(purchases);
          
          // After state update, check for images that loaded from cache
          setTimeout(() => {
            imageRefsRef.current.forEach((imgEl, pos) => {
              if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && purchases[pos]) {
                setLoadedImages(prev => {
                  if (!prev.has(pos)) {
                    perfLog(`✅ Square ${pos}: Image loaded from cache`);
                    return new Set([...prev, pos]);
                  }
                  return prev;
                });
                imgEl.style.opacity = '1';
                imgEl.style.display = 'block';
              }
            });
          }, 50);
        }
        
        // Note: Removed fetch HEAD check to avoid CORS errors
        // Image loading errors will be handled by the img onError handler
      } catch (error) {
        perfError('❌ Error loading squares:', error);
        
        // Don't crash the component - ensure loading state is cleared
        if (!isMounted) return;
        
        // Fallback to localStorage with expiration check
        try {
        const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        const now = new Date();
        const activePurchases = {};
        
        Object.keys(localPurchases).forEach(squareNum => {
          const data = localPurchases[squareNum];
          if (data && data.status === 'active') {
            if (data.endDate) {
              const endDate = new Date(data.endDate);
              if (endDate > now) {
                activePurchases[squareNum] = data;
              }
            } else {
              activePurchases[squareNum] = data;
            }
          }
        });
        
          if (isMounted) {
        setPurchasedSquares(activePurchases);
          }
        } catch (localStorageError) {
          perfError('❌ Error reading localStorage:', localStorageError);
          // Set empty state to prevent crash
          if (isMounted) {
            setPurchasedSquares({});
          }
        }
      } finally {
        if (isMounted) {
        setIsLoading(false);
        }
      }
    };

    // Initial load
    loadPurchasedSquares();

    // Set up real-time Firestore listener for automatic updates
    // PERFORMANCE: Still listen to all active purchases but filter client-side
    // This is necessary because Firestore doesn't support range queries on squareNumber easily
    perfLog('👂 Setting up Firestore real-time listener...');
    let unsubscribe;
    
    try {
      // PERFORMANCE: Query all active purchases (filtered client-side by page range)
      // Note: Can't use orderBy with where without composite index
      const q = query(
        collection(db, 'purchasedSquares'), 
        where('status', '==', 'active')
        // Removed orderBy to avoid requiring composite index
      );
      unsubscribe = onSnapshot(q, 
        (snapshot) => {
        if (!isMounted) return; // Don't update if component unmounted
        
        perfLog('🔄 Firestore real-time update received');
        const purchases = {};
        const now = new Date();
        const squareToDocMap = new Map(); // Track squareNumber -> docId to detect duplicates
        const purchaseIdSet = new Set(); // Track purchaseIds to ensure each logo appears only once
        
        // CRITICAL: Use squareNumber as key, not doc.id, and detect duplicates
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.status === 'active') {
            // Check payment status
            if (data.paymentStatus && data.paymentStatus !== 'paid') {
              perfLog(`⏭️ Real-time: Skipping document ${doc.id} - paymentStatus: ${data.paymentStatus}`);
              return;
            }
            
            const purchaseId = data.purchaseId || doc.id; // Use purchaseId if available
            const squareNum = data.squareNumber || parseInt(doc.id);
            
            // CLIENT-SIDE FILTER: Only include squares in current page range
            if (squareNum < start || squareNum > end) {
              return; // Skip squares outside current page
            }
            
            // CRITICAL: Check for duplicate purchaseIds (same logo appearing twice)
            if (purchaseIdSet.has(purchaseId)) {
              perfWarn(`⚠️ Real-time duplicate purchaseId detected: ${purchaseId}, skipping duplicate ${doc.id}`);
              return; // Skip this duplicate logo
            }
            purchaseIdSet.add(purchaseId);
            
            // CRITICAL: Skip documents without valid logos (orphaned ads)
            const logoData = data.logoData;
            let hasValidLogo = false;
            if (logoData && typeof logoData === 'string' && logoData.trim() !== '') {
              // Check if it's a valid URL format
              if (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('data:')) {
                hasValidLogo = true;
              }
            }
            
            // Skip orphaned ads (no valid logo) - treat as available
            if (!hasValidLogo) {
              perfWarn(`⚠️ Real-time: Square ${squareNum}: No valid logo (orphaned ad), skipping - ${data.businessName || 'Unknown'}`);
              return; // Skip this orphaned ad
            }
            
            if (data.endDate) {
              const endDate = new Date(data.endDate);
              if (endDate > now) {
                // CRITICAL: Check for duplicates by squareNumber
                if (squareToDocMap.has(squareNum)) {
                  perfWarn(`⚠️ Real-time duplicate detected: Square ${squareNum}, skipping duplicate ${doc.id}`);
                  return; // Skip this duplicate
                }
                
                squareToDocMap.set(squareNum, doc.id);
                purchases[squareNum] = {
                  ...data,
                  squareNumber: squareNum // Ensure squareNumber is set
                };
              }
            } else {
              // No endDate - only include if payment is confirmed
              if (!data.paymentStatus || data.paymentStatus === 'paid') {
                // Check for duplicates
                if (squareToDocMap.has(squareNum)) {
                  perfWarn(`⚠️ Real-time duplicate detected: Square ${squareNum}, skipping duplicate ${doc.id}`);
                  return;
                }
                
                squareToDocMap.set(squareNum, doc.id);
                purchases[squareNum] = {
                  ...data,
                  squareNumber: squareNum
                };
              }
            }
          }
        });
        
        // CRITICAL FIX: Don't merge localStorage in real-time listener
        // Firestore is the source of truth - if it's empty, don't show anything from localStorage
        // Only clean up localStorage entries that don't exist in Firestore
        const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        const firestoreSquareNumbers = new Set(Object.keys(purchases).map(sq => String(sq)));
        
        // Clean up localStorage entries that don't exist in Firestore
        let cleanedCount = 0;
        Object.keys(localPurchases).forEach(squareNum => {
          if (!firestoreSquareNumbers.has(squareNum)) {
            delete localPurchases[squareNum];
            localStorage.removeItem(`logoPath_${squareNum}`);
            cleanedCount++;
          }
        });
        
        if (cleanedCount > 0) {
          localStorage.setItem('squarePurchases', JSON.stringify(localPurchases));
          perfLog(`🗑️ Real-time cleanup: Removed ${cleanedCount} stale entries from localStorage`);
        }
        
        perfLog(`✅ Real-time update: Loaded ${Object.keys(purchases).length} active squares`);
        
        // Debug: Log squares with logos in real-time update
        const squaresWithLogos = Object.keys(purchases).filter(sq => purchases[sq].logoData);
        perfLog(`📊 Real-time: Squares with logos: ${squaresWithLogos.length} out of ${Object.keys(purchases).length}`);
        
        // PERFORMANCE: Clear old cache first, then cache new purchases (desktop only)
        // MOBILE FIX: Skip caching entirely on mobile to prevent stale data
        if (!isMobileDevice()) {
          import('../utils/cache').then(({ clearAllCache, cachePurchases }) => {
            clearAllCache().then(() => {
              cachePurchases(purchases).catch(err => {
                perfWarn('Cache update failed:', err);
              });
            }).catch(err => {
              perfWarn('Cache clear failed (non-blocking):', err);
              // Still try to cache even if clear fails
              cachePurchases(purchases).catch(cacheErr => {
                perfWarn('Cache update failed:', cacheErr);
              });
            });
          }).catch(err => {
            perfWarn('Cache import failed (non-blocking):', err);
          });
        } else {
          perfLog(`📱 Mobile: Skipping cache operations in real-time update to prevent stale data`);
        }
        
        // CRITICAL: Update purchases, then check for cached images
        // Don't reset loadedImages - let browser cache work
        if (isMounted) {
        setPurchasedSquares(purchases);
          
          // After state update, check for images that loaded from cache
          setTimeout(() => {
            if (!isMounted) return; // Check again before DOM manipulation
            imageRefsRef.current.forEach((imgEl, pos) => {
              if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && purchases[pos]) {
                setLoadedImages(prev => {
                  if (!prev.has(pos)) {
                    perfLog(`✅ Square ${pos}: Image loaded from cache (real-time)`);
                    return new Set([...prev, pos]);
                  }
                  return prev;
                });
                imgEl.style.opacity = '1';
                imgEl.style.display = 'block';
              }
            });
          }, 50);
        }
        
        // Debug: Trigger a purchase completed event to force reload
        window.dispatchEvent(new Event('purchaseCompleted'));
      },
        (error) => {
          perfError('❌ Firestore listener error:', error);
          // Fallback to manual reload on error (only if mounted)
          if (isMounted) {
          loadPurchasedSquares();
          }
        }
      );
    } catch (listenerError) {
      perfError('❌ Error setting up Firestore listener:', listenerError);
      // Continue without real-time listener
      unsubscribe = () => {}; // No-op function
    }

    // PERFORMANCE: Debounce storage change handler to prevent excessive reloads
    const handleStorageChange = debounce(() => {
      perfLog('🔄 localStorage changed, reloading...');
      loadPurchasedSquares();
    }, 500); // 500ms debounce

    // PERFORMANCE: Debounce purchase completion handler
    // CRITICAL FIX: Force fresh data after purchase (skip cache)
    const handlePurchaseCompleted = debounce(() => {
      perfLog('🔄 Purchase completed event, reloading with fresh data...');
      loadPurchasedSquares(true); // Pass true to force fresh Firestore query
    }, 500); // 500ms debounce

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    
    // PERFORMANCE: Check for expired ads every 5 minutes (reduced frequency)
    // Cleanup is expensive, so we do it less frequently
    const expirationCheckInterval = setInterval(async () => {
      // Clean up expired ads
      try {
        await cleanupExpiredAds();
        // Clear expired cache entries
        await clearExpiredCache();
      } catch (error) {
        perfError('❌ Error during cleanup:', error);
      }
      // Reload squares after cleanup (debounced)
      const debouncedReload = debounce(() => loadPurchasedSquares(), 1000);
      debouncedReload();
    }, 5 * 60 * 1000); // Check every 5 minutes (was 1 minute)

    // Cleanup expired cache periodically
    const cacheCleanupInterval = setInterval(async () => {
      await clearExpiredCache();
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      isMounted = false;
      unsubscribe(); // Unsubscribe from Firestore listener
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
      clearInterval(expirationCheckInterval);
      clearInterval(cacheCleanupInterval);
      // Cleanup image observer
      if (imageObserverRef.current) {
        imageObserverRef.current.disconnect();
      }
    };
  }, [start, end, pageNumber]);

  const isAvailable = useCallback((position) => {
    return !purchasedSquares[position];
  }, [purchasedSquares]);

  const getBusinessInfo = useCallback((position) => {
    const purchase = purchasedSquares[position];
    if (purchase) {
      // CRITICAL SECURITY: Only show logo if payment is confirmed
      // Double-check payment status even though we filter earlier
      const hasConfirmedPayment = purchase.paymentStatus === 'paid' && purchase.status === 'active';
      if (!hasConfirmedPayment) {
        return null; // Don't show logo if payment not confirmed
      }
      
      // CRITICAL FIX: Check multiple possible fields for logo URL
      // BUT: Only use logoData from purchase object (from Firestore/localStorage squarePurchases)
      // NEVER read from logoData_${squareNumber} - that's temporary storage only
      let logoUrl = purchase.logoData || 
                    purchase.logoURL || 
                    purchase.logo || 
                    null;
      
      // Debug: Log if logo is missing
      if (!logoUrl && purchase.businessName) {
        perfWarn(`⚠️ Square ${position} (${purchase.businessName}): No logo URL found`, {
          hasLogoData: !!purchase.logoData,
          hasLogoURL: !!purchase.logoURL,
          hasLogo: !!purchase.logo,
          hasStoragePath: !!purchase.storagePath,
          purchaseKeys: Object.keys(purchase)
        });
      }
      
      // If logoUrl is still null, try to get from Firebase Storage path
      if (!logoUrl && purchase.storagePath) {
        const storagePath = purchase.storagePath;
        if (storagePath.includes('firebasestorage')) {
          logoUrl = storagePath;
        } else if (storagePath.startsWith('logos/')) {
          logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
        }
      }
      
      if (logoUrl && typeof logoUrl === 'string') {
        logoUrl = logoUrl.trim();
        if (!(logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:'))) {
          perfWarn(`⚠️ Square ${position}: Invalid logo URL format: ${logoUrl.substring(0, 50)}`);
          logoUrl = null;
        }
      } else {
        logoUrl = null;
      }
      
      return {
        logo: logoUrl,
        dealLink: purchase.dealLink || purchase.website || null,
        contactEmail: purchase.contactEmail,
        businessName: purchase.businessName
      };
    }
    return null;
  }, [purchasedSquares]);

  const handlePositionClick = useCallback((position) => {
    if (isAvailable(position)) {
      navigate('/campaign', { 
        state: { selectedSquare: position, pageNumber } 
      });
    } else {
      const businessInfo = getBusinessInfo(position);
      if (businessInfo?.dealLink) {
        // Track the click before opening
        trackClick(
          position,
          businessInfo.businessName || 'Unknown Business',
          businessInfo.dealLink,
          pageNumber
        );
        window.open(businessInfo.dealLink, '_blank', 'noopener,noreferrer');
      } else {
        setSelectedOccupiedSquare(position);
      }
    }
  }, [isAvailable, getBusinessInfo, navigate, pageNumber]);

  const closeModal = useCallback(() => {
    setSelectedOccupiedSquare(null);
  }, []);

  // Memoize expensive calculations - MUST be before early returns (React Rules of Hooks)
  const availableCount = useMemo(() => 
    squares.filter(position => isAvailable(position)).length,
    [squares, purchasedSquares, isAvailable]
  );
  const occupiedCount = useMemo(() => 
    squares.length - availableCount,
    [squares.length, availableCount]
  );

  if (isLoading) {
    return (
      <div className="ad-grid-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading advertising spots...
        </div>
      </div>
    );
  }

  return (
    <div className="ad-grid-container">
      {/* Header Section - FIXED LAYOUT */}
      <div className="grid-header">
        <div className="page-info">
          <div className="page-stats">
            <div className="available-stat">✅ {availableCount} Available square</div>
            <div className="occupied-stat">🔴 {occupiedCount} Occupied Square</div>
            <div className="shuffle-timer-display">
              <span className="timer-value">
                ⏱️ {Math.floor(timeUntilShuffle / 3600)}:{(Math.floor((timeUntilShuffle % 3600) / 60)).toString().padStart(2, '0')}:{(timeUntilShuffle % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button 
              className="manual-shuffle-btn"
              onClick={handleManualShuffle}
              title="Shuffle all squares now"
            >
              🔄 Shuffle Now
            </button>
          </div>
          <div className="page-navigation">
            <Link 
              to={pageNumber > 1 ? `/page${pageNumber - 1}` : '/page10'}
              className="page-arrow page-arrow-left"
              aria-label="Previous page"
            >
              ←
            </Link>
            <span className="page-indicator">Page {pageNumber || 1} of 10</span>
            <Link 
              to={pageNumber < 10 ? `/page${pageNumber + 1}` : '/'}
              className="page-arrow page-arrow-right"
              aria-label="Next page"
            >
              →
            </Link>
          </div>
        </div>
      </div>


      {/* Grid Container - CENTERED */}
      <div className="grid-container">
        <div className={`positions-grid ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
          {squares.map((position) => {
            const businessInfo = getBusinessInfo(position);
            const available = isAvailable(position);
            // Check if this square should be highlighted (from search)
            const shouldHighlight = location.state?.highlightSquare === position;
            
            return (
              <div
                key={position}
                data-square={position}
                className={`ad-position ${available ? 'available' : 'occupied'} ${shouldHighlight ? 'highlighted-square' : ''}`}
                onClick={() => handlePositionClick(position)}
              >
                <div className="position-content">
                  {available ? (
                    <div className="available-spot">
                      <div className="spot-text">Ad Spot</div>
                      <div className="spot-price">£1/day</div>
                    </div>
                  ) : (
                    <div className="occupied-spot">
                      {businessInfo?.logo && typeof businessInfo.logo === 'string' && businessInfo.logo.trim() !== '' ? (
                        <>
                          {failedImages.has(position) ? (
                            <div className="no-logo-placeholder">
                              <span>Active Ad</span>
                            </div>
                          ) : (
                            <>
                              {!loadedImages.has(position) && !failedImages.has(position) && (
                                <div className="logo-loading-placeholder">
                                  <div className="logo-spinner"></div>
                                </div>
                              )}
                              <img 
                                ref={(el) => {
                                  if (el && businessInfo.logo) {
                                    // Store ref for cleanup
                                    imageRefsRef.current.set(position, el);
                                    el.dataset.square = position;
                                    
                                    // CRITICAL FIX: Check if image is already loaded (from cache)
                                    // This handles the case where browser cache loads image before onLoad fires
                                    if (el.complete && el.naturalWidth > 0) {
                                      // Image is already loaded (cached) - show immediately without flickering
                                      setLoadedImages(prev => {
                                        if (!prev.has(position)) {
                                          perfLog(`✅ Square ${position}: Image loaded from cache (ref)`);
                                          return new Set([...prev, position]);
                                        }
                                        return prev;
                                      });
                                      // Use requestAnimationFrame to prevent flickering
                                      requestAnimationFrame(() => {
                                        el.style.opacity = '1';
                                        el.style.display = 'block';
                                        el.style.visibility = 'visible';
                                      });
                                    } else if (!loadedImages.has(position) && !failedImages.has(position)) {
                                      // Image not loaded yet, observe for lazy loading
                                      if (imageObserverRef.current) {
                                        imageObserverRef.current.observe(el);
                                      }
                                    }
                                  }
                                }}
                                key={`logo-${position}-${purchasedSquares[position]?.logoData || businessInfo.logo || position}`}
                                src={businessInfo.logo} 
                                className={`business-logo ${loadedImages.has(position) ? 'loaded' : ''}`}
                                alt={`${businessInfo.businessName || 'Business'} logo`}
                                loading="lazy"
                                decoding="async"
                                style={{
                                  display: failedImages.has(position) ? 'none' : 'block', 
                                  opacity: loadedImages.has(position) ? 1 : 1, // Always show once loaded, no transition flicker
                                  visibility: loadedImages.has(position) ? 'visible' : 'hidden' // Use visibility instead of opacity for stability
                                }}
                                onLoad={(e) => {
                                  const imgElement = e.target;
                                  const squarePos = parseInt(imgElement.dataset.square || position);
                                  
                                  perfLog(`✅ Square ${squarePos}: Image loaded successfully`);
                                  
                                  // CRITICAL: Update state FIRST, then DOM (prevents flickering)
                                  setLoadedImages(prev => {
                                    const newSet = new Set(prev);
                                    newSet.add(squarePos);
                                    return newSet;
                                  });
                                  
                                  // Remove from failed images if it was there
                                  setFailedImages(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(squarePos);
                                    return newSet;
                                  });
                                  
                                  // Update DOM after state (prevents race condition flickering)
                                  requestAnimationFrame(() => {
                                    imgElement.style.display = 'block';
                                    imgElement.style.opacity = '1';
                                    imgElement.style.visibility = 'visible';
                                  });
                                  
                                  // Unobserve after load
                                  if (imageObserverRef.current) {
                                    imageObserverRef.current.unobserve(imgElement);
                                  }
                                }}
                                onError={(e) => {
                                  const imgElement = e.target;
                                  const logoUrl = businessInfo.logo;
                                  
                                  perfError(`❌ Image failed to load for square ${position}`, {
                                    logoUrl: logoUrl ? logoUrl.substring(0, 100) : 'MISSING',
                                    purchase: purchasedSquares[position] ? {
                                      hasLogoData: !!purchasedSquares[position].logoData,
                                      hasLogoURL: !!purchasedSquares[position].logoURL,
                                      hasLogo: !!purchasedSquares[position].logo,
                                      storagePath: purchasedSquares[position].storagePath
                                    } : 'NO_PURCHASE'
                                  });
                                  
                                  // Mark as failed immediately to prevent flickering
                                  setFailedImages(prev => new Set([...prev, position]));
                                  setLoadedImages(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(position);
                                    return newSet;
                                  });
                                  
                                  // Hide the image
                                  imgElement.style.display = 'none';
                                  
                                  // Unobserve on error
                                  if (imageObserverRef.current && imgElement.dataset.src) {
                                    imageObserverRef.current.unobserve(imgElement);
                                  }
                                  
                                  // Debug: Log the actual logo URL being used
                                  console.error('Failed logo URL:', logoUrl);
                                  console.error('Purchase data:', purchasedSquares[position]);
                                }}
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <div className="no-logo-placeholder">
                          <span>Active Ad</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Occupied Square Modal */}
      {selectedOccupiedSquare && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Advertisement Spot</h3>
            <div className="business-details">
              <p>This advertising spot is currently occupied.</p>
              {getBusinessInfo(selectedOccupiedSquare)?.contactEmail && (
                <p><strong>Contact:</strong> {getBusinessInfo(selectedOccupiedSquare).contactEmail}</p>
              )}
              {getBusinessInfo(selectedOccupiedSquare)?.businessName && (
                <p><strong>Business:</strong> {getBusinessInfo(selectedOccupiedSquare).businessName}</p>
              )}
            </div>
            <button onClick={closeModal} className="btn-secondary">Close</button>
          </div>
        </div>
      )}

      {/* Grid Info Footer */}
      <div className="grid-info">
        <p>
          <strong>Page {pageNumber}</strong> • Spots {start} - {end} • 
          {availableCount > 0 ? ` ${availableCount} available` : ' Fully booked'}
        </p>
      </div>
    </div>
  );
};

export default AdGrid;