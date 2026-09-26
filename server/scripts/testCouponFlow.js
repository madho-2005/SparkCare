import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api/v1';

async function testCouponFlow() {
  console.log('--- STARTING COUPON FLOW VERIFICATION ---');

  // 1. Login as Admin
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || 'admin@sparkcare.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234'
    })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.data?.token || loginData.data?.accessToken;
  console.log('Admin login successful. Token acquired.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Clear any existing test WELCOME10 or SPARK500 if present
  const adminCouponsRes = await fetch(`${API_BASE}/admin/coupons`, { headers: authHeaders });
  const adminCouponsData = await adminCouponsRes.json();
  for (const c of adminCouponsData.data || []) {
    if (['WELCOME10', 'SPARK500'].includes(c.code)) {
      await fetch(`${API_BASE}/admin/coupons/${c._id}`, { method: 'DELETE', headers: authHeaders });
      console.log(`Deleted pre-existing coupon: ${c.code}`);
    }
  }

  // 3. Verify public available coupons before creation
  console.log('\n2. Checking public /api/v1/coupons (should be empty if only expired WELLCOME12 exists)...');
  const pubRes1 = await fetch(`${API_BASE}/coupons`);
  const pubData1 = await pubRes1.json();
  console.log(`Available coupons count: ${pubData1.data?.length}`);

  // 4. Create real admin coupon WELCOME10
  console.log('\n3. Admin creating coupon WELCOME10...');
  const createRes = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'WELCOME10',
      description: '10% discount on all orders over ₹500',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 500,
      maxDiscountAmount: 250,
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString()
    })
  });
  const createData = await createRes.json();
  console.log('Create response status:', createRes.status);
  console.log('Created coupon:', createData.data?.code, createData.data?.description);
  if (createRes.status !== 201) {
    throw new Error('Coupon creation failed: ' + JSON.stringify(createData));
  }

  // 5. Test Duplicate Code Rejection
  console.log('\n4. Testing duplicate coupon code rejection...');
  const dupRes = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'welcome10',
      discountType: 'percentage',
      discountValue: 10,
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString()
    })
  });
  const dupData = await dupRes.json();
  console.log('Duplicate status code (expected 400):', dupRes.status);
  console.log('Duplicate message:', dupData.message);
  if (dupRes.status !== 400) {
    throw new Error('Duplicate coupon was NOT rejected!');
  }

  // 6. Test Public Available Coupons
  console.log('\n5. Checking public /api/v1/coupons (must contain exactly WELCOME10)...');
  const pubRes2 = await fetch(`${API_BASE}/coupons`);
  const pubData2 = await pubRes2.json();
  console.log(`Public coupons returned: ${pubData2.data?.length}`);
  const welcomeCoupon = pubData2.data?.find(c => c.code === 'WELCOME10');
  if (!welcomeCoupon) {
    throw new Error('WELCOME10 not found in public coupons!');
  }
  console.log('Verified public coupon fields:');
  console.log('  - Code:', welcomeCoupon.code);
  console.log('  - Type:', welcomeCoupon.discountType);
  console.log('  - Value:', welcomeCoupon.discountValue);
  console.log('  - MinSpend:', welcomeCoupon.minPurchaseAmount);
  console.log('  - Description:', welcomeCoupon.description);

  // 7. Test Coupon Validation Endpoint
  console.log('\n6. Testing coupon validation at /api/v1/coupons/validate...');
  const valResSuccess = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'WELCOME10',
      subtotal: 1000
    })
  });
  const valDataSuccess = await valResSuccess.json();
  console.log('Validation with subtotal 1000:');
  console.log('  - Status:', valResSuccess.status);
  console.log('  - Discount calculated by server:', valDataSuccess.data?.discountAmount);
  console.log('  - Final total calculated by server:', valDataSuccess.data?.finalTotal);
  if (valDataSuccess.data?.discountAmount !== 100 || valDataSuccess.data?.finalTotal !== 900) {
    throw new Error('Discount calculation mismatch!');
  }

  const valResFail = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'WELCOME10',
      subtotal: 300 // Below minPurchaseAmount of 500
    })
  });
  const valDataFail = await valResFail.json();
  console.log('Validation with subtotal 300 (expected 400):', valResFail.status, valDataFail.message);
  if (valResFail.status !== 400) {
    throw new Error('Subtotal below minPurchaseAmount was not rejected!');
  }

  // 8. Create a second coupon: SPARK500
  console.log('\n7. Admin creating coupon SPARK500...');
  const createRes2 = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'SPARK500',
      description: 'Flat ₹500 off on electrical rewiring & repairs above ₹2000',
      discountType: 'fixed_amount',
      discountValue: 500,
      minPurchaseAmount: 2000,
      expiryDate: new Date(Date.now() + 86400000 * 60).toISOString()
    })
  });
  const createData2 = await createRes2.json();
  console.log('Created second coupon:', createData2.data?.code);

  const pubRes3 = await fetch(`${API_BASE}/coupons`);
  const pubData3 = await pubRes3.json();
  console.log(`Public coupons returned after 2nd coupon: ${pubData3.data?.length}`);
  if (pubData3.data?.length !== 2) {
    throw new Error(`Expected exactly 2 public coupons, got ${pubData3.data?.length}`);
  }

  console.log('\n✅ ALL COUPON FLOW VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

testCouponFlow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
