# Technical Challenges: Hypothesis 2 (AI Marking for Data Drops)

## Overview

Hypothesis 2 has significantly higher technical complexity than Hypothesis 1 due to two critical requirements:

1. **Multi-format submission processing** (PDF, DOCX, images, text) - extracting readable content for AI
2. **End-to-end encryption** for both student names AND student responses (GDPR/privacy compliance)

**Current State:** We have a deployed full-stack chatbot with infrastructure (database, API, auth, Claude integration). The challenge is building the **content extraction pipeline** and **encryption layer** on top of existing infrastructure.

These challenges must be solved for the product to work. If either fails, the hypothesis fails.

---

# Challenge 1: Multi-Format Content Extraction

## Core Requirement

**Problem:** Students submit coursework in various formats (Google Docs ’ PDF, Word ’ DOCX, handwritten ’ images, or direct text input). All these formats must be converted into text that Claude API can process.

**Why This Matters:** If teachers have to ask students to "retype your work," adoption dies. The tool must accept work as-is with zero friction.

**Key Insight:** We already have the chatbot infrastructure. This challenge is specifically about **reading/parsing different file formats** before feeding them to the existing Claude integration.

---

## Required Format Support (Priority Order)

### 1. Plain Text P (Already Works)
**Use Case:** Student types answer directly into web form
**Complexity:** None (chatbot already handles this)
**Decision:**  Include in MVP (already supported)

---

### 2. PDF PP (Essential for MVP)
**Use Case:** Student exports Google Docs to PDF
**Most common digital submission format**

#### Text-Based PDF (Recommended for MVP)
```python
import pdfplumber

def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        return "".join(page.extract_text() for page in pdf.pages)
```

**Library:** pdfplumber or PyMuPDF
**Accuracy:** 99%+ (text already in PDF)
**Cost:** Free

**Decision:**  MVP must support this

#### Image-Based PDF (Scanned - Defer to Iteration 2)
**Requires OCR:** Google Cloud Vision, Tesseract, or Claude Vision
**Complexity:** High
**Decision:** ø Defer until validated demand

---

### 3. DOCX PP (Essential for MVP)
**Use Case:** Student works in Microsoft Word

```python
from docx import Document

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs)
```

**Library:** python-docx
**Accuracy:** 99%+
**Cost:** Free

**Decision:**  MVP must support this
**Note:** Reject .doc (old format) with clear error message

---

### 4. Images (PNG, JPG) PPPP (OCR Required)
**Use Case:** Student photographs handwritten work

#### Option A: Claude Vision API (Recommended)
```python
import anthropic
import base64

def extract_text_from_image(image_path):
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_data}},
                {"type": "text", "text": "Extract all text from this image, preserving formatting."}
            ]
        }]
    )
    return response.content[0].text
```

**Pros:**
- Uses existing Claude integration
- Handles handwriting well
- Understands context (not just OCR)

**Cons:**
- Higher token cost
- Two-step process (OCR then mark)

**Decision:**  MVP support with Claude Vision
**Show extracted text to teacher for verification** ("AI read this - does it look right?")

---

## Batch Processing Architecture

**Critical Requirement:** Process 30-330 files at once (not one-at-a-time)

### Implementation
```python
import asyncio

async def process_submission(file_path, rubric):
    try:
        # 1. Extract text based on file type
        if file_path.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            text = extract_text_from_docx(file_path)
        elif file_path.endswith(('.jpg', '.png')):
            text = extract_text_from_image(file_path)
        else:
            text = file_path  # Already text

        # 2. Mark with AI (existing Claude integration)
        feedback = await mark_with_ai(text, rubric)

        return {"success": True, "text": text, "feedback": feedback}

    except Exception as e:
        return {"success": False, "error": str(e)}

async def process_batch(files, rubric):
    """Process all submissions in parallel"""
    tasks = [process_submission(f, rubric) for f in files]
    return await asyncio.gather(*tasks)
```

**Features:**
- Parallel processing (all 30 files at once)
- Error recovery (if 1 fails, others continue)
- Progress tracking ("Processing 15/30...")

---

# Challenge 2: End-to-End Encryption (Student Names + Responses)

## Core Privacy Requirement

**Problem:** GDPR compliance requires we **cannot store**:
- Student names
- Student responses (coursework content)

**But teachers must be able to**:
- View student names locally
- View student responses locally
- Mark and export grades

**Solution:** End-to-end encryption where sensitive data is **encrypted client-side** before sending to server, and **decrypted client-side** when displaying to teacher.

