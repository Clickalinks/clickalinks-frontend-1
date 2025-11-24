import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot, query, where, doc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { cleanupExpiredAds } from '../utils/cleanupExpiredAds';
import { syncLocalStorageToFirestore } from '../utils/savePurchaseToFirestore';
import SearchBar from './SearchBar';
import './AdGrid.css';

const AdGrid = ({ start = 1, end = 200, pageNumber, isHome = false }) => {
  const navigate = useNavigate();
  const location = useLocation(); // For search highlighting
  const [selectedOccupiedSquare, setSelectedOccupiedSquare] = useState(null);
  const [purchasedSquares, setPurchasedSquares] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const squares = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

        // Load purchased squares
        useEffect(() => {
          const loadPurchasedSquares = async () => {
            try {
              // First, sync any localStorage purchases to Firestore
              console.log('🔄 Syncing localStorage to Firestore...');
              await syncLocalStorageToFirestore();
              
              console.log('🔄 Loading purchased squares from Firestore...');
              const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
        
        console.log(`📊 Total documents in Firestore: ${querySnapshot.size}`);
        
        const purchases = {};
        const now = new Date();
        
        // Debug: Log ALL documents first to see what we have
        const allDocs = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          allDocs.push({
            id: doc.id,
            status: data.status,
            hasLogoData: !!data.logoData,
            endDate: data.endDate,
            squareNumber: data.squareNumber,
            businessName: data.businessName
          });
        });
        
        console.log('📋 ALL DOCUMENTS IN FIRESTORE:', allDocs);
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const squareId = doc.id; // Document ID (should be square number as string)
          
          // Debug: Log all documents with full details
          console.log(`📄 Processing Document ID: ${squareId}`, {
            status: data.status,
            hasLogoData: !!data.logoData,
            endDate: data.endDate,
            squareNumber: data.squareNumber,
            businessName: data.businessName,
            fullData: data
          });
          
          // 🔥 CRITICAL FIX: Check both status AND expiration date
          if (!data) {
            console.warn(`⚠️ Document ${squareId} has no data`);
            return;
          }
          
          // Debug: Check status
          if (!data.status) {
            console.warn(`⚠️ Document ${squareId} has no status field`);
            return;
          }
          
          if (data.status !== 'active') {
            console.log(`⏭️ Document ${squareId} skipped - status: "${data.status}" (expected "active")`);
            return;
          }
          
          // Now we know status is 'active', check expiration
          if (data && data.status === 'active') {
            // Check if ad has expired
            if (data.endDate) {
              const endDate = new Date(data.endDate);
              if (endDate > now) {
                // Ad is still active and not expired
                purchases[squareId] = {
                  ...data,
                  squareNumber: data.squareNumber || parseInt(squareId) // Ensure squareNumber is set
                };
                // Debug log for logo
                if (data.logoData) {
                  console.log(`✅ Square ${squareId} loaded with logo:`, {
                    logoURL: data.logoData.substring(0, 60) + '...',
                    logoType: data.logoData.startsWith('http') ? 'URL' : 'Data URL',
                    storageType: data.storageType || 'unknown'
                  });
                } else {
                  console.warn(`⚠️ Square ${squareId} has no logoData in Firestore document`);
                }
              } else {
                // Ad has expired - schedule cleanup
                console.log(`⏰ Ad expired for square ${squareId}, endDate: ${data.endDate}`);
                // Cleanup will be handled by cleanup function
              }
            } else {
              // No endDate set (legacy data) - include it but log warning
              console.warn(`⚠️ Square ${squareId} has no endDate`);
              purchases[squareId] = {
                ...data,
                squareNumber: data.squareNumber || parseInt(squareId)
              };
            }
          }
        });

        // Also check localStorage and filter expired ads
        const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        Object.keys(localPurchases).forEach(squareNum => {
          const localData = localPurchases[squareNum];
          if (localData && localData.status === 'active') {
            if (localData.endDate) {
              const endDate = new Date(localData.endDate);
              if (endDate > now) {
                // Merge with Firestore data (Firestore takes priority)
                if (!purchases[squareNum]) {
                  purchases[squareNum] = localData;
                }
              } else {
                // Remove expired ad from localStorage
                delete localPurchases[squareNum];
                localStorage.setItem('squarePurchases', JSON.stringify(localPurchases));
                console.log(`🗑️ Removed expired ad from localStorage: square ${squareNum}`);
              }
            } else {
              // No endDate - include it
              if (!purchases[squareNum]) {
                purchases[squareNum] = localData;
              }
            }
          }
        });

        console.log('✅ Loaded from Firestore:', Object.keys(purchases).length, 'active (non-expired) purchased squares');
        
        // Debug: Log all loaded squares with their logo status
        if (Object.keys(purchases).length === 0) {
          console.warn('⚠️ NO SQUARES LOADED! Check Firestore:');
          console.warn('  - Are documents saved with status: "active"?');
          console.warn('  - Do document IDs match square numbers?');
          console.warn('  - Are endDate fields set correctly?');
        } else {
          Object.keys(purchases).forEach(squareNum => {
            const purchase = purchases[squareNum];
            console.log(`✅ Square ${squareNum}:`, {
              businessName: purchase.businessName,
              hasLogo: !!purchase.logoData,
              logoType: purchase.logoData ? (purchase.logoData.startsWith('http') ? 'URL' : 'Data URL') : 'NONE',
              logoPreview: purchase.logoData ? purchase.logoData.substring(0, 60) : 'N/A',
              status: purchase.status,
              endDate: purchase.endDate
            });
          });
        }
        
        setPurchasedSquares(purchases);
      } catch (error) {
        console.error('❌ Error loading squares:', error);
        // Fallback to localStorage with expiration check
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
        
        setPurchasedSquares(activePurchases);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadPurchasedSquares();

    // Set up real-time Firestore listener for automatic updates
    console.log('👂 Setting up Firestore real-time listener...');
    let unsubscribe;
    
    try {
      const q = query(collection(db, 'purchasedSquares'), where('status', '==', 'active'));
      unsubscribe = onSnapshot(q, 
        (snapshot) => {
        console.log('🔄 Firestore real-time update received, squares changed');
        const purchases = {};
        const now = new Date();
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.status === 'active') {
            if (data.endDate) {
              const endDate = new Date(data.endDate);
              if (endDate > now) {
                purchases[doc.id] = data;
                if (data.logoData) {
                  console.log(`✅ Real-time: Square ${doc.id} loaded with logo`);
                }
              }
            } else {
              purchases[doc.id] = data;
            }
          }
        });
        
        // Merge with localStorage (Firestore takes priority)
        const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        Object.keys(localPurchases).forEach(squareNum => {
          const localData = localPurchases[squareNum];
          if (localData && localData.status === 'active') {
            if (localData.endDate) {
              const endDate = new Date(localData.endDate);
              if (endDate > now && !purchases[squareNum]) {
                purchases[squareNum] = localData;
              }
            } else if (!purchases[squareNum]) {
              purchases[squareNum] = localData;
            }
          }
        });
        
        console.log('✅ Real-time update: Loaded', Object.keys(purchases).length, 'active squares');
        setPurchasedSquares(purchases);
      },
        (error) => {
          console.error('❌ Firestore listener error:', error);
          // Fallback to manual reload on error
          loadPurchasedSquares();
        }
      );
    } catch (listenerError) {
      console.error('❌ Error setting up Firestore listener:', listenerError);
      // Continue without real-time listener
      unsubscribe = () => {}; // No-op function
    }

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = () => {
      console.log('🔄 localStorage changed, reloading...');
      loadPurchasedSquares();
    };

    // Listen for purchase completion events
    const handlePurchaseCompleted = () => {
      console.log('🔄 Purchase completed event, reloading...');
      loadPurchasedSquares();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    
    // Check for expired ads every minute and clean them up
    const expirationCheckInterval = setInterval(async () => {
      // Clean up expired ads
      try {
        await cleanupExpiredAds();
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
      // Reload squares after cleanup
      loadPurchasedSquares();
    }, 60000); // Check every minute

    return () => {
      unsubscribe(); // Unsubscribe from Firestore listener
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
      clearInterval(expirationCheckInterval);
    };
  }, []);

  // Format time function

  // Auto-shuffle functions - Fixed to prevent duplicates
  const triggerAutoShuffle = useCallback(async () => {
    // Prevent multiple simultaneous shuffles
    if (isShuffling) {
      console.warn('⚠️ Shuffle already in progress, skipping...');
      return;
    }
    
    setIsShuffling(true);
    console.log('🔄 Auto-shuffle triggered! Shuffling occupied squares...');
    const startTime = performance.now();
    
    try {
      // CRITICAL: Read from Firestore FIRST to get actual documents (not state which may have duplicates)
      console.log('📖 Reading from Firestore to get actual purchases...');
      const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
      const activePurchases = [];
      const now = new Date();
      const squareToDocMap = new Map(); // Map of squareNumber -> {docId, data} to detect duplicates
      const duplicatesToDelete = []; // Documents to delete (duplicates)
      
      // Get all active purchases from Firestore and detect duplicates
      querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data && data.status === 'active') {
          if (data.endDate) {
            const endDate = new Date(data.endDate);
            if (endDate > now) {
              const squareNum = data.squareNumber || parseInt(docSnapshot.id);
              
              // Check for duplicates - if square number already exists, mark this as duplicate
              if (squareToDocMap.has(squareNum)) {
                console.warn(`⚠️ Duplicate detected: Square ${squareNum} has multiple documents. Keeping first, deleting: ${docSnapshot.id}`);
                duplicatesToDelete.push(docSnapshot.id);
              } else {
                squareToDocMap.set(squareNum, { docId: docSnapshot.id, data });
                activePurchases.push({
                  docId: docSnapshot.id, // Store the actual Firestore document ID
                  squareNumber: squareNum,
                  pageNumber: data.pageNumber || Math.ceil(squareNum / 200),
                  ...data
                });
              }
            }
          } else {
            const squareNum = data.squareNumber || parseInt(docSnapshot.id);
            
            // Check for duplicates
            if (squareToDocMap.has(squareNum)) {
              console.warn(`⚠️ Duplicate detected: Square ${squareNum} has multiple documents. Keeping first, deleting: ${docSnapshot.id}`);
              duplicatesToDelete.push(docSnapshot.id);
            } else {
              squareToDocMap.set(squareNum, { docId: docSnapshot.id, data });
              activePurchases.push({
                docId: docSnapshot.id,
                squareNumber: squareNum,
                pageNumber: data.pageNumber || Math.ceil(squareNum / 200),
                ...data
              });
            }
          }
        }
      });
      
      // Delete duplicates first
      if (duplicatesToDelete.length > 0) {
        console.log(`🗑️ Deleting ${duplicatesToDelete.length} duplicate documents...`);
        const deleteBatch = writeBatch(db);
        duplicatesToDelete.forEach(docId => {
          const docRef = doc(db, 'purchasedSquares', docId);
          deleteBatch.delete(docRef);
        });
        await deleteBatch.commit();
        console.log(`✅ Deleted ${duplicatesToDelete.length} duplicates`);
      }
      
      if (activePurchases.length === 0) {
        console.log('ℹ️ No active purchases to shuffle');
        return;
      }
      
      console.log(`📊 Found ${activePurchases.length} unique active purchases to shuffle`);
      
      // GLOBAL SHUFFLE: Shuffle ALL squares across ALL 10 pages (1-2000)
      // Don't group by page - shuffle everything together
      
      if (activePurchases.length <= 1) {
        console.log('ℹ️ Only 1 or 0 purchases, no shuffle needed');
        const newPurchasesState = {};
        activePurchases.forEach(p => {
          newPurchasesState[p.squareNumber] = {
            ...p,
            squareNumber: p.squareNumber,
            pageNumber: p.pageNumber
          };
        });
        setPurchasedSquares(newPurchasesState);
        return;
      }
      
      // Prepare batch operations and new state
      const batchOperations = [];
      const newPurchasesState = {};
      const MAX_BATCH_SIZE = 500; // Firestore batch limit
      
      // Get all available squares across ALL pages (1-2000)
      const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
      
      // Get currently occupied squares
      const occupiedSquares = new Set(activePurchases.map(p => p.squareNumber));
      
      // Get free squares (not currently occupied) across all pages
      const freeSquares = allSquares.filter(sq => !occupiedSquares.has(sq));
      
      // Fisher-Yates shuffle algorithm for ALL purchases
      const shuffledPurchases = [...activePurchases];
      for (let i = shuffledPurchases.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPurchases[i], shuffledPurchases[j]] = [shuffledPurchases[j], shuffledPurchases[i]];
      }
      
        // Assign new square numbers across ALL pages
        // CRITICAL: Track which squares are already occupied to avoid duplicates
        const usedSquares = new Set(activePurchases.map(p => p.squareNumber)); // Start with currently occupied squares
        let freeIndex = 0;
        
        for (let i = 0; i < shuffledPurchases.length; i++) {
          const purchase = shuffledPurchases[i];
          const oldSquareNumber = purchase.squareNumber;
          const oldDocId = purchase.docId; // The actual Firestore document ID
          
          // Calculate which page this square belongs to
          const oldPageNumber = purchase.pageNumber || Math.ceil(oldSquareNumber / 200);
          
          // Assign to free square first, then to any available square across all pages
          let newSquareNumber;
          
          // First, try to use a free square
          while (freeIndex < freeSquares.length) {
            const candidateSquare = freeSquares[freeIndex];
            if (!usedSquares.has(candidateSquare)) {
              newSquareNumber = candidateSquare;
              freeIndex++;
              break;
            }
            freeIndex++;
          }
          
          // If no free square available, pick from any unused square
          if (!newSquareNumber) {
            const availableSquares = allSquares.filter(sq => !usedSquares.has(sq));
            if (availableSquares.length > 0) {
              newSquareNumber = availableSquares[Math.floor(Math.random() * availableSquares.length)];
            } else {
              // Fallback: use old square number (shouldn't happen if logic is correct)
              console.warn(`⚠️ No available squares, keeping square ${oldSquareNumber} in place`);
              newSquareNumber = oldSquareNumber;
            }
          }
          
          // Ensure within valid range (1-2000)
          newSquareNumber = Math.max(1, Math.min(2000, newSquareNumber));
          
          // CRITICAL: Mark this square as used BEFORE adding to state
          usedSquares.add(newSquareNumber);
          
          // Calculate new page number based on new square number
          const newPageNumber = Math.ceil(newSquareNumber / 200);
          
          // Update state immediately for smooth UI
          // CRITICAL: Only add if this square isn't already in state (prevent duplicates)
          if (!newPurchasesState[newSquareNumber]) {
            newPurchasesState[newSquareNumber] = {
              ...purchase,
              squareNumber: newSquareNumber,
              pageNumber: newPageNumber
            };
          } else {
            console.warn(`⚠️ Square ${newSquareNumber} already assigned, skipping duplicate`);
            // Keep the old square number to avoid conflict
            newPurchasesState[oldSquareNumber] = {
              ...purchase,
              squareNumber: oldSquareNumber,
              pageNumber: oldPageNumber
            };
            continue; // Skip adding to batch operations
          }
          
          // Prepare Firestore batch operations
          if (oldSquareNumber !== newSquareNumber) {
            batchOperations.push({
              type: 'move',
              oldDocId: oldDocId, // Use actual document ID
              oldSquare: oldSquareNumber,
              newSquare: newSquareNumber,
              purchase: purchase,
              pageNumber: newPageNumber
            });
          } else {
            // Same square, just update timestamp
            batchOperations.push({
              type: 'update',
              docId: oldDocId, // Use actual document ID
              square: oldSquareNumber,
              purchase: purchase
            });
          }
        }
      
      // Update state IMMEDIATELY for instant UI update (no waiting for Firestore!)
      setPurchasedSquares(newPurchasesState);
      
      // Clear image cache to force reload
      setLoadedImages(new Set());
      setFailedImages(new Set());
      
      // Commit Firestore updates in batches (async, non-blocking)
      if (batchOperations.length > 0) {
        // Process batches asynchronously without blocking UI
        (async () => {
          try {
            // CRITICAL: Get ALL current documents from Firestore FIRST
            const currentDocsSnapshot = await getDocs(collection(db, 'purchasedSquares'));
            const allExistingDocs = new Map(); // Map docId -> {squareNumber, data}
            const squaresInUse = new Set(); // Track which squares are currently occupied
            
            currentDocsSnapshot.forEach(docSnapshot => {
              const data = docSnapshot.data();
              const squareNum = data.squareNumber || parseInt(docSnapshot.id);
              allExistingDocs.set(docSnapshot.id, { squareNumber: squareNum, data });
              squaresInUse.add(squareNum);
            });
            
            console.log(`📊 Found ${allExistingDocs.size} existing documents in Firestore`);
            
            // CRITICAL: Check for conflicts BEFORE processing
            const targetSquares = new Map(); // Map newSquare -> operation
            const operationsToProcess = [];
            
            for (const operation of batchOperations) {
              if (operation.type === 'move') {
                // Check if multiple operations target the same square
                if (targetSquares.has(operation.newSquare)) {
                  console.warn(`⚠️ CONFLICT: Multiple operations target square ${operation.newSquare}, skipping duplicate`);
                  continue;
                }
                targetSquares.set(operation.newSquare, operation);
                operationsToProcess.push(operation);
              } else {
                operationsToProcess.push(operation);
              }
            }
            
            console.log(`📊 Processing ${operationsToProcess.length} operations (${batchOperations.length - operationsToProcess.length} conflicts skipped)`);
            
            // STEP 1: Delete ALL documents that will be moved or replaced
            const docsToDelete = new Set();
            
            for (const operation of operationsToProcess) {
              if (operation.type === 'move') {
                // Mark old document for deletion
                if (allExistingDocs.has(operation.oldDocId)) {
                  docsToDelete.add(operation.oldDocId);
                }
                
                // Mark any existing document at the new square location for deletion
                // Check by squareNumber field
                allExistingDocs.forEach((docInfo, docId) => {
                  if (docInfo.squareNumber === operation.newSquare && docId !== operation.oldDocId) {
                    docsToDelete.add(docId);
                    console.warn(`🗑️ Will delete document ${docId} at square ${operation.newSquare}`);
                  }
                });
                
                // Also check if document ID matches the new square number
                const newDocId = operation.newSquare.toString();
                if (allExistingDocs.has(newDocId) && newDocId !== operation.oldDocId) {
                  docsToDelete.add(newDocId);
                  console.warn(`🗑️ Will delete document ${newDocId} (ID matches square ${operation.newSquare})`);
                }
              }
            }
            
            // Delete all marked documents in batches
            if (docsToDelete.size > 0) {
              console.log(`🗑️ Deleting ${docsToDelete.size} documents...`);
              let deleteBatch = writeBatch(db);
              let deleteCount = 0;
              
              for (const docId of docsToDelete) {
                const docRef = doc(db, 'purchasedSquares', docId);
                deleteBatch.delete(docRef);
                deleteCount++;
                
                if (deleteCount >= MAX_BATCH_SIZE - 10) {
                  await deleteBatch.commit();
                  console.log(`✅ Deleted batch of ${deleteCount} documents`);
                  deleteBatch = writeBatch(db);
                  deleteCount = 0;
                }
              }
              
              if (deleteCount > 0) {
                await deleteBatch.commit();
                console.log(`✅ Deleted final batch of ${deleteCount} documents`);
              }
              
              console.log(`✅ Total deleted: ${docsToDelete.size} documents`);
            }
            
            // STEP 2: Create all new documents
            // CRITICAL: Re-read Firestore after deletions to ensure we have latest state
            const afterDeleteSnapshot = await getDocs(collection(db, 'purchasedSquares'));
            const existingAfterDelete = new Set();
            afterDeleteSnapshot.forEach(docSnapshot => {
              const data = docSnapshot.data();
              const squareNum = data.squareNumber || parseInt(docSnapshot.id);
              existingAfterDelete.add(squareNum);
            });
            
            let createBatch = writeBatch(db);
            let createCount = 0;
            const createdSquares = new Set(); // Track squares we're creating to prevent duplicates
            
            for (const operation of operationsToProcess) {
              if (operation.type === 'move') {
                // Triple-check: Make sure square is not already occupied
                if (createdSquares.has(operation.newSquare)) {
                  console.error(`❌ ERROR: Attempted to create duplicate at square ${operation.newSquare}, skipping!`);
                  continue;
                }
                
                if (existingAfterDelete.has(operation.newSquare)) {
                  console.error(`❌ ERROR: Square ${operation.newSquare} still exists after deletion, skipping!`);
                  continue;
                }
                
                const newDocRef = doc(db, 'purchasedSquares', operation.newSquare.toString());
                
                // Create new document
                createBatch.set(newDocRef, {
                  ...operation.purchase,
                  squareNumber: operation.newSquare,
                  pageNumber: operation.pageNumber,
                  updatedAt: serverTimestamp(),
                  shuffledAt: serverTimestamp()
                });
                createCount++;
                createdSquares.add(operation.newSquare);
                existingAfterDelete.add(operation.newSquare); // Track in our set too
              } else {
                // Same square, just update timestamp
                const docRef = doc(db, 'purchasedSquares', operation.docId);
                createBatch.update(docRef, {
                  updatedAt: serverTimestamp(),
                  shuffledAt: serverTimestamp()
                });
                createCount++;
              }
              
              // Commit batch if approaching limit
              if (createCount >= MAX_BATCH_SIZE - 10) {
                await createBatch.commit();
                console.log(`✅ Created/updated batch of ${createCount} documents`);
                // Re-read after commit
                const midSnapshot = await getDocs(collection(db, 'purchasedSquares'));
                existingAfterDelete.clear();
                midSnapshot.forEach(docSnapshot => {
                  const data = docSnapshot.data();
                  const squareNum = data.squareNumber || parseInt(docSnapshot.id);
                  existingAfterDelete.add(squareNum);
                });
                createBatch = writeBatch(db);
                createCount = 0;
              }
            }
            
            // Commit remaining operations
            if (createCount > 0) {
              await createBatch.commit();
              console.log(`✅ Created/updated final batch of ${createCount} documents`);
            }
            
            console.log(`✅ Firestore shuffle completed - ${operationsToProcess.length} operations processed`);
            console.log(`✅ Created ${createdSquares.size} new documents`);
          } catch (error) {
            console.error('❌ Error updating Firestore:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              stack: error.stack
            });
            // Reload to sync with Firestore
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        })();
      }
      
      const endTime = performance.now();
      console.log(`✅ Auto-shuffle completed in ${(endTime - startTime).toFixed(2)}ms`);
      
    } catch (error) {
      console.error('❌ Error during auto-shuffle:', error);
      // Reload on error as fallback
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setIsShuffling(false);
    }
  }, [isShuffling]);


  const handleManualShuffle = useCallback(async () => {
    await triggerAutoShuffle();
  }, [triggerAutoShuffle]);

  const isAvailable = useCallback((position) => {
    return !purchasedSquares[position];
  }, [purchasedSquares]);

  const getBusinessInfo = useCallback((position) => {
    const purchase = purchasedSquares[position];
    if (purchase) {
      // Debug logging
      if (purchase.logoData) {
        console.log(`🔍 Square ${position} logo:`, {
          hasLogo: !!purchase.logoData,
          logoType: purchase.logoData.startsWith('http') ? 'URL' : 'Data URL',
          logoPreview: purchase.logoData.substring(0, 60) + '...'
        });
      } else {
        console.warn(`⚠️ Square ${position} has no logoData in purchase:`, purchase);
      }
      
      return {
        logo: purchase.logoData || null,
        dealLink: purchase.dealLink,
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
        window.open(businessInfo.dealLink, '_blank', 'noopener,noreferrer');
      } else {
        setSelectedOccupiedSquare(position);
      }
    }
  }, [isAvailable, getBusinessInfo, navigate, pageNumber]);

  const closeModal = useCallback(() => {
    setSelectedOccupiedSquare(null);
  }, []);

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

  const availableCount = squares.filter(position => isAvailable(position)).length;
  const occupiedCount = squares.length - availableCount;

  return (
    <div className="ad-grid-container">
      {/* Header Section - FIXED LAYOUT */}
      <div className="grid-header">
        <div className="shuffle-container">
          <button 
            className="shuffle-btn" 
            onClick={handleManualShuffle}
            aria-label="Shuffle all advertising squares"
          >
            <span className="shuffle-icon" aria-hidden="true">🔄</span>
            <span className="shuffle-text">Shuffle All Squares</span>
          </button>
        </div>

        <div className="page-info">
          <div className="page-stats">
            <div className="available-stat">✅ {availableCount} Available</div>
            <div className="occupied-stat">🔴 {occupiedCount} Occupied</div>
          </div>
          <p className="page-instruction">
            {isHome ? `Page ${pageNumber}: 1 - 200 of 2000 spots` : `Page ${pageNumber}: Spots ${start} - ${end}`}
          </p>
        </div>
      </div>

      {/* Mobile Search Bar - Below Available/Occupied Stats */}
      {isMobile && (
        <div className="mobile-search-container">
          <SearchBar isMobile={true} />
        </div>
      )}

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
                      <div className="spot-number">#{position}</div>
                    </div>
                  ) : (
                    <div className="occupied-spot">
                      {businessInfo?.logo ? (
                        <>
                          {!loadedImages.has(position) && !failedImages.has(position) && (
                            <div className="logo-loading-placeholder">
                              <div className="logo-spinner"></div>
                            </div>
                          )}
                          {failedImages.has(position) ? (
                            <div className="no-logo-placeholder">
                              <span>Active Ad</span>
                              <span className="spot-number-small">#{position}</span>
                            </div>
                          ) : (
                            <img 
                              src={businessInfo.logo} 
                              className={`business-logo ${loadedImages.has(position) ? 'loaded' : ''}`}
                              alt={`${businessInfo.businessName || 'Business'} logo`}
                              loading="lazy"
                              decoding="async"
                              onLoad={() => {
                                setLoadedImages(prev => new Set([...prev, position]));
                              }}
                              onError={() => {
                                setFailedImages(prev => new Set([...prev, position]));
                                setLoadedImages(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(position);
                                  return newSet;
                                });
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <div className="no-logo-placeholder">
                          <span>Active Ad</span>
                          <span className="spot-number-small">#{position}</span>
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
            <h3>Advertisement Spot #{selectedOccupiedSquare}</h3>
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