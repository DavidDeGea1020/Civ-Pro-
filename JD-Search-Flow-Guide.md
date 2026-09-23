# Job Description Search: Build Guide

A step-by-step guide to building a search tool that lets a Copilot Studio agent find job descriptions from either a job title or a plain-language description of the role. When several jobs match, the agent shows a dropdown so the user can pick one. The selected job's Job Code then goes to **Get JD Details**.

---

## How it works

```
User types a title or describes a job
        │
        ▼
Copilot Studio topic ──► Flow: "Search Job Descriptions"
                              │
                              ├─ Title search (MatchJobTitle, fuzzy)
                              │     └─ weak or no result in Auto mode? ─┐
                              │                                         ▼
                              ├─ Description search (SearchJobDescriptions script)
                              │
                              └─ Returns: status (single / multiple / none),
                                          count, matchesJson, source
        │
        ▼
Topic branches on status
  single   → use the match
  multiple → adaptive card dropdown (Job Code is the hidden value)
  none     → ask the user to rephrase (limited retries)
        │
        ▼
Get JD Details (Job Code) → show only the fields users are allowed to see
```

Design rules this build follows:

- **One output shape for every search mode.** Each match is `{ jobCode, jobTitle, score, matchedTerms }`, so the topic never needs to know which search ran.
- **Job Code is the key between flows** and is never shown to users. Grade, Status, and Salary/Hourly are never shown either.
- **Auto mode is the default.** Users don't have to say whether they're typing a title or a description.

---

## Phase 0: Before you start

Gather the following before you build anything.

| Item | What you need |
|---|---|
| SharePoint site and JD list | Site URL and list name, in the environment you're building in (DEV) |
| Internal column names | The internal names (not display names) for Job Code, Job Title, Purpose, Principal Duties, KSAs, Education, Work Experience, and Status. To find one, go to List settings, click the column, and read the `Field=` value at the end of the URL. |
| Active status value | The exact text your Status column uses for live JDs (for example, `Active`) |
| MatchJobTitle | Its input parameters, the name of the array it returns, the field names inside that array, and its score scale (0–1 or 0–100) |
| Get JD Details | Confirm it accepts Job Code as its input |
| Solution | The solution in DEV that holds your JD flows and the JD Expert agent |

Write down the internal column names. Every `<InternalName>` placeholder in this guide is where one of them goes.

---

## Phase 1: Set up the Office Script

### Step 1.1: Choose where the script lives

You have two options.

- **Option A: Run script (OneDrive).** The script is saved in the flow connection owner's OneDrive under `Documents/Office Scripts`. This is quick to set up but tied to one person's account.
- **Option B: Run script from SharePoint library.** The `.osts` script file is stored in a SharePoint document library. This is the better choice for DEV/UAT/QA, because each environment can point to its own library and the script isn't tied to a personal account.

Use **Option B** if you plan to promote this through environments. Use whichever option MatchJobTitle already uses if you want the two to stay consistent.

### Step 1.2: Create a host workbook

Office Scripts need a workbook to run against, even though this script never reads the sheet.

1. In the SharePoint site's document library, create a new blank Excel workbook named `JD Search Scripts.xlsx`.
2. Leave it empty. The script gets all its data from the flow.

If MatchJobTitle already runs against a host workbook, you can reuse that one.

### Step 1.3: Create the script

1. Open `JD Search Scripts.xlsx` in Excel for the web.
2. Go to **Automate → New Script**.
3. Delete the starter code and paste in the full `SearchJobDescriptions` script from the **Appendix**.
4. Rename the script **SearchJobDescriptions** and save it.
5. For Option B, use **Save as** or the script's file menu to store a copy of the `.osts` file in the SharePoint library.

### Step 1.4: Understand what the script does

These points are useful when you tune the script later.

