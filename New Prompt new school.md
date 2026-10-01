# JD Update Workflow — Build Guide v3 (Step 6 onward)

Oct 1, 2026 · @Eric

This guide continues from Step 5 of the v2 guide and replaces everything after it. Steps 1 to 5 stay as they are, apart from one addition to Initialize in Step 6. Every topic is written out in full, in the order the review runs, so you can build the rest of the agent top to bottom without flipping back.

## Step 6: Before you continue

Make one addition to Initialize JD Update, then check the topic names in the hub. After that, every remaining piece of the agent is in this guide, in build order.

### 6.1 Add the reminders variable to Initialize

The reviewer prompt now suggests follow-ups for other sections. For example, a new sales duty suggests the role may need to become Sales. These reminders are kept in a new global table.

1. Open **Initialize JD Update** and go to its setup node (Node 3).
2. Add a **Set a variable value** node. Create a new variable named **Reminders**, and set its **Usage** to **Global (any topic can access)**.
3. Set its value to this formula:

```
Filter(Table({Target: "", From: "", Reminder: ""}), false)
```

That makes an empty table with three columns:

- **Target:** the section key the reminder is for.
- **From:** the section key that raised it.
- **Reminder:** the sentence to show.

The reset block in Step 23 clears it again.

### 6.2 Check the names in the hub

In **Continue JD Update**, Node 6 redirects to one topic per section. Create each topic below with exactly these names, so the redirects match:

| Section key | Topic name | Built in |
| --- | --- | --- |
| Purpose | JD Section – Purpose | Step 8 |
| Duties | JD Section – Principal Duties | Step 9 |
| PeopleLeadership | JD Section – People Leadership | Step 10 |
| Sales | JD Section – Sales | Step 11 |
| RM | JD Section – Relationship Manager | Step 12 |
| NMLS | JD Section – NMLS | Step 13 |
| Education | JD Section – Education | Step 14 |
| Experience | JD Section – Work Experience | Step 15 |
| Licenses | JD Section – Licenses and Certifications | Step 16 |
| Knowledge | JD Section – Knowledge | Step 17 |
| Skills | JD Section – Skills | Step 18 |
| Abilities | JD Section – Abilities | Step 19 |
| Title | JD Section – Title | Step 20 |
| Other | JD Section – Other | Step 21 |

Fill in each Redirect branch in hub Node 6 as you finish its topic.

### 6.3 How each topic below is written

- **Nodes are numbered in the order you add them.** Nodes inside a Condition branch are indented under that branch. A node listed after a Condition goes below it, where the branches rejoin, and runs whichever branch was taken (unless that branch ended the topic).
- **Empty branches.** "Leave empty" means add nothing to that branch. It falls through to the next node below the Condition. Copilot Studio always adds an **All other conditions** branch; leave it empty unless the step says otherwise.
- **Go to step targets.** When a node is marked *(rename to X)*, rename it so you can pick it later in a **Topic management → Go to step** node.
- **Messages with formulas.** Insert variables with the **{x}** button and formulas with **fx**. Where a whole message is given as a code block, insert it as one formula.
- **Question settings.** Every question lists its settings. Open the node's **Properties** to set them:
  - **Allow switching to another topic:** lets side questions work.
  - **Skip behavior → Ask every time:** stops old answers being reused when a topic loops back.
  - **What to do when no valid entity is found:** a safe default instead of escalating.
- **Variables.** `Topic.` variables belong to that topic and start fresh each time it opens. `Global.` variables were created in Steps 3 and 4, plus Reminders in 6.1.

The seven text sections (Purpose, Education, Work Experience, Licenses and Certifications, Knowledge, Skills, Abilities) are built identically apart from their settings. Each is written out in full anyway. If you prefer, you can build Purpose, then copy its YAML into each new topic (**… → Open code editor**) and change only the values marked as section-specific in the copy's step.

## Step 7: The JD Section Reviewer prompt

The prompt drafts revised wording for one section at a time, and does four other jobs:

- comments to the manager;
- the HR flags only it can judge;
- related-level conflicts;
- follow-up reminders for other sections the change may affect.

It now also sees the rest of the job description, so drafts stay consistent with the Purpose, the duties and any changes already accepted. The text sections, Principal Duties and Other use it. People Leadership, Sales, RM, NMLS and Title don't.

### 7.1 Create the prompt

1. In Copilot Studio, go to **Tools → Add tool → New prompt** (or open your existing **JD Section Reviewer**).
2. Add nine text inputs. Give each a realistic sample value so you can test.

| Input | Each topic fills it with |
| --- | --- |
| SectionName | The section's label |
| JobTitle | `Global.JobTitle` |
| CurrentText | The section's current language (for duties, the working numbered list) |
| RequestedChange | The manager's answer to "What changed?" |
| OngoingReason | The manager's answer to "Why is this an ongoing change to the position?" |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | The last draft when editing; otherwise empty |
| JobContext | Every other section's latest value (formula in 7.3) |
| RelatedRoles | The same section from each related level, or empty |

3. Paste the instructions in 7.2, and map each `{Name}` to its input with the input picker.
4. Paste your approved education and experience options where marked.
5. Set the output format to **JSON**.
6. Run the tests in 7.4, then save.

### 7.2 The instructions

```
You are an HR job description reviewer at City National. A manager is updating ONE section of an existing job description. The review goes one section at a time in this order: Purpose, Principal Duties and Responsibilities, People Leadership, Sales / Non-Sales, Relationship Manager, NMLS, Education, Work Experience, Licenses and Certifications, Knowledge, Skills, Abilities, Title, Other. HR makes all final determinations. Your job is to draft clear wording for this one section, point out anything HR will need to review, and remind the manager of other sections this change may affect.

Job title: {JobTitle}
Section being updated: {SectionName}
Current language: {CurrentText}
What the manager wants to change: {RequestedChange}
Why the manager says this is an ongoing change: {OngoingReason}
Reasons for the overall update: {UpdateReasons}
Earlier draft to build on (may be empty): {PreviousDraft}
The rest of this job description, including changes already accepted in this update: {JobContext}
The same section in related levels of this role (may be empty): {RelatedRoles}

Drafting rules:
1. Draft only this section. Never rewrite other sections or the whole job description.
2. If an earlier draft is given, start from it. Keep the style, tense and format of the current language. Do not add anything the manager did not ask for.
3. Principal Duties: the current language is a numbered list, and the change starts with ADD, REMOVE or MODIFY. Apply only that change and return the full updated list, one item per line, numbered from 1.
4. Knowledge statements start with "Knowledge of", Skills with "Skill in", and Abilities with "Ability to". Align them to the Purpose and Principal Duties in the rest of the job description.
5. Education and Work Experience: keep equivalency language (for example "or an equivalent combination of education and experience") unless the manager explicitly asks to remove it. Use only these approved options: [PASTE APPROVED EDUCATION AND EXPERIENCE OPTIONS HERE]
6. Job descriptions cover ongoing responsibilities and minimum requirements only. If the change is a temporary project, an annual goal, an individual accomplishment, or a qualification specific to one employee, explain that in temporaryConcern, do not draft it, and return no followUps.
7. Keep this section consistent with the rest of the job description. In particular, Education and Work Experience should fit each other and the level of the duties. If this change conflicts with something already in the job description, say so in comments.
8. Never mention grade, salary, pay type, status or job code.

Related levels:
9. Compare with the related levels. Related levels may intentionally share the same Purpose and core Responsibilities; that is not a conflict. Flag real overlap or inconsistency, especially in education, experience, qualifications, scope of assignments, complexity and KSAs. For Education and Work Experience, check that requirements still step up sensibly from lower to higher levels. Name the level and describe the conflict in relatedConcern. Never suggest changing another job description.

Follow-ups for other sections:
10. Decide whether this change means another section of THIS job description may also need to change. Use the rest of the job description to check its current content, and only add a follow-up when that section does not already reflect the change. Typical links:
   - Purpose adds or removes a function that is not covered by any Principal Duty -> Duties.
   - New duties or purpose involve supervising staff, direct reports, hiring or performance reviews, and People Leadership is currently Individual Contributor (or all supervision is removed and it is currently Manages People) -> PeopleLeadership.
   - New duties or purpose involve selling, cross-selling, revenue or sales goals, or new business development, and the role is currently Non-Sales (or all selling is removed and it is currently Sales) -> Sales.
   - New duties make the role the primary point of contact for assigned clients, or responsible for a portfolio or book of business, and the role is not currently a Relationship Manager -> RM.
   - New duties involve discussing or negotiating residential mortgage loan terms or taking mortgage applications, and NMLS is not currently required -> NMLS.
   - New duties need a license, registration or certification not already listed -> Licenses.
   - Scope or complexity rises or falls noticeably, or Education changes without a matching change in Work Experience (or the reverse) -> Education or Experience.
   - New duties need knowledge, skills or abilities not already listed -> Knowledge, Skills or Abilities.
   - Scope changes enough that the title or level may no longer fit -> Title.
   Use only these section keys: Purpose, Duties, PeopleLeadership, Sales, RM, NMLS, Education, Experience, Licenses, Knowledge, Skills, Abilities, Title. Never list the section being updated. List at most 4. Write each reminder as one short sentence that names what changed and what to look at, for example: "The new duty to sell deposit products suggests this role may be Sales; it is currently Non-Sales."

Flags: choose only from Related-role inconsistency, Education or experience overlap, Title or level overlap. Use None if none apply.

Return only JSON in exactly this shape:
{
  "proposedText": "the full proposed text for this section",
  "comments": "2 to 4 short comments for the manager, each on its own line starting with - ",
  "flags": "comma-separated flags from the list above, or None",
  "relatedConcern": "the conflict with a named related level, or an empty string",
  "temporaryConcern": "why this is not an ongoing requirement, or an empty string",
  "followUps": [ { "section": "one section key", "reminder": "one sentence" } ]
}
```

### 7.3 The JobContext formula

Every topic that calls the prompt maps **JobContext** to this formula. It lists every other section with its latest value: the accepted change if there is one, otherwise the current value. It is repeated in each topic step, so you can copy it from there.

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

If `As` isn't accepted in your environment, see Troubleshooting.

### 7.4 Test before building topics

Run these in the prompt builder. Each should behave as described.

| Case | Inputs to try | Expected |
| --- | --- | --- |
| Normal edit | Purpose, a real Purpose, "mention vendor oversight" | Only that change; flags None; followUps may include Duties |
| Sales follow-up | Principal Duties, "ADD: Sell deposit and loan products to clients"; JobContext shows "Sales / Non-Sales: Non-Sales" | followUps includes Sales |
| People follow-up | Principal Duties, "ADD: Supervise three tellers"; JobContext shows Individual Contributor | followUps includes PeopleLeadership |
| Education vs experience | Education raised to a bachelor's; JobContext shows 1 year of experience | A comment on consistency; followUps includes Experience |
| Related overlap | Education for a Level I; RelatedRoles has a Level III with the same requirement | relatedConcern names Level III |
| Not ongoing | Duties, "ADD: Lead the 2026 system migration project" | temporaryConcern filled; no draft; no followUps |

