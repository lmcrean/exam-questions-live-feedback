# Iteration 5: Teacher Customisation & PDF Conversion

> **Technical Foundation**: See [TECHNICAL_DECISIONS.md](../TECHNICAL_DECISIONS.md) for infrastructure choices

## Overview

Enable teachers to upload their own question papers and mark schemes as PDFs, converting them into hostable exams. This is the most complex iteration as it involves PDF parsing, AI interpretation, validation, and manual correction workflows.

**Goal**: Teachers can upload any past paper + mark scheme PDFs, system parses and structures them, teacher reviews/corrects, and the exam becomes hostable.

**Prerequisite**: Iterations 1-4 complete.

**Platform**: Desktop/laptop only (minimum 1280×720 resolution).

**Critical Principle**: Be TRANSPARENT about what the system can and cannot do. Never silently fail - always tell the teacher when something couldn't be parsed.

**Pragmatic Approach**: For low-quality OCR (<60% confidence) or complex diagrams/flowcharts, offer manual copy-paste workflow rather than attempting unreliable automatic extraction.

---

## User Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD                                                        │
│    Teacher uploads Question Paper PDF + Mark Scheme PDF          │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. INITIAL PARSE                                                 │
│    System extracts text, identifies questions, attempts mapping  │
│    AI reviews structure and flags uncertainties                  │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. TEACHER REVIEW                                                │
│    Question-by-question review interface                         │
│    Fix parsing errors, confirm mappings, adjust question types   │
│    System shows confidence levels and flags issues               │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. VALIDATION                                                    │
│    System checks all questions have mark schemes                 │
│    Verifies total marks match                                    │
│    Tests AI marking on sample answers                            │
└─────────────────────────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. PUBLISH                                                       │
│    Exam available for hosting                                    │
│    Can still edit/improve after hosting                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## PDF Processing Pipeline

### Step 1: Upload & Initial Extraction

**Input**: Two PDF files
- Question Paper (QP)
- Mark Scheme (MS)

**Process**:
```python
async def process_upload(qp_file: UploadFile, ms_file: UploadFile):
    # 1. Validate PDFs
    validate_pdf(qp_file)
    validate_pdf(ms_file)
    
    # 2. Extract text using multiple methods for redundancy
    qp_text = extract_text(qp_file)  # pdfplumber primary, fallback to OCR
    ms_text = extract_text(ms_file)
    
    # 3. Extract images (for questions with diagrams)
    qp_images = extract_images(qp_file)
    ms_images = extract_images(ms_file)
    
    # 4. Initial structure detection
    qp_structure = detect_question_structure(qp_text)
    ms_structure = detect_markscheme_structure(ms_text)
    
    # 5. Attempt automatic mapping
    mapping = map_questions_to_markschemes(qp_structure, ms_structure)
    
    return {
        'qp': qp_structure,
        'ms': ms_structure,
        'mapping': mapping,
        'confidence': calculate_confidence(mapping)
    }
```

### Step 2: Structure Detection

**Question Paper Detection**:

Look for patterns:
- Question numbers: "1", "1.", "1)", "Q1", "Question 1"
- Sub-questions: "(a)", "a)", "(i)", "i)"
- Mark indicators: "[4]", "(4 marks)", "[4 marks]"
- Section headers: "Section A", "Easy Questions", "Answer ALL questions"

```python
QUESTION_PATTERNS = [
    r'^(\d+)\s*[\.\)]\s*(.+)',           # "1. Question text" or "1) Question text"
    r'^Q(\d+)\s*[\.\)]?\s*(.+)',          # "Q1 Question text"
    r'^Question\s+(\d+)\s*[\.\)]?\s*(.+)', # "Question 1. text"
]

SUBQUESTION_PATTERNS = [
    r'^\(([a-z])\)\s*(.+)',               # "(a) Sub question"
    r'^([a-z])\)\s*(.+)',                 # "a) Sub question"
    r'^\(([ivx]+)\)\s*(.+)',              # "(i) Sub question"
]

MARKS_PATTERNS = [
    r'\[(\d+)\s*marks?\]',                # "[4 marks]" or "[4]"
    r'\((\d+)\s*marks?\)',                # "(4 marks)"
    r'(\d+)\s*marks?$',                   # "4 marks" at end
]
```

