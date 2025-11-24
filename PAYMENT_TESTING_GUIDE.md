# Payment Flow Testing Guide

## 🎯 Complete Payment Flow Test

When you're ready to test payments, follow this step-by-step guide:

---

## ✅ Pre-Testing Setup

### 1. **Stripe Test Mode**
Make sure you're using Stripe test mode:
- Use test API keys (start with `sk_test_` and `pk_test_`)
- Use Stripe test card numbers (see below)

### 2. **Test Card Numbers** (Stripe Test Mode)
Use these test cards - they won't charge real money:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Success - Visa |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication |

**Test Details:**
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

---

## 🧪 Step-by-Step Payment Test

### Test 1: Complete Purchase Flow (10 Days - £10)

1. **Select Square:**
   - [ ] Go to Page 1 (or any page)
   - [ ] Click on an available square (e.g., Square #50)
   - [ ] Verify it navigates to `/campaign`

2. **Choose Campaign:**
   - [ ] Select "Starter" plan (10 days, £10)
   - [ ] Click "Continue to Details"
   - [ ] Verify it navigates to `/business-details`

3. **Enter Business Details:**
   - [ ] Enter Business Name: "Test Business 1"
   - [ ] Enter Email: "test@example.com"
   - [ ] Enter Website: "https://example.com"
   - [ ] Upload a test logo (any image file)
   - [ ] Verify logo preview appears
   - [ ] Click "Continue to Payment"
   - [ ] Verify it navigates to `/payment`

4. **Complete Payment:**
   - [ ] Review order summary (should show Square #50, 10 days, £10)
   - [ ] Accept terms and conditions
   - [ ] Click "Pay £10 Now"
   - [ ] Verify Stripe checkout opens
   - [ ] Enter test card: `4242 4242 4242 4242`
   - [ ] Enter expiry: `12/25`
   - [ ] Enter CVC: `123`
   - [ ] Click "Pay"
   - [ ] Verify redirect to `/success?session_id=...`

5. **Verify Success:**
   - [ ] Success page shows order details
   - [ ] Navigate back to Page 1
   - [ ] Verify Square #50 now shows your logo
   - [ ] Click on Square #50
   - [ ] Verify it opens your website (https://example.com)

**Expected Result:** ✅ Ad appears immediately after payment

---

### Test 2: Different Duration (30 Days - £30)

1. **Select Square:**
   - [ ] Click Square #100 (or any available square)

2. **Choose Campaign:**
   - [ ] Select "Professional" plan (30 days, £30)
   - [ ] Continue through business details

3. **Complete Payment:**
   - [ ] Pay £30 with test card
   - [ ] Verify success

4. **Verify:**
   - [ ] Ad appears on Square #100
   - [ ] Order shows 30 days duration

**Expected Result:** ✅ Different duration works correctly

---

### Test 3: Different Page (Page 5)

1. **Select Square:**
   - [ ] Go to Page 5 (`/page5`)
   - [ ] Click Square #900 (should be on Page 5)

2. **Complete Purchase:**
   - [ ] Choose any duration
   - [ ] Enter business details
   - [ ] Complete payment

3. **Verify:**
   - [ ] Ad appears on Square #900
   - [ ] Ad is on Page 5 (not Page 1)
   - [ ] Navigate to Page 1 - Square #900 should NOT be there

**Expected Result:** ✅ Ads appear on correct pages

---

### Test 4: Multiple Purchases

1. **Purchase Square #25:**
   - [ ] Complete purchase for Square #25
   - [ ] Verify ad appears

2. **Purchase Square #75:**
   - [ ] Complete purchase for Square #75
   - [ ] Verify both ads appear on same page

3. **Purchase Square #500 (Page 3):**
   - [ ] Go to Page 3
   - [ ] Complete purchase for Square #500
   - [ ] Verify ad appears on Page 3

**Expected Result:** ✅ Multiple ads work independently

---

## 🔍 What to Check After Payment

### 1. **Ad Display:**
- [ ] Logo appears on correct square
- [ ] Logo is clear and visible
- [ ] Square shows as "occupied" (not "Ad Spot")
- [ ] Clicking square opens business website

### 2. **Data Persistence:**
- [ ] Refresh the page - ad should still be there
- [ ] Close browser and reopen - ad should still be there
- [ ] Open in different browser - ad should still be there (Firestore)

### 3. **Firestore Check:**
Open Firebase Console → Firestore → `purchasedSquares` collection:
- [ ] Document exists with square number as ID
- [ ] Contains all business data
- [ ] Has `endDate` field set correctly
- [ ] Has `status: 'active'`

### 4. **Expiration Check:**
- [ ] Check `endDate` in Firestore
- [ ] Should be: `startDate + duration days`
- [ ] Example: 10-day purchase = endDate 10 days from now

---

## 🐛 Common Payment Issues & Fixes

### Issue 1: Payment Redirects to Wrong URL
**Symptom:** After payment, redirects to wrong page or shows error
**Check:** 
- Backend `server.js` - `success_url` in Stripe session
- Should be: `https://clickalinks-frontend.web.app/success?session_id={CHECKOUT_SESSION_ID}`

### Issue 2: Ad Doesn't Appear After Payment
**Symptom:** Payment succeeds but ad doesn't show
**Check:**
- Browser console for errors
- Firestore - is purchase saved?
- localStorage - check `squarePurchases` key
- Success.js - did it save to Firestore?

### Issue 3: Logo Doesn't Display
**Symptom:** Ad appears but logo is missing
**Check:**
- Firebase Storage - is logo uploaded?
- Logo URL in Firestore document
- Browser console for image loading errors

### Issue 4: Wrong Square Number
**Symptom:** Ad appears on wrong square
**Check:**
- Success.js - is `squareNumber` correct?
- Firestore document ID should match square number
- AdGrid.js - is it loading correct data?

---

## 📊 Testing Checklist Summary

### Before Testing:
- [ ] Stripe test mode enabled
- [ ] Test API keys configured
- [ ] Firebase project connected
- [ ] Firestore rules allow writes

### During Testing:
- [ ] Test 10-day purchase (£10)
- [ ] Test 30-day purchase (£30)
- [ ] Test 60-day purchase (£60)
- [ ] Test on different pages
- [ ] Test multiple purchases
- [ ] Test logo upload

### After Testing:
- [ ] Ads appear correctly
- [ ] Data saved to Firestore
- [ ] Data persists after refresh
- [ ] Expiration dates correct
- [ ] Clicking ads opens website

---

## 🎯 Success Criteria

Payment flow is working correctly if:

✅ Stripe checkout opens when clicking "Pay"  
✅ Payment completes successfully  
✅ Redirects to success page  
✅ Ad appears immediately after payment  
✅ Ad appears on correct square  
✅ Logo displays correctly  
✅ Clicking ad opens business website  
✅ Data saved to Firestore  
✅ Data persists across page refreshes  

---

## 💡 Tips

1. **Use Stripe Dashboard:**
   - Monitor test payments in Stripe Dashboard
   - Check payment status and metadata

2. **Check Browser Console:**
   - Look for any errors during payment flow
   - Check network tab for API calls

3. **Test in Incognito Mode:**
   - Ensures no cached data interferes
   - Tests fresh user experience

4. **Test Different Browsers:**
   - Chrome, Firefox, Safari
   - Ensures cross-browser compatibility

---

## 🚀 Ready to Test?

When you're ready:
1. Use Stripe test mode
2. Follow the step-by-step guide above
3. Check each item in the checklist
4. Verify ads appear correctly
5. Test data persistence

Good luck! 🎉