If Copilot Studio won't return `followUps` as a list (a table you can loop over), see Troubleshooting for the text fallback.

## Step 8: JD Section – Purpose

Purpose is section 1. The manager sees the current Purpose and chooses Keep As Is or Revise This Section. If they revise, they get a drafted revision to accept, edit or reject, with a comparison against related levels and reminders for other sections.

### 8.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Purpose**.
2. Click the trigger, choose **Change trigger**, and pick **It's redirected to**. No description is needed.
3. Save.

### 8.2 Node 1 – Settings

Add one **Set a variable value** node per row, creating each as a new topic variable:

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Purpose"` |
| Topic.Label | `"Purpose"` |
| Topic.CurrentText | `Global.JD.Purpose` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Purpose").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.Purpose})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 8.3 Node 2 – Show the current Purpose

Add **Send a message**:

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 8.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** add **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

Purpose is the first section, so this only shows when a manager goes back to Purpose after a later section suggested a change here.

### 8.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`.

- **True:** **Send a message**: "You've already requested this change: {Topic.Existing}"
- **All other conditions:** leave empty.

### 8.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Purpose section?"
   - Identify: **Multiple choice options**. Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set the variable to **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **is equal to Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **is equal to Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning to a section already changed):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set the variable to **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

Only **Revise This Section** and **Edit my change** reach Node 6.

### 8.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change."

- Identify: **User's entire response**. Save as: `Topic.RequestedChange`.
- Properties: Allow switching **on**; Skip behavior **Ask every time**.

### 8.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?"

- Identify: **User's entire response**. Save as: `Topic.Rationale`.
- Properties: Allow switching **on**; Skip behavior **Ask every time**.

### 8.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer** and map the inputs:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`. It holds `proposedText`, `comments`, `flags`, `relatedConcern`, `temporaryConcern` and `followUps`.

### 8.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 8.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 8.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message**, then **Add → Adaptive card**. Switch the card editor to **Formula** and paste:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition:** `!IsBlank(Topic.Review.relatedConcern)`.
   - **True:** **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed."
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped in Teams on a phone, replace step 2 with a plain message: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 8.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 8.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic** (the job changed while this topic was paused). All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders` (replaces any earlier reminders from this section):

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

The topic never redirects back to the hub. When it ends, the hub moves on.

### 8.15 Wire it up and test

In hub Node 6, set the **Purpose** branch to **Redirect → JD Section – Purpose**. Start an update in the test pane and check:

- [ ] The current Purpose shows before the question.
- [ ] Keep As Is moves on to Principal Duties.
- [ ] Revise drafts wording that shows the current and proposed text, and Edit Revision builds on the draft.
- [ ] For a role with related levels, the comparison card appears.
- [ ] Adding a new function to the Purpose produces a Duties heads-up.
- [ ] "No, remain in this section" asks What changed again.
- [ ] Going back to Purpose later shows Keep my change, Edit my change and Return to Current Language.

## Step 9: JD Section – Principal Duties

Principal Duties is section 2, and it works on a numbered list. The manager can add, remove or modify one responsibility at a time, and stays in the section until they are done. Each change is drafted by the prompt, which returns the full updated list, so what the manager accepts is always the whole list.

### 9.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Principal Duties**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 9.2 Node 1 – Settings

Add one **Set a variable value** node per row:

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Duties"` |
| Topic.Label | `"Principal Duties and Responsibilities"` |
| Topic.CurrentText | `Global.JD.Duties` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Duties").Proposed` |
| Topic.Working | `If(IsBlank(Topic.Existing), <numbering formula below>, Topic.Existing)` |
| Topic.RationaleAll | `LookUp(Global.ChangeLog, Section = "Duties").Rationale` |
| Topic.CommentsAll | `LookUp(Global.ChangeLog, Section = "Duties").Comments` |
| Topic.FlagsAll | `LookUp(Global.ChangeLog, Section = "Duties").Flags` |
| Topic.ConcernAll | `LookUp(Global.ChangeLog, Section = "Duties").RelatedConcern` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.PreviousDraft | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.Duties})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

The numbering formula turns the stored duties into "1. …", "2. …" lines:

```
With(
  {lines: Filter(Split(Global.JD.Duties, Char(10)), !IsBlank(Trim(Value)))},
  Concat(
    ForAll(Sequence(CountRows(lines)), {n: Value, t: Trim(Index(lines, Value).Value)}),
    n & ". " & t,
    Char(10)
  )
)
```

There are two fallbacks:

- If `With`, `Sequence` or `Index` is rejected, have the Get JD Details flow return the duties already numbered, and use `Global.JD.Duties` in place of the formula.
- If the stored duties already start with bullets or numbers, remove them in the flow, so they aren't numbered twice.

### 9.3 Node 2 – Section header

**Send a message:** "**{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})"

### 9.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

For example, if the manager added a new function to the Purpose, the reminder to cover it in the duties shows here.

### 9.5 Node 4 – Show the list *(rename to **Show list**)*

**Send a message** with this formula:

```
If(IsBlank(Topic.Existing), "", "Including the changes you've requested so far." & Char(10)) &
"Current responsibilities:" & Char(10) & Topic.Working
```

### 9.6 Node 5 – Choose an action

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (no changes yet):**

1. **Question:** "Would you like to revise any responsibilities?"
   - Options: **No Changes**, **Add a Responsibility**, **Remove a Responsibility**, **Modify an Existing Responsibility**.
   - Save as: `Topic.ActionFirst`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; if no valid entity is found, set **No Changes**.

**All other conditions branch (changes already requested):**

1. **Question:** "Would you like to make another change?"
   - Options: **Keep my changes**, **Add a Responsibility**, **Remove a Responsibility**, **Modify an Existing Responsibility**, **Return to Current Language**.
   - Save as: `Topic.ActionRevisit`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my changes**.

### 9.7 Node 6 – Combine the answer

Below the Condition, where both branches rejoin, add **one** Set a variable value node. Create `Topic.Action`:

```
If(IsBlank(Topic.Existing), Text(Topic.ActionFirst), Text(Topic.ActionRevisit))
```

Setting it in one place avoids the "can't save to the same variable" problem. If `Text()` is rejected on the choice values, see Troubleshooting.

### 9.8 Node 7 – Act on the choice

Add a **Condition** with these branches. Use **Edit formula** for each condition.

**`Topic.Action = "No Changes" || Topic.Action = "Keep my changes"`:** **End current topic**.

**`Topic.Action = "Return to Current Language"`:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message:** "Keeping the current responsibilities."
4. **End current topic**.

**`Topic.Action = "Add a Responsibility"`:**

1. **Question:** "What responsibility should be added?" Set it to User's entire response, saved as `Topic.Detail`, with Allow switching on and Ask every time.
2. Set `Topic.RequestedChange` = `"ADD: " & Topic.Detail`.

**`Topic.Action = "Remove a Responsibility"`:**

1. **Question:** "Which responsibility should be removed? Give its number." Set it to User's entire response, saved as `Topic.Detail`, with the same settings.
2. Set `Topic.RequestedChange` = `"REMOVE item " & Topic.Detail`.

**`Topic.Action = "Modify an Existing Responsibility"`:**

1. **Question:** "Which responsibility number, and what should change?" Set it to User's entire response, saved as `Topic.Detail`, with the same settings.
2. Set `Topic.RequestedChange` = `"MODIFY " & Topic.Detail`.

**All other conditions:** leave empty.

### 9.9 Node 8 – Why it's ongoing

1. **Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.
2. Set `Topic.PreviousDraft` = `""`.

### 9.10 Node 9 – Draft the change *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.Working` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 9.11 Node 10 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or skip it?"
   - Options: **Rephrase the change**, **Skip this change**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Skip this change**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Show list**.
   - **Skip this change:** **Go to step → Continue** (Node 15).
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 9.12 Node 11 – Show the draft

**Send a message:**

> **Current list:** {Topic.Working}
>
> **Updated responsibilities:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 9.13 Node 12 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 9.14 Node 13 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 9.15 Node 14 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. **Question:** "What would you like to adjust?" Set it to User's entire response, saved as `Topic.Adjust`, with Allow switching on and Ask every time.
2. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
3. Set `Topic.RequestedChange` = `Topic.RequestedChange & ". Adjustment: " & Topic.Adjust`.
4. **Go to step → Draft**.

**Return to Current Language:** **Send a message** "Discarded that change. The list stays as it was." Nothing else; it falls through to Continue. This discards only this draft. To undo every duties change, the manager picks Return to Current Language at the action question.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Working` = `Topic.Review.proposedText`.
3. Set `Topic.Existing` = `Topic.Working`.
4. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

5. Set `Topic.RationaleAll` = `If(IsBlank(Topic.RationaleAll), "", Topic.RationaleAll & "; ") & Topic.Rationale`.
6. Set `Topic.CommentsAll` = `If(IsBlank(Topic.CommentsAll), "", Topic.CommentsAll & Char(10)) & Topic.Review.comments`.
7. Set `Topic.FlagsAll` = `If(IsBlank(Topic.FlagsAll), Topic.Flags, If(IsBlank(Topic.Flags), Topic.FlagsAll, Topic.FlagsAll & ", " & Topic.Flags))`.
8. Set `Topic.ConcernAll` = `If(IsBlank(Topic.Review.relatedConcern), Topic.ConcernAll, If(IsBlank(Topic.ConcernAll), "", Topic.ConcernAll & " ") & Topic.Review.relatedConcern)`.
9. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Working,
    Rationale: Topic.RationaleAll, Comments: Topic.CommentsAll,
    Flags: Topic.FlagsAll, RelatedConcern: Topic.ConcernAll
  }
)
```

10. Set `Global.Reminders`. For duties, the new reminders are added rather than replaced, because each change can raise its own:

