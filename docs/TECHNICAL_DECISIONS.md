# Technical Decisions & Implementation Guidelines

**Last Updated**: 2026-01-13
**Status**: Foundation document for all iterations

This document captures key technical decisions that apply across all iterations. These decisions prioritize **free-tier tools, simplicity, and pragmatic tradeoffs** for an indie application targeting 20 concurrent users initially.

---

## Core Philosophy

1. **Free First**: All infrastructure must use free tiers. Paid services only considered if absolutely necessary.
2. **Pragmatic Tradeoffs**: Perfect is the enemy of good. Accept queueing delays over costs.
3. **Desktop Only**: Laptop/desktop experience only. No mobile optimization.
4. **Graceful Degradation**: When APIs fail, students can manually self-assess rather than blocking.
5. **Indie Scale**: Optimized for 20 concurrent users initially, not 1000+.

---

## 1. AI & Vision APIs

### Primary: Google Gemini 2.0 Flash (Free Tier)
- **Model**: `gemini-2.0-flash`
- **Use Cases**:
  - Text answer marking
  - Vision marking (diagrams, flowcharts, drawings)
  - PDF parsing and interpretation (Iteration 5)
- **Free Tier Limits**:
  - 15 RPM (requests per minute)
  - 1M TPM (tokens per minute)
  - Rate limit docs: https://ai.google.dev/pricing

### Fallback: Hugging Face (Free Inference API)
- **When**: Gemini rate limits hit or API unavailable
- **Models**: Any free-tier text/vision models available
- **Strategy**: Queue requests and retry with exponential backoff

### Rate Limiting Strategy
With 20 concurrent students × potential simultaneous submissions:
- **Queue submissions** server-side if approaching rate limits
- **Batch requests** where possible (e.g., analyze multiple mark scheme points in one call)
- **Show feedback to students**: "Marking in progress... position 3 in queue"
- **Timeout**: 30 seconds max wait. If exceeded, fall back to manual self-assessment.

### Manual Self-Assessment (API Failure Fallback)
When AI APIs are completely unavailable:
1. Student sees: **"AI marking unavailable. Please self-assess your answer."**
2. Student enters their own score: `<input type="number" min="0" max="{maxMarks}" />`
3. System saves: `{ marksAwarded: studentScore, source: "manual-self-assessment", aiFeedback: null }`
4. Teacher can review these later in analytics (flagged as "Self-Assessed")

**Rationale**: This is about quick feedback for learning, not exam integrity. Students still engage with content even if AI is down.

---

## 2. Database

### Primary: NeonDB (Postgres)
- **Why**: Free tier, serverless Postgres with generous limits
- **Free Tier**:
  - 0.5 GB storage
  - 100 hours compute/month
  - Enough for 20 concurrent users
- **Schema**: Standard relational model (see each iteration for schema details)
- **Connection Pooling**: Use Neon's built-in pooling

### Caching: Redis (Optional, Free Tier)
- **When**: Only if leaderboard performance (Iteration 4) requires it
- **Free Options**:
  - Upstash Redis (10k requests/day free)
  - Railway Redis (free tier)
- **Use Case**: Cache leaderboard rankings for 2-second intervals
- **If Not Available**: Calculate rankings in Postgres with materialized views (acceptable delay for 20 users)

---

## 3. Real-Time Communication (WebSockets)

### WebSocket Strategy
- **Library**: Socket.io (fallback to polling if WebSocket unavailable)
- **Events**: See each iteration for specific events
- **Connection Limits**: 20 concurrent connections easily handled by single Node.js server

### Disconnection Handling
**Scenario**: Student submits answer, but WebSocket disconnects mid-request

**Behavior**:
1. Answer saves to **localStorage** immediately on "Submit" click
2. Client shows: **"Submitting... (connection lost)"**
3. Client retries connection with exponential backoff: 2s, 4s, 8s, 16s
4. On reconnect, automatically resubmit queued answers
5. **Timeout**: If still disconnected after 5 minutes (5 retries), give up
6. Show error: **"Could not submit. Connection lost. Your answer is saved locally - please notify your teacher."**

**Rationale**: Students at least tried the content. Teacher can manually review saved answers if needed.

### Auto-Save (Preventing Loss)
- Text answers auto-save to localStorage every 30 seconds
- Diagrams auto-save on every change (debounced 2s)
- On page refresh, restore from localStorage
- On successful submission, clear localStorage for that question

---

## 4. Authentication & Authorization

### Teacher Authentication
- **Method**: Simple password authentication (ADMIN_PASSWORD)
- **Implementation**:
  - Store hashed password in GitHub Secrets: `ADMIN_PASSWORD`
  - Teacher login form: `/admin/login`
  - JWT token stored in httpOnly cookie (expires 7 days)
- **No user accounts**: Single password for all teachers (indie app simplicity)

### Student Authentication
- **No authentication required**
- Join with 6-digit session code
- Anonymous participation (auto-generated username)

### Session Code Generation
- **Format**: 6-character alphanumeric (uppercase): `ABC123`
- **Collision Detection**: Check DB for existing active sessions with same code
- **Retry Logic**: Generate new code if collision (max 3 retries)

