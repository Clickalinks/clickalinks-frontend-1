# Testing Guide: Verifying All 10 Pages Work Correctly

## 🎯 Quick Verification Checklist

### ✅ Step 1: Verify Page Routes Exist
Navigate to each page URL and confirm they load:

- [ ] `http://localhost:3000/` (Page 1 - Home)
- [ ] `http://localhost:3000/page1` (Page 1)
- [ ] `http://localhost:3000/page2` (Page 2)
- [ ] `http://localhost:3000/page3` (Page 3)
- [ ] `http://localhost:3000/page4` (Page 4)
- [ ] `http://localhost:3000/page5` (Page 5)
- [ ] `http://localhost:3000/page6` (Page 6)
- [ ] `http://localhost:3000/page7` (Page 7)
- [ ] `http://localhost:3000/page8` (Page 8)
- [ ] `http://localhost:3000/page9` (Page 9)
- [ ] `http://localhost:3000/page10` (Page 10)

**Expected:** All pages should load without errors.

---

### ✅ Step 2: Verify Square Numbering

Each page should show 200 squares with correct numbering:

| Page | Square Range | First Square | Last Square |
|------|--------------|--------------|-------------|
| Page 1 | 1-200 | #1 | #200 |
| Page 2 | 201-400 | #201 | #400 |
| Page 3 | 401-600 | #401 | #600 |
| Page 4 | 601-800 | #601 | #800 |
| Page 5 | 801-1000 | #801 | #1000 |
| Page 6 | 1001-1200 | #1001 | #1200 |
| Page 7 | 1201-1400 | #1201 | #1400 |
| Page 8 | 1401-1600 | #1401 | #1600 |
| Page 9 | 1601-1800 | #1601 | #1800 |
| Page 10 | 1801-2000 | #1801 | #2000 |

**How to Check:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command to check square numbers:
```javascript
// Check first and last square on current page
const squares = document.querySelectorAll('.ad-position');
console.log('Total squares:', squares.length);
console.log('First square number:', squares[0]?.textContent);
console.log('Last square number:', squares[squares.length - 1]?.textContent);
```

**Expected:** Each page shows exactly 200 squares with correct numbering.

---

### ✅ Step 3: Verify Grid Display

On each page, check:

- [ ] Grid displays correctly (not broken layout)
- [ ] All 200 squares are visible
- [ ] Squares show "Ad Spot £1/day" when available
- [ ] Squares show business logos when occupied
- [ ] Page header shows correct page number
- [ ] Page info shows correct square range (e.g., "Spots 1 - 200")

---

### ✅ Step 4: Test Square Selection Flow

Test on different pages:

1. **Page 1 (Squares 1-200):**
   - [ ] Click square #1 → Should navigate to `/campaign`
   - [ ] Click square #100 → Should navigate to `/campaign`
   - [ ] Click square #200 → Should navigate to `/campaign`

2. **Page 5 (Squares 801-1000):**
   - [ ] Click square #801 → Should navigate to `/campaign`
   - [ ] Click square #900 → Should navigate to `/campaign`
   - [ ] Click square #1000 → Should navigate to `/campaign`

3. **Page 10 (Squares 1801-2000):**
   - [ ] Click square #1801 → Should navigate to `/campaign`
   - [ ] Click square #1900 → Should navigate to `/campaign`
   - [ ] Click square #2000 → Should navigate to `/campaign`

**Expected:** Clicking any available square navigates to campaign selection with correct square number.

---

### ✅ Step 5: Verify Purchase Flow Across Pages

Test complete purchase on different pages:

**Test Purchase on Page 1:**
1. [ ] Select square #50
2. [ ] Choose 10-day campaign
3. [ ] Enter business details
4. [ ] Complete payment
5. [ ] Verify ad appears on square #50 on Page 1

**Test Purchase on Page 5:**
1. [ ] Select square #900
2. [ ] Choose 30-day campaign
3. [ ] Enter business details
4. [ ] Complete payment
5. [ ] Verify ad appears on square #900 on Page 5

**Test Purchase on Page 10:**
1. [ ] Select square #1950
2. [ ] Choose 60-day campaign
3. [ ] Enter business details
4. [ ] Complete payment
5. [ ] Verify ad appears on square #1950 on Page 10

**Expected:** Ads appear on correct squares on correct pages after payment.

---