```
Table(
  Global.Reminders,
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

11. **Send a message:** "Saved. The list now reads as shown above."
12. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

**All other conditions:** leave empty.

### 9.16 Node 15 – Continue Review *(rename to **Continue**)*

Below the Node 14 Condition, add:

1. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
2. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** **Go to step → Show list**. The manager sees the updated list and the "make another change" options.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

### 9.17 Wire it up and test

In hub Node 6, set the **Duties** branch to **Redirect → JD Section – Principal Duties**. Then check:

- [ ] The numbered list shows before the action question.
- [ ] Add, remove and modify each return a renumbered full list.
- [ ] "No, remain in this section" shows the updated list and the "make another change" options.
- [ ] Adding "Sell deposit products to clients" to a Non-Sales role gives a Sales heads-up.
- [ ] Adding "Lead the 2026 migration project" is caught as not ongoing.
- [ ] The change log ends with one Duties row holding the final list and all reasons.

## Step 10: JD Section – People Leadership

People Leadership is section 3. The spec's questions decide it, not the prompt, and the questions depend on the current status: "This Position Manages People" or "Individual Contributor". Any change is flagged for HR automatically.

### 10.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – People Leadership**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 10.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"PeopleLeadership"` |
| Topic.Label | `"People Leadership"` |
| Topic.CurrentText | `Global.JD.PeopleLeadership` |
| Topic.FixedFlag | `"People leadership or reporting structure change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "PeopleLeadership").Proposed` |
| Topic.Rationale | `""` |
| Topic.NewValue | `""` |

### 10.3 Node 2 – Show the current status

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current status: {Coalesce(Topic.CurrentText, "None listed.")}

### 10.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

This is where a manager who added supervisory duties sees "This role may now manage people" before deciding.

### 10.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 10.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the current People Leadership information?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. **Send a message** "Keeping the current status for {Topic.Label}."
     3. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 10.7 Node 6 – The spec's screening questions *(rename to **Screen**)*

Add a **Condition**: `"Manages People" in Topic.CurrentText`. Adjust the words to match exactly what your list stores.

**True branch (currently manages people):**

1. **Question:** "Will this position continue to oversee two or more employees?"
   - Identify: **Boolean**. Save as: `Topic.ContinuesToManage`.
   - Properties: Allow switching on; Ask every time.
2. **Condition** `Topic.ContinuesToManage = true`:
   - **True:**
     1. **Question:** "Please provide the exact number of direct reports." Identify: **Number**. Save as: `Topic.Reports`. Allow switching on; Ask every time.
     2. Set `Topic.NewValue` = `"This Position Manages People (" & Text(Topic.Reports) & " direct reports)"`.
   - **All other conditions:** set `Topic.NewValue` = `"Individual Contributor"`. The spec doesn't define this branch; see Decisions to confirm.

**All other conditions branch (currently an individual contributor):**

1. **Question:** "Will this position now have direct reports?"
   - Identify: **Boolean**. Save as: `Topic.NowHasReports`.
   - Properties: Allow switching on; Ask every time.
2. **Condition** `Topic.NowHasReports = true`:
   - **True:**
     1. **Question:** "Please provide the exact number of direct reports." Identify: **Number**. Save as: `Topic.Reports`. Allow switching on; Ask every time.
     2. Set `Topic.NewValue` = `"This Position Manages People (" & Text(Topic.Reports) & " direct reports)"`.
   - **All other conditions:** set `Topic.NewValue` = `"Individual Contributor"`. The spec says to retain it.

### 10.8 Node 7 – No change?

Add a **Condition**: `Lower(Trim(Topic.NewValue)) = Lower(Trim(Topic.CurrentText))`.

- **True:** **Send a message** "Based on your answers, {Topic.Label} stays {Topic.CurrentText}. No change recorded.", then **End current topic**.
- **All other conditions:** leave empty.

This is only true when an individual contributor stays one. A manager who keeps managing still records a change, because the spec says to store the number of direct reports.

### 10.9 Node 8 – Show the result

**Send a message:** "This would record {Topic.Label} as **{Topic.NewValue}** (currently {Topic.CurrentText}). HR will review any people leadership or reporting change."

### 10.10 Node 9 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 10.11 Node 10 – Accept, edit or return

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 10.12 Node 11 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:** set `Topic.Reports` = `Blank()`, then **Go to step → Screen**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. **Send a message** "Keeping the current status for {Topic.Label}."
3. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.NewValue,
    Rationale: Topic.Rationale, Comments: "",
    Flags: Topic.FixedFlag, RelatedConcern: ""
  }
)
```

3. **Send a message:** "Saved your change to {Topic.Label}. It's flagged for HR review."
4. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
5. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.Reports` = `Blank()`, then **Go to step → Screen**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 10.13 Wire it up and test

In hub Node 6, set the **PeopleLeadership** branch to **Redirect → JD Section – People Leadership**. Then check:

- [ ] A manager role answering Yes, then 5, records "This Position Manages People (5 direct reports)".
- [ ] A manager role answering No records Individual Contributor.
- [ ] An individual contributor answering No gets "No change recorded".
- [ ] An individual contributor answering Yes, then 3, records Manages People.
- [ ] After adding supervisory duties in Principal Duties, the reminder shows here.

## Step 11: JD Section – Sales

Sales / Non-Sales is section 4. The spec gives no screening questions for it, so the manager picks the value directly. Any change is flagged for HR automatically. A reminder raised by Purpose or Principal Duties (for example, a new sales duty on a Non-Sales role) shows here before the question.

### 11.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Sales**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 11.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Sales"` |
| Topic.Label | `"Sales / Non-Sales"` |
| Topic.CurrentText | `Global.JD.Sales` |
| Topic.FixedFlag | `"Sales change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Sales").Proposed` |
| Topic.Rationale | `""` |
| Topic.NewValue | `""` |

### 11.3 Node 2 – Show the current value

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current value: {Coalesce(Topic.CurrentText, "None listed.")}

### 11.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 11.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 11.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Sales / Non-Sales information?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. **Send a message** "Keeping the current value for {Topic.Label}."
     3. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 11.7 Node 6 – Choose the value *(rename to **Screen**)*

1. **Question:** "Should this role be Sales or Non-Sales?"
   - Identify: **Multiple choice options**. Options: **Sales**, **Non-Sales**. Use the exact wording your SharePoint column stores.
   - Save as: `Topic.SalesChoice`.
   - Properties: Allow switching on; Ask every time; reprompt up to 2 times.
2. Set `Topic.NewValue` = `Text(Topic.SalesChoice)`.

### 11.8 Node 7 – No change?

Add a **Condition**: `Lower(Trim(Topic.NewValue)) = Lower(Trim(Topic.CurrentText))`.

- **True:** **Send a message** "{Topic.Label} stays {Topic.CurrentText}. No change recorded.", then **End current topic**.
- **All other conditions:** leave empty.

### 11.9 Node 8 – Show the result

**Send a message:** "This would change {Topic.Label} from {Topic.CurrentText} to **{Topic.NewValue}**. HR will review this change."

### 11.10 Node 9 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 11.11 Node 10 – Accept, edit or return

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 11.12 Node 11 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:** **Go to step → Screen**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. **Send a message** "Keeping the current value for {Topic.Label}."
3. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.NewValue,
    Rationale: Topic.Rationale, Comments: "",
    Flags: Topic.FixedFlag, RelatedConcern: ""
  }
)
```

3. **Send a message:** "Saved your change to {Topic.Label}. It's flagged for HR review."
4. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
5. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** **Go to step → Screen**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 11.13 Wire it up and test

In hub Node 6, set the **Sales** branch to **Redirect → JD Section – Sales**. Then check:

- [ ] The current value shows before the question.
- [ ] Choosing the value the role already has gives "No change recorded".
- [ ] Changing Non-Sales to Sales saves a change flagged "Sales change".
- [ ] After adding a sales duty in Principal Duties, the reminder shows here.

## Step 12: JD Section – Relationship Manager

Relationship Manager is section 5. The spec's two questions decide whether the role is an RM. Any change is flagged for HR automatically as an RM or portfolio change.

### 12.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Relationship Manager**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 12.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"RM"` |
| Topic.Label | `"Relationship Manager"` |
| Topic.CurrentText | `Global.JD.RM` |
| Topic.FixedFlag | `"RM or portfolio change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "RM").Proposed` |
| Topic.Rationale | `""` |
| Topic.NewValue | `""` |

### 12.3 Node 2 – Show the current value

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current value: {Coalesce(Topic.CurrentText, "None listed.")}

### 12.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 12.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 12.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Relationship Manager information?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. **Send a message** "Keeping the current value for {Topic.Label}."
     3. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 12.7 Node 6 – The spec's screening questions *(rename to **Screen**)*

1. **Question:** "Does this role serve as the primary point of contact for assigned customer, client, or business relationships?"
   - Identify: **Boolean**. Save as: `Topic.RMContact`.
   - Properties: Allow switching on; Ask every time.
2. **Question:** "Is the role responsible for managing an assigned portfolio, book of business, customer relationships, or client accounts?"
   - Identify: **Boolean**. Save as: `Topic.RMPortfolio`.
   - Properties: Allow switching on; Ask every time.
3. Set `Topic.NewValue` = `If(Topic.RMContact Or Topic.RMPortfolio, "Yes", "No")`. Replace "Yes" and "No" with the exact values your column stores.

One Yes makes the role an RM. The spec doesn't say whether one Yes or both are needed; see Decisions to confirm. To require both, change `Or` to `And`.

### 12.8 Node 7 – No change?

Add a **Condition**: `Lower(Trim(Topic.NewValue)) = Lower(Trim(Topic.CurrentText))`.

- **True:** **Send a message** "Based on your answers, {Topic.Label} stays {Topic.CurrentText}. No change recorded.", then **End current topic**.
- **All other conditions:** leave empty.

### 12.9 Node 8 – Show the result

**Send a message:** "This would change {Topic.Label} from {Topic.CurrentText} to **{Topic.NewValue}**. HR will review this change."

### 12.10 Node 9 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 12.11 Node 10 – Accept, edit or return

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 12.12 Node 11 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:** **Go to step → Screen**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. **Send a message** "Keeping the current value for {Topic.Label}."
3. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.NewValue,
    Rationale: Topic.Rationale, Comments: "",
    Flags: Topic.FixedFlag, RelatedConcern: ""
  }
)
```

3. **Send a message:** "Saved your change to {Topic.Label}. It's flagged for HR review."
4. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
5. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** **Go to step → Screen**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 12.13 Wire it up and test

In hub Node 6, set the **RM** branch to **Redirect → JD Section – Relationship Manager**. Then check:

- [ ] No and No, on a role that isn't an RM, gives "No change recorded".
- [ ] Yes on either question, on a role that isn't an RM, saves a change flagged "RM or portfolio change".
- [ ] After adding a portfolio duty in Principal Duties, the reminder shows here.

## Step 13: JD Section – NMLS

NMLS is section 6. The spec's one question decides whether the role requires NMLS registration. Any change is flagged for HR automatically.

### 13.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – NMLS**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 13.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"NMLS"` |
| Topic.Label | `"NMLS"` |
| Topic.CurrentText | `Global.JD.NMLS` |
| Topic.FixedFlag | `"NMLS change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "NMLS").Proposed` |
| Topic.Rationale | `""` |
| Topic.NewValue | `""` |

