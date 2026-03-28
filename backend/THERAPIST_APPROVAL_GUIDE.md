# 📋 Therapist Registration & Approval - Complete Guide

## 🎯 Two-Step Approval Process

Therapist accounts require **TWO separate verifications**:

```
┌─────────────────────────────────────────────────────────┐
│          THERAPIST REGISTRATION FLOW                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1: Email Verification (Automatic)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. User signs up as therapist                    │  │
│  │ 2. System sends verification email               │  │
│  │ 3. User clicks verification link                 │  │
│  │ 4. isVerified = true ✅                          │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                               │
│  Step 2: Admin Approval (Manual)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 5. Admin reviews therapist profile               │  │
│  │ 6. Admin verifies license & credentials          │  │
│  │ 7. Admin clicks "Approve"                        │  │
│  │ 8. isApproved = true ✅                          │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                               │
│              ✅ Therapist Can Login! ✅                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Fields

| Field | Type | Description | Set By |
|-------|------|-------------|---------|
| `role` | String | `'user'`, `'therapist'`, or `'admin'` | Signup |
| `isVerified` | Boolean | Email verified? | User (via email link) |
| `isApproved` | Boolean | Admin approved? | Admin (via admin panel) |

---

## 🔐 Login Behavior

### **Regular Users:**
```
Email + Password Correct → ✅ Login Success
```

### **Therapists:**
```
Email + Password Correct + isVerified=false → ❌ "Email not verified"
Email + Password Correct + isVerified=true + isApproved=false → ❌ "Pending admin approval"
Email + Password Correct + isVerified=true + isApproved=true → ✅ Login Success
```

### **Admins:**
```
Email + Password Correct → ✅ Login Success
```

---

## 📧 Error Messages

### **1. Email Not Verified**
```
البريد الإلكتروني غير مؤكد: [email]. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد. خطوات التسجيل: 1) التحقق من البريد الإلكتروني ⏳ 2) مراجعة الإدارة (للمعالجين)
```

**Meaning:** User hasn't clicked the email verification link yet.

**Solution:** Check email inbox (and spam folder) for verification link.

---

### **2. Therapist Pending Approval**
```
حسابك كمعالج قيد المراجعة من قبل فريقنا. ستتلقى إشعاراً عبر البريد الإلكتروني عند الموافقة. خطوات التسجيل: 1) التحقق من البريد الإلكتروني ✅ 2) مراجعة الإدارة ⏳
```

**Meaning:** Email is verified ✅, but admin hasn't approved the therapist account yet.

**Solution:** Wait for admin review. Will receive email notification when approved.

---

## 🎨 User Flow Diagrams

### **Flow 1: Email Verification (Step 1)**

```
┌─────────────┐
│   Signup    │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Verification    │
│ Email Sent      │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ User Clicks     │
│ Verification    │
│ Link            │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ isVerified =    │
│ true ✅         │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Can Login?      │
│ Regular User: ✅│
│ Therapist: ❌   │
└─────────────────┘
```

---

### **Flow 2: Admin Approval (Step 2 - Therapists Only)**

```
┌─────────────┐
│  Therapist  │
│  Signs Up   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Email Verified  │
│ (Step 1 ✅)     │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Admin Reviews   │
│ Profile         │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Admin Clicks    │
│ "Approve"       │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ isApproved =    │
│ true ✅         │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Therapist Can   │
│ Login! ✅       │
└─────────────────┘
```

---

## 🛠️ Admin Actions

### **View Pending Therapists:**
```
GET /api/therapists/admin/all
```

Shows all therapists with their status:
- `isVerified: false` → Email not verified
- `isVerified: true, isApproved: false` → Verified, pending admin approval
- `isVerified: true, isApproved: true` → Fully approved

---

### **Verify Therapist (Step 2a):**
```
PATCH /api/therapists/:id/verify
```

Sets `isVerified: true` (confirms license is valid)

---

### **Approve Therapist (Step 2b):**
```
PATCH /api/therapists/:id/approve
```

Sets `isApproved: true` (therapist can now login and practice)

---

## ❓ FAQ

### **Q: I verified my email but still can't login?**
**A:** If you're a therapist, you need admin approval after email verification. Wait for approval email.

### **Q: How long does admin approval take?**
**A:** Typically 2-5 business days. You'll receive an email when approved.

### **Q: Can I use the platform while pending approval?**
**A:** No. Therapist accounts must be fully approved (both steps) before login.

### **Q: I'm a regular user, do I need admin approval?**
**A:** No! Only therapists need admin approval. Regular users just need to verify their email.

### **Q: Can I resubmit if my therapist application is rejected?**
**A:** Yes, contact support to resubmit your application.

---

## 📝 Summary

| User Type | Step 1: Email Verify | Step 2: Admin Approval | Can Login |
|-----------|---------------------|------------------------|-----------|
| **Regular User** | ✅ Required | ❌ Not Needed | After Step 1 |
| **Therapist** | ✅ Required | ✅ Required | After Step 2 |
| **Admin** | ✅ Required | ❌ Not Needed (already admin) | After Step 1 |

---

## 🎯 Key Points

1. **Email verification** = Proves you own the email
2. **Admin approval** = Proves you're a qualified therapist
3. **Both are required** for therapists to login
4. **Regular users** only need email verification
5. **You'll get an email** when admin approves your therapist account
