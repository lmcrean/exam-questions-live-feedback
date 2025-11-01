Exam questions live

# Exam Response App - Technical Specification

## Project Overview

An interactive educational web application for conducting live exam question review sessions. Teachers can create temporary sessions where students submit long-form text responses (up to 3000 words) and images without requiring authentication or personal information.

### Core Purpose
- Enable teachers to conduct live exam question review sessions with stage-based workflow
- Allow students to submit detailed answers with supporting images (up to 3000 words)
- Enable peer review where students view all responses and vote for the best ones
- Students rank their top 3 responses (3 points, 2 points, 1 point)
- Display results with leaderboard and points totals
- Teacher navigates responses on board with expand/collapse views
- Maintain student anonymity with auto-generated playful usernames
- Provide temporary, ephemeral sessions with automatic cleanup

---

## User Roles

### Teacher/Presenter
- Creates and manages live sessions
- Inputs question as text and/or images (up to 5)
- Uploads mark scheme images (up to 5)
- Controls stage progression (Submission → Review → Voting → Results)
- Views all student responses in real-time
- Navigates responses on board in presentation mode
- Controls session lifecycle (create, end, cleanup)
- Receives a unique session code to share with students

### Student/Participant
- Joins session using a session code
- Assigned an auto-generated playful username
- Submits text responses (up to 3000 words)
- Can optionally upload up to 5 images with their response
- Reviews all submitted responses (expand/collapse view)
- Can peek at mark scheme (if teacher allows)
- Votes for top 3 responses (cannot vote for own response)
- Views final results with points and rankings

---

## Technical Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Firebase Firestore (real-time database)
- **Authentication**: Firebase Anonymous Auth for session management
- **Image Storage**: Cloudinary
- **Hosting**: Google Cloud Platform (Cloud Run or App Engine)

### Frontend
- **Framework**: React with TypeScript
- **Real-time Updates**: Firebase Firestore listeners
- **Styling**: Tailwind CSS (recommended)
- **Image Upload**: Cloudinary Upload Widget or custom uploader

---

## Essential Workflow

