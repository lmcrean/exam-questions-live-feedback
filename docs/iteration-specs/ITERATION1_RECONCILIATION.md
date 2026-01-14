# Iteration 1 Reconciliation Plan

> **Purpose**: Bridge from Dottie (health tracking app) to ExamHost (exam platform) by removing all Dottie features and building Iteration 1 MVP with existing technologies.

---

## Executive Summary

**Strategy**: Complete replacement of Dottie application features while preserving underlying technology stack.

**Iteration 1 MVP Definition** (Simplified):
- Hardcoded exam questions stored as markdown files
- Students join session, answer questions
- After submission, students see mark scheme and manually assess their own work
- Students enter their self-assessed marks
- Students see running total of marks
- **NO AI marking** (comes in iteration 2)
- **NO teacher monitoring** (comes in iteration 2)
- **NO leaderboard** (comes in iteration 4)
- **NO real-time features** (comes later)

**Timeline to MVP**: ~5-7 implementation phases (detailed below)

---

## Part 1: What We're Removing (Dottie Features)

### Database Tables - TO BE DELETED

```sql
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS symptoms;
DROP TABLE IF EXISTS period_logs;
DROP TABLE IF EXISTS refresh_tokens;
-- Keep: users table (will repurpose for teacher auth later)
```

**Rationale**: Dottie's entire data model (health tracking, chat, assessments) is irrelevant to exam hosting.

### API Routes - TO BE DELETED

```
DELETE /api/assessment/*     # Health questionnaire endpoints
DELETE /api/chat/*           # Chat conversation endpoints
DELETE /api/admin/*          # Gemini usage monitoring
DELETE /api/setup/*          # Database init (will rebuild)
```

**Keep**:
- `/api/auth/*` - Will repurpose for teacher authentication
- `/api/user/*` - Will repurpose for session management

### Frontend Pages - TO BE DELETED

```
DELETE /src/pages/assessment/*     # Multi-step health questionnaire
DELETE /src/pages/chat/*           # Chat interface with Dottie
DELETE /src/pages/user/*           # User profile pages
DELETE /src/pages/auth/sign-up.tsx # No student accounts in MVP
DELETE /src/pages/landing.tsx      # Dottie landing page
```

**Keep**:
- `/src/pages/auth/sign-in.tsx` - Repurpose for teacher login
- App shell (routing, layouts, contexts)

### Frontend Components - TO BE DELETED

```
DELETE /src/components/Chat/*          # Chat interface components
DELETE /src/components/Assessment/*    # Health form components
DELETE /src/components/DottieMascot/*  # Three.js 3D mascot
DELETE /src/components/Profile/*       # User profile UI
```

**Keep**:
- `/src/components/Layout/*` - Header, navigation, layouts
- `/src/components/UI/*` - Buttons, inputs, cards (Tailwind components)
- `/src/api/*` - API client structure (will modify endpoints)

### Services - TO BE DELETED

```
DELETE /apps/api/services/gemini.ts       # AI chat service (not needed for MVP)
DELETE /apps/api/services/assessment.ts   # Health assessment logic
DELETE /apps/api/services/chat.ts         # Chat message handling
```

**Keep**:
- `/apps/api/services/auth.ts` - JWT authentication (repurpose)
- Database connection logic

---

## Part 2: What We're Keeping (Technology Stack)

### Backend Infrastructure ✓

| Technology | Current Use | New Use |
|------------|-------------|---------|
| **Node.js + TypeScript** | Express API | Express API |
| **Express.js** | Route handling | Route handling |
| **PostgreSQL** | User/health data | Sessions/responses data |
| **Knex.js** | Query builder | Query builder |
| **JWT** | User authentication | Teacher authentication |
| **bcrypt** | Password hashing | Teacher password hashing |

### Frontend Infrastructure ✓

| Technology | Current Use | New Use |
|------------|-------------|---------|
| **React 18** | UI framework | UI framework |
| **TypeScript** | Type safety | Type safety |
| **Vite** | Build tool | Build tool |
| **React Router** | Page routing | Page routing |
| **Tailwind CSS** | Styling | Styling |
| **Axios** | HTTP client | HTTP client |
| **Framer Motion** | Animations | Animations |

### Development Tools ✓

- **ESLint** + **Prettier** - Code formatting
- **Playwright** - E2E testing structure
- **Vitest** - Unit testing
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

### Deployment Infrastructure ✓

- **NeonDB** - PostgreSQL hosting
- **Firebase Hosting** - Frontend deployment
- **Vercel** - Backend API deployment