- **Tokenizing:** removes HTML (SharePoint rich-text fields return HTML), lowercases everything, drops punctuation and stop words (`the`, `and`, `role`, `responsible`, and so on), and applies light stemming so `managing`, `manages`, and `managed` all match.
- **Coverage (70% of the score):** the share of the user's meaningful words found anywhere in the JD. Words that appear in only a few JDs count more than words that appear in most of them. A word that appears in no JD is ignored so it doesn't pull every score down.
- **Placement (30% of the score):** a bonus when matched words land in higher-value fields. The field weights are Title 3, Purpose 2, Duties 1.5, KSAs 1, Education 0.5, and Experience 0.5.
- **Output:** up to `maxResults` matches sorted by score, each with `matchedTerms` (useful for debugging), plus its own `status`. The flow recalculates status on its own, so both search paths follow the same rules.

---

## Phase 2: Build the flow

### Step 2.1: Create the flow inside your solution

1. Open your DEV solution and choose **New → Automation → Cloud flow → Instant**.
2. Name it **Search Job Descriptions**.
3. For the trigger, choose **When an agent calls the flow**. It may appear as *Run a flow from Copilot* in older tenants.

You can also create it from inside Copilot Studio: open a topic, add a node, and choose **Call an action → Create a flow**. Either way, make sure the flow ends up in the solution.

### Step 2.2: Add environment variables (recommended for ALM)

Create these in the solution so the flow works in every environment without edits:

| Environment variable | Type | DEV value |
|---|---|---|
| `JD Site URL` | Text | Your DEV SharePoint site |
| `JD List Name` | Text | Your JD list name (or data source type if you prefer) |
| `JD Scripts Library` | Text | Library holding the host workbook and scripts (Option B only) |

### Step 2.3: Configure the trigger inputs

Add two **Text** inputs to the trigger:

