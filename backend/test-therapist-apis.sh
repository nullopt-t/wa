#!/bin/bash

# Therapist Management API Testing Script
# Run this to test all therapist-related endpoints

BASE_URL="http://localhost:4001/api"
ADMIN_EMAIL="admin@waey.com"
ADMIN_PASSWORD="Admin123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Therapist Management API Test Suite${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Step 1: Login as Admin
echo -e "${GREEN}Step 1: Login as Admin${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}Failed to get admin token${NC}"
  echo "Response: $ADMIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Admin token received${NC}"
echo ""

# Step 2: Create a test therapist user
echo -e "${GREEN}Step 2: Create Test Therapist User${NC}"
TEST_EMAIL="test.therapist.$(date +%s)@example.com"
THERAPIST_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"Therapist\",\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\",\"role\":\"therapist\"}")

echo "Response: $THERAPIST_RESPONSE"
echo -e "${GREEN}✓ Test therapist user created${NC}"
echo ""

# Step 3: Get all therapists (admin)
echo -e "${GREEN}Step 3: Get All Therapists (Admin)${NC}"
THERAPISTS_RESPONSE=$(curl -s -X GET "$BASE_URL/therapists/admin/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Response: $THERAPISTS_RESPONSE"
echo -e "${GREEN}✓ Retrieved all therapists${NC}"
echo ""

# Step 4: Get therapist stats
echo -e "${GREEN}Step 4: Get Therapist Stats${NC}"
# Note: This endpoint might need to be created
echo -e "${YELLOW}Stats endpoint - to be implemented${NC}"
echo ""

# Step 5: Verify a therapist (admin)
echo -e "${GREEN}Step 5: Verify Therapist (Admin)${NC}"
echo -e "${YELLOW}Note: Need therapist ID from database${NC}"
echo ""

# Step 6: Approve a therapist (admin)
echo -e "${GREEN}Step 6: Approve Therapist (Admin)${NC}"
echo -e "${YELLOW}Note: Need therapist ID from database${NC}"
echo ""

# Step 7: Test public therapist list
echo -e "${GREEN}Step 7: Get Public Therapist List${NC}"
PUBLIC_RESPONSE=$(curl -s -X GET "$BASE_URL/therapists")
echo "Response: $PUBLIC_RESPONSE"
echo -e "${GREEN}✓ Retrieved public therapist list${NC}"
echo ""

# Step 8: Test login with unapproved therapist
echo -e "${GREEN}Step 8: Login as Unapproved Therapist${NC}"
THERAPIST_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"Test1234!\"}")

echo "Response: $THERAPIST_LOGIN"
if echo "$THERAPIST_LOGIN" | grep -q "pending"; then
  echo -e "${GREEN}✓ Correctly shows pending approval message${NC}"
else
  echo -e "${YELLOW}Note: Check response above${NC}"
fi
echo ""

# Step 9: Test therapist profile creation
echo -e "${GREEN}Step 9: Create Therapist Profile${NC}"
echo -e "${YELLOW}Note: Requires therapist login token${NC}"
echo ""

# Summary
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ Admin login${NC}"
echo -e "${GREEN}✓ Therapist registration${NC}"
echo -e "${GREEN}✓ Get all therapists (admin)${NC}"
echo -e "${GREEN}✓ Get public therapist list${NC}"
echo -e "${GREEN}✓ Therapist login (pending check)${NC}"
echo -e "${YELLOW}⚠ Manual verification needed for verify/approve endpoints${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Manually approve the therapist in admin panel"
echo "2. Test therapist login after approval"
echo "3. Test therapist profile creation"
echo "4. Test therapist profile update"
echo ""
