# ExamHost: AI-Powered Exam Hosting Platform

## Project Overview

An interactive educational web application for conducting live exam practice sessions. Teachers create sessions where students answer exam questions and receive **immediate AI-generated feedback** against official mark schemes - the moment they submit each answer.

### Core Philosophy

**Immediate feedback is the key value proposition.** Unlike a handwritten paper exam, students get instant, detailed feedback the moment they complete each question. Yes, a student sitting nearby might glimpse an answer - but that's an acceptable trade-off. If you wanted strict exam conditions, you'd use paper. This is about **learning through rapid feedback loops**.

### What This Solves

Current tools either:
- Host live quizzes but only support multiple choice (no extended responses)
- Provide AI marking but only after the session ends (post-submission workflow)
- Offer practice questions but no live classroom hosting with join codes

This platform combines: live hosting + extended response support + instant AI marking + real-time class analytics.

---

## Iteration Plan

| Iteration | Focus | Status |
|-----------|-------|--------|
| 1 | Core hosting, text answers, immediate AI feedback | 📋 Spec complete |
| 2 | Diagram drawing, truth tables, visual responses | 📋 Spec complete |
| 3 | Flowchart builder and recognition | 📋 Spec complete |
| 4 | Teacher PDF upload and conversion | 📋 Spec complete |

### Iteration 1: Core Platform
- Hardcoded exam content (questions + mark schemes as markdown files)
- Student join flow with 6-character codes
- Text-based answer submission
- **Immediate AI feedback after each question submission**
- Real-time leaderboard showing progress
- Teacher dashboard with live analytics
- Session cleanup after 24 hours

### Iteration 2: Visual Responses
- Freehand drawing canvas for diagrams
- Structured truth table input
- Trace table input
- Binary working pad
- AI vision marking for visual responses

### Iteration 3: Flowcharts
- Dedicated flowchart builder with standard symbols
- Structural validation (correct symbols, connections)
- Logic flow analysis (does the algorithm work?)

### Iteration 4: Teacher Customisation
- PDF upload (question paper + mark scheme)
- AI-assisted parsing with confidence levels
- Teacher review and correction interface
- Clear messaging when content can't be parsed
- Publish workflow with validation

---

## Essential Workflow

### Session Flow

1. **Teacher creates session** → Selects exam, difficulty filter, gets 6-character code
2. **Code displayed** on board/projector
3. **Students join** with code, receive auto-generated playful username (e.g., "Cosmic Penguin")
4. **Students work through questions** at their own pace
5. **After each question**: Student submits → **Immediate AI feedback with marks**
6. **Leaderboard updates** in real-time as students complete questions
7. **Teacher monitors** progress and can review responses
8. **Session ends** → Final analytics available
9. **Auto-cleanup** after 24 hours (all data deleted)

### The Key Difference: Immediate Feedback

```
Traditional workflow:
  Student answers → Waits → Teacher marks → Days later → Feedback

Post-submission AI tools:
  Student answers all → Submits → AI marks → Feedback for whole paper

THIS platform:
  Student answers Q1 → Submits → IMMEDIATE feedback → Moves to Q2 → Submits → IMMEDIATE feedback → ...
```

Each question is a tight feedback loop. Students learn from mistakes immediately and can apply that learning to subsequent questions.

---

## User Roles

### Teacher
- Creates and manages live sessions
- Selects exam content and difficulty filter
- Receives unique 6-character session code to share
- Monitors student progress in real-time
- Views all responses and AI feedback
- Can flag responses for discussion
- Ends session when complete
- Reviews post-session analytics

### Student
- Joins session using code (no account needed)
- Assigned auto-generated playful username
- Works through questions at own pace
- Submits each answer when ready
- **Receives immediate AI feedback with mark breakdown**
- Can see their position on leaderboard
- Can review their previous answers and feedback

---

## File Structure

```
docs/iteration-specs/
├── ITERATION_1_CORE.md          # Core platform specification
├── ITERATION_2_DIAGRAMS.md      # Diagram support specification
├── ITERATION_3_FLOWCHARTS.md    # Flowchart specification
├── ITERATION_4_CUSTOMISATION.md # PDF upload specification
├── README.md                    # This file
│
/content/                    # Hardcoded exam content
└── /ocr-gcse-cs-programming-languages-ides/
    ├── metadata.json        # Exam metadata
    ├── /easy/
    │   ├── 1a_Q.md         # Question files
    │   ├── 1a_MS.md        # Mark scheme files
    │   └── ...
    ├── /medium/
    │   └── ...
    └── /hard/
        └── ...
```

---

## Content File Formats

### Question File (*_Q.md)

```yaml
---
questionId: "1a"
marks: 1
questionType: "short-answer"
context: "Optional context paragraph"
hasCodeBlock: false
hasDiagram: false
responseLines: [6, 7]  # For code-completion: which lines are student input
---

Question text here...
```

**Question Types (Iteration 1)**:
- `short-answer` - 1-2 marks, single point
- `extended-response` - 3+ marks, multiple points
- `define` - Definition question
- `describe` - Describe X features/tools
- `compare` - Compare X and Y
- `fill-blank` - Complete the gaps
- `code-completion` - Complete code snippet

### Mark Scheme File (*_MS.md)

