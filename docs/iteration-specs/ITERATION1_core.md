# Iteration 1: Core Exam Hosting & AI Marking

## Overview

Build the foundational exam platform with hardcoded questions, live hosting, and **immediate AI feedback** after each question submission.

**Core Philosophy**: Students receive feedback the moment they submit each answer - not at the end of the exam. This tight feedback loop is the key value over paper-based exams. If strict exam conditions were needed, teachers would use paper.

**Goal**: Students join a live session, work through questions at their own pace, and receive instant AI-generated feedback with marks against the official mark scheme after each submission.

---

## Design Principles

1. **Immediate feedback**: Every question submission triggers instant AI marking and feedback
2. **Zero friction for students**: No accounts, no sign-up - just enter code and start
3. **Playful anonymity**: Auto-generated fun usernames (e.g., "Cosmic Penguin", "Dancing Banana")
4. **Ephemeral by design**: All session data auto-deleted after 24 hours
5. **Teacher control**: Teacher controls session flow but students control their pace
6. **Transparent marking**: Students see exactly which mark scheme points they hit/missed

---

## File Structure for Questions

Questions and mark schemes are stored as paired markdown files:

```
/content/
  /ocr-gcse-cs-programming-languages/
    metadata.json          # Exam metadata (title, total marks, time limit)
    /easy/
      1a_Q.md              # Question text
      1a_MS.md             # Mark scheme
      1b_Q.md
      1b_MS.md
    /medium/
      1_Q.md
      1_MS.md
      2_Q.md
      2_MS.md
    /hard/
      1_Q.md
      1_MS.md
```

### metadata.json Schema

```json
{
  "examId": "ocr-gcse-cs-programming-languages",
  "title": "Programming Languages & IDEs",
  "board": "OCR",
  "level": "GCSE",
  "subject": "Computer Science",
  "totalMarks": 51,
  "timeMinutes": 51,
  "difficulties": {
    "easy": { "questionCount": 5, "totalMarks": 11 },
    "medium": { "questionCount": 8, "totalMarks": 28 },
    "hard": { "questionCount": 3, "totalMarks": 12 }
  }
}
```

### Question File Schema (_Q.md)

```markdown
---
questionId: "1a"
marks: 1
questionType: "short-answer"
context: "A computer game is written in a high-level programming language."
hasCodeBlock: false
---

State why the computer needs to translate the code before it is executed.
```

**Supported questionType values for Iteration 1:**
- `short-answer` (1-2 marks, single point)
- `extended-response` (3+ marks, multiple points)
- `fill-blank` (complete the gaps)
- `code-completion` (complete code snippet)
- `describe` (describe X differences/features)
- `compare` (compare X and Y)

### Mark Scheme File Schema (_MS.md)

```markdown
---
questionId: "1a"
marks: 1
markingStrategy: "any-one"
spellingPolicy: "tolerant"
---

## Acceptable Answers

Award 1 mark for any ONE of the following:

- To convert it to binary/machine code
- The processor can only understand machine code
- High-level code cannot be directly executed

## Notes

- Accept equivalent wording
- Do not accept "to make it work" without explanation
```

**markingStrategy values:**
- `any-one` - Award marks for any 1 correct point
- `any-two` - Award marks for any 2 correct points (max 2)
- `any-n` - Award marks for any n correct points
- `all-required` - All points needed for full marks
- `comparative` - Must compare both sides (e.g., compiler vs interpreter)
- `banded` - Levelled response (high/mid/low band)

**spellingPolicy values:**
- `tolerant` - Accept minor spelling errors
- `strict` - Exact spelling required (technical terms)
- `ignore` - Spelling explicitly ignored per mark scheme

---

## Core Features

### 1. Teacher Dashboard

**Session Creation:**
- Select exam from available content
- Choose difficulty filter (Easy/Medium/Hard or All)
- Set time limit (use default or custom)
- Generate join code (6-digit alphanumeric)
- Option: Shuffle question order per student

**Live Monitoring:**
- See connected students (name, avatar)
- Real-time progress (questions completed)
- Pause/resume exam timer
- End session early
- Live leaderboard (optional display to students)

**Post-Session:**
- View all submissions
- Per-question analytics
- Export results (CSV)
- Flag responses for review

### 2. Student Join Flow

```
1. Go to join URL (e.g., /join)
2. Enter 6-digit code
3. System assigns playful username (e.g., "Cosmic Penguin", "Dancing Banana", "Turbo Llama")
4. Student sees their assigned username and can begin
5. No account creation, no personal info collected
```

