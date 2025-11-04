# Legal Challenges: GDPR Compliance & Student Data Protection

---

## ⚠️ CRITICAL DISCLAIMER

**THIS DOCUMENT IS NOT LEGAL ADVICE.**

- The author is not a lawyer, data protection officer, or legal professional
- This is personal research for educational purposes only
- UK data protection law is complex and fact-specific
- You MUST consult a qualified UK data protection lawyer or DPO before processing student data
- This document reflects general understanding and may be incomplete or inaccurate
- Laws change - verify current requirements with legal counsel
- Do not rely on this document for legal compliance decisions

**Consult a lawyer before launching any product that processes student data.**

---

## The Core Question

**"If I encrypt student names on my servers, am I GDPR compliant?"**

**Short answer:** It depends on the architecture. Encryption alone is not sufficient for GDPR exemption if you hold the decryption keys.

**Long answer:** See below for four architecture options with different legal implications.

---

## GDPR Fundamentals

### What is "Personal Data"?

GDPR Article 4(1):
> 'personal data' means any information relating to an identified or identifiable natural person

**Student names are personal data.** Even encrypted names can be personal data if you can decrypt them.

### Key Distinctions

| Technique | Definition | Still Personal Data? |
|-----------|------------|---------------------|
| **Encryption** | Data transformed using reversible process | ✅ YES (if you hold keys) |
| **Pseudonymization** | Replacing identifiers with pseudonyms | ✅ YES (but reduced risk) |
| **Anonymization** | Irreversible removal of identifiers | ❌ NO (no longer personal data) |

**Critical:** If you can link data back to a student, it's personal data under GDPR.

### Data Controller vs Data Processor

- **Data Controller:** Determines purposes and means of processing (typically the school)
- **Data Processor:** Processes data on behalf of controller (potentially you, if storing student names)

If you're a data processor, you need **Data Processing Agreements (DPAs)** with schools.

---

## Architecture Options: Legal Implications Spectrum

### ❌ Option A: Server-Side Encryption (You Hold Keys)

**Architecture:**
```
Server Database:
- student_id: uuid-1234
- name_encrypted: "8a7f3b2..."
- encryption_key: stored on server

You can decrypt → You're processing personal data
```

**Legal Position:**
- You are a **data controller or processor**
- Student names are **personal data** (you can decrypt)
- Full GDPR compliance required

**Requirements:**
- ✅ Legal basis for processing (consent, contract, legitimate interest)
- ✅ Privacy policy explaining data use
- ✅ Data Processing Agreement (DPA) with each school
- ✅ Right to access, rectification, erasure (GDPR Articles 15-17)
- ✅ Data breach notification (within 72 hours)
- ✅ Security measures (encryption at rest, in transit)
- ✅ Data retention policy (delete after X time)
- ✅ ICO registration (possibly required, £40-60/year)
- ✅ Parental consent (possibly required for under 13s)
- ✅ DPIA (Data Protection Impact Assessment) for high-risk processing

**Cost/Complexity:** High - requires legal team, DPAs with every school, ongoing compliance monitoring

**Verdict:** ❌ Not recommended for MVP - too complex and expensive

---

### ⚠️ Option B: Client-Side E2E Encryption (Teacher Holds Keys)

**Architecture:**
```
Server Database:
- student_id: uuid-1234
- name_encrypted: "8a7f3b2..."

Teacher's Browser:
- encryption_key: stored in localStorage (never sent to server)

You cannot decrypt → Arguable you're not processing personal data
```

**Legal Position:**
- **Arguable** you're not processing personal data (you can't decrypt)
- Server stores encrypted blobs it cannot read
- Reduced obligations, but **still needs legal review**

**Requirements:**
- ✅ Privacy policy stating zero-knowledge architecture
- ✅ Security measures (HTTPS, encrypted database at rest)
- ✅ Right to delete encrypted data
- ⚠️ Possibly no DPAs needed (arguable)
- ⚠️ Possibly no ICO registration (arguable)

