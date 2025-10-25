# Quest Completion & Archiving System

## Overview
This system automatically manages the lifecycle of quests from creation through completion and archiving, ensuring completed quests are eventually removed from the main quest feed while preserving their data for historical reference.

## Quest Lifecycle Stages

### 1. Active (`status: 'active'`)
- Default state when quest is created
- Visible in main quest feed (`GET /api/quests`)
- Users can submit proof and complete these quests
- Real-time updates via SSE

### 2. Completed (`status: 'completed'`)
- Triggered when:
  - Quest reaches `maxCompletions` (if set)
  - OR manually marked complete by admin
- Still in main Quest collection
- Scheduled for archiving after `autoArchiveAfter` duration (default: 24 hours)
- Emits `QUEST_UPDATED` real-time event

### 3. Archived (`status: 'archived'`)
- Moved to `CompletedQuest` collection
- Removed from main quest feed
- Accessible via `GET /api/quests/completed`
- Preserves all completion history
- Emits `QUEST_ARCHIVED` real-time event

## Database Schema Changes

### Quest Model (Updated)
```typescript
{
  // ... existing fields ...
  status: 'active' | 'completed' | 'archived', // NEW
  completionCount: Number, // NEW - tracks how many users completed it
  maxCompletions: Number, // NEW - optional limit (null = unlimited)
  autoArchiveAfter: Number, // NEW - milliseconds before archiving (default 24h)
  completedAt: Date, // NEW - when quest was marked completed
  archivedAt: Date, // NEW - when quest was archived
}
```

### CompletedQuest Model (NEW)
```typescript
{
  originalQuestId: ObjectId, // Reference to original quest
  title: String,
  description: String,
  category: String,
  impactPoints: Number,
  totalCompletions: Number,
  completedBy: [{
    walletAddress: String,
    completedAt: Date,
    pointsEarned: Number
  }],
  questCompletedAt: Date,
  archivedAt: Date,
  questCreatedAt: Date
}
```

## API Endpoints

### Modified Endpoints

#### `GET /api/quests`
**Changes**: Now filters out archived quests
```javascript
// Query: { isActive: true, status: { $ne: 'archived' } }
// Returns only active and completed (not yet archived) quests
```

#### `POST /api/submit-proof`
**New Behavior**:
1. On verified submission:
   - Increments `quest.completionCount`
   - Checks if `maxCompletions` reached
   - If yes:
     - Sets `quest.status = 'completed'`
     - Sets `quest.completedAt = new Date()`
     - Schedules archiving after `autoArchiveAfter` ms
   - Emits `QUEST_COMPLETED` event with status info
   - If completed, also emits `QUEST_UPDATED` event

### New Endpoints

#### `GET /api/quests/completed`
Retrieve archived/completed quests

**Query Parameters**:
- `category` - Filter by category
- `limit` - Results per page (default: 50)
- `skip` - Pagination offset (default: 0)
- `walletAddress` - Filter quests completed by specific user

**Response**:
```json
{
  "success": true,
  "quests": [...],
  "count": 10,
  "totalCount": 50,
  "hasMore": true
}
```

#### `POST /api/cron/archive-quests`
Manually trigger archiving of completed quests (cron job endpoint)

**Authentication**: Bearer token via `CRON_SECRET` env variable

**Process**:
1. Finds all quests with `status: 'completed'`
2. Checks if `completedAt + autoArchiveAfter < now`
3. For expired quests:
   - Creates `CompletedQuest` record
   - Updates original quest to `status: 'archived'`
   - Emits `QUEST_ARCHIVED` real-time event

**Response**:
```json
{
  "success": true,
  "message": "Archived 5 quests (0 failures)",
  "archived": 5,
  "failed": 0,
  "results": [...]
}
```

#### `GET /api/cron/archive-quests`
Check how many quests are pending archiving (monitoring endpoint)

**Response**:
```json
{
  "success": true,
  "pendingArchive": 3,
  "quests": [
    {
      "id": "...",
      "title": "...",
      "completedAt": "2024-01-15T10:00:00Z",
      "timeUntilArchive": 0
    }
  ]
}
```

## Real-Time Events

### New Event: `QUEST_ARCHIVED`
```typescript
{
  event: 'quest:archived',
  data: {
    quest: {...}, // Original quest object with archived status
    archivedQuest: {...}, // New CompletedQuest record
    timestamp: 1234567890
  }
}
```

### Modified Event: `QUEST_COMPLETED`
Now includes status information:
```typescript
{
  event: 'quest:completed',
  data: {
    questId: '...',
    walletAddress: '...',
    pointsEarned: 50,
    questStatus: 'completed', // NEW
    completionCount: 10, // NEW
    maxCompletions: 10, // NEW
    timestamp: 1234567890
  }
}
```

## How to Use

### Setting Completion Limits
When creating a quest via `POST /api/quests`:
```json
{
  "title": "Limited Quest",
  "description": "...",
  "maxCompletions": 100, // Quest completes after 100 users
  "autoArchiveAfter": 3600000, // Archive 1 hour after completion (in ms)
  // ... other fields
}
```

### Setting Up Cron Job
For automatic archiving, set up a scheduled task to call:
```bash
curl -X POST https://your-domain.com/api/cron/archive-quests \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Recommended frequency: Every 1 hour

### Environment Variables
Add to `.env.local`:
```
CRON_SECRET=your-secure-random-string-here
```

### React Component Example
```typescript
import { useRealtime } from '@/hooks/useRealtime';

function QuestList() {
  const [quests, setQuests] = useState([]);

  useRealtime('quest:archived', (data) => {
    // Remove archived quest from list
    setQuests(prev => prev.filter(q => q._id !== data.quest._id));
    console.log('Quest archived:', data.quest.title);
  });

  return (
    // ... your quest list UI
  );
}
```

## Testing

### 1. Test Quest Completion
```bash
# Submit proof for a quest with maxCompletions set
POST /api/submit-proof
{
  "walletAddress": "0x...",
  "questId": "...",
  "imageData": "data:image/..."
}

# Check if quest status updated to 'completed'
```

### 2. Test Manual Archiving
```bash
# Wait for autoArchiveAfter duration, then:
POST /api/cron/archive-quests
Authorization: Bearer YOUR_CRON_SECRET

# Verify quest moved to CompletedQuest collection
GET /api/quests/completed
```

### 3. Test Real-Time Updates
1. Open `/test-realtime` page
2. Subscribe to `quest:archived` events
3. Trigger archiving
4. Verify event received in real-time

## Notes
- **Real-time preservation**: All existing real-time features remain unchanged
- **Backward compatibility**: Quests without `maxCompletions` will never auto-complete
- **Default archiving**: 24 hours after completion (configurable per quest)
- **Data retention**: Completed quests stored permanently in `CompletedQuest` collection
- **Performance**: Archived quests excluded from main queries, improving performance
