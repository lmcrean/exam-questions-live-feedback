# Iteration 4: Live Leaderboard

## Overview

Add a real-time leaderboard that displays student scores as they complete questions during the exam. This creates a competitive, gamified element that motivates students while maintaining the core immediate-feedback philosophy.

**Goal**: Students and teachers can see live rankings that update in real-time as answers are submitted and marked, creating an engaging classroom experience.

**Prerequisite**: Iterations 1-3 complete.

**Core Philosophy**: The leaderboard enhances the live, interactive nature of the platform. It works because students already have fun anonymized usernames (e.g., "Cosmic Penguin", "Dancing Banana") from Iteration 1, making competition playful rather than stressful.

---

## Design Principles

1. **Real-time updates**: Leaderboard updates instantly as students submit answers
2. **Playful competition**: Anonymous usernames keep it light and fun
3. **Teacher control**: Teachers can show/hide leaderboard at any time
4. **Fair ranking**: Multiple ranking strategies (total score, completion %, accuracy)
5. **Performance aware**: Updates must be efficient even with 50+ students
6. **Privacy first**: No personal information exposed, only fun usernames
7. **Mobile friendly**: Leaderboard works on all screen sizes

---

## Leaderboard Features

### Teacher Controls

**Session Settings:**
- Toggle leaderboard visibility (on/off for students)
- Choose ranking mode:
  - Total Score (default) - sum of marks earned
  - Completion Rate - % of questions completed
  - Accuracy - average % per question
  - Speed + Accuracy - balanced scoring
- Choose display style:
  - Full leaderboard (all students)
  - Top 10 only
  - Top 5 only
- Update frequency: real-time or 30-second intervals (for slower connections)

**Live Controls During Session:**
- Show/hide leaderboard button
- Freeze leaderboard (stops updates, useful for discussion)
- Unfreeze/resume updates
- Highlight specific student (e.g., "most improved")
- Reset scores (if restarting session)

### Student View

**Leaderboard Display (when enabled by teacher):**

```
┌─────────────────────────────────────────────────────┐
│                   🏆 LEADERBOARD 🏆                 │
│                   Live Rankings                     │
├──────┬─────────────────────┬────────┬────────┬──────┤
│ Rank │ Student             │ Score  │  Done  │  %   │
├──────┼─────────────────────┼────────┼────────┼──────┤
│  🥇  │ Cosmic Penguin      │  42/51 │  14/16 │ 82%  │
│  🥈  │ Turbo Llama         │  38/51 │  16/16 │ 75%  │
│  🥉  │ Dancing Banana      │  35/51 │  12/16 │ 73%  │
│  4   │ Sparkly Dolphin     │  32/51 │  13/16 │ 62%  │
│  5   │ Bouncy Giraffe      │  30/51 │  11/16 │ 60%  │
│  6   │ 🔥 YOU 🔥          │  28/51 │  10/16 │ 56%  │ ← Highlighted
│  7   │ Electric Panda      │  25/51 │   9/16 │ 49%  │
│  8   │ Quantum Hedgehog    │  22/51 │   8/16 │ 44%  │
│  9   │ Mystic Octopus      │  20/51 │   7/16 │ 40%  │
│ 10   │ Speedy Koala        │  18/51 │   6/16 │ 35%  │
│      │ + 15 more...        │        │        │      │
└──────┴─────────────────────┴────────┴────────┴──────┘
           Last updated: Just now
```

**Key Elements:**
- Top 3 get medal emojis (🥇🥈🥉)
- Current user row highlighted with fire emojis
- Real-time score updates with smooth animations
- Indicator shows when leaderboard updates ("Just now", "5s ago")
- "Jump to me" button to scroll to your position if outside top 10

**Position Changes Animation:**
```
When student moves up:
  - Row slides up to new position
  - Brief green highlight flash
  - Optional sound effect (teacher can disable)

When student moves down:
  - Row slides down to new position
  - Brief yellow highlight flash

When student overtakes you:
  - Notification toast: "🔥 Turbo Llama passed you!"
```

### Teacher Dashboard View