**Grey Areas:**
- If server temporarily decrypts for AI marking (in memory), is that processing?
- If teacher loses key and you help recover, are you a data controller?
- Do you need consent from students/parents?

**Cost/Complexity:** Medium - still needs legal review, privacy policy, but simpler than Option A

**Verdict:** ⚠️ Better than Option A, but legal uncertainty remains

---

### ✅ Option C: Pseudonymous Identifiers Only (No Real Names)

**Architecture:**
```
Server Database:
- student_id: uuid-1234
- pseudonym: "sparkling unicorn"
- content: "Essay about Shakespeare..."

Teacher's Browser (LocalStorage):
- "sparkling unicorn" → "John Smith"
- "blue dragon" → "Jane Doe"

Server never sees real names
```

**Legal Position:**
- **Strong argument** you're not processing personal data
- Pseudonyms like "sparkling unicorn" are not identifiers (no reasonable way to link to real person)
- Teacher maintains local mapping, but you never have access to it
- Even if content is stored, it's not linked to identifiable students

**Requirements:**
- ✅ Privacy policy explaining pseudonymous architecture
- ✅ Security measures
- ✅ Right to delete assignments
- ❌ Likely no DPAs needed (not processing personal data)
- ❌ Likely no ICO registration needed
- ❌ Likely no parental consent needed

**Strengths:**
- Minimal legal obligations
- No student identifiable data on server
- Teacher controls real name mapping locally
- Clear privacy story: "We never know student names"

**Considerations:**
- Content might still be identifiable (e.g., "My name is John" in essay)
- Need to ensure pseudonyms are truly random (not linked to student records)
- Teacher could lose local mapping (acceptable trade-off)

**Cost/Complexity:** Low - minimal legal compliance, clear privacy position

**Verdict:** ✅ Recommended for MVP - strong legal position with minimal overhead

---

### ✅✅ Option D: Pseudonymous + E2E Encrypted Content (Maximum Privacy)

**Architecture:**
```
Server Database:
- student_id: uuid-1234
- pseudonym: "sparkling unicorn"
- content_encrypted: "a8f3b2..." (teacher holds key)

Teacher's Browser:
- "sparkling unicorn" → "John Smith"
- encryption_key: for decrypting content

Server has zero personal data (cannot decrypt, no real names)
```

**Legal Position:**
- **Strongest possible position** under GDPR
- No personal data processed (pseudonyms + encrypted content)
- Even if subpoenaed, you cannot provide student names or readable content
- True zero-knowledge architecture

**Requirements:**
- ✅ Privacy policy explaining architecture
- ✅ Security measures
- ❌ Likely no GDPR obligations (not processing personal data)
- ❌ No DPAs, ICO registration, consent needed

**Strengths:**
- Zero legal risk (no personal data)
- Unique market differentiator (no competitor offers this)
- Strong privacy story: "We cannot read student names or work"
- No compliance overhead

**Considerations:**
- More complex UX (teacher manages keys)
- Teacher loses key → data lost (acceptable for MVP)
- May need to explain to non-technical teachers

**Cost/Complexity:** Low legal, Medium technical

**Verdict:** ✅✅ Ideal for privacy-focused product - maximum protection, minimal legal risk

---

## Comparison Table: Architecture Options