---

## What Gets Encrypted

### Server Never Sees (Plaintext):
1. L Student names ("John Smith")
2. L Student responses (essay content)
3. L Any personally identifiable information

### Server Stores (Encrypted):
1.  Random UUID per student
2.  Encrypted submission content
3.  AI feedback (not student-specific, can be plaintext)
4.  Grades (linked to UUIDs, not names)

### Teacher's Browser Stores (Plaintext, LocalStorage):
1.  UUID ’ Student Name mapping
2.  Decryption keys for responses

---

## Architecture: Zero-Knowledge E2E Encryption

```
Teacher's Browser (Local)              Server (Cloud)


1. Upload Class Roster
   ["John Smith", "Jane Doe"]          (nothing sent yet)
   “
2. Generate UUIDs (client-side)
   uuid-1234 ’ "John Smith"            (nothing sent yet)
   uuid-5678 ’ "Jane Doe"
   Store in localStorage
   “
3. Student Submits Work
   UUID: uuid-1234                     Receives: uuid-1234
   Content: "Essay about..."           Receives: <encrypted blob>
   “
   Encrypt content (client-side)       Stores encrypted content
   Key stored in teacher's browser     Cannot decrypt without key
   “
4. Send to Server
   POST /submit
   { student_id: "uuid-1234",          Stores in database
     content: "a8f3b2...",             (encrypted, unreadable)
     encrypted: true }
   “
5. AI Marking (Server)
   Server decrypts temporarily         Decrypts ’ Marks ’ Re-encrypts
   (using teacher's session key)       Stores grade + feedback
   “
6. Teacher Views Results
   Fetch from server:                  Returns:
   { student_id: "uuid-1234",          { student_id: "uuid-1234",
     content_encrypted: "a8f3b2...",     content_encrypted: "...",
     grade: "B",                         grade: "B",
     feedback: "..." }                   feedback: "..." }
   “
   Decrypt client-side:
   uuid-1234 ’ "John Smith"
   "a8f3b2..." ’ "Essay about..."
   “
   Display: "John Smith - Grade B"     Teacher sees decrypted data
```

---

## Implementation: Client-Side Encryption

### Option 1: Simple UUID Mapping (MVP - Recommended)

**How it works:**
- Student names never leave teacher's browser
- Server only knows UUIDs
- No encryption library needed (just mapping)

```javascript
// Teacher uploads roster (CSV: "John Smith, Jane Doe, ...")
function createRoster(studentNames) {
  const roster = {};
  studentNames.forEach(name => {
    const uuid = crypto.randomUUID();  // Browser API
    roster[uuid] = name;
  });

  // Store locally (never sent to server)
  localStorage.setItem('roster', JSON.stringify(roster));

  // Generate student submission links
  return Object.keys(roster).map(uuid => ({
    uuid,
    link: `https://yourapp.com/submit/${uuid}`
  }));
}

// When displaying results
function displayResults(serverData) {
  const roster = JSON.parse(localStorage.getItem('roster'));

  serverData.forEach(result => {
    const studentName = roster[result.student_id];  // Decrypt
    console.log(`${studentName}: ${result.grade}`);
  });
}
```

**Pros:**
-  Simple (no crypto library)
-  Server never sees student names
-  GDPR compliant

**Cons:**
- L If teacher clears browser ’ roster lost
- L Single device only

**Decision:**  Start here for MVP

---

### Option 2: Encrypted Content Storage (MVP + Iteration 1)

**For student responses (coursework content)**, we need actual encryption since content is sent to server for AI marking.

```javascript
import CryptoJS from 'crypto-js';

// Teacher generates encryption key (client-side, stored in localStorage)
const encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
localStorage.setItem('encryption_key', encryptionKey);

// Student submits work ’ encrypt before sending
async function submitWork(studentUuid, content) {
  const key = localStorage.getItem('encryption_key');
  const encrypted = CryptoJS.AES.encrypt(content, key).toString();

  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentUuid,
      content_encrypted: encrypted
    })
  });
}

// Server marks (must decrypt, but only in memory, never stores plaintext)
async function markSubmission(encryptedContent, teacherKey, rubric) {
  // Decrypt in memory
  const plaintext = CryptoJS.AES.decrypt(encryptedContent, teacherKey).toString(CryptoJS.enc.Utf8);

  // Send to AI
  const feedback = await markWithAI(plaintext, rubric);

  // Don't store plaintext! Only store grade + feedback
  return { grade: feedback.grade, feedback: feedback.comments };
}

