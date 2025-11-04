# Bear Case: Why AI-Assisted Marking Might Fail

This document outlines critical objections, risks, and reasons why this product might not succeed. A strong bear case helps identify deal-breakers before investing months of development time.

---

## 1. AI Accuracy Will Be Insufficient for Trust

### The Objection

**"Teachers won't trust AI grading enough to submit grades for official data drops, making the entire product useless."**

### Why This Could Kill the Product

- Teachers are personally accountable for grades submitted to leadership
- If a parent challenges a grade, the teacher must defend it
- "The AI said so" is not an acceptable justification
- Trust threshold might be 95%+, not 85%
- Even 10% error rate = 33 students out of 330 require manual review
- If review takes 5 min per student, that's 165 min (2.75 hours) just fixing errors
- Time savings evaporate if teacher must carefully review every grade

### Evidence That Supports This Concern

- ChatGPT/Claude are known to hallucinate and make inconsistent judgements
- Open-ended coursework is subjective (not like marking multiple choice)
- Mark schemes have nuance that AI might miss ("compare and contrast" vs "explain the difference")
- Different exam boards have different expectations (AQA vs Edexcel vs OCR)
- Teachers develop tacit knowledge of their own students' abilities (AI has no context)

### What Would Have to Be True for This NOT to Be a Problem

- AI accuracy tested at 90%+ with real teacher scripts
- Teachers feel errors are "reasonable" (within their own marking variance)
- Review process is fast enough that fixing 10% errors still saves 80% time
- Leadership accepts AI-assisted grades (with teacher verification)

### Red Flags to Watch For

- ❌ AI accuracy below 80% in testing
- ❌ Teachers say "I'd have to re-mark everything anyway"
- ❌ Schools have policies banning AI-assisted grading
- ❌ Exam boards/Ofqual issue guidance against AI marking

---

## 2. Time Savings Will Be Offset by Review Time

### The Objection

**"Even if AI does the initial marking, teachers will still spend hours reviewing and adjusting grades, eliminating the time savings."**

### Why This Could Kill the Product