| Aspect | Option A<br>(Server Encryption) | Option B<br>(E2E Encryption) | Option C<br>(Pseudonyms) | Option D<br>(Pseudonyms + E2E) |
|--------|--------------------------------|------------------------------|-------------------------|-------------------------------|
| **Server has real names?** | ✅ Yes (encrypted) | ✅ Yes (encrypted) | ❌ No (pseudonyms only) | ❌ No (pseudonyms only) |
| **Server can decrypt names?** | ✅ Yes | ❌ No | N/A (no names) | N/A (no names) |
| **Server has readable content?** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No (encrypted) |
| **Processing personal data?** | ✅ YES | ⚠️ Arguable | ⚠️ Possibly (content) | ❌ NO |
| **Need DPAs with schools?** | ✅ YES | ⚠️ Possibly | ❌ Likely NO | ❌ NO |
| **Need ICO registration?** | ✅ YES | ⚠️ Possibly | ❌ Likely NO | ❌ NO |
| **Need parental consent?** | ✅ YES | ⚠️ Possibly | ❌ Likely NO | ❌ NO |
| **Privacy policy needed?** | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Legal review needed?** | ✅ ESSENTIAL | ✅ Recommended | ⚠️ Optional | ⚠️ Optional |
| **Legal complexity** | 🔴 High | 🟡 Medium | 🟢 Low | 🟢 Low |
| **Technical complexity** | 🟢 Low | 🟡 Medium | 🟢 Low | 🟡 Medium |
| **GDPR risk** | 🔴 High | 🟡 Medium | 🟢 Low | 🟢 Minimal |
| **Market differentiator** | ❌ No | ⚠️ Moderate | ✅ Yes | ✅✅ Unique |

**Recommended:** Start with **Option D** (pseudonyms + E2E encryption) for MVP testing. Minimize legal risk, maximize privacy differentiation.

---

## Hypothesis 1 vs Hypothesis 2: Legal Implications

### Hypothesis 1: Exam Practice (In-Class Formative Assessment)

**Use Case:** Students answer exam questions in lesson, see peer responses, vote on best answers

**Privacy Requirements:**
- Do you need real student names? **NO** (pattern-spotting works with pseudonyms)
- Do you need to link back to students? **NO** (formative, no grades)
- How long to retain data? **Short-term** (delete after lesson)

**Recommended Architecture:** Option C or D (pseudonyms)

