# Value Hypothesis: AI-Assisted Marking for Data Drops

## Core Value Propositions

### For Teachers (Primary Driver)

**Time Savings:**
- Reduce marking time by 80%+ (from 55 hours to <10 hours for 330 students)
- Meet data drop deadlines without evening/weekend work
- Reclaim time for lesson planning and work-life balance

**Quality & Consistency:**
- AI applies consistent rubric to all students (no marking drift)
- Reduced cognitive load (AI does repetitive evaluation)
- Teacher maintains control (reviews and adjusts grades)
- Objective data through assessment analytics

**Data Drop Compliance:**
- Generate verified grades acceptable for official reporting
- Export grades directly to school systems
- Confidence to submit AI-assisted grades to leadership

### For Students (Secondary Driver)

**Instant Formative Feedback:**
- Receive WWW (What Went Well) and EBI (Even Better If) feedback immediately
- Learn from mistakes while content is fresh
- Opportunity to revise/resubmit before final deadline

**Multi-Source Assessment:**
- 4-way feedback model: Self → Peer → AI → Teacher
- Self-assessment develops metacognitive skills
- Peer review exposes students to different approaches
- AI provides consistent, detailed feedback
- Teacher verification ensures accuracy

**Learning Acceleration:**
- Faster feedback loop = faster improvement
- More detailed feedback than rushed manual marking
- Can compare own work to peers (if peer review enabled)

---

## Hypothesis Statement

**"If teachers could mark 330 students in under 10 hours with AI assistance (85%+ accuracy), they would adopt this for all data drop assessments, and students would improve faster with instant multi-source feedback."**

**Key Assumptions to Test:**
1. Teachers will trust AI grading enough to submit grades to leadership
2. 85% AI accuracy is sufficient (with teacher review)
3. Time savings (45+ hours) justifies learning new workflow
4. Instant feedback improves student learning outcomes
5. Self/peer assessment adds value without excessive friction

---

## Wizard of Oz Test

**Objective:** Validate value before building full product

### Test Setup

**Tools:**
- Google Classroom (for submissions)
- Spreadsheet (for mark scheme + grades)
- Manual "AI simulation" (you mark using consistent rubric)
- Google Forms (for student feedback collection)

**Workflow:**
1. Create assignment on Google Classroom with mark scheme (5 categories)
2. Students submit coursework (text or document)
3. [Optional] Students complete self-assessment form
4. [Optional] Students peer review (2-3 anonymised peers)
5. You manually mark all submissions (simulating AI speed/consistency)
6. Provide WWW/EBI feedback via Google Classroom comments
7. Teacher (you) reviews grades for accuracy
8. Export grades to CSV (simulate data drop export)

**Timing:**
- Setup: Track time to create assignment + mark scheme
- Marking: Time per student (target: <2 min vs. 10 min manual)
- Review: Time to spot-check grades for consistency
- Total: Must be <20% of manual marking time

---

## Key Questions

### Teacher Value (Primary)

**Time Savings:**
- How long does it take to mark 30 students with "AI assistance" (manual simulation)?
- Is it faster than traditional marking? (Target: 80% time savings)
- How long does review/adjustment take? (Must not offset time savings)

**Trust & Accuracy:**
- Do grades align with teacher's own judgement? (Target: 85%+ agreement)
- Would the teacher submit these grades for a real data drop?
- What accuracy threshold is needed for trust?

**Usability:**
- Is the workflow intuitive? (Setup + review)
- Does it fit into existing classroom workflow?
- Is it less stressful than manual marking?

### Student Value (Secondary)

**Feedback Quality:**
- Do students find AI feedback helpful? (Survey after)
- Is instant feedback more valuable than delayed detailed feedback?
- Do students act on the feedback (revise their work)?

**Multi-Source Assessment:**
- Does self-assessment help students reflect? (Or just extra work?)
- Does peer review add learning value? (Or just friction?)
- Is 4-way feedback overwhelming or enlightening?

**Learning Outcomes:**
- Do students improve on subsequent assignments?
- Evidence of learning from AI/peer feedback?

---

## Success Criteria

### Must-Have (Deal-Breakers)

**For Teacher Adoption:**
- ✅ Marking time reduced by 80%+ (from 55 hours to <10 hours)
- ✅ AI grades align with teacher judgement 85%+ of the time
- ✅ Teacher would confidently submit grades to leadership for data drop
- ✅ Setup + review time < 10 hours total (saves 45+ hours)
- ❌ FAILURE: Takes longer than manual marking, or grades are unreliable

**For Student Value:**
- ✅ Students receive feedback within 24 hours (vs. 1-2 weeks)
- ✅ Students report feedback is helpful (>70% positive survey)
- ✅ Evidence students act on feedback (revisions, improved next assignment)
- ❌ FAILURE: Students ignore feedback, or report it's not helpful

### Nice-to-Have (Not Essential for MVP)

