# Waey Journey Feature Documentation

## Overview
The Waey Journey feature is a structured 4-level progression system where users complete resources (books, articles, videos) at each level before advancing to the next. It provides a guided learning path for mental health education.

## Architecture

### Backend (NestJS)

#### Schemas

1. **Journey Schema** (`journey.schema.ts`)
   - `name`: Journey name (Arabic)
   - `description`: Short description
   - `longDescription`: Detailed description
   - `levels`: Array of 4 levels
     - `levelNumber`: 1-4
     - `name`: Level name
     - `description`: Level description
     - `resources`: Array of resources
       - `resourceType`: 'article' | 'video' | 'book'
       - `resourceId`: Reference to actual resource
       - `isMandatory`: Whether resource must be completed
       - `order`: Suggested completion order
     - `color`: Level color
     - `icon`: FontAwesome icon
   - `isActive`: Whether journey is active
   - `estimatedDuration`: Estimated days to complete

2. **User Journey Progress Schema** (`user-journey-progress.schema.ts`)
   - `userId`: Reference to User
   - `journeyId`: Reference to Journey
   - `currentLevel`: User's current level (1-4)
   - `startedAt`: When user started journey
   - `completedAt`: When user completed all levels
   - `isCompleted`: Whether all 4 levels are done
   - `levelProgress`: Array of level progress
     - `levelNumber`: Level number
     - `startedAt`: When level was started
     - `completedAt`: When level was completed
     - `isCompleted`: Whether level is done
     - `completedResources`: Resources marked complete
     - `progressPercentage`: 0-100%
   - `overallProgress`: 0-100%

#### API Endpoints

**Public/User Routes:**
```
GET    /api/journey                         - Get active journey
GET    /api/journey/:id                     - Get journey by ID
GET    /api/journey/progress                - Get user's all progress
GET    /api/journey/:id/progress            - Get progress for specific journey
POST   /api/journey/:id/start               - Start journey
POST   /api/journey/:id/levels/:num/complete-resource  - Mark resource complete
POST   /api/journey/:id/levels/:num/complete           - Mark level complete
```

**Admin Routes (require JWT):**
```
POST   /api/journey/admin                   - Create journey
PATCH  /api/journey/admin/:id               - Update journey
DELETE /api/journey/admin/:id               - Delete journey
GET    /api/journey/admin/all               - Get all journeys
```

#### Business Logic

1. **Sequential Progression**: Users must complete level 1 before unlocking level 2, etc.
2. **Resource Tracking**: Each resource completion is tracked with timestamp
3. **Auto Level Completion**: Level auto-completes when all mandatory resources are done
4. **Progress Calculation**: Progress percentage calculated based on completed vs total resources
5. **Journey Completion**: All 4 levels must be completed for journey completion

### Frontend (React + Vite)

#### Components

1. **JourneyPage** (`/journey`)
   - Main journey entrance page
   - Shows journey overview with roadmap visualization
   - Displays all 4 levels as nodes on a path
   - Shows progress for each level
   - Locked/current/completed states

2. **JourneyLevelPage** (`/journey/:journeyId/level/:levelNumber`)
   - Level detail view
   - Shows all resources for the level
   - Resource cards with completion checkboxes
   - Progress ring showing completion percentage
   - Complete level button

3. **UI Components** (in `/components/journey/`)
   - `ProgressRing.jsx`: Circular progress indicator
   - `LevelNode.jsx`: Level node for roadmap view
   - `ResourceCard.jsx`: Resource card with completion toggle
   - `CelebrationModal.jsx`: Celebration popup with confetti

#### State Management

- **JourneyContext**: Provides journey data and mutations
  - Uses TanStack React Query for server state
  - Provides `startJourney`, `completeResource`, `completeLevel` functions
  - Tracks loading, error, and progress states

#### Visual Design

- **Rich & Immersive**: Each level has unique color theme
- **Roadmap Metaphor**: Levels displayed as connected nodes on a path
- **Animations**: Framer Motion for smooth transitions
- **Celebrations**: Confetti on level/journey completion
- **Status Indicators**: Lock icons, checkmarks, progress rings

## Setup & Usage

### 1. Seed the Journey

Run the seed script to create the initial journey:

```bash
cd backend
node seed-journey.js
```

This creates a journey with 4 levels and placeholder resource IDs.

### 2. Update Resource IDs

After seeding, update the resource IDs in the journey with actual articles/videos/books from your database:

```javascript
// In MongoDB or using admin API
journey.levels[0].resources[0].resourceId = ObjectId("actual-article-id");
```

### 3. Access the Journey

Users can access the journey at: `/journey`

### 4. Navigation

- `/journey` - Main journey page with roadmap
- `/journey/:journeyId/level/:levelNumber` - Level detail page

## Future Enhancements

1. **Auto-detection**: Auto-detect article reading completion
2. **Notifications**: Send notifications on level completion
3. **Dashboard Integration**: Show journey progress on user dashboard
4. **Multiple Journeys**: Support category-specific journeys
5. **Leaderboard**: Gamification with user rankings
6. **Badges**: Achievement badges for milestones
7. **Social Sharing**: Share completion certificates

## Technical Notes

- All API responses include Arabic error messages
- JWT authentication required for progress tracking
- Compound index on (userId, journeyId) for efficient queries
- Frontend uses RTL layout for Arabic support
- Responsive design for mobile/tablet/desktop

## File Structure

```
backend/src/journey/
├── schemas/
│   ├── journey.schema.ts
│   └── user-journey-progress.schema.ts
├── dto/
│   └── journey.dto.ts
├── controllers/
│   └── journey.controller.ts
├── services/
│   └── journey.service.ts
└── journey.module.ts

frontend/src/
├── pages/
│   ├── JourneyPage.jsx
│   └── JourneyLevelPage.jsx
├── components/journey/
│   ├── ProgressRing.jsx
│   ├── LevelNode.jsx
│   ├── ResourceCard.jsx
│   └── CelebrationModal.jsx
├── context/
│   └── JourneyContext.jsx
└── services/
    └── journeyApi.js
```

## Testing Checklist

- [ ] Backend builds without errors ✅
- [ ] Frontend builds without errors ✅
- [ ] Seed script creates journey
- [ ] User can start journey
- [ ] Resources can be marked complete
- [ ] Level progress calculates correctly
- [ ] Levels unlock sequentially
- [ ] Celebration modal shows on completion
- [ ] Journey page shows roadmap correctly
- [ ] Level detail page shows all resources
- [ ] Mobile responsive design works
- [ ] RTL layout correct for Arabic