**Mark Scheme Detection**:

Look for patterns:
- Same question numbering as QP
- Mark allocation indicators: "1 mark for...", "[1]", "Award 1 mark"
- Acceptable answer lists: "Any two of:", "Accept:", "Allow:"
- Rejection indicators: "Do not accept:", "Reject:"
- Band descriptors: "Band 3 (7-9 marks)", "High level"

### Step 3: AI-Assisted Interpretation

For complex mark schemes that regex can't handle:

```
You are parsing an OCR GCSE Computer Science mark scheme.

## Raw Text
{extracted_text}

## Task
1. Identify all marking points
2. Determine marks per point
3. Identify the marking strategy (any-one, any-two, all-required, banded)
4. Note any conditional marking rules
5. Extract accepted/rejected answers

## Output Format (JSON)
{
  "questionId": "1a",
  "totalMarks": 4,
  "markingStrategy": "any-two",
  "markingPoints": [
    {
      "criterion": "Compiler translates all code in one go",
      "marks": 1,
      "type": "identification"
    },
    {
      "criterion": "Interpreter translates one line at a time",
      "marks": 1,
      "type": "identification"
    }
  ],
  "conditionalRules": [
    "No more than 2 marks for answers relating ONLY to interpreters"
  ],
  "acceptedAlternatives": [...],
  "rejectedAnswers": [...],
  "spellingPolicy": "tolerant",
  "confidence": "high|medium|low",
  "uncertainties": [...]
}
```

---

## Confidence & Uncertainty System

### Confidence Levels

**High Confidence (>90%)**:
- Clear question numbering
- Explicit mark allocation
- Standard format matching known patterns
- All elements mapped successfully

**Medium Confidence (60-90%)**:
- Some ambiguity in question boundaries
- Mark allocation inferred but not explicit
- Partial mapping achieved
- Minor formatting irregularities

**Low Confidence (<60%)**:
- Unclear question structure
- Missing mark allocations
- Failed mapping between QP and MS
- Non-standard format
- OCR errors detected

### Flagging Issues

The system MUST flag and explain issues, never hide them:

```typescript
interface ParsingIssue {
  type: 'error' | 'warning' | 'info';
  location: string;  // e.g., "Question 3b"
  message: string;
  suggestion?: string;
  requiresManualReview: boolean;
}

// Examples:
{
  type: 'warning',
  location: 'Question 4',
  message: 'Mark scheme mentions diagram but no image found in question paper',
  suggestion: 'Check if question requires drawing response type',
  requiresManualReview: true
}

{
  type: 'error',
  location: 'Question 7',
  message: 'Could not find corresponding mark scheme for this question',
  suggestion: 'Manually assign mark scheme or verify question numbering',
  requiresManualReview: true
}

{
  type: 'info',
  location: 'Mark Scheme Q2',
  message: 'Detected banded mark scheme (levels of response)',
  suggestion: 'Review band descriptors for accuracy',
  requiresManualReview: false
}
```

---

## Teacher Review Interface

### Question-by-Question Review

```
┌─────────────────────────────────────────────────────────────────┐
│ Review: OCR GCSE CS Paper 2 - June 2024                   [Save]│
├─────────────────────────────────────────────────────────────────┤
│ Progress: ████████░░░░░░░░░░░░ 8/16 questions reviewed         │
│ Issues: 🔴 2 errors  🟡 4 warnings  🟢 10 OK                     │
├────────────────────────────┬────────────────────────────────────┤
│ Question 3a          [2/4] │ Mark Scheme 3a                      │
│ ─────────────────────────  │ ────────────────────────────────── │
│ ⚠️ Confidence: MEDIUM      │                                     │
│                            │ Marking Strategy: [any-two    ▼]   │
│ Context (editable):        │ Total Marks: [2]                   │
│ ┌────────────────────────┐ │                                    │
│ │ A program is written   │ │ Marking Points:                    │
│ │ to calculate the area  │ │ ┌──────────────────────────────┐  │
│ │ of a circle...         │ │ │ ☑ Error diagnostics [1]      │  │
│ └────────────────────────┘ │ │ ☑ Run-time environment [1]   │  │
│                            │ │ ☑ Editor features [1]        │  │
│ Question Text (editable):  │ │ ☑ Translator [1]             │  │
│ ┌────────────────────────┐ │ │ + Add marking point          │  │
│ │ Identify two features  │ │ └──────────────────────────────┘  │
│ │ of an IDE that might   │ │                                    │
│ │ be used when writing   │ │ Conditional Rules:                 │
│ │ the program.           │ │ ┌──────────────────────────────┐  │
│ └────────────────────────┘ │ │ (none detected)              │  │
│                            │ │ + Add rule                    │  │
│ Question Type:             │ └──────────────────────────────┘  │
│ [extended-response    ▼]   │                                    │
│                            │ ⚠️ Warning: Mark scheme has 4      │
│ Has Diagram: ☐             │ points but only 2 marks available. │
│ Has Code Block: ☐          │ Please verify marking strategy.    │
│                            │                                    │
│ [◀ Prev]  [Skip]  [Next ▶] │ [Test Marking] [Confirm ✓]        │
└────────────────────────────┴────────────────────────────────────┘
```