| Input | Description to enter | Required |
|---|---|---|
| `SearchText` | The job title or job description the user typed | Yes |
| `SearchMode` | Auto, Title, or Description | No (open the input's `…` menu and choose **Make the field optional**) |

Power Automate names these internally as `text` and `text_1`. Pick them from **Dynamic content** instead of typing the names, so you get the right ones.

### Step 2.4: Initialize variables

Variables must be initialized at the top level of the flow, before any conditions. Add one **Initialize variable** action for each row below, in this order.

| Name | Type | Value | Purpose |
|---|---|---|---|
| `varMode` | String | `if(empty(<SearchMode>), 'Auto', <SearchMode>)` | Defaults the mode to Auto |
| `varMatches` | Array | `[]` | Holds the final list of matches |
| `varStatus` | String | `none` | single / multiple / none |
| `varSource` | String | *(leave empty)* | title / description, useful for testing |
| `varTitleAcceptScore` | Float | `0.85` | In Auto mode, title results are kept only if the top score is at least this |
| `varTitleMinScore` | Float | `0.6` | Title matches below this are discarded |
| `varConfidentScore` | Float | `0.8` | The top match must reach this to count as a single clear winner... |
| `varConfidentGap` | Float | `0.15` | ...and must lead the second match by at least this much |
| `varTitleTopScore` | Float | `0` | Top title score, used by the Auto fallback |

For `<SearchMode>`, insert the SearchMode trigger input from Dynamic content.

### Step 2.5: Get the JD list items

Add **SharePoint → Get items** and rename it **Get JD items**.

| Field | Value |
|---|---|
| Site Address | `JD Site URL` environment variable |
| List Name | `JD List Name` environment variable |
| Filter Query | `<StatusInternalName> eq 'Active'` (use your active status value) |
| Top Count | `5000` |

Top Count matters. Without it, Get items returns only the first **100** items, and most JDs would never be searched. If you ever have more than 5,000 JDs, open the action's **Settings**, turn on **Pagination**, and set a higher threshold.

### Step 2.6: Shape the data with Select

Add **Data Operation → Select** and rename it **Select JD fields**.

- **From:** `body('Get_JD_items')?['value']`
- **Map:** switch to key/value mode and add:

| Key | Value (expression) |
|---|---|
| `jobCode` | `item()?['<JobCodeInternalName>']` |
| `jobTitle` | `item()?['Title']` (or your title column's internal name) |
| `purpose` | `item()?['<PurposeInternalName>']` |
| `duties` | `item()?['<PrincipalDutiesInternalName>']` |
| `ksa` | `item()?['<KSAInternalName>']` |
| `education` | `item()?['<EducationInternalName>']` |
| `experience` | `item()?['<WorkExperienceInternalName>']` |

Only include these fields. Leaving out Grade, Salary/Hourly, and Status keeps the payload small and keeps restricted data out of the search entirely.

If any of these columns are **Choice** columns, use `item()?['<Name>']?['Value']` to get the text.

### Step 2.7: Title search path

Add a **Condition** named **Run title search?**:

```
or(equals(variables('varMode'), 'Title'), equals(variables('varMode'), 'Auto'))
```

Add the following actions in the **Yes** branch, in order.

**a. Run MatchJobTitle.** Add the same **Run script** action your existing flows use for `MatchJobTitle` and rename it **Run title match**. Pass `SearchText` as the title input, plus whatever else it needs (for example, the list of titles).

**b. Normalize the output.** Add a **Select** named **Normalize title matches**.

- **From:** the array of matches that MatchJobTitle returns, for example `outputs('Run_title_match')?['body/result/<matchesArrayName>']`
- **Map:**

| Key | Value |
|---|---|
| `jobCode` | `item()?['<codeField>']` |
| `jobTitle` | `item()?['<titleField>']` |
| `score` | `float(item()?['<scoreField>'])`, or `div(float(item()?['<scoreField>']), 100)` if the scale is 0–100 |
| `matchedTerms` | `title` |

**c. Drop weak matches.** Add **Filter array** named **Keep strong title matches**.

- **From:** `body('Normalize_title_matches')`
- **Condition (advanced mode):** `@greaterOrEquals(item()?['score'], variables('varTitleMinScore'))`

**d. Store the results.** Add **Set variable** for `varMatches`:

```
take(reverse(sort(body('Keep_strong_title_matches'), 'score')), 8)
```

This sorts by highest score and keeps at most 8. If MatchJobTitle already returns sorted results, `take(body('Keep_strong_title_matches'), 8)` is enough.

**e. Record the source and top score.**

- **Set variable** `varSource` → `title`
- **Set variable** `varTitleTopScore` → `float(coalesce(first(variables('varMatches'))?['score'], 0))`

`coalesce` returns 0 instead of erroring when there are no matches.

Leave the **No** branch empty.

### Step 2.8: Description search path

Add a **Condition** named **Run description search?** *below* the title condition (not inside it):

```
or(
  equals(variables('varMode'), 'Description'),
  and(
    equals(variables('varMode'), 'Auto'),
    less(variables('varTitleTopScore'), variables('varTitleAcceptScore'))
  )
)
```

This runs when the user asked for a description search, or when Auto mode's title search came back weak or empty.

Add the following actions in the **Yes** branch.

**a. Run the script.** Add **Excel Online (Business) → Run script from SharePoint library** (Option B) or **Run script** (Option A). Rename it **Run description search**.

| Field | Value |
|---|---|
| Location / Library | Site and library holding `JD Search Scripts.xlsx` |
| File | `JD Search Scripts.xlsx` |
| Script | `SearchJobDescriptions` |
| query | `SearchText` (trigger input) |
| candidatesJson | `string(body('Select_JD_fields'))` |
| maxResults | `8` |

**b. Store the results without losing a weaker title result.** In Auto mode, if the description search finds nothing, keep whatever the title search found.

- **Set variable** `varMatches`:

```
if(
  and(equals(variables('varMode'), 'Auto'),
      equals(length(outputs('Run_description_search')?['body/result/matches']), 0)),
  variables('varMatches'),
  outputs('Run_description_search')?['body/result/matches']
)
```

- **Set variable** `varSource`:

```
if(
  and(equals(variables('varMode'), 'Auto'),
      equals(length(outputs('Run_description_search')?['body/result/matches']), 0)),
  variables('varSource'),
  'description'
)
```

Leave the **No** branch empty.

### Step 2.9: Decide the status

Add these actions *below* both conditions.

**a. Compose** named **Top score**:

```
float(coalesce(first(variables('varMatches'))?['score'], 0))
```

**b. Compose** named **Second score**:

```
float(coalesce(last(take(variables('varMatches'), 2))?['score'], 0))
```

`last(take(..., 2))` gets the second item safely. When there's only one match, it returns that same match, so there's no index error.

**c. Condition** named **Any matches?**:

```
greater(length(variables('varMatches')), 0)
```

- **No:** **Set variable** `varStatus` → `none`
- **Yes:** add a nested **Condition** named **Clear winner?**:

```
or(
  equals(length(variables('varMatches')), 1),
  and(
    greaterOrEquals(outputs('Top_score'), variables('varConfidentScore')),
    greaterOrEquals(sub(outputs('Top_score'), outputs('Second_score')), variables('varConfidentGap'))
  )
)
```

  - **Yes:** **Set variable** `varStatus` → `single`
  - **No:** **Set variable** `varStatus` → `multiple`

### Step 2.10: Respond to the agent

Add **Respond to the agent** as the last action, with these outputs:

| Output | Type | Value |
|---|---|---|
| `status` | Text | `variables('varStatus')` |
| `count` | Number | `length(variables('varMatches'))` |
| `matchesJson` | Text | `string(variables('varMatches'))` |
| `source` | Text | `variables('varSource')` |

Leave **Asynchronous response** off. Copilot Studio waits roughly 100 seconds for a flow to respond, and a search should finish well within that.

### Step 2.11: Save and test the flow by itself

Test with **Test → Manually** before connecting the agent. Replace the examples with real titles and duties from your list.

| # | SearchText | SearchMode | Expected |
|---|---|---|---|
| 1 | An exact title from the list | Auto | `single`, source `title` |
| 2 | The same title with a typo | Auto | `single` or `multiple`, source `title` |
| 3 | A generic title, such as "Analyst" | Auto | `multiple` |
| 4 | Two or three sentences describing a real job's duties | Auto | source `description`, the correct job at or near the top |
| 5 | Nonsense text, such as "zzqx blorf" | Auto | `none` |
| 6 | A title | Description | source `description` (confirms the mode switch works) |
| 7 | *(leave SearchMode blank)* | — | Treated as Auto |

For each run, open the run history and check the output of **Run description search**. `matchedTerms` shows which words drove the score, which tells you what to adjust in Phase 5.

---

## Phase 3: Build the agent topic

These steps use the classic topic canvas in the JD Expert agent.

### Step 3.1: Create the topic

1. Go to **Topics → + Add a topic → From blank**.
2. Name it **Find Job Description**.
3. Add trigger phrases such as:
   - *Find a job description*
   - *Look up a job*
   - *Search for a job title*
   - *I need the JD for a role*
   - *Which job does this describe*

   If this topic will run as the first step of your View and Update topics, you can instead call it from those topics with **Redirect** and skip most trigger phrases.

### Step 3.2: Create the topic variables

You'll create these as you go. For reference:

| Variable | Type | Purpose |
|---|---|---|
| `Topic.SearchText` | String | What the user typed |
| `Topic.SearchAttempts` | Number | Limits retries |
| `Topic.SearchStatus` | String | Flow output `status` |
| `Topic.MatchesJson` | String | Flow output `matchesJson` |
| `Topic.Matches` | Table | Parsed matches |
| `Topic.SelectedJobCode` | String | The chosen job's code (never displayed) |
| `Topic.SelectedJobTitle` | String | The chosen job's title |
| `Global.SelectedJobCode` | String | Makes the code available to your View and Update topics |

### Step 3.3: Initialize the retry counter

Add **Set a variable value**: `Topic.SearchAttempts` = `0`.

### Step 3.4: Ask for the search text

Add a **Question** node:

- **Message:** *What job are you looking for? You can give me the job title, or describe what the role does and I'll find the closest match.*
- **Identify:** User's entire response
- **Save as:** `Topic.SearchText`

This node is the loop-back point for retries. Give it a clear name, such as **Ask for job**.

### Step 3.5: Call the flow

Add **Call an action** and choose **Search Job Descriptions**.

- **Inputs:**
  - `SearchText` → `Topic.SearchText`
  - `SearchMode` → `Auto`
- **Outputs:** save `status` as `Topic.SearchStatus`, `matchesJson` as `Topic.MatchesJson`. Save `count` and `source` too if you want them for debugging.

If the flow doesn't appear in the list, see the Troubleshooting table.

### Step 3.6: Parse the matches into a table

Add **Variable management → Parse value**:

- **Parse value:** `Topic.MatchesJson`
- **Data type:** *From sample data*. Paste the sample below and select **Confirm**:

```json
[
  { "jobCode": "ABC123", "jobTitle": "Sample Title", "score": 0.85, "matchedTerms": "loan, credit" }
]
```

- **Save as:** `Topic.Matches` (Table)

### Step 3.7: Branch on the status

Add a **Condition** node with three branches:

1. `Topic.SearchStatus` **is equal to** `single`
2. `Topic.SearchStatus` **is equal to** `multiple`
3. **All other conditions** (this covers `none`)

### Step 3.8: Single branch (one clear match)

1. **Set a variable value:** `Topic.SelectedJobCode` = formula `First(Topic.Matches).jobCode`
2. **Set a variable value:** `Topic.SelectedJobTitle` = formula `First(Topic.Matches).jobTitle`
3. **Message:** *I found **{Topic.SelectedJobTitle}**.* Insert the variable with the `{x}` button.

Optional: if you'd rather confirm before continuing, replace the message with a **Question** node (*Is **{Topic.SelectedJobTitle}** the job you meant?*, multiple choice Yes/No). Send **No** to Step 3.10.

### Step 3.9: Multiple branch (dropdown)

1. Add **Ask with adaptive card**.
2. In the card editor, switch from JSON to **Formula**.
3. Paste:

```
{
  type: "AdaptiveCard",
  version: "1.5",
  body: [
    { type: "TextBlock", text: "I found a few close matches. Which one did you mean?", wrap: true },
    {
      type: "Input.ChoiceSet",
      id: "selectedJobCode",
      style: "compact",
      isRequired: true,
      placeholder: "Select a job",
      errorMessage: "Please pick a job, or choose None of these.",
      choices: ForAll(Topic.Matches, { title: jobTitle, value: jobCode })
    }
  ],
  actions: [
    { type: "Action.Submit", title: "Select" },
    {
      type: "Action.Submit",
      title: "None of these",
      associatedInputs: "none",
      data: { selectedJobCode: "NONE" }
    }
  ]
}
```

4. In the node's **Outputs**, confirm `selectedJobCode` is listed and save it as `Topic.SelectedJobCode`. If the "None of these" data doesn't come through as that output in your channel, remove that button and use the Step 3.10 retry path instead.
5. Add a **Condition**: `Topic.SelectedJobCode` **is equal to** `NONE`
   - **True:** go to Step 3.10's retry logic. You can copy those nodes here, or have both branches lead into one shared set of nodes.
   - **All other conditions:** **Set a variable value** `Topic.SelectedJobTitle` = formula `LookUp(Topic.Matches, jobCode = Topic.SelectedJobCode).jobTitle`

How the card works:

- `title` is what the user sees and `value` is what's returned, so the Job Code stays hidden.
- `style: "compact"` shows a dropdown. `style: "expanded"` shows radio buttons, which are easier to tap on a phone when there are only 2–4 matches.

### Step 3.10: None branch (retry, then stop)

1. **Set a variable value:** `Topic.SearchAttempts` = formula `Topic.SearchAttempts + 1`
2. **Condition:** `Topic.SearchAttempts` **is less than** `2`
   - **True:**
     - **Message:** *I couldn't find a close match. Try the exact job title, or describe two or three of the job's main duties.*
     - **Topic management → Go to step:** select the **Ask for job** question from Step 3.4.
   - **All other conditions:**
     - **Message:** *I'm still not finding it. Your HR Business Partner can help identify the right job description.*
     - **End current topic**

### Step 3.11: Hand off the selected job

After the single and multiple branches (not the none branch), connect to a shared set of nodes:

1. **Set a variable value:** `Global.SelectedJobCode` = `Topic.SelectedJobCode`
2. **Call an action → Get JD Details** with Job Code = `Topic.SelectedJobCode`.
3. Show the result. Display only Job Title, Purpose, Principal Duties, KSAs, Education, Work Experience, Certifications/Licenses, and whatever else managers are allowed to see. **Never display Grade, Status, Job Code, or Salary/Hourly.**
4. Continue to your View or Update logic, either with a **Redirect** to that topic or by building the next steps here.

### Step 3.12: Keep restricted data out of generated responses

Job Code is now in topic and global variables, so add a line to the agent's instructions:

> Never display Job Code, Grade, Status, or Salary/Hourly to users, even if asked or if they appear in tool or topic data.

If the flow is also available to generative orchestration as a tool, give it a clear description, for example: *Searches job descriptions by job title or by a description of the job's duties. Returns matching job titles and internal codes. Never show the codes to users.*

---

## Phase 4: Test end to end

Test in the Copilot Studio test pane, then in the real channel (such as Teams), because adaptive cards can render differently.

| # | What to do | Pass criteria |
|---|---|---|
| 1 | Type an exact title | Goes straight to the job, with no dropdown |
| 2 | Type a generic title | Dropdown appears, and the chosen job loads the correct details |
| 3 | Describe a job's duties in plain language | Correct job appears first or in the dropdown |
| 4 | Pick **None of these** | Asks you to rephrase |
| 5 | Search nonsense twice | Second failure shows the HRBP message and the topic ends |
| 6 | Ask the agent "what's the job code?" after a search | Agent declines, and no code appears anywhere |
| 7 | Search on a phone | Dropdown is usable (switch to `expanded` if not) |
| 8 | Check the flow run history for each test | Status, source, and scores match what the agent did |

---

## Phase 5: Tune the results

Adjust one setting at a time and rerun the Phase 2.11 tests.

| Problem | Adjust | Where |
|---|---|---|
| Title-like searches fall through to description search too often | Lower `varTitleAcceptScore` (for example, 0.85 → 0.75) | Flow variable |
| Irrelevant titles show up in the dropdown | Raise `varTitleMinScore` | Flow variable |
| Dropdown appears when there's obviously one right answer | Lower `varConfidentScore` or `varConfidentGap` | Flow variables |
| Agent picks one job when it should have asked | Raise `varConfidentScore` or `varConfidentGap` | Flow variables |
| Description search returns weak matches | Raise `MIN_SCORE` | Script |
| Common HR words skew description results | Add them to `STOP_WORDS` | Script |
| Users call things by different names (for example, "RM" vs. "Relationship Manager") | Add an alias step that expands abbreviations before tokenizing. You can reuse the alias map from MatchJobTitle. | Script |
| Duties matter more than Purpose for your JDs | Change the weights in `fieldTexts()`. If you raise the top weight, update `MAX_FIELD_WEIGHT` to match. | Script |

---

## Phase 6: Promote to UAT and QA

1. Confirm the flow, environment variables, and connection references are all in the solution.
2. In each target environment, create or copy `JD Search Scripts.xlsx` and both scripts (`SearchJobDescriptions` and `MatchJobTitle`) into that environment's SharePoint library.
3. Export the solution as **managed** and import it. Set the environment variable values and connection references for the target environment when prompted.
4. Turn the flow on and confirm the agent's action node still points to it.
5. Rerun the Phase 2.11 and Phase 4 tests against the target environment's JD list.

With Option A (OneDrive scripts), the scripts belong to whoever owns the Excel connection in each environment, so you must recreate them under that account. This is the main reason to use Option B.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Only some JDs are ever found | Get items is returning only 100 rows | Set Top Count to 5000 (Step 2.5) |
| Get items fails on the filter | Display name used instead of internal name, or the value doesn't match exactly | Check the `Field=` value in List settings |
| Run script fails or times out | Payload too large or script too slow | Trim the Select to Title, Purpose, Duties, and KSAs. Keep maxResults at 8 or below. |
| `JSON.parse` error in the script | `candidatesJson` isn't a JSON string | Make sure the value is `string(body('Select_JD_fields'))` |
| Title path scores are all 0 or all over 1 | Score scale mismatch | Use `div(..., 100)` in Normalize title matches if MatchJobTitle scores 0–100 |
| Flow doesn't show up in Copilot Studio | Wrong trigger, missing Respond action, or different environment | Use the *When an agent calls the flow* trigger and end with *Respond to the agent*, in the same environment as the agent |
| Agent shows a timeout error | Flow took longer than about 100 seconds | Check the run history for the slow step, usually Get items or Run script |
| Parse value fails | `matchesJson` doesn't match the sample schema | Compare a real `matchesJson` from the run history with the sample in Step 3.6 |
| Dropdown shows but `Topic.SelectedJobCode` is empty | Output variable not mapped | In the card node's Outputs, map `selectedJobCode` to `Topic.SelectedJobCode` |
| Two identical titles in the dropdown | Different jobs share a title | Add a distinguishing field to the choice title, for example `jobTitle & " – " & <field>`. Don't use Job Code, Grade, or Salary/Hourly. |
| HTML tags appear in displayed JD text | Rich-text columns return HTML | Strip HTML in Get JD Details or in the topic's display step |

---

## Appendix: SearchJobDescriptions script

Paste this into a new Office Script (Step 1.3).

```typescript
/**
 * SearchJobDescriptions
 * Scores job descriptions against a free-text description of a role.
 * Called from Power Automate via "Run script". The workbook isn't used; JD data
 * is passed in as JSON so the script doesn't depend on any sheet layout.
 *
 * Score (0–1) = 70% coverage  – share of the query's meaningful words found anywhere
 *                               in the JD, with rare words counting more than common ones
 *             + 30% placement – bonus when those words land in Title/Purpose rather
 *                               than Education/Experience
 */

interface JobCandidate {
  jobCode: string;
  jobTitle: string;
  purpose?: string;
  duties?: string;
  ksa?: string;
  education?: string;
  experience?: string;
}

interface JobMatch {
  jobCode: string;
  jobTitle: string;
  score: number;
  matchedTerms: string;
}

interface SearchResult {
  status: string; // "single" | "multiple" | "none"
  count: number;
  topScore: number;
  matches: JobMatch[];
}

// ---- Tuning knobs ----
const MIN_SCORE = 0.25;       // JDs scoring below this aren't returned
const CONFIDENT_SCORE = 0.8;  // top result at/above this...
const CONFIDENT_GAP = 0.15;   // ...and this far ahead of #2 counts as "single"
const MAX_FIELD_WEIGHT = 3;   // must equal the highest weight in fieldTexts()

const STOP_WORDS = new Set<string>([
  "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
  "of", "on", "or", "our", "that", "the", "their", "this", "to", "was", "we", "who", "will",
  "with", "job", "role", "position", "someone", "person", "looking", "need", "needs", "want",
  "responsible", "responsibilities", "duties", "employee", "employees"
]);

function main(
  workbook: ExcelScript.Workbook,
  query: string,
  candidatesJson: string,
  maxResults: number = 8
): SearchResult {
  const candidates = JSON.parse(candidatesJson) as JobCandidate[];

  // Query terms: stem -> original word (keeps matchedTerms readable)
  const queryTerms = new Map<string, string>();
  for (const word of words(query)) {
    const s = stem(word);
    if (!queryTerms.has(s)) queryTerms.set(s, word);
  }
  if (queryTerms.size === 0 || candidates.length === 0) {
    return { status: "none", count: 0, topScore: 0, matches: [] };
  }

  // Index each JD: term set per field, plus one set for all fields
  const docs = candidates.map(c => {
    const fields = fieldTexts(c).map(f => ({
      weight: f.weight,
      terms: new Set<string>(words(f.text).map(w => stem(w)))
    }));
    const all = new Set<string>();
    fields.forEach(f => f.terms.forEach(t => all.add(t)));
    return { cand: c, fields: fields, all: all };
  });

  // Inverse document frequency. Terms that appear in no JD are ignored so a
  // stray word doesn't drag every score down.
  const n = docs.length;
  const idf = new Map<string, number>();
  queryTerms.forEach((_, term) => {
    const df = docs.filter(d => d.all.has(term)).length;
    if (df > 0) idf.set(term, Math.log(1 + n / (1 + df)));
  });
  let totalIdf = 0;
  idf.forEach(v => { totalIdf += v; });
  if (totalIdf === 0) {
    return { status: "none", count: 0, topScore: 0, matches: [] };
  }

  const scored: JobMatch[] = [];
  for (const d of docs) {
    let covered = 0;
    let placed = 0;
    const hits: string[] = [];
    idf.forEach((w, term) => {
      if (!d.all.has(term)) return;
      covered += w;
      let best = 0;
      for (const f of d.fields) {
        if (f.terms.has(term) && f.weight > best) best = f.weight;
      }
      placed += w * (best / MAX_FIELD_WEIGHT);
      hits.push(queryTerms.get(term) as string);
    });
    const score = 0.7 * (covered / totalIdf) + 0.3 * (placed / totalIdf);
    if (score >= MIN_SCORE) {
      scored.push({
        jobCode: String(d.cand.jobCode),
        jobTitle: d.cand.jobTitle,
        score: Math.round(score * 100) / 100,
        matchedTerms: hits.join(", ")
      });
    }
  }

  scored.sort((a, b) => (b.score - a.score) || a.jobTitle.localeCompare(b.jobTitle));
  const top = scored.slice(0, maxResults);

  let status = "none";
  if (top.length === 1) {
    status = "single";
  } else if (top.length > 1) {
    const clearWinner =
      top[0].score >= CONFIDENT_SCORE && top[0].score - top[1].score >= CONFIDENT_GAP;
    status = clearWinner ? "single" : "multiple";
  }

  return {
    status: status,
    count: top.length,
    topScore: top.length > 0 ? top[0].score : 0,
    matches: top
  };
}

// Field weights: where a word lands says how central it is to the job
function fieldTexts(c: JobCandidate): { text: string; weight: number }[] {
  return [
    { text: c.jobTitle, weight: 3 },
    { text: c.purpose, weight: 2 },
    { text: c.duties, weight: 1.5 },
    { text: c.ksa, weight: 1 },
    { text: c.education, weight: 0.5 },
    { text: c.experience, weight: 0.5 }
  ];
}

function words(text: string): string[] {
  return (text || "")
    .replace(/<[^>]*>/g, " ")          // SharePoint rich text arrives as HTML
    .replace(/&[a-z#0-9]+;/gi, " ")    // HTML entities (&nbsp; etc.)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// Light stemmer so "managing", "manages", "managed", "manage" all line up
function stem(w: string): string {
  let s = w;
  if (s.length > 5 && s.endsWith("ing")) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith("ies")) s = s.slice(0, -3) + "y";
  else if (s.length > 4 && s.endsWith("ed")) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1);
  if (s.length > 4 && s.endsWith("e")) s = s.slice(0, -1);
  return s;
}
```