**Playful Username Generator**:
- Format: [Adjective] + [Noun]
- Examples: "Cosmic Penguin", "Bouncy Giraffe", "Turbo Mango", "Sparkly Dolphin"
- Must be unique within session
- Cannot be changed (prevents gaming the leaderboard)

**Student Exam Interface:**
- Question navigation bar (numbered, shows completion status)
- Current question display with context
- Text input area (expandable)
- Mark allocation shown (e.g., "[4 marks]")
- Timer (countdown, visible)
- **Submit button** → triggers immediate AI feedback
- After feedback: "Next Question" button
- Can revisit previous questions to review feedback

### 3. AI Marking System

**The Core Loop** (happens immediately on each submission):

```
Student clicks "Submit Answer"
         │
         ▼
┌─────────────────────────┐
│ 1. Capture answer text  │
│ 2. Load mark scheme     │
│ 3. Build AI prompt      │
│ 4. Call AI API          │
│ 5. Parse response       │
│ 6. Display feedback     │
└─────────────────────────┘
         │
         ▼
Student sees feedback immediately (target: <3 seconds)
```

**This is NOT a batch process.** Each answer is marked independently, the moment it's submitted.

**AI Marking Prompt Template:**

```
You are an OCR GCSE Computer Science examiner. Mark the following student response against the mark scheme provided.

## Question
{question_text}

## Mark Scheme ({total_marks} marks)
Marking Strategy: {marking_strategy}
{mark_scheme_content}

## Student Response
{student_answer}

## Instructions
1. Identify which mark scheme points the student has addressed
2. Award marks according to the marking strategy
3. Be generous with equivalent wording unless technical precision is required
4. Spelling policy: {spelling_policy}

## Response Format (JSON)
{
  "marksAwarded": <integer>,
  "maxMarks": <integer>,
  "pointsAwarded": [
    {"criterion": "...", "studentEvidence": "..."}
  ],
  "pointsMissing": [
    {"criterion": "...", "hint": "..."}
  ],
  "feedback": "...",
  "confidence": "high|medium|low"
}
```

### 4. Feedback Display

After submission, students see:

```
┌─────────────────────────────────────────┐
│ Question 1a                    Score: 1/1│
├─────────────────────────────────────────┤
│ Your Answer:                             │
│ "The CPU can only understand binary"     │
│                                          │
│ ✅ Points Awarded:                       │
│ • The processor can only understand      │
│   machine code                           │
│                                          │
│ Mark Scheme Breakdown:                   │
│ [1 mark] Any one of:                     │
│ ✓ To convert it to binary/machine code  │
│ ✓ The processor only understands        │
│   machine code                           │
│                                          │
│ Feedback:                                │
│ "Good - you correctly identified that    │
│  the CPU requires machine code."         │
└─────────────────────────────────────────┘
```

### 5. Analytics Dashboard

**Per-Question Analytics:**
- Average score
- Score distribution (histogram)
- Most common missed points
- Most common incorrect approaches
- Time spent (average, distribution)

**Per-Student Analytics:**
- Total score
- Score by difficulty
- Questions flagged
- Time taken

**Class Analytics:**
- Overall average
- Difficulty breakdown
- Weakest topics (by mark scheme criteria)

---

## Edge Cases to Handle

### Answer Validation
- **Blank submission**: Allow but warn. Mark as 0 with feedback "No answer provided"
- **Over-answering**: If asked for 2 points and student gives 5, mark best 2
- **Numbered vs unnumbered**: Accept both "1. Point one 2. Point two" and "Point one. Point two."
- **Copy-pasted question**: Detect and exclude from marking

### Mark Scheme Edge Cases
- **"No more than X marks for Y only"**: Implement cap logic
- **Conditional marks**: "1 mark for identification, 1 mark for description"
- **Comparative questions**: Must have content for BOTH sides
- **"Too vague" rejections**: Mark scheme says "easier to use is too vague" - AI must know

### Technical Edge Cases
- **Network disconnect**: Local timer continues running. On reconnect, sync with teacher's timer (source of truth). Auto-save queues locally and syncs when connection restored.
- **Timer expires**: Auto-submit current state
- **Concurrent sessions**: Student can only be in one active session
- **Browser refresh**: Restore state from last save
- **Single device only**: No multi-device support in Iteration 1. Session is tied to one browser.

### Embedded Response Detection
AI must distinguish between:
- **Template content** (provided code, table structure) vs **student input**
- **Blank/empty submission** vs **partial response**