---

## Part 3: Iteration 1 MVP Specification (Simplified)

### Scope Reduction from Full Spec

The full `ITERATION1_core.md` spec includes:
- ❌ AI marking with Gemini API
- ❌ Teacher monitoring dashboard
- ❌ Real-time leaderboard
- ❌ WebSocket events
- ❌ Session management (codes, timer)
- ❌ Analytics dashboard

**Iteration 1 MVP** (this reconciliation):
- ✅ Hardcoded exam questions (markdown files)
- ✅ Student answer submission
- ✅ Mark scheme display after submission
- ✅ **Manual self-assessment** (students enter their own marks)
- ✅ Running total display
- ✅ Basic navigation between questions

**Why This Approach?**
1. **Foundation first**: Build core data flow (question → answer → mark scheme → score)
2. **Test content pipeline**: Ensure markdown parsing works correctly
3. **Validate UX**: Does the manual marking flow feel good?
4. **No external dependencies**: No AI API, no WebSockets, just CRUD operations
5. **Iteration 2 adds AI**: Once manual flow works, swap self-assessment for AI marking

---

## Part 4: New Database Schema (Iteration 1 MVP)

### Minimal Schema for MVP

```sql
-- Sessions: One hardcoded session for testing
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,                    -- e.g., "test-session-001"
  exam_id VARCHAR(100) NOT NULL,                -- e.g., "ocr-gcse-cs-programming-languages"
  status VARCHAR(20) DEFAULT 'active',          -- 'active' | 'ended'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participants: Students in session (anonymous, no auth)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,               -- Auto-generated or manual entry for MVP
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Responses: Student answers to questions
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,             -- e.g., "1a", "2b"
  answer_text TEXT NOT NULL,
  marks_awarded INT NOT NULL DEFAULT 0,         -- Student's self-assessed mark
  max_marks INT NOT NULL,                       -- From question metadata
  submitted_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(participant_id, question_id)           -- One response per question per student
);

-- Questions cache: Parsed from markdown files
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id VARCHAR(100) NOT NULL,
  question_id VARCHAR(50) NOT NULL,             -- e.g., "1a"
  difficulty VARCHAR(20),                       -- 'easy' | 'medium' | 'hard'
  question_text TEXT NOT NULL,
  marks INT NOT NULL,
  question_type VARCHAR(50),                    -- 'short-answer', 'extended-response', etc.
  context TEXT,                                 -- Optional context paragraph
  mark_scheme TEXT NOT NULL,                    -- Full mark scheme markdown content

  UNIQUE(exam_id, question_id)
);

-- Exam metadata: Parsed from metadata.json
CREATE TABLE exams (
  id VARCHAR(100) PRIMARY KEY,                  -- e.g., "ocr-gcse-cs-programming-languages"
  title VARCHAR(200) NOT NULL,
  board VARCHAR(50),                            -- e.g., "OCR"
  level VARCHAR(50),                            -- e.g., "GCSE"
  subject VARCHAR(100),                         -- e.g., "Computer Science"
  total_marks INT,
  time_minutes INT,
  metadata JSONB,                               -- Full metadata.json content
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Migration Strategy

1. **Phase 1**: Create new tables (sessions, participants, responses, questions, exams)
2. **Phase 2**: Keep Dottie tables intact during development
3. **Phase 3**: Once MVP is working, drop Dottie tables in separate migration
4. **Rollback**: If needed, restore from Git history

---

## Part 5: New API Endpoints (Iteration 1 MVP)

### Minimal API for MVP

```typescript
// ============================================
// EXAM CONTENT (Read-only, hardcoded)
// ============================================

GET /api/exams
// Returns: List of available exams
// Response: [{ id, title, board, level, subject, totalMarks }]

GET /api/exams/:examId/questions
// Returns: All questions for exam (parsed from markdown)
// Response: [{ questionId, questionText, marks, markScheme, context }]

// ============================================
// SESSION MANAGEMENT (Simplified)
// ============================================

POST /api/sessions/create-test
// Creates hardcoded test session with code "TEST001"
// Body: { examId: "ocr-gcse-cs-programming-languages" }
// Response: { sessionId, code }

GET /api/sessions/:code
// Get session details by join code
// Response: { id, code, examId, status }

// ============================================
// PARTICIPANT (Anonymous)
// ============================================

POST /api/sessions/:code/join
// Student joins session (no auth required)
// Body: { username: "Student123" }  // Manual entry for MVP, later auto-generated
// Response: { participantId, username, sessionId }

