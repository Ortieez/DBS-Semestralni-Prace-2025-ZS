# TUL Botnet Crisis - Project Architecture & Documentation

## 📋 Project Overview

**TUL Botnet Crisis** is an interactive educational cybersecurity game built with React + TypeScript + Vite. Players take on the role of a cybersecurity expert tasked with stopping a botnet attack on the Technical University of Liberec (TUL) network.

The application simulates a Windows 98-inspired desktop environment with multiple interactive applications (email client, SQL terminal, notepad, file manager) to guide players through a cybersecurity puzzle adventure.

---

## 🏗️ Architecture & Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Database**: sql.js (SQLite in JavaScript)
- **UI Components**: React WinBox (Windows-like containers)
- **Styling**: Tailwind CSS
- **State Management**: React hooks + localStorage
- **Notifications**: React Toastify
- **Package Manager**: npm/yarn

---

## 📁 Project Structure

```
web/
├── src/
│   ├── App.tsx                      # Main application component
│   ├── App.css                      # Global styles
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Base styles
│   ├── components/
│   │   ├── EmailClient.tsx          # Thunderbird-style email client
│   │   ├── AdminPanel.tsx           # Admin control panel
│   │   ├── SQLDatabase.tsx          # SQL terminal/database viewer
│   │   ├── Menu.tsx                 # Main menu (save/load/reset)
│   │   ├── LockScreen.tsx           # Login screen
│   │   ├── Notepad.tsx              # Text editor
│   │   ├── DesktopIcon.tsx          # Desktop application icons
│   │   └── hooks/
│   │       └── useInterval.tsx      # Custom hook for intervals
│   ├── utils/
│   │   ├── state.ts                 # Global game state definition
│   │   ├── progress.ts              # Save/load logic (localStorage)
│   │   ├── const.ts                 # Constants & keys
│   │   └── templateDB/
│   │       └── create.ts            # SQL template for database initialization
│   └── assets/                      # Images, icons, etc.
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## 🎮 Core Gameplay Flow

### 1. **Lock Screen** → Login
- Player enters a username
- State persists in `localStorage`
- Plays animated loading sequence before unlocking

### 2. **Desktop Environment**
- **5 Main Applications** (accessible via desktop icons):
  1. **📧 TULBird Mail** - Email client showing story hints
  2. **💻 SQL Terminal** - Database viewer/SQL executor
  3. **⚙️ Menu** - Save/Load/Reset progress
  4. **📝 Notepad** - Take notes (auto-saved)
  5. **⚙️ Admin Panel** - Developer controls (for testing/demoing)

### 3. **Progression System**
Players solve puzzles by:
- Reading emails with hints
- Executing SQL queries to find passwords, hints, and clues
- Tracking progress through story milestones
- Unlocking access to PCs and routers

---

## 📊 State Management (`utils/state.ts`)

The entire game state is managed by a single TypeScript type `State`:

```typescript
{
  username: string | null,           // Currently logged-in user
  
  storyProgress: {                   // Quest/puzzle completion flags
    firewall_1_beaten: boolean,      // 4 levels of firewall
    firewall_2_beaten: boolean,
    firewall_3_beaten: boolean,
    firewall_4_beaten: boolean,
    connected_to_main_ip: boolean,
    found_student_password: boolean,
    unlocked_pc_1: boolean,
    found_notes_list: boolean,
    read_any_hint: boolean,
    found_hashing_key: boolean,
    unhashed_level_1_passwords: boolean,
    found_router_password: boolean,
    unlocked_any_router: boolean,
    accessed_logs: boolean,
    identified_infected_pc: boolean,
    deleted_botnet_script: boolean    // Final victory condition
  },
  
  emails: {                          // Email status tracking
    rector_mail_1: { shown, read },
    it_expert_mail_1: { shown, read },
    // ... more emails
  },
  
  pcs: {                            // PC access & file tracking
    pc_1: { access_granted, files_viewed: [] },
    pc_2: { access_granted, files_viewed: [] },
    pc_3: { access_granted, files_viewed: [] }
  },
  
  routers: {                        // Router unlock status
    router_1: { ip, unlocked },
    router_2: { ip, unlocked }
  },
  
  misc: {                          // Passwords & collected data
    known_main_ip: "174.156.12.4",
    known_hashing_key: null,
    known_router_password: null,
    known_firewall_passwords: { f1, f2, f3, f4 }
  },
  
  cutscenes: {                     // Narrative scenes
    intro: { id, content, viewed }
  }
}
```

---

## 💾 Persistence Layer (`utils/progress.ts`)

**LocalStorage Keys**:
- `sqliteDb` - Compressed SQLite database (Base64)
- `gameProgress` - Game state JSON
- `notepadData` - Notepad content
- `lastSaveTime` - ISO timestamp of last save

**Key Functions**:
```typescript
save(db, state, notepad)        // Save everything to localStorage
load(SQL)                       // Load from localStorage
saveNotepad(data, showToast)   // Auto-save notepad content
clearProgress()                // Reset all progress
```

**Auto-save Behavior**:
- Notepad: Saves on every keystroke (debounced)
- Game State + DB: Saves every 5 minutes (when unlocked)
- On lock → unlock transitions: Immediate save

---

## 🎨 Components

### **EmailClient.tsx**
A Thunderbird-style email client for receiving story hints.
- **Left Panel**: Folder navigation (Inbox, Sent, Drafts, Spam, Trash)
- **Middle Panel**: Email list with sender/subject preview
- **Right Panel**: Full email detail view
- **Colors**: Thunderbird gray palette + blue accents
- **Props**: `readEmails`, `onEmailRead` callback

**Story Emails Included**:
1. **rector_mail_1**: Initial crisis alert
2. **it_expert_mail_1-5**: Progressive hints for SQL queries and passwords

---

### **AdminPanel.tsx**
Developer control panel for testing/demoing the game.
- **Tabs**: Emails, Cutscenes, Progress, State
- **Features**:
  - Trigger email showing/reading
  - View/trigger cutscenes
  - Toggle story progress flags
  - Grant PC & router access
  - Raw JSON state inspector
- **Theme**: Dark slate with cyan accents
- **No Indigo**: Uses cyan (`cyan-600`, `cyan-400`) instead

---

### **SQLDatabase.tsx**
Interactive SQL terminal connected to sql.js database.
- Execute arbitrary SQL queries
- View query results in tables
- Error handling & feedback
- Database initialized with template schema

---

### **Menu.tsx**
Main menu for save/load/reset operations.
- **Save Button**: Persists all progress to localStorage
- **Load Button**: Restores from last save
- **Reset Button**: Wipes all progress (with confirmation)
- **Last Save Time**: Displays timestamp of previous save

---

### **LockScreen.tsx**
Login screen with username persistence.
- Username saved to state + localStorage
- Animated loading sequence (dots bouncing)
- Fade-to-black transition before unlocking
- Gradient background (gray to black)

---

### **Notepad.tsx**
Simple text editor with Windows-style menus.
- **Features**: File menu, Edit/Format/View/Help stubs
- **Auto-save**: Debounced saves to localStorage
- **Status Bar**: Line/column counter, encoding display
- Retro Windows notepad aesthetic

---

### **DesktopIcon.tsx**
Clickable desktop icons for launching applications.
- Emoji + label display
- Hover effects
- Optional notification badge (for email count)

---

## 🔄 App.tsx - Main Application Flow

### State Variables
```typescript
isLocked              // Login screen visible
progress              // Current game state
showApp              // { mail, terminal, menu, notepad, admin }
readEmails           // Tracks which emails have been read
db                   // sql.js Database instance
sql                  // sql.js module
notepad              // Notepad content
loading              // Loading animation state
```

### Lifecycle Hooks
1. **On Mount**: Initialize sql.js, load from localStorage
2. **Every 5 min (if unlocked)**: Auto-save progress
3. **On Notepad Change**: Auto-save notepad content
4. **On Lock/Unlock**: Immediate save

### Window Management
```typescript
// Opening apps triggers:
1. Set loading = true
2. Display cursor = "wait"
3. Delay 800ms (simulates loading)
4. Toggle app visibility
5. Reset cursor

