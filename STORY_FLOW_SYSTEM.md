# Story Flow System

## Overview

The game has an automated story progression system that manages the flow between cutscenes and emails based on both automatic progression and gameplay triggers.

## Story Structure

The game is divided into distinct phases:

### Phase 0: INTRO (Automatic)
1. Intro cutscene → Rector email → Narrative bridge → IT Expert email → Firewall warning cutscene
2. After this phase, progression is driven by player actions

### Phase 1-4: Gameplay-Triggered Events
- Emails and cutscenes trigger based on specific game achievements
- Player must complete puzzles to progress
- Story Manager provides helper methods to trigger events

## How It Works

### Story Manager (`utils/storyFlow.ts`)

The `StoryManager` class handles both automatic and manual story progression:
- **Automatic**: Intro sequence plays without user input
- **Manual**: Gameplay actions trigger specific story events

### Story Flow Types

1. **Automatic Flow** (Phase 0 only):
   - Cutscenes auto-advance when completed
   - Emails appear automatically
   - User must mark emails as read to continue

2. **Triggered Flow** (Phases 1-4):
   - Events triggered by game actions
   - Use `storyManager.triggerEvent(eventKey)` to activate
   - Predefined triggers in `STORY_TRIGGERS` constant

## Story Event Triggers

The game uses these triggers to activate story events:

```typescript
STORY_TRIGGERS = {
    // Phase 1: Getting Started
    FIREWALL_PASSWORD_FAILED: "email_it_expert_2",    // Email hint about passwords
    STUDENT_PASSWORD_FOUND: "email_it_expert_3",      // Email about hints system
    
    // Phase 2: Breaking the Network
    FIREWALL_1_BEATEN: "email_it_expert_4",           // Email about routers
    
    // Phase 3: The Investigation
    FIREWALL_2_BEATEN: "email_it_expert_5",           // Email about logs
    
    // Phase 4: The Payload
    FIREWALL_3_BEATEN: "email_it_expert_7",           // Email about files
    NEED_FIREWALL_4_HINT: "email_it_expert_6",        // Email about firewall 4
    
    // Finale
    BOTNET_DELETED: "cutscene_victory"                // Victory cutscene
}
```

## Usage in Game Code

### Triggering Story Events

When a player completes a game action:

```typescript
import { STORY_TRIGGERS } from './utils/storyFlow';

// Example: Player beats firewall level 1
if (firewallLevel1Deactivated) {
    storyManagerRef.current.triggerEvent(STORY_TRIGGERS.FIREWALL_1_BEATEN);
    setProgress(prev => ({
        ...prev,
        currentStoryEvent: storyManagerRef.current.getCurrentEventKey()
    }));
}
```

### Complete Flow Example

```typescript
// In SQLDatabase.tsx or game logic:

// When player fails firewall password
if (passwordIncorrect && firstAttempt) {
    storyManagerRef.current.triggerEvent(STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED);
}

// When player finds student password
if (queryFound_StudentPassword) {
    storyManagerRef.current.triggerEvent(STORY_TRIGGERS.STUDENT_PASSWORD_FOUND);
}

// When player beats firewall level
if (firewallDeactivated && level === 1) {
    storyManagerRef.current.triggerEvent(STORY_TRIGGERS.FIREWALL_1_BEATEN);
}
```

## Story Flow Diagram

```
PHASE 0 (AUTO):
Game Start → [Intro Cutscene] → Rector Email → [Read] → 
[Narrative Bridge] → IT Expert Email → [Read] → [Firewall Warning]
                                                              ↓
PHASE 1 (TRIGGERED):                                    [Player Plays]
                                                              ↓
                                        Player fails password → Email 3 (Hint)
                                                              ↓
                                        Player finds student → Email 4 (Hints System)
                                                              ↓
                                      Player beats Firewall 1 → Email 5 (Routers)
                                                              ↓
PHASE 2:                                              [Player Plays]
                                                              ↓
                                      Player beats Firewall 2 → Email 6 (Logs)
                                                              ↓
PHASE 3:                                              [Player Plays]
                                                              ↓
                                      Player beats Firewall 3 → Email 7 (Files)
                                                              ↓
PHASE 4:                                              [Player Plays]
                                                              ↓
                                      Player needs hint → Email about Firewall 4
                                                              ↓
                                      Player deletes botnet → [Victory Cutscene]
                                                              ↓
                                                          GAME END
```

## Adding New Story Events

To extend the story, add events to the `storyFlow` object in `utils/storyFlow.ts`:

