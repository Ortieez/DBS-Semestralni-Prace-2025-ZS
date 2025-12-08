# Story Trigger Implementation Guide

## Quick Reference

This guide shows where and how to trigger story events during gameplay.

## Import Required

```typescript
import { STORY_TRIGGERS } from '../utils/storyFlow';
```

## Access Story Manager

The `storyManagerRef` should be passed down from `App.tsx` to components that need to trigger events.

```typescript
// In App.tsx
<SQLDatabase 
    storyManager={storyManagerRef.current}
    onStoryEventTrigger={(eventKey) => {
        storyManagerRef.current.triggerEvent(eventKey);
        setProgress(prev => ({
            ...prev,
            currentStoryEvent: storyManagerRef.current.getCurrentEventKey()
        }));
    }}
/>
```

## Trigger Points

### Phase 1: Getting Started

#### 1. First Firewall Password Failure
**When**: Player enters wrong password for firewall level 1
**Trigger**: `STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED`
**Email**: it_expert_2 (hint about student username)

```typescript
// In password validation logic
if (query.includes('UPDATE Firewall') && level === 1 && !passwordCorrect) {
    onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED);
}
```

#### 2. Student Password Found
**When**: Player successfully queries student password OR unlocks PC 1
**Trigger**: `STORY_TRIGGERS.STUDENT_PASSWORD_FOUND`
**Email**: it_expert_3 (hints system)

```typescript
// When player finds student password
if (query.includes('student') && result.password === 'student') {
    onStoryEventTrigger(STORY_TRIGGERS.STUDENT_PASSWORD_FOUND);
}
```

### Phase 2: Breaking the Network

#### 3. Firewall Level 1 Beaten
**When**: Player successfully deactivates firewall level 1
**Trigger**: `STORY_TRIGGERS.FIREWALL_1_BEATEN`
**Email**: it_expert_4 (routers and multi-level firewall)

```typescript
// After successful firewall update
if (firewallDeactivated && level === 1) {
    onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_1_BEATEN);
    setProgress(prev => ({
        ...prev,
        storyProgress: {
            ...prev.storyProgress,
            firewall_1_beaten: true
        }
    }));
}
```

### Phase 3: The Investigation

#### 4. Firewall Level 2 Beaten
**When**: Player successfully deactivates firewall level 2
**Trigger**: `STORY_TRIGGERS.FIREWALL_2_BEATEN`
**Email**: it_expert_5 (logs available)

```typescript
// After successful firewall update
if (firewallDeactivated && level === 2) {
    onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_2_BEATEN);
    setProgress(prev => ({
        ...prev,
        storyProgress: {
            ...prev.storyProgress,
            firewall_2_beaten: true
        }
    }));
}
```

### Phase 4: The Payload

#### 5. Firewall Level 3 Beaten
**When**: Player successfully deactivates firewall level 3
**Trigger**: `STORY_TRIGGERS.FIREWALL_3_BEATEN`
**Email**: it_expert_7 (files warning)

```typescript
// After successful firewall update
if (firewallDeactivated && level === 3) {
    onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_3_BEATEN);
    setProgress(prev => ({
        ...prev,
        storyProgress: {
            ...prev.storyProgress,
            firewall_3_beaten: true
        }
    }));
}
```

#### 6. Need Firewall 4 Hint (Optional)
**When**: Player attempts firewall level 4 or queries about it
**Trigger**: `STORY_TRIGGERS.NEED_FIREWALL_4_HINT`
**Email**: it_expert_6 (firewall 4 password hint)

```typescript
// When player queries firewall level 4
if (query.includes('WHERE level = 4') && !state.storyProgress.firewall_4_beaten) {
    onStoryEventTrigger(STORY_TRIGGERS.NEED_FIREWALL_4_HINT);
}
```

### Finale

#### 7. Botnet Deleted
**When**: Player successfully deletes the botnet file
**Trigger**: `STORY_TRIGGERS.BOTNET_DELETED`
**Cutscene**: Victory

```typescript
// After successful DELETE
if (query.includes('DELETE FROM Directories') && targetId === botnetFileId) {
    onStoryEventTrigger(STORY_TRIGGERS.BOTNET_DELETED);
    setProgress(prev => ({
        ...prev,
        storyProgress: {
            ...prev.storyProgress,
            deleted_botnet_script: true
        }
    }));
}
```

## Complete Example

```typescript
// In SQLDatabase.tsx

interface SQLDatabaseProps {
    storyManager: StoryManager | null;
    onStoryEventTrigger: (eventKey: string) => void;
    // ... other props
}

const SQLDatabase = ({ storyManager, onStoryEventTrigger, ... }: SQLDatabaseProps) => {
    const handleQueryExecution = (query: string, result: any) => {
        // Check for firewall updates
        if (query.includes('UPDATE Firewall')) {
            const level = extractFirewallLevel(query);
            const password = extractPassword(query);
            
            if (validateFirewallPassword(level, password)) {
                // Success
                toast.success(`Firewall level ${level} deactivated!`);
                
                // Trigger story events
                switch(level) {
                    case 1:
                        onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_1_BEATEN);
                        break;
                    case 2:
                        onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_2_BEATEN);
                        break;
                    case 3:
                        onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_3_BEATEN);
                        break;
                }
            } else {
                // Failure
                toast.error('ACCESS DENIED - Incorrect password');
                
                // First failure on level 1 triggers hint
                if (level === 1 && !hasFailedBefore) {
                    onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_PASSWORD_FAILED);
                }
            }
        }
        
        // Check for student password query
        if (query.includes('student') && query.includes('password')) {
            if (result && result.password === 'student') {
                onStoryEventTrigger(STORY_TRIGGERS.STUDENT_PASSWORD_FOUND);
            }
        }
        
        // Check for botnet deletion
        if (query.includes('DELETE FROM Directories')) {
            const fileId = extractFileId(query);
            if (fileId === botnetFileId) {
                toast.success('Botnet script deleted!');
                onStoryEventTrigger(STORY_TRIGGERS.BOTNET_DELETED);
            }
        }
    };
    
    // ... rest of component
};
```

## State Management

Always update both the story event AND the relevant progress flags:

```typescript
onStoryEventTrigger(STORY_TRIGGERS.FIREWALL_1_BEATEN);
setProgress(prev => ({
    ...prev,
    storyProgress: {
        ...prev.storyProgress,
        firewall_1_beaten: true
    },
    currentStoryEvent: storyManager.getCurrentEventKey()
}));
```

## Testing Triggers

Use the Admin Panel to:
1. Check current `currentStoryEvent` in State tab
2. Manually trigger emails for testing
3. Reset game to test full flow
4. View story progress flags

## Important Notes

- Triggers only work after Phase 0 (intro) completes
- Multiple triggers can fire in sequence
- Always update `currentStoryEvent` in state after triggering
- Use toast notifications to give player feedback
- Check story progress flags to avoid duplicate triggers
