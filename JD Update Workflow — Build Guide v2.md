# JD Update Workflow — Build Guide v2

Sep 29, 2026 · @Eric

## Overview

Version 2 builds your manager's spec on the same hub design. Every update walks 14 sections in a fixed order, from Purpose to Other. Each section shows the current content first, then lets the manager keep it or revise it. The update ends with a Final Consolidated Review and a Manager Confirmation before anything is submitted.

The navigation rules from v1 stay the same:

- Users can ask side questions at any point and land back on the same question.
- Users can go back to an earlier section and return to the one they were on.
- Users cannot skip ahead.
- Every update is finished in one conversation; there are no saved drafts.

&#91;embedded content: JD update architecture · hub, 14 section topics in five kinds, final review, confirmation\]

The hub opens each section in order and takes control back when it ends. Edits from the final review go back through the hub, and only Confirm reaches the submit flow.

### What you keep from your current build

- **Initialize JD Update:** Nodes 1 to 6, including your ready-to-continue question and your own Reason for Update card. Step 4 lists the few additions.
- **The hub, Continue JD Update:** same shape. The formulas get simpler, because every section is always included.
- **Global variables:** same set, except `Global.Sections` is no longer needed, plus two new ones for related roles.
- **Switch JD Job:** unchanged apart from the reset list.

### What is new

- **14 section topics in five kinds:** text sections, Principal Duties, People Leadership, three indicator sections (Sales / Non-Sales, Relationship Manager, NMLS), and Title and Other.
- **Related-role comparison:** a new Get Related JDs flow, and a side-by-side view before a change is accepted.
- **Revision Confirmation:** "What changed, and why is this an ongoing change to the position?" with Accept Revision, Edit Revision and Return to Current Language.
- **Continue Review:** "Have you completed everything you wanted to update in this section?" after each accepted change.
- **HR review flags:** some are set automatically by section, and some are raised by the prompt.
- **Final Consolidated Review and Manager Confirmation:** these replace v1's Review JD Changes.
- **Cancel JD Update:** a new topic.

### Where each part of the spec is built

| Spec item | Built in |
| --- | --- |
| Step 1: Open the existing JD (plus related leveled JDs) | Step 2 (flows) and Step 4, Nodes 4 and 4b |
| Step 2: Reasons for the update | Step 4, Node 6 (your card) |
| Step 3: Explain the review process | Step 4, Node 5 |
| Section-by-section review | Steps 8 to 13 |
| Related-Role Comparison | Step 2.3 and Step 7.4 |
| Revision Confirmation | Step 7.3 |
| Continue Review | Step 7.6 |
| HR Review Flags | Step 7.5 |
| Final Consolidated Review | Step 14.1 to 14.3 |
| Manager Confirmation | Step 14.4 |
| Expected output: intake summary | Step 4, Node 8 |
| Acceptance Test | Step 17 |

### Topics you will have

| Topic | Trigger | Job |
| --- | --- | --- |
| Initialize JD Update | The agent chooses | Loads the job and related roles, explains the review, collects reasons, shows the intake summary |
| Continue JD Update (the hub) | The agent chooses, plus redirects | Opens the current section; handles going back and returning; declines skipping ahead |
| JD Section – \[name\] (14 topics) | It's redirected to | One per section, built from the templates in Steps 8 to 13 |
| JD Final Review | The agent chooses, plus redirects | Final Consolidated Review, edits, and Manager Confirmation; submits |
| Switch JD Job | The agent chooses | Discards the update and restarts with another job |
| Cancel JD Update | The agent chooses | Discards the update |

### Build order

1. Settings, section list, entity and knowledge (Step 1)
2. Flows: check Get JD Details, split KSAs, build Get Related JDs (Step 2)
3. Global variables (Step 3)
4. Additions to Initialize JD Update (Step 4)
5. The hub (Step 5)
6. The prompt (Step 6), and read Step 7 once
7. The Purpose topic, then test it end to end before copying it (Step 8)
8. Principal Duties, People Leadership, the indicator sections, Title and Other (Steps 9 to 13)
9. Final review and the submit flow (Step 14)
10. Switch and Cancel (Step 15)
11. Instructions (Step 16), then the full test script (Step 17)

Build everything in your DEV solution so it moves to UAT and QA with the agent.

## Step 1: Settings, sections, entity and knowledge

The section list below drives everything else: the hub, the counter, the summary and the no-skipping rule. Set it up first, and keep the keys exactly as written.

### 1.1 Confirm generative orchestration

1. Go to **Settings → Generative AI**.
2. Confirm the agent uses generative AI to choose topics and tools.
3. Save.

### 1.2 The 14 sections

The order comes from your manager's spec. **Key** is what every formula, the entity and the hub compare against, so keep keys to one word with no spaces. **Kind** tells you which template to build the topic from.

| Step | Key | Label shown to users | Kind (template) | Compared with related roles | Automatic HR flag when changed |
| --- | --- | --- | --- | --- | --- |
| 1 | Purpose | Purpose | Text (Step 8) | Yes | None |
| 2 | Duties | Principal Duties and Responsibilities | Duties (Step 9) | Yes | None |
| 3 | PeopleLeadership | People Leadership | People Leadership (Step 10) | No | People leadership or reporting structure change |
| 4 | Sales | Sales / Non-Sales | Indicator (Step 11) | No | Sales change |
| 5 | RM | Relationship Manager | Indicator (Step 11) | No | RM or portfolio change |
| 6 | NMLS | NMLS | Indicator (Step 11) | No | NMLS change |
| 7 | Education | Education | Text (Step 8) | Yes | None |
| 8 | Experience | Work Experience | Text (Step 8) | Yes | None |
| 9 | Licenses | Licenses and Certifications | Text (Step 8) | Yes | License or certification change |
| 10 | Knowledge | Knowledge | Text (Step 8) | Yes | None |
| 11 | Skills | Skills | Text (Step 8) | Yes | None |
| 12 | Abilities | Abilities | Text (Step 8) | Yes | None |
| 13 | Title | Title | Title (Step 12) | Titles only | Title review for HR approval |
| 14 | Other | Other Requirements | Other (Step 13) | No | Other requirement for HR review |

The steps run 1 to 14 with no gaps. That lets the hub use simple arithmetic (next = step + 1, previous = step − 1).

### 1.3 Update the JD Section entity

Go to **Settings → Entities** and open **JD Section** (or create it as a **Closed list**). Replace the items with these:

| Item | Synonyms |
| --- | --- |
| Purpose | purpose statement, job purpose, summary, overview |
| Duties | principal duties, responsibilities, duties and responsibilities, tasks |
| PeopleLeadership | people leadership, people management, direct reports, reporting relationship, manager |
| Sales | sales, non-sales, sales designation, sales/non-sales |
| RM | relationship manager, RM, portfolio, book of business |
| NMLS | NMLS, mortgage registration, NMLS registration |
| Education | education, degree, schooling, education requirement |
| Experience | work experience, experience, years of experience |
| Licenses | licenses, certifications, registrations, professional designations, credentials |
| Knowledge | knowledge, knowledge statements |
| Skills | skills, skill statements |
| Abilities | abilities, ability statements |
| Title | title, job title, title review |
| Other | other, other requirement, another requirement |
| Previous | back, go back, previous section, last section |
| Next | skip, skip this, next section, move on |
| Summary | summary, my changes, changes so far, review |

Keep **Next** and its "skip" synonyms. They let the hub recognize a skip request so it can decline it, or end a detour. Turn on **Smart matching** if it is offered.

### 1.4 Add the Governance Guide as knowledge

The Title section must use the Governance Guide, and HR makes the final call.

1. Go to **Knowledge → Add knowledge**, and add the Governance Guide as a file upload or from its SharePoint location.
2. Give it a clear name, **Governance Guide**, and a description: "City National job title and level governance rules. Use for title, level and job architecture questions."
3. Wait until its status shows **Ready**.

The Title topic (Step 12) will query only this source. The orchestrator can also use it to answer general title questions during an update.

## Step 2: Upstream tools

The spec asks for three things your current flows don't provide yet: every section's current value, Knowledge, Skills and Abilities as separate sections, and related leveled JDs. Your search tool and the Job Code key stay as they are. Only change what is listed here.

### 2.1 Check Get JD Details returns every section

Open the flow and look at its **Respond to the agent** action. It needs one output per section below. Add any that are missing; the indicator fields are the most likely gaps.

| Section | SharePoint column | Notes |
| --- | --- | --- |
| Title | Job Title | Shown to users |
| Purpose | Purpose |  |
| Principal Duties | Principal Duties and Responsibilities | Rich text? See below |
| People Leadership | People Management | The status text, for example "This Position Manages People" or "Individual Contributor" |
| Sales / Non-Sales | Sales/Non-Sales |  |
| Relationship Manager | Relationship Manager |  |
| NMLS | NMLS Required |  |
| Education | Education Requirements |  |
| Work Experience | Work Experience Requirements |  |
| Licenses and Certifications | Certifications/Licenses |  |
| Knowledge, Skills, Abilities | Knowledge Skills Abilities | One column; see 2.2 |

Three checks while you are in the flow:

1. **Hidden fields.** Do not return Grade, Status or Salary/Hourly. If they are not needed as outputs, remove them, so they can never be shown.
2. **Rich text.** If a column is an enhanced rich text column, its value arrives full of HTML tags. Add an **Html to text** action for each such column before Respond to the agent, and return its output instead.
3. **Output shape.** Separate outputs per field need no parsing. If the flow returns one text output that holds JSON, Step 4, Node 4 parses it with a Parse value node.

### 2.2 Split Knowledge, Skills and Abilities

The spec reviews Knowledge, Skills and Abilities as three sections, but your list stores them in one column. Split them once, when the JD loads. Use whichever option fits your data.

**Option A – in the flow (use this if every KSA field has the headings "Knowledge:", "Skills:" and "Abilities:").** Store the KSA text in a variable `KSA`, then add three outputs with these expressions:

```
Knowledge:  trim(first(split(last(split(variables('KSA'), 'Knowledge:')), 'Skills:')))
Skills:     trim(first(split(last(split(variables('KSA'), 'Skills:')), 'Abilities:')))
Abilities:  trim(last(split(variables('KSA'), 'Abilities:')))
```

Test this on three or four real JDs. If the headings vary (for example "Knowledge of" with no colon), use Option B.

**Option B – a small prompt (use this if the headings are inconsistent).** Create a prompt named **KSA Splitter** with one text input, `KSAText`, and JSON output:

```
Split this Knowledge, Skills and Abilities text into its three parts. Do not reword, add or drop anything. If a part is missing, return an empty string for it.

Text: {KSAText}

Return only JSON: {"knowledge": "...", "skills": "...", "abilities": "..."}
```

Step 4, Node 4 shows where to call it.

### 2.3 Build the Get Related JDs flow (new)

This flow finds the other levels of the same role, for example I, II, III, Senior and Lead, and returns their comparison sections. It only reads. It never updates another JD, as the spec requires.

**The Office Script.** Create a script **GetRelatedTitles** in the same workbook your MatchJobTitle script runs against. Reuse your level canonicalization from MatchJobTitle, so both scripts agree on what counts as a level:

```
function main(workbook: ExcelScript.Workbook, target: string, candidates: string[]): string[] {
  const levels = /\b(senior|sr|lead|principal|junior|jr|i{1,3}|iv|v|vi|[1-6])\b/g;
  const base = (t: string) => t.toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(levels, " ")
    .replace(/\s+/g, " ")
    .trim();
  const goal = base(target);
  return candidates.filter(c => c && c !== target && base(c) === goal);
}
```

**The flow.** Create an agent flow named **Get Related JDs**:

1. **Trigger inputs:** `JobCode` (text) and `JobTitle` (text).
2. **Get items** from the JD list. Filter to active JDs if your list has a status column. Limit columns to Job Title, Job Code, Purpose, Principal Duties, Education, Work Experience, Certifications/Licenses and KSA. Turn on pagination.
3. **Select** (name it `Select titles`): From = the Get items `value`, map in text mode to `item()?['JobTitle']` (use your column's internal name).
4. **Run script:** GetRelatedTitles with `target` = `JobTitle` and `candidates` = the output of Select titles.
5. **Filter array:** From = the Get items `value`, condition = `contains(outputs('Run_script')?['body/result'], item()?['JobTitle'])` is true, and Job Code is not equal to the `JobCode` input.
6. **Select** (name it `Select related`): From = `take(body('Filter_array'), 4)`. Map: `Title`, `Purpose`, `Duties`, `Education`, `Experience`, `Licenses`, `KSA`, each set to its column. Four levels is the most a side-by-side view can show legibly.
7. **Respond to the agent** with two outputs: `RelatedJson` (text) = `string(body('Select_related'))`, and `RelatedCount` (number) = `length(body('Select_related'))`.

If any of these columns are rich text, replace step 6 with an Apply to each over the filtered items. Run Html to text on each rich column, and use Append to array variable to build the same shape.

Test it with a role that has levels and one that doesn't. The second should return `[]` and a count of 0.

## Step 3: Global variables and navigation rules

Twelve global variables hold the whole state of an update. They last for the current conversation only, which matches the one-session rule. To create one, add a **Set a variable value** node, create a new variable, open its properties, and set **Usage** to **Global (any topic can access)**.

### 3.1 The variables

| Variable | Type | First set in | Purpose |
| --- | --- | --- | --- |
| Global.JobCode | String | Initialize | Key passed to every flow. Never shown. |
| Global.JobTitle | String | Initialize | Shown in messages. |
| Global.JD | Record | Initialize, Node 4 | Current value of every section. |
| Global.RelatedJDs | Table | Initialize, Node 4b | Related leveled JDs for comparison (new). |
| Global.RelatedTitles | String | Initialize, Node 4b | Their titles, comma-separated, for messages and the prompt (new). |
| Global.RequestId | String | Initialize | Ties the submitted rows together. Also guards paused topics and old cards. |
| Global.UpdateActive | Boolean | Initialize | True while an update is in progress. |
| Global.UpdateReasons | String | Initialize | The reasons from your card, including the Other text. |
| Global.AllSections | Table | Initialize | The 14 sections from Step 1.2. |
| Global.CurrentStep | Number | Initialize | The section open now (1 to 14). 99 means the final review. |
| Global.ReturnStep | Number | Initialize | Where to return after going back. 0 means no detour; 99 means the final review. |
| Global.ChangeLog | Table | Initialize | One row per changed section. |

If you already created `Global.Sections`, you can delete it. Every formula in this guide uses `Global.AllSections`, because every section is always reviewed.

### 3.2 The section table formula

Set `Global.AllSections` to:

```
Table(
  {Step: 1,  Name: "Purpose",          Label: "Purpose",                              Kind: "Text",      Compare: true},
  {Step: 2,  Name: "Duties",           Label: "Principal Duties and Responsibilities", Kind: "Duties",    Compare: true},
  {Step: 3,  Name: "PeopleLeadership", Label: "People Leadership",                    Kind: "Indicator", Compare: false},
  {Step: 4,  Name: "Sales",            Label: "Sales / Non-Sales",                    Kind: "Indicator", Compare: false},
  {Step: 5,  Name: "RM",               Label: "Relationship Manager",                 Kind: "Indicator", Compare: false},
  {Step: 6,  Name: "NMLS",             Label: "NMLS",                                 Kind: "Indicator", Compare: false},
  {Step: 7,  Name: "Education",        Label: "Education",                            Kind: "Text",      Compare: true},
  {Step: 8,  Name: "Experience",       Label: "Work Experience",                      Kind: "Text",      Compare: true},
  {Step: 9,  Name: "Licenses",         Label: "Licenses and Certifications",          Kind: "Text",      Compare: true},
  {Step: 10, Name: "Knowledge",        Label: "Knowledge",                            Kind: "Text",      Compare: true},
  {Step: 11, Name: "Skills",           Label: "Skills",                               Kind: "Text",      Compare: true},
  {Step: 12, Name: "Abilities",        Label: "Abilities",                            Kind: "Text",      Compare: true},
  {Step: 13, Name: "Title",            Label: "Title",                                Kind: "Title",     Compare: false},
  {Step: 14, Name: "Other",            Label: "Other Requirements",                   Kind: "Other",     Compare: false}
)
```

### 3.3 The change log shape

Set `Global.ChangeLog` to an empty table that already has its columns, so later formulas know its shape:

```
Filter(
  Table({Section: "", Label: "", Step: 0, Kind: "", Original: "", Proposed: "",
         Rationale: "", Comments: "", Flags: "", RelatedConcern: ""}),
  false
)
```

| Column | Holds |
| --- | --- |
| Section, Label, Step | Which section |
| Kind | "Revision", "Title review" or "Other request" |
| Original | The current language when the change was made |
| Proposed | The accepted revised wording or value |
| Rationale | The manager's answer to "why is this an ongoing change to the position?" |
| Comments | The agent's review comments |
| Flags | HR review flags, comma-separated |
| RelatedConcern | Any overlap or inconsistency with a related level |

### 3.4 The no-skipping rule

Users can reach any section up to the furthest one they have been to, never beyond it. The furthest step is always:

```
If(Global.ReturnStep <> 0, Global.ReturnStep, Global.CurrentStep)
```

The rule is enforced in three places:

- **The hub (Step 5):** typed requests like "let's do NMLS" or "skip this".
- **The final review card (Step 14):** it only lists sections up to that step.
- **Approve and Submit:** only works after all 14 sections.

Section topics can't be opened any other way, because their trigger is **It's redirected to**.

### 3.5 The return point and the detour formula

When the user goes back, `Global.ReturnStep` saves the section they were on. When the earlier section ends, the hub sends them straight back to it, without repeating the sections in between. Set `ReturnStep` with this formula whenever you send the user to an earlier step T:

```
If(
  T = Global.ReturnStep, 0,
  If(Global.ReturnStep = 0 And T <> Global.CurrentStep, Global.CurrentStep, Global.ReturnStep)
)
```

It works like this:

- Going to the step you are returning to ends the detour.
- The first detour saves the current step.
- A second detour keeps the original step, so the user still returns to where they started.

## Step 4: Initialize JD Update

Keep your topic as built. The changes are in the setup node, the JD load, a new related-roles node, the explanation wording, and the nodes after your card. The trigger, description and the JobCode and JobTitle inputs stay as they are.

### 4.1 Nodes 1 and 2 (unchanged)

- **Node 1 – No job selected:** `IsBlank(Topic.JobCode)`. If true, ask which job, then **End current topic**.
- **Node 2 – Already updating:** `Global.UpdateActive = true`.
  - Same job: "You're already updating {Global.JobTitle}. Let's continue." Then **Redirect** to Continue JD Update and **End current topic**.
  - Different job: **Redirect** to Switch JD Job, then **End current topic**.

### 4.2 Node 3 – Setup (updated)

| Variable | Value |
| --- | --- |
| Global.JobCode | `Topic.JobCode` |
| Global.JobTitle | `Topic.JobTitle` |
| Global.RequestId | `GUID()` |
| Global.UpdateActive | `false` |
| Global.CurrentStep | `0` |
| Global.ReturnStep | `0` |
| Global.UpdateReasons | `""` |
| Global.RelatedTitles | `""` |
| Global.AllSections | the Table formula in Step 3.2 |
| Global.ChangeLog | the empty-table formula in Step 3.3 |

Remove any `Global.Sections` row.

### 4.3 Node 4 – Load the job description (updated)

1. **Add a tool → Get JD Details** with `Global.JobCode`. Save each output to a topic variable.
2. **If you used KSA Option B (Step 2.2):** add **Add a tool → KSA Splitter** with `KSAText` = the KSA output, and save the result to `Topic.KSAParts`.
3. **If your flow returns one JSON string instead of separate outputs:** add **Variable management → Parse value**. Paste a sample response to set the type, and save the result to `Topic.JDParsed`. Then read fields from `Topic.JDParsed` below.
4. Set `Global.JD` to one record keyed by the section keys. Replace the right-hand names with your flow's output names:

```
{
  Title: Topic.JobTitleOut,
  Purpose: Topic.Purpose,
  Duties: Topic.PrincipalDuties,
  PeopleLeadership: Topic.PeopleManagement,
  Sales: Topic.SalesNonSales,
  RM: Topic.RelationshipManager,
  NMLS: Topic.NMLSRequired,
  Education: Topic.EducationRequirements,
  Experience: Topic.WorkExperience,
  Licenses: Topic.CertificationsLicenses,
  Knowledge: Topic.Knowledge,
  Skills: Topic.Skills,
  Abilities: Topic.Abilities
}
```

With Option B, use `Topic.KSAParts.knowledge`, `Topic.KSAParts.skills` and `Topic.KSAParts.abilities` for the last three.

5. **Condition:** `IsBlank(Global.JD.Purpose) && IsBlank(Global.JD.Duties)`. If true: "I couldn't load that job description. Can you tell me the job title again?" Set `Global.JobCode` to `Blank()`, then **End current topic**.

### 4.4 Node 4b – Load related levels (new)

This covers the spec's Step 1: "Retrieve the current JD and any related leveled JDs."

1. **Add a tool → Get Related JDs** with `Global.JobCode` and `Global.JobTitle`. Save the outputs to `Topic.RelatedJson` and `Topic.RelatedCount`.
2. **Parse value:** parse `Topic.RelatedJson` as a **Table**. Set the type from a sample of the flow's output (run the flow once and copy its RelatedJson). Save it to `Global.RelatedJDs`. An empty `[]` parses to an empty table, so no condition is needed.
3. Set `Global.RelatedTitles` = `Concat(Global.RelatedJDs, Title, ", ")`.

### 4.5 Node 5 – Explain the review (updated wording)

This uses the spec's Step 3 language. Insert it as a formula so the related-levels sentence only appears when related levels exist:

> I'll walk you through the job description for **{Global.JobTitle}** one section at a time, in order: Purpose, Principal Duties and Responsibilities, People Leadership, Sales / Non-Sales, Relationship Manager, NMLS, Education, Work Experience, Licenses and Certifications, Knowledge, Skills, Abilities, Title, and Other.
>
> For each section, you'll see the current language first. Then you decide whether to keep it or revise it. When you revise, I'll draft the new wording for you to accept or edit.{If(CountRows(Global.RelatedJDs) > 0, " I'll also compare it with the related levels: " & Global.RelatedTitles & ".", "")}
>
> At the end, you'll review every change and confirm before anything goes to HR. You can ask me questions or go back to an earlier section at any time. Plan to finish in this conversation, because nothing is saved until you submit.

**A difference from the spec:** the spec asks for the reasons (its Step 2) before this explanation (its Step 3). Your build explains first, then shows the card. That is kept here because it lets managers ask questions before committing. If your manager wants the spec's exact order, move Nodes 5 and 5a after Node 7.

### 4.6 Nodes 5a and 5b – Ready to continue (as you designed)

**Node 5a – Question.**

- Text: "Whenever you're ready, shall we get started? You can also ask me anything first, or cancel."
- Identify: **Multiple choice options**.
  - **Continue**, with synonyms: yes, ready, let's go, sure, ok, start.
  - **Cancel**, with synonyms: no, stop, never mind, not now, quit.
- Save to `Topic.ReadyChoice`.
- Properties:
  - Turn on **Allow switching to another topic**.
  - Set **Skip behavior** to **Ask every time**.
  - Reprompt up to 2 times.
  - When no valid entity is found, set the variable to `"Cancel"`.

**Node 5b – Condition on `Topic.ReadyChoice`.**

- **Cancel:** **Redirect** to Cancel JD Update (Step 15), then **End current topic**.
- **Continue:** falls through to Node 6.

### 4.7 Node 6 – Your Reason for Update card (check only)

Confirm three things.

**The choices match the spec.** Keep every value free of commas:

| Title | Value |
| --- | --- |
| Upscales | Upscales |
| Adding/Removing Responsibilities | Adding/Removing Responsibilities |
| Editing Qualifications | Editing Qualifications |
| Aligning Knowledge / Skills / Abilities | Aligning Knowledge / Skills / Abilities |
| Changing Reporting Relationship/People Leadership | Changing Reporting Relationship/People Leadership |
| Title | Title |
| Other | Other |

**The schema.** `reasons` and `reasonsOther` are plain strings (`reasons: String`, not a Table or a String with properties). Remove `sections` from the card and the schema if it is still there.

**Interruptions.** In the card node's Properties, **Allow switching to another topic** is on.

### 4.8 Node 7 – After the card (in this order, all below the card)

1. **Cancel button (only if your card has one):** a Condition on your button output, such as `Topic.actionSubmitId`. If it matches the cancel value: **Redirect** to Cancel JD Update, then **End current topic**.
2. **Other ticked but left blank:** a Condition on `"Other" in Topic.reasons && IsBlank(Topic.reasonsOther)`. Inside the True branch only, add a **Question**: "What's the other reason for this update?" Set it to User's entire response and save to `Topic.reasonsOther`. Leave All other conditions empty.
3. **Set `Global.UpdateReasons`:**

```
If(
  "Other" in Topic.reasons,
  Substitute(Topic.reasons, "Other", "Other: " & Topic.reasonsOther),
  Topic.reasons & If(IsBlank(Topic.reasonsOther), "", ". Notes: " & Topic.reasonsOther)
)
```

4. **Set `Global.CurrentStep`** to `1`.
5. **Set `Global.UpdateActive`** to `true`. It comes last, so the update only counts as started once everything is set.

### 4.9 Node 8 – Intake summary (new)

This is the first item in the spec's Expected Agent Output. Add a **Message**, inserting the values as formulas:

> **Intake summary**
>
> - Job: {Global.JobTitle}
> - Reasons: {Global.UpdateReasons}
> - Related levels for comparison: {If(IsBlank(Global.RelatedTitles), "none found", Global.RelatedTitles)}
>
> Let's start with Purpose.

### 4.10 Node 9 – Redirect

**Redirect** to Continue JD Update, with TargetSection left empty. Nothing comes after it.

## Step 5: The hub, Continue JD Update

The hub is the only topic that decides which section opens next. It applies a navigation request, opens the section for `Global.CurrentStep`, then advances or returns when the section ends, and loops until all 14 are done. Because every section is always reviewed and the steps run 1 to 14, it uses +1 and −1 instead of the v1 filters.

### 5.1 Trigger, description and input

1. Name the topic **Continue JD Update**. Set its trigger to **The agent chooses**.
2. Description:

> Moves the user through the job description update in progress. Use when the user wants to continue after a side question, go back to an earlier or previous section, or return from one. Also use when the user asks to skip a section, move on, or jump to a section such as purpose, duties, people leadership, sales, relationship manager, NMLS, education, work experience, licenses, knowledge, skills, abilities, title or other. This topic decides whether that is allowed. Do not use to start a new update.

3. Input **TargetSection**:
   - Type: the JD Section entity.
   - Filled by the agent; do not prompt the user.
   - Description: "The section the user wants to go to. Use Previous for going back, Next when the user asks to skip or move on, and Summary for reviewing changes. Leave empty when the user just wants to continue."

### 5.2 Nodes, in order

**Node 1 – No update in progress.** Condition: `Global.UpdateActive <> true`. If true: "There's no update in progress right now. Which job would you like to update?" Then **End current topic**.

**Node 2 – Working values.** Set these topic variables:

| Topic variable | Value |
| --- | --- |
| Topic.Target (String) | `Text(Topic.TargetSection)` |
| Topic.TargetStep (Number) | `LookUp(Global.AllSections, Name = Topic.Target).Step` |
| Topic.Furthest (Number) | `If(Global.ReturnStep <> 0, Global.ReturnStep, Global.CurrentStep)` |
| Topic.LastStep (Number) | `CountRows(Global.AllSections)` |

**Node 3 – Apply the request.** A Condition node runs the first branch that matches, so keep these branches in this order:

| Branch condition | Nodes inside the branch |
| --- | --- |
| `Topic.Target = "Previous"` | 1. **Condition** `Global.CurrentStep <= 1`. If true: "You're already on the first section." then **End current topic**. 2. Set `Global.ReturnStep` = `If(Global.ReturnStep = 0, Global.CurrentStep, Global.ReturnStep)`. 3. Set `Global.CurrentStep` = `If(Global.CurrentStep = 99, Topic.LastStep, Global.CurrentStep - 1)` |
| `Topic.Target = "Next"` | 1. **Condition** `Global.ReturnStep <> 0`. If true: set `Global.CurrentStep` = `Global.ReturnStep`, then set `Global.ReturnStep` = `0`. 2. All other conditions: "Sections are reviewed in order, so I can't skip ahead. To leave {LookUp(Global.AllSections, Step = Global.CurrentStep).Label} as it is, choose Keep As Is." Then **End current topic** |
| `Topic.Target = "Summary"` | **Redirect** to JD Final Review, then **End current topic** |
| `!IsBlank(Topic.TargetStep) && Topic.TargetStep > Topic.Furthest` | "We'll get to {LookUp(Global.AllSections, Step = Topic.TargetStep).Label} in order. Let's finish {LookUp(Global.AllSections, Step = Global.CurrentStep).Label} first." Then **End current topic** |
| `!IsBlank(Topic.TargetStep)` | 1. Set `Global.ReturnStep` with the detour formula (Step 3.5), T = `Topic.TargetStep`. 2. Set `Global.CurrentStep` = `Topic.TargetStep` |
| All other conditions | Leave empty |

The declining branches end with **End current topic**, not a redirect. Navigation requests arrive while a section question is paused, so ending the hub drops the user back on that same question.

**Node 4 – Dispatch** (rename the node **Dispatch**). Set `Topic.SectionName` = `LookUp(Global.AllSections, Step = Global.CurrentStep).Name`.

**Node 5 – All done?** Condition: `IsBlank(Topic.SectionName)`. If true: set `Global.CurrentStep` = `99`, **Redirect** to JD Final Review, then **End current topic**.

**Node 6 – Open the section.** One branch per section, each holding a single **Redirect**:

| Branch condition | Redirect to |
| --- | --- |
| `Topic.SectionName = "Purpose"` | JD Section – Purpose |
| `Topic.SectionName = "Duties"` | JD Section – Principal Duties |
| `Topic.SectionName = "PeopleLeadership"` | JD Section – People Leadership |
| `Topic.SectionName = "Sales"` | JD Section – Sales |
| `Topic.SectionName = "RM"` | JD Section – Relationship Manager |
| `Topic.SectionName = "NMLS"` | JD Section – NMLS |
| `Topic.SectionName = "Education"` | JD Section – Education |
| `Topic.SectionName = "Experience"` | JD Section – Work Experience |
| `Topic.SectionName = "Licenses"` | JD Section – Licenses and Certifications |
| `Topic.SectionName = "Knowledge"` | JD Section – Knowledge |
| `Topic.SectionName = "Skills"` | JD Section – Skills |
| `Topic.SectionName = "Abilities"` | JD Section – Abilities |
| `Topic.SectionName = "Title"` | JD Section – Title |
| `Topic.SectionName = "Other"` | JD Section – Other |

You can fill these in as each section topic is built.

**Node 7 – Advance or return** (below Node 6, where its branches rejoin):

- `Global.ReturnStep <> 0`: set `Global.CurrentStep` = `Global.ReturnStep`, then set `Global.ReturnStep` = `0`.
- All other conditions: set `Global.CurrentStep` = `If(Global.CurrentStep >= Topic.LastStep, 99, Global.CurrentStep + 1)`.

**Node 8 – Go to step → Dispatch.**

### 5.3 What the hub does in each case

- **Side question mid-section.** The hub never runs. The section's question pauses, the orchestrator answers, and the same question is asked again.
- **"Go back" in NMLS (step 6).** ReturnStep = 6 and RM (step 5) opens. When RM ends, the user goes straight back to NMLS.
- **"Go back to purpose" from Education (step 7).** Purpose opens. Steps 2 to 6 are not repeated, and the user returns to Education.
- **"Let's do Title" from Duties.** Declined. The paused Duties question is asked again.
- **"Skip this."** On a detour, this returns the user to where they were. Otherwise it is declined, with a pointer to Keep As Is.
- **"Go back" at the final review.** Other (step 14) opens, then the user returns to the final review.

## Step 6: The JD Section Reviewer prompt

One prompt drafts wording for every text section, Principal Duties, Title comments and Other requests. It also checks for related-role conflicts and non-ongoing content. Indicator sections (People Leadership, Sales, RM, NMLS) don't use it; their answers are decided by the spec's own questions.

### 6.1 Create or update the prompt

1. Go to **Tools → Add tool → New prompt** (or open your existing JD Section Reviewer).
2. Add eight text inputs:

| Input | Filled with |
| --- | --- |
| SectionName | The section label |
| JobTitle | `Global.JobTitle` |
| CurrentText | The current language (or the working draft, for duties) |
| RequestedChange | The manager's answer to "What changed?" |
| OngoingReason | The manager's answer to "Why is this an ongoing change to the position?" |
| UpdateReasons | `Global.UpdateReasons` |
| PreviousDraft | The last draft, when the manager chose Edit Revision (otherwise empty) |
| RelatedRoles | The same section from each related level (Step 7.4), or empty |

3. Paste the instructions below and map each `{Name}` to its input.
4. Paste your approved education and experience options where marked.
5. Set the output to **JSON**. Test with a real JD and save.

```
You are an HR job description reviewer at City National. A manager is updating ONE section of an existing job description. HR makes all final determinations. Your job is to draft clear wording for this one section and point out anything HR will need to review.

Job title: {JobTitle}
Section: {SectionName}
Current language: {CurrentText}
What the manager wants to change: {RequestedChange}
Why the manager says this is an ongoing change: {OngoingReason}
Reasons for the overall update: {UpdateReasons}
Earlier draft to build on (may be empty): {PreviousDraft}
The same section in related levels of this role (may be empty): {RelatedRoles}

Rules:
1. Draft only this section. Never rewrite other sections or the whole job description.
2. If an earlier draft is given, start from it. Keep the style, tense and format of the current language. Do not add anything the manager did not ask for.
3. Principal Duties: the current language is a numbered list, and the change starts with ADD, REMOVE or MODIFY. Apply only that change and return the full updated list, one item per line, numbered from 1.
4. Knowledge statements start with "Knowledge of", Skills with "Skill in", and Abilities with "Ability to". Keep them aligned to the job's purpose and responsibilities.
5. Education and Work Experience: keep equivalency language (for example "or an equivalent combination of education and experience") unless the manager explicitly asks to remove it. Use only these approved options: [PASTE APPROVED EDUCATION AND EXPERIENCE OPTIONS HERE]
6. Job descriptions cover ongoing responsibilities and minimum requirements only. If the change is a temporary project, an annual goal, an individual accomplishment, or a qualification specific to one employee, explain that in temporaryConcern and do not draft it.
7. Compare with the related levels. Related levels may intentionally share the same Purpose and core Responsibilities; that is not a conflict. Flag only real overlap or inconsistency, especially in education, experience, qualifications, scope of assignments, complexity and KSAs. Name the level and describe the conflict in relatedConcern. Never suggest changing another job description.
8. Never mention grade, salary, pay type, status or job code.

Flags: choose only from Related-role inconsistency, Education or experience overlap, Title or level overlap. Use None if none apply.

Return only JSON in exactly this shape:
{
  "proposedText": "the full proposed text for this section",
  "comments": "2 to 4 short comments for the manager, each on its own line starting with - ",
  "flags": "comma-separated flags from the list above, or None",
  "relatedConcern": "the conflict with a named related level, or an empty string",
  "temporaryConcern": "why this is not an ongoing requirement, or an empty string"
}
```

### 6.2 Test it before building topics

Run the prompt in the builder with these three cases. Each should behave as described.

| Case | Inputs to try | Expected |
| --- | --- | --- |
| Normal edit | Purpose, a real current Purpose, "mention vendor oversight" | proposedText changes only that; flags None |
| Related overlap | Education for a Level I, RequestedChange "require a master's degree", RelatedRoles holding a Level III that requires a bachelor's | relatedConcern names Level III; flags include Education or experience overlap |
| Not ongoing | Duties, "ADD: lead the 2026 system migration project" | temporaryConcern explains it's a temporary project; proposedText empty or unchanged |

## Step 7: Shared building blocks

Every section topic is assembled from the same eight blocks. Read this step once. Steps 8 to 13 then say which blocks each topic uses and in what order.

### 7.1 Rules for every question node in a section topic

- **Allow switching to another topic:** on. This is what lets side questions work.
- **Skip behavior:** Ask every time. Otherwise the orchestrator may answer a question for the user from earlier chat.
- **Section topics never redirect back to the hub.** They end with **End current topic**, and the hub advances.

### 7.2 Block A – Section settings and "show current first"

The first node of every section topic sets its values:

| Topic variable | Value |
| --- | --- |
| Topic.SectionName | The key, for example `"Purpose"` |
| Topic.Label | The label, for example `"Purpose"` |
| Topic.CurrentText | The field from `Global.JD`, for example `Global.JD.Purpose` |
| Topic.FixedFlag | The automatic HR flag from Step 1.2, or `""` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = Topic.SectionName).Proposed` |
| Topic.PreviousDraft | `Topic.Existing` |

Then a **Message** shows the current content first, which the spec requires before any decision:

> **{Topic.Label}** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})
>
> Current language: {Coalesce(Topic.CurrentText, "None listed.")}

Then a **Condition** `!IsBlank(Topic.Existing)`. If true, add a **Message**: "You've already requested this change: {Topic.Existing}"

### 7.3 Block B – Revision Confirmation

The spec's question is "What changed, and why is this an ongoing change to the position?" It is asked as two questions, so HR gets the reason as its own field.

1. **Question** (rename it **Ask change**): "What changed? You can paste new wording or describe the change." Set it to User's entire response, saved to `Topic.RequestedChange`.
2. **Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved to `Topic.Rationale`.
3. **Tool – JD Section Reviewer.** Pass SectionName = `Topic.Label`, JobTitle = `Global.JobTitle`, CurrentText = `Topic.CurrentText`, RequestedChange = `Topic.RequestedChange`, OngoingReason = `Topic.Rationale`, UpdateReasons = `Global.UpdateReasons`, PreviousDraft = `Topic.PreviousDraft` and RelatedRoles = `Topic.RelatedText` (Block C). Save the output to `Topic.Review`.
4. **Condition** `!IsBlank(Topic.Review.temporaryConcern)`. If true:
   - **Message:** "{Topic.Review.temporaryConcern} Job descriptions only cover ongoing responsibilities and minimum requirements."
   - **Question:** "Would you like to rephrase the change, or keep the current language?" Options: **Rephrase the change**, **Keep current language**.
   - Rephrase the change → **Go to step → Ask change**. Keep current language → **End current topic**.
5. **Message – the draft:**

> **Proposed {Topic.Label}:** {Topic.Review.proposedText}
>
> {Topic.Review.comments}

### 7.4 Block C – Related-Role Comparison

This applies only to sections where Compare is true: Purpose, Duties, Education, Work Experience, Licenses, Knowledge, Skills and Abilities.

**In Block A, add two variables.** `Topic.RelatedTable` holds the same section from each related level:

```
ForAll(Global.RelatedJDs, {
  Role: ThisRecord.Title,
  Text: Switch(Topic.SectionName,
    "Purpose", ThisRecord.Purpose,
    "Duties", ThisRecord.Duties,
    "Education", ThisRecord.Education,
    "Experience", ThisRecord.Experience,
    "Licenses", ThisRecord.Licenses,
    ThisRecord.KSA)
})
```

`Topic.RelatedText` flattens it for the prompt: `Concat(Topic.RelatedTable, Role & ": " & Text, Char(10) & Char(10))`.

**After the draft message (Block B, step 5), add a Condition** `CountRows(Global.RelatedJDs) > 0`. If true:

1. **Message:** "Here's how this compares with the related levels:"
2. **Message with an adaptive card** (a Send a message node, add Adaptive card, switch to Formula). It is display-only:

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

Every TextBlock uses the same fields, so the formula keeps one record shape. If the card won't save, or it is too cramped in Teams on a phone, use a plain message instead: `"**" & Global.JobTitle & " (proposed)**" & Char(10) & Topic.Review.proposedText & Char(10) & Char(10) & Topic.RelatedText`.

3. **Condition** `!IsBlank(Topic.Review.relatedConcern)`. If true, **Message:** "Possible conflict with a related level: {Topic.Review.relatedConcern} HR will review the related roles. No other job description will be changed."

### 7.5 Block D – HR review flags

Flags come from three places: the section's automatic flag, the prompt, and a related-role conflict. Right before saving, set `Topic.Flags`:

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

Indicator sections have no `Topic.Review`. For them, set `Topic.Flags` = `Topic.FixedFlag`.

### 7.6 Block E – Accept Revision, Edit Revision, Return to Current Language

Add a **Question** (rename it **Confirm**): "What would you like to do with this revision?" Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**. Save it to `Topic.Confirm`. Then a Condition on `Topic.Confirm`:

- **Edit Revision:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
- **Return to Current Language:** set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`. **Message:** "Keeping the current language for {Topic.Label}." Then **End current topic**.
- **Accept Revision:**
  1. **Condition** `Topic.StartedFor <> Global.RequestId`. If true, **End current topic** without saving. This means the job changed while this topic was paused.
  2. Block D (flags).
  3. Block F (save).
  4. Block G (Continue Review).