### 13.3 Node 2 – Show the current value

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current value: {Coalesce(Topic.CurrentText, "None listed.")}

### 13.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 13.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 13.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the NMLS information?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. **Send a message** "Keeping the current value for {Topic.Label}."
     3. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 13.7 Node 6 – The spec's screening question *(rename to **Screen**)*

1. **Question:** "Will this role discuss or negotiate residential mortgage loan terms, take applications, or otherwise perform duties that may require NMLS registration?"
   - Identify: **Boolean**. Save as: `Topic.NMLSAnswer`.
   - Properties: Allow switching on; Ask every time.
2. Set `Topic.NewValue` = `If(Topic.NMLSAnswer, "Yes", "No")`. Replace "Yes" and "No" with the exact values your column stores.

### 13.8 Node 7 – No change?

Add a **Condition**: `Lower(Trim(Topic.NewValue)) = Lower(Trim(Topic.CurrentText))`.

- **True:** **Send a message** "Based on your answer, {Topic.Label} stays {Topic.CurrentText}. No change recorded.", then **End current topic**.
- **All other conditions:** leave empty.

### 13.9 Node 8 – Show the result

**Send a message:** "This would change {Topic.Label} from {Topic.CurrentText} to **{Topic.NewValue}**. HR will review this change."

### 13.10 Node 9 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 13.11 Node 10 – Accept, edit or return

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 13.12 Node 11 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:** **Go to step → Screen**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. **Send a message** "Keeping the current value for {Topic.Label}."
3. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.NewValue,
    Rationale: Topic.Rationale, Comments: "",
    Flags: Topic.FixedFlag, RelatedConcern: ""
  }
)
```

3. **Send a message:** "Saved your change to {Topic.Label}. It's flagged for HR review."
4. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
5. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** **Go to step → Screen**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 13.13 Wire it up and test

In hub Node 6, set the **NMLS** branch to **Redirect → JD Section – NMLS**. Then check:

- [ ] Yes on a role that doesn't require NMLS saves a change flagged "NMLS change".
- [ ] No on a role that doesn't require NMLS gives "No change recorded".
- [ ] After adding "take residential mortgage applications" in Principal Duties, the reminder shows here.

## Step 14: JD Section – Education

Education is section 7. The manager sees the current education requirement and chooses Keep As Is or Revise This Section. If they revise, the prompt keeps equivalency language and the approved options. It also checks the requirement against Work Experience and the related levels, and can raise a Work Experience reminder.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below. Every node is listed in full anyway.

### 14.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Education**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 14.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Education"` |
| Topic.Label | `"Education"` |
| Topic.CurrentText | `Global.JD.Education` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Education").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.Education})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 14.3 Node 2 – Show the current education requirement

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 14.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 14.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 14.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the education requirement or preference?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 14.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 14.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 14.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 14.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 14.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 14.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 14.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 14.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 14.15 Wire it up and test

In hub Node 6, set the **Education** branch to **Redirect → JD Section – Education**. Then check:

- [ ] A revision keeps equivalency language and uses only the approved options.
- [ ] Raising education without changing experience gives a Work Experience heads-up.
- [ ] For a role with levels, matching a higher level's requirement shows a related-level conflict.

## Step 15: JD Section – Work Experience

Work Experience is section 8. It works like Education. The prompt keeps equivalency language and checks the requirement against the Education section and the related levels. An Education change that raised a reminder shows here first.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below.

### 15.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Work Experience**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 15.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Experience"` |
| Topic.Label | `"Work Experience"` |
| Topic.CurrentText | `Global.JD.Experience` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Experience").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.Experience})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 15.3 Node 2 – Show the current work experience requirement

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 15.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 15.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 15.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the work experience requirement?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 15.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 15.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 15.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 15.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 15.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 15.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 15.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 15.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 15.15 Wire it up and test

In hub Node 6, set the **Experience** branch to **Redirect → JD Section – Work Experience**. Then check:

- [ ] A revision keeps equivalency language.
- [ ] After raising Education, the Work Experience reminder shows here.
- [ ] Lowering experience below a lower level's requirement shows a related-level conflict.
- [ ] Going back to Education from here returns you to Work Experience afterwards.

## Step 16: JD Section – Licenses and Certifications

Licenses and Certifications is section 9. It works like the other text sections, with one difference: every accepted change is also flagged for HR automatically as a license or certification change. A reminder raised by a new duty that needs a license shows here first.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below.

### 16.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Licenses and Certifications**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 16.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Licenses"` |
| Topic.Label | `"Licenses and Certifications"` |
| Topic.CurrentText | `Global.JD.Licenses` |
| Topic.FixedFlag | `"License or certification change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Licenses").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.Licenses})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 16.3 Node 2 – Show the current requirements

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 16.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 16.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 16.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise licenses, certifications, registrations, or professional designations?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 16.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 16.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 16.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 16.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 16.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 16.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 16.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 16.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags` (this includes the automatic "License or certification change" flag):

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}. It's flagged for HR review."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 16.15 Wire it up and test

In hub Node 6, set the **Licenses** branch to **Redirect → JD Section – Licenses and Certifications**. Then check:

- [ ] Any accepted change carries the "License or certification change" flag in the final review.
- [ ] After adding a mortgage or securities duty in Principal Duties, the reminder shows here.

## Step 17: JD Section – Knowledge

Knowledge is section 10. Drafts start with "Knowledge of" and are aligned to the Purpose and Principal Duties, including changes accepted earlier in this update. Related levels store Knowledge, Skills and Abilities together, so the comparison shows their full KSA text.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below.

### 17.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Knowledge**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 17.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Knowledge"` |
| Topic.Label | `"Knowledge"` |
| Topic.CurrentText | `Global.JD.Knowledge` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Knowledge").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.KSA})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 17.3 Node 2 – Show the current Knowledge statements

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 17.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 17.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 17.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Knowledge statements?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 17.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 17.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 17.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 17.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 17.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 17.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 17.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 17.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 17.15 Wire it up and test

In hub Node 6, set the **Knowledge** branch to **Redirect → JD Section – Knowledge**. Then check:

- [ ] Drafted statements start with "Knowledge of".
- [ ] After adding a new duty earlier, a revision reflects that duty.
- [ ] A Knowledge reminder from Principal Duties shows here.

## Step 18: JD Section – Skills

Skills is section 11. Drafts start with "Skill in" and are aligned to the Purpose and Principal Duties, including changes accepted earlier in this update. The comparison shows related levels' full KSA text.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below.

### 18.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Skills**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 18.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Skills"` |
| Topic.Label | `"Skills"` |
| Topic.CurrentText | `Global.JD.Skills` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Skills").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.KSA})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 18.3 Node 2 – Show the current Skills statements

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 18.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 18.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 18.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Skills statements?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 18.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 18.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 18.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 18.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 18.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 18.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 18.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 18.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 18.15 Wire it up and test

In hub Node 6, set the **Skills** branch to **Redirect → JD Section – Skills**. Then check:

- [ ] Drafted statements start with "Skill in".
- [ ] A Skills reminder from Principal Duties (for example, after adding a sales duty) shows here.

## Step 19: JD Section – Abilities

Abilities is section 12. Drafts start with "Ability to" and are aligned to the Purpose and Principal Duties, including changes accepted earlier in this update. The comparison shows related levels' full KSA text.

Shortcut: you can paste the YAML from JD Section – Purpose into this new topic. Then change only the Node 1 values, the first question's text and the RelatedTable field shown below.

### 19.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Abilities**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 19.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Abilities"` |
| Topic.Label | `"Abilities"` |
| Topic.CurrentText | `Global.JD.Abilities` |
| Topic.FixedFlag | `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Abilities").Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.RelatedTable | `ForAll(Global.RelatedJDs, {Role: ThisRecord.Title, Text: ThisRecord.KSA})` |
| Topic.RelatedText | `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))` |

### 19.3 Node 2 – Show the current Abilities statements

**Send a message:**

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

### 19.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 19.5 Node 4 – Existing change

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested this change: {Topic.Existing}". All other conditions: leave empty.

### 19.6 Node 5 – Keep or revise

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to revise the Abilities statements?"
   - Options: **Keep As Is**, **Revise This Section**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep As Is**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep As Is:** **Send a message** "Keeping {Topic.Label} as is.", then **End current topic**.
   - **Revise This Section:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "You've already requested a change here. What would you like to do?"
   - Options: **Keep my change**, **Edit my change**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my change**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
     3. **Send a message** "Keeping the current language for {Topic.Label}."
     4. **End current topic**.
   - **Edit my change:** leave empty.
   - **All other conditions:** leave empty.

### 19.7 Node 6 – What changed *(rename to **Ask change**)*

**Question:** "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 19.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 19.9 Node 8 – Draft the revision *(rename to **Draft**)*

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `Topic.Label` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `Topic.CurrentText` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `Topic.RelatedText` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 19.10 Node 9 – Not an ongoing change?

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
2. **Question:** "Would you like to rephrase the change, or keep the current language?"
   - Options: **Rephrase the change**, **Keep current language**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Keep current language**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase the change:** **Go to step → Ask change**.
   - **Keep current language:** **Send a message** "Keeping the current language for {Topic.Label}.", then **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 19.11 Node 10 – Show the draft

**Send a message:**

> **Current {Topic.Label}:** {Topic.CurrentText}
>
> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 19.12 Node 11 – Compare with related levels

Add a **Condition**: `CountRows(Global.RelatedJDs) > 0`.

**True:**

1. **Send a message:** "Here's how this compares with the related levels:"
2. **Send a message → Add → Adaptive card**, switched to **Formula**:

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "ColumnSet", columns: Table(
      { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: Global.JobTitle & " (proposed)", weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: Topic.Review.proposedText, weight: "Default", size: "Small", wrap: true } ] },
      ForAll(FirstN(Topic.RelatedTable, 3), { type: "Column", width: "stretch", items: [
        { type: "TextBlock", text: ThisRecord.Role, weight: "Bolder", size: "Default", wrap: true },
        { type: "TextBlock", text: ThisRecord.Text, weight: "Default", size: "Small", wrap: true } ] })
    ) }
  ]
}
```

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. True: **Send a message** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed." All other conditions: leave empty.

**All other conditions:** leave empty.

If the card won't save, or it's cramped on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

### 19.13 Node 12 – Accept, edit or return *(rename to **Confirm**)*

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 19.14 Node 13 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> Topic.SectionName)`.
3. **Send a message** "Keeping the current language for {Topic.Label}."
4. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Flags`:

```
Concat(
  Filter(
    Table(
      {f: Topic.FixedFlag},
      {f: If(IsBlank(Topic.Review.flags) Or Topic.Review.flags = "None", "", Topic.Review.flags)},
      {f: If(IsBlank(Topic.Review.relatedConcern), "", "Job Architecture review")}
    ),
    !IsBlank(f)
  ),
  f, ", "
)
```

3. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.Review.proposedText,
    Rationale: Topic.Rationale, Comments: Topic.Review.comments,
    Flags: Topic.Flags, RelatedConcern: Topic.Review.relatedConcern
  }
)
```

4. Set `Global.Reminders`:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

5. **Send a message:** "Saved your change to {Topic.Label}."
6. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"Heads up for other sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "I'll remind you when we get there. For an earlier section, just say go back to and the section name."
```

7. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
8. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 19.15 Wire it up and test

In hub Node 6, set the **Abilities** branch to **Redirect → JD Section – Abilities**. Then check:

- [ ] Drafted statements start with "Ability to".
- [ ] After a big scope change earlier, a Title heads-up may appear here, pointing ahead to section 13.

## Step 20: JD Section – Title

Title is section 13. It never changes the title itself. It records a title review request, adds guidance from the Governance Guide, and always flags the request for HR approval. A Title reminder raised by a big scope change earlier shows here first.

### 20.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Title**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 20.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Title"` |
| Topic.Label | `"Title"` |
| Topic.CurrentText | `Global.JobTitle` |
| Topic.FixedFlag | `"Title review for HR approval"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Title").Proposed` |
| Topic.ProposedTitle | `""` |
| Topic.Rationale | `""` |

### 20.3 Node 2 – Show the current title

**Send a message** with this formula:

```
"**Title** (section " & Global.CurrentStep & " of " & CountRows(Global.AllSections) & ")" & Char(10) & Char(10) &
"Current title: " & Topic.CurrentText &
If(IsBlank(Global.RelatedTitles), "", Char(10) & "Related levels: " & Global.RelatedTitles)
```

### 20.4 Node 3 – Reminders from other sections

Add a **Condition**: `CountRows(Filter(Global.Reminders, Target = Topic.SectionName)) > 0`.

- **True:** **Send a message** with this formula:

```
"Reminder from earlier in this review:" & Char(10) &
Concat(Filter(Global.Reminders, Target = Topic.SectionName),
  "- From " & LookUp(Global.AllSections, Name = From).Label & ": " & Reminder, Char(10))
```

- **All other conditions:** leave empty.

### 20.5 Node 4 – Existing request

Add a **Condition**: `!IsBlank(Topic.Existing)`. True: **Send a message** "You've already requested a title review: {Topic.Existing}". All other conditions: leave empty.

### 20.6 Node 5 – Keep or request a review

Add a **Condition**: `IsBlank(Topic.Existing)`.

**True branch (first visit):**

1. **Question:** "Would you like to request a title review?"
   - Options: **Keep Current Title**, **Request Title Review**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; reprompt up to 2 times; if no valid entity is found, set **Keep Current Title**.
2. **Condition** on `Topic.FirstChoice`:
   - **Keep Current Title:** **Send a message** "Keeping the current title.", then **End current topic**.
   - **Request Title Review:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (returning):**

1. **Question:** "What would you like to do with your title review request?"
   - Options: **Keep my request**, **Edit my request**, **Return to Current Language**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **Keep my request**.
2. **Condition** on `Topic.RevisitChoice`:
   - **Keep my request:** **End current topic**.
   - **Return to Current Language:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
     2. **Send a message** "Keeping the current title. Your title review request is withdrawn."
     3. **End current topic**.
   - **Edit my request:** leave empty.
   - **All other conditions:** leave empty.

### 20.7 Node 6 – Proposed title *(rename to **Ask title**)*

**Question:** "What title would you propose? If you're not sure, say so and HR will recommend one." Set it to User's entire response, saved as `Topic.ProposedTitle`, with Allow switching on and Ask every time.

### 20.8 Node 7 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 20.9 Node 8 – Governance Guide guidance

Add **Advanced → Generative answers**.

1. **Input:** switch to a formula and paste:

```
"Using the Governance Guide, what should HR consider when reviewing a title change from " & Topic.CurrentText & " to " & Topic.ProposedTitle & "? Note any title or level overlap with these related roles: " & Coalesce(Global.RelatedTitles, "none") & ". Do not make a final determination."
```

2. **Data sources:** open the node's properties, choose to search only selected sources, and select **Governance Guide** only.
3. **Advanced:** turn off **Send a message**, and save the response to `Topic.Guidance`.

### 20.10 Node 9 – Share the guidance

**Send a message:** "Here's what the Governance Guide says HR will look at: {Topic.Guidance}" Then, on a new line: "HR makes the final title and level determination. I'll flag this request for HR approval."

### 20.11 Node 10 – Overlap check and flags

Add two **Set a variable value** nodes:

1. `Topic.Overlap` = `!IsBlank(Global.RelatedTitles) && !IsBlank(Topic.ProposedTitle) && Lower(Trim(Topic.ProposedTitle)) in Lower(Global.RelatedTitles)`. This is true when the proposed title matches a related level.
2. `Topic.Flags` = `Topic.FixedFlag & If(Topic.Overlap, ", Title or level overlap", "")`.

### 20.12 Node 11 – Accept, edit or return

**Question:** "What would you like to do with this request?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 20.13 Node 12 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:** **Go to step → Ask title**.

**Return to Current Language:**

1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`.
2. **Send a message** "Keeping the current title."
3. **End current topic**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> "Title"),
  {
    Section: "Title", Label: "Title", Step: Global.CurrentStep,
    Kind: "Title review",
    Original: Topic.CurrentText,
    Proposed: If(IsBlank(Topic.ProposedTitle), "Title review requested; no title proposed", Topic.ProposedTitle),
    Rationale: Topic.Rationale, Comments: Topic.Guidance,
    Flags: Topic.Flags,
    RelatedConcern: If(Topic.Overlap, "Proposed title matches an existing related level.", "")
  }
)
```

3. **Send a message:** "Saved your title review request. It's flagged for HR approval."
4. **Question:** "Have you completed everything you wanted to update in this section?"
   - Options: **Yes, proceed to the next section**, **No, remain in this section**.
   - Save as: `Topic.ContinueChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Yes, proceed to the next section**.
5. **Condition** on `Topic.ContinueChoice`:
   - **No, remain in this section:** **Go to step → Ask title**.
   - **Yes, proceed to the next section:** **End current topic**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 20.14 Wire it up and test

In hub Node 6, set the **Title** branch to **Redirect → JD Section – Title**. Then check:

- [ ] Request Title Review shows Governance Guide guidance and says HR decides.
- [ ] The saved request is flagged "Title review for HR approval".
- [ ] Proposing the title of a related level adds "Title or level overlap".
- [ ] The title itself never changes anywhere in the agent.

## Step 21: JD Section – Other

Other is section 14, the last one. It captures any ongoing section or requirement that isn't one of the first 13. The prompt screens out what the spec excludes: temporary projects, annual goals, individual accomplishments and employee-specific qualifications. The manager can add several requests; they are kept together in one Other row, as items for HR to decide.

### 21.1 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Section – Other**.
2. Change the trigger to **It's redirected to**.
3. Save.

### 21.2 Node 1 – Settings

| Variable | Value |
| --- | --- |
| Topic.SectionName | `"Other"` |
| Topic.Label | `"Other Requirements"` |
| Topic.FixedFlag | `"Other requirement for HR review"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Requests | `LookUp(Global.ChangeLog, Section = "Other").Proposed` |
| Topic.RationaleAll | `LookUp(Global.ChangeLog, Section = "Other").Rationale` |
| Topic.RequestedChange | `""` |
| Topic.Rationale | `""` |
| Topic.PreviousDraft | `""` |

### 21.3 Node 2 – Header

**Send a message** with this formula:

```
"**Other Requirements** (section " & Global.CurrentStep & " of " & CountRows(Global.AllSections) & ")" &
If(IsBlank(Topic.Requests), "", Char(10) & Char(10) & "Requests so far:" & Char(10) & Topic.Requests)
```

### 21.4 Node 3 – The spec's question

Add a **Condition**: `IsBlank(Topic.Requests)`. Rename this Condition node to **Ask other**; the topic loops back here.

**True branch (no requests yet):**

1. **Question:** "Is there another ongoing section or job requirement you want to review?"
   - Options: **Yes**, **No**.
   - Save as: `Topic.FirstChoice`.
   - Properties: Allow switching **on**; Skip behavior **Ask every time**; if no valid entity is found, set **No**.
2. **Condition** on `Topic.FirstChoice`:
   - **No:** **End current topic**.
   - **Yes:** leave empty.
   - **All other conditions:** leave empty.

**All other conditions branch (requests already added):**

1. **Question:** "Is there another ongoing section or job requirement you want to review?"
   - Options: **Yes**, **No**, **Remove my requests**.
   - Save as: `Topic.RevisitChoice`.
   - Properties: Allow switching **on**; Ask every time; if no valid entity is found, set **No**.
2. **Condition** on `Topic.RevisitChoice`:
   - **No:** **End current topic**.
   - **Remove my requests:**
     1. Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> "Other")`.
     2. Set `Global.Reminders` = `Filter(Global.Reminders, From <> "Other")`.
     3. **Send a message** "Removed your other requests."
     4. **End current topic**.
   - **Yes:** leave empty.
   - **All other conditions:** leave empty.

### 21.5 Node 4 – Describe it *(rename to **Ask change**)*

**Question:** "Describe the section or requirement, and what it should say." Set it to User's entire response, saved as `Topic.RequestedChange`, with Allow switching on and Ask every time.

### 21.6 Node 5 – Why it's ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved as `Topic.Rationale`, with Allow switching on and Ask every time.

### 21.7 Node 6 – Draft it

Add **Add a tool → JD Section Reviewer**:

| Input | Value |
| --- | --- |
| SectionName | `"Other requirement (not one of the standard sections)"` |
| JobTitle | `Global.JobTitle` |
| CurrentText | `""` |
| RequestedChange | `Topic.RequestedChange` |
| OngoingReason | `Topic.Rationale` |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | `Topic.PreviousDraft` |
| JobContext | the formula below |
| RelatedRoles | `""` |

JobContext:

```
Concat(
  Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other") As s,
  s.Label & ": " & Coalesce(
    LookUp(Global.ChangeLog, Section = s.Name).Proposed,
    Switch(s.Name,
      "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
      "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
      "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
      "Education", Global.JD.Education, "Experience", Global.JD.Experience,
      "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
      "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
      "Title", Global.JobTitle)),
  Char(10) & Char(10))
