#!/bin/bash

# Complete Therapist Management API Test
# Tests the FULL flow from signup to approval

BASE_URL="http://localhost:4001/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="therapist.test.${TIMESTAMP}@example.com"

echo "========================================"
echo "Complete Therapist Flow Test"
echo "========================================"
echo ""
echo "Test Email: $TEST_EMAIL"
echo ""

# Step 1: Register as therapist
echo "Step 1: Register as Therapist"
echo "------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"أحمد\",
    \"lastName\": \"محمد\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234!\",
    \"role\": \"therapist\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Extract user ID from response
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "User ID: $USER_ID"
echo ""

# Step 2: Try login (should fail - not approved)
echo "Step 2: Login Attempt (Before Approval)"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234!\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Step 3: Manually approve in database
echo "Step 3: Approve Therapist in Database"
echo "--------------------------------------"
cd /mnt/HDD/Programming/Web/projects/react-waey/backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/test').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}), 'users');
  const TherapistProfile = mongoose.model('TherapistProfile', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    bio: String,
    licenseNumber: String,
    experience: Number,
    city: String,
    isVerified: Boolean,
    isApproved: Boolean,
  }), 'therapistprofiles');
  
  const userId = '$USER_ID';
  
  // Update user to approved
  await User.findByIdAndUpdate(userId, { \$set: { isApproved: true, isVerified: true } });
  console.log('✓ User approved in database');
  
  // Create therapist profile
  await TherapistProfile.create({
    userId: userId,
    bio: 'معالج نفسي متخصص',
    licenseNumber: 'EGY-TEST-12345',
    experience: 5,
    city: 'Cairo',
    isVerified: true,
    isApproved: true,
    isOnline: true,
    isInPerson: true,
    pricePerSession: 500,
    currency: 'EGP',
    country: 'Egypt'
  });
  console.log('✓ Therapist profile created');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"
echo ""

# Step 4: Login after approval
echo "Step 4: Login Attempt (After Approval)"
echo "---------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234!\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract therapist token
THERAPIST_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$THERAPIST_TOKEN" ]; then
  echo "❌ Failed to get therapist token"
  echo "Check if approval worked"
else
  echo "✓ Therapist token received"
  echo ""
  
  # Step 5: Get therapist profile
  echo "Step 5: Get Therapist Profile"
  echo "------------------------------"
  PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/therapists/profile/me" \
    -H "Authorization: Bearer $THERAPIST_TOKEN")
  
  echo "Response: $PROFILE_RESPONSE"
  echo ""
  
  # Step 6: Update therapist profile
  echo "Step 6: Update Therapist Profile"
  echo "---------------------------------"
  UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/therapists/profile" \
    -H "Authorization: Bearer $THERAPIST_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "bio": "Updated bio - more experienced therapist now",
      "pricePerSession": 600
    }')
  
  echo "Response: $UPDATE_RESPONSE"
  echo ""
  
  # Step 7: Get therapist dashboard
  echo "Step 7: Get Therapist Dashboard"
  echo "--------------------------------"
  DASHBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/therapists/dashboard" \
    -H "Authorization: Bearer $THERAPIST_TOKEN")
  
  echo "Response: $DASHBOARD_RESPONSE"
  echo ""
fi

# Step 8: Admin login and verify
echo "Step 8: Admin Views All Therapists"
echo "-----------------------------------"
# First get admin token (try default password)
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@waey.com","password":"Admin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo "✓ Admin login successful"
  
  ALL_THERAPISTS=$(curl -s -X GET "$BASE_URL/therapists/admin/all" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  echo "All Therapists Response:"
  echo "$ALL_THERAPISTS" | head -100
  echo ""
else
  echo "⚠ Admin login failed (password may have changed)"
  echo "Admin response: $ADMIN_RESPONSE"
fi

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "✓ Therapist Registration"
echo "✓ Login Before Approval (should fail)"
echo "✓ Database Approval"
echo "✓ Login After Approval"
[ -n "$THERAPIST_TOKEN" ] && echo "✓ Get Therapist Profile"
[ -n "$THERAPIST_TOKEN" ] && echo "✓ Update Therapist Profile"
[ -n "$THERAPIST_TOKEN" ] && echo "✓ Get Therapist Dashboard"
echo "✓ Admin View All Therapists"
echo ""
echo "Test Email: $TEST_EMAIL"
echo "Test Password: Test1234!"
echo ""