### Issue Resolution

When an issue requires manual review:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 ERROR: Question 7 - No mark scheme found                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ The system could not find a matching mark scheme for this       │
│ question. This may be because:                                  │
│                                                                 │
│ • Question numbering differs between papers                     │
│ • Mark scheme uses different formatting                         │
│ • The question was added/removed in one document                │
│                                                                 │
│ Options:                                                        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ○ Link to existing mark scheme:  [Select from list     ▼]  ││
│ │                                                             ││
│ │ ○ Create mark scheme manually:   [Open editor]             ││
│ │                                                             ││
│ │ ○ Skip this question (will not be included in exam)        ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                    [Cancel]  [Apply Resolution] │
└─────────────────────────────────────────────────────────────────┘
```

### Test Marking Feature

Before confirming a question, teacher can test the AI marking:

```
┌─────────────────────────────────────────────────────────────────┐
│ Test Marking: Question 3a                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Enter a sample student answer to test how it would be marked:   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ An IDE has a code editor with syntax highlighting and an    ││
│ │ error checker that shows where mistakes are.                ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [Run Test]                                                      │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ AI Marking Result:                                              │
│                                                                 │
│ Score: 2/2 ✓                                                    │
│                                                                 │
│ ✅ Editor features - matched by "code editor with syntax        │
│    highlighting"                                                │
│ ✅ Error diagnostics - matched by "error checker that shows     │
│    where mistakes are"                                          │
│                                                                 │
│ Feedback: "Good identification of two IDE features with         │
│ brief descriptions."                                            │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ Is this marking correct?                                        │
│ [Yes, looks good]  [No, adjust mark scheme]  [Try another]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Phase

### Automated Checks

```typescript
interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
  blockers: ValidationCheck[];  // Must fix before publish
  warnings: ValidationCheck[];  // Should review but can publish
}

const runValidation = (exam: ParsedExam): ValidationResult => {
  const checks = [
    // BLOCKERS (must fix)
    checkAllQuestionsHaveMarkSchemes(exam),
    checkTotalMarksMatch(exam),
    checkNoEmptyQuestions(exam),
    checkNoEmptyMarkSchemes(exam),
    
    // WARNINGS (should review)
    checkMarksDistribution(exam),
    checkQuestionTypeAssignments(exam),
    checkSpellingPolicies(exam),
    checkForDuplicateQuestions(exam),
    checkImageReferences(exam),
  ];
  
  return {
    passed: checks.every(c => c.status !== 'blocker'),
    checks,
    blockers: checks.filter(c => c.status === 'blocker'),
    warnings: checks.filter(c => c.status === 'warning')
  };
};
```

### Validation Report