- Teachers are risk-averse with grades (stakes are high)
- Default behaviour: "I'll just check every grade to be safe"
- If review takes 2 min per student (vs 10 min manual), that's still 11 hours for 330 students
- Savings: 55 hours → 11 hours = 44 hours saved (80% reduction)
- But if review takes 5 min per student (teacher doesn't trust AI), that's 27.5 hours
- Savings: 55 hours → 27.5 hours = 50% reduction (might not justify switching)

### Evidence That Supports This Concern

- Teachers already feel time-pressure around data drops
- Trusting a new system takes time (early adopters will over-review)
- Mistakes are costly (parent complaints, grade appeals, leadership scrutiny)
- Teachers might not trust AI enough to do spot-checks (check all 330 instead)

### What Would Have to Be True for This NOT to Be a Problem

- Review workflow is genuinely fast (< 30 seconds per student to approve/adjust)
- AI flags uncertain grades for teacher attention (teacher only reviews 20-30 students)
- After first use, teacher builds trust and reduces review time
- Time saved is still >50% even with thorough review

### Red Flags to Watch For

- ❌ Teachers spend 5+ min per student reviewing AI grades
- ❌ Teachers feel anxious about trusting AI (check everything)
- ❌ Review time increases over time (teachers lose trust after errors)

---

## 3. Teachers Won't Pay for This (and Free is Unsustainable)

### The Objection

**"Teachers expect marking tools to be free (like Google Classroom). A subscription model won't work, and offering it for free is financially unsustainable due to AI API costs."**

### Why This Could Kill the Product

- AI API costs scale with usage (Claude API ~$3-15 per 330 students)
- If free: 1000 teachers × 330 students × 3 data drops/year = 990,000 submissions/year
- At $0.01 per submission (conservative), that's $9,900/year in costs
- Unsustainable without revenue
- If paid: Teachers are used to free tools (Google Classroom, Forms, Wooclap free tier)
- Schools have tight budgets (EdTech purchases require approval)
- Individual teachers unlikely to pay out-of-pocket

### Evidence That Supports This Concern

- Most teacher tools are freemium (limited free tier, upsell for premium)
- School procurement is slow (6-12 month sales cycles)
- Competition from free alternatives (manual marking, Google Classroom)
- AI API costs are non-trivial at scale

### What Would Have to Be True for This NOT to Be a Problem

- Teachers/schools willing to pay £50-100/year for time savings
- Freemium model works (5 free submissions/month, pay for unlimited)
- Costs reduced through prompt optimization/cheaper models
- Alternative revenue (sell anonymised data, sponsored by exam boards, etc.)

### Red Flags to Watch For

- ❌ Teachers say "I'd only use this if it's free"
- ❌ Schools refuse to approve purchase orders
- ❌ Free tier runs out of budget within 3 months

---

## 4. It Will Converge with Hypothesis-1 Anyway

### The Objection

**"You're building the same product with a different entry point. You'll end up with the exact same features, just marketed differently."**

### Why This Could Be True

**Hypothesis 1 (Exam Practice):**
- Students submit exam answers
- AI analyses responses against mark scheme
- AI provides heatmap of common errors (teacher value)
- Students see peer responses (student value)
- Voting/peer learning features

**Hypothesis 2 (Data Drop Marking):**
- Students submit coursework
- AI marks responses against rubric
- AI provides grades + WWW/EBI (teacher value)
- Students get instant feedback (student value)
- [Optional] Self/peer assessment

**What's the same:**
- Both need: Submission → AI analysis → Teacher review → Student feedback
- Both solve teacher pattern-spotting pain
- Both provide AI-generated feedback to students
- Both integrate with Google Classroom
- Both need mark scheme/rubric integration

**What's different:**
- Hypothesis 1: Focus on in-class formative assessment (peer learning, engagement)
- Hypothesis 2: Focus on summative assessment (data drops, grade export)
- But these could be the same product with different use cases

### The Risk

- You'll spend 2-3 months building hypothesis-2, realize it needs peer learning features
- Add peer review → now it's identical to hypothesis-1
- Wasted time building twice when you could've built one product for both use cases

### What Would Have to Be True for Them to Stay Different

- Hypothesis-1 MVP: No grading, just pattern-spotting + peer learning (teacher chooses exemplars)
- Hypothesis-2 MVP: AI grading + teacher review, no peer features (just teacher/student workflow)
- Test both, see which value prop resonates more
- Build the one with stronger product-market fit first

### Red Flags to Watch For

- ❌ Teachers say "I'd use this for both exam practice AND data drops"
- ❌ Students want peer review in hypothesis-2 (convergence starting)
- ❌ You realize the same codebase could serve both use cases

---

## 5. Schools Will Ban AI-Assisted Grading on Policy Grounds

### The Objection

**"Schools/exam boards/government will prohibit AI-assisted grading for assessment, making the product non-compliant."**

### Why This Could Kill the Product

- Ofqual (UK exam regulator) might issue guidance against AI marking for internal assessments
- Schools might have blanket "no AI in assessment" policies
- Teacher unions might object (AI replacing teacher judgement)
- Parents might complain ("My child was graded by a robot")
- GDPR concerns (student data sent to AI providers)

### Evidence That Supports This Concern

- AI in education is controversial (cheating concerns, bias concerns)
- Some schools have banned ChatGPT entirely
- Teacher unions are wary of automation (job replacement fears)
- UK government has not yet provided clear guidance on AI in assessment

### What Would Have to Be True for This NOT to Be a Problem

- Position as "AI-assisted" not "AI-automated" (teacher makes final decision)
- Clear messaging: AI is a tool, teacher retains accountability
- GDPR compliance (data processed securely, not used for training)
- Ofqual/DfE provides guidance allowing AI-assisted marking

### Red Flags to Watch For

- ❌ Schools say "We can't use this due to policy"
- ❌ Ofqual issues guidance restricting AI use in assessment
- ❌ Negative press coverage ("Schools outsourcing grading to AI")

---

## 6. Students Will Game the System

### The Objection

**"Students will learn to trick the AI into giving high grades without actually improving their work."**

### Why This Could Kill the Product

- Students figure out AI gives high marks for specific keywords
- Students copy-paste from ChatGPT (AI marks AI-generated work highly)
- Teachers lose trust in AI grades ("Students are gaming it")
- Academic integrity concerns (are we rewarding real learning or AI prompt engineering?)

### Evidence That Supports This Concern

- Students are already using ChatGPT to write essays
- AI detection is imperfect (false positives/negatives)
- Students share "hacks" on TikTok/Discord
- Teachers already struggle with AI-generated coursework

### What Would Have to Be True for This NOT to Be a Problem

- Teacher review catches suspicious grades (spot-checks flag outliers)
- AI trained to detect AI-generated content (but this is hard)
- Rubric focuses on conceptual understanding, not keyword matching
- In-class submissions reduce opportunity for ChatGPT use

### Red Flags to Watch For

- ❌ Students get high AI grades but teacher disagrees on review
- ❌ Teachers report "This doesn't sound like my student's work"
- ❌ Students share "how to get full marks" guides

---

## 7. The Pain Might Not Be Frequent Enough

### The Objection

**"Teachers only feel this pain 2-3 times per year (termly data drops). That's not frequent enough to justify learning a new tool."**

### Why This Could Kill the Product

- Data drops happen 3 times/year (once per term)
- Teachers might just accept the pain (2 weeks of hard work × 3 times/year)
- "I'll just power through it" vs. "I need a tool to fix this"
- New tool has learning curve (setup time, training, troubleshooting)
- If pain only occurs 3 times/year, inertia is strong

### Evidence That Supports This Concern

- Teachers are busy (no time to learn new tools unless pain is constant)
- Tools with weekly use cases (lesson planning, homework) have better adoption
- Infrequent pain = low urgency
- Teachers might forget about tool between data drops

### What Would Have to Be True for This NOT to Be a Problem

- Tool is also useful for non-data-drop assessments (weekly exit tickets, homework)
- Pain is severe enough that 3×/year is still worth solving (55 hours saved)
- Setup is so easy that it's worth using even infrequently
- Teachers use it for other purposes (formative feedback, practice exams)

### Red Flags to Watch For

- ❌ Teachers say "I'd use this 2-3 times per year"
- ❌ Low retention between data drops (teachers forget about it)
- ❌ Teachers don't see value in using it outside data drops

---

## 8. Manual Marking Might Be Faster Than Claimed

### The Objection

**"Maybe manual marking doesn't actually take 55 hours. Maybe teachers are already faster than we think, and AI savings are marginal."**

### Why This Could Kill the Product

- Hypothesis assumes 10 min/student manual marking
- But for simple rubrics (1-5 scale), teachers might only take 2-3 min/student
- 330 students × 2 min = 660 min = 11 hours (not 55 hours)
- AI saves 11 hours → 2 hours = 9 hours saved (80% reduction)
- But 9 hours saved might not feel worth learning new tool

### Evidence That Supports This Concern

- Experienced teachers mark faster than novices
- Simple rubrics (1-5 grade) are quicker than detailed WWW/EBI feedback
- Teachers might batch-mark (faster than switching contexts)
- User claims 90 seconds average (not 10 min) in their own experience

### What Would Have to Be True for This NOT to Be a Problem

- Even if manual marking is 2 min/student, AI can do it in 10 seconds
- Time saved: 11 hours → 1 hour = 10 hours saved (still valuable)
- Quality of AI feedback is better than rushed manual marking
- Teachers value consistent grading even if time savings are smaller

### Red Flags to Watch For

- ❌ Teachers say "I can mark 330 students in 10 hours already"
- ❌ Time savings in testing are only 30-40% (not 80%)
- ❌ Teachers don't feel the time saved is worth the hassle

---

## 9. Pedagogy Objection: Instant Feedback Might Not Improve Learning

### The Objection

**"Just because feedback is instant doesn't mean students will act on it or learn more. The student value prop might be weak."**

### Why This Could Kill the Product

- Students might ignore instant AI feedback (especially if they already got their grade)
- Research on feedback timing is mixed (instant vs delayed both have trade-offs)
- If students don't improve, teachers won't see value in student-facing features
- Product becomes pure teacher time-saver (weaker value prop than teacher + student value)

### Evidence That Supports This Concern

- Students often don't read feedback (just check their grade)
- Instant feedback can reduce reflection time (delayed feedback forces retrieval practice)
- If feedback is automated, students might not take it seriously ("just a bot")

### What Would Have to Be True for This NOT to Be a Problem

- Track student improvement on subsequent assignments (evidence of learning)
- Students report feedback is helpful (survey data)
- Teachers observe students acting on feedback
- Or: Student value is secondary, teacher time-saving is enough

### Red Flags to Watch For

- ❌ Students check grade, ignore feedback
- ❌ No evidence of improvement on next assignment
- ❌ Teachers say "Students don't engage with AI feedback"

---

## 10. There Are Already Competitors Doing This

### The Objection

**"Existing products (Turnitin, Gradescope, MagicSchool AI) already solve this problem. Why would teachers switch?"**

### Why This Could Kill the Product

- **Turnitin Feedback Studio:** AI-generated feedback, rubric grading, widely adopted
- **Gradescope:** AI-assisted grading for STEM, used in higher ed
- **MagicSchool AI:** Teacher tools including AI grading assistance
- **Eduaide.ai, TeacherMatic, etc.:** AI marking tools already exist
- Switching costs are high (teachers stick with existing tools)

### Evidence That Supports This Concern

- Market is already crowded with AI teacher tools
- Teachers have limited time to evaluate alternatives
- Existing tools have established user bases, integrations, support
- Free alternatives (ChatGPT + manual workflow) might be "good enough"

### What Would Have to Be True for This NOT to Be a Problem

- Existing tools don't focus on UK Key Stage 3 workflow (data drops, WWW/EBI)
- Existing tools are expensive/complex (opportunity for simpler, cheaper alternative)
- Your tool integrates better with UK school systems (SIMS, Google Classroom)
- Your tool has unique feature (peer review, self-assessment workflow)

### Red Flags to Watch For

- ❌ Teachers say "We already use Turnitin for this"
- ❌ Competitor launches exactly this feature before you ship
- ❌ Your product doesn't differentiate from existing tools

---

## 11. Academic Integrity Concerns Will Scare Teachers Away

### The Objection

**"If we make it easy for AI to mark coursework, we're also making it easy for students to submit AI-generated coursework, creating an arms race."**

### Why This Could Kill the Product

- Teachers fear students will use AI to write submissions
- AI marking AI-generated work = meaningless assessment
- Credibility crisis: "Are we assessing students or AI?"
- Tool might accelerate the problem it's trying to solve

### Evidence That Supports This Concern

- ChatGPT can write convincing essays, explanations, problem solutions
- Teachers already struggle with AI-generated homework
- AI detection tools are unreliable (false positives/negatives)

### What Would Have to Be True for This NOT to Be a Problem

- In-class submissions reduce opportunity for AI cheating
- Rubric focuses on conceptual depth that AI can't fake easily
- Teacher review catches AI-generated submissions
- Or: Accept that AI-assisted learning is the new normal, focus on higher-order skills

### Red Flags to Watch For

- ❌ Teachers express concerns about academic integrity
- ❌ Parents complain about AI-on-AI assessment
- ❌ Schools ban tool due to cheating concerns

---

## 12. You'll Build It and No One Will Use It

### The Objection

**"Even if the product works perfectly, adoption might be too slow to justify the effort. Teachers are busy, change-averse, and have limited time to try new tools."**

### Why This Could Kill the Product

- Teacher tools have notoriously slow adoption curves
- Marketing to teachers is hard (no centralized platform)
- Word-of-mouth takes time (need to reach critical mass)
- Teachers try it once, never come back (novelty effect)

### Evidence That Supports This Concern

- You're a solo developer (limited marketing resources)
- No education industry connections (school partnerships, conferences)
- Public repo (can't do paid marketing without product validation)
- Teachers are overwhelmed with EdTech offerings

### What Would Have to Be True for This NOT to Be a Problem

- Product is so valuable that early adopters evangelize it
- You validate with 10-20 teachers before building (pre-sold)
- Freemium model lowers barrier to trial
- You focus on one school initially, nail the workflow, expand via word-of-mouth

### Red Flags to Watch For

- ❌ Less than 5% of trial users become repeat users
- ❌ No organic growth (every user requires manual sales effort)
- ❌ Teachers try once, never return

---

## Summary: What Could Kill This Product?

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| AI accuracy below trust threshold | HIGH | FATAL | Test with real scripts BEFORE building |
| Review time offsets time savings | MEDIUM | FATAL | Design fast review workflow, flag outliers only |
| Teachers won't pay, free is unsustainable | MEDIUM | FATAL | Validate willingness to pay early, test freemium |
| Converges with hypothesis-1 | HIGH | MEDIUM | Build modular product that serves both use cases |
| Schools ban AI-assisted grading | LOW | FATAL | Position as AI-assisted, not AI-automated |
| Students game the system | MEDIUM | HIGH | Teacher review, focus on conceptual depth |
| Pain not frequent enough | MEDIUM | MEDIUM | Expand use cases beyond data drops |
| Manual marking faster than assumed | HIGH | HIGH | Validate actual marking time with teachers |
| Instant feedback doesn't improve learning | LOW | LOW | Focus on teacher value, student value is bonus |
| Existing competitors | MEDIUM | MEDIUM | Differentiate on UK workflow, simplicity, pricing |
| Academic integrity concerns | MEDIUM | MEDIUM | In-class submissions, teacher review catches AI work |
| No one uses it | HIGH | FATAL | Validate with 10 teachers before building |

---

## Critical Questions to Answer BEFORE Building

**If you can't answer these confidently, don't build:**

1. **Can AI mark open-ended coursework with 85%+ accuracy?**
   - Test with 30 real student scripts
   - Compare AI grades to your own grades
   - If accuracy < 80%, stop here

2. **Will teachers trust AI grades enough to submit them for data drops?**
   - Ask 10 teachers: "Would you submit these grades to leadership?"
   - If <70% say yes, re-think value prop

3. **Does this save 80%+ of marking time (including review)?**
   - Time yourself marking 30 scripts manually
   - Time yourself reviewing AI grades for same 30 scripts
   - If savings < 70%, workflow needs optimization

4. **Will teachers pay for this (or will a school)?**
   - Ask 10 teachers: "Would you pay £50/year for this?"
   - If <50% say yes, pricing/value prop needs work

5. **How is this different from Turnitin/Gradescope/MagicSchool?**
   - If answer is "it's simpler/cheaper," that might not be enough
   - Need unique value prop (UK workflow, peer review integration, etc.)

6. **Why won't this just converge with hypothesis-1?**
   - If they're the same product, build one, not two
   - Test: Show both hypotheses to teachers, ask which they'd use

---

## Conclusion: Should You Build This?

**Build this IF:**
- ✅ AI accuracy tested at 85%+ with real scripts
- ✅ 70%+ of teachers say "I'd trust this for data drops"
- ✅ Time savings tested at 70%+ (including review time)
- ✅ Clear differentiation from existing tools
- ✅ Path to sustainability (freemium, school subscriptions, etc.)

**Don't build this IF:**
- ❌ AI accuracy < 80% (fatal flaw, product won't work)
- ❌ Teachers say "I'd still have to check everything" (no time savings)
- ❌ Teachers unwilling to pay, and free model is unsustainable
- ❌ Existing tools already solve this well (no reason to switch)

**The hardest pill to swallow:**
This might be hypothesis-1 with a different marketing pitch. If they converge, you're better off building one product that serves both use cases (formative exam practice + summative data drops) rather than two separate products.

**Recommendation:**
Test AI accuracy with 30 real scripts FIRST. If that fails, kill the project. If it succeeds, run Wizard of Oz test with 3 teachers. If 2+ say "I'd use this for data drops," build MVP. Otherwise, pivot to hypothesis-1 or a different problem.