**Why:**
- No need for real names (teacher knows who's who in class)
- Pseudonyms like "sparkling unicorn" add fun engagement
- Zero legal risk (no personal data)
- Can delete all data after lesson

**Example UX:**
```
Teacher: "Everyone answer Q5. Your pseudonyms are on the screen."
Student sees: "You are 'purple phoenix' for this session"
Class sees responses from: "purple phoenix", "blue dragon", "golden tiger"
Teacher knows locally who these are, server never knows
```

---

### Hypothesis 2: Data Drops (Summative Assessment for Grades)

**Use Case:** Students submit coursework, AI marks, teacher reviews, grades exported to SIMS/Arbor

**Privacy Requirements:**
- Do you need real student names? **YES** (for grade export to school systems)
- Do you need to link back to students? **YES** (official grades)
- How long to retain data? **Longer-term** (until data drop complete, then delete)

**Recommended Architecture:** Option C or D (pseudonyms + local mapping)

**Why:**
- Pseudonyms on server (privacy-preserving)
- Teacher maintains local mapping (pseudonym → real name)
- Grade export happens client-side (teacher's browser decrypts, generates CSV with real names)
- Server never has access to real names

**Example UX:**
```
1. Teacher uploads roster → browser generates pseudonyms
   "John Smith" → "sparkling unicorn"
   "Jane Doe" → "blue dragon"

2. Teacher shares submission links:
   yourapp.com/submit/sparkling-unicorn

3. Students submit work (server stores under pseudonym)

4. AI marks work (server knows "sparkling unicorn got Grade B")

5. Teacher exports grades:
   Browser decrypts: "sparkling unicorn" → "John Smith"
   CSV: "John Smith, Grade B, 'Great analysis...'"

Server never sees "John Smith" in CSV
```

**Trade-off:** Teacher must manage roster locally (if lost, mapping is lost)

**Mitigation:** Encrypted cloud backup (teacher's password, you can't decrypt)

---

## UK Education-Specific Requirements

### ICO Guidance (UK Data Protection Authority)

**Schools as Data Controllers:**
- Schools are data controllers for student data
- Schools must have legal basis (usually "public task" under GDPR Article 6(1)(e))
- Schools must protect student data and vet third-party processors

**Third-Party Processors:**
- If you process student data, school needs DPA with you
- ICO expects schools to conduct due diligence on vendors
- Schools may reject tools without proper data protection

**ICO Guidance for EdTech:**
From ["Data protection and education"](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/childrens-privacy-and-data-protection-in-education-guidance/):
> "Schools should minimise data collection and only collect what is necessary"

**Implication:** Pseudonymous architecture aligns with ICO guidance (data minimization)

---

### Children's Data (Under 18)

**Higher Standards Apply:**
- UK GDPR has special protections for children
- "Best interests of the child" must be primary consideration
- Need age-appropriate privacy notices

**Age of Digital Consent (UK):**
- 13 years old for most online services
- Schools can provide consent for under 13s in educational context
- But parental consent may be required depending on service

**For KS3 (ages 11-14):**
- Some students under 13 (need parental consent or school consent)
- Age-appropriate language in privacy notices
- Cannot use data for marketing/profiling

**Implication:** Pseudonymous architecture avoids consent complexity (no personal data processed)

---

### Safeguarding Considerations

**UK Safeguarding Requirements:**
- Schools have duty to protect children
- Must report concerns about child welfare
- Data protection doesn't override safeguarding duties

**For Your Product:**
- If you see content indicating abuse/harm, what's your obligation?
- With pseudonyms, you can't identify the child (school must handle)
- Need clear policy: "Teacher is responsible for safeguarding, we cannot identify students"

---

## Compliance Checklist by Architecture

### If Using Option A (Server-Side Encryption)

**Before MVP:**
- [ ] Consult UK data protection lawyer
- [ ] Draft privacy policy (GDPR-compliant)
- [ ] Draft terms of service
- [ ] Draft Data Processing Agreement template
- [ ] Conduct DPIA (Data Protection Impact Assessment)
- [ ] Register with ICO (if required)
- [ ] Set up data breach response plan
- [ ] Implement right to access/delete mechanisms

**Before School Adoption:**
- [ ] DPA signed with each school
- [ ] Legal basis confirmed (consent, contract, legitimate interest)
- [ ] Parental consent mechanism (if required)
- [ ] School data controller approves processing

**Ongoing:**
- [ ] Annual GDPR compliance audit
- [ ] Data breach monitoring
- [ ] Respond to subject access requests (30 days)
- [ ] Review and update privacy policy annually

**Cost Estimate:** £5,000-15,000 legal setup + ongoing compliance costs

---

### If Using Option B (E2E Encryption, Teacher Keys)

**Before MVP:**
- [ ] Consult UK data protection lawyer (recommended)
- [ ] Draft privacy policy (explain zero-knowledge architecture)
- [ ] Terms of service
- [ ] Implement encryption correctly (no key leakage)
- [ ] Security audit

**Before School Adoption:**
- [ ] Legal review of zero-knowledge claims
- [ ] Possibly DPAs (lawyer will advise)
- [ ] School approval of architecture

**Ongoing:**
- [ ] Maintain encryption security
- [ ] Privacy policy updates
- [ ] Respond to deletion requests

**Cost Estimate:** £2,000-5,000 legal review + ongoing maintenance

---

### If Using Option C or D (Pseudonyms)

**Before MVP:**
- [ ] Draft privacy policy (explain pseudonymous architecture)
- [ ] Terms of service
- [ ] Ensure pseudonyms are truly random (not linked to school records)
- [ ] Test that no personal data leaks in content

**Before School Adoption:**
- [ ] Optional legal review (low risk, but prudent)
- [ ] School understands they maintain name mapping locally
- [ ] Clear documentation for teachers

**Ongoing:**
- [ ] Privacy policy maintenance
- [ ] Monitor that no personal data accidentally processed
- [ ] Respond to deletion requests (delete assignments)

**Cost Estimate:** £500-1,000 optional legal review + minimal ongoing costs

**Key Difference:** Minimal legal overhead with pseudonymous architecture

---

## Roadmap: MVP Testing vs School Adoption

### Phase 1: MVP Testing (3-10 Teachers, Personal Use)

**Architecture:** Option D (pseudonyms + E2E encryption)

**Legal Requirements:**
- Privacy policy (simple, explain architecture)
- Terms of service (educational/testing use)
- No DPAs needed (personal use, no school contracts)
- No ICO registration (not processing personal data at scale)

**Testing Approach:**
- Teachers use voluntarily (not official school adoption)
- For formative practice only (not official grades initially)
- Pseudonyms only (no real names on server)
- Delete all data after testing

**Legal Risk:** Minimal (no personal data, personal use, informed consent from teacher)

---

### Phase 2: School Adoption (Official Use for Grades)

**Decision Point:** Do you need to process real names?

**If NO (Hypothesis 1 - Exam Practice):**
- Continue with pseudonyms (Option C/D)
- Minimal legal requirements
- Schools comfortable (no data processing)

**If YES (Hypothesis 2 - Data Drops with Real Names):**
- Two options:
  1. **Stay pseudonymous:** Local mapping on teacher's device (recommended)
  2. **Store real names:** Requires full GDPR compliance (Option A/B)

**Legal Review Needed:**
- Consult lawyer before official school adoption
- Confirm pseudonymous architecture is compliant
- Draft school-facing documentation
- Possibly light-touch DPA (even with pseudonyms, good practice)

**Cost:** £1,000-3,000 legal review for school adoption readiness

---

### Phase 3: Scale (100+ Schools)

**If Using Pseudonyms (Option C/D):**
- Privacy policy refinement
- Insurance (professional indemnity, cyber liability)
- Ongoing security audits
- Customer support for GDPR questions

**If Using Real Names (Option A/B):**
- Full legal compliance team
- DPA automation (template + signing process)
- ICO registration
- Data breach insurance
- Annual compliance audits

**Cost Difference:**
- Pseudonyms: £2,000-5,000/year legal/insurance
- Real names: £10,000-30,000/year legal/compliance

---

## Risk Analysis

### 🔴 Red Flags: Things That Expose You to Liability

1. **Storing plaintext student names** (even temporarily)
2. **Logging student names** in server logs (common mistake!)
3. **Emailing student names** in notifications/reports
4. **No privacy policy** or unclear terms
5. **No data deletion mechanism** (GDPR requires right to erasure)
6. **Claiming "GDPR compliant" without legal review**
7. **Processing data without DPAs** (if you're a data processor)
8. **Keeping data indefinitely** (need retention policy)

### ⚠️ Common Mistakes

1. **Assuming encryption = GDPR exempt** (it doesn't)
2. **Not considering server logs** (do they contain student names?)
3. **Third-party services** (Claude API, hosting) - do they see student data?
4. **Backup systems** (are backups encrypted? Who has access?)
5. **Employee access** (can your team read student data?)
6. **Forgetting about metadata** (IP addresses, timestamps can be personal data)

### ✅ Best Practices

1. **Data minimization:** Only collect what you need
2. **Pseudonymization by default:** Don't store real names unless essential
3. **Encryption everywhere:** HTTPS, encrypted database, encrypted backups
4. **Clear privacy policy:** Explain what you do (and don't do) with data
5. **Deletion mechanism:** Make it easy for teachers to delete assignments
6. **Regular security audits:** Test for vulnerabilities
7. **Legal review before scaling:** Don't wait until you have 100 schools

---

## How Competitors Handle This

### High-Risk Approach (Most Competitors)

**Examples:** Turnitin, Gradescope, EssayGrader, MagicSchool

**Architecture:**
- Store real student names
- Full GDPR compliance (DPAs, privacy policies, legal teams)
- Accepted practice in EdTech industry

**Why They Do It:**
- Perceived as "necessary" for grading workflow
- Have legal/compliance teams to handle it
- Schools expect traditional data processing

**Cost:** High (legal teams, compliance overhead, insurance)

---

### Your Differentiator: Zero-Knowledge Pseudonymous Architecture

**What No Competitor Offers:**
- Truly zero-knowledge (server cannot read student names or content)
- Pseudonymous by default ("sparkling unicorn" approach)
- Teacher controls all personal data (local mapping)

**Market Positioning:**
> "The only AI marking tool that never knows your students' names. Maximum privacy, zero compliance overhead for schools."

**Benefits:**
- Schools don't need DPAs with you (not processing personal data)
- Parents can't object to data processing (no data processed)
- ICO audit-proof (nothing to audit - no personal data)
- Unique selling point vs. Turnitin, Gradescope, etc.

**Trade-offs:**
- Teacher must manage local mapping (acceptable for target users)
- Cannot offer "admin dashboard" showing all student names (feature, not bug)
- Requires education on "why pseudonyms are better"

---

## Questions to Ask a Lawyer (Before School Adoption)

1. **Architecture Validation:**
   - "If I use pseudonyms like 'sparkling unicorn' with no way to link to real students, am I processing personal data under UK GDPR?"
   - "If student content is encrypted client-side and I cannot decrypt it, am I still a data processor?"

2. **Obligations:**
   - "Do I need Data Processing Agreements with schools if I use pseudonymous architecture?"
   - "Do I need to register with the ICO?"
   - "What are my obligations if a teacher loses their encryption key?"

3. **Children's Data:**
   - "Do I need parental consent for KS3 students (ages 11-14) if I'm not processing their names?"
   - "What age-appropriate privacy notices are required?"

4. **Edge Cases:**
   - "If student writes 'My name is John Smith' in essay content, does that make it personal data?"
   - "If a data breach occurs but data is pseudonymous/encrypted, what are my notification obligations?"
   - "What safeguarding obligations do I have if I see concerning content but cannot identify the student?"

5. **Scaling:**
   - "At what point (number of users/schools) do I need more formal compliance?"
   - "What insurance should I have (professional indemnity, cyber liability)?"

---

## Recommended Approach

### For MVP (Months 1-3)

**Architecture:** Option D (Pseudonyms + E2E Encryption)

**Why:**
- Zero legal risk (no personal data)
- Focus on product validation, not compliance
- Clear privacy story for early adopters
- Differentiator vs competitors

**Legal:**
- Draft simple privacy policy (template available)
- Terms of service (educational use)
- No DPAs, no ICO registration, no lawyer (yet)

**Testing:**
- 3-10 teachers, personal use only
- For formative practice (not official grades)
- Delete all data after testing phase
- Get teacher feedback on pseudonym UX

**Decision Point:** If teachers say "I need real names," then reassess. But test pseudonyms first.

---

### Before School Adoption (Month 4-6)

**If Pseudonyms Work:**
- Optional legal review (£500-1,000)
- Refine privacy policy for school audience
- Create teacher documentation ("How pseudonyms work")
- Insurance (professional indemnity ~£500/year)

**If Real Names Required:**
- Full legal review (£2,000-5,000)
- Draft DPA templates
- ICO registration (£40-60/year)
- DPIA (Data Protection Impact Assessment)
- Parental consent mechanism

**Recommendation:** Try hard to make pseudonyms work. Legal overhead is 10x lower.

---

### Scaling (Month 6+)

**Pseudonymous Path (Low Overhead):**
- Maintain privacy policy
- Security audits (£1,000-2,000/year)
- Insurance (£500-1,000/year)
- Customer support for GDPR questions

**Real Names Path (High Overhead):**
- Legal compliance team (£10,000-30,000/year)
- DPA automation system
- Annual GDPR audits
- Data breach monitoring/insurance
- Subject access request handling

**Cost Difference:** 5-10x more expensive with real names

---

## Conclusion: The Legal Case for Pseudonyms

### Why Pseudonymous Architecture is the Smart Choice

1. **Legal Risk: Minimal**
   - Not processing personal data
   - No DPAs, no ICO registration, no compliance overhead
   - Audit-proof (nothing to audit)

2. **Cost: Low**
   - No legal team needed (for MVP)
   - Optional legal review (£500-1,000)
   - Minimal ongoing compliance costs

3. **Market Differentiation: Unique**
   - No competitor offers true zero-knowledge architecture
   - Privacy-first positioning appeals to schools
   - "We never know your students' names" is powerful message

4. **User Experience: Acceptable**
   - Teacher manages roster locally (fine for target users)
   - Pseudonyms add engagement ("sparkling unicorn" is fun)
   - For Hypothesis 1 (exam practice): no real names needed
   - For Hypothesis 2 (data drops): local mapping + client-side CSV export

5. **Scalability: Sustainable**
   - No legal overhead per school (no DPAs)
   - No compliance burden as you scale
   - Focus on product, not legal paperwork

### The Alternative (Real Names) is Expensive

- Legal setup: £5,000-15,000
- Ongoing compliance: £10,000-30,000/year
- DPA with every school (manual overhead)
- ICO registration, data breach plans, subject access requests
- Professional legal team required

**Unless real names are absolutely essential, avoid this path for MVP.**

---

## Final Recommendations

### ✅ DO This (MVP)

1. **Use pseudonyms** ("sparkling unicorn", "blue dragon")
2. **E2E encrypt content** (teacher holds keys)
3. **Teacher manages roster locally** (browser storage)
4. **Privacy policy** explaining architecture
5. **Delete data after testing** (no long-term retention)
6. **Optional legal review** before school adoption (£500-1,000)

### ❌ DON'T Do This (MVP)

1. Don't store real student names on server (even encrypted)
2. Don't claim "GDPR compliant" without legal review
3. Don't process data for schools without DPAs (if using real names)
4. Don't keep data indefinitely (implement deletion)
5. Don't assume encryption = legal compliance

### 🚦 Decision Tree

```
Do you NEED real student names on server?
│
├─ NO (Hypothesis 1 - Exam Practice)
│  └─ ✅ Use pseudonyms (Option C/D)
│     └─ Minimal legal risk, low cost, unique differentiator
│
└─ YES (Hypothesis 2 - Data Drops)
   │
   ├─ Can teacher manage local mapping?
   │  ├─ YES → ✅ Use pseudonyms + local mapping (Option C/D)
   │  │         └─ Still minimal legal risk
   │  │
   │  └─ NO → ⚠️ Must store real names (Option A/B)
   │            └─ Full GDPR compliance required
   │               └─ Hire lawyer, draft DPAs, ICO registration
   │               └─ £5,000-15,000 setup + ongoing overhead
```

---

## Next Steps

1. **Test pseudonymous architecture in MVP** (Option D)
2. **Gather teacher feedback** on pseudonym UX
3. **If pseudonyms work:** Minimal legal review, scale confidently
4. **If real names essential:** Budget for full legal compliance

**The smart money is on pseudonyms.** Lower risk, lower cost, unique differentiation.

---

## Resources

**UK Data Protection:**
- [ICO: UK GDPR Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [ICO: Children's Data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/)
- [ICO: Data Protection in Education](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/childrens-privacy-and-data-protection-in-education-guidance/)

**Legal:**
- Find a UK data protection lawyer: [Law Society Find a Solicitor](https://solicitors.lawsociety.org.uk/)
- DPO Network: [DPO Centre](https://www.dpocentre.com/)

**Privacy Policy Templates:**
- [ICO Privacy Notice Template](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/accountability-and-governance/privacy-notices-transparency-and-control/)
- [GDPR.eu Resources](https://gdpr.eu/privacy-notice/)

**This is not legal advice. Consult a qualified professional.**