### ✅ Step 6: Verify Navigation Between Pages

Test page navigation:

- [ ] Navigate from Page 1 → Page 2 → Page 3 → ... → Page 10
- [ ] Navigate backwards: Page 10 → Page 9 → ... → Page 1
- [ ] Use browser back/forward buttons
- [ ] Click "Home" link (should go to Page 1)
- [ ] Direct URL navigation (type `/page5` in address bar)

**Expected:** All navigation works smoothly, no errors.

---

### ✅ Step 7: Verify Page-Specific Data

Check that ads appear on correct pages:

1. **Create test ad on square #50 (Page 1):**
   - [ ] Ad should appear on Page 1
   - [ ] Ad should NOT appear on other pages

2. **Create test ad on square #900 (Page 5):**
   - [ ] Ad should appear on Page 5
   - [ ] Ad should NOT appear on other pages

3. **Create test ad on square #1950 (Page 10):**
   - [ ] Ad should appear on Page 10
   - [ ] Ad should NOT appear on other pages

**Expected:** Ads only appear on the page where their square number belongs.

---

## 🔍 Automated Testing Script

You can run this in the browser console to automatically check all pages:

```javascript
// Test all 10 pages
async function testAllPages() {
  const results = [];
  
  for (let page = 1; page <= 10; page++) {
    const url = page === 1 ? '/' : `/page${page}`;
    const expectedStart = (page - 1) * 200 + 1;
    const expectedEnd = page * 200;
    
    console.log(`\n📄 Testing Page ${page}...`);
    console.log(`   URL: ${url}`);
    console.log(`   Expected squares: ${expectedStart}-${expectedEnd}`);
    
    // Navigate to page
    window.location.href = url;
    
    // Wait for page to load (you'll need to run this on each page)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check squares
    const squares = document.querySelectorAll('.ad-position');
    const squareCount = squares.length;
    
    results.push({
      page,
      url,
      expectedStart,
      expectedEnd,
      actualCount: squareCount,
      passed: squareCount === 200
    });
  }
  
  console.table(results);
  return results;
}

// Run test (note: this will navigate through all pages)
// testAllPages();
```

---

## 🐛 Common Issues to Watch For

### Issue 1: Wrong Square Numbers
**Symptom:** Squares show wrong numbers (e.g., Page 2 shows 1-200 instead of 201-400)
**Fix:** Check `App.js` - `start` and `end` calculation should be:
```javascript
const start = (pageNumber - 1) * 200 + 1;
const end = pageNumber * 200;
```

### Issue 2: Missing Squares
**Symptom:** Page shows less than 200 squares
**Fix:** Check `AdGrid.js` - should create array:
```javascript
const squares = Array.from({ length: end - start + 1 }, (_, index) => start + index);
```

### Issue 3: Ads on Wrong Page
**Symptom:** Ad on square #50 appears on Page 2 instead of Page 1
**Fix:** Check that `pageNumber` is correctly passed and stored in purchase data.

### Issue 4: Navigation Errors
**Symptom:** 404 errors when navigating to pages
**Fix:** Check `App.js` routes - should have routes for `/page1` through `/page10`.

---

## ✅ Quick Visual Check

**Fastest way to verify:**

1. Open your site
2. Navigate to each page manually
3. Count squares visually (should be 200 per page)
4. Check first and last square number matches expected range
5. Try clicking a square to ensure purchase flow works

**Time needed:** ~5-10 minutes for all 10 pages

---

## 📊 Expected Results Summary

| Check | Expected Result |
|-------|----------------|
| Total Pages | 10 pages |
| Squares per Page | 200 squares |
| Total Squares | 2000 squares |
| Page 1 Range | 1-200 |
| Page 10 Range | 1801-2000 |
| Navigation | All pages accessible |
| Purchase Flow | Works on all pages |
| Ad Display | Ads appear on correct pages |

---

## 🎯 Success Criteria

All 10 pages are working correctly if:

✅ All 10 page URLs load without errors  
✅ Each page displays exactly 200 squares  
✅ Square numbering is correct (1-200, 201-400, etc.)  
✅ Clicking squares navigates to purchase flow  
✅ Purchase flow works on all pages  
✅ Ads appear on correct squares on correct pages  
✅ Navigation between pages works smoothly  

If all these pass, your 10-page system is working correctly! 🎉

