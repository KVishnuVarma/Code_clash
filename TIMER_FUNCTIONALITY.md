# Timer Functionality Documentation

## Overview
The CodeClash platform now includes intelligent timer functionality that handles user logout/login scenarios properly. The timer automatically pauses when users log out and resumes when they log back in, ensuring accurate time tracking for problem-solving sessions.

## Key Features

### 1. Automatic Timer Pause on Logout
- When a user logs out, all active timer sessions are automatically paused
- Session data is preserved in localStorage with logout timestamp
- Timer intervals are cleared to prevent background counting

### 2. Automatic Timer Resume on Login
- When a user logs back in and visits a problem page, the timer automatically resumes
- The timer accounts for the time spent logged out by adjusting the start time
- Session status is updated to reflect the resumed state

### 3. Session State Management
- **Active**: Timer is currently running
- **Paused**: Timer is paused (page hidden, navigation away)
- **Paused (Logged Out)**: Timer was paused due to logout
- **Completed**: Problem was successfully solved, timer won't resume

### 4. Visual Indicators
- Timer status is displayed next to the time counter
- Color-coded status indicators:
  - 🟢 Green: Active
  - 🟡 Yellow: Paused
  - 🔵 Blue: Completed
  - ⚪ Gray: Not Started/Error

## Technical Implementation

### Timer Session Data Structure
```javascript
{
  isActive: boolean,           // Whether timer is currently running
  startTime: number,          // Original start timestamp
  lastActive: number,         // Last activity timestamp
  logoutTime: number,         // When user logged out (if applicable)
  isCompleted: boolean,       // Whether problem was completed
  completionTime: number,     // When problem was completed
  totalTime: number          // Total time taken (in seconds)
}
```

### Key Functions

#### AuthContext.logout()
- Clears all active timer sessions for the user
- Marks sessions as inactive with logout timestamp
- Prevents timer from running in background

#### ProblemSolver Timer Initialization
- Checks for existing sessions on component mount
- Resumes paused sessions with time adjustment
- Prevents resuming completed sessions

#### Session Management
- `handleBack()`: Pauses timer when navigating away
- `handleRefreshCode()`: Resets timer completely
- `handleSubmit()`: Marks session as completed on successful submission

## User Experience

### Scenario 1: Normal Problem Solving
1. User starts solving a problem → Timer starts
2. User works on problem → Timer runs continuously
3. User completes problem → Timer stops, session marked as completed

### Scenario 2: Logout During Problem Solving
1. User starts solving a problem → Timer starts
2. User logs out → Timer pauses, session saved with logout time
3. User logs back in later → Timer resumes, accounting for logout time
4. User continues solving → Timer continues from where it left off

### Scenario 3: Page Navigation
1. User starts solving a problem → Timer starts
2. User navigates away → Timer pauses
3. User returns to problem → Timer resumes
4. User completes problem → Timer stops, session completed

## Browser Compatibility
- Uses localStorage for session persistence
- Works with sessionStorage for authentication
- Handles page visibility changes
- Compatible with modern browsers

## Debug Information
Timer session information is logged to the console for debugging purposes. You can view this information by opening the browser's developer tools and checking the console when on a problem page.

## Testing the Functionality

1. **Start a problem**: Navigate to any problem and start coding
2. **Check timer**: Verify timer is running and status shows "Active"
3. **Logout**: Click logout button
4. **Login again**: Log back in and navigate to the same problem
5. **Verify resume**: Timer should resume from where it left off
6. **Check status**: Status should show "Active" again

The timer functionality ensures that users can take breaks, log out, and return to their problem-solving sessions without losing their progress or having inaccurate time tracking. 