### Quick Overview
1. **Teacher uploads question** as multi-screenshot images or text
2. **Code displayed** on board/projector  
3. **Student joins** with code, gets playful username
4. **Student reads question**, submits answer (text + optional images)
5. **Teacher starts Review stage** - Students review all answers with expand/collapse views
6. **Teacher starts Voting stage** - Students rank top 3 answers (can't vote their own)
7. **Teacher shows Results stage** - Points calculated, leaderboard displayed
8. **Teacher navigates answers** on board with expand/collapse views for class discussion
9. **Session ends** and auto-cleanup occurs after 24 hours

### Voting & Points System
- Students must select exactly 3 different responses
- Rankings award points: 1st = 3 pts, 2nd = 2 pts, 3rd = 1 pt
- Cannot vote for own response
- Total points determine final rankings
- Tiebreaker: earlier submission wins
- Voting is anonymous

---

## Session Workflow Stages

### Stage 1: Question Setup (Teacher Only)
- Teacher uploads question as multi-screenshot images OR enters question as text
- Can mix both: text question with supporting images
- System generates and displays 6-character session code on screen

### Stage 2: Student Joins
- Code displayed on board/projector
- Students navigate to join page and enter code
- Auto-generated playful username assigned
- Student redirected to question view

### Stage 3: Student Reads & Submits
- Students view question (expand/collapse images if multiple)
- Optional: Peek at mark scheme (collapsed by default, expandable)
- Students write their answers (up to 3000 words)
- Optional: Upload supporting images (up to 5)
- Submit response

### Stage 4: Review Phase (All Students)
- Teacher advances session to "review" stage
- All students see all submitted answers
- Each response has expand/collapse view:
  - Collapsed: Username, first 100 characters, thumbnail images
  - Expanded: Full text, all images in gallery
- Students read through all responses

### Stage 5: Voting Phase
- Teacher advances session to "voting" stage
- Students rank their top 3 responses (1st, 2nd, 3rd choice)
- Cannot vote for their own response
- Voting is anonymous
- Points system: 1st place = 3 points, 2nd place = 2 points, 3rd place = 1 point

### Stage 6: Results & Discussion
- Teacher advances session to "results" stage
- All responses displayed with total points scored
- Sorted by points (highest first)
- Teacher navigates through responses on board:
  - Arrow keys or buttons to move between responses
  - Full-screen expand/collapse view for projection
  - Mark scheme toggle (show/hide) for discussion
- Winning responses highlighted

### Stage 7: End Session
- Teacher ends session
- Session marked as closed
- Optional: Set auto-cleanup timer
- Students see "Session ended" message

### Stage 8: Cleanup
- Automated cleanup runs periodically (e.g., nightly cron job)
- Deletes sessions ended more than 24 hours ago
- Removes associated images from Cloudinary
- Purges all student responses and votes

## Core Features

### Session Management
1. **Create Session**
   - Teacher creates a new session
   - System generates unique 6-character alphanumeric session code
   - Teacher inputs question as:
     - Plain text (markdown supported)
     - Multi-screenshot images (up to 5)
     - Combination of both
   - Optional: Upload mark scheme images (up to 5)
   - Session starts in "submission" stage

2. **Join Session**
   - Student enters session code
   - System validates code and checks session is active
   - Auto-generates playful username (e.g., "Dancing Penguin", "Cosmic Banana")
   - Student granted access to response submission

3. **Stage Progression**
   - Teacher controls stage transitions:
     - Submission → Review → Voting → Results
   - Stage changes broadcast in real-time to all participants
   - Students' UI updates automatically based on current stage

4. **End Session**
   - Teacher ends session from results stage
   - Session marked as closed (no new submissions or votes)
   - Final results frozen
   - Optional: Set auto-cleanup timer (e.g., 1 hour after ending)

5. **Cleanup**
   - Automated cleanup runs periodically (e.g., nightly cron job)
   - Deletes sessions ended more than 24 hours ago
   - Removes associated images from Cloudinary
   - Purges all student responses and votes

### Response Submission
1. **Text Input**
   - Rich text editor supporting:
     - Plain text formatting
     - Basic markdown (bold, italic, lists)
     - Character count display
     - Maximum 3000 words (~18,000 characters)
   
2. **Image Upload**
   - Students can upload 0-5 images
   - Supported formats: JPG, PNG, HEIC
   - Maximum file size: 10MB per image
   - Images uploaded to Cloudinary with session ID in path
   - Display uploaded image thumbnails with remove option

3. **Submit Response**
   - Validates text length and image count
   - Stores submission in Firestore
   - Student can edit their response until teacher advances to "review" stage

### Voting System
1. **Voting Interface** (Available during "voting" stage)
   - Students see all responses in collapsed view
   - Can expand any response to read fully
   - Rank their top 3 choices:
     - 1st choice (3 points)
     - 2nd choice (2 points)
     - 3rd choice (1 point)
   - Their own response is grayed out/disabled (cannot vote for self)
   - Must select exactly 3 different responses
   - Can change votes until teacher advances to "results" stage

2. **Points Calculation**
   - Automatic tallying of points per response
   - Real-time updates as votes come in (teacher view only)
   - Final ranking determined by total points
   - Tiebreaker: timestamp (earlier submission wins)

3. **Voting Rules**
   - Cannot vote for own response
   - Must vote for exactly 3 responses
   - Each position (1st/2nd/3rd) can only be assigned once
   - Anonymous voting (no one sees who voted for whom)
   - Votes locked after advancing to "results" stage

### Question Display (Expand/Collapse)
1. **Question View**
   - Text question always visible (if provided)
   - Images in collapsible gallery:
     - Default: Shows first image thumbnail with "Show all images (X)" button
     - Expanded: Full gallery view with all question images
     - Lightbox/modal for zooming individual images
     - Navigation arrows between images

2. **Mark Scheme Peek**
   - Collapsed by default with "Peek at mark scheme" button
   - Expands to show mark scheme images in gallery
   - Students can toggle during submission phase (optional teacher setting)
   - Can be disabled by teacher for "closed book" sessions

3. **Response Cards (Review/Voting/Results)**
   - **Collapsed State**:
     - Username badge
     - First 100 characters of text with "..." 
     - Thumbnail of first image (if any)
     - "Expand" button
     - Vote count/points (visible in results stage)
   
   - **Expanded State**:
     - Full text content
     - All images in gallery
     - "Collapse" button
     - During voting: "Vote 1st/2nd/3rd" buttons

### Teacher View
1. **Session Dashboard**
   - Display session code prominently (large, copyable)
   - Current stage indicator (Submission/Review/Voting/Results)
   - Stage control buttons:
     - "Start Review" (from submission)
     - "Start Voting" (from review)
     - "Show Results" (from voting)
     - "End Session" (from results)
   - Real-time count of submissions
   - Real-time count of votes (during voting stage)

2. **Question Display Section**
   - Show question text (if provided)
   - Question images gallery (collapsible)
   - "Upload Additional Images" option during submission stage
   - Mark scheme section (collapsible, toggleable)

3. **Response Display** (Submission & Review Stages)
   - Grid or list view of all submissions as they arrive
   - Each card shows:
     - Auto-generated username
     - Text response (truncated with "show more")
     - Thumbnail images (click to expand)
     - Timestamp
   - Filter/search capabilities
   - Export responses as PDF or JSON

4. **Board Presentation Mode** (Review, Voting & Results Stages)
   - Full-screen mode for projection
   - Keyboard navigation:
     - Arrow keys (← →) to navigate between responses
     - Space bar to expand/collapse current response
     - 'M' key to toggle mark scheme
     - Escape to exit presentation mode
   
   - **Response Navigation**:
     - One response shown at a time in large, readable format
     - Previous/Next buttons (or swipe gestures)
     - Progress indicator (e.g., "3 of 15")
     - Username prominently displayed
     - Full text content visible
     - Images in gallery (auto-sized for screen)
   
   - **Mark Scheme Toggle**:
     - Button/shortcut to show mark scheme overlay
     - Split-screen view: response on left, mark scheme on right
     - Can toggle on/off during discussion
   
   - **During Results Stage**:
     - Responses automatically sorted by points (highest first)
     - Points badge prominently displayed
     - Podium view for top 3 (optional)
     - Can still navigate all responses

5. **Voting Oversight** (Voting Stage)
   - Real-time voting progress: "X of Y students voted"
   - Cannot see individual votes (maintains anonymity)
   - Points accumulation visible in real-time
   - Option to extend voting time before advancing

6. **Results View** (Results Stage)
   - Leaderboard showing all responses ranked by points
   - Top 3 highlighted with gold/silver/bronze
   - Each entry shows:
     - Rank (#1, #2, #3, etc.)
     - Username
     - Total points
     - Preview of response (expandable)
   - Can switch to board presentation mode for discussion

---

## Data Models

### Session
```typescript
interface Session {
  id: string; // Auto-generated document ID
  code: string; // 6-character unique code
  createdAt: Timestamp;
  endedAt: Timestamp | null;
  status: 'active' | 'ended';
  stage: 'submission' | 'review' | 'voting' | 'results'; // Current session stage
  teacherId: string; // Firebase auth UID
  questionText?: string; // Optional text question (markdown supported)
  questionImages: string[]; // Cloudinary URLs (max 5)
  markSchemeImages: string[]; // Cloudinary URLs (max 5)
  markSchemeVisible: boolean; // Whether students can peek at mark scheme
  title?: string; // Optional session title
  responseCount: number; // Cached count
  voteCount: number; // Number of students who have voted
}
```

### Response
```typescript
interface Response {
  id: string; // Auto-generated document ID
  sessionId: string; // Reference to Session
  username: string; // Auto-generated playful name
  textContent: string; // Up to ~18,000 characters
  wordCount: number; // Calculated
  images: string[]; // Cloudinary URLs (max 5)
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  participantId: string; // Anonymous Firebase auth UID
  totalPoints: number; // Total points from voting (cached)
  voteBreakdown: {
    firstPlace: number; // Number of 1st place votes (3 pts each)
    secondPlace: number; // Number of 2nd place votes (2 pts each)
    thirdPlace: number; // Number of 3rd place votes (1 pt each)
  };
}
```

### Vote
```typescript
interface Vote {
  id: string; // Auto-generated document ID
  sessionId: string; // Reference to Session
  voterId: string; // Participant who voted (anonymous Firebase UID)
  rankings: {
    firstChoice: string; // Response ID for 1st place (3 points)
    secondChoice: string; // Response ID for 2nd place (2 points)
    thirdChoice: string; // Response ID for 3rd place (1 point)
  };
  submittedAt: Timestamp;
}
```

### Mark
```typescript
interface Mark {
  id: string; // Auto-generated document ID
  sessionId: string; // Reference to Session
  responseId: string; // Response being marked
  markerId: string; // Participant who marked (or teacher)
  markerUsername: string; // For display purposes
  score: number; // Numerical mark awarded
  comment?: string; // Optional justification/feedback
  createdAt: Timestamp;
  isPeerMark: boolean; // True if from assigned peer marking
}
```

### PeerMarkingAssignment
```typescript
interface PeerMarkingAssignment {
  id: string; // Auto-generated document ID
  sessionId: string; // Reference to Session
  markerId: string; // Participant assigned to mark
  markerUsername: string;
  responseId: string; // Response assigned to mark
  responseUsername: string; // Original author username
  completed: boolean; // Has marking been submitted
  completedAt?: Timestamp;
}
```

### Participant (Temporary)
```typescript
interface Participant {
  id: string; // Firebase anonymous auth UID
  sessionId: string;
  username: string; // Assigned playful username
  joinedAt: Timestamp;
}
```

---

## API Endpoints

### Sessions
```
POST   /api/sessions
  Body: { 
    title?: string, 
    questionText?: string,
    questionImages?: File[],
    markSchemeImages?: File[],
    markSchemeVisible?: boolean 
  }
  Response: { sessionId, code, uploadUrls }

GET    /api/sessions/:code
  Response: { session details, status, stage }

GET    /api/sessions/:sessionId/responses
  Auth: Teacher only
  Response: { responses[], count, sortedByPoints?: boolean }

PUT    /api/sessions/:sessionId/stage
  Auth: Teacher only
  Body: { stage: 'review' | 'voting' | 'results' }
  Response: { success, newStage }

PUT    /api/sessions/:sessionId/end
  Auth: Teacher only
  Response: { success, endedAt }

DELETE /api/sessions/:sessionId
  Auth: Teacher only
  Response: { success }

POST   /api/sessions/:sessionId/mark-scheme
  Auth: Teacher only
  Body: { images: File[] }
  Response: { uploadedUrls[] }

POST   /api/sessions/:sessionId/question
  Auth: Teacher only
  Body: { questionText?: string, images?: File[] }
  Response: { success, uploadedUrls? }
```

### Responses
```
POST   /api/sessions/:sessionId/join
  Body: { }
  Response: { participantId, username, sessionCode }

POST   /api/responses
  Body: { 
    sessionId, 
    participantId,
    textContent, 
    images?: File[] 
  }
  Response: { responseId, success }

PUT    /api/responses/:responseId
  Body: { textContent, images?: File[] }
  Auth: Must be response owner
  Response: { success }

GET    /api/responses/:responseId
  Response: { response details }

GET    /api/sessions/:sessionId/responses/all
  Auth: Participant in session (available during review/voting/results stages)
  Response: { responses[] }
```

### Voting
```
POST   /api/sessions/:sessionId/vote
  Body: {
    participantId,
    rankings: {
      firstChoice: responseId,  // 3 points
      secondChoice: responseId, // 2 points
      thirdChoice: responseId   // 1 point
    }
  }
  Response: { success }

GET    /api/sessions/:sessionId/vote/:participantId
  Response: { vote details if exists, or null }

PUT    /api/sessions/:sessionId/vote/:participantId
  Body: {
    rankings: {
      firstChoice: responseId,
      secondChoice: responseId,
      thirdChoice: responseId
    }
  }
  Response: { success }

GET    /api/sessions/:sessionId/results
  Auth: Any participant or teacher (only available in results stage)
  Response: { 
    responses: Response[], // Sorted by totalPoints desc
    totalVotes: number 
  }
```

### Images
```
POST   /api/images/upload
  Body: FormData with image file
  Response: { url, publicId }

DELETE /api/images/:publicId
  Response: { success }
```

### Voting
```
POST   /api/responses/:responseId/vote
  Body: { participantId }
  Response: { success, voteCount }

DELETE /api/responses/:responseId/vote
  Body: { participantId }
  Response: { success, voteCount }

GET    /api/responses/:responseId/votes
  Response: { voteCount, hasVoted }
```

### Marking
```
POST   /api/responses/:responseId/marks
  Body: { 
    participantId,
    score,
    comment?,
    isPeerMark
  }
  Response: { markId, success }

GET    /api/responses/:responseId/marks
  Response: { 
    marks[], 
    average, 
    count 
  }

PUT    /api/marks/:markId
  Body: { score, comment }
  Response: { success }

DELETE /api/marks/:markId
  Auth: Mark owner or teacher
  Response: { success }
```

### Peer Marking
```
POST   /api/sessions/:sessionId/peer-marking/enable
  Auth: Teacher only
  Body: { }
  Response: { assignments[], success }

GET    /api/sessions/:sessionId/peer-marking/assignment
  Body: { participantId }
  Response: { assignment, completed }

POST   /api/peer-marking/:assignmentId/submit
  Body: { 
    participantId,
    score,
    comment 
  }
  Response: { success }

GET    /api/sessions/:sessionId/peer-marking/status
  Auth: Teacher only
  Response: { 
    totalAssignments,
    completedCount,
    assignments[]
  }
```

### Session Settings
```
PUT    /api/sessions/:sessionId/settings
  Auth: Teacher only
  Body: { 
    votingEnabled?,
    manualMarkingEnabled?,
    peerMarkingMode?,
    markSchemeVisible?,
    maxMarks?
  }
  Response: { success }
```

---

## Frontend Components

### Teacher Flow
1. **Create Session Page** (`/teacher/create`)
   - Form to create session
   - Optional title input
   - Question input:
     - Text editor for question text (markdown supported)
     - Upload question images (drag-drop or file picker, up to 5)
   - Mark scheme upload (drag-drop or file picker, up to 5)
   - Mark scheme visibility toggle (allow students to peek)
   - "Create Session" button
   - Redirect to Session Dashboard

2. **Session Dashboard** (`/teacher/session/:sessionId`)
   - **Header Section**:
     - Session code (large, copyable)
     - Current stage indicator (Submission/Review/Voting/Results)
     - Stage control buttons (context-sensitive):
       - "Start Review" (from submission stage)
       - "Start Voting”