```
┌─────────────────────────────────────────────────────────────────┐
│ Validation Report: OCR GCSE CS Paper 2 - June 2024              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ PASSED - Ready to publish (with 2 warnings)                  │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ ✅ All 16 questions have mark schemes                           │
│ ✅ Total marks match (51 QP = 51 MS)                            │
│ ✅ No empty questions or mark schemes                           │
│ ✅ All question types assigned                                  │
│                                                                 │
│ ⚠️ Warning: Question 8 has unusually high marks (12) for a      │
│    single question. Please verify this is correct.              │
│                                                                 │
│ ⚠️ Warning: No images detected. If the original paper has       │
│    diagrams, they may need to be added manually.                │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ AI Marking Tests: 16/16 questions tested ✓                      │
│ Average confidence: 87%                                         │
│ Lowest confidence: Q12 (72%) - consider reviewing               │
│                                                                 │
│                          [Back to Review]  [Publish Exam]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Special Cases & Edge Cases

### Image Handling

**Scenario**: Question paper has diagrams (network topology, flowchart to trace, etc.)

```python
def process_images(qp_pdf):
    images = extract_images(qp_pdf)
    
    for img in images:
        # Attempt to associate with nearest question
        nearby_question = find_nearest_question(img.page, img.position)
        
        # Classify image type
        img_type = classify_image(img)  # 'diagram', 'code', 'table', 'decorative'
        
        if img_type == 'decorative':
            continue  # Logo, footer, etc.
        
        # Flag for teacher review
        flag_image_for_review(nearby_question, img, img_type)
```

**Teacher Review for Images**:
```
"Image detected near Question 5. What should be done with it?

[Image preview]

Options:
○ This is part of the question - students should see it
○ This is part of the question - students should recreate/draw it
○ This is reference material only
○ This is decorative - ignore it"
```

### Tables in Questions

**Scenario**: Question has a table (truth table to complete, trace table, etc.)

- Extract table structure
- Determine if it's for input (student must complete) or reference
- Create appropriate structured input component (from Iteration 2)

### Code Blocks

**Scenario**: Question contains code that students must analyse/trace

```python
def detect_code_blocks(text):
    patterns = [
        r'^\d{2}\s+.+$',  # Line numbers (01 def main():)
        r'^def\s+\w+',     # Python function
        r'^function\s+\w+', # Pseudocode function
        r'^\s*(if|for|while|print|input)',  # Keywords
    ]
    # Group consecutive matching lines as code block
```

**Rendering**:
- Preserve indentation exactly
- Use monospace font
- Add line numbers if not present
- Syntax highlighting (optional)

### Banded Mark Schemes (Levels of Response)

**Scenario**: Extended writing questions with band descriptors

```markdown
## Mark Band 3 - High Level (6-8 marks)
The candidate demonstrates a thorough knowledge...
There is a well-developed line of reasoning...

## Mark Band 2 - Mid Level (3-5 marks)
The candidate demonstrates reasonable knowledge...
There is a line of reasoning presented...

## Mark Band 1 - Low Level (1-2 marks)
The candidate demonstrates basic knowledge...
The material is basic and contains inaccuracies...

## 0 marks
No attempt to answer the question or response is not worthy of credit
```

**Parsing**:
```json
{
  "markingStrategy": "banded",
  "bands": [
    {
      "name": "High Level",
      "markRange": [6, 8],
      "criteria": ["thorough knowledge", "well-developed reasoning", "..."]
    },
    {
      "name": "Mid Level",
      "markRange": [3, 5],
      "criteria": ["reasonable knowledge", "line of reasoning", "..."]
    },
    {
      "name": "Low Level",
      "markRange": [1, 2],
      "criteria": ["basic knowledge", "basic material", "..."]
    }
  ]
}
```

### Unsupported Content

When something truly cannot be converted:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Question 9 cannot be automatically converted                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ This question requires students to:                             │
│ "Write a program in a language of your choice..."               │
│                                                                 │
│ This type of question (open coding with execution) is not       │
│ currently supported for online hosting because:                 │
│                                                                 │
│ • Multiple programming languages would need to be supported     │
│ • Code would need to be executed and tested                     │
│ • Security considerations for running arbitrary code            │
│                                                                 │
│ Options:                                                        │
│                                                                 │
│ ○ Convert to pseudocode-only (no execution, AI marks logic)     │
│ ○ Skip this question                                            │
│ ○ Replace with alternative question                             │
│                                                                 │
│ Future versions may support code execution questions.           │
└─────────────────────────────────────────────────────────────────┘
```

### Low OCR Confidence (<60%)