// Teacher views ’ decrypt client-side
async function viewSubmission(encryptedContent) {
  const key = localStorage.getItem('encryption_key');
  const plaintext = CryptoJS.AES.decrypt(encryptedContent, key).toString(CryptoJS.enc.Utf8);
  return plaintext;
}
```

**Key Points:**
- Teacher's encryption key stored in browser (localStorage)
- Content encrypted before sending to server
- Server decrypts only temporarily for AI marking (in memory, not stored)
- Teacher decrypts when viewing results

**Decision:**  Implement for MVP (required for GDPR compliance if storing responses)

---

### Option 3: Password-Encrypted Cloud Backup (Iteration 1)

**Problem:** If teacher clears browser data or switches devices, roster + keys are lost.

**Solution:** Encrypt roster + keys with teacher's password, store encrypted blob on server.

```javascript
// Backup encrypted roster to server
async function backupToCloud(roster, password) {
  const encryptedRoster = CryptoJS.AES.encrypt(
    JSON.stringify(roster),
    password
  ).toString();

  await fetch('/api/backup', {
    method: 'POST',
    body: JSON.stringify({ encrypted_data: encryptedRoster })
  });
}

// Restore from cloud
async function restoreFromCloud(password) {
  const response = await fetch('/api/restore');
  const { encrypted_data } = await response.json();

  const decryptedRoster = CryptoJS.AES.decrypt(
    encrypted_data,
    password
  ).toString(CryptoJS.enc.Utf8);

  return JSON.parse(decryptedRoster);
}
```

**Pros:**
- Multi-device support
- Server still can't read data (encrypted with teacher's password)

**Cons:**
- If teacher forgets password ’ data permanently lost
- More complex UX

**Decision:** ø Defer to Iteration 1

---

## Database Schema (GDPR-Compliant)

### What We Store

```sql
-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  teacher_id UUID,  -- Links to teacher (not students)
  title TEXT,
  rubric JSON,
  created_at TIMESTAMP
);