### 7.7 Block F – Save to the change log

Set `Global.ChangeLog` to:

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

Indicator, Title and Other topics use the same formula with their own values; each step shows them.

### 7.8 Block G – Continue Review

Add a **Question**: "Have you completed everything you wanted to update in this section?" Options: **Yes, proceed to the next section**, **No, remain in this section**.

- **Yes:** **End current topic**. The hub moves on.
- **No:** set `Topic.PreviousDraft` = the text you just saved. Then **Go to step** back to the section's change question (**Ask change** for text sections; each other step names its target).

This block runs after an accepted change. It is skipped after Keep As Is or Return to Current Language, because nothing was edited. See Decisions to confirm.

### 7.9 Block H – Revisiting a section that already has a change

When `Topic.Existing` is not blank, the section's first question is replaced by: "You've already requested a change here. What would you like to do?" Options: **Keep my change**, **Edit my change**, **Return to Current Language**.

- **Keep my change:** **End current topic**.
- **Edit my change:** go to the section's change question, with `Topic.PreviousDraft` already holding the change.
- **Return to Current Language:** as in Block E.

## Step 8: Text section topics

Seven sections share one template: Purpose, Education, Work Experience, Licenses and Certifications, Knowledge, Skills and Abilities. Build Purpose, test it end to end, and then copy it six times. Each copy changes only its settings.