**Enhanced Features:**
- Analytics/heatmaps show class patterns
- Integration with school MIS (SIMS, Arbor)
- Advanced rubrics (multi-criteria, weighted)
- Peer review workflow (if adds learning value)
- Self-assessment workflow (if helps metacognition)

---

## Measurement Plan

### Quantitative Metrics

**Timing (Critical):**
- [ ] Setup time: Create assignment + mark scheme (Target: <15 min)
- [ ] Marking time: Total time to mark 30 students (Target: <60 min = 2 min/student)
- [ ] Review time: Teacher spot-checks grades (Target: <30 min)
- [ ] Total time: Setup + marking + review (Target: <2 hours for 30 students = <10 hours for 330)
- [ ] Time saved vs. manual: (10 min × 30 = 300 min) - (120 min) = **180 min saved** for 30 students

**Accuracy (Critical):**
- [ ] Grade agreement: AI grade matches teacher judgement (Target: 85%+ of 30 students)
- [ ] Grade boundaries: Are AI grades within ±1 band of teacher grades? (Target: 95%+)
- [ ] Outlier count: How many require significant teacher adjustment? (Target: <5 of 30)

**Student Engagement:**
- [ ] Submission rate: X of 30 students submitted
- [ ] Self-assessment completion (if optional): X of 30 completed
- [ ] Peer review participation (if optional): X of 30 completed
- [ ] Feedback viewed: How many students accessed their feedback? (Target: 90%+)

### Qualitative Insights

**Teacher Experience:**
- [ ] "Would you trust these grades for an official data drop?" (Binary: Yes/No)
- [ ] "Was this faster/easier than manual marking?" (5-point scale)
- [ ] "Would you use this for your next data drop?" (Binary: Yes/No)
- [ ] "What accuracy % would you need to trust this?" (Open-ended)
- [ ] Direct quotes: What worked? What didn't? What's missing?

**Student Experience:**
- [ ] Post-submission survey: "Was the feedback helpful?" (5-point scale)
- [ ] "Did you understand the AI feedback?" (Yes/No + optional comment)
- [ ] "Did you revise your work based on feedback?" (Yes/No/Partially)
- [ ] "Was self-assessment helpful for learning?" (If included)
- [ ] "Did reviewing peer work help you understand?" (If included)
- [ ] Direct quotes: What was useful? What was confusing?

---

## Decision Tree (After Testing)

### Scenario A: Teachers Love It, High Accuracy ✅
**Evidence:**
- Marking time reduced by 80%+
- 85%+ grade accuracy
- Teacher would submit grades for real data drop
- Students find feedback helpful

**→ Next Action: Build MVP**
- Core: Submission → AI marking → Teacher review → Grade export
- Features: WWW/EBI feedback, simple rubric (1-5 scale)
- Skip: Self/peer review, analytics (add later if validated)
- Timeline: 4-6 weeks to working prototype

---

### Scenario B: Time Savings Great, Accuracy Concerns ⚠️
**Evidence:**
- Marking time reduced by 80%+
- But AI accuracy only 70-80% (below trust threshold)
- Teacher needs to review/adjust most grades (offsets time savings)

**→ Next Action: Improve AI or Pivot**
- Option 1: Refine AI prompt engineering (test with different models)
- Option 2: Add teacher calibration (teach AI from sample teacher marks)
- Option 3: Position as "first draft" tool (AI suggests, teacher finalizes quickly)
- Re-test accuracy before building full product

---

### Scenario C: Accuracy Good, Time Savings Insufficient ⚠️
**Evidence:**
- 85%+ grade accuracy (trust is there)
- But setup + review time only saves 30% (not 80%)
- Not worth switching from manual marking

**→ Next Action: Optimize Workflow**
- Streamline setup process (templates, reusable rubrics)
- Reduce review time (only flag outliers for teacher review)
- Batch processing (mark 300 students in one click)
- Re-test with optimized workflow

---

### Scenario D: Students Don't Act on Feedback ⚠️
**Evidence:**
- Teachers save time (primary value delivered)
- But students ignore instant feedback (no learning improvement)

**→ Next Action: Still Build (Teacher Value is Enough)**
- Primary value: Teacher time savings (solves data drop pain)
- Secondary value: Student feedback is "nice-to-have"
- Focus MVP on teacher workflow
- Iterate on student engagement features later (peer review, revision prompts)

---

### Scenario E: Total Failure ❌
**Evidence:**
- AI accuracy below 70% (unusable)
- Takes longer than manual marking (no time savings)
- Teacher wouldn't trust grades for data drop
- Students report feedback is unhelpful

**→ Next Action: Kill the Project or Pivot**
- Accept that AI isn't ready for open-ended marking
- Or pivot: Focus on multiple-choice/short-answer (easier for AI)
- Or pivot: Build analytics tool for manual marking (pattern-spotting, not grading)
- Saved 3-6 months of building something that doesn't work

---

## Test Protocol (Step-by-Step)

### Pre-Test Setup (15 min):
- [ ] Create Google Classroom assignment
- [ ] Write mark scheme (5 categories, clear criteria)
- [ ] Prepare self-assessment form (if testing this feature)
- [ ] Set up peer review workflow (if testing this feature)

