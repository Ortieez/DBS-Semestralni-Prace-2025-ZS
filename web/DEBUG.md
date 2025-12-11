# Debug Logging Guide

## Overview
The application uses a custom logger utility that respects a DEBUG flag. When the flag is off, all debug logs are suppressed in the console, keeping it clean.

## How to Enable/Disable Debug Mode

### Method 1: URL Parameter (Easiest)
Simply add `?debug=true` to the URL:
```
http://localhost:5173/?debug=true
```

### Method 2: Browser Console Commands
Open the browser DevTools console and run:

**Enable debugging:**
```javascript
DEBUG.enable()
```

**Disable debugging:**
```javascript
DEBUG.disable()
```

**Toggle debugging:**
```javascript
DEBUG.toggle()
```

### Method 3: localStorage (Persistent)
Set directly in localStorage:
```javascript
localStorage.setItem('DEBUG', 'true')   // Enable
localStorage.removeItem('DEBUG')         // Disable
```

## Logger Usage in Code

Import the logger at the top of your file:
```javascript
import logger from '../utils/logger'
```

Use it like `console`:
```javascript
logger.log('Regular log message')
logger.warn('Warning message')
logger.error('Error message')
logger.info('Info message')
logger.table(dataObject)
logger.group('Group Label')
logger.groupEnd()
```

## Output Format
When debug mode is enabled, all logs are prefixed with `[DEBUG]` for easy identification:
```
[DEBUG] Found window: SQL ...
[DEBUG] Minimizing all windows...
[DEBUG] Minimizing: TULBird
```

## Files Using Logger
- `src/App.tsx` - Window minimize/restore operations
- `src/components/Cutscene.tsx` - Cutscene state management
- `src/components/SQLDatabase.tsx` - Schema loading errors

## Tips
- Use `?debug=true` in the URL when testing to automatically enable debugging from page load
- The debug flag persists across page reloads when set via localStorage or URL
- No performance impact when debug mode is disabled