---

## 5. Session States & Lifecycle

### Session States (Simplified)
```
lobby → active → paused → completed
         ↑__________|
```

- **lobby**: Waiting for teacher to start. Students can join.
- **active**: Timer running, students answering
- **paused**: Timer stopped by teacher. Students can't submit.
- **completed**: Session ended. No more submissions.

**Removed**: `frozen` state (unnecessary complexity)

### Data Retention
- **24-hour lifecycle**: From session creation (not end)
- **Cleanup Job**: Cron job runs daily at 2am, deletes sessions older than 24h
- **Export Before Delete**: Teacher can export results as Markdown before cleanup
- **No snapshots**: Keep it simple - export or lose it

---

## 6. File Storage (Iteration 5 - PDF Uploads)

### Storage: Vercel Blob or Cloudflare R2
- **Vercel Blob**: Free tier (100 GB-hours, 1000 requests/day)
- **Cloudflare R2**: Free tier (10 GB storage, 1M reads/month)
- **Use**: Store uploaded PDFs temporarily during processing
- **Cleanup**: Delete after 48 hours (processing complete or failed)

### PDF Processing
- **Library**: `pdfplumber` (Python) or `pdf-parse` (Node.js)
- **OCR Fallback**: Tesseract.js (free, client-side OCR)
- **Job Queue**: Use built-in Node.js worker threads or `bull` with Redis
- **Timeout**: 10 minutes max processing time, then fail with error

---

## 7. Question Type Rollout Strategy

### Iteration 1: MVP (6 Types)
- short-answer
- extended-response
- fill-blank
- code-completion
- describe
- compare

### Iteration 2: Add Visual (6 More → 12 Total)
- network-diagram
- circuit-diagram
- drawing-canvas
- shape-matching
- table-completion
- label-diagram

### Iteration 3: Add Flowcharts (4 More → 16 Total)
- flowchart-trace
- flowchart-complete
- flowchart-build
- flowchart-debug

### Implementation Strategy
- **Build UI incrementally**: Only implement question types as needed
- **Shared components**: Reuse answer input components where possible
- **Mark scheme flexibility**: All types use same marking prompt structure

---

## 8. Error Handling & Resilience

### API Failures
| Scenario | User Experience | Data Handling |
|----------|----------------|---------------|
| Gemini rate limit | "Marking in queue... (3 of 5)" | Queue and retry |
| Gemini completely down | "AI unavailable. Self-assess your answer." | Student enters score |
| Vision API fails | "Diagram marking unavailable. Self-assess." | Student enters score |
| Timeout (>30s) | "Marking timed out. Self-assess." | Student enters score |

### Network Failures
| Scenario | User Experience | Data Handling |
|----------|----------------|---------------|
| WebSocket disconnect | "Connection lost. Reconnecting..." | Auto-retry 5 times |
| Submit during disconnect | "Submitting... (connection lost)" | Queue locally, retry on reconnect |
| Permanent disconnect (5min) | "Could not submit. Answer saved locally." | Teacher can review localStorage dump |

### PDF Processing Failures (Iteration 5)
| Scenario | User Experience | Data Handling |
|----------|----------------|---------------|
| OCR <60% confidence | "Low OCR quality detected. Please copy-paste text manually." | Provide text input boxes per question |
| Parsing fails entirely | "Could not parse PDF. Please manually enter questions." | Manual entry workflow |
| Timeout (>10min) | "Processing failed. Try a smaller/clearer PDF." | Delete uploaded files |

### Display to Users
- **Always be transparent**: Show what failed and why
- **Always offer workaround**: Manual input, self-assess, retry, etc.
- **No silent failures**: Never pretend something worked when it didn't

---

## 9. Performance Budgets

### Response Times (20 Concurrent Users)
- **Text answer marking**: <3s (Gemini API)
- **Vision marking**: <5s (Gemini Vision API)
- **Leaderboard update**: <1s (acceptable delay, no hard requirement)
- **Page load**: <2s
- **WebSocket message latency**: <500ms

### Queueing Strategy
- **Priority**: FIFO (first in, first out)
- **Max queue length**: 50 requests
- **If queue full**: Show error "System busy, try again in 30s"

### Cost Budget
- **Absolute requirement**: $0/month for 20 users
- **Scaling cost**: Accept queueing delays over paid tiers

---

## 10. Browser & Device Support

### Supported Devices
- **Laptop/Desktop only**: Minimum 1280×720 screen resolution
- **No mobile support**: Too complex for drawing/diagrams on small screens
- **No tablet support**: (Could be future iteration)

### Supported Browsers
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Unsupported
- IE11
- Mobile browsers (Chrome Mobile, Safari iOS)
- Screen readers (future iteration)

---

## 11. Flowchart Library (Iteration 3)

### Decision Deferred to Implementation
- **Options**: react-flow, react-flowchart-designer, elkjs, custom SVG
- **Research Required**: Test touch/click interaction, auto-layout, performance
- **Consult User**: Ask user preference close to implementation time