```

Save the output as `Topic.Review`.

### 21.8 Node 7 – Exclusion check

Add a **Condition**: `!IsBlank(Topic.Review.temporaryConcern)`.

**True:**

1. **Send a message:** "{Topic.Review.temporaryConcern} Job descriptions don't include temporary projects, annual goals, individual accomplishments or employee-specific qualifications."
2. **Question:** "Would you like to rephrase it, or skip it?"
   - Options: **Rephrase it**, **Skip it**.
   - Save as: `Topic.TempChoice`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Skip it**.
3. **Condition** on `Topic.TempChoice`:
   - **Rephrase it:** **Go to step → Ask change**.
   - **Skip it:** **Go to step → Ask other**.
   - **All other conditions:** leave empty.

**All other conditions:** leave empty.

### 21.9 Node 8 – Show the draft

**Send a message:**

> **Proposed requirement:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 21.10 Node 9 – Accept, edit or return

**Question:** "What would you like to do with this revision?"

- Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.
- Save as: `Topic.Confirm`.
- Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return to Current Language**.

### 21.11 Node 10 – Act on the choice

Add a **Condition** on `Topic.Confirm`.

**Edit Revision:**

1. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
2. **Go to step → Ask change**.

**Return to Current Language:**

1. **Send a message** "Discarded that request."
2. **Go to step → Ask other**.

**Accept Revision:**

1. **Condition** `Topic.StartedFor <> Global.RequestId`. True: **End current topic**. All other conditions: leave empty.
2. Set `Topic.Requests` = `If(IsBlank(Topic.Requests), "", Topic.Requests & Char(10)) & "- " & Topic.Review.proposedText`.
3. Set `Topic.RationaleAll` = `If(IsBlank(Topic.RationaleAll), "", Topic.RationaleAll & "; ") & Topic.Rationale`.
4. Set `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> "Other"),
  {
    Section: "Other", Label: "Other Requirements", Step: Global.CurrentStep,
    Kind: "Other request",
    Original: "", Proposed: Topic.Requests,
    Rationale: Topic.RationaleAll, Comments: Topic.Review.comments,
    Flags: Topic.FixedFlag, RelatedConcern: ""
  }
)
```

5. Set `Global.Reminders` (added, not replaced, because each request can raise its own):

```
Table(
  Global.Reminders,
  ForAll(Topic.Review.followUps, {Target: ThisRecord.section, From: Topic.SectionName, Reminder: ThisRecord.reminder})
)
```

6. **Send a message:** "Saved your request."
7. **Condition** `CountRows(Topic.Review.followUps) > 0`. True: **Send a message** with this formula. All other conditions: leave empty.

```
"This request may also affect earlier sections:" & Char(10) &
Concat(Topic.Review.followUps, "- " & LookUp(Global.AllSections, Name = section).Label & ": " & reminder, Char(10)) &
Char(10) & "To update one now, say go back to and the section name. These also appear in your final review."
```

8. Set `Topic.PreviousDraft` = `""`.
9. **Go to step → Ask other**.

**All other conditions:** leave empty.

For this section, the spec's own question ("Is there another…?") takes the place of the Continue Review question, so the topic doesn't ask both.

### 21.12 Wire it up and test

In hub Node 6, set the **Other** branch to **Redirect → JD Section – Other**. Then check:

- [ ] "Lead the 2026 migration project" is screened out as not ongoing.
- [ ] Two accepted requests appear together in one Other row.
- [ ] A request implying a new duty gives a heads-up pointing back to Principal Duties.
- [ ] Answering No moves on to the final review.

## Step 22: JD Final Review, Manager Confirmation and submit

**JD Final Review** opens automatically after section 14, and mid-review when a manager asks to see their changes. It shows the five groups the spec lists, plus any section reminders that weren't acted on. The manager can edit a revised section or review an unchanged one. The update is submitted only after the Manager Confirmation.

### 22.1 Build the submit flow first

1. **Create a SharePoint list, JD Update Requests,** with these columns:
   - RequestId, JobCode, JobTitle
   - UpdateReasons, RelatedRoles
   - Section, Kind
   - Original, Proposed, Rationale, Comments (all multiple lines)
   - Flags, RelatedConcern (multiple lines)
   - ManagerConfirmed (yes/no), SubmittedBy
2. **Create an agent flow, Submit JD Update Request,** with text inputs RequestId, JobCode, JobTitle, UpdateReasons, RelatedRoles and ChangesJson.
3. **Parse JSON** on ChangesJson. Generate the schema from a sample of `JSON(Global.ChangeLog)`, captured with a test Message node.
4. **Apply to each** over the parsed array → **Create item**, mapping each field, with ManagerConfirmed = Yes and SubmittedBy = the user's email.
5. **Respond to the agent** with a text output `Result` = "OK".
6. Save and publish.

Unchanged sections aren't stored, because they are the sections with no row. The HR report and email stay a separate flow, as planned.

### 22.2 Create the topic

1. Go to **Topics → Add a topic → From blank**, and name it **JD Final Review**.
2. Keep the trigger as **The agent chooses**. The hub also redirects here.
3. Description:

> Shows the consolidated review of the job description update in progress: revised sections, unchanged sections, related-role concerns, unresolved items and HR review flags. Use when the user asks to see their changes or a summary, wants to edit a revised section or review an unchanged section, or is ready to approve and submit.

### 22.3 Node 1 – No update in progress

Add a **Condition**: `Global.UpdateActive <> true`. True: **Send a message** "There's no update in progress right now.", then **End current topic**. All other conditions: leave empty.

### 22.4 Node 2 – Furthest step

Set `Topic.Furthest` = `If(Global.CurrentStep = 99, 100, If(Global.ReturnStep <> 0, Global.ReturnStep, Global.CurrentStep))`.

The value 100 means every section is reachable at the end. Mid-review, it limits the lists to sections the manager has already reached.

### 22.5 Nodes 3 to 8 – The consolidated review

Add six **Send a message** nodes in a row, each inserted as one formula. Rename the first one **Show review**; the topic loops back to it.

**Node 3 – Header** *(rename to **Show review**)*:

```
"**Update summary for " & Global.JobTitle & "**" & Char(10) & "Reasons: " & Global.UpdateReasons &
If(Global.CurrentStep <> 99, Char(10) & "_This is a summary so far. You're partway through the review._", "")
```

**Node 4 – Revised sections:**

```
"**Revised sections**" & Char(10) &
If(CountRows(Filter(Global.ChangeLog, Kind = "Revision")) = 0, "None",
  Concat(Sort(Filter(Global.ChangeLog, Kind = "Revision"), Step),
    "- **" & Label & ":** " & Proposed & Char(10) & "  Why: " & Rationale, Char(10)))
```

**Node 5 – Unchanged sections:**

```
"**Unchanged sections**" & Char(10) &
Coalesce(
  Concat(Filter(Global.AllSections, Step < Topic.Furthest && !(Name in Global.ChangeLog.Section) && Name <> "Other"), Label, ", "),
  "None")
```

**Node 6 – Related-role concerns:**

```
"**Related-role concerns**" & Char(10) &
Coalesce(Concat(Filter(Global.ChangeLog, !IsBlank(RelatedConcern)), "- " & Label & ": " & RelatedConcern, Char(10)), "None")
```

**Node 7 – Unresolved items.** These are the HR decisions, reminders not acted on, and sections not yet reviewed:

```
"**Unresolved items**" & Char(10) &
Coalesce(
  Concat(Filter(Global.ChangeLog, Kind = "Title review" Or Kind = "Other request"), "- " & Label & ": " & Proposed, Char(10)) &
  Concat(Filter(Global.Reminders, !(Target in Global.ChangeLog.Section)),
    Char(10) & "- Possible follow-up for " & LookUp(Global.AllSections, Name = Target).Label & ": " & Reminder) &
  If(Global.CurrentStep <> 99, Char(10) & "- Not yet reviewed: " & Concat(Filter(Global.AllSections, Step >= Topic.Furthest), Label, ", "), ""),
  "None")
