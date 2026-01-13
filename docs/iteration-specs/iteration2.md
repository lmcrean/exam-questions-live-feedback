# Iteration 2: Diagram & Drawing Support

> **Technical Foundation**: See [TECHNICAL_DECISIONS.md](../TECHNICAL_DECISIONS.md) for infrastructure choices

## Overview

Extend the platform to support questions requiring diagrams, drawings, and visual responses. This includes network diagrams, circuit diagrams, truth tables, binary working, and general annotated diagrams.

**Goal**: Students can draw/construct diagrams as answers, and AI can assess visual responses against mark schemes.

**Prerequisite**: Iteration 1 complete and stable.

**Platform**: Desktop/laptop only (minimum 1280×720 resolution). No mobile/tablet support.

---

## New Question Types

Add to supported `questionType` values:

- `diagram-draw` - Freehand drawing (network diagrams, circuits)
- `diagram-label` - Label provided diagram
- `truth-table` - Complete truth table (structured input)
- `binary-working` - Show binary conversion steps
- `trace-table` - Complete trace table for code
- `annotate-image` - Add annotations to provided image

---

## Drawing Tool Requirements

### Canvas Component

**Features:**
- Freehand drawing (pen tool)
- Shape tools: rectangle, circle, diamond, arrow, line
- Text labels
- Undo/redo (minimum 20 steps)
- Clear canvas
- Color palette (black, red, blue, green)
- Line thickness options
- Eraser tool
- Pan/zoom for large diagrams

**Input:**
- Mouse and keyboard (desktop only)
- No touch/stylus support required

**Export:**
- Canvas saves as PNG (for vision AI marking)
- Also saves as vector data (JSON) for replay/editing

**Auto-Save:**
- Canvas state saved to localStorage every 2 seconds (debounced)
- On page refresh, restore canvas from localStorage
- On successful submission, clear localStorage for that question

### Structured Input Components

**Truth Table Builder:**
```
┌───────┬───────┬─────────┐
│   A   │   B   │  A OR B │
├───────┼───────┼─────────┤
│   0   │   0   │  [   ]  │  <- Dropdown or click toggle
│   0   │   1   │  [   ]  │
│   1   │   0   │  [   ]  │
│   1   │   1   │  [   ]  │
└───────┴───────┴─────────┘
```

- Pre-populated input columns based on question
- Student fills output column(s)
- Click to toggle 0/1
- Export as JSON for marking

**Trace Table Builder:**
```
┌──────┬───────┬───────┬────────┐
│ Line │   x   │   y   │ Output │
├──────┼───────┼───────┼────────┤
│  1   │ [   ] │ [   ] │ [    ] │
│  2   │ [   ] │ [   ] │ [    ] │
│ ...  │       │       │        │
└──────┴───────┴───────┴────────┘
```

- Variable columns defined by question
- Student enters values per iteration
- Export as JSON

**Binary Working Pad:**
```
Show your working:
┌─────────────────────────────────┐
│ 156 ÷ 2 = 78 r 0               │
│  78 ÷ 2 = 39 r 0               │
│  39 ÷ 2 = 19 r 1               │
│ ...                             │
├─────────────────────────────────┤
│ Answer: 10011100                │
└─────────────────────────────────┘
```

- Structured rows for division/remainder
- Or freeform text with formatting
- Final answer field

---

## Question File Schema Updates

### Diagram Draw Question (_Q.md)

```markdown
---
questionId: "3a"
marks: 4
questionType: "diagram-draw"
diagramType: "network-topology"
canvasSize: { width: 800, height: 600 }
providedImage: null
requiredElements: ["router", "switch", "computer", "server", "connections"]
---

Draw a star network topology with:
- 1 central switch
- 4 computers connected to the switch
- 1 server connected to the switch
- Label all devices
```

### Diagram Label Question (_Q.md)

```markdown
---
questionId: "5b"
marks: 3
questionType: "diagram-label"
providedImage: "/images/cpu-diagram.png"
labelPoints: [
  { id: "A", x: 120, y: 80, expectedAnswer: "ALU" },
  { id: "B", x: 200, y: 150, expectedAnswer: "Control Unit" },
  { id: "C", x: 320, y: 80, expectedAnswer: "Registers" }
]
---

Label the parts of the CPU diagram marked A, B, and C.
```

### Truth Table Question (_Q.md)

```markdown
---
questionId: "2c"
marks: 4
questionType: "truth-table"
inputColumns: ["A", "B"]
outputColumns: ["NOT A", "A AND B"]
rows: 4
---

Complete the truth table for NOT A and A AND B.
```

### Mark Scheme Updates (_MS.md)