// ============================================
// RESPONSES (Core submission flow)
// ============================================

POST /api/responses/submit
// Submit answer for marking
// Body: {
//   participantId: "uuid",
//   questionId: "1a",
//   answerText: "The CPU only understands machine code",
//   selfAssessedMarks: 1,    // Student enters this after seeing mark scheme
//   maxMarks: 1
// }
// Response: { responseId, marksAwarded, markScheme }

GET /api/responses/:participantId
// Get all responses for a participant
// Response: [{
//   questionId,
//   answerText,
//   marksAwarded,
//   maxMarks,
//   markScheme,
//   submittedAt
// }]

GET /api/responses/:participantId/total
// Get total marks for participant
// Response: {
//   totalMarks: 15,
//   maxPossibleMarks: 20,
//   questionsAnswered: 5,
//   percentage: 75
// }
```

### What We're NOT Building (Yet)

```typescript
// NOT IN ITERATION 1 MVP:
❌ POST /api/auth/teacher-login        // No teacher auth yet
❌ GET  /api/sessions/:id/monitor      // No monitoring dashboard
❌ GET  /api/sessions/:id/leaderboard  // No leaderboard
❌ GET  /api/analytics/:sessionId      // No analytics
❌ WebSocket endpoints                 // No real-time features
```

---

## Part 6: New Frontend Pages (Iteration 1 MVP)

### Student Journey (Simplified)

```
/join
├── Enter join code: "TEST001"
└── Enter username: "Student123"
    │
    ▼
/session/:sessionId/exam
├── Shows list of questions (1a, 1b, 2a, etc.)
├── Click question → /session/:sessionId/question/:questionId
    │
    ▼
/session/:sessionId/question/:questionId
├── Display question text and context
├── Text input area for answer
├── [Submit Answer] button
    │
    ▼
/session/:sessionId/question/:questionId/feedback
├── Show student's answer (read-only)
├── Show mark scheme (expanded view)
├── Input: "How many marks do you think you earned?"
│   ┌─────┐
│   │  1  │ / 1 marks
│   └─────┘
├── [Submit Self-Assessment] button
│   │
│   ▼
│   Updates total marks, returns to exam page
│
└── [Next Question] → Back to /session/:sessionId/exam
    │
    ▼
/session/:sessionId/summary
└── Display total marks: "You scored 15/20 (75%)"
```

### Page Components

```
/src/pages/
├── student/
│   ├── JoinSession.tsx              # Enter code + username
│   ├── ExamView.tsx                 # List of questions with completion status
│   ├── QuestionView.tsx             # Display question, answer input, submit
│   ├── FeedbackView.tsx             # Mark scheme + self-assessment input
│   └── SummaryView.tsx              # Final results
└── (Teacher pages come in Iteration 2)
```

### What We're NOT Building (Yet)

```
❌ /teacher/login                    # No teacher auth
❌ /teacher/dashboard                # No session creation UI
❌ /teacher/session/:id/monitor      # No monitoring
❌ /teacher/analytics/:id            # No analytics
❌ Leaderboard display               # Comes in Iteration 4
❌ Timer countdown                   # Comes in Iteration 2
```

---

## Part 7: Content Pipeline (Markdown → Database)

### File Structure (Already Defined in ITERATION1_core.md)

```
/content/
└── ocr-gcse-cs-programming-languages/
    ├── metadata.json                # Exam info
    ├── easy/
    │   ├── 1a_Q.md                  # Question
    │   └── 1a_MS.md                 # Mark scheme
    ├── medium/
    │   ├── 1_Q.md
    │   └── 1_MS.md
    └── hard/
        ├── 1_Q.md
        └── 1_MS.md
```

### Parser Script (New)

```typescript
// apps/api/scripts/parse-content.ts

/**
 * Parses markdown files and populates database
 * Run: npm run parse-content
 */

async function parseContent() {
  // 1. Read metadata.json → Insert into exams table
  // 2. For each difficulty folder:
  //    - Read *_Q.md files → Parse frontmatter + content
  //    - Read *_MS.md files → Parse frontmatter + content
  //    - Insert into questions table
  // 3. Log summary: "Loaded 16 questions for exam X"
}
```

### Manual Step (For MVP)

```bash
# 1. Create hardcoded test content in /content/test-exam/
mkdir -p content/test-exam/easy
echo "Test question 1a" > content/test-exam/easy/1a_Q.md
echo "Test mark scheme 1a" > content/test-exam/easy/1a_MS.md