```

**Node 8 – HR review flags:**

```
"**HR review flags**" & Char(10) &
Coalesce(Concat(Filter(Global.ChangeLog, !IsBlank(Flags)), "- " & Label & ": " & Flags, Char(10)), "None")
```

### 22.6 Node 9 – The review card *(rename to **Review card**)*

Add **Ask with adaptive card** and switch the card editor to **Formula**. Approve and Submit only appears once all 14 sections are done. Keep reviewing only appears mid-review.

```
{
  type: "AdaptiveCard",
  '$schema': "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    { type: "Input.ChoiceSet", id: "revisedSection", placeholder: "Choose a revised section to edit",
      choices: ForAll(Sort(Global.ChangeLog, Step), { title: ThisRecord.Label, value: ThisRecord.Section }) },
    { type: "Input.ChoiceSet", id: "unchangedSection", placeholder: "Choose an unchanged section to review",
      choices: ForAll(Filter(Global.AllSections, Step < Topic.Furthest && !(Name in Global.ChangeLog.Section)),
        { title: ThisRecord.Label, value: ThisRecord.Name }) }
  ],
  actions: If(Global.CurrentStep = 99,
    Table(
      { type: "Action.Submit", title: "Approve and Submit", data: { action: "approve", req: Global.RequestId } },
      { type: "Action.Submit", title: "Edit a Revised Section", data: { action: "editRevised", req: Global.RequestId } },
      { type: "Action.Submit", title: "Review an Unchanged Section", data: { action: "reviewUnchanged", req: Global.RequestId } }),
    Table(
      { type: "Action.Submit", title: "Edit a Revised Section", data: { action: "editRevised", req: Global.RequestId } },
      { type: "Action.Submit", title: "Review an Unchanged Section", data: { action: "reviewUnchanged", req: Global.RequestId } },
      { type: "Action.Submit", title: "Keep reviewing", data: { action: "continue", req: Global.RequestId } }))
}
```

Then:

- **Edit schema:** outputs `action`, `req`, `revisedSection` and `unchangedSection`, all plain strings (`name: String`).
- **Properties:** turn on **Allow switching to another topic**.

### 22.7 Node 10 – Card from an earlier update

Add a **Condition**: `Topic.req <> Global.RequestId`. True: **Send a message** "That card is from an earlier update. Here's your current summary.", then **Go to step → Show review**. All other conditions: leave empty.

### 22.8 Node 11 – Act on the button

Add a **Condition** with these branches. Use **Edit formula** for each.

**`Topic.action = "approve"`:**

1. **Condition** `Global.CurrentStep <> 99`. True: **Send a message** "You can submit once all 14 sections are reviewed.", then **Go to step → Review card**.
2. **Condition** `CountRows(Global.ChangeLog) = 0`. True: **Send a message** "No changes were requested, so there's nothing to send to HR. Choose a section to review, or say cancel to close this update.", then **Go to step → Review card**.
3. Nothing else; it falls through to the Manager Confirmation (Node 12).

**`Topic.action = "editRevised"`:**

1. **Condition** `IsBlank(Topic.revisedSection)`. True: **Send a message** "Pick a revised section first.", then **Go to step → Review card**.
2. Set `Topic.T` = `LookUp(Global.AllSections, Name = Topic.revisedSection).Step`.
3. Set `Global.ReturnStep` = `If(Topic.T = Global.ReturnStep, 0, If(Global.ReturnStep = 0 And Topic.T <> Global.CurrentStep, Global.CurrentStep, Global.ReturnStep))`.
4. Set `Global.CurrentStep` = `Topic.T`.
5. **Redirect** to Continue JD Update (TargetSection empty), then **End current topic**.

**`Topic.action = "reviewUnchanged"`:**

1. **Condition** `IsBlank(Topic.unchangedSection)`. True: **Send a message** "Pick an unchanged section first.", then **Go to step → Review card**.
2. Set `Topic.T` = `LookUp(Global.AllSections, Name = Topic.unchangedSection).Step`.
3. **Condition** `Topic.T >= Topic.Furthest`. True: **Send a message** "You haven't reached that section yet.", then **Go to step → Review card**.
4. Set `Global.ReturnStep` with the same formula as editRevised, step 3.
5. Set `Global.CurrentStep` = `Topic.T`.
6. **Redirect** to Continue JD Update, then **End current topic**.

**`Topic.action = "continue"`:**

1. **Send a message** "Back to {LookUp(Global.AllSections, Step = Global.CurrentStep).Label}."
2. **Redirect** to Continue JD Update, then **End current topic**.

**All other conditions:** leave empty.

At the end of the review, the ReturnStep formula saves 99, so a section opened from here returns the manager to this review.

### 22.9 Node 12 – Manager Confirmation *(rename to **Attest**)*

Only the approve branch reaches this node; every other branch ends or redirects first.

1. **Question:** "Please confirm: I confirm that the revised job description reflects the ongoing responsibilities and minimum requirements of the position."
   - Options: **Confirm**, **Return for Editing**.
   - Save as: `Topic.Attest`.
   - Properties: Allow switching on; Ask every time; if no valid entity is found, set **Return for Editing**.
2. **Condition** on `Topic.Attest`:
   - **Return for Editing:** **Go to step → Show review**.
   - **Confirm:**
     1. **Add a tool → Submit JD Update Request** with:
        - RequestId = `Global.RequestId`
        - JobCode = `Global.JobCode`
        - JobTitle = `Global.JobTitle`
        - UpdateReasons = `Global.UpdateReasons`
        - RelatedRoles = `Global.RelatedTitles`
        - ChangesJson = `JSON(Global.ChangeLog)` Save the output to `Topic.Result`.
     2. **Condition** `Topic.Result <> "OK"`. True: **Send a message** "Something went wrong sending this to HR. Let's try again.", then **Go to step → Attest**.
     3. **Send a message** "Submitted. Your requested changes for {Global.JobTitle} are with HR for review."
     4. Add the **reset block** from Step 23.3.
     5. **End all topics.** This clears every paused section topic, so none of them resurface.
   - **All other conditions:** leave empty.

The only path to the submit flow runs through Confirm, which meets the spec's "do not submit until the manager confirms".

### 22.10 Test

- [ ] After Other, all six summary blocks show, with "None" where empty.
- [ ] A reminder that wasn't acted on appears under Unresolved items.
- [ ] Edit a Revised Section opens only that section, then returns here.
- [ ] Mid-review, there's no Approve button, and the lists only show sections already reached.
- [ ] Return for Editing submits nothing.
- [ ] Confirm creates one SharePoint row per changed section, all with the same RequestId.

## Step 23: Switch JD Job, Cancel JD Update and the reset block

Both topics discard the update after a warning, reset the same variables, and end with **End all topics**. That last node clears paused section topics, so an old question can't come back for the wrong job. Build the reset block once (23.3) and add it to both topics and to the submit branch in Step 22.

### 23.1 Switch JD Job

Update your existing topic, or create it.

1. **Trigger:** The agent chooses.
2. **Description:**

> Use when the user wants to update a different job than the one they are working on. Do not use when the user only wants to look at or compare another job's description without switching.

3. **Input:** NewJob (String). Let the agent fill it; don't prompt. Description: "The title of the job the user wants to switch to, if they said one."

**Node 1 – Unsent changes.** Add a **Condition**: `Global.UpdateActive = true && CountRows(Global.ChangeLog) > 0`.

- **True:**
  1. **Question:** "You have {CountRows(Global.ChangeLog)} requested change(s) for {Global.JobTitle} that haven't been sent. Switching jobs will discard them. Switch anyway?"
     - Identify: **Boolean**. Save as: `Topic.ConfirmSwitch`.
     - Properties: Allow switching on; Ask every time.
  2. **Condition** `Topic.ConfirmSwitch = false`. True: **Send a message** "Okay, we'll keep working on {Global.JobTitle}.", then **Redirect** to Continue JD Update, then **End current topic**. All other conditions: leave empty.
- **All other conditions:** leave empty.

**Node 2 – Reset.** Add the reset block (23.3).

**Node 3 – Message.** Add a **Condition** `IsBlank(Topic.NewJob)`:

- **True:** **Send a message** "Okay, I've cleared that update. Which job would you like to update instead?"
- **All other conditions:** **Send a message** "Okay, I've cleared that update. Say 'update {Topic.NewJob}' and I'll find it."

**Node 4 – End all topics.**

### 23.2 Cancel JD Update

1. Create a topic named **Cancel JD Update**.
2. **Trigger:** The agent chooses.
3. **Description:**

> Use when the user wants to cancel, stop, quit or abandon the job description update. Not for going back to a section or switching to a different job.

**Node 1 – Keep the title.** Set `Topic.OldTitle` = `Global.JobTitle`, so the message can still name the job after the reset.

**Node 2 – Unsent changes.** Add a **Condition**: `CountRows(Global.ChangeLog) > 0`.

- **True:**
  1. **Question:** "You have {CountRows(Global.ChangeLog)} requested change(s) that haven't been sent. Cancel anyway?"
     - Identify: **Boolean**. Save as: `Topic.ConfirmCancel`.
     - Properties: Allow switching on; Ask every time.
  2. **Condition** `Topic.ConfirmCancel = false`. True: **Send a message** "Okay, let's keep going.", then **Redirect** to Continue JD Update, then **End current topic**. All other conditions: leave empty.
- **All other conditions:** leave empty.

**Node 3 – Reset.** Add the reset block (23.3).

**Node 4 – Message.** "Okay, I've cancelled the update for {Topic.OldTitle}. Nothing was sent to HR."

**Node 5 – End all topics.**

Initialize's ready question (Node 5b) redirects here when the manager says cancel. At that point the change log is empty, so there's no warning; the topic just confirms and closes.

### 23.3 The reset block

Add one **Set a variable value** node per row, in this order:

| Variable | Value |
| --- | --- |
| Global.UpdateActive | `false` |
| Global.ChangeLog | `Filter(Global.ChangeLog, false)` |
| Global.Reminders | `Filter(Global.Reminders, false)` |
| Global.CurrentStep | `0` |
| Global.ReturnStep | `0` |
| Global.UpdateReasons | `""` |
| Global.RequestId | `Blank()` |
| Global.JobCode | `Blank()` |
| Global.JobTitle | `Blank()` |
| Global.JD | `Blank()` |
| Global.RelatedJDs | `Filter(Global.RelatedJDs, false)` |
| Global.RelatedTitles | `""` |

`Filter(…, false)` empties a table but keeps its columns, so the next update's formulas still work. It is used in three places: Step 22.9 (after submit), 23.1 and 23.2.

## Step 24: Agent instructions and topic descriptions

The instructions and topic descriptions decide which topic the orchestrator picks, and whether a side question stays a side question.

### 24.1 Agent instructions

Open **Overview → Instructions**. Replace your job description update block with this one, and keep anything you have for the General and Create features.

```
Job description updates
- Updating a job description is a guided review, started and finished in one conversation. First find the job with the job search tool. When the user picks a job and wants to update it, use Initialize JD Update with that job's code and title.
- The review walks 14 sections in a fixed order: Purpose, Principal Duties and Responsibilities, People Leadership, Sales / Non-Sales, Relationship Manager, NMLS, Education, Work Experience, Licenses and Certifications, Knowledge, Skills, Abilities, Title, Other. Users can go back to sections they have already reached, but cannot skip ahead, and can submit only after all 14 are reviewed.
- While an update is in progress, never start a new update. To go back, return from an earlier section, or carry on after a side question, use Continue JD Update. If the user asks to skip or jump ahead, also use Continue JD Update; it explains that sections are reviewed in order. Never skip sections yourself.
- To see changes, edit a revised section, review an unchanged section, or approve and submit, use JD Final Review. To update a different job, use Switch JD Job. To stop, use Cancel JD Update.
- If the user asks a question during an update, answer it briefly and do not restart or leave the update. The review picks up at the same step after your answer. Explain job description concepts only when the user asks or clearly needs it.
- Reminders about other sections are suggestions. The manager decides whether to act on them.
- Looking at or comparing another job's description during an update is a side question, not a switch. Never change another job description.
- For title and level questions, use the Governance Guide and leave final determinations to HR.
- There are no saved drafts. If the user asks to save and finish later, explain that the update must be finished and submitted in this conversation, and offer to keep going.
- Never show job code, grade, status or salary/hourly.
- Never regenerate or write out the entire job description. Work one section at a time and summarize only the requested changes.
```

### 24.2 Which topics the orchestrator can pick

Only these five topics use **The agent chooses**. All 14 section topics use **It's redirected to**.

| Topic | Should fire on | Should not fire on |
| --- | --- | --- |
| Initialize JD Update | "I want to update the Universal Banker JD", after the job is found | "continue", "go back" |
| Continue JD Update | "continue", "go back", "go back to education", and also "skip this" or "let's do NMLS" (it declines forward moves) | "update a different job", "cancel" |
| JD Final Review | "what have I changed?", "show my summary", "I'm ready to submit" | a question about what a section means |
| Switch JD Job | "I want to update a different job instead" | "what does the Senior Analyst JD say?" |
| Cancel JD Update | "cancel this", "stop the update", "never mind, quit" | "go back", "switch jobs" |

If a topic fires on the wrong phrase in testing, add a "Do not use when…" sentence to its description. That usually works better than adding more "use when" phrases.

In the test pane, open each section topic once and confirm its trigger reads **It's redirected to**. A section topic left on The agent chooses can be opened by the orchestrator before the hub has set CurrentStep.

## Step 25: Test script

Run each case in the test pane from a fresh conversation, with the activity map open. Use one role that has related levels and one that doesn't. Each topic step above has its own quick checks; this is the end-to-end pass.

### Spec acceptance tests

- [ ] **Reasons checklist.** The update starts with the Reason for Update card, and several reasons can be picked.
- [ ] **Current content first.** Every section shows its current language before asking keep or revise.
- [ ] **Sales, RM, portfolio and NMLS.** Each is captured with the spec's simple questions and flagged for HR when changed.
- [ ] **Education and experience.** Revisions keep equivalency language, use only the approved options, and stay consistent with each other.
- [ ] **KSAs.** Knowledge, Skills and Abilities are reviewed in that order; drafts start "Knowledge of", "Skill in", "Ability to" and reflect the Purpose and duties.
- [ ] **Related levels.** Revisions show the side-by-side comparison before they're accepted. An overlap becomes a related-role concern and a Job Architecture review flag.
- [ ] **No full regeneration.** Only the section being changed is drafted; the whole job description is never written out.
- [ ] **Title.** A title review uses the Governance Guide, says HR decides, and is flagged for HR approval.

### Reminders between sections

- [ ] **Purpose → Duties.** Add "also troubleshoots branch computer equipment" to Purpose. Expect: a Duties heads-up, then the reminder at Principal Duties.
- [ ] **Duties → Sales.** On a Non-Sales role, add "Sell deposit and loan products to clients". Expect: a Sales heads-up, then the reminder at Sales / Non-Sales before its question.
- [ ] **Duties → People Leadership.** On an individual contributor role, add "Supervise three tellers". Expect: a People Leadership heads-up and reminder.
- [ ] **Education → Work Experience.** Raise Education without changing experience. Expect: a Work Experience heads-up and reminder.
- [ ] **Undone change.** Accept a Purpose change that raises a reminder, then go back and choose Return to Current Language. Expect: the reminder is gone.
- [ ] **Ignored reminder.** Keep the section a reminder pointed at as it is. Expect: the reminder listed under Unresolved items in the final review.

### Side questions

- [ ] **At the ready question.** Ask "what's an upscale?" Expect: an answer, then the ready question again.
- [ ] **At the reasons card.** Ask a question. Expect: an answer, then the card again.
- [ ] **At Keep As Is / Revise.** Ask a question. Expect: an answer, then the same question.
- [ ] **At Accept / Edit / Return.** Ask a question. Expect: an answer, with the draft still in place.
- [ ] **Compare another job.** Mid-section, ask about another job's JD. Expect: an answer, and the same job still being updated.

### Navigation

- [ ] **Go back one.** In NMLS, say "go back". Expect: Relationship Manager, then straight back to NMLS.
- [ ] **Go back several.** In Education, say "go back to purpose". Expect: Purpose, then straight back to Education.
- [ ] **Returning to a changed section.** Expect: Keep my change, Edit my change and Return to Current Language.
- [ ] **From the first section.** In Purpose, say "go back". Expect: "You're already on the first section."
- [ ] **Skip blocked.** In Duties, say "skip this". Expect: the in-order message, then the same question.
- [ ] **Jump ahead blocked.** In Duties, say "let's do Title". Expect: "We'll get to Title in order…"
- [ ] **No leftover answers.** Accept a change, choose "No, remain in this section", and confirm that "What changed?" is actually asked again.

### Final review and submit

- [ ] **Six blocks.** After Other, the review shows the header plus revised sections, unchanged sections, related-role concerns, unresolved items and HR flags.
- [ ] **Edit or review a section.** It opens only that section, then returns to the review.
- [ ] **Mid-review summary.** Say "show my changes" in section 5. Expect: no Approve button; only sections 1 to 4 in the lists; Keep reviewing returns to section 5.
- [ ] **Return for Editing.** Nothing is submitted.
- [ ] **Confirm.** Expect: one SharePoint row per changed section, sharing one RequestId, with ManagerConfirmed = Yes.

### Switch, cancel and single session

- [ ] **Switch jobs.** With changes pending, answer No. Expect: the review continues. Answer Yes. Expect: you're asked which job, and old questions never come back.
- [ ] **Cancel at the ready question.** Expect: "Nothing was sent to HR."
- [ ] **Cancel mid-review.** Expect: the warning about unsent changes first.
- [ ] **Save for later.** Ask to finish tomorrow. Expect: an explanation that it must be finished now.
- [ ] **Hidden fields.** Job code, grade, status and salary/hourly never appear.

## Troubleshooting

Most problems come from one of four things:

- a question node with interruptions off, or with Skip behavior left on its default;
- a section topic with the wrong trigger;
- a missing **End all topics**;
- a table formula whose columns don't match the empty table it started from.

### Common symptoms

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A typed question gets "I didn't understand" or a re-prompt | Allow switching is off on that question or card | Properties → Allow switching to another topic |
| A question is skipped, or an old answer is reused after a loop | Skip behavior is on its default | Set Skip behavior to Ask every time |
| Two questions can't save to the same variable | Multiple-choice answers have a choice type tied to their options | Save each question to its own variable, as every topic here does |
| A section opens with blank content | The section topic's trigger is The agent chooses, or its Global.JD field name is wrong | Use It's redirected to; check the key in Initialize's Global.JD record |
| Knowledge, Skills or Abilities is empty | The KSA split didn't match the headings | Test the split on real JDs, or switch to the KSA Splitter prompt (v2, Step 2.2) |
| No comparison ever appears | Get Related JDs returns nothing, or Parse value failed | Test the flow with a role that has levels; reset the Parse value sample |
| The comparison card won't save | Mixed record shapes in the card formula | Keep every TextBlock's fields identical, or use the plain-message fallback |
| Prompt fields come back blank | The prompt output is text, not JSON | Set the output to JSON and re-map the tool node |
| Reminders never show at the target section | The prompt returned a label ("Sales / Non-Sales") instead of a key ("Sales") | Check rule 10's key list in the prompt; test with the Sales follow-up case |
| Duties show "1. 1." | The stored list already had numbers | Strip numbering in the flow |
| People Leadership always says no change | The status text doesn't match the condition | Match `"Manages People" in Topic.CurrentText` to your stored wording |
| RM, NMLS or Sales records a change when nothing changed | Stored value and new value differ in wording | Use your column's exact values in the Screen node |
| The user can jump ahead | The "past the furthest step" branch is below the allowed-section branch in the hub | Move it above |
| An old question pops up after submit, switch or cancel | End all topics is missing | Add it as the last node |
| The change log formula errors | Columns or types differ from Initialize's empty table | Match all ten columns; Step is a number, everything else text |
| A global is blank in another topic | It was created with topic scope | Variable properties → Usage → Global |
| The agent offers to save a draft | The no-drafts line is missing from the instructions | Add it from Step 24.1 |

### If `As` isn't accepted in the JobContext formula

Use this version instead. It builds a small table first, so no `As` is needed:

```
Concat(
  ForAll(
    Filter(Global.AllSections, Name <> Topic.SectionName && Name <> "Other"),
    {L: Label, V: Coalesce(
      LookUp(Global.ChangeLog, Section = Name).Proposed,
      Switch(Name,
        "Purpose", Global.JD.Purpose, "Duties", Global.JD.Duties,
        "PeopleLeadership", Global.JD.PeopleLeadership, "Sales", Global.JD.Sales,
        "RM", Global.JD.RM, "NMLS", Global.JD.NMLS,
        "Education", Global.JD.Education, "Experience", Global.JD.Experience,
        "Licenses", Global.JD.Licenses, "Knowledge", Global.JD.Knowledge,
        "Skills", Global.JD.Skills, "Abilities", Global.JD.Abilities,
        "Title", Global.JobTitle))}
  ),
  L & ": " & V, Char(10) & Char(10))