```markdown
---
questionId: "3a"
marks: 4
markingStrategy: "element-based"
---

## Required Elements (1 mark each, max 4)

- Central switch drawn and labelled [1]
- At least 4 computers connected [1]
- Server connected to switch [1]
- All connections shown (no daisy-chain) [1]

## Accept
- Any reasonable switch/hub symbol
- Computers shown as rectangles, monitors, or labelled boxes
- Lines or arrows for connections

## Do Not Accept
- Ring or bus topology
- Computers connected to each other directly
- Missing labels on devices
```

---

## AI Vision Marking

### Image Analysis Prompt Template

```
You are an OCR GCSE Computer Science examiner marking a diagram response.

## Question
{question_text}

## Required Elements
{required_elements}

## Mark Scheme ({total_marks} marks)
{mark_scheme_content}

## Student's Diagram
[Image attached]

## Instructions
1. Identify each required element in the diagram
2. Check connections/relationships are correct
3. Verify labels are present and accurate
4. Award marks per mark scheme criteria

## Response Format (JSON)
{
  "marksAwarded": <integer>,
  "maxMarks": <integer>,
  "elementsFound": [
    {"element": "central switch", "found": true, "notes": "clearly drawn in center"}
  ],
  "elementsMissing": [
    {"element": "server label", "notes": "server drawn but not labelled"}
  ],
  "feedback": "...",
  "confidence": "high|medium|low"
}
```

### Structured Input Marking

For truth tables, trace tables, and binary working - no vision needed:

```
You are marking a truth table response.

## Expected Values
| A | B | NOT A | A AND B |
|---|---|-------|---------|
| 0 | 0 |   1   |    0    |
| 0 | 1 |   1   |    0    |
| 1 | 0 |   0   |    0    |
| 1 | 1 |   0   |    1    |

## Student Response
| A | B | NOT A | A AND B |
|---|---|-------|---------|
| 0 | 0 |   1   |    0    |
| 0 | 1 |   1   |    0    |
| 1 | 0 |   0   |    0    |
| 1 | 1 |   1   |    1    |

## Marking
Award 1 mark per correct output cell. Mark row by row and report errors.
```

### Vision API Error Handling

**Vision API Strategy:**
- **Primary**: Google Gemini 2.0 Flash with vision capabilities
- **Fallback**: Hugging Face vision models (if available in free tier)
- **Timeout**: 30 seconds max per diagram

**When Vision API Fails or Times Out:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Diagram Marking Unavailable          │
├─────────────────────────────────────────┤
│ The AI cannot analyze your diagram      │
│ right now. Please review the mark       │
│ scheme and self-assess your answer.     │
│                                          │
│ Mark Scheme:                             │
│ • Central switch clearly drawn (1 mark) │
│ • 4 computers connected (1 mark)        │
│ • All devices labelled (1 mark)         │
│                                          │
│ Your Diagram:                            │
│ [Diagram preview shown]                  │
│                                          │
│ How many marks do you think you earned? │
│ ┌─────┐                                 │
│ │  2  │ / 3 marks                       │
│ └─────┘                                 │
│                                          │
│        [Submit Self-Assessment]          │
└─────────────────────────────────────────┘
```

**Data Handling:**
- Stored as: `{ marksAwarded: 2, markingSource: "manual-self-assessment", aiFeedback: null }`
- Teacher can review diagram image and student's self-assessment later
- Flagged in analytics as "Self-Assessed (Vision API Failed)"

**Rationale**: Student still engages with mark scheme and learns. Teacher can manually review later if needed.

---

## Edge Cases for Diagrams

### Drawing Quality Issues
- **Very messy drawing**: AI should attempt interpretation, flag if confidence low
- **Overlapping elements**: AI identifies potential ambiguity
- **Missing connections**: Distinguish from intentionally unconnected
- **Scale issues**: Accept any reasonable scale
- **Colour-blind accessibility**: Don't rely solely on colour for marking

### Structural Issues  
- **Wrong diagram type**: Student draws bus when asked for star - 0 marks but explain why
- **Partial diagram**: Award marks for correct elements present
- **Extra elements**: Ignore unless they contradict the answer
- **Rotated/flipped**: Accept standard rotations

### Label Issues
- **Spelling in labels**: Apply spellingPolicy from question config
- **Abbreviations**: Accept standard abbreviations (PC, CPU, etc.)
- **Arrow direction**: Matters for some diagrams (data flow), not others
- **Missing label vs wrong label**: Different feedback

### Truth Table Specific
- **Blank cells**: Mark as incorrect
- **Invalid values**: Only 0 and 1 accepted (or T/F for some boards)
- **Row order**: Usually doesn't matter if all rows present

### Trace Table Specific  
- **Partially complete**: Mark rows that are complete
- **Following-on errors**: If row 2 wrong, row 3 may be "correct given row 2" - examiner discretion
- **Skipped iterations**: May indicate misunderstanding of loop

---

## Database Schema Additions

```sql
-- Extended response storage for diagrams
ALTER TABLE responses ADD COLUMN response_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE responses ADD COLUMN diagram_image_url TEXT;
ALTER TABLE responses ADD COLUMN diagram_vector_data JSONB;
ALTER TABLE responses ADD COLUMN structured_data JSONB;

