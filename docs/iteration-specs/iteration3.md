# Iteration 3: Flowchart Design & Recognition

> **Technical Foundation**: See [TECHNICAL_DECISIONS.md](../TECHNICAL_DECISIONS.md) for infrastructure choices

## Overview

Add specialised flowchart creation tools and intelligent flowchart marking. Students can build flowcharts using proper symbols, and AI can assess both visual correctness and logical flow.

**Goal**: Students can construct flowcharts using a structured tool, and AI can validate both the diagram structure and the algorithm logic.

**Prerequisite**: Iterations 1 and 2 complete.

**Platform**: Desktop/laptop only (minimum 1280×720 resolution).

**Scope**: This is a focused iteration - flowcharts are a specific, well-defined problem that deserves dedicated tooling rather than relying on freehand drawing.

**Library Choice**: Deferred to implementation time. Options include react-flow, react-flowchart-designer, elkjs, or custom SVG. Research and consult user before committing.

---

## Why Dedicated Flowchart Tools?

Freehand flowcharts (from Iteration 2) have issues:
1. Symbol recognition is unreliable (is that a diamond or a rotated square?)
2. Connection paths are ambiguous
3. Text inside shapes is hard to extract
4. Logic flow can't be validated programmatically

A structured flowchart builder solves these by capturing semantic data, not just pixels.

---

## New Question Types

Add to supported `questionType` values:

- `flowchart-build` - Create flowchart from scratch using builder
- `flowchart-complete` - Complete a partial flowchart (some nodes provided)
- `flowchart-fix` - Identify and fix errors in provided flowchart
- `flowchart-trace` - Trace through flowchart with given inputs

---

## Flowchart Builder Component

### Standard Flowchart Symbols

Per OCR/AQA GCSE specifications:

| Symbol | Shape | Use |
|--------|-------|-----|
| Terminator | Rounded rectangle (stadium) | Start/End |
| Process | Rectangle | Instructions, calculations |
| Decision | Diamond | Yes/No questions, conditions |
| Input/Output | Parallelogram | Input data, output results |
| Subroutine | Rectangle with double sides | Function/procedure call |
| Connector | Circle | Off-page connector |

### Builder Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ Toolbox                                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ ⬭ Start │ │ ▢ Process│ │ ◇ Decision│ │ ▱ I/O  │ │ ⟦⟧ Sub │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        Canvas Area                              │
│                                                                 │
│     ┌─────────────┐                                            │
│     │    Start    │                                            │
│     └──────┬──────┘                                            │
│            │                                                    │
│            ▼                                                    │
│     ╱             ╲                                             │
│    ╱   x > 10?     ╲──── No ────▶ ...                          │
│    ╲               ╱                                            │
│     ╲             ╱                                             │
│            │ Yes                                                │
│            ▼                                                    │
│        ...                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
│ 🗑️ Delete | ↩️ Undo | ↪️ Redo | 🔗 Connect | 📝 Edit Text      │
└─────────────────────────────────────────────────────────────────┘
```

### Interaction Model

1. **Add Node**: Drag symbol from toolbox to canvas
2. **Edit Text**: Double-click node to edit content
3. **Connect Nodes**: Click source node, then target node (auto-routes arrow)
4. **Decision Branches**: After connecting from decision, prompted for "Yes" or "No" label
5. **Move Node**: Drag to reposition, arrows auto-adjust
6. **Delete**: Select and press Delete/Backspace, or use delete tool

### Data Model

```typescript
interface FlowchartNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'io' | 'subroutine' | 'connector';
  text: string;
  position: { x: number; y: number };
}

interface FlowchartEdge {
  id: string;
  from: string;  // node id
  to: string;    // node id
  label?: string; // "Yes", "No", or custom
}

interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  metadata: {
    createdAt: string;
    lastModified: string;
  };
}
```

### Export Formats

1. **JSON**: Full semantic data (primary, for marking)
2. **PNG**: Rendered image (for display, records)
3. **SVG**: Vector image (optional, for high-quality export)

---

## Question File Schema

### Flowchart Build Question (_Q.md)

```markdown
---
questionId: "4a"
marks: 6
questionType: "flowchart-build"
algorithm: "linear-search"
expectedNodes:
  - type: "start"
  - type: "io"
    content: "input search value"
  - type: "process"
    content: "set index to 0"
  - type: "decision"
    content: "index < length?"
  - type: "decision"
    content: "item found?"
  - type: "io"
    content: "output index"
  - type: "io"  
    content: "output not found"
  - type: "process"
    content: "increment index"
  - type: "end"
minDecisions: 2
mustLoop: true
---

Draw a flowchart for a linear search algorithm.

The algorithm should:
- Take a search value as input
- Search through an array
- Output the index if found
- Output "not found" if not in array
```

### Flowchart Complete Question (_Q.md)

```markdown
---
questionId: "5b"
marks: 4
questionType: "flowchart-complete"
providedFlowchart: |
  {
    "nodes": [
      {"id": "1", "type": "start", "text": "Start", "position": {"x": 100, "y": 50}},
      {"id": "2", "type": "io", "text": "Input number", "position": {"x": 100, "y": 150}},
      {"id": "3", "type": "decision", "text": "???", "position": {"x": 100, "y": 250}},
      {"id": "4", "type": "io", "text": "Output 'Even'", "position": {"x": 50, "y": 350}},
      {"id": "5", "type": "io", "text": "???", "position": {"x": 200, "y": 350}},
      {"id": "6", "type": "end", "text": "End", "position": {"x": 100, "y": 450}}
    ],
    "edges": [
      {"from": "1", "to": "2"},
      {"from": "2", "to": "3"},
      {"from": "3", "to": "4", "label": "Yes"},
      {"from": "3", "to": "5", "label": "No"},
      {"from": "4", "to": "6"},
      {"from": "5", "to": "6"}
    ]
  }
missingElements: ["3.text", "5.text"]
---

Complete the flowchart to determine if a number is even or odd.
Fill in the missing decision condition and output.
```

### Flowchart Fix Question (_Q.md)

```markdown
---
questionId: "6c"
marks: 3
questionType: "flowchart-fix"
providedFlowchart: |
  {
    "nodes": [...],
    "edges": [...]
  }
errors:
  - type: "wrong-symbol"
    nodeId: "4"
    description: "Uses process instead of decision"
  - type: "missing-connection"
    from: "5"
    to: "3"
    description: "Loop back missing"
  - type: "wrong-label"
    edgeId: "e3"
    description: "Yes/No reversed"
---

The flowchart below contains errors. Identify and fix them.
```

---

## Mark Scheme Schema for Flowcharts

```markdown
---
questionId: "4a"
marks: 6
markingStrategy: "flowchart-rubric"
---

## Structure Marks (3 marks)

- Correct start and end terminators [1]
- Uses decision diamonds for conditions [1]
- Uses parallelograms for input/output [1]

## Logic Marks (3 marks)

- Loop structure present (returns to comparison) [1]
- Both "found" and "not found" outcomes handled [1]
- Index/counter incremented within loop [1]

## Accept
- Any valid variable names
- Loop condition can be "while not found AND not end"
- Can use flag variable or direct comparison

## Do Not Accept  
- Using process box for decisions
- Missing loop back arrow
- No termination condition (infinite loop)
```

---

## AI Marking for Flowcharts

### Structural Analysis (No Vision Needed)

Since we have JSON data, structural marking is deterministic:

```python
def analyze_flowchart_structure(flowchart: FlowchartData, requirements: dict) -> dict:
    """Analyze flowchart structure without AI"""
    
    results = {
        "has_start": any(n.type == "start" for n in flowchart.nodes),
        "has_end": any(n.type == "end" for n in flowchart.nodes),
        "decision_count": sum(1 for n in flowchart.nodes if n.type == "decision"),
        "has_loop": detect_loop(flowchart),
        "all_nodes_connected": check_connectivity(flowchart),
        "correct_symbols": check_symbol_usage(flowchart)
    }
    
    return results