```

### If `followUps` won't come back as a list

Some environments return a JSON array as plain text. If so:

1. In the prompt, change the `followUps` line to: `"followUps": "Key: reminder || Key: reminder, or an empty string"`.
2. In each topic, replace the Global.Reminders formula with:

```
Table(
  Filter(Global.Reminders, From <> Topic.SectionName),
  ForAll(
    Filter(Split(Topic.Review.followUps, "||"), !IsBlank(Trim(Value))),
    {Target: Trim(Left(Value, Find(":", Value) - 1)), From: Topic.SectionName, Reminder: Trim(Mid(Value, Find(":", Value) + 1))}
  )
)
```

For Principal Duties and Other, drop the `Filter(Global.Reminders, …)` line and start the Table with `Global.Reminders`.

3. Replace the heads-up condition with `!IsBlank(Topic.Review.followUps)`. Change the heads-up message to `"Heads up for other sections: " & Substitute(Topic.Review.followUps, "||", "; ")`.

### If `Text()` is rejected in Principal Duties, Node 6

Open the **Variables** panel and check the type of `Topic.ActionFirst` and `Topic.ActionRevisit`. If they show as plain text already, drop `Text()` and use the variables directly. If they show as choices and `Text()` still errors, note the exact error message before changing anything else.

## Decisions to confirm with your manager

The spec leaves these points open. The guide makes a reasonable choice for each, so you can build now and change one node later if your manager answers differently.

| Open point | What the guide does now | Where to change it |
| --- | --- | --- |
| People Leadership: a manager's position answers No to "two or more employees" | Sets it to Individual Contributor | Step 10.7, True branch |
| People Leadership: an individual contributor gains exactly one report | Records Manages People, because the spec's IC branch has no minimum | Step 10.7, other branch |
| Relationship Manager: one Yes or both Yes | One Yes makes the role an RM (`Or`) | Step 12.7, item 3 |
| Sales / Non-Sales: any screening questions | Asks for the value directly | Step 11.7 |
| Continue Review after Keep As Is | Asked only after an accepted change | Each topic's Accept branch |
| Which links between sections should raise reminders | The nine links in prompt rule 10 | Step 7.2, rule 10 |
| Exact stored values for People Leadership, Sales, RM and NMLS | Placeholders such as "Yes" and "No" | Steps 10 to 13, Screen nodes |
| What counts as an "unresolved item" | Title review requests, Other requests, reminders not acted on, and sections not yet reviewed | Step 22.5, Node 7 |
| Knowledge, Skills and Abilities as separate submitted rows | Three rows, one per part | Step 22.1 |
| The approved education and experience options | A placeholder in the prompt; the list is needed | Step 7.2, rule 5 |
| Submitting when nothing changed | Blocked; the manager can cancel instead | Step 22.8, approve branch |