**Enhanced Live Monitoring:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Session: OCR GCSE CS Programming Languages    ⏱️ 35:42 remaining│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 LEADERBOARD        [👁️ Visible to students]  [⏸️ Freeze]    │
│                                                                 │
│  1. 🥇 Cosmic Penguin      42/51  (82%)  ████████░░  14/16 ✅  │
│  2. 🥈 Turbo Llama         38/51  (75%)  ████████░░  16/16 ✅  │
│  3. 🥉 Dancing Banana      35/51  (73%)  ███████░░░  12/16     │
│  4. Sparkly Dolphin        32/51  (62%)  ███████░░░  13/16     │
│  5. Bouncy Giraffe         30/51  (60%)  ██████░░░░  11/16     │
│  6. Electric Panda         28/51  (56%)  ██████░░░░  10/16     │
│  7. Quantum Hedgehog       25/51  (49%)  █████░░░░░   9/16     │
│  8. Mystic Octopus         22/51  (44%)  █████░░░░░   8/16     │
│  9. Speedy Koala           20/51  (40%)  ████░░░░░░   7/16     │
│ 10. Silly Mongoose         18/51  (35%)  ███░░░░░░░   6/16     │
│                                                                 │
│ + 15 more students (view all)                                   │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ Class Stats:                                                    │
│ Average Score: 28/51 (55%)                                      │
│ Average Completion: 10/16 questions (63%)                       │
│ Students Finished: 3/25                                         │
│                                                                 │
│ Ranking Mode: [Total Score ▼]                                  │
│ Display: [Full Leaderboard ▼]                                  │
│                                                                 │
│ [Export Leaderboard CSV] [Project to Screen] [View Analytics]  │
└─────────────────────────────────────────────────────────────────┘
```

**Additional Teacher Features:**
- Click student name to view their detailed progress
- See which students are "stuck" (no activity in 5+ minutes)
- Identify "speed runners" who may be rushing without reading
- Export leaderboard as PDF/CSV for records
- Project leaderboard mode (full-screen, no controls, for classroom display)

---

## Ranking Modes

### 1. Total Score (Default)
```
Rank = Total marks earned
Tiebreaker: More questions completed → Earlier submission time
```

**Use case**: Standard competitive mode

### 2. Completion Rate
```
Rank = (Questions completed / Total questions) × 100
Tiebreaker: Higher total score → Earlier completion
```

**Use case**: Encouraging students to attempt all questions, not just easy ones

### 3. Accuracy
```
Rank = Average score per question attempted
Formula: Total marks earned / Total marks available for attempted questions
Tiebreaker: More questions completed → Higher total score
```

**Use case**: Rewarding quality over quantity, discourages rushing

### 4. Speed + Accuracy (Balanced)
```
Rank = (Accuracy × 0.7) + (Completion Speed × 0.3)
Where:
  Accuracy = (Total marks / Total possible marks) × 100
  Completion Speed = 100 - ((Time taken / Time limit) × 100)
Tiebreaker: Higher accuracy
```

**Use case**: Balancing both speed and correctness

---

## Real-Time Updates

### WebSocket Events

**New Events for Leaderboard:**

```typescript
// Server -> Client (Students)
'leaderboard:update'       // Full leaderboard data
'leaderboard:position'     // Your position changed
'leaderboard:visibility'   // Teacher toggled visibility
'leaderboard:frozen'       // Teacher froze leaderboard

// Server -> Client (Teacher)
'leaderboard:update'       // Full leaderboard data
'student:position_change'  // Individual student moved

// Client -> Server
'leaderboard:subscribe'    // Request leaderboard updates
'leaderboard:unsubscribe'  // Stop receiving updates
```

**Event Payload Examples:**

```typescript
// leaderboard:update
{
  sessionId: "abc123",
  timestamp: "2025-01-15T10:30:45Z",
  rankings: [
    {
      rank: 1,
      previousRank: 1,
      participantId: "p1",
      username: "Cosmic Penguin",
      totalScore: 42,
      maxScore: 51,
      questionsCompleted: 14,
      totalQuestions: 16,
      accuracy: 82,
      isCurrentUser: false
    },
    {
      rank: 2,
      previousRank: 3,  // Moved up!
      participantId: "p2",
      username: "Turbo Llama",
      totalScore: 38,
      maxScore: 51,
      questionsCompleted: 16,
      totalQuestions: 16,
      accuracy: 75,
      isCurrentUser: false
    },
    // ... more entries
  ],
  visible: true,
  frozen: false,
  rankingMode: "total-score"
}