// Closing apps just hides the WinBox component
```

---

## 📧 Email System

**Static Emails** defined in `utils/state.ts`:

| Email ID | From | Subject | Content |
|----------|------|---------|---------|
| rector_1 | rector@tul.cz | !URGENT! University under attack | Intro + plea for help |
| it_expert_1 | itexpert@tul.cz | botnet | Main IP + firewall hint |
| it_expert_2 | itexpert@tul.cz | firewall | PC access hint |
| it_expert_3 | itexpert@tul.cz | notes | SQL query hints |
| it_expert_4 | itexpert@tul.cz | next step | Multi-level firewall warning |
| it_expert_5 | itexpert@tul.cz | next step | Log analysis encouragement |

**Email State Tracking**:
```typescript
emails: {
  [emailId]: {
    shown: boolean,  // Has email been displayed to user?
    read: boolean    // Has email been clicked/opened?
  }
}
```

---

## 🎯 Quest/Story Progression

The game is structured around completing these milestones:

1. **Find Student Password** → Unlock PC-1
2. **Read Hints List** → Learn about SQL queries
3. **Bypass 4 Firewalls** → Execute UPDATE queries
4. **Find Hashing Key** → Decrypt passwords
5. **Unhash Level 1 Passwords**
6. **Find Router Password** → Unlock routers
7. **Access Network Logs** → Identify infected PC
8. **Delete Botnet Script** → **VICTORY**

Each milestone is tracked as a boolean flag in `storyProgress`.

---

## 🗄️ Database Schema

Initialized via `CREATE_SQL_TEMPLATE` in `utils/templateDB/create.ts`:

Typical tables include:
- `Firewall` - Status of each firewall level
- `Hints` - Collection of clues and hints
- `Passwords` - Hashed and plaintext passwords
- `Logs` - Network activity logs
- `Routers` - Router information and status

*(Exact schema depends on CREATE_SQL_TEMPLATE implementation)*

---

## 🎨 Styling

### Tailwind CSS
- All components use Tailwind utility classes
- No custom CSS files (except App.css for global setup)
- Color palette:
  - **Primary**: Blue (`blue-500`, `blue-600`)
  - **Accent**: Cyan (`cyan-400`, `cyan-600`) - for admin panel
  - **Grays**: `gray-*` and `slate-*` scales
  - **Success**: Emerald (`emerald-300`, `emerald-900`)

### WinBox Windows
- Background colors set per window:
  - Mail: `#f3f4f6` (light gray)
  - Admin: `#0f172a` (dark slate)
  - Others: `#808080`, `#357EC7`, etc.