# 2. Run parser
npm run parse-content

# 3. Verify in database
psql $DATABASE_URL -c "SELECT * FROM questions;"

# 4. Create test session
curl -X POST http://localhost:3000/api/sessions/create-test \
  -H "Content-Type: application/json" \
  -d '{"examId": "test-exam"}'

# 5. Test in browser: http://localhost:5173/join
```

---

## Part 8: Implementation Phases

### Phase 0: Preparation (Current Step)
- [x] Document reconciliation plan
- [ ] Review and approve reconciliation plan
- [ ] Create new Git branch: `feature/iteration-1-mvp`

### Phase 1: Database Foundation (~1 hour)
- [ ] Create migration: Add new tables (sessions, participants, responses, questions, exams)
- [ ] Write seed data: One test exam with 3 questions
- [ ] Test migration: Verify schema with `\dt` in psql

**Success Criteria**: Can query `SELECT * FROM questions` and see test data

### Phase 2: Content Parser (~2 hours)
- [ ] Create `/content/test-exam/` folder with sample questions
- [ ] Write parser script: `apps/api/scripts/parse-content.ts`
- [ ] Parse markdown files → Insert into `questions` and `exams` tables
- [ ] Run parser: `npm run parse-content`

**Success Criteria**: Parser loads 3 questions from markdown into database

### Phase 3: Backend API (~3 hours)
- [ ] Create routes: `/api/exams`, `/api/sessions`, `/api/responses`
- [ ] Implement endpoints:
  - `GET /api/exams/:examId/questions`
  - `POST /api/sessions/create-test`
  - `POST /api/sessions/:code/join`
  - `POST /api/responses/submit`
  - `GET /api/responses/:participantId`
  - `GET /api/responses/:participantId/total`
- [ ] Test with cURL or Postman

**Success Criteria**: Can join session, submit answer, retrieve total marks via API

### Phase 4: Frontend - Join Flow (~2 hours)
- [ ] Create pages: `JoinSession.tsx`
- [ ] Form: Enter code + username → Call `/api/sessions/:code/join`
- [ ] Store participantId in localStorage
- [ ] Redirect to `/session/:sessionId/exam`

**Success Criteria**: Can join session in browser and be redirected to exam view

### Phase 5: Frontend - Exam View (~3 hours)
- [ ] Create page: `ExamView.tsx`
- [ ] Fetch questions: `GET /api/exams/:examId/questions`
- [ ] Display question list with completion status
- [ ] Click question → Navigate to `/session/:sessionId/question/:questionId`

**Success Criteria**: See list of questions, can click to view individual question

### Phase 6: Frontend - Question & Submission (~3 hours)
- [ ] Create page: `QuestionView.tsx`
- [ ] Display question text, context, marks
- [ ] Text input for answer
- [ ] Submit button → Call `POST /api/responses/submit` (with marks=0 initially)
- [ ] On submit → Navigate to `/session/:sessionId/question/:questionId/feedback`

**Success Criteria**: Can type answer and submit, see feedback page

### Phase 7: Frontend - Self-Assessment (~2 hours)
- [ ] Create page: `FeedbackView.tsx`
- [ ] Display student's answer (read-only)
- [ ] Display mark scheme (full text from database)
- [ ] Input: "How many marks?" (number input, max = question marks)
- [ ] Submit button → Update response with self-assessed marks
- [ ] Update total marks display
- [ ] Button: [Next Question] → Back to ExamView

**Success Criteria**: Can self-assess, see updated total marks

### Phase 8: Frontend - Summary View (~1 hour)
- [ ] Create page: `SummaryView.tsx`
- [ ] Fetch total marks: `GET /api/responses/:participantId/total`
- [ ] Display: Total, percentage, questions answered
- [ ] Button: [Return to Question List]

**Success Criteria**: See final score summary

### Phase 9: Polish & Testing (~2 hours)
- [ ] Add loading states (spinners)
- [ ] Add error handling (API failures)
- [ ] Add validation (empty answers, invalid mark input)
- [ ] Add styling (Tailwind, make it look clean)
- [ ] Manual testing: Complete full user journey

**Success Criteria**: Smooth, error-free user experience

### Phase 10: Commit & Deploy (~1 hour)
- [ ] Clean up console.logs
- [ ] Write commit messages
- [ ] Push to branch
- [ ] Deploy to staging (Firebase + Vercel)
- [ ] Test on staging environment

**Success Criteria**: Working MVP on live staging URL

---

## Part 9: Success Criteria for Iteration 1 MVP

### Must Have (Definition of Done)

- [x] Database schema created and seeded with test data
- [ ] Content parser can load questions from markdown files
- [ ] Student can join session with code + username
- [ ] Student can view list of questions
- [ ] Student can submit answer to a question
- [ ] After submission, student sees mark scheme
- [ ] Student can enter self-assessed mark (0 to max marks)
- [ ] Student sees running total of marks
- [ ] Student can complete all questions and see final summary
- [ ] No errors, no broken UI, clean code

### Should Have (Nice to Have)

- [ ] Question navigation shows completion status (✓ answered, ○ not answered)
- [ ] Can revisit previous questions to view answers + mark schemes
- [ ] Loading states for API calls
- [ ] Basic error messages for network failures

### Won't Have (Explicitly Out of Scope)

- ❌ AI marking (Iteration 2)
- ❌ Teacher authentication (Iteration 2)
- ❌ Teacher dashboard (Iteration 2)
- ❌ Session management (create, pause, end) (Iteration 2)
- ❌ Real-time features (WebSockets) (Iteration 2)
- ❌ Leaderboard (Iteration 4)
- ❌ Timer countdown (Iteration 2)
- ❌ Analytics dashboard (Iteration 3)
- ❌ Auto-generated playful usernames (Iteration 2)
- ❌ Data cleanup after 24 hours (Iteration 2)

---

## Part 10: What Dottie Code Can Be Reused?

### Reusable Patterns

| Dottie Component | New Purpose | Modifications Needed |
|------------------|-------------|---------------------|
| `apps/api/server.ts` | Express server setup | Remove Dottie routes, add exam routes |
| `apps/api/db/connection.ts` | Database connection | Keep as-is |
| `apps/api/middleware/auth.ts` | JWT authentication | Simplify for teacher-only later |
| `apps/web/src/api/client.ts` | Axios HTTP client | Change base URL, update endpoints |
| `apps/web/src/context/AuthContext.tsx` | Auth state management | Simplify or remove (no auth in MVP) |
| `apps/web/src/components/Layout/Header.tsx` | Header layout | Remove Dottie branding |
| `apps/web/src/styles/` | Tailwind config | Keep as-is |

### Not Reusable (Delete)

- All Dottie models (`assessments`, `chat`, `symptoms`)
- All Dottie services (`gemini.ts`, `assessment.ts`)
- All Dottie routes (`/api/assessment`, `/api/chat`)
- All Dottie pages (`/assessment`, `/chat`, `/user`)
- All Dottie components (`Chat`, `Assessment`, `DottieMascot`)

---

## Part 11: Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Markdown parser fails on edge cases | Medium | Medium | Start with simple test content, add complexity gradually |
| Database schema needs changes mid-build | Medium | Low | Keep migrations reversible |
| Frontend state management gets complex | Low | Medium | Use React Context, keep it simple |
| Lost in scope creep (adding features) | High | High | **STICK TO MVP SPEC** - no AI, no teacher, no leaderboard |

### Time Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Phases take longer than estimated | Medium | Medium | Each phase is independent, can adjust |
| Content creation takes longer than coding | Low | Low | Use minimal test data (3 questions) |
| Polish phase balloons | High | Low | Set hard stop: MVP is functional, not perfect |

---

## Part 12: Next Steps (After Approval)

1. **Review this document** - User approves strategy
2. **Create feature branch** - `git checkout -b feature/iteration-1-mvp`
3. **Start Phase 1** - Create database migrations
4. **Iterate through phases** - Check off each step
5. **Deploy MVP** - Get live staging URL
6. **User testing** - Manual walkthrough
7. **Iteration 2 planning** - Add AI marking

---

## Questions for Review

Before proceeding, please confirm:

1. ✅ Remove ALL Dottie features (health tracking, chat, assessments)?
2. ✅ Build simplified MVP (no AI, no teacher, no leaderboard)?
3. ✅ Students manually self-assess their marks?
4. ✅ Implementation phases make sense (10 phases, ~20 hours total)?
5. ❓ Should we keep Dottie tables in parallel or drop immediately?
6. ❓ How many test questions do you want for MVP? (I suggested 3, can do more)
7. ❓ Do you want the test session code to be hardcoded as "TEST001" or dynamic?

---

**Ready to proceed?** Once approved, I'll start with Phase 1: Database migrations.
