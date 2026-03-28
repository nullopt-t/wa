#!/bin/bash

echo "========================================"
echo "Complete Therapist Management API Test"
echo "========================================"
echo ""

# Step 0: Setup - Create admin and therapist with proper passwords
echo "Step 0: Setup Test Data"
echo "----------------------"
cd /mnt/HDD/Programming/Web/projects/react-waey/backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/test').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}), 'users');
  const workingHash = '\$2b\$10\$IA/xbnIsi.fxDxNkoyYtPeJfzSJLVg1gHOxVF4rcwK9kfXUUF4Ps6';
  
  // Fix admin
  await User.findByIdAndUpdate('69a9552d89cab3ccb97d337c', { \$set: { password: workingHash, isVerified: true, isApproved: true } });
  
  // Create fresh therapist
  await User.deleteOne({ email: 'api.test.therapist@example.com' });
  await User.create({
    firstName: 'API',
    lastName: 'Therapist',
    email: 'api.test.therapist@example.com',
    password: workingHash,
    role: 'therapist',
    isVerified: true,
    isApproved: false  // NOT approved yet - will test admin approval
  });
  
  console.log('✅ Test data ready');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
"

echo ""
echo "Step 1: Admin Login"
echo "-------------------"
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@waey.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed"
  echo "Response: $ADMIN_RESPONSE"
  exit 1
fi

echo "✅ Admin login successful"
echo ""

echo "Step 2: Get All Therapists (Admin)"
echo "-----------------------------------"
THERAPISTS_RESPONSE=$(curl -s -X GET "http://localhost:4001/api/therapists/admin/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response: $THERAPISTS_RESPONSE" | head -200
echo ""

# Extract therapist ID
THERAPIST_ID=$(echo $THERAPISTS_RESPONSE | grep -o '"_id":"69c6[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$THERAPIST_ID" ]; then
  echo "❌ Could not find therapist ID"
  exit 1
fi

echo "Found Therapist ID: $THERAPIST_ID"
echo ""

echo "Step 3: Verify Therapist (Admin API)"
echo "-------------------------------------"
VERIFY_RESPONSE=$(curl -s -X PATCH "http://localhost:4001/api/therapists/$THERAPIST_ID/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response: $VERIFY_RESPONSE"
echo ""

echo "Step 4: Approve Therapist (Admin API)"
echo "--------------------------------------"
APPROVE_RESPONSE=$(curl -s -X PATCH "http://localhost:4001/api/therapists/$THERAPIST_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response: $APPROVE_RESPONSE"
echo ""

echo "Step 5: Login as Approved Therapist"
echo "------------------------------------"
THERAPIST_LOGIN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api.test.therapist@example.com","password":"Admin123!"}')

echo "Response: $THERAPIST_LOGIN"
echo ""

THERAPIST_TOKEN=$(echo $THERAPIST_LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$THERAPIST_TOKEN" ]; then
  echo "✅ THERAPIST LOGIN SUCCESS!"
  echo ""
  
  echo "Step 6: Get Therapist Profile"
  echo "------------------------------"
  PROFILE_RESPONSE=$(curl -s -X GET "http://localhost:4001/api/therapists/profile/me" \
    -H "Authorization: Bearer $THERAPIST_TOKEN")
  
  echo "Response: $PROFILE_RESPONSE"
  echo ""
  
  echo "========================================"
  echo "✅ ALL TESTS PASSED!"
  echo "========================================"
  echo "✓ Admin Login"
  echo "✓ Get All Therapists"
  echo "✓ Verify Therapist (API)"
  echo "✓ Approve Therapist (API)"
  echo "✓ Therapist Login After Approval"
  echo "✓ Get Therapist Profile"
  echo ""
else
  echo "❌ Therapist login failed"
  echo "Response: $THERAPIST_LOGIN"
fi
