# Waey Platform - Therapist Dashboard Implementation Plan

## Project Overview
**Platform:** Waey (وعي) - Mental Health Platform  
**Tech Stack:** React 18 + Vite + Tailwind CSS (Frontend) | NestJS 10 + MongoDB + Redis (Backend)  
**Document Version:** 1.0  
**Last Updated:** February 20, 2026

---

## Table of Contents
1. [Dashboard Layout](#1-dashboard-layout)
2. [Features & Requirements](#2-features--requirements)
3. [Data Models](#3-data-models)
4. [API Endpoints](#4-api-endpoints)
5. [Security & Permissions](#5-security--permissions)
6. [Implementation Phases](#6-implementation-phases)
7. [File Structure](#7-file-structure)
8. [Component Specifications](#8-component-specifications)

---

## 1. Dashboard Layout

### Main Dashboard Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Waey Platform                    🔔(3)  💬(2)  👤 [Name]  ▼   │
├─────────────────────────────────────────────────────────────────┤
│  SIDEBAR NAVIGATION                                             │
│  ┌─────────────────────────┐                                    │
│  │  📊 لوحة التحكم         │                                    │
│  │  📅 الجلسات            │                                    │
│  │  👥 العملاء            │                                    │
│  │  💰 المالية            │                                    │
│  │  📝 التقارير            │                                    │
│  │  💬 الرسائل            │                                    │
│  │  📄 الموارد            │                                    │
│  │  ⚙️ الإعدادات          │                                    │
│  └─────────────────────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Sections

#### 1.1 Welcome Banner
- Therapist name + profile picture
- Specialty badge
- Star rating (average from reviews)
- Quick stats:
  - Sessions today
  - Pending requests
  - Total active clients
  - New messages count

#### 1.2 Today's Appointments Panel
- List of today's sessions
- Time, client name, session type
- Status badges (Pending/Confirmed/Completed/Cancelled)
- Quick actions (Start/Reschedule/Cancel)
- Search & Filter functionality
- Link to full calendar view

#### 1.3 Notifications Panel
- Real-time notifications center
- Notification types:
  - 🔴 New Booking Request
  - 🟡 Reschedule/Cancel Request
  - 🟢 Session Reminder (30 min before)
  - 💬 New Message
  - ⭐ New Review
  - 📧 Admin Approval Update
  - 💰 Payment Received
- Tabs: [All] [Unread] [Session] [Message]
- Mark all as read functionality

#### 1.4 Quick Actions
- Schedule Session
- Add Client
- Session Reports
- Messages
- Analytics
- Availability Settings

#### 1.5 Recent Clients
- Last 5 active clients
- Name, last session date, progress indicator
- Next session info
- Progress indicators: Excellent/Good/Fair/Needs Attention
- Link to full client list

#### 1.6 Earnings & Insights
- Monthly income
- Total sessions this month
- Client retention rate
- Cancellation rate
- Link to detailed analytics

---

## 2. Features & Requirements

### 2.1 Notifications System
**Real-time notifications via Socket.IO**

| Type | Trigger | Recipient | Action Required |
|------|---------|-----------|-----------------|
| New Booking | Client books session | Therapist | Accept/Decline/Reschedule |
| Reschedule Request | Client requests change | Therapist | Accept/Decline |
| Session Reminder | 30 min before session | Therapist + Client | Join session |
| New Message | Client sends message | Therapist | Read/Reply |
| New Review | Client submits review | Therapist | Read/Reply |
| Payment Received | Payment processed | Therapist | None |
| Admin Approval | Admin approves/rejects | Therapist | None |

**UI Components:**
- Bell icon with unread count badge
- Dropdown notification panel
- Notification history page
- Push notification support (future)

### 2.2 Search & Filter System

**Sessions Search:**
- Search by: Client name, date, time, status, type
- Filters: Status, session type, date range, payment status
- Sort by: Date, client name, status

**Clients Search:**
- Search by: Name, email, phone
- Filters: Status (active/inactive), progress, tags, last session date
- Sort by: Name, last session, total sessions

**Reviews Search:**
- Search by: Client name, comment text
- Filters: Rating (1-5 stars), anonymous, date range
- Sort by: Date, rating

**Messages Search:**
- Search by: Client name, message content
- Filters: Unread, date range
- Sort by: Date, client name

**Resources Search:**
- Search by: File name, description
- Filters: Type (PDF/Audio/Video), tags, folder
- Sort by: Name, date, usage count

### 2.3 Calendar View

**Views:**
- Day View: Hourly time slots (9 AM - 6 PM)
- Week View: 7-day overview with time slots
- Month View: Calendar grid with session counts
- List View: Chronological list of sessions

**Features:**
- Color coding by session type
- Drag & drop rescheduling
- Click to create new session
- Click to view/edit session details
- Availability overlay (green = available, red = booked)
- Export to Google Calendar/iCal (future)

**Session Types (Color Coded):**
- 🟦 Individual Session
- 🟩 Couple Session
- 🟨 Family Session
- 🟪 Group Therapy
- 🟧 Follow-up

### 2.4 Session Notes Timeline

**Per-Client Timeline View:**
- Chronological list of all sessions
- Session details:
  - Date, time, duration
  - Session type
  - Status
  - Price & payment status
- Therapist notes (private, encrypted)
- Goals & homework assignments
- Progress indicators
- Attachments (worksheets, resources)
- Client mood/progress charts

**Note Template:**
```
Session #X - [Date]
─────────────────────────────────
Type: [Individual/Couple/Family/Group]
Duration: [X minutes]
Status: [Completed/Cancelled/No-show]

Presenting Issues:
[Client's reported concerns]

Interventions Used:
[Therapist's techniques/approaches]

Progress Notes:
[Detailed session notes]

Goals/Homework:
☐ [Goal 1]
☐ [Goal 2]
☐ [Goal 3]

Next Session Focus:
[Planned topics]

Progress Rating:
🟢 Excellent | 🟡 Good | 🔴 Fair | ⚪ Needs Attention
```

### 2.5 Messaging System

**Features:**
- Real-time chat (Socket.IO)
- File attachments (PDF, images, audio)
- Read receipts
- Typing indicators
- Unread message badges
- Message templates (quick responses)
- Search message history
- Secure/encrypted storage
- Client-specific chat threads

**UI Components:**
- Message list (left sidebar)
- Chat window (main area)
- Message input with attachment button
- Emoji picker (future)
- Quick reply templates

**Message Types:**
- Text messages
- File attachments
- Session links
- Payment links
- Appointment confirmations

### 2.6 Advanced Analytics

**Dashboard Metrics:**

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Monthly Revenue | Total earnings this month | Sum of completed sessions |
| Session Count | Total sessions this month | Count of sessions |
| Active Clients | Clients with session in last 30 days | Unique clients |
| Average Rating | Mean of all reviews | Sum of ratings / count |
| Retention Rate | % of returning clients | (Returning / Total) × 100 |
| Cancellation Rate | % of cancelled sessions | (Cancelled / Total) × 100 |
| No-show Rate | % of no-show sessions | (No-show / Total) × 100 |
| Utilization Rate | % of available hours booked | (Booked / Available) × 100 |

**Charts:**
- Monthly Revenue Trend (Line Chart)
- Session Types Distribution (Pie Chart)
- Sessions per Week (Bar Chart)
- Client Growth (Line Chart)
- Peak Hours Analysis (Heat Map)
- Cancellation Trends (Line Chart)

**Reports:**
- Monthly Income Report (PDF export)
- Client Activity Report
- Session Summary Report
- Review Analysis Report

### 2.7 Resource Management

**Features:**
- Upload files (PDF, audio, video, images)
- Organize by folders/categories
- Tag resources for easy search
- Assign to specific clients
- Track client access/usage
- Client portal integration

**Resource Types:**
- 📄 Worksheets (CBT, DBT, etc.)
- 🎧 Audio (meditation, relaxation)
- 📹 Videos (educational content)
- 📊 Assessment tools
- 📋 Forms & templates

**Folder Structure Example:**
```
📁 Anxiety Management
  ├── 📄 Breathing_Exercises.pdf
  ├── 📄 CBT_Worksheet.pdf
  └── 🎧 Meditation_Audio.mp3
📁 Depression Resources
  ├── 📄 Mood_Tracker.pdf
  └── 📄 Behavioral_Activation.pdf
📁 General Worksheets
  ├── 📄 Goal_Setting_Template.pdf
  └── 📄 Thought_Record.pdf
```

### 2.8 Client Self-Service Portal

**Features:**
- Client login with verified account
- View upcoming sessions
- Book new sessions (based on therapist availability)
- Reschedule/cancel sessions
- Complete pre-session forms
- View/download assigned resources
- Message therapist
- View progress charts
- Make payments
- Submit reviews

**Client Dashboard:**
- Upcoming sessions card
- Pending forms alert
- Assigned resources library
- Message history
- Payment history
- Progress visualization

### 2.9 Therapist Profile & Availability

**Profile Fields:**
- Profile picture
- Specialty
- License number
- Years of experience
- Education
- Certifications
- Bio/description
- Session types offered
- Session duration options
- Pricing per session type
- Languages spoken

**Availability Settings:**
- Working days (Sun-Thu, Sun-Sat options)
- Working hours per day
- Slot duration (30/45/60 minutes)
- Buffer time between sessions
- Vacation/blocked dates
- Emergency unavailability

---

## 3. Data Models

### 3.1 Session/Appointment Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;           // Reference to User (therapist)
  clientId: ObjectId;              // Reference to User (client)
  dateTime: Date;                  // Session start time
  duration: number;                // Duration in minutes (30, 45, 60)
  type: 'individual' | 'couple' | 'family' | 'group' | 'follow-up';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;                  // Therapist's private notes (encrypted)
  clientNotes?: string;            // Client's reason for session
  goals?: string[];                // Session goals
  homework?: string[];             // Assigned homework
  price: number;                   // Session price
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  cancellationReason?: string;
  cancelledBy?: ObjectId;
  cancelledAt?: Date;
  completedAt?: Date;
  resources?: ObjectId[];          // Assigned resources
  attachments?: string[];          // File URLs
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Client (Therapist-Client Relationship) Schema
```typescript
{
  _id: ObjectId;
  userId: ObjectId;                // Reference to User (client)
  therapistId: ObjectId;           // Reference to User (therapist)
  status: 'active' | 'inactive' | 'archived';
  firstSessionDate: Date;
  lastSessionDate: Date;
  totalSessions: number;
  progress: 'excellent' | 'good' | 'fair' | 'needs-attention';
  notes?: string;                  // Therapist's private notes
  tags?: string[];                 // e.g., ['anxiety', 'depression', 'trauma']
  assignedResources?: ObjectId[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string;
  currentMedications?: string[];
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 Review Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;           // Reference to User (therapist)
  clientId: ObjectId;              // Reference to User (client)
  sessionId: ObjectId;             // Reference to Session
  rating: number;                  // 1-5 stars
  comment: string;
  isAnonymous: boolean;
  therapistReply?: string;
  therapistReplyAt?: Date;
  isVerified: boolean;             // Verified session completion
  helpfulCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.4 Availability Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;           // Reference to User (therapist)
  dayOfWeek: number;               // 0-6 (Sunday-Saturday)
  startTime: string;               // "09:00"
  endTime: string;                 // "17:00"
  slotDuration: number;            // minutes (30, 45, 60)
  bufferTime?: number;             // minutes between sessions
  isAvailable: boolean;
  maxSessionsPerDay?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.5 Blocked Dates Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;
  date: Date;                      // Specific date
  reason: string;                  // e.g., "Vacation", "Conference"
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
}
```

### 3.6 Message Schema
```typescript
{
  _id: ObjectId;
  conversationId: ObjectId;        // Reference to Conversation
  senderId: ObjectId;              // Reference to User
  receiverId: ObjectId;            // Reference to User
  content: string;
  attachments?: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }[];
  isRead: boolean;
  readAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
}
```

### 3.7 Conversation Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;
  clientId: ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: {
    therapist: number;
    client: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.8 Notification Schema
```typescript
{
  _id: ObjectId;
  userId: ObjectId;                // Recipient
  type: 'booking' | 'reschedule' | 'cancel' | 'message' | 'review' | 'payment' | 'reminder';
  title: string;
  message: string;
  data?: any;                      // Related data (sessionId, clientId, etc.)
  isRead: boolean;
  readAt?: Date;
  actionRequired?: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}
```

### 3.9 Resource Schema
```typescript
{
  _id: ObjectId;
  therapistId: ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'audio' | 'video' | 'image' | 'document';
  category?: string;               // Folder name
  tags?: string[];
  assignedClients?: ObjectId[];    // Client IDs who can access
  usageCount?: number;             // How many times accessed
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.10 Pre-Session Form Schema
```typescript
{
  _id: ObjectId;
  clientId: ObjectId;
  therapistId?: ObjectId;
  type: 'intake' | 'medical-history' | 'consent' | 'assessment';
  title: string;
  fields: {
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
    required: boolean;
    options?: string[];
  }[];
  responses?: {
    fieldId: string;
    value: any;
  }[];
  isCompleted: boolean;
  completedAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.11 Payment Schema
```typescript
{
  _id: ObjectId;
  sessionId: ObjectId;
  clientId: ObjectId;
  therapistId: ObjectId;
  amount: number;
  currency: string;                // 'EGP', 'SAR', etc.
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'bank-transfer' | 'wallet';
  transactionId?: string;
  paymentDate?: Date;
  refundReason?: string;
  refundedAt?: Date;
  invoiceUrl?: string;
  createdAt: Date;
}
```

### 3.12 Audit Log Schema
```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  action: string;                  // e.g., "VIEW_CLIENT", "UPDATE_SESSION"
  resource: string;                // e.g., "Client", "Session"
  resourceId: ObjectId;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
```

---

## 4. API Endpoints

### Authentication & Authorization
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PATCH | `/api/auth/change-password` | Change password | Yes |

### Therapist Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/dashboard` | Get dashboard summary data | Yes (Therapist) |
| GET | `/api/therapist/stats` | Get statistics for dashboard | Yes (Therapist) |

### Sessions Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/sessions` | Get all sessions (with filters) | Yes (Therapist) |
| GET | `/api/therapist/sessions/:id` | Get single session details | Yes (Therapist) |
| POST | `/api/therapist/sessions` | Create new session | Yes (Therapist) |
| PATCH | `/api/therapist/sessions/:id` | Update session | Yes (Therapist) |
| DELETE | `/api/therapist/sessions/:id` | Cancel session | Yes (Therapist) |
| POST | `/api/therapist/sessions/:id/notes` | Add session notes | Yes (Therapist) |
| POST | `/api/therapist/sessions/:id/complete` | Mark session as completed | Yes (Therapist) |
| GET | `/api/therapist/sessions/today` | Get today's sessions | Yes (Therapist) |
| GET | `/api/therapist/sessions/upcoming` | Get upcoming sessions | Yes (Therapist) |

### Clients Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/clients` | Get all clients | Yes (Therapist) |
| GET | `/api/therapist/clients/:id` | Get client details | Yes (Therapist) |
| POST | `/api/therapist/clients` | Add new client | Yes (Therapist) |
| PATCH | `/api/therapist/clients/:id` | Update client info | Yes (Therapist) |
| DELETE | `/api/therapist/clients/:id` | Archive client | Yes (Therapist) |
| GET | `/api/therapist/clients/:id/sessions` | Get client session history | Yes (Therapist) |
| POST | `/api/therapist/clients/:id/notes` | Add client notes | Yes (Therapist) |
| GET | `/api/therapist/clients/:id/notes` | Get client notes timeline | Yes (Therapist) |
| PATCH | `/api/therapist/clients/:id/progress` | Update client progress | Yes (Therapist) |
| POST | `/api/therapist/clients/:id/resources` | Assign resources to client | Yes (Therapist) |

### Availability Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/availability` | Get availability schedule | Yes (Therapist) |
| PUT | `/api/therapist/availability` | Update availability | Yes (Therapist) |
| POST | `/api/therapist/availability/block` | Block specific dates | Yes (Therapist) |
| DELETE | `/api/therapist/availability/block/:id` | Unblock date | Yes (Therapist) |
| GET | `/api/therapist/availability/slots` | Get available time slots | Yes (Public) |

### Reviews Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/reviews` | Get all reviews | Yes (Therapist) |
| GET | `/api/therapist/reviews/summary` | Get review statistics | Yes (Therapist) |
| POST | `/api/therapist/reviews/:id/reply` | Reply to review | Yes (Therapist) |
| DELETE | `/api/therapist/reviews/:id` | Delete review (admin only) | Yes (Admin) |

### Earnings & Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/earnings` | Get earnings data | Yes (Therapist) |
| GET | `/api/therapist/earnings/monthly` | Get monthly earnings breakdown | Yes (Therapist) |
| GET | `/api/therapist/analytics/overview` | Get analytics overview | Yes (Therapist) |
| GET | `/api/therapist/analytics/sessions` | Get session analytics | Yes (Therapist) |
| GET | `/api/therapist/analytics/clients` | Get client analytics | Yes (Therapist) |
| GET | `/api/therapist/analytics/reviews` | Get review analytics | Yes (Therapist) |
| GET | `/api/therapist/reports/monthly` | Generate monthly report | Yes (Therapist) |

### Messaging
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/conversations` | Get all conversations | Yes (Therapist) |
| GET | `/api/therapist/conversations/:id` | Get conversation messages | Yes (Therapist) |
| POST | `/api/therapist/conversations/:id/messages` | Send message | Yes (Therapist) |
| PATCH | `/api/therapist/conversations/:id/read` | Mark as read | Yes (Therapist) |
| DELETE | `/api/therapist/messages/:id` | Delete message | Yes (Therapist) |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/notifications` | Get all notifications | Yes (Therapist) |
| GET | `/api/therapist/notifications/unread` | Get unread count | Yes (Therapist) |
| PATCH | `/api/therapist/notifications/:id/read` | Mark as read | Yes (Therapist) |
| PATCH | `/api/therapist/notifications/read-all` | Mark all as read | Yes (Therapist) |
| DELETE | `/api/therapist/notifications/:id` | Delete notification | Yes (Therapist) |

### Resources Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/resources` | Get all resources | Yes (Therapist) |
| POST | `/api/therapist/resources` | Upload new resource | Yes (Therapist) |
| PATCH | `/api/therapist/resources/:id` | Update resource | Yes (Therapist) |
| DELETE | `/api/therapist/resources/:id` | Delete resource | Yes (Therapist) |
| POST | `/api/therapist/resources/:id/assign` | Assign to clients | Yes (Therapist) |
| GET | `/api/therapist/resources/categories` | Get categories/folders | Yes (Therapist) |

### Profile Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/therapist/profile` | Get therapist profile | Yes (Therapist) |
| PATCH | `/api/therapist/profile` | Update profile | Yes (Therapist) |
| POST | `/api/therapist/profile/avatar` | Upload avatar | Yes (Therapist) |
| GET | `/api/therapist/public-profile/:id` | Get public profile | No |

---

## 5. Security & Permissions

### 5.1 Role-Based Access Control (RBAC)

**Roles:**
- `user` - Regular client user
- `therapist` - Licensed therapist
- `admin` - Platform administrator

**Permissions Matrix:**

| Resource | User | Therapist | Admin |
|----------|------|-----------|-------|
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| View own sessions | ✅ | ✅ (all clients) | ✅ (all) |
| Book session | ✅ | ❌ | ❌ |
| Cancel own session | ✅ | ✅ (any) | ✅ |
| View assigned therapist | ✅ | ❌ | ✅ |
| View own clients | ❌ | ✅ | ✅ |
| Edit client notes | ❌ | ✅ (own clients) | ✅ |
| View earnings | ❌ | ✅ (own) | ✅ (all) |
| Manage availability | ❌ | ✅ | ✅ |
| Upload resources | ❌ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Approve therapists | ❌ | ❌ | ✅ |
| Delete reviews | ❌ | ❌ | ✅ |

### 5.2 Data Encryption

**Encrypted at Rest:**
- Session notes
- Client medical history
- Private messages
- Payment information

**Encryption Standards:**
- AES-256 for data at rest
- TLS 1.3 for data in transit
- End-to-end encryption for messages

### 5.3 Audit Logging

**Logged Actions:**
- User login/logout
- View client records
- Create/update/delete sessions
- Modify client notes
- Access earnings data
- Export reports
- Change availability

**Audit Log Fields:**
- User ID
- Action type
- Resource accessed
- Changes made (before/after)
- IP address
- User agent
- Timestamp

### 5.4 Compliance Considerations

**Data Privacy:**
- GDPR compliance for EU users
- HIPAA-style protections for health data
- Right to data deletion
- Data portability
- Consent management

**Session Data:**
- Automatic session timeout (15 min inactivity)
- Secure session storage
- No sensitive data in URLs
- CSRF protection

---

## 6. Implementation Phases

### Phase 1: Core Dashboard + Auth Integration
**Duration:** 1-2 weeks
**Priority:** 🔴 High

**Tasks:**
- [ ] Connect AuthContext to dashboard
- [ ] Fetch therapist profile from backend
- [ ] Create welcome banner component
- [ ] Display today's appointments
- [ ] Show quick stats (sessions, clients, rating)
- [ ] Create notifications bell (UI only)
- [ ] Implement responsive layout
- [ ] Add loading states

**Backend:**
- [ ] GET `/api/therapist/dashboard` endpoint
- [ ] GET `/api/therapist/stats` endpoint
- [ ] Auth guard for therapist routes

---

### Phase 2: Sessions Management + Calendar
**Duration:** 2-3 weeks
**Priority:** 🔴 High

**Tasks:**
- [ ] Create sessions list view
- [ ] Implement search & filter
- [ ] Build calendar component (day/week/month)
- [ ] Add session CRUD operations
- [ ] Session status management
- [ ] Reschedule functionality
- [ ] Cancellation flow
- [ ] Session details modal

**Backend:**
- [ ] All session endpoints
- [ ] Calendar availability logic
- [ ] Conflict detection
- [ ] Email notifications for session changes

---

### Phase 3: Clients Management + Timeline
**Duration:** 2-3 weeks
**Priority:** 🔴 High

**Tasks:**
- [ ] Clients list view
- [ ] Client search & filter
- [ ] Client details page
- [ ] Session notes timeline
- [ ] Progress tracking
- [ ] Client tags system
- [ ] Add/edit client notes
- [ ] Assign resources to clients

**Backend:**
- [ ] All client endpoints
- [ ] Notes encryption
- [ ] Timeline query optimization

---

### Phase 4: Notifications System
**Duration:** 1-2 weeks
**Priority:** 🟡 Medium

**Tasks:**
- [ ] Socket.IO integration
- [ ] Real-time notification updates
- [ ] Notifications dropdown UI
- [ ] Notification types & icons
- [ ] Mark as read functionality
- [ ] Unread count badge
- [ ] Notification settings

**Backend:**
- [ ] Socket.IO server setup
- [ ] Notification service
- [ ] Event emitters for triggers
- [ ] Notification persistence

---

### Phase 5: Messaging System
**Duration:** 2-3 weeks
**Priority:** 🟡 Medium

**Tasks:**
- [ ] Conversations list
- [ ] Chat interface
- [ ] Real-time messaging (Socket.IO)
- [ ] File attachments
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message templates
- [ ] Unread badges

**Backend:**
- [ ] Message endpoints
- [ ] Conversation management
- [ ] File upload for attachments
- [ ] Message encryption

---

### Phase 6: Profile & Availability Settings
**Duration:** 1-2 weeks
**Priority:** 🟡 Medium

**Tasks:**
- [ ] Therapist profile edit form
- [ ] Avatar upload
- [ ] Availability schedule UI
- [ ] Working hours settings
- [ ] Block dates (vacation)
- [ ] Session types & pricing
- [ ] Save & validate changes

**Backend:**
- [ ] Availability endpoints
- [ ] Profile update endpoints
- [ ] Slot generation logic

---

### Phase 7: Search & Filters
**Duration:** 1 week
**Priority:** 🟡 Medium

**Tasks:**
- [ ] Global search component
- [ ] Advanced filter UI
- [ ] Filter state management
- [ ] URL query params for filters
- [ ] Debounced search
- [ ] Filter presets

**Backend:**
- [ ] Search query optimization
- [ ] Filter logic in endpoints
- [ ] Pagination support

---

### Phase 8: Analytics & Reports
**Duration:** 2 weeks
**Priority:** 🟢 Low

**Tasks:**
- [ ] Analytics dashboard
- [ ] Charts (revenue, sessions, clients)
- [ ] Key metrics cards
- [ ] Date range picker
- [ ] Export to PDF
- [ ] Email scheduled reports

**Backend:**
- [ ] Analytics aggregation endpoints
- [ ] Report generation
- [ ] Chart data formatting

---

### Phase 9: Resource Management
**Duration:** 1-2 weeks
**Priority:** 🟢 Low

**Tasks:**
- [ ] Resources library UI
- [ ] File upload component
- [ ] Folder/category management
- [ ] Tag system
- [ ] Search resources
- [ ] Assign to clients
- [ ] Usage tracking

**Backend:**
- [ ] Resource CRUD endpoints
- [ ] File storage integration
- [ ] Access control

---

### Phase 10: Client Portal
**Duration:** 2-3 weeks
**Priority:** 🟢 Low

**Tasks:**
- [ ] Client dashboard
- [ ] Session booking flow
- [ ] Pre-session forms
- [ ] Resource library (client view)
- [ ] Payment integration
- [ ] Progress charts (client view)
- [ ] Review submission

**Backend:**
- [ ] Client-specific endpoints
- [ ] Booking logic
- [ ] Form management
- [ ] Payment processing

---

### Phase 11: Security & Permissions
**Duration:** 1 week
**Priority:** 🔴 High (Parallel with other phases)

**Tasks:**
- [ ] Role-based guards
- [ ] Route protection
- [ ] Data encryption
- [ ] Audit logging
- [ ] Session timeout
- [ ] CSRF protection

**Backend:**
- [ ] Auth guards
- [ ] Permission checks
- [ ] Encryption middleware
- [ ] Audit log service

---

### Phase 12: Admin Approval System
**Duration:** 1 week
**Priority:** 🔴 High

**Tasks:**
- [ ] Admin dashboard for therapist approvals
- [ ] Therapist list with status
- [ ] Approve/reject actions
- [ ] View therapist applications
- [ ] Email notifications
- [ ] Approval history

**Backend:**
- [ ] Admin endpoints
- [ ] Approval workflow
- [ ] Email templates

---

## 7. File Structure

### Frontend Structure
```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── SearchInput.jsx
│   ├── dashboard/
│   │   ├── WelcomeBanner.jsx
│   │   ├── QuickStats.jsx
│   │   ├── TodaySessions.jsx
│   │   ├── NotificationsBell.jsx
│   │   ├── QuickActions.jsx
│   │   ├── RecentClients.jsx
│   │   └── EarningsCard.jsx
│   ├── sessions/
│   │   ├── SessionsList.jsx
│   │   ├── SessionCard.jsx
│   │   ├── SessionModal.jsx
│   │   ├── SessionForm.jsx
│   │   └── SessionFilters.jsx
│   ├── calendar/
│   │   ├── CalendarView.jsx
│   │   ├── DayView.jsx
│   │   ├── WeekView.jsx
│   │   ├── MonthView.jsx
│   │   └── CalendarHeader.jsx
│   ├── clients/
│   │   ├── ClientsList.jsx
│   │   ├── ClientCard.jsx
│   │   ├── ClientDetails.jsx
│   │   ├── ClientTimeline.jsx
│   │   └── ClientNotes.jsx
│   ├── messaging/
│   │   ├── ConversationsList.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   └── MessageInput.jsx
│   ├── analytics/
│   │   ├── AnalyticsOverview.jsx
│   │   ├── RevenueChart.jsx
│   │   ├── SessionsChart.jsx
│   │   └── MetricsCards.jsx
│   ├── resources/
│   │   ├── ResourcesLibrary.jsx
│   │   ├── ResourceCard.jsx
│   │   ├── ResourceUpload.jsx
│   │   └── ResourceFolder.jsx
│   └── layout/
│       ├── DashboardLayout.jsx
│       ├── Sidebar.jsx
│       └── TopBar.jsx
├── pages/
│   ├── TherapistDashboard.jsx
│   ├── SessionsPage.jsx
│   ├── ClientsPage.jsx
│   ├── ClientDetailsPage.jsx
│   ├── CalendarPage.jsx
│   ├── MessagesPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── ResourcesPage.jsx
│   ├── ProfileSettingsPage.jsx
│   └── AvailabilitySettingsPage.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── ToastContext.jsx
│   └── SocketContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useSocket.js
│   ├── useNotifications.js
│   └── useFetch.js
├── services/
│   ├── api.js
│   ├── therapistApi.js
│   ├── sessionsApi.js
│   ├── clientsApi.js
│   ├── messagesApi.js
│   └── notificationsApi.js
├── utils/
│   ├── errorCodes.js
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
├── styles/
│   ├── App.css
│   └── components/
└── pages/ (existing pages)
```

### Backend Structure
```
backend/src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   └── strategies/
├── users/
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   └── schemas/
├── therapist/
│   ├── therapist.controller.ts
│   ├── therapist.service.ts
│   ├── therapist.module.ts
│   └── dto/
├── sessions/
│   ├── sessions.controller.ts
│   ├── sessions.service.ts
│   ├── sessions.module.ts
│   └── schemas/
├── clients/
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   ├── clients.module.ts
│   └── schemas/
├── availability/
│   ├── availability.controller.ts
│   ├── availability.service.ts
│   ├── availability.module.ts
│   └── schemas/
├── reviews/
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   ├── reviews.module.ts
│   └── schemas/
├── analytics/
│   ├── analytics.controller.ts
│   ├── analytics.service.ts
│   └── analytics.module.ts
├── messages/
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   ├── messages.module.ts
│   ├── schemas/
│   └── messages.gateway.ts (Socket.IO)
├── notifications/
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── notifications.module.ts
│   ├── schemas/
│   └── notifications.gateway.ts
├── resources/
│   ├── resources.controller.ts
│   ├── resources.service.ts
│   ├── resources.module.ts
│   └── schemas/
├── admin/
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.module.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── middleware/
├── modules/
│   ├── email/
│   ├── hash/
│   ├── upload/
│   └── redis-cache/
└── app.module.ts
```

---

## 8. Component Specifications

### 8.1 WelcomeBanner Component
**Props:**
- therapistName: string
- specialty: string
- rating: number
- profileImage?: string
- stats: { sessionsToday: number, pendingRequests: number, activeClients: number }

**Features:**
- Greeting based on time of day
- Profile image with fallback to initials
- Star rating display
- Quick stats badges
- Responsive layout

---

### 8.2 TodaySessions Component
**Props:**
- sessions: Session[]
- onSessionClick: (sessionId: string) => void
- onReschedule: (sessionId: string) => void
- onCancel: (sessionId: string) => void

**Features:**
- List of today's sessions
- Time, client name, type badges
- Status color coding
- Quick action buttons
- Empty state message
- Loading skeleton

---

### 8.3 NotificationsBell Component
**Props:**
- notifications: Notification[]
- unreadCount: number
- onNotificationClick: (notification: Notification) => void
- onMarkAllRead: () => void

**Features:**
- Bell icon with badge
- Dropdown panel
- Notification list with icons
- Time ago display
- Mark as read on click
- Mark all as read button

---

### 8.4 CalendarView Component
**Props:**
- sessions: Session[]
- availability: Availability[]
- viewMode: 'day' | 'week' | 'month'
- onViewChange: (view: ViewMode) => void
- onDateChange: (date: Date) => void
- onSlotClick: (dateTime: Date) => void
- onSessionClick: (sessionId: string) => void

**Features:**
- Three view modes
- Navigation (prev/next)
- Today button
- Session blocks with color coding
- Available slots highlighting
- Click to create/edit

---

### 8.5 ClientsList Component
**Props:**
- clients: Client[]
- searchQuery: string
- filters: ClientFilters
- onClientClick: (clientId: string) => void
- onSearchChange: (query: string) => void
- onFilterChange: (filters: ClientFilters) => void

**Features:**
- Search input
- Filter dropdowns
- Sort options
- Client cards with progress indicators
- Pagination
- Empty state

---

### 8.6 ClientTimeline Component
**Props:**
- clientId: string
- sessions: Session[]
- notes: ClientNote[]

**Features:**
- Chronological timeline
- Session cards with expandable notes
- Progress indicators
- Add note button
- Edit/delete own notes
- Attachment preview

---

### 8.7 ChatWindow Component
**Props:**
- conversation: Conversation
- messages: Message[]
- onSendMessage: (content: string, attachments?: File[]) => void
- onMarkRead: (conversationId: string) => void

**Features:**
- Message list with scroll
- Message bubbles (sent/received)
- Typing indicator
- File attachment preview
- Emoji picker (future)
- Quick reply templates

---

### 8.8 AnalyticsOverview Component
**Props:**
- metrics: AnalyticsMetrics
- dateRange: { start: Date, end: Date }
- onDateRangeChange: (range: DateRange) => void

**Features:**
- Metrics cards with trends
- Revenue line chart
- Session types pie chart
- Client growth chart
- Export button
- Date range picker

---

## 9. Getting Started Checklist

### Initial Setup
- [ ] Install required dependencies (charts, calendar, etc.)
- [ ] Set up Socket.IO client
- [ ] Create API service files
- [ ] Set up React Query/SWR for data fetching
- [ ] Configure TypeScript types

### Backend Setup
- [ ] Create new modules (sessions, clients, etc.)
- [ ] Define Mongoose schemas
- [ ] Implement CRUD services
- [ ] Set up Socket.IO server
- [ ] Create auth guards for therapist routes

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] E2E tests for critical flows
- [ ] Load testing for Socket.IO

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component documentation (Storybook)
- [ ] User guide for therapists
- [ ] Admin guide for approvals

---

## 10. Notes & Considerations

### Performance
- Implement pagination for large lists
- Use virtual scrolling for long timelines
- Cache frequently accessed data (Redis)
- Optimize MongoDB queries with indexes
- Lazy load components

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators

### Internationalization
- RTL support (Arabic)
- Date/time formatting (Hijri optional)
- Number formatting
- Currency formatting
- Translation ready strings

### Mobile Responsiveness
- Mobile-first design
- Touch-friendly interactions
- Collapsible sidebar
- Bottom navigation for mobile
- Swipe gestures (future)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 20, 2026 | Development Team | Initial comprehensive plan |

---

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Weekly progress reviews
5. Adjust timeline based on feedback