- Window title bar color set by WinBox parent

### Dark Mode
- Lock screen: Gradient (gray-900 → black)
- Admin panel: Slate-900 background
- Email client: Light gray (Thunderbird-style)

---

## 🔌 Custom Hooks

### `useInterval` (`components/hooks/useInterval.tsx`)
- Wrapper around `setInterval`
- Automatically cleans up on unmount
- Used for auto-save every 5 minutes

---

## 🚀 Development Tips

### Adding a New Feature
1. **Define State**: Add to `state.ts`
2. **Create Component**: New `.tsx` file in `components/`
3. **Import in App.tsx**: Add to window management
4. **Add Desktop Icon**: Create `DesktopIcon` in App.tsx
5. **Persist Data**: Update `save()` and `load()` in `progress.ts`

### Testing with Admin Panel
- Click **Admin** icon to open admin panel
- Use **Emails** tab to trigger emails
- Use **Progress** tab to skip story milestones
- Use **Cutscenes** tab to show narrative scenes
- Use **State** tab to inspect current game state

### Debugging
- Check browser DevTools Console for toast messages
- Use Admin Panel **State** tab to inspect game state
- LocalStorage values visible in DevTools Storage tab
- SQL Terminal can query database directly

---

## 🎪 User Flow Summary

```
1. Open app → Lock Screen
2. Enter username → Auto-loads saved progress
3. Desktop with 5 app icons
4. Read emails → Get puzzle hints
5. Open SQL Terminal → Query database
6. Find passwords → Unlock systems
7. Complete objectives → Advance story
8. Admin Panel → Test/skip puzzles (development only)
9. Menu → Save/Load/Reset progress
10. Delete botnet script → Victory!
```

---

## 📝 Notes for Developers

- **State immutability**: Always use spread operators when updating state
- **localStorage limits**: Database is Base64-encoded, watch size
- **SQL.js**: Single-threaded, suitable for educational purposes
- **TypeScript**: Strict mode enforced - take advantage of type safety
- **Tailwind**: No custom CSS needed - use utility classes
- **Performance**: Auto-save throttled to 5 minutes to avoid UI lag

---

## 🔮 Future Enhancement Ideas

- [ ] Add more email sequences for different story paths
- [ ] Implement network topology visualization
- [ ] Add file manager component for PC browsing
- [ ] Create password cracking mini-game
- [ ] Add sound effects & background music
- [ ] Implement difficulty levels
- [ ] Add multiplayer/competitive modes
- [ ] Export game saves as JSON
- [ ] Add achievements/badges system
- [ ] Create level editor for custom puzzles

---

## 📚 Additional Resources

- **sql.js Docs**: https://sql.js.org/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/

---

**Last Updated**: December 8, 2025
**Maintainer**: Your Team
**License**: TUL Educational