```typescript
export const storyFlow: StoryChain = {
    // ... existing events ...
    
    // Example: Add a new cutscene after an email
    new_cutscene_event: {
        type: "cutscene",
        id: "new_cutscene_id", // Must match cutscene ID in state.ts
        nextEvent: "next_email_event"
    },
    
    // Example: Add a new email
    next_email_event: {
        type: "email",
        id: "new_email_id", // Must match email ID in state.ts
        nextEvent: "wait_next_email"
    },
    
    // Always add a wait event after an email
    wait_next_email: {
        type: "wait_for_email_read",
        id: "new_email_id", // Same as email ID above
        nextEvent: null // Or next event ID
    }
};
```

## Components

### App.tsx
- Creates `StoryManager` instance on mount
- Checks for story progression in `useEffect`
- Updates state when events complete
- Exposes `storyManagerRef` for gameplay triggers

### EmailClient.tsx
- Shows "Mark as Read" button for unread emails
- Button triggers `onMarkAsRead` callback
- Shows "Email marked as read" status after reading

### Cutscene.tsx
- Marks cutscene as viewed when completed
- Triggers story progression on complete/skip

### SQLDatabase.tsx (Game Logic)
- Should trigger story events based on player actions
- Uses `STORY_TRIGGERS` constants
- Updates `currentStoryEvent` in state

## State Structure

```typescript
state = {
    currentStoryEvent: "start", // Current position in story
    
    emails: {
        rector_1: { shown: false, read: false },
        it_expert_1: { shown: false, read: false },
        it_expert_2: { shown: false, read: false },
        it_expert_3: { shown: false, read: false },
        it_expert_4: { shown: false, read: false },
        it_expert_5: { shown: false, read: false },
        it_expert_6: { shown: false, read: false },
        it_expert_7: { shown: false, read: false }
    },
    
    cutscenes: {
        intro: { id: "intro", content: "...", viewed: false },
        narrative_bridge: { id: "narrative_bridge", content: "...", viewed: false },
        firewall_warning: { id: "firewall_warning", content: "...", viewed: false },
        victory: { id: "victory", content: "...", viewed: false }
    },
    
    storyProgress: {
        firewall_1_beaten: false,
        firewall_2_beaten: false,
        firewall_3_beaten: false,
        firewall_4_beaten: false,
        // ... other progress flags
    }
}
```

## Game Phases

### Phase 0: INTRO (Automatic)
**Purpose**: Set the scene and brief the player
**Events**: 
- Intro cutscene
- Rector email (call to adventure)
- Narrative bridge (acceptance)
- IT Expert email (briefing)
- Firewall warning (focus)

**Triggers**: All automatic, player just marks emails as read

### Phase 1: Getting Started (Tutorial)
**Purpose**: Teach basic SQL and game mechanics
**Puzzles**: 
- Find student password
- Access PC files
- Disable firewall level 1

**Story Triggers**:
- Password failure → Hint email
- Student found → Hints system email

### Phase 2: Breaking the Network
**Purpose**: Escalate difficulty with hashing and router puzzles
**Puzzles**:
- Decrypt passwords
- Find router IPs
- Calculate router password
- Disable firewall level 2

**Story Triggers**:
- Firewall 1 beaten → Router email

### Phase 3: The Investigation
**Purpose**: Use logs to identify the botnet source
**Puzzles**:
- Access router 2 logs
- Analyze traffic patterns
- Identify infected PC
- Disable firewall level 3

**Story Triggers**:
- Firewall 2 beaten → Logs email

### Phase 4: The Payload
**Purpose**: Logic puzzles and final challenges
**Puzzles**:
- Dynamic hashing
- Recursive directory search
- Logic puzzle (virus detection)
- Disable firewall level 4
- Delete botnet

**Story Triggers**:
- Firewall 3 beaten → Files email
- (Optional) Need hint → Firewall 4 email
- Botnet deleted → Victory cutscene

## Testing the Flow

### Automatic Intro (Phase 0)
1. Start game
2. Watch intro cutscene
3. Rector email appears → Mark as read
4. Narrative bridge plays
5. IT Expert email appears → Mark as read
6. Firewall warning plays
7. Player can now interact with terminal

### Triggered Events (Phases 1-4)
You'll need to implement these triggers in your game logic:

```typescript
// Example implementation in SQLDatabase component
const handleQueryResult = (query: string, result: any) => {
    // Check for story triggers
    if (query.includes('UPDATE Firewall') && passwordWrong) {
        storyManagerRef.current.triggerEvent(STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED);
    }
    
    if (result.includes('student') && query.includes('password')) {
        storyManagerRef.current.triggerEvent(STORY_TRIGGERS.STUDENT_PASSWORD_FOUND);
    }
    
    // Update state with new story event
    setProgress(prev => ({
        ...prev,
        currentStoryEvent: storyManagerRef.current.getCurrentEventKey()
    }));
}
```

## Admin Panel Integration

The Admin Panel allows developers to:
- Manually trigger any email
- Manually trigger any cutscene
- Reset the game (preserves username)
- View current state including `currentStoryEvent`
