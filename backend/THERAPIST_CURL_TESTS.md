# Therapist Management - Complete CURL Test Guide

## ⚠️ IMPORTANT: Backend Restart Required
The backend must be restarted for the new code to load. After restart, run these tests.

---

## Test 1: Create Therapist User via Signup
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "therapist.test@example.com",
    "password": "Test1234!",
    "role": "therapist"
  }'
```

**Expected:** User created with `isApproved: false`

---

## Test 2: Login Before Approval (Should Fail)
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist.test@example.com",
    "password": "Test1234!"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Therapist account pending admin approval"
}
```

---

## Test 3: Admin Login
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@waey.com",
    "password": "Admin123!"
  }'
```

**Save the token:**
```bash
ADMIN_TOKEN="extract_from_response"
```

---

## Test 4: Admin Views All Therapists
```bash
curl -X GET http://localhost:4001/api/therapists/admin/all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** List of all therapists (including unapproved)

---

## Test 5: Admin Verifies Therapist
```bash
curl -X PATCH http://localhost:4001/api/therapists/USER_ID/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `isVerified: true`

---

## Test 6: Admin Approves Therapist
```bash
curl -X PATCH http://localhost:4001/api/therapists/USER_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `isApproved: true`

---

## Test 7: Therapist Login After Approval
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist.test@example.com",
    "password": "Test1234!"
  }'
```

**Expected:** Success with tokens!

**Save therapist token:**
```bash
THERAPIST_TOKEN="extract_from_response"
```

---

## Test 8: Get Therapist Profile
```bash
curl -X GET http://localhost:4001/api/therapists/profile/me \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

---

## Test 9: Create Therapist Profile
```bash
curl -X POST http://localhost:4001/api/therapists/profile \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "معالج نفسي متخصص",
    "licenseNumber": "EGY-2024-12345",
    "experience": 5,
    "languages": ["Arabic", "English"],
    "pricePerSession": 500,
    "currency": "EGP",
    "country": "Egypt",
    "city": "Cairo",
    "isOnline": true,
    "isInPerson": true
  }'
```

---

## Test 10: Get Public Therapist List
```bash
curl -X GET http://localhost:4001/api/therapists
```

**Expected:** Only approved therapists with complete profiles

---

## Quick Test Sequence (Copy-Paste)

```bash
# 1. Register therapist
curl -X POST http://localhost:4001/api/auth/register -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"Therapist","email":"therapist.test@example.com","password":"Test1234!","role":"therapist"}'

# 2. Try login (should fail)
curl -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" -d '{"email":"therapist.test@example.com","password":"Test1234!"}'

# 3. Admin login
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@waey.com","password":"Admin123!"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# 4. View all therapists
curl -X GET http://localhost:4001/api/therapists/admin/all -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Database Helpers

### Find therapist by email
```javascript
db.users.findOne({ email: 'therapist.test@example.com' })
```

### Approve therapist manually
```javascript
db.users.updateOne(
  { email: 'therapist.test@example.com' },
  { $set: { isApproved: true, isVerified: true } }
)
```

### Delete test therapist
```javascript
db.users.deleteOne({ email: 'therapist.test@example.com' })
```