```yaml
---
questionId: "1a"
marks: 1
markingStrategy: "any-one"
spellingPolicy: "tolerant"  # tolerant | strict | ignore
---

## Acceptable Answers
...

## Accept
...

## Do Not Accept
...
```

**Marking Strategies**:
- `any-one` - Award for any 1 correct point
- `any-two` - Award for any 2 correct points
- `any-n` - Award for any n correct points
- `all-required` - All points needed
- `comparative-pairs` - Must compare both sides
- `identify-and-describe` - 1 mark identify + 1 mark describe
- `banded` - Levelled response (high/mid/low)
- `line-by-line` - For code completion
- `exact-match` - For fill-in-blank

---

## AI Marking Approach

This is fundamentally a **prompt engineering** challenge. The quality of feedback depends on how well we instruct the AI to apply the mark scheme.

### What the AI Receives

1. Question text and context
2. Full mark scheme with criteria
3. Student response
4. Marking instructions (strategy, spelling policy, any conditional rules)

### What the AI Returns

```json
{
  "marksAwarded": 2,
  "maxMarks": 4,
  "pointsAwarded": [
    {"criterion": "Compiler translates all code in one go", "studentEvidence": "A compiler converts the entire program at once"}
  ],
  "pointsMissing": [
    {"criterion": "Creates an executable file", "hint": "What does a compiler produce that can be run later?"}
  ],
  "feedback": "Good understanding of the translation process. To improve, also mention what the compiler produces as output.",
  "confidence": "high"
}
```

### Edge Cases for AI Marking

1. **Embedded responses**: Code completion and table completion questions have template content. Mark scheme specifies `responseLines` to indicate where student input is vs. provided template.

2. **Blank submissions**: Detected and marked as 0 with encouraging feedback to attempt the question.

3. **Over-answering**: If asked for 2 points and student gives 5, mark best 2.

4. **Comparative questions**: Mark scheme has `comparative-pairs` strategy - student must address BOTH sides for full marks.

5. **Conditional rules**: Some mark schemes have caps like "no more than 2 marks for answers relating ONLY to interpreters" - AI must enforce these.

6. **Spelling tolerance**: Per-question config. Technical terms may require precision; general answers more lenient.

---

## Feedback Display

After each submission, students see:

```
┌─────────────────────────────────────────┐
│ Question 1b                    Score: 3/4│
├─────────────────────────────────────────┤
│ Your Answer:                             │
│ "A compiler translates all the code at  │
│  once and creates an exe file. An       │
│  interpreter does it line by line."     │
│                                          │
│ ✅ Points Awarded:                       │
│ • Compiler translates all code in one go │
│ • Interpreter translates line by line    │
│ • Compiler creates executable            │
│                                          │
│ ❌ Missing:                              │
│ • Interpreter stops when error found     │
│   (vs compiler reports all at end)       │
│                                          │
│ 💡 Feedback:                             │
│ "Strong comparison of translation        │
│  methods. For full marks, also contrast  │
│  how each handles errors during the      │
│  translation process."                   │
│                                          │
│            [Next Question →]             │
└─────────────────────────────────────────┘
```

---

## Timer & State Management

- **Single device**: Session tied to one browser (Iteration 1)
- **Local timer**: Runs on client, teacher's timer is source of truth
- **Network disconnect**: Local timer continues, answers queued locally, syncs on reconnect
- **Auto-save**: Every 30 seconds, queued if offline
- **Timer expiry**: Auto-submit current answer, move to results

---

## Session Lifecycle

### Creation
- Teacher selects exam and difficulty
- System generates unique 6-character code
- Session status: `active`

### Active Session
- Students join with code
- Students work through questions
- Immediate feedback after each submission
- Leaderboard updates in real-time
- Teacher monitors progress

### Session End
- Teacher ends session OR timer expires
- Final analytics calculated
- Session status: `ended`
- Students see "Session ended" with final scores

### Cleanup
- Automated cleanup runs periodically
- Deletes sessions ended >24 hours ago
- Removes all associated data
- No persistent student data retained

---

## Data Models (Conceptual)

### Session
- Unique ID and 6-character join code
- Selected exam and difficulty filter
- Time limit settings
- Current status (active/ended)
- Created/ended timestamps

### Participant
- Auto-generated anonymous ID
- Assigned playful username
- Session reference
- Join timestamp

### Response
- Participant reference
- Question ID
- Answer text (and images in later iterations)
- AI marking result (marks, feedback, breakdown)
- Submission timestamp

---

## Success Criteria

### Iteration 1 MVP
- [ ] Teacher can create session with join code
- [ ] Students can join with code and receive playful username
- [ ] Students can navigate between questions
- [ ] **Students receive immediate AI feedback after each submission**
- [ ] Feedback clearly shows marks awarded, points matched, points missing
- [ ] Leaderboard updates as students complete questions
- [ ] Teacher can monitor all responses in real-time
- [ ] Timer functions correctly (local + sync with teacher)
- [ ] Session cleanup works after 24 hours
- [ ] Handles 30 concurrent students without degradation

---

## Privacy & Data

- No student accounts required
- No personal information collected
- Playful usernames auto-generated (not student names)
- All session data automatically deleted after 24 hours
- No persistent storage of student responses
- Teacher cannot identify individual students (anonymous usernames only)