**Current Recommendation**: `react-flowchart-designer` (https://www.npmjs.com/package/react-flowchart-designer)
- Reason: Simpler API for students to build/edit flowcharts
- Alternative: `react-flow` if more customization needed

---

## 12. Testing Strategy

### Unit Tests
- Mark scheme parsing logic
- Score calculation
- Timer logic
- Username generation

### Integration Tests
- Full submission flow (text answer)
- WebSocket connection handling
- Database operations
- Session lifecycle

### End-to-End Tests
- Student joins → answers questions → submits → sees feedback
- Teacher creates session → monitors progress → exports results
- Error scenarios (API down, disconnect, timeout)

### Load Testing
- **Not required for Iteration 1**: Only 20 concurrent users
- **Future consideration**: If scaling beyond 50 users

---

## 13. Deployment

### Hosting: Vercel (Free Tier)
- **Frontend + API**: Next.js app on Vercel
- **Free tier**: 100 GB bandwidth, unlimited requests
- **Serverless functions**: 100 GB-hours compute

### Environment Variables (GitHub Secrets)
```
ADMIN_PASSWORD=<hashed_password>
GEMINI_API_KEY=<google_ai_api_key>
HUGGINGFACE_API_KEY=<optional_fallback>
DATABASE_URL=<neon_db_connection_string>
REDIS_URL=<optional_upstash_redis_url>
```

### CI/CD
- **GitHub Actions**: Run tests on PR
- **Auto-deploy**: Merge to `main` → Vercel auto-deploys

---

## 14. Accessibility (Out of Scope for Now)

### Not Implemented (Future Iteration)
- Screen reader support
- Keyboard-only navigation
- WCAG 2.1 AA compliance
- High contrast mode
- Text-to-speech for questions

**Rationale**: Indie app, not mainstream enough yet. Revisit when user base grows.

---

## 15. Legal & Compliance

### PDF Uploads (Iteration 5)
- **Copyright**: Teacher confirms they have rights to upload content
- **Checkbox on upload**: "I confirm I have the right to use this content for educational purposes."
- **No liability**: Platform doesn't validate copyright, relies on teacher attestation

### Data Privacy
- **No personal data collected** from students (anonymous usernames only)
- **24-hour data deletion**: Minimizes data retention risk
- **No GDPR concerns**: Anonymous, ephemeral data

---

## 16. Iteration-Specific Decisions

### Iteration 1 (Core Platform)
- **Content**: Hardcoded markdown files only
- **Question types**: 6 types (text-based only)
- **Max users**: 20 concurrent
- **Auth**: Teacher password only

### Iteration 2 (Visual Questions)
- **Canvas library**: Fabric.js or Konva.js (research required)
- **Drawing tools**: Pen, shapes, text, eraser
- **No mobile**: Desktop drawing only

### Iteration 3 (Flowcharts)
- **Library**: TBD (react-flowchart-designer recommended)
- **Auto-layout**: Optional (students can position manually)
- **Validation**: Structural validation only (not logic validation)

### Iteration 4 (Leaderboard)
- **Update frequency**: 2 seconds (server-side broadcast)
- **Ranking tie-break**: Show same rank (3, 3, 4)
- **Privacy**: Students opt out, teacher can hide individuals
- **No mobile**: Desktop only

### Iteration 5 (PDF Upload)
- **OCR threshold**: <60% accuracy → manual copy-paste workflow
- **Parsing errors**: Show error, offer manual entry
- **Max file size**: 10 MB per PDF
- **Processing timeout**: 10 minutes
- **Board-specific logic**: Not now (generic parser only)

---

## 17. Future Considerations (Beyond Iteration 5)

- Mobile/tablet support
- Multi-teacher accounts
- Paid tier with faster API access
- WCAG accessibility compliance
- Multi-language support
- Code execution questions (sandboxed environment)
- Historical leaderboards across sessions
- Advanced analytics (ML insights)
- Screen reader support

---

## Summary: Key Technical Stack

| Component | Technology | Free Tier Limit |
|-----------|-----------|----------------|
| Frontend | Next.js + React | Unlimited |
| Backend | Next.js API Routes | 100 GB-hours |
| Database | NeonDB (Postgres) | 0.5 GB storage |
| Cache | Redis (Upstash) | 10k req/day |
| AI Marking | Gemini 2.0 Flash | 15 RPM, 1M TPM |
| AI Fallback | Hugging Face | Varies by model |
| WebSocket | Socket.io | Self-hosted |
| File Storage | Vercel Blob | 100 GB-hours |
| PDF Processing | pdfplumber + Tesseract | Self-hosted |
| Hosting | Vercel | 100 GB bandwidth |
| Auth | JWT + bcrypt | Self-hosted |

**Total Monthly Cost**: $0 for 20 concurrent users

---

## Questions for Future Iterations

- [ ] When to add Redis caching? (Only if leaderboard lags)
- [ ] Which flowchart library? (Decide during Iteration 3)
- [ ] Should we support board-specific parsing? (Iteration 6?)
- [ ] What OCR library for scanned PDFs? (Tesseract.js vs commercial)
- [ ] When to add proper multi-tenant auth? (Beyond Iteration 5)

---

This document should be updated as technical decisions evolve. All iterations should reference this document for infrastructure and architectural choices.