-- Submissions (NO PLAINTEXT STUDENT DATA)
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  assignment_id UUID,
  student_identifier UUID,  -- Random UUID (not name)
  content_encrypted BYTEA,   -- Encrypted content (teacher can decrypt)
  ai_grade TEXT,             -- Grade is not PII
  ai_feedback TEXT,          -- Feedback is not PII
  teacher_reviewed BOOLEAN,
  created_at TIMESTAMP
);
```

### What We DON'T Store
- L Student names
- L Student email addresses
- L Plaintext student responses

---

## GDPR Compliance Checklist

-  **No PII on server** (student names encrypted/never sent)
-  **Content encrypted end-to-end** (teacher holds keys)
-  **Data minimization** (only store UUIDs, grades, encrypted content)
-  **Right to be forgotten** (teacher deletes assignment ’ all data deleted)
-  **Data portability** (export grades as CSV)
-  **Encryption in transit** (HTTPS)
-  **Encryption at rest** (database encrypted)

---

## User Experience (With E2E Encryption)

### Teacher Workflow

1. **Create Assignment**
   - Upload class roster (CSV with student names)
   - Browser generates UUIDs for each student
   - Roster stored locally (never sent to server)
   - Teacher receives submission links per student

2. **Students Submit**
   - Teacher shares link: `yourapp.com/submit/uuid-1234`
   - Student uploads work
   - Content encrypted client-side before sending
   - Server receives encrypted blob + UUID (no name)

3. **AI Marking**
   - Server temporarily decrypts content (in memory)
   - Sends to Claude API
   - Stores grade + feedback (not student-identifiable)

4. **Teacher Review**
   - Teacher opens grading interface
   - Browser decrypts UUIDs ’ shows "John Smith"
   - Browser decrypts content ’ shows essay text
   - Teacher sees: "John Smith - Grade B - 'Great analysis...'"

5. **Export**
   - Teacher exports CSV with decrypted names
   - Server never sees this CSV

### Edge Cases
- Teacher clears browser data ’ roster lost (need to re-upload)
- Teacher switches device ’ need Option 3 (encrypted cloud backup)
- Student loses submission link ’ teacher can regenerate from roster

---

## Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **File extraction fails** (corrupt PDF) | Medium | Detect errors, show teacher, allow manual text entry |
| **OCR accuracy <80%** (poor handwriting) | Medium | Show extracted text for teacher verification |
| **Teacher loses encryption key** | High | Encrypted cloud backup (Option 3) in Iteration 1 |
| **GDPR audit failure** | Fatal | Legal review of encryption architecture |
| **Batch processing timeout** (330 files) | Medium | Process in chunks, use job queue |
| **Claude API rate limits** | Medium | Implement rate limiting, queue requests |

---

## Cost Analysis (With Encryption)

### Per-Submission Cost

**Text/PDF/DOCX (no OCR):**
- Input tokens: 500 words × 1.3 = 650 tokens
- Output tokens: grade + feedback = 200 tokens
- Cost: (650 × $3/1M) + (200 × $15/1M) = **$0.005** (~0.5¢)

**Images (OCR via Claude Vision):**
- Image processing: ~1000 tokens
- Then marking: 650 + 200 tokens
- Cost: ((1000 + 650) × $3/1M) + (200 × $15/1M) = **$0.008** (~0.8¢)

**Encryption overhead:** Negligible (client-side, no API costs)

**For 330 students × 3 data drops/year:**
- Cost: $0.005 × 330 × 3 = **$4.95/year**
- Revenue (£8/month): **£96/year**
- **Gross margin: 95%+**

---

## MVP Technical Scope

### Week 1-2: Core Features
-  File upload (text, PDF, DOCX)
-  Content extraction (pdfplumber, python-docx)
-  UUID generation (client-side)
-  Encrypted content storage
-  AI marking (existing Claude integration)

**Validation:** Upload 30 test files, verify extraction + encryption works

### Week 2-3: E2E Encryption
-  Local roster storage (localStorage)
-  Client-side encryption (CryptoJS)
-  UUID ’ Name mapping (client-side decrypt)
-  Server stores only encrypted content

**Validation:** Privacy audit (server logs show no student names)

### Week 3-4: Batch Processing
-  Multi-file upload (30 files)
-  Parallel processing (async)
-  Progress tracking
-  Error handling

**Validation:** 1 teacher, 30 students, full workflow

### Week 4+: Image Support (If Needed)
-  Image upload
-  Claude Vision OCR
-  Text verification UI

**Validation:** Test with 10 handwritten submissions

---

## Success Criteria

MVP succeeds if:

1.  **File extraction: 95%+ accuracy** (PDF, DOCX)
2.  **Batch processing: <2 min for 30 files**
3.  **Encryption: Server never sees student names** (verified in logs)
4.  **Cost: <$0.01 per submission**
5.  **UX: Teacher says "privacy + upload was easy"**

MVP fails if:

- L File extraction <90% accuracy
- L GDPR lawyer says "not compliant"
- L Encryption keys lost ’ teacher loses data
- L Too complex for teachers to use

---

## Comparison: Hypothesis 1 vs Hypothesis 2

| Aspect | Hypothesis 1 (Exam Practice) | Hypothesis 2 (Data Drops) |
|--------|------------------------------|---------------------------|
| **Input formats** | Text only (typed in lesson) | PDF, DOCX, images, text |
| **File parsing** | Not needed | Essential (high complexity) |
| **Privacy risk** | Low (ephemeral, in-class) | High (long-term, official grades) |
| **E2E encryption** | Optional | **Essential** |
| **Batch processing** | Not needed (real-time) | **Essential** (330 files) |
| **Technical complexity** | PP Low | PPPP High |

**Conclusion:** Hypothesis 2 is significantly more complex technically. Must validate file parsing + encryption in Week 1-2 before committing to full build.

---

## Build vs Buy Decision

### Could we use existing tools?

- **Turnitin / EssayGrader:** Don't offer E2E encryption (they store student data)
- **Google Classroom API:** Could handle file upload, but we'd still need encryption layer
- **Off-the-shelf OCR:** Still need integration + batch processing

**Conclusion:** Must build custom solution. No existing tool offers E2E encryption + UK KS3 workflow + batch AI marking.

---

## Recommended Approach

1. **Week 1:** Build file parsing (PDF, DOCX) + test with 30 real files
   - If extraction <90% accurate ’ hypothesis fails

2. **Week 2:** Build E2E encryption + test with privacy audit
   - If GDPR non-compliant ’ hypothesis fails

3. **Week 3:** Build batch processing + test with 1 teacher
   - If workflow too complex ’ simplify or pivot

4. **Week 4:** Validate with 3 teachers, 30 students each
   - If 2+ say "I'd use this" ’ build full MVP
   - Otherwise ’ pivot to Hypothesis 1 or different approach

**Critical Path:** File parsing + E2E encryption must work simply and reliably, or the entire hypothesis is not viable.