Example scenarios:
```
// Code completion - AI must know lines 06-07 are student input
01 if a == "LAN" then
02     print("Local Area Network")
03 elseif a == "WAN" then
04     print("Wide Area Network")
05 // STUDENT INPUT BELOW
06 else
07     print("unknown")
08 endif
```

```
// Table completion - AI must know only OUTPUT column is student input
| A | B | OUTPUT |
|---|---|--------|
| 0 | 0 | [0]    |  <- student fills OUTPUT only
| 0 | 1 | [1]    |
```

For each question type, clearly mark in the schema what is template vs response area.

### Code Questions
- **Whitespace tolerance**: Ignore extra spaces/blank lines
- **Case sensitivity**: Language-appropriate (Python = sensitive)
- **Comments**: Ignore unless specifically assessed
- **Alternative syntax**: Accept valid alternatives

---

## Data Models (Conceptual)

### Session
```
- id: unique identifier
- code: 6-character join code (alphanumeric, uppercase)
- examId: which exam content to use
- difficultyFilter: easy/medium/hard/all
- timeLimitMinutes: countdown duration
- status: lobby/active/paused/completed
- teacherId: who created it
- startedAt: when exam began
- endedAt: when session closed
- createdAt: when session was created
```

### Participant
```
- id: unique identifier (anonymous)
- sessionId: which session they joined
- username: auto-generated playful name
- joinedAt: when they joined
- totalScore: sum of marks awarded
- maxPossibleScore: sum of max marks for attempted questions
- questionsCompleted: count
```

### Response
```
- id: unique identifier
- participantId: who submitted
- questionId: which question (e.g., "1a")
- answerText: what they wrote
- marksAwarded: AI-determined score
- maxMarks: maximum possible for this question
- aiFeedback: full feedback object (points awarded, missing, feedback text)
- submittedAt: timestamp
```

### Key Relationships
- One Session has many Participants
- One Participant has many Responses (one per question attempted)
- Each Response links to one Question (from content files)

---

## API Endpoints

```
POST   /api/sessions              Create new session
GET    /api/sessions/:id          Get session details
PATCH  /api/sessions/:id          Update session (start/pause/end)
DELETE /api/sessions/:id          Delete session

POST   /api/sessions/:id/join     Student joins session
GET    /api/sessions/:id/participants  List participants

GET    /api/exams                 List available exams
GET    /api/exams/:id             Get exam content

POST   /api/responses             Submit answer
GET    /api/responses/:sessionId/:participantId  Get student's responses

GET    /api/analytics/:sessionId  Get session analytics
```

---

## WebSocket Events

```typescript
// Server -> Client
'session:started'       // Exam has begun
'session:paused'        // Timer paused
'session:resumed'       // Timer resumed  
'session:ended'         // Exam ended
'participant:joined'    // New student joined
'participant:submitted' // Student submitted (for leaderboard)
'leaderboard:update'    // Scores updated

// Client -> Server
'answer:save'           // Auto-save answer
'answer:submit'         // Submit for marking
'exam:complete'         // Student finished all questions
```

---

## Testing Requirements

### Unit Tests
- Mark scheme parser
- AI prompt construction
- Score calculation logic
- Timer logic

### Integration Tests
- Full submission flow
- WebSocket connection handling
- Database operations

### Manual Test Cases
1. Student joins, answers all questions, submits - verify marks
2. Student disconnects mid-exam, reconnects - verify state restored
3. Timer expires - verify auto-submit
4. Teacher pauses exam - verify all student timers pause
5. Compare AI marks vs expected marks for sample answers

---

## Success Criteria

### Must Have (MVP)
- [ ] Teacher can create session and receive 6-character code
- [ ] Students can join via code (no account needed)
- [ ] Students receive auto-generated playful username
- [ ] Students can view questions with context and mark allocation
- [ ] **Students receive AI feedback within 3 seconds of submission**
- [ ] Feedback clearly shows: marks awarded, points matched, points missing, improvement hints
- [ ] Students can navigate between questions
- [ ] Timer counts down correctly
- [ ] Leaderboard updates as students complete questions
- [ ] Teacher can monitor progress in real-time
- [ ] Session data cleaned up after 24 hours

### Should Have
- [ ] Teacher can pause/resume timer
- [ ] Students can review their previous answers and feedback
- [ ] Teacher can flag responses for class discussion
- [ ] Post-session analytics (average scores, common mistakes)
- [ ] Handles 30 concurrent students without degradation

### Nice to Have
- [ ] Export results as spreadsheet
- [ ] Teacher can add notes to responses
- [ ] "Most improved" tracking across sessions