```

### Logic Analysis (AI Required)

For evaluating whether the flowchart solves the problem correctly:

```
You are marking a GCSE Computer Science flowchart response.

## Question
{question_text}

## Student's Flowchart (as structured data)
Nodes:
- Start
- Input: "Enter number"
- Decision: "number MOD 2 = 0?"
  - Yes -> Output: "Even"
  - No -> Output: "Odd"
- End

Connections:
Start -> Input -> Decision
Decision (Yes) -> Output "Even" -> End
Decision (No) -> Output "Odd" -> End

## Mark Scheme
{mark_scheme}

## Instructions
1. Verify the algorithm logic is correct for the given problem
2. Trace through with sample inputs mentally
3. Check all paths lead to appropriate outputs
4. Identify any logical errors

## Response Format (JSON)
{
  "structureMarks": {
    "awarded": 3,
    "max": 3,
    "breakdown": [...]
  },
  "logicMarks": {
    "awarded": 2,
    "max": 3,
    "breakdown": [...]
  },
  "traceResults": [
    {"input": "4", "expectedOutput": "Even", "actualOutput": "Even", "correct": true},
    {"input": "7", "expectedOutput": "Odd", "actualOutput": "Odd", "correct": true}
  ],
  "feedback": "...",
  "errors": []
}
```

### AI API Error Handling

**API Strategy:**
- **Primary**: Google Gemini 2.0 Flash (text-based analysis of flowchart JSON)
- **Fallback**: Hugging Face free inference API (if available)
- **Timeout**: 30 seconds max

**Structural Marking**: Always works (deterministic, no AI needed)

**When Logic Analysis AI Fails:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Flowchart Logic Marking Unavailable  │
├─────────────────────────────────────────┤
│ Structure: ✅ 3/3 marks                 │
│ (Start node present, end node present,  │
│  all paths connected)                    │
│                                          │
│ Logic marking is unavailable. Please    │
│ trace through your flowchart and        │
│ self-assess the logic marks:            │
│                                          │
│ Mark Scheme (Logic - 3 marks):          │
│ • Correctly checks MOD 2 (1 mark)       │
│ • Outputs "Even" for YES path (1 mark)  │
│ • Outputs "Odd" for NO path (1 mark)    │
│                                          │
│ Logic marks you think you earned:       │
│ ┌─────┐                                 │
│ │  3  │ / 3 marks                       │
│ └─────┘                                 │
│                                          │
│        [Submit Self-Assessment]          │
└─────────────────────────────────────────┘
```

**Data Handling:**
- Structural marks always awarded (deterministic)
- Logic marks from student self-assessment if AI fails
- Stored as: `{ structureMarks: 3, logicMarks: 3, markingSource: "partial-self-assessment" }`
- Flagged for teacher review in analytics

---

## Edge Cases for Flowcharts

### Structural Edge Cases

- **Multiple start nodes**: Invalid - flag error, mark as incorrect
- **No end node**: May be valid for continuous loops - context dependent
- **Disconnected nodes**: Identify orphaned nodes in feedback
- **Self-loop**: Valid in some cases (retry logic)
- **Crossing arrows**: Visually messy but logically valid - don't penalise

### Decision Node Edge Cases

- **More than 2 outputs**: Non-standard but sometimes used - accept if logical
- **Unlabelled branches**: Assume first is Yes, second is No (with warning)
- **Text not a question**: Accept statements like "x > 5" without "?"
- **Complex conditions**: "x > 5 AND y < 10" is valid

### Logic Edge Cases

- **Correct logic, wrong symbols**: Partial marks (structure fail, logic pass)
- **Correct symbols, wrong logic**: Partial marks (structure pass, logic fail)
- **Infinite loop potential**: Flag but may be intentional (e.g., game loop)
- **Missing edge cases**: e.g., doesn't handle empty array - note in feedback
- **Alternative correct solutions**: Multiple valid algorithms exist