-- Asset storage for provided images
CREATE TABLE question_assets (
  id UUID PRIMARY KEY,
  question_id VARCHAR(50),
  asset_type VARCHAR(20), -- 'background-image', 'reference-image'
  file_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## File Storage

```
/uploads/
  /sessions/
    /{session_id}/
      /{participant_id}/
        {question_id}_diagram.png
        {question_id}_vector.json
```

- Use cloud storage (S3/GCS) in production
- Local filesystem for development
- Signed URLs for secure access
- Auto-cleanup after session expires (configurable retention)

---

## UI/UX Updates

### Question Display

When `questionType` is diagram-related, render appropriate tool:

```typescript
switch (question.questionType) {
  case 'diagram-draw':
  case 'annotate-image':
    return <DiagramCanvas {...props} />;
  case 'diagram-label':
    return <LabellingTool image={question.providedImage} points={question.labelPoints} />;
  case 'truth-table':
    return <TruthTableBuilder inputs={question.inputColumns} outputs={question.outputColumns} />;
  case 'trace-table':
    return <TraceTableBuilder variables={question.variables} />;
  case 'binary-working':
    return <BinaryWorkingPad />;
  default:
    return <TextInput />;
}
```

### Drawing Canvas Toolbar

```
┌──────────────────────────────────────────────────────┐
│ ✏️ Pen | ⬜ Rect | ⭕ Circle | ◇ Diamond | ➡️ Arrow │
│ 📝 Text | 🧹 Eraser | ↩️ Undo | ↪️ Redo | 🗑️ Clear   │
│ Thickness: ○ ● ⬤  |  Color: ⚫ 🔴 🔵 🟢            │
└──────────────────────────────────────────────────────┘
```

### Feedback Display for Diagrams

```
┌─────────────────────────────────────────┐
│ Question 3a                    Score: 3/4│
├─────────────────────────────────────────┤
│ Your Diagram:                            │
│ [Thumbnail of student's drawing]         │
│                                          │
│ ✅ Elements Found:                       │
│ • Central switch - clearly drawn         │
│ • 4 computers connected - correct        │
│ • Server connected - correct             │
│                                          │
│ ❌ Missing/Incorrect:                    │
│ • Server not labelled (-1 mark)          │
│                                          │
│ Feedback:                                │
│ "Good star topology. Remember to label   │
│  ALL devices including servers."         │
└─────────────────────────────────────────┘
```

---

## Testing Requirements

### Drawing Canvas Tests
- Pen strokes render correctly (mouse input)
- Shapes draw at correct position/size
- Undo/redo works for all operations (minimum 20 steps)
- Export produces valid PNG
- Vector data can recreate drawing
- Auto-save to localStorage works (debounced 2s)
- State restore from localStorage works on page refresh

### Vision API Tests
- Simple diagram recognised correctly
- Complex diagram with multiple elements
- Messy drawing handled gracefully  
- Low confidence flagged appropriately
- Performance acceptable (<5s per diagram)

### Structured Input Tests
- Truth table captures all values
- Trace table handles variable numbers of rows
- Export JSON format correct
- Marking matches expected values

### Integration Tests
- Full flow: draw diagram -> submit -> AI marks -> feedback displayed
- Canvas state survives page refresh
- Large diagrams don't crash browser

---

## Performance Considerations

- **Canvas size**: Limit to 1200x900 max to control file size
- **Auto-save**: Save vector data (small) frequently, PNG on submit only
- **Vision API**: Cache results, don't re-analyse same image
- **Compression**: Compress PNGs before storage
- **Lazy loading**: Don't load drawing canvas until needed

---

## Success Criteria

- [ ] Freehand drawing tool works on desktop (mouse input)
- [ ] Shape tools (rectangle, circle, diamond, arrow) function correctly
- [ ] Text labels can be added to diagrams
- [ ] Undo/redo works reliably (minimum 20 steps)
- [ ] Truth table builder captures student input accurately
- [ ] Trace table builder handles dynamic row counts
- [ ] AI vision can identify diagram elements with >80% accuracy on clear drawings
- [ ] AI correctly marks structured inputs (truth tables, etc.) with 100% accuracy
- [ ] Feedback clearly shows what elements were found/missing
- [ ] Drawing state persists through browser refresh (localStorage)
- [ ] Vision API failure triggers self-assessment fallback
- [ ] Auto-save works for canvas state (every 2 seconds)