// leaderboard:position (personalized)
{
  participantId: "p5",
  rank: 6,
  previousRank: 8,
  message: "🎉 You moved up 2 places!",
  overtook: ["Electric Panda", "Quantum Hedgehog"]
}
```

### Update Frequency & Optimization

**Strategies to minimize bandwidth:**

1. **Smart Updates**: Only send changes, not full leaderboard each time
   ```typescript
   interface LeaderboardDelta {
     added: Participant[];
     updated: Participant[];
     removed: string[];  // participantIds
     timestamp: string;
   }
   ```

2. **Throttling**: Batch updates every 2 seconds instead of instant
   ```typescript
   // Server-side throttle
   const LEADERBOARD_UPDATE_INTERVAL = 2000; // 2 seconds
   ```

3. **Personalized Data**: Students only receive:
   - Top 10 (or teacher-configured limit)
   - 3 above them
   - Themselves
   - 3 below them
   - Total count

4. **Compression**: Use binary format for large sessions (50+ students)

---

## Visual Design

### Student Leaderboard Widget

**Compact Mode (during exam):**
```
┌──────────────────────┐
│ 🏆 Your Rank: 6/25   │
│ Score: 28/51 (56%)   │
│ [View Full Board]    │
└──────────────────────┘
```

**Expanded Mode (when clicked):**
```
┌───────────────────────────────────────────┐
│          🏆 LIVE LEADERBOARD 🏆           │
│                                           │
│  1. 🥇 Cosmic Penguin    42/51  ████████  │
│  2. 🥈 Turbo Llama       38/51  ███████░  │
│  3. 🥉 Dancing Banana    35/51  ██████░░  │
│  4. Sparkly Dolphin      32/51  ██████░░  │
│  5. Bouncy Giraffe       30/51  █████░░░  │
│  6. 🔥 YOU 🔥           28/51  █████░░░  │
│  7. Electric Panda       25/51  ████░░░░  │
│                                           │
│ [Close] [Jump to Top] [Share Screenshot] │
└───────────────────────────────────────────┘
```

### Teacher Projection Mode

**Full-Screen Classroom Display:**
```
═══════════════════════════════════════════════════════
                 🏆 CLASS LEADERBOARD 🏆
                                            [Hide] [⏸️ Pause]
───────────────────────────────────────────────────────

         1. 🥇  Cosmic Penguin        42/51
         2. 🥈  Turbo Llama           38/51
         3. 🥉  Dancing Banana        35/51
         4.     Sparkly Dolphin       32/51
         5.     Bouncy Giraffe        30/51
         6.     Electric Panda        28/51
         7.     Quantum Hedgehog      25/51
         8.     Mystic Octopus        22/51
         9.     Speedy Koala          20/51
        10.     Silly Mongoose        18/51

═══════════════════════════════════════════════════════
    Average Score: 28/51  •  23 students active