When OCR quality is too low to reliably extract text:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Low OCR Quality Detected                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ The PDF appears to be scanned, and text extraction quality     │
│ is below 60% confidence. Automatic parsing is not reliable.    │
│                                                                 │
│ Options:                                                        │
│                                                                 │
│ ○ Manual Entry: Copy-paste text from PDF viewer into forms     │
│ ○ Try Different PDF: Re-scan or use digital PDF if available   │
│ ○ Cancel Upload                                                 │
│                                                                 │
│ [Continue with Manual Entry]  [Cancel]                          │
└─────────────────────────────────────────────────────────────────┘
```

**Manual Entry Workflow:**
1. Teacher sees side-by-side view: PDF preview on left, text input forms on right
2. For each question, teacher copy-pastes:
   - Question text
   - Mark scheme text
   - Marks allocation
3. Teacher selects question type from dropdown
4. System validates completeness (all questions have mark schemes)
5. Proceed to Teacher Review step (same as automatic parsing)

**Rationale**: Manual copy-paste is faster and more accurate than trying to fix bad OCR. Saves teacher time and frustration.

### Diagrams and Flowcharts in PDFs

**Flowcharts**: If question contains a flowchart:
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Flowchart Detected in Question 5                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ This question appears to contain a flowchart. Automatic         │
│ extraction of flowcharts is not reliable.                       │
│                                                                 │
│ Options:                                                        │
│                                                                 │
│ ○ Manual Reconstruction: Teacher recreates flowchart using     │
│   the flowchart builder tool (from Iteration 3)                │
│ ○ Convert to Text: Describe the flowchart in words             │
│ ○ Skip Question                                                 │
│                                                                 │
│ [Recreate Flowchart]  [Convert to Text]  [Skip]                │
└─────────────────────────────────────────────────────────────────┘
```

**Diagrams**: If question contains network/circuit diagrams:
- Extract as image
- Teacher reviews and confirms image is clear
- If unclear, teacher can re-upload clearer image or manually draw using Iteration 2 tools

### Copyright & Legal Confirmation

On upload, teacher must confirm rights:

