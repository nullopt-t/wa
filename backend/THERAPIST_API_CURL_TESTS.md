# Therapist Management API - Complete Curl Test Guide

## Base Configuration
```bash
BASE_URL="http://localhost:4001/api"
```

---

## 1. ADMIN LOGIN
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@waey.com",
    "password": "Admin123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69a9552d89cab3ccb97d337c",
    "email": "admin@waey.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

**Save the token:**
```bash
ADMIN_TOKEN="YOUR_ACCESS_TOKEN_HERE"
```

---

## 2. REGISTER THERAPIST USER
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

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification link has been sent to your email",
  "user": {
    "id": "...",
    "email": "therapist.test@example.com",
    "role": "therapist"
  }
}
```

---

## 3. GET ALL THERAPISTS (ADMIN ONLY)
```bash
curl -X GET "http://localhost:4001/api/therapists/admin/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "therapists": [
    {
      "_id": "...",
      "userId": {
        "_id": "...",
        "firstName": "أحمد",
        "lastName": "محمد",
        "email": "therapist.test@example.com"
      },
      "bio": "...",
      "licenseNumber": "EGY-2024-12345",
      "experience": 10,
      "city": "Cairo",
      "isVerified": false,
      "isApproved": false,
      "isOnline": true,
      "isInPerson": true,
      "pricePerSession": 500
    }
  ],
  "total": 1
}
```

---

## 4. GET PUBLIC THERAPIST LIST
```bash
curl -X GET "http://localhost:4001/api/therapists"
```

**Expected Response:** (Only approved therapists)
```json
{
  "therapists": [],
  "total": 0
}
```

---

## 5. GET THERAPIST BY ID (PUBLIC)
```bash
curl -X GET "http://localhost:4001/api/therapists/6998d1055351166742076c36"
```

**Expected Response:**
```json
{
  "_id": "...",
  "userId": {
    "firstName": "أحمد",
    "lastName": "محمد"
  },
  "bio": "...",
  "licenseNumber": "...",
  "experience": 10,
  "city": "Cairo",
  "isOnline": true,
  "isInPerson": true,
  "pricePerSession": 500
}
```

---

## 6. VERIFY THERAPIST (ADMIN)
```bash
curl -X PATCH "http://localhost:4001/api/therapists/6998d1055351166742076c36/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "isVerified": true,
  "isApproved": false,
  "verifiedAt": "2026-03-27T...",
  "verifiedBy": "69a9552d89cab3ccb97d337c"
}
```

---

## 7. APPROVE THERAPIST (ADMIN)
```bash
curl -X PATCH "http://localhost:4001/api/therapists/6998d1055351166742076c36/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "isVerified": true,
  "isApproved": true
}
```

---

## 8. LOGIN AS THERAPIST (BEFORE APPROVAL)
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist.test@example.com",
    "password": "Test1234!"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Therapist account pending admin approval"
}
```

---

## 9. LOGIN AS THERAPIST (AFTER APPROVAL)
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist.test@example.com",
    "password": "Test1234!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": "...",
    "email": "therapist.test@example.com",
    "firstName": "أحمد",
    "lastName": "محمد",
    "role": "therapist"
  }
}
```

**Save therapist token:**
```bash
THERAPIST_TOKEN="YOUR_ACCESS_TOKEN_HERE"
```

---

## 10. GET THERAPIST PROFILE (THERAPIST)
```bash
curl -X GET "http://localhost:4001/api/therapists/profile/me" \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

**Expected Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "bio": "...",
  "licenseNumber": "...",
  "experience": 10,
  "city": "Cairo",
  "isVerified": true,
  "isApproved": true
}
```

---

## 11. CREATE THERAPIST PROFILE (THERAPIST)
```bash
curl -X POST "http://localhost:4001/api/therapists/profile" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "معالج نفسي متخصص في العلاج السلوكي المعرفي",
    "licenseNumber": "EGY-2024-67890",
    "experience": 5,
    "languages": ["Arabic", "English"],
    "pricePerSession": 400,
    "currency": "EGP",
    "country": "Egypt",
    "city": "Cairo",
    "isOnline": true,
    "isInPerson": true,
    "clinicAddress": "15 شارع التحرير، الدقي، الجيزة"
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "bio": "...",
  "licenseNumber": "EGY-2024-67890",
  "experience": 5,
  "isVerified": false,
  "isApproved": false
}
```

---

## 12. UPDATE THERAPIST PROFILE (THERAPIST)
```bash
curl -X PATCH "http://localhost:4001/api/therapists/profile" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio text...",
    "pricePerSession": 500
  }'
```

---

## 13. GET THERAPIST AVAILABILITY (THERAPIST)
```bash
curl -X GET "http://localhost:4001/api/therapists/availability" \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

---

## 14. UPDATE THERAPIST AVAILABILITY (THERAPIST)
```bash
curl -X PATCH "http://localhost:4001/api/therapists/availability" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "availability": [
      {
        "day": "sun",
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      },
      {
        "day": "mon",
        "startTime": "10:00",
        "endTime": "18:00",
        "isAvailable": true
      }
    ]
  }'
```

---

## 15. GET THERAPIST DASHBOARD (THERAPIST)
```bash
curl -X GET "http://localhost:4001/api/therapists/dashboard" \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

**Expected Response:**
```json
{
  "profile": {...},
  "stats": {
    "totalSessions": 0,
    "averageRating": 0,
    "totalReviews": 0,
    "pendingRequests": 0,
    "activeClients": 0
  },
  "todaySessions": [],
  "recentClients": []
}
```

---

## 16. DELETE THERAPIST PROFILE (THERAPIST)
```bash
curl -X DELETE "http://localhost:4001/api/therapists/profile" \
  -H "Authorization: Bearer $THERAPIST_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## QUICK TEST SEQUENCE

### Test Complete Flow:
```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@waey.com","password":"Admin123!"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# 2. Get all therapists
curl -X GET "http://localhost:4001/api/therapists/admin/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Verify therapist (replace ID)
curl -X PATCH "http://localhost:4001/api/therapists/THERAPIST_ID/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Approve therapist (replace ID)
curl -X PATCH "http://localhost:4001/api/therapists/THERAPIST_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## ERROR RESPONSES

### 401 Unauthorized (Not Admin)
```json
{
  "success": false,
  "message": "Only admins can view all therapists"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Therapist profile not found"
}
```

### 403 Forbidden (Not Therapist Role)
```json
{
  "success": false,
  "message": "Only users with therapist role can create therapist profiles"
}
```

### 400 Bad Request (Already Exists)
```json
{
  "success": false,
  "message": "Therapist profile already exists"
}
```

---

## DATABASE QUERIES (MongoDB)

### Find all therapists
```javascript
db.users.find({ role: 'therapist' })
```

### Find therapist profiles
```javascript
db.therapistprofiles.find({})
```

### Approve therapist manually
```javascript
db.users.updateOne(
  { email: 'therapist.test@example.com' },
  { $set: { isApproved: true } }
)
```

### Delete test therapist
```javascript
db.users.deleteOne({ email: 'therapist.test@example.com' })
db.therapistprofiles.deleteOne({ userId: ObjectId("...") })
```