```

**Features:**
- Large text (readable from back of classroom)
- Auto-scrolls if more than 10 students
- Smooth animations for position changes
- QR code for students to join (optional)
- Can be displayed on second screen/projector

---

## Privacy & Fairness Considerations

### Privacy Safeguards

1. **No Personal Information**: Only anonymous usernames displayed
2. **Optional Participation**: Students can request to be hidden from leaderboard
   ```
   Settings → "Hide me from leaderboard" ☐
   (Teacher will still see your score, but other students won't)
   ```
3. **Post-Session Privacy**: Leaderboard data deleted with session (24-hour cleanup)

### Anti-Gaming Measures

1. **Username Lock**: Cannot change username mid-session
2. **Submission Lock**: Cannot resubmit same question (marks are final)
3. **Time-Based Tiebreakers**: Prevents score manipulation
4. **Answer Validation**: Blank/spam answers don't count toward completion

### Fairness Features

1. **Late Joiners**: Can still participate, but marked as "Late" in teacher view
2. **Disconnection Handling**: Position frozen during disconnect, restored on reconnect
3. **Difficulty Weighting**: Optional: Questions worth more marks ranked higher automatically

---

## Database Schema Additions

```sql
-- Leaderboard configuration per session
ALTER TABLE sessions ADD COLUMN leaderboard_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE sessions ADD COLUMN leaderboard_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE sessions ADD COLUMN leaderboard_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN ranking_mode VARCHAR(50) DEFAULT 'total-score';
ALTER TABLE sessions ADD COLUMN display_style VARCHAR(50) DEFAULT 'full';
ALTER TABLE sessions ADD COLUMN update_frequency INT DEFAULT 2000;

-- Participant preferences
ALTER TABLE participants ADD COLUMN hide_from_leaderboard BOOLEAN DEFAULT FALSE;

-- Leaderboard snapshots (for analytics)
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY,
  session_id VARCHAR(50) REFERENCES sessions(code),
  snapshot_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create index for fast leaderboard queries
CREATE INDEX idx_responses_participant_score
  ON responses(participant_id, marks_awarded, submitted_at);

CREATE INDEX idx_participants_session_score
  ON participants(session_id, total_score DESC, questions_completed DESC);
```

---

## API Endpoints

```
GET    /api/sessions/:id/leaderboard        Get current leaderboard
PATCH  /api/sessions/:id/leaderboard        Update leaderboard settings
POST   /api/sessions/:id/leaderboard/freeze Toggle freeze state
GET    /api/sessions/:id/leaderboard/export Export leaderboard (CSV/PDF)
GET    /api/participants/:id/position       Get specific participant's rank
PATCH  /api/participants/:id/preferences    Update leaderboard visibility preference
```

---

## Leaderboard Calculation Logic

```typescript
interface LeaderboardCalculator {
  calculateRankings(
    session: Session,
    participants: Participant[],
    responses: Response[],
    mode: RankingMode
  ): LeaderboardEntry[];
}

// Example implementation
const calculateRankings = (
  session: Session,
  participants: Participant[],
  responses: Response[],
  mode: RankingMode
): LeaderboardEntry[] => {
  const entries = participants
    .filter(p => !p.hideFromLeaderboard)
    .map(p => {
      const participantResponses = responses.filter(r => r.participantId === p.id);

      const totalScore = participantResponses.reduce((sum, r) => sum + r.marksAwarded, 0);
      const maxScore = participantResponses.reduce((sum, r) => sum + r.maxMarks, 0);
      const questionsCompleted = participantResponses.length;
      const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      let rankValue: number;

      switch (mode) {
        case 'total-score':
          rankValue = totalScore;
          break;
        case 'completion-rate':
          rankValue = (questionsCompleted / session.totalQuestions) * 100;
          break;
        case 'accuracy':
          rankValue = accuracy;
          break;
        case 'speed-accuracy':
          const timeRatio = calculateTimeRatio(p, session);
          rankValue = (accuracy * 0.7) + (timeRatio * 0.3);
          break;
        default:
          rankValue = totalScore;
      }

      return {
        participantId: p.id,
        username: p.username,
        totalScore,
        maxScore,
        questionsCompleted,
        totalQuestions: session.totalQuestions,
        accuracy: Math.round(accuracy),
        rankValue,
        lastSubmission: getLastSubmissionTime(participantResponses)
      };
    });

  // Sort by rank value (descending), then by questions completed, then by submission time
  entries.sort((a, b) => {
    if (b.rankValue !== a.rankValue) return b.rankValue - a.rankValue;
    if (b.questionsCompleted !== a.questionsCompleted) return b.questionsCompleted - a.questionsCompleted;
    return a.lastSubmission.getTime() - b.lastSubmission.getTime();
  });

  // Assign ranks
  let currentRank = 1;
  entries.forEach((entry, index) => {
    if (index > 0 && entry.rankValue === entries[index - 1].rankValue) {
      entry.rank = entries[index - 1].rank; // Tie
    } else {
      entry.rank = currentRank;
    }
    currentRank++;
  });

  return entries;
};
```

---

## Performance Considerations

### Caching Strategy

```typescript
// Redis cache for leaderboard
const LEADERBOARD_CACHE_KEY = (sessionId: string) => `leaderboard:${sessionId}`;
const LEADERBOARD_CACHE_TTL = 2; // seconds

// On answer submission:
async function onAnswerSubmitted(response: Response) {
  // 1. Mark answer
  const feedback = await markAnswer(response);

  // 2. Invalidate cache
  await redis.del(LEADERBOARD_CACHE_KEY(response.sessionId));

  // 3. Recalculate in background (throttled)
  throttledLeaderboardUpdate(response.sessionId);

  // 4. Return feedback immediately
  return feedback;
}
```

### Optimization for Large Classes

**For sessions with 50+ students:**

1. **Paginated Updates**: Send only visible portion of leaderboard
2. **Debouncing**: Group updates that happen within 2 seconds
3. **Lazy Loading**: Load full leaderboard only when requested
4. **Materialized View**: Pre-calculate rankings in database

```sql
-- Materialized view for fast leaderboard queries
CREATE MATERIALIZED VIEW leaderboard_rankings AS
  SELECT
    p.id,
    p.session_id,
    p.username,
    COALESCE(SUM(r.marks_awarded), 0) as total_score,
    COUNT(r.id) as questions_completed,
    MAX(r.submitted_at) as last_submission
  FROM participants p
  LEFT JOIN responses r ON r.participant_id = p.id
  WHERE p.hide_from_leaderboard = FALSE
  GROUP BY p.id, p.session_id, p.username;

-- Refresh on each submission (or periodically)
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;
```

---

## Edge Cases & Handling

### Ties

**Scenario**: Two students have same score

**Resolution**:
1. First tiebreaker: More questions completed
2. Second tiebreaker: Earlier last submission time
3. Display: Both show same rank number
   ```
   3. Sparkly Dolphin    32/51
   3. Bouncy Giraffe     32/51  (tie)
   5. Electric Panda     28/51
   ```

### Late Joiners

**Scenario**: Student joins after exam starts

**Handling**:
- Can still participate and appear on leaderboard
- Teacher view shows "Late" badge
- Ranking is fair (based on marks earned, not join time)

### Mid-Session Disconnections

**Scenario**: Student loses connection for 5 minutes

**Handling**:
- Position frozen in leaderboard (shows last known score)
- Gray out name or add "⚠️" indicator
- On reconnect, immediately recalculate position

### Teacher Hides Leaderboard Mid-Session

**Scenario**: Teacher turns off leaderboard during exam

**Handling**:
- WebSocket event sent to all students
- Leaderboard widget smoothly animates out
- Students see: "Leaderboard hidden by teacher"
- Can still complete exam normally

### Student Requests to be Hidden

**Scenario**: Student opts out of public leaderboard

**Handling**:
- Setting takes effect immediately
- Leaderboard recalculates without them
- Teacher can still see their score in admin panel
- Other students see: "24 students ranked" instead of "25"

### Rapid Answer Submissions

**Scenario**: Student submits 5 answers in 10 seconds

**Handling**:
- Each submission triggers AI marking independently
- Leaderboard updates throttled (batched every 2s)
- Single WebSocket message with all position changes
- Smooth animation shows progression

### Session Ends While Viewing Leaderboard

**Scenario**: Timer expires while student looking at leaderboard

**Handling**:
- Final leaderboard state frozen
- Message: "🏁 Exam Complete - Final Rankings"
- No more updates
- Confetti animation for top 3 (optional)

---

## Testing Requirements

### Unit Tests

- Ranking calculation logic for all modes
- Tiebreaker rules
- Score aggregation
- Position change detection

### Integration Tests

- WebSocket events trigger correctly
- Leaderboard updates on answer submission
- Teacher controls affect student views
- Caching invalidation works

### Performance Tests

- 50 concurrent students submitting answers
- Leaderboard update latency < 500ms
- WebSocket message size acceptable
- No memory leaks on long sessions

### Manual Test Scenarios

1. **Basic Flow**: 5 students, submit answers, verify rankings correct
2. **Position Changes**: Submit answer that causes rank change, verify animation
3. **Teacher Controls**: Toggle visibility, freeze, change modes
4. **Ties**: Create tie scenario, verify display
5. **Late Join**: Join mid-session, verify can still rank
6. **Disconnect**: Simulate disconnect/reconnect, verify state restored
7. **Hide Setting**: Student opts out, verify removed from board
8. **Projection Mode**: Display on projector, verify readability
9. **Export**: Export leaderboard, verify CSV format
10. **Stress Test**: 30+ students rapid submissions

---

## Success Criteria

### Must Have (MVP)

- [ ] Teacher can enable/disable leaderboard per session
- [ ] Teacher can show/hide leaderboard during session
- [ ] Students see real-time rankings when leaderboard enabled
- [ ] Rankings update within 3 seconds of answer submission
- [ ] Top 3 displayed with medal emojis
- [ ] Current user's position highlighted
- [ ] At least 2 ranking modes implemented (total score + one other)
- [ ] Position changes animate smoothly
- [ ] Works with 30 concurrent students without lag
- [ ] Students can opt out of public leaderboard

### Should Have

- [ ] All 4 ranking modes implemented
- [ ] Teacher projection mode for classroom display
- [ ] Position change notifications
- [ ] Export leaderboard as CSV
- [ ] Leaderboard snapshots for post-session analysis
- [ ] "Jump to me" button for students outside top 10
- [ ] Late joiner indicators

### Nice to Have

- [ ] Confetti animation for rank improvements
- [ ] Sound effects for position changes (with mute option)
- [ ] "Most improved" tracking during session
- [ ] Share screenshot feature
- [ ] Leaderboard history graph (position over time)
- [ ] Team mode (groups of students, aggregate scores)
- [ ] Custom rank labels (teacher-defined: "Expert", "Proficient", etc.)

---

## Future Enhancements (Beyond Iteration 4)

- **Badges & Achievements**: Award badges for milestones (first to finish, perfect score, etc.)
- **Historical Leaderboards**: Compare performance across multiple sessions
- **Class-vs-Class**: Leaderboards spanning multiple sessions/classes
- **Personalized Goals**: Students set targets and track progress
- **AI Coach**: Personalized suggestions based on leaderboard position