```
┌─────────────────────────────────────────────────────────────────┐
│ Upload Question Paper & Mark Scheme                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Question Paper PDF: [Choose File]                               │
│ Mark Scheme PDF: [Choose File]                                  │
│                                                                 │
│ Maximum file size: 10 MB per PDF                                │
│                                                                 │
│ ☐ I confirm that I have the legal right to use this content    │
│   for educational purposes, and understand that I am            │
│   responsible for ensuring compliance with copyright law.       │
│                                                                 │
│                          [Cancel]  [Upload]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Additions

```sql
-- Uploaded papers
CREATE TABLE uploaded_papers (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES users(id),
  title VARCHAR(255),
  board VARCHAR(50),
  level VARCHAR(50),
  subject VARCHAR(100),
  year VARCHAR(10),
  paper_number VARCHAR(20),
  qp_file_url TEXT,
  ms_file_url TEXT,
  status VARCHAR(20), -- 'processing', 'review', 'validated', 'published'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parsed questions (before final confirmation)
CREATE TABLE parsed_questions (
  id UUID PRIMARY KEY,
  paper_id UUID REFERENCES uploaded_papers(id),
  question_id VARCHAR(50),  -- "1a", "2bii", etc.
  raw_text TEXT,
  parsed_content JSONB,
  question_type VARCHAR(50),
  marks INT,
  confidence FLOAT,
  issues JSONB,
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_modified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parsed mark schemes
CREATE TABLE parsed_markschemes (
  id UUID PRIMARY KEY,
  paper_id UUID REFERENCES uploaded_papers(id),
  question_id VARCHAR(50),
  raw_text TEXT,
  parsed_content JSONB,
  marking_strategy VARCHAR(50),
  marks INT,
  confidence FLOAT,
  issues JSONB,
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_modified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Issue tracking
CREATE TABLE parsing_issues (
  id UUID PRIMARY KEY,
  paper_id UUID REFERENCES uploaded_papers(id),
  question_id VARCHAR(50),
  issue_type VARCHAR(50),
  severity VARCHAR(20), -- 'error', 'warning', 'info'
  message TEXT,
  suggestion TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Final published exams
CREATE TABLE published_exams (
  id UUID PRIMARY KEY,
  paper_id UUID REFERENCES uploaded_papers(id),
  exam_data JSONB,  -- Full structured exam
  published_at TIMESTAMP DEFAULT NOW(),
  publish_notes TEXT
);
```

---

## API Endpoints

```
POST   /api/papers/upload              Upload QP + MS PDFs
GET    /api/papers/:id                 Get paper status and parsed data
GET    /api/papers/:id/questions       Get all parsed questions
PATCH  /api/papers/:id/questions/:qid  Update parsed question
GET    /api/papers/:id/markschemes     Get all parsed mark schemes
PATCH  /api/papers/:id/markschemes/:qid Update mark scheme
GET    /api/papers/:id/issues          Get all parsing issues
PATCH  /api/papers/:id/issues/:iid     Resolve issue
POST   /api/papers/:id/validate        Run validation
POST   /api/papers/:id/publish         Publish exam
POST   /api/papers/:id/test-marking    Test AI marking on sample
```

---

## Processing Pipeline (Background Job)

**Job Queue**: Use built-in Node.js worker threads or `bull` with Redis (free tier: Upstash). Must be free-tier compatible.

**Processing Timeout**: 10 minutes maximum. If exceeded, fail with error and suggest manual entry.

**AI API**: Google Gemini 2.0 Flash for interpreting complex mark schemes and question structures.

**Progress Updates**: Optional - can show "Processing... estimated X minutes" but not required for MVP.

```python
async def process_paper_upload(paper_id: str):
    """Background job to process uploaded papers"""
    
    paper = await get_paper(paper_id)
    update_status(paper_id, 'processing')
    
    try:
        # 1. Extract text
        qp_content = await extract_pdf_content(paper.qp_file_url)
        ms_content = await extract_pdf_content(paper.ms_file_url)
        
        # 2. Detect structure
        qp_questions = detect_questions(qp_content)
        ms_entries = detect_markscheme_entries(ms_content)
        
        # 3. Map questions to mark schemes
        mappings = map_questions_to_markschemes(qp_questions, ms_entries)
        
        # 4. AI interpretation for complex entries
        for q in qp_questions:
            if q.confidence < 0.9:
                q = await ai_interpret_question(q)
        
        for ms in ms_entries:
            if ms.confidence < 0.9:
                ms = await ai_interpret_markscheme(ms)
        
        # 5. Store results
        await store_parsed_questions(paper_id, qp_questions)
        await store_parsed_markschemes(paper_id, ms_entries)
        await store_mappings(paper_id, mappings)
        
        # 6. Create issues for review
        issues = identify_issues(qp_questions, ms_entries, mappings)
        await store_issues(paper_id, issues)
        
        update_status(paper_id, 'review')
        
    except Exception as e:
        update_status(paper_id, 'error')
        log_error(paper_id, e)
```

---

## Testing Requirements

### PDF Parsing Tests

- Various PDF formats (scanned, digital, mixed)
- Generic parsing (not board-specific - board-specific logic deferred to future iteration)
- Different paper styles (multiple choice, extended writing, practical)
- Edge cases: poor OCR quality (<60% triggers manual entry), unusual formatting, missing pages

### Mapping Tests

- Standard numbered questions map correctly
- Sub-questions (a, b, c) map correctly
- Roman numeral sub-questions (i, ii, iii)
- Non-sequential numbering handled
- Questions with same number in different sections

### Teacher Review Tests

- All interactions in review interface work
- Edits persist correctly
- Test marking produces expected results
- Issues can be resolved

### End-to-End Tests

- Upload -> Parse -> Review -> Validate -> Publish flow
- Published exam can be hosted (full Iteration 1 flow)
- AI marking works correctly on published exam

---

## Success Criteria

- [ ] PDF upload accepts standard exam paper formats
- [ ] Text extraction works on digital PDFs with >95% accuracy
- [ ] Text extraction works on scanned PDFs with >85% accuracy
- [ ] Question detection identifies >90% of questions automatically
- [ ] Mark scheme parsing extracts key information correctly
- [ ] Question-to-mark scheme mapping achieves >80% automatic accuracy
- [ ] Confidence levels accurately reflect parsing quality
- [ ] All issues are flagged clearly with actionable suggestions
- [ ] Teacher review interface allows correction of all parsing errors
- [ ] Test marking feature helps teachers verify AI accuracy
- [ ] Validation catches all critical issues before publish
- [ ] Published exams work correctly in hosting flow
- [ ] Full pipeline completes in <5 minutes for typical papers
- [ ] System clearly communicates what it cannot handle