### During Test (One Class, 30 Students):

**Phase 1: Submission (10 min in lesson)**
- Students complete coursework
- Students submit via Google Classroom
- Track: submission rate, time taken

**Phase 2: Self-Assessment (Optional, 5 min)**
- Students assess own work against mark scheme
- Track: completion rate, how long it takes

**Phase 3: Peer Review (Optional, 10 min)**
- Students review 2-3 anonymised peer submissions
- Provide WWW/EBI comments
- Track: participation rate, feedback quality

**Phase 4: "AI" Marking (Teacher Simulates, After Class)**
- Manually mark all 30 submissions (simulate AI consistency)
- Aim for <2 min per student (vs. 10 min normal marking)
- Provide WWW/EBI feedback for each
- Track: time per student, total time

**Phase 5: Teacher Review (10-30 min)**
- Review all grades for consistency
- Adjust any outliers
- Track: time spent, number of adjustments

**Phase 6: Return Feedback (Next Lesson, 5 min)**
- Students receive grades + AI feedback
- Survey: "Was this feedback helpful?"
- Track: student reactions, questions

### Post-Test Debrief (30 min):
- [ ] Teacher reflection: Would I do this again? Trust the grades?
- [ ] Student survey: Was feedback helpful? Did you learn?
- [ ] Time analysis: Total time vs. manual marking baseline
- [ ] Accuracy check: Grade agreement %
- [ ] Decision: Build MVP, iterate test, or pivot?

---

## Test Results Template

### Test 1: [Date] - [Subject] - [Year Group]

**Class Size:** X students
**Submission Rate:** X of X submitted

**Timing:**
- Setup: X minutes
- Marking: X minutes (X min/student)
- Review: X minutes
- Total: X minutes (vs. X minutes manual baseline)
- Time saved: X minutes (X%)

**Accuracy:**
- Grade agreement: X/30 (X%)
- Within ±1 band: X/30 (X%)
- Required adjustment: X/30 (X%)

**Teacher Feedback:**
- Would trust for data drop? [Yes/No]
- Would use again? [Yes/No]
- Key quotes: [...]

**Student Feedback:**
- Feedback helpful? X/30 (X%)
- Understood feedback? X/30 (X%)
- Acted on feedback? X/30 (X%)
- Key quotes: [...]

**Decision:** [Build MVP / Iterate test / Improve accuracy / Pivot / Kill]

---

### Test 2: [Date] - [Subject] - [Year Group]
[Repeat format above]

### Test 3: [Date] - [Subject] - [Year Group]
[Repeat format above]

---

## Final Decision Criteria

**After 3 tests, the product is viable if:**

1. ✅ Marking time reduced by 70%+ consistently across tests
2. ✅ AI accuracy 85%+ consistently (or improving with each test)
3. ✅ 2+ teachers say "I'd use this for real data drops"
4. ✅ Students report feedback is helpful (70%+ positive)
5. ✅ No major blockers identified (tech issues, workflow friction)

**If 4+ criteria met → Build MVP (4-6 weeks)**

**If 2-3 criteria met → Iterate test with improvements**

**If 0-1 criteria met → Pivot or kill**

---

## Open Questions Still to Resolve

1. **Self/peer assessment: Mandatory or optional?**
   - Does it add enough learning value to justify friction?
   - Or should MVP skip this and focus on AI + teacher workflow?

2. **What subjects/question types work best?**
   - English essays? Science explanations? Maths problem-solving?
   - Need to test across different contexts

3. **What rubric complexity can AI handle?**
   - Simple 1-5 scale? Multi-criteria (5 criteria × 5 levels)?
   - Start simple, add complexity later?

4. **File upload vs. text input?**
   - MVP: Text only (easier to parse)?
   - Or must support PDF/DOCX from day one?

5. **Integration with school systems?**
   - Export CSV sufficient for MVP?
   - Or need direct SIMS/Arbor integration for adoption?

---

## Iteration Roadmap

### Micro-MVP (Test with AI, 1-2 weeks)
- Google Forms submission
- Claude API for marking (test accuracy)
- Manual feedback delivery (no automation yet)
- **Goal:** Validate AI accuracy before building interface

### MVP (4-6 weeks)
- Simple web interface (teacher creates assignment)
- Student submission (text input, simple rubric 1-5)
- AI marking with WWW/EBI feedback
- Teacher review interface (adjust grades quickly)
- Grade export (CSV for data drops)
- **Skip:** Self/peer review, file upload, analytics

### Iteration 1 (2-3 months)
- File upload (PDF, DOCX, images)
- Multi-criteria rubrics (not just 1-5 scale)
- Self-assessment workflow (optional for students)
- Improved teacher review UI (bulk actions)

### Iteration 2 (3-4 months)
- Peer review workflow (optional)
- Analytics dashboard (class performance heatmaps)
- MIS integration (SIMS, Arbor export)
- Reusable rubric library (teacher shares templates)
