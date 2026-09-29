# JD Update Workflow

---

### Step 1: Open the existing JD
* **Agent:** Please provide or select the existing job description you want to update.
* **Builder instruction:** Retrieve the current JD and any related leveled JDs available for comparison. Do not require the manager to recreate existing content.

---

### Step 2: Ask for reasoning behind the update(s)
* **Agent:** Please provide the reason(s) for the update?
* **Options:** Upscales | Adding/Removing Responsibilities | Editing Qualifications | Aligning Knowledge / Skills / Abilities | Changing Reporting Relationship/People Leadership | Title | Other
* **Builder instruction:** Allow multiple selections.

---

### Step 3: Explain the review process
* **Agent:** I will walk you through the job description one section at a time. You will be able to view the current language and decide whether to keep it or revise it.
* **Builder instruction:** The manager must view the current content before deciding whether a revision is needed.

---

## Section-by-Section Review

### Purpose
* **Agent:** Would you like to revise the Purpose section?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the complete current Purpose first.

---

### Principal Duties and Responsibilities
* **Agent:** Would you like to revise any responsibilities?
* **Options:** No Changes | Add a Responsibility | Remove a Responsibility | Modify an Existing Responsibility
* **Builder instruction:** Display all current responsibilities first.

---

### People Leadership
* **Agent:** Would you like to revise the current People Leadership information?
* **Options:** Keep As Is | Revise This Section
* **Builder Instructions:**
  1. Display the current People Leadership status first.
  2. If the user selects **Keep As Is**, retain the existing information and continue.
  3. If the user selects **Revise This Section**:
     - **a.** If the current status is **"This Position Manages People"**, ask:
       - **i.** "Will this position continue to oversee two or more employees?"
         - **1. Yes** → Ask: *"Please provide the exact number of direct reports."*
           - **a.** Set status to **"This Position Manages People."**
           - **b.** Store the number of direct reports provided.
     - **b.** If the current status is **"Individual Contributor"**, ask:
       - **i.** "Will this position now have direct reports?"
         - **1. Yes** → Ask: *"Please provide the exact number of direct reports."*
           - **a.** Set status to **"This Position Manages People."**
         - **2. No** → Retain **"Individual Contributor."**

---

### Sales / Non-Sales
* **Agent:** Would you like to revise the Sales / Non-Sales information?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current information first.

---

### Relationship Manager
* **Agent:** Would you like to revise the Relationship Manager information?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current information first. If the answer selected is to "Revise", ask the following: Does this role serve as the primary point of contact for assigned customer, client, or business relationships? Is the role responsible for managing an assigned portfolio, book of business, customer relationships, or client accounts? -- If the answer is yes, then it should be an RM; if the answer is no, then it should not be an RM.

---

### NMLS
* **Agent:** Would you like to revise the NMLS information?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current information first. If the answer selected is to "Revise", ask the following: Will this role discuss or negotiate residential mortgage loan terms, take applications, or otherwise perform duties that may require NMLS registration? – If the answer is yes, then it should have NMLS; if the answer is "no", then it should not have NMLS.

---

### Education
* **Agent:** Would you like to revise the education requirement or preference?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current education language first.

---

### Work Experience
* **Agent:** Would you like to revise the work experience requirement?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current experience requirement first.

---

### Licenses and Certifications
* **Agent:** Would you like to revise licenses, certifications, registrations, or professional designations?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display the current requirements first.

---

### Knowledge
* **Agent:** Would you like to revise the Knowledge statements?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display current Knowledge first.

---

### Skills
* **Agent:** Would you like to revise the Skills statements?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display current Skills first.

---

### Abilities
* **Agent:** Would you like to revise the Abilities statements?
* **Options:** Keep As Is | Revise This Section
* **Builder instruction:** Display current Abilities first.

---

### Title
* **Agent:** Would you like to request a title review?
* **Options:** Keep Current Title | Request Title Review
* **Builder instruction:** Use the Governance Guide and flag the request for HR approval.

---

### Other
* **Agent:** Is there another ongoing section or job requirement you want to review?
* **Builder instruction:** Do not add temporary projects, annual goals, individual accomplishments, or employee-specific qualifications.

---

## Workflow Controls & Logic

### Related-Role Comparison
* When the role has related levels, display the current JDs side by side before finalizing a change.
* Examples include I, II, III, Senior, and Lead versions of the same role.
* Compare Purpose, Responsibilities, Education, Work Experience, Licenses/Certifications, and KSAs.
* Recognize that related levels may intentionally share the same Purpose and core Responsibilities.
* Focus comparison on documented differences, especially education, experience, qualifications, scope of assignments, complexity, and KSAs.
* If a proposed change creates overlap or inconsistency with another level, flag a Job Architecture review and show the manager the conflict.
* Do not update another JD automatically. Require HR review of the related roles.

---

### Revision Confirmation
* **Agent:** What changed, and why is this an ongoing change to the position?
* **Builder instruction:** Ask only for sections selected for revision. Draft the revised wording and allow Accept Revision, Edit Revision, or Return to Current Language.

---

### Continue Review
* **Agent:** Have you completed everything you wanted to update in this section?
* **Options:** Yes, Proceed to Review Another Section | No, Remain in this Section
* **Builder instruction:** Continue section by section; once one section is finalized, ask this question before moving on to the next.

---

### Final Consolidated Review
* **Agent:** Here are the revised sections and the sections kept unchanged. Please review the complete update summary.
* **Options:** Approve and Submit | Edit a Revised Section | Review an Unchanged Section
* **Builder instruction:** Separate revised sections, unchanged sections, related-role concerns, unresolved items, and HR review flags.

---

### Manager Confirmation
* **Agent:** I confirm that the revised job description reflects the ongoing responsibilities and minimum requirements of the position.
* **Options:** Confirm | Return for Editing
* **Builder instruction:** Do not submit until the manager confirms.

---

## HR Review Flags
* Title or level overlap
* Related-role inconsistency
* People leadership or reporting structure change
* Education or experience overlap between related levels
* License, certification, Sales, RM, portfolio, or NMLS change

---

## Expected Agent Output
* Intake summary
* First-draft or revised JD
* Only necessary follow-up questions
* Related-role comparison when applicable
* HR review flags
* Section-level manager review
* Manager confirmation

---

## Acceptance Test
- [ ] The Agent uses the tested new-position conversation and explains concepts only when needed.
- [ ] The Agent captures Sales, RM, portfolio, and NMLS with simple prompts.
- [ ] The Agent captures approved education and experience options and retains equivalency language.
- [ ] The Agent generates KSAs in K-S-A order aligned to Purpose and Responsibilities.
- [ ] The JD Update path includes the What are you updating? checklist.
- [ ] The Agent displays current content before the manager decides whether to revise it.
- [ ] The Agent compares related leveled roles when available.
- [ ] The Agent does not regenerate the entire JD after a single change.
- [ ] The Agent uses the Governance Guide for title and level questions and leaves final determinations with HR.