### UI Edge Cases

- **Overlapping nodes**: Allow but warn
- **Very long text in node**: Truncate display, show full on hover
- **Too many nodes for canvas**: Enable scroll/zoom
- **Accidental node deletion**: Undo must work

---

## Flowchart Rendering

### Canvas Rendering (React)

```typescript
const FlowchartRenderer: React.FC<{data: FlowchartData}> = ({data}) => {
  // Use a library like react-flow or custom SVG rendering
  // Nodes positioned absolutely
  // Edges rendered as SVG paths with arrow markers
  // Decision diamonds need special handling for 2 outputs
};
```

### Recommended Libraries

- **react-flow**: Full-featured, good for builder
- **elkjs**: Auto-layout algorithm
- **dagre**: Graph layout for rendering
- **Custom SVG**: Most control, more work

### Symbol Rendering

```svg
<!-- Start/End (Stadium shape) -->
<rect rx="20" ry="20" ... />

<!-- Process (Rectangle) -->
<rect ... />

<!-- Decision (Diamond) -->
<polygon points="50,0 100,50 50,100 0,50" ... />

<!-- I/O (Parallelogram) -->
<polygon points="10,0 90,0 80,50 0,50" ... />

<!-- Subroutine (Double-sided rectangle) -->
<rect ... />
<line x1="10" y1="0" x2="10" y2="50" ... />
<line x1="90" y1="0" x2="90" y2="50" ... />
```

---

## Database Schema Additions

```sql
-- Flowchart-specific storage
ALTER TABLE responses ADD COLUMN flowchart_data JSONB;

-- For flowchart-complete questions, store the diff
ALTER TABLE responses ADD COLUMN flowchart_changes JSONB;

-- Question assets for partial flowcharts
-- (reuse question_assets from Iteration 2)
```

---

## Testing Requirements

### Builder Component Tests

- Add each node type
- Connect nodes correctly
- Edit text in nodes
- Delete nodes (connections update)
- Undo/redo full sequence
- Export JSON matches expected structure
- Export PNG renders correctly

### Marking Tests

- Correct flowchart gets full marks
- Missing start/end loses structure marks
- Wrong symbols identified correctly
- Logical errors detected
- Partial credit awarded appropriately
- Multiple correct solutions accepted

### Edge Case Tests

- Very complex flowchart (20+ nodes)
- Minimal flowchart (start -> process -> end)
- Flowchart with multiple decisions
- Flowchart with nested loops
- Invalid flowchart (disconnected nodes)

---

## Performance Considerations

- **Node limit**: Soft limit at 50 nodes (warn), hard limit at 100
- **Rendering**: Use canvas or WebGL for large flowcharts
- **Auto-layout**: Run in web worker to avoid UI freeze
- **JSON size**: Flowchart data is small (<50KB typically)

---

## Migration from Freehand

If a student starts in freehand mode (Iteration 2) for a flowchart question, offer conversion:

```
"Would you like to use the flowchart builder instead? 
It's easier to edit and will be marked more accurately."

[Use Builder] [Keep Drawing]
```

---

## Success Criteria

- [ ] All standard flowchart symbols available in builder
- [ ] Nodes can be added, connected, edited, and deleted
- [ ] Decision nodes support Yes/No branches correctly
- [ ] Auto-routing creates clean connection lines
- [ ] Undo/redo works for all operations
- [ ] Export produces accurate JSON representation
- [ ] Rendered PNG matches builder display
- [ ] Structural analysis correctly identifies all elements
- [ ] AI logic analysis validates algorithm correctness
- [ ] Partial marks awarded appropriately for partial solutions
- [ ] Multiple correct algorithms accepted
- [ ] Flowchart-complete questions load partial flowcharts correctly
- [ ] Performance acceptable with 30+ node flowcharts
- 