### 8.1 Build JD Section – Purpose

1. Create a topic named **JD Section – Purpose**. Set its trigger to **It's redirected to**.
2. **Block A (Step 7.2):** set SectionName `"Purpose"`, Label `"Purpose"`, CurrentText `Global.JD.Purpose` and FixedFlag `""`, plus StartedFor, Existing and PreviousDraft. Add the Block C variables `Topic.RelatedTable` and `Topic.RelatedText` (Step 7.4). Add the "show current" message and the existing-change message.
3. **First question.** Add a Condition `IsBlank(Topic.Existing)`:
   - **True:** **Question** "Would you like to revise the Purpose section?" Options: **Keep As Is**, **Revise This Section**. Save to `Topic.Decision`.
   - **All other conditions:** the Block H question (Step 7.9), also saved to `Topic.Decision`.
4. **Condition on `Topic.Decision`** (below the first question, where the branches rejoin):
   - **Keep As Is:** **Message** "Keeping {Topic.Label} as is." Then **End current topic**.
   - **Keep my change:** **End current topic**.
   - **Return to Current Language:** set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> Topic.SectionName)`. **Message** "Keeping the current language for {Topic.Label}." Then **End current topic**.
   - **Revise This Section** or **Edit my change:** continue.
5. **Block B (Step 7.3):** the Ask change question, the Why ongoing question, the prompt, the temporary check, and the draft message.
6. **Block C (Step 7.4):** the comparison condition, card and conflict message.
7. **Block E (Step 7.6):** Accept Revision, Edit Revision or Return to Current Language. Accept runs Block D, then Block F, then Block G.
8. **Block G, No:** **Go to step → Ask change**. `Topic.PreviousDraft` holds the accepted text, so the next draft builds on it.

From top to bottom, the finished topic is:

1. Settings
2. Show current
3. Existing-change message
4. First question
5. Decision condition
6. Ask change
7. Why ongoing
8. Prompt
9. Temporary check
10. Draft
11. Comparison
12. Confirm
13. Flags
14. Save
15. Continue Review

### 8.2 Test Purpose before copying

Temporarily point the hub's Node 6 at Purpose only, or walk to it from a fresh update. Check that:

- the current Purpose shows before the question;
- Keep As Is moves on;
- Revise drafts wording, and Edit Revision builds on the draft;
- the comparison appears for a role with levels, and not for one without;
- "No, remain in this section" loops back;
- the change log has one Purpose row.

### 8.3 Copy it for the other six

1. Open JD Section – Purpose, select **… → Open code editor**, and copy the YAML.
2. Create a new topic, open its code editor, paste, and save.
3. Rename it, and check that the trigger is still **It's redirected to**.
4. Change only the settings node and the first question's text:

| Topic | SectionName | Label | CurrentText | FixedFlag | First question (from the spec) |
| --- | --- | --- | --- | --- | --- |
| JD Section – Education | Education | Education | Global.JD.Education | "" | Would you like to revise the education requirement or preference? |
| JD Section – Work Experience | Experience | Work Experience | Global.JD.Experience | "" | Would you like to revise the work experience requirement? |
| JD Section – Licenses and Certifications | Licenses | Licenses and Certifications | Global.JD.Licenses | "License or certification change" | Would you like to revise licenses, certifications, registrations, or professional designations? |
| JD Section – Knowledge | Knowledge | Knowledge | Global.JD.Knowledge | "" | Would you like to revise the Knowledge statements? |
| JD Section – Skills | Skills | Skills | Global.JD.Skills | "" | Would you like to revise the Skills statements? |
| JD Section – Abilities | Abilities | Abilities | Global.JD.Abilities | "" | Would you like to revise the Abilities statements? |

The options stay **Keep As Is** and **Revise This Section** for all six. Fill in each topic's Redirect branch in hub Node 6 as you finish it.

## Step 9: Principal Duties topic

Principal Duties works on a numbered list. The manager can add, remove or modify one responsibility at a time, and stays in the section until they are done. Each change is drafted by the same prompt, which returns the full updated list, so what the manager accepts is always the whole list.

### 9.1 Create the topic

Name it **JD Section – Principal Duties**, and set its trigger to **It's redirected to**.

### 9.2 Node 1 – Settings

These are Block A's values plus a working list and three running totals. The totals keep the reasons, comments and flags from every accepted change in this section.

| Topic variable | Value |
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
| Topic.RelatedTable, Topic.RelatedText | as in Step 7.4 |

The numbering formula turns the stored list into "1. …", "2. …" lines:

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

- If your environment rejects `With`, `Sequence` or `Index`, have the Get JD Details flow return the duties already numbered, and set `Topic.Working` to `Global.JD.Duties`.
- If your stored duties already start with bullets or numbers, remove them in the flow, so they aren't numbered twice.

### 9.3 Node 2 – Section header (shown once)

**Message:** "**Principal Duties and Responsibilities** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})"

### 9.4 Node 3 – Show the list (rename it **Show list**; the loop returns here)

**Message:** "Current responsibilities:" followed by `{Topic.Working}` on a new line. If `Topic.Existing` isn't blank, start the message with "Including the changes you've requested so far."

### 9.5 Node 4 – The action question (rename it **Action**)

Add a Condition `IsBlank(Topic.Existing)`. In each branch, add a question that saves to `Topic.Action`.

- **True (no changes yet):** "Would you like to revise any responsibilities?" Options: **No Changes**, **Add a Responsibility**, **Remove a Responsibility**, **Modify an Existing Responsibility**.
- **All other conditions:** "Would you like to make another change?" Options: **Keep my changes**, **Add a Responsibility**, **Remove a Responsibility**, **Modify an Existing Responsibility**, **Return to Current Language**.

### 9.6 Node 5 – Condition on Topic.Action

| Branch | Nodes |
| --- | --- |
| No Changes, or Keep my changes | **End current topic** |
| Return to Current Language | Set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> "Duties")`. **Message** "Keeping the current responsibilities." Then **End current topic** |
| Add a Responsibility | **Question** "What responsibility should be added?" (User's entire response) → `Topic.Detail`. Set `Topic.RequestedChange` = `"ADD: " & Topic.Detail` |
| Remove a Responsibility | **Question** "Which responsibility should be removed? Give its number." → `Topic.Detail`. Set `Topic.RequestedChange` = `"REMOVE item " & Topic.Detail` |
| Modify an Existing Responsibility | **Question** "Which responsibility number, and what should change?" → `Topic.Detail`. Set `Topic.RequestedChange` = `"MODIFY " & Topic.Detail` |

### 9.7 Node 6 – Why ongoing

**Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved to `Topic.Rationale`. Set `Topic.PreviousDraft` = `""`.

### 9.8 Node 7 – Draft (rename it **Draft**)

**Tool – JD Section Reviewer.** Pass:

- SectionName = `Topic.Label`
- CurrentText = `Topic.Working`
- RequestedChange = `Topic.RequestedChange`
- OngoingReason = `Topic.Rationale`
- PreviousDraft = `Topic.PreviousDraft`
- RelatedRoles = `Topic.RelatedText`
- JobTitle and UpdateReasons from the globals

Save the output to `Topic.Review`.

Then run the temporary check from Block B, step 4. Here, Rephrase the change goes to **Action**.

**Message:** "**Updated responsibilities:**" then `{Topic.Review.proposedText}`, a blank line, and `{Topic.Review.comments}`.

Then **Block C**, the comparison with related levels' duties.

### 9.9 Node 8 – Confirm

**Question:** "What would you like to do with this revision?" Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.

- **Edit Revision:**
  1. **Question** "What would you like to adjust?" → `Topic.Adjust`.
  2. Set `Topic.PreviousDraft` = `Topic.Review.proposedText`.
  3. Set `Topic.RequestedChange` = `Topic.RequestedChange & ". Adjustment: " & Topic.Adjust`.
  4. **Go to step → Draft**.
- **Return to Current Language:** **Message** "Discarded that change. The list stays as it was." Then **Go to step → Continue**. This discards only this draft; changes accepted earlier stay.
- **Accept Revision:**
  1. Stale guard: `Topic.StartedFor <> Global.RequestId` → **End current topic**.
  2. Set `Topic.Working` = `Topic.Review.proposedText`.
  3. Set `Topic.Existing` = `Topic.Working`.
  4. Block D, to set `Topic.Flags`.
  5. Set `Topic.RationaleAll` = `If(IsBlank(Topic.RationaleAll), "", Topic.RationaleAll & "; ") & Topic.Rationale`.
  6. Set `Topic.CommentsAll` = `If(IsBlank(Topic.CommentsAll), "", Topic.CommentsAll & Char(10)) & Topic.Review.comments`.
  7. Set `Topic.FlagsAll` = `If(IsBlank(Topic.FlagsAll), Topic.Flags, If(IsBlank(Topic.Flags), Topic.FlagsAll, Topic.FlagsAll & ", " & Topic.Flags))`.
  8. Save with Block F, using Original = `Topic.CurrentText`, Proposed = `Topic.Working`, Rationale = `Topic.RationaleAll`, Comments = `Topic.CommentsAll`, Flags = `Topic.FlagsAll`, RelatedConcern = `Topic.Review.relatedConcern`.

### 9.10 Node 9 – Continue Review (rename it **Continue**)

**Question:** "Have you completed everything you wanted to update in this section?" Options: **Yes, proceed to the next section**, **No, remain in this section**.

- **Yes:** **End current topic**.
- **No:** **Go to step → Show list**. The manager sees the updated list and gets the "make another change" options.

## Step 10: People Leadership topic

People Leadership is decided by the spec's questions, not drafted by the prompt. The questions depend on the current status: "This Position Manages People" or "Individual Contributor". Any change is flagged for HR as a people leadership or reporting structure change.

### 10.1 Create the topic

Name it **JD Section – People Leadership**, and set its trigger to **It's redirected to**.

### 10.2 Nodes, in order

**Node 1 – Settings (Block A without the comparison).**

| Topic variable | Value |
| --- | --- |
| Topic.SectionName | `"PeopleLeadership"` |
| Topic.Label | `"People Leadership"` |
| Topic.CurrentText | `Global.JD.PeopleLeadership` |
| Topic.FixedFlag | `"People leadership or reporting structure change"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "PeopleLeadership").Proposed` |
| Topic.Reports | `Blank()` |

**Node 2 – Show current.** **Message:** "**People Leadership** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})", then "Current status: {Topic.CurrentText}" on a new line. Add the existing-change message from Block A.

**Node 3 – First question.** Add a Condition `IsBlank(Topic.Existing)`, with a question in each branch saving to `Topic.Decision`:

- **True:** "Would you like to revise the current People Leadership information?" Options: **Keep As Is**, **Revise This Section**.
- **All other conditions:** the Block H question.

**Node 4 – Decision.** Same as the text sections (Step 8.1, item 4). Keep As Is and Keep my change end the topic. Return to Current Language removes the row and ends. Revise and Edit continue.

**Node 5 – Screening questions** (rename the node **Screen**). Add a Condition `"Manages People" in Topic.CurrentText`. Match this to the exact wording your list stores.

**Branch A – currently manages people:**

1. **Question** (Boolean): "Will this position continue to oversee two or more employees?" → `Topic.ContinuesToManage`.
2. If **Yes**:
   - **Question** (Identify: Number): "Please provide the exact number of direct reports." → `Topic.Reports`.
   - Set `Topic.NewValue` = `"This Position Manages People (" & Topic.Reports & " direct reports)"`.
3. If **No**: set `Topic.NewValue` = `"Individual Contributor"`. The spec doesn't define this branch; see Decisions to confirm.

**Branch B – currently an individual contributor (All other conditions):**

1. **Question** (Boolean): "Will this position now have direct reports?" → `Topic.NowHasReports`.
2. If **Yes**:
   - **Question** (Identify: Number): "Please provide the exact number of direct reports." → `Topic.Reports`.
   - Set `Topic.NewValue` = `"This Position Manages People (" & Topic.Reports & " direct reports)"`.
3. If **No**: set `Topic.NewValue` = `"Individual Contributor"`. The spec says to retain it.

**Node 6 – No change?** Condition: `Topic.NewValue = Topic.CurrentText`. This is true only when an individual contributor stays one. If true: **Message** "Based on your answers, People Leadership stays {Topic.CurrentText}. No change recorded." Then **End current topic**.

A manager who keeps managing does record a change, because the spec says to store the number of direct reports.

**Node 7 – Show the result.** **Message:** "This would record People Leadership as **{Topic.NewValue}** (currently {Topic.CurrentText}). HR will review any people leadership or reporting change."

**Node 8 – Why ongoing.** **Question:** "Why is this an ongoing change to the position?" Set it to User's entire response, saved to `Topic.Rationale`.

**Node 9 – Confirm.** **Question:** "What would you like to do with this revision?" Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.

- **Edit Revision:** set `Topic.Reports` = `Blank()`, then **Go to step → Screen**.
- **Return to Current Language:** remove the row (Block E), show the message, then **End current topic**.
- **Accept Revision:**
  1. Stale guard: `Topic.StartedFor <> Global.RequestId` → **End current topic**.
  2. Set `Topic.Flags` = `Topic.FixedFlag`.
  3. Save to `Global.ChangeLog`:

```
Table(
  Filter(Global.ChangeLog, Section <> Topic.SectionName),
  {
    Section: Topic.SectionName, Label: Topic.Label, Step: Global.CurrentStep,
    Kind: "Revision",
    Original: Topic.CurrentText, Proposed: Topic.NewValue,
    Rationale: Topic.Rationale, Comments: "",
    Flags: Topic.Flags, RelatedConcern: ""
  }
)
```

**Node 10 – Continue Review (Block G).** If **No, remain in this section**: **Go to step → Screen**.

## Step 11: Sales / Non-Sales, Relationship Manager and NMLS

These three are indicator sections with the same shape as People Leadership. Only the settings and the screening questions differ. Build them by copying the People Leadership topic's YAML (**… → Open code editor**). Then change Node 1, the first question's text and the Screen node. Every change here is flagged for HR automatically.

### 11.1 What changes in each copy

| Topic | SectionName | Label | CurrentText | FixedFlag | First question (from the spec) |
| --- | --- | --- | --- | --- | --- |
| JD Section – Sales | Sales | Sales / Non-Sales | Global.JD.Sales | "Sales change" | Would you like to revise the Sales / Non-Sales information? |
| JD Section – Relationship Manager | RM | Relationship Manager | Global.JD.RM | "RM or portfolio change" | Would you like to revise the Relationship Manager information? |
| JD Section – NMLS | NMLS | NMLS | Global.JD.NMLS | "NMLS change" | Would you like to revise the NMLS information? |

In each copy, also set `Topic.Existing` to look up its own section key.

### 11.2 Screen node – Sales / Non-Sales

The spec gives no screening questions for this section, so ask for the value directly:

1. **Question** (Multiple choice): "Should this role be Sales or Non-Sales?" Options: **Sales**, **Non-Sales**. Use the exact values your SharePoint column stores. Save to `Topic.NewValue`.

### 11.3 Screen node – Relationship Manager

These are the spec's two questions:

1. **Question** (Boolean): "Does this role serve as the primary point of contact for assigned customer, client, or business relationships?" → `Topic.RMContact`.
2. **Question** (Boolean): "Is the role responsible for managing an assigned portfolio, book of business, customer relationships, or client accounts?" → `Topic.RMPortfolio`.
3. Set `Topic.NewValue` = `If(Topic.RMContact Or Topic.RMPortfolio, "Yes", "No")`. Replace "Yes" and "No" with your column's values.

The spec says "if the answer is yes" without saying whether one yes or both are needed. `Or` means one yes makes the role an RM. See Decisions to confirm.

### 11.4 Screen node – NMLS

This is the spec's one question:

1. **Question** (Boolean): "Will this role discuss or negotiate residential mortgage loan terms, take applications, or otherwise perform duties that may require NMLS registration?" → `Topic.NMLSAnswer`.
2. Set `Topic.NewValue` = `If(Topic.NMLSAnswer, "Yes", "No")`, using your column's values.

### 11.5 The rest of each topic (unchanged from the copy)

- **No change?** Compare with `Lower(Trim(Topic.NewValue)) = Lower(Trim(Topic.CurrentText))`, so capitals and spacing don't count as a change. If true: "Based on your answers, {Topic.Label} stays {Topic.CurrentText}. No change recorded." Then **End current topic**.
- **Show the result:** "This would change {Topic.Label} from {Topic.CurrentText} to **{Topic.NewValue}**. HR will review this change."
- **Why ongoing, Confirm, save and Continue Review:** as in People Leadership (Step 10, Nodes 8 to 10). Edit Revision and "No, remain" both go to **Screen**.

## Step 12: Title topic

The Title section never changes the title itself. It records a title review request, adds guidance from the Governance Guide, and always flags the request for HR approval.

### 12.1 Create the topic

Name it **JD Section – Title**, and set its trigger to **It's redirected to**.

### 12.2 Nodes, in order

**Node 1 – Settings.**

| Topic variable | Value |
| --- | --- |
| Topic.SectionName | `"Title"` |
| Topic.Label | `"Title"` |
| Topic.CurrentText | `Global.JobTitle` |
| Topic.FixedFlag | `"Title review for HR approval"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Existing | `LookUp(Global.ChangeLog, Section = "Title").Proposed` |

**Node 2 – Show current.** **Message:** "**Title** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})", then "Current title: {Topic.CurrentText}". If `Global.RelatedTitles` isn't blank, add "Related levels: {Global.RelatedTitles}".

**Node 3 – First question.** Add a Condition `IsBlank(Topic.Existing)`, with a question in each branch saving to `Topic.Decision`:

- **True:** "Would you like to request a title review?" Options: **Keep Current Title**, **Request Title Review**.
- **All other conditions:** "You've already requested a title review ({Topic.Existing}). What would you like to do?" Options: **Keep my request**, **Edit my request**, **Return to Current Language**.

**Node 4 – Decision.**

- **Keep Current Title** or **Keep my request:** **End current topic**.
- **Return to Current Language:** remove the row, then "Keeping the current title." Then **End current topic**.
- **Request Title Review** or **Edit my request:** continue.

**Node 5 – Proposed title** (rename it **Ask title**). **Question:** "What title would you propose? If you're not sure, say so and HR will recommend one." Set it to User's entire response, saved to `Topic.ProposedTitle`.

**Node 6 – Why ongoing.** **Question:** "Why is this an ongoing change to the position?" → `Topic.Rationale`.

**Node 7 – Governance Guide guidance.** Add **Advanced → Generative answers** (Create generative answers).

- **Input** (as a formula): `"Using the Governance Guide, what should HR consider when reviewing a title change from " & Topic.CurrentText & " to " & Topic.ProposedTitle & "? Note any title or level overlap with these related roles: " & Coalesce(Global.RelatedTitles, "none") & ". Do not make a final determination."`
- **Data sources:** open the node's properties, choose to search only selected sources, and select **Governance Guide** only.
- Turn off **Send a message**, and save the response to `Topic.Guidance`.

**Node 8 – Message.** "Here's what the Governance Guide says HR will look at: {Topic.Guidance}" Then, on a new line: "HR makes the final title and level determination. I'll flag this request for HR approval."

**Node 9 – Overlap check.** Set two variables:

- `Topic.Overlap` = `!IsBlank(Global.RelatedTitles) && Lower(Trim(Topic.ProposedTitle)) in Lower(Global.RelatedTitles)`. This is true when the proposed title matches a related level.
- `Topic.Flags` = `Topic.FixedFlag & If(Topic.Overlap, ", Title or level overlap", "")`.

**Node 10 – Confirm.** **Question:** "What would you like to do with this request?" Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.

- **Edit Revision:** **Go to step → Ask title**.
- **Return to Current Language:** as in Node 4.
- **Accept Revision:**
  1. Stale guard.
  2. Save to `Global.ChangeLog`:

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

**Node 11 – Continue Review (Block G).** If **No, remain in this section**: **Go to step → Ask title**.

## Step 13: Other topic

Other captures any ongoing section or requirement that isn't one of the first 13. The prompt screens out what the spec excludes: temporary projects, annual goals, individual accomplishments and employee-specific qualifications. A manager can add several requests. They are kept together in one Other row, and all go to HR as items for HR to determine.

### 13.1 Create the topic

Name it **JD Section – Other**, and set its trigger to **It's redirected to**.

### 13.2 Nodes, in order

**Node 1 – Settings.**

| Topic variable | Value |
| --- | --- |
| Topic.SectionName | `"Other"` |
| Topic.Label | `"Other Requirements"` |
| Topic.FixedFlag | `"Other requirement for HR review"` |
| Topic.StartedFor | `Global.RequestId` |
| Topic.Requests | `LookUp(Global.ChangeLog, Section = "Other").Proposed` |
| Topic.RationaleAll | `LookUp(Global.ChangeLog, Section = "Other").Rationale` |

**Node 2 – Header.** "**Other Requirements** (section {Global.CurrentStep} of {CountRows(Global.AllSections)})". If `Topic.Requests` isn't blank, add "Requests so far:" and `{Topic.Requests}`.

**Node 3 – The spec's question** (rename it **Ask other**). Add a Condition `IsBlank(Topic.Requests)`, with a question in each branch saving to `Topic.Decision`:

- **True:** "Is there another ongoing section or job requirement you want to review?" Options: **Yes**, **No**.
- **All other conditions:** the same question with options **Yes**, **No**, **Remove my requests**.

Then a Condition on `Topic.Decision`:

- **No:** **End current topic**.
- **Remove my requests:** set `Global.ChangeLog` = `Filter(Global.ChangeLog, Section <> "Other")`, and set `Topic.Requests` = `""`. **Message** "Removed your other requests." Then **End current topic**.
- **Yes:** continue.

**Node 4 – Describe it** (rename it **Ask change**). **Question:** "Describe the section or requirement, and what it should say." Set it to User's entire response, saved to `Topic.RequestedChange`.

**Node 5 – Why ongoing.** **Question:** "Why is this an ongoing change to the position?" → `Topic.Rationale`.

**Node 6 – Prompt.** **JD Section Reviewer** with:

- SectionName = `"Other requirement (not one of the standard sections)"`
- CurrentText = `""`
- RequestedChange = `Topic.RequestedChange`
- OngoingReason = `Topic.Rationale`
- PreviousDraft = `Topic.PreviousDraft`
- RelatedRoles = `""`

Save the output to `Topic.Review`.

**Node 7 – Exclusion check.** Condition `!IsBlank(Topic.Review.temporaryConcern)`. If true:

1. **Message:** "{Topic.Review.temporaryConcern} Job descriptions don't include temporary projects, annual goals, individual accomplishments or employee-specific qualifications."
2. **Question:** "Would you like to rephrase it, or skip it?" Options: **Rephrase it**, **Skip it**.
   - Rephrase it → **Go to step → Ask change**.
   - Skip it → **Go to step → Ask other**.

**Node 8 – Draft.** "**Proposed requirement:** {Topic.Review.proposedText}", then `{Topic.Review.comments}`.

**Node 9 – Confirm.** **Question:** "What would you like to do with this revision?" Options: **Accept Revision**, **Edit Revision**, **Return to Current Language**.

- **Edit Revision:** set `Topic.PreviousDraft` = `Topic.Review.proposedText`, then **Go to step → Ask change**.
- **Return to Current Language:** **Message** "Discarded that request." Then **Go to step → Ask other**.
- **Accept Revision:**
  1. Stale guard.
  2. Set `Topic.Requests` = `If(IsBlank(Topic.Requests), "", Topic.Requests & Char(10)) & "- " & Topic.Review.proposedText`.
  3. Set `Topic.RationaleAll` = `If(IsBlank(Topic.RationaleAll), "", Topic.RationaleAll & "; ") & Topic.Rationale`.
  4. Set `Topic.PreviousDraft` = `""`.
  5. Save to `Global.ChangeLog`:

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

After saving, **Go to step → Ask other**.

For this section, the spec's own question ("Is there another…?") takes the place of Continue Review, so Block G isn't added. Asking both would repeat the same question.

## Step 14: Final review, confirmation and submit

The **JD Final Review** topic replaces v1's Review JD Changes. It opens automatically after section 14, and also mid-review when a manager asks to see their changes. It shows the five groups the spec lists, lets the manager edit a revised section or review an unchanged one, and submits only after the Manager Confirmation.

### 14.1 Trigger and description

1. Name the topic **JD Final Review**. Set its trigger to **The agent chooses** (the hub also redirects here).
2. Description:

> Shows the consolidated review of the job description update in progress: revised sections, unchanged sections, related-role concerns, unresolved items and HR review flags. Use when the user asks to see their changes or a summary, wants to edit a revised section or review an unchanged section, or is ready to approve and submit.

### 14.2 Nodes 1 and 2 – Guard and working value

**Node 1.** Condition `Global.UpdateActive <> true` → "There's no update in progress right now." Then **End current topic**.

**Node 2.** Set `Topic.Furthest` = `If(Global.CurrentStep = 99, 100, If(Global.ReturnStep <> 0, Global.ReturnStep, Global.CurrentStep))`. The value 100 means "everything reached" at the end.

### 14.3 Node 3 – The consolidated review (rename the first message **Show review**)

Use one Message node per group, each inserted as a formula. The spec asks for the groups to be kept separate.

**Header:**

```
"**Update summary for " & Global.JobTitle & "**" & Char(10) & "Reasons: " & Global.UpdateReasons &
If(Global.CurrentStep <> 99, Char(10) & "_This is a summary so far. You're partway through the review._", "")
```

**Revised sections:**

```
"**Revised sections**" & Char(10) &
If(CountRows(Filter(Global.ChangeLog, Kind = "Revision")) = 0, "None",
  Concat(Sort(Filter(Global.ChangeLog, Kind = "Revision"), Step),
    "- **" & Label & ":** " & Proposed & Char(10) & "  Why: " & Rationale, Char(10)))
```

**Unchanged sections:**

```
"**Unchanged sections**" & Char(10) &
Coalesce(
  Concat(Filter(Global.AllSections, Step < Topic.Furthest && !(Name in Global.ChangeLog.Section) && Name <> "Other"), Label, ", "),
  "None")
```

**Related-role concerns:**

```
"**Related-role concerns**" & Char(10) &
Coalesce(Concat(Filter(Global.ChangeLog, !IsBlank(RelatedConcern)), "- " & Label & ": " & RelatedConcern, Char(10)), "None")
```

**Unresolved items** (requests HR must decide, plus sections not yet reviewed):

```
"**Unresolved items**" & Char(10) &
Coalesce(
  Concat(Filter(Global.ChangeLog, Kind = "Title review" Or Kind = "Other request"), "- " & Label & ": " & Proposed, Char(10)) &
  If(Global.CurrentStep <> 99, Char(10) & "- Not yet reviewed: " & Concat(Filter(Global.AllSections, Step >= Topic.Furthest), Label, ", "), ""),
  "None")
```

**HR review flags:**

```
"**HR review flags**" & Char(10) &
Coalesce(Concat(Filter(Global.ChangeLog, !IsBlank(Flags)), "- " & Label & ": " & Flags, Char(10)), "None")
```

### 14.4 Node 4 – The review card (rename it **Review card**)

Add **Ask with adaptive card** and switch it to **Formula**. The spec's three options are buttons. Approve and Submit only appears once all 14 sections are done, and Keep reviewing only appears mid-review.

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

- **Edit schema:** outputs `action`, `req`, `revisedSection` and `unchangedSection`, all strings.
- **Properties:** turn on **Allow switching to another topic**.

### 14.5 Node 5 – Branches on the card

First add a **Condition** `Topic.req <> Global.RequestId` → "That card is from an earlier update." Then **Go to step → Show review**. Then add a Condition on `Topic.action`:

| Branch | Nodes |
| --- | --- |
| `"approve"` | 1. Condition `Global.CurrentStep <> 99` → "You can submit once all 14 sections are reviewed." Then **Go to step → Review card**. 2. Condition `CountRows(Global.ChangeLog) = 0` → "No changes were requested, so there's nothing to send to HR. Choose a section to review, or say cancel to close this update." Then **Go to step → Review card**. 3. Continue to 14.6. |
| `"editRevised"` | 1. Condition `IsBlank(Topic.revisedSection)` → "Pick a revised section first." Then **Go to step → Review card**. 2. Set `Topic.T` = `LookUp(Global.AllSections, Name = Topic.revisedSection).Step`. 3. Set `Global.ReturnStep` with the detour formula (Step 3.5). 4. Set `Global.CurrentStep` = `Topic.T`. 5. **Redirect** to Continue JD Update, then **End current topic**. |
| `"reviewUnchanged"` | The same as editRevised, using `Topic.unchangedSection`. Add one extra first check: `Topic.T >= Topic.Furthest` → "You haven't reached that section yet." Then **Go to step → Review card**. |
| `"continue"` | "Back to {LookUp(Global.AllSections, Step = Global.CurrentStep).Label}." Then **Redirect** to Continue JD Update, then **End current topic**. |

A section opened from here returns to this review afterwards, because the detour formula saves `ReturnStep` = 99 when the review is at the end.

### 14.6 Node 6 – Manager Confirmation (rename it **Attest**)

**Question:** "Please confirm: I confirm that the revised job description reflects the ongoing responsibilities and minimum requirements of the position." Options: **Confirm**, **Return for Editing**. Save to `Topic.Attest`. Turn on **Allow switching**, and set Skip behavior to **Ask every time**.

- **Return for Editing:** **Go to step → Show review**.
- **Confirm:**
  1. **Add a tool → Submit JD Update Request** (14.7), with ChangesJson = `JSON(Global.ChangeLog)` and the other inputs from the globals. Save the output to `Topic.Result`.
  2. **Condition** `Topic.Result <> "OK"` → "Something went wrong sending this to HR. Let's try again." Then **Go to step → Attest**.
  3. **Message:** "Submitted. Your requested changes for {Global.JobTitle} are with HR for review."
  4. **Reset** the update (Step 15.3).
  5. **End all topics.** This clears paused section topics, so none of them resurface.

The spec's rule "do not submit until the manager confirms" holds, because the only path to the submit flow runs through Confirm.

### 14.7 The Submit JD Update Request flow

1. **Create a SharePoint list, JD Update Requests,** with these columns:
   - RequestId, JobCode, JobTitle
   - UpdateReasons, RelatedRoles
   - Section, Kind
   - Original, Proposed, Rationale, Comments (all multiple lines)
   - Flags, RelatedConcern (multiple lines)
   - ManagerConfirmed (yes/no), SubmittedBy
2. **Create an agent flow** with text inputs RequestId, JobCode, JobTitle, UpdateReasons, RelatedRoles and ChangesJson.
3. **Parse JSON** on ChangesJson. Generate the schema from a test run's value.
4. **Apply to each** over the parsed array → **Create item**, with ManagerConfirmed = Yes and SubmittedBy = the flow's run-as user or the user's email.
5. **Respond to the agent** with `Result` = "OK".

Unchanged sections aren't stored, because they are the sections with no row. The HR report and email stay a separate flow, as planned.

## Step 15: Switch JD Job and Cancel JD Update

Both topics discard the update after a warning, reset the same variables, and end with **End all topics**. That last node clears paused section topics, so an old question can't come back for the wrong job.

### 15.1 Switch JD Job (update your existing topic)

- **Trigger:** The agent chooses.
- **Description:** "Use when the user wants to update a different job than the one they are working on. Do not use when the user only wants to look at or compare another job's description without switching."
- **Input:** NewJob (String), filled by the agent: "The title of the job the user wants to switch to, if they said one."

Nodes:

1. **Condition** `Global.UpdateActive = true && CountRows(Global.ChangeLog) > 0`. If true, ask a **Question** (Boolean): "You have {CountRows(Global.ChangeLog)} requested change(s) for {Global.JobTitle} that haven't been sent. Switching jobs will discard them. Switch anyway?"
   - **No:** "Okay, we'll keep working on {Global.JobTitle}." Then **Redirect** to Continue JD Update, then **End current topic**.
2. **Reset** (15.3).
3. **Message:** "Okay, I've cleared that update. Which job would you like to update instead?" If `Topic.NewJob` isn't blank, use: "Okay, I've cleared that update. Say 'update {Topic.NewJob}' and I'll find it."
4. **End all topics.**

### 15.2 Cancel JD Update (new topic)

- **Trigger:** The agent chooses.
- **Description:** "Use when the user wants to cancel, stop, quit or abandon the job description update. Not for going back to a section or switching to a different job."

Nodes:

1. Set `Topic.OldTitle` = `Global.JobTitle`, so the message can still name the job after the reset.
2. **Condition** `CountRows(Global.ChangeLog) > 0`. If true, ask a **Question** (Boolean): "You have {CountRows(Global.ChangeLog)} requested change(s) that haven't been sent. Cancel anyway?"
   - **No:** "Okay, let's keep going." Then **Redirect** to Continue JD Update, then **End current topic**.
3. **Reset** (15.3).
4. **Message:** "Okay, I've cancelled the update for {Topic.OldTitle}. Nothing was sent to HR."
5. **End all topics.**

Initialize's Node 5b redirects here when the manager says cancel at the ready question. At that point the change log is empty, so there's no warning; the topic just confirms and closes.

### 15.3 The reset block

This is used by submit (Step 14.6), Switch JD Job and Cancel JD Update. Add one Set a variable value node per row:

| Variable | Value |
| --- | --- |
| Global.UpdateActive | `false` |
| Global.ChangeLog | `Filter(Global.ChangeLog, false)` |
| Global.CurrentStep | `0` |
| Global.ReturnStep | `0` |
| Global.UpdateReasons | `""` |
| Global.RequestId | `Blank()` |
| Global.JobCode | `Blank()` |
| Global.JobTitle | `Blank()` |
| Global.JD | `Blank()` |
| Global.RelatedJDs | `Filter(Global.RelatedJDs, false)` |
| Global.RelatedTitles | `""` |

`Filter(…, false)` empties a table but keeps its columns, so later formulas still work.

## Step 16: Agent instructions and topic descriptions

The instructions and the topic descriptions decide which topic the orchestrator picks, and whether a side question stays a side question. Replace the JD update block in your instructions with this one.

### 16.1 Agent instructions

```
Job description updates
- Updating a job description is a guided review, started and finished in one conversation. First find the job with the job search tool. When the user picks a job and wants to update it, use Initialize JD Update with that job's code and title.
- The review walks 14 sections in a fixed order: Purpose, Principal Duties and Responsibilities, People Leadership, Sales / Non-Sales, Relationship Manager, NMLS, Education, Work Experience, Licenses and Certifications, Knowledge, Skills, Abilities, Title, Other. Users can go back to sections they have already reached, but cannot skip ahead, and can submit only after all 14 are reviewed.
- While an update is in progress, never start a new update. To go back, return from an earlier section, or carry on after a side question, use Continue JD Update. If the user asks to skip or jump ahead, also use Continue JD Update; it explains that sections are reviewed in order. Never skip sections yourself.
- To see changes, edit a revised section, review an unchanged section, or approve and submit, use JD Final Review. To update a different job, use Switch JD Job. To stop, use Cancel JD Update.
- If the user asks a question during an update, answer it briefly and do not restart or leave the update. The review picks up at the same step after your answer. Explain job description concepts only when the user asks or clearly needs it.
- Looking at or comparing another job's description during an update is a side question, not a switch. Never change another job description.
- For title and level questions, use the Governance Guide and leave final determinations to HR.
- There are no saved drafts. If the user asks to save and finish later, explain that the update must be finished and submitted in this conversation, and offer to keep going.
- Never show job code, grade, status or salary/hourly.
- Never regenerate or write out the entire job description. Work one section at a time and summarize only the requested changes.
```

### 16.2 Which topics the orchestrator can pick

Only these five topics should use **The agent chooses**. All 14 section topics must use **It's redirected to**.

| Topic | Should fire on | Should not fire on |
| --- | --- | --- |
| Initialize JD Update | "I want to update the Loan Officer JD", after the job is found | "continue", "go back" |
| Continue JD Update | "continue", "go back", "go back to education", and also "skip this" or "let's do NMLS" (it declines forward moves) | "update a different job", "cancel" |
| JD Final Review | "what have I changed?", "show my summary", "I'm ready to submit" | a question about what a section means |
| Switch JD Job | "I want to update a different job instead" | "what does the Senior Analyst JD say?" |
| Cancel JD Update | "cancel this", "stop the update", "never mind, quit" | "go back", "switch jobs" |

If a topic fires on the wrong phrase in testing, add a "Do not use when…" sentence to its description. That usually works better than adding more "use when" phrases.

## Step 17: Test script

Run each case in the test pane from a fresh conversation, with the activity map open. Use one role that has related levels and one that doesn't. Tick each case off as it passes.

### Spec acceptance tests (update path)

- [ ] **Reasons checklist.** The update starts with the Reason for Update card, and multiple selections work.
- [ ] **Current content first.** Every section shows its current language before asking keep or revise.
- [ ] **Sales, RM, portfolio and NMLS.** Each is captured with the spec's simple questions, and each change is flagged for HR.
- [ ] **Education and experience.** A revision keeps equivalency language and uses only the approved options.
- [ ] **KSAs.** Knowledge, Skills and Abilities are reviewed in that order; drafts start "Knowledge of", "Skill in", "Ability to" and fit the Purpose and duties.
- [ ] **Related levels.** For a role with levels, a revision shows the side-by-side comparison before it is accepted. An overlap is raised as a related-role concern and a Job Architecture review flag.
- [ ] **No full regeneration.** After one change, only that section is drafted; the whole job description is never written out.
- [ ] **Title.** Requesting a title review uses the Governance Guide, says HR decides, and flags it for HR approval.

The spec's "new-position conversation" test belongs to the Create feature, not this update path.

### Section behavior

- [ ] **Text section: edit loop.** Revise Purpose, choose Edit Revision, then give a second instruction. Expect: the second draft builds on the first.
- [ ] **Text section: return.** Revise Education, then choose Return to Current Language. Expect: no Education row in the summary.
- [ ] **Continue Review.** After accepting a change, answer "No, remain in this section". Expect: the change question again, building on what you accepted.
- [ ] **Duties.** Add one responsibility, remove one, and modify one, staying in the section between each. Expect: a renumbered full list each time, and one Duties row holding the final list.
- [ ] **People Leadership, manager keeps managing.** Answer Yes, then 5. Expect: "This Position Manages People (5 direct reports)", flagged.
- [ ] **People Leadership, individual contributor stays one.** Answer No. Expect: "No change recorded."
- [ ] **People Leadership, individual contributor gains reports.** Answer Yes, then 3. Expect: a change to Manages People, flagged.
- [ ] **RM.** Answer No and No. Expect: "No". Then answer Yes to one question. Expect: "Yes", flagged.
- [ ] **NMLS.** Answer Yes. Expect: a change to Yes, flagged.
- [ ] **Other: excluded item.** Enter "lead the 2026 migration project". Expect: the exclusion message, and a choice to rephrase or skip.
- [ ] **Other: two requests.** Add two ongoing requirements. Expect: both listed in one Other row.

### Side questions

- [ ] **At the ready question.** Ask "what's an upscale?" Expect: an answer, then the ready question again.
- [ ] **At the reasons card.** Ask a question. Expect: an answer, then the card again.
- [ ] **Mid-section.** At Keep As Is / Revise, ask a question. Expect: an answer, then the same question.
- [ ] **Mid-revision.** At Accept / Edit / Return, ask a question. Expect: an answer, and the draft still in place.
- [ ] **Compare another job.** Mid-section, ask about another job's JD. Expect: an answer, and the same job still being updated.

### Navigation

- [ ] **Go back one.** In NMLS, say "go back". Expect: Relationship Manager, then straight back to NMLS.
- [ ] **Go back several.** In Education, say "go back to purpose". Expect: Purpose, then straight back to Education.
- [ ] **From the first section.** In Purpose, say "go back". Expect: "You're already on the first section."
- [ ] **Skip blocked.** In Duties, say "skip this". Expect: the in-order message, then the same Duties question.
- [ ] **Jump ahead blocked.** In Duties, say "let's do Title". Expect: "We'll get to Title in order…"
- [ ] **Skip on a detour.** Go back to Purpose, then say "skip". Expect: straight back to where you came from.
- [ ] **Restart attempt.** Mid-review, say "update this job description". Expect: "Let's continue", and the same section.

### Final review and submit

- [ ] **Five groups.** After Other, the review shows revised sections, unchanged sections, related-role concerns, unresolved items and HR flags.
- [ ] **Edit a revised section.** It opens only that section, then returns to the review.
- [ ] **Review an unchanged section.** The same behavior.
- [ ] **Mid-review summary.** Say "show my changes" in section 5. Expect: no Approve button, only sections 1 to 4 in the lists, and Keep reviewing returns to section 5.
- [ ] **Return for Editing.** At Manager Confirmation, choose Return for Editing. Expect: the review again, with nothing submitted.
- [ ] **Confirm.** Expect: one SharePoint row per changed section, all sharing one RequestId, with ManagerConfirmed = Yes.

### Switch, cancel and single session

- [ ] **Switch jobs.** With changes pending, answer No. Expect: the review continues. Answer Yes. Expect: you're asked which job, and old questions never come back.
- [ ] **Cancel at the ready question.** Expect: "Nothing was sent to HR."
- [ ] **Cancel mid-review.** Expect: the warning about unsent changes first.
- [ ] **Save for later.** Ask to finish tomorrow. Expect: an explanation that it must be finished now; no draft is saved.
- [ ] **Hidden fields.** Job code, grade, status and salary/hourly never appear anywhere.

## Troubleshooting

Most problems come from one of four things:

- a question node with interruptions off;
- a section topic with the wrong trigger;
- a missing **End all topics**;
- a table formula whose columns don't match the empty table it started from.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A typed question gets "I didn't understand" or a re-prompt | Allow switching is off on that question or card | Properties → Allow switching to another topic |
| The orchestrator answers a section question for the user | Skip behavior allows skipping | Set Skip behavior to Ask every time (Step 7.1) |
| A section opens with blank content | The section topic's trigger is The agent chooses, or its Global.JD field name is wrong | Use It's redirected to; check the key in the Node 4 record |
| Knowledge, Skills or Abilities is empty | The KSA split didn't match the headings | Test Option A on real JDs, or switch to Option B (Step 2.2) |
| No comparison ever appears | Get Related JDs returns nothing, or Parse value failed | Test the flow with a role that has levels; reset the Parse value sample |
| The comparison card won't save | Mixed record shapes in the card formula | Keep every TextBlock's fields identical, or use the plain-message fallback (Step 7.4) |
| Prompt fields come back blank | The prompt output is text, not JSON | Set the output to JSON and re-map |
| Duties show "1. 1." | The stored list already had numbers | Strip numbering in the flow (Step 9.2) |
| People Leadership always says no change | The status text doesn't match the condition | Match `"Manages People" in Topic.CurrentText` to your stored wording |
| RM or NMLS records a change when nothing changed | Stored value and new value differ in wording | Use your column's exact values in the Screen node |
| The user can jump ahead | The "past the furthest step" branch sits below the allowed branch | Move it above it in hub Node 3 |
| "Skip this" moves on | The Next branch advances when not on a detour | Only move when ReturnStep isn't 0 |
| After going back, the user redoes every section in between | ReturnStep isn't set, or Node 7 ignores it | Use the detour formula; check Node 7's first branch |
| A section appears twice after a detour | ReturnStep was never cleared | The detour formula's first check (Step 3.5) |
| Approve and Submit appears mid-review | The card's actions don't switch on CurrentStep | Use the `If(Global.CurrentStep = 99, …)` actions formula (Step 14.4) |
| An old question pops up after submit, switch or cancel | End all topics is missing | Add it as the last node |
| The change log formula errors | Columns or types differ from Step 3.3 | Match all ten columns; Step is a number, everything else text |
| A global is blank in another topic | It was created with topic scope | Variable properties → Usage → Global |
| The agent offers to save a draft | The no-drafts line is missing from the instructions | Add it from Step 16.1 |

## Decisions to confirm with your manager

The spec leaves ten points open. The guide makes a reasonable choice for each, listed here, so you can build now and adjust one node later if your manager answers differently.

| Open point | What the guide does now | Where to change it |
| --- | --- | --- |
| People Leadership: a manager's position answers No to "two or more employees" | Sets it to Individual Contributor | Step 10, Branch A, item 3 |
| People Leadership: an individual contributor gains exactly one report | Records Manages People, because the spec's IC branch has no minimum | Step 10, Branch B |
| Relationship Manager: one Yes or both Yes | One Yes makes the role an RM (`Or`) | Step 11.3, item 3 |
| Sales / Non-Sales: any screening questions | Asks for the value directly | Step 11.2 |
| Continue Review after Keep As Is | Asked only after an accepted change | Step 7.8 |
| Order of Step 2 (reasons) and Step 3 (explanation) | Explanation first, then the reasons card, as you built it | Step 4.5 |
| What counts as an "unresolved item" | Title review requests, Other requests, and sections not yet reviewed | Step 14.3 |
| Knowledge, Skills and Abilities as separate submitted rows | Three rows, one per part | Step 14.7 |
| The approved education and experience options | A placeholder in the prompt; the list is needed | Step 6.1, rule 5 |
| Submitting when nothing changed | Blocked; the manager can cancel instead | Step 14.5, approve branch |
