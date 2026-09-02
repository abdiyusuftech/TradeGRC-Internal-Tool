# TradeGRC Compliance Front End — Integration & Intent Context

**Purpose of this document:** a complete briefing for whoever builds the new custom front end — replacing the Airtable-native Compliance Lookup Interface — so it connects to the existing backend (GHL → webhook → Airtable → Sendr.ai) without guessing, re-deriving, or silently breaking an existing dependency. Written to carry the same "why," not just the "what," as the Airtable Buildout Handoff this extends.

**How to read this:** established facts (already built, tested, or explicitly decided in prior work) are marked as such. Recommendations made *in this document* are marked as proposals, not settled fact — they need your sign-off before a builder treats them as spec. The final section lists everything still open.

---

## 1. Intent & Scope

**Confirmed against the actual repository (`abdiyusuftech/TradeGRC-Internal-Tool`) — this is the public, lead-facing results page, not an internal staff tool.** The original draft of this section hedged between the two; that's now resolved with direct evidence, not assumption. `metadata.json` names the app itself *"Public record compliance inspection and verification engine."* The footer reads "Public Record Engine." The record-editing modal is titled "Edit Public Record Fields." There is no `Sequence Status`, `Day 4 Send Date`, queue view, or anything GHL-shaped anywhere in the codebase. This changes who Section 6's display logic is written for, but Sections 2–5's data model and dependency chain still apply — Airtable is still the system of record underneath whatever renders here.

**What this front end replaces:** the public, no-login results page previously described as Airtable/Softr-hosted with a deferred rebuild draft. That deferred rebuild appears to have been superseded by this repository — a from-scratch React/Vite/Tailwind build, not a Softr page. It is the page Sendr's video compositing was expected to read from, and the page a lead or GC lands on.

**Who uses it:** leads and GCs viewing a single company's compliance snapshot. Any staff-facing editing capability that exists in the code (see Section 9) is a data-correction affordance layered onto the public view, not a queue-management tool — there is still no internal, staff-facing control layer for working the WSIB/OBR lookup queue. If that's still wanted, it's a separate, currently unbuilt surface, not something to assume this repo will grow into.

**What this front end is explicitly NOT:**
- It is **not** a client-facing dashboard in the sense TradeGRC's positioning prohibits — it's a single-record, token-style lookup rather than an ongoing portal a client logs into and returns to. Worth actively confirming this reading holds once editing is actually wired up (see Section 9 — the edit capability exists as code but isn't reachable from the running app yet, so the "who can edit the public record" question hasn't actually been decided by anything, including accident).
- It is **not**, currently, connected to anything — see Section 9 before treating any of the integration mechanics below as already working.

---

## 2. System Map — Division of Labor

Three systems, each owning a distinct slice of the truth. The front end is a **view and edit layer on top of Airtable** — a fourth system that reads and writes Airtable data, not a fourth place where facts get independently computed.

| System | Owns | Front end's relationship to it |
|---|---|---|
| **GHL** | Cold outreach pipeline. Scraped leads live here first. Runs the multi-touch sequence (SMS → voicenote → video). Source of truth for `Sequence Status` and `Day 4 Send Date`. | **Read-only, mirrored.** These two fields are synced *copies* into Airtable, never edited there. The front end must display them as read-only — editing a GHL-owned field locally would silently violate the single-source-of-truth rule this system was already corrected once to enforce. |
| **Airtable** | The compliance data layer and computation engine — the `Compliance Records` table, all formulas, staleness tracking, footnote text, and the automation gate deciding whether Sendr fires. | **This is the front end's actual database.** Every read and write goes here. |
| **Sendr** | Generates the personalized outreach video/landing asset. Reads from Airtable via webhook, and separately from the public results page (for its Dynamic Background video compositing). **Deliberately engineered to never query a government site directly.** | **Indirect.** The front end doesn't talk to Sendr directly — it manages the Airtable-side data and automation gate that determines whether Sendr *can* fire, and should surface Sendr's status back to staff. |

### The three webhook relationships — easy to conflate, worth naming separately

1. **GHL → Airtable** (lead intake / sequence sync). A `Sync Sequence Status from GHL` automation was designed to keep this current but was **never actually sent/built** — it was optional in the original design. If the front end assumes `Sequence Status` is always fresh, verify this automation exists before treating it as live.
2. **Airtable → Sendr** (`Trigger Sendr Generation` automation). The trigger logic and status-update behavior are confirmed built and correct. **The webhook action itself is still pending — there is no live Sendr endpoint yet.** This is expected, not a bug, but the front end must not display "sent to Sendr" as though it's actually happening today.
3. **Airtable → GHL** (proposed, not built). A one-way sync mirroring `WSIB Status`, `Corporate Status`, and both footnotes into GHL custom fields, matched on phone, so discovery-call prep doesn't need a second tab. Deprioritized as a real but non-urgent upgrade — the internal tool already satisfies the core need on its own. Worth building into this front end's roadmap rather than Airtable directly, since the front end is a more natural home for "GHL-visible summary" than a raw sync.

---

## 3. Data Model

### 3.1 The dependency chain — not two independent lookups

This is the single most important thing for a front-end builder to internalize, because it changes what the UI needs to represent.

Only the **trade/operating name** exists at intake (e.g., "Stone It Up") — the **legal name** (e.g., "Buildwise Innovations Corp") is not a known input. It's an *output* of the WSIB search:

1. Search WSIB using the trade name — the only name available at this point.
2. If matched, the WSIB certificate reveals the legal name as a byproduct.
3. The legal name — not the trade name — is what feeds the corporate registry search.
4. If WSIB has no match, the legal name never surfaces, and the corporate check becomes **structurally unreachable**, not a completed negative result.

**Front-end implication:** the corporate-status field/section in the UI needs a genuine third state beyond "checked" and "not checked" — *blocked, pending WSIB match* — and it should be visually and functionally distinct from *checked, nothing found*. Building this as a simple two-step checklist will misrepresent what actually happened for any lead where WSIB has no match.

### 3.2 Fields — what's confirmed, and a real gap you should know about

The `Compliance Records` table has 22 fields total, per the current build spec. **The authoritative field-by-field list lives in `Airtable_Softr_Build_Specification.md`, which is not present in this project.** What follows is the subset independently documented elsewhere and safe to treat as confirmed; treat anything not listed here as unverified until that spec is located.

**Identity / lookup fields:**
- `Trade/Operating Name` and `Legal Name` — split into two fields on purpose (see 3.1); a single `Company Name` field was the original, incorrect design.
- `Address`, `Industry/NAICS Code` — both printed on the real WSIB certificate used to redesign this schema; missing from the original design entirely.
- `Phone (Match Key)` — the cross-system identity key (see Section 4).
- `Results Page Token` — `RECORD_ID()`, used only for the public results page URL (see Section 4).

**WSIB fields:**
- `WSIB Clearance Certificate Number` — renamed from an earlier `WSIB Account Number`; the real certificate labels it "clearance certificate number," a per-certificate reference tied to one validity window, not a permanent account ID.
- `WSIB Status` — values: `Active/Good Standing`, `Lapsed/Delinquent`, `No Account Found`, `WSIB No Match — Legal Name Unavailable`, `Not Yet Checked`.
- `WSIB Footnote` — formula field, fixed explanatory sentence per status value (see Section 6).
- A real, stated WSIB expiry date field, entered directly off the source document — the actual certificate showed a **42-day** validity window. A flat 90-day formula was tried first and was wrong; this is now a real entered date, not a calculated one.

**Corporate fields:**
- `Corporate Status` — the corporation's own annual-return standing, the actual silent-lapse risk the business model is built around. Values: `Active`, `Not in Good Standing`, `Not Found`, `Unreachable — No Legal Name`, `Not Yet Checked`.
- `Corporate Status Footnote` — formula field, same pattern as WSIB's.
- `Business Name Registration Status` — **deliberately separate** from `Corporate Status`. This tracks the trade name's own 5-year registration cycle, a real but more benign risk than the corporation's annual-return standing. Conflating these two was flagged as a real accuracy bug, not just an organizational preference.
- `Corporate Registry Reference` and `Business Name BIN` — split on the reasoning that a corporation and its business name are different registered profiles with likely different reference numbers. **This assumption was never independently verified against a real corporate-only lookup** — flag it as such if the front end surfaces both.
- A real, stated corporate-registry expiry/renewal date, on its own ~5-year cycle — separate from WSIB's ~42-day cycle for the same reason as above: one formula can't correctly serve both.

**Pipeline / sync fields:**
- `Sequence Status` — synced copy from GHL, read-only (see Section 2).
- `Day 4 Send Date` — synced copy from GHL, read-only.

**Proposed, not yet in schema:** `Class/Subclass` — present on the real WSIB certificate, not currently modeled. Minor, optional, low priority.

**Blocked vs. completed-negative — a distinction the schema encodes on purpose:** `Corporate Status = Not Found` (a real search that came back empty) and `Corporate Status = Unreachable — No Legal Name` (the search couldn't even run) are not the same thing, and the schema keeps them as separate values rather than collapsing them. This same distinction governs whether Sendr fires (Section 5) and whether a footnote renders at all (Section 6). Any front-end logic that treats "no result" as one bucket will break both.

---

## 4. Identifiers & Keys

- **`Phone (Match Key)`** — the normalized phone number, and the established cross-system identity key linking GHL, Airtable, and Sendr. This is what the front end should use as its primary lookup/join key.
- **`Results Page Token`** — `RECORD_ID()`, used only for the public results page's URL. Chosen deliberately for non-guessability; the underlying data it exposes (trade name, WSIB status, corporate status) is already independently public via the same government searches, so the token controls incidental exposure, not a genuine secret. Airtable's `RECORD_ID()` is practically non-obvious and non-incrementing per community consensus, but there's no authoritative proof it's cryptographically unguessable — accepted as low-stakes given the point above.

**Explicitly do not use `Trade/Operating Name` or `Legal Name` as an identifier or lookup key.** Per Section 3.1, the legal name isn't even known at intake — it's a mid-pipeline output — and trade names are not unique across companies. A "create an identifier field to search up their response" instinct is reasonable, but the identifier already exists (`Phone (Match Key)` for cross-system joins, `Results Page Token` for the public URL) — building a new one risks duplicating a key that already does this job and introducing a second source of truth for identity.

**Front-end recommendation:** the internal tool's search/lookup UI can offer company-name free-text search as a *convenience filter* over the underlying records, but the actual join back to GHL and Sendr should always run through phone, not name.

---

## 5. Triggers

### 5.1 Baseline — built and tested

The `Daily Lookup Queue` view surfaces records that have reached **Day 4** of the GHL sequence and haven't yet been manually checked. This is confirmed built and tested against real pass/fail throwaway records. This is the queue staff should be working from inside the new front end.

**Important framing correction, already made once in prior work and worth repeating here:** this pipeline is not primarily a discovery-call mechanism. The check happens automatically at Day 4, before anyone has spoken to the lead — it feeds Sendr's personalized outreach video, and the discovery call's role is to *confirm and deepen* a finding already shown, not reveal it for the first time.

### 5.2 The Sendr trigger gate — built

`Trigger Sendr Generation` fires once `WSIB Status is not "WSIB No Match — Legal Name Unavailable"`. This single condition also covers the corporate-blocked state, since `Corporate Status` can only become `Unreachable — No Legal Name` when `Legal Name` is blank — which only happens when WSIB had no match. `Corporate Status = Not Found` (a real but soft finding) still fires Sendr on its own; it doesn't need to clear a higher bar. **The webhook action is confirmed built but has no live endpoint yet** — the front end should represent this automation as "armed, not yet live," not as functioning end-to-end.

**A known, accepted gap the front end should make visible:** if a human completes the WSIB step, gets interrupted, and marks the record `Checked` before doing the corporate search, `Corporate Status` stays at `Not Yet Checked` — not a blocked state — so the exclusion above won't catch it, and Sendr could fire on a genuinely incomplete record. This was traced through in detail and left deliberately unfixed at the automation level, since it depends on human interruption timing that hasn't actually happened yet. **Recommendation for this build:** give the queue a distinct visible state for "WSIB checked, Corporate still pending" so staff catch this at a glance rather than relying on the automation alone to prevent it.

### 5.3 Proposed addition — the interest-signal trigger (new, needs your sign-off)

Your original framing — a lead signaling interest triggers the check — isn't something currently built, but it's a reasonable *addition* to 5.1, not a replacement for it. Recommendation: add it as an OR condition on the queue's filter — **Day 4 reached OR interest signal received** — so the cold, non-responsive majority still gets covered by the proven baseline, while an engaged lead gets fast-tracked ahead of Day 4.

This needs one concrete decision before it's buildable: what exactly counts as a signal. Candidates, any of which are equally easy to wire once chosen:
- A specific GHL tag or pipeline-stage change
- An inbound reply to the outreach sequence
- A booked discovery call

This is a small configuration choice, not a design blocker — flagging it here rather than guessing so the automation gets built against the right condition the first time.

---

## 6. Display Logic

### 6.1 The footnote system — why it exists, what's built

A bare status badge ("Active") overstates its own certainty without explaining what was actually checked. Two-tier design, **only tier 1 is built**:

- **Tier 1 (built):** a fixed sentence per status value, built as Airtable formula fields (`WSIB Footnote`, `Corporate Status Footnote`) rather than front-end template text — deliberately, so the internal tool and the public results page both read from one source instead of maintaining duplicate copy. The front end should **read this field, not reimplement the mapping locally.**
- **Tier 2 (not built, correctly deprioritized):** an optional per-record human-written note for exceptions a canned sentence can't cover. Not worth building until real usage shows a genuine need.

**The confirmed mapping** (verified against the live Airtable formulas):

*WSIB Status:*
- `Active/Good Standing` → *"Confirmed via WSIB's public clearance lookup as of the date checked — a snapshot, not a guarantee of future standing."*
- `Lapsed/Delinquent` → *"WSIB's public lookup shows this account isn't currently in good standing — often a missed filing or payment, not necessarily financial distress."*
- `No Account Found` → *"No WSIB account was found under this name. This can mean no account exists, or the account is registered under a different name."*
- `WSIB No Match — Legal Name Unavailable` → renders **blank** — section suppressed entirely, not softened.
- `Not Yet Checked` → this state shouldn't be reachable on the public results page; on the internal tool it should read as pending, not blank.

*Corporate Status:*
- `Active` → *"Confirmed via Ontario's public Business Registry as of the date checked. Registries generally show current status, not upcoming filing deadlines."*
- `Not in Good Standing` → *"Ontario's registry shows this corporation isn't currently in good standing — commonly a missed annual return, not necessarily active wrongdoing."*
- `Not Found` → *"No matching corporation was found in Ontario's registry under this legal name — this can reflect a naming difference rather than a compliance issue."*
- `Unreachable — No Legal Name` → renders **blank**.
- `Not Yet Checked` → pending, not reachable on the public page.

Both formulas use `SWITCH()` with `BLANK()` as the default, not an empty string — this matters if the front end is parsing the field directly rather than just displaying it.

### 6.2 Status color-coding — proposed finalized mapping

This was flagged as unfinished work: the current interface renders `Not Yet Checked` and a no-match result both as green, incorrectly implying both are "good." A three-way scheme was recommended but never mapped value-by-value. Proposing the finalized version here:

| Field value | Color | Meaning |
|---|---|---|
| `Active/Good Standing` (WSIB) / `Active` (Corporate) | **Green** | Genuinely good — confirmed clean |
| `Lapsed/Delinquent` / `Not in Good Standing` | **Orange** | Flagged — a real, actionable finding |
| `No Account Found` / `Not Found` | **Gray** | Inconclusive — a completed search with no match, not a clean result and not a violation |
| `Not Yet Checked` | **Gray**, distinct pending indicator | Awaiting a human check — actionable for staff, not shown at all on the public page |
| `WSIB No Match — Legal Name Unavailable` / `Unreachable — No Legal Name` | **No badge at all** | Blocked state — matches the footnote suppression logic in 6.1; showing any color here would overstate a search that never actually ran |

This keeps "gray-but-pending" (an internal work-queue signal) visually distinct from "gray-but-inconclusive" (a completed, public-safe result) — the ambiguity in the current build is exactly this collapse.

---

## 7. Known Gaps & Explicitly Out of Scope

- **Automated OBR/WSIB scraping** — not part of this build. The manual, human-performed lookup remains the system of record; this was a deliberate prior decision (government-site bot detection/ToS risk), not an oversight. If automated scraping is wanted later, it needs its own feasibility and legal review before any spec treats it as real.
- **Client-facing access of any kind** — explicitly out of scope per Section 1. This front end is staff-only.
- **The authoritative 22-field schema** — this document works from the subset independently documented in prior work. `Airtable_Softr_Build_Specification.md` is the primary source and is not present in this project; locate or re-upload it before final field-level wiring.
- **`Master Compliance Record`, `Pending Sendr Generation`, `Stale Records` views** — instructed to be built multiple times in prior work, but never confirmed as actually existing. Verify directly in Airtable before the front end queries assume any of these are live.
- **`Flag Stale Records` automation** — attempted, failed, manual build steps given, completion never confirmed.
- **The Sendr webhook endpoint** — not live. Do not display "sent to Sendr" as a real, happened event until a real endpoint exists.
- **The interest-signal trigger (5.3)** — needs a concrete signal definition chosen before it's buildable.
- **The interrupted-record gap (5.2)** — recommend a distinct queue state; not yet built anywhere.
- **`Corporate Registry Reference` vs. `Business Name BIN`** — assumed to be genuinely different numbers; never independently verified.

---

## 9. Verified Against the Actual Repository (`abdiyusuftech/TradeGRC-Internal-Tool`)

Everything in this section is read directly from the code, not inferred. Sections 2–8 above describe the intended integration; this section describes what actually exists today, which is materially earlier-stage than the rest of this document assumed.

### 9.1 There is no connection to Airtable, or to anything else

The repo is React 19 + Vite + Tailwind, scaffolded through Google AI Studio (`vite.config.ts` still has an "HMR is disabled in AI Studio" comment; `.env.example` only defines `GEMINI_API_KEY` and `APP_URL`, both AI Studio boilerplate, neither used anywhere in `src/`). A full-repo search for `airtable`, `webhook`, `sendr`, or a bare `fetch(` call returns nothing. Every contractor record lives in a hardcoded array in `src/data/contractors.ts`. **This is a front-end visual prototype, not a system with a backend to wire up incorrectly — there's no backend at all yet.** Whoever builds the actual Airtable connection is starting from zero on that half of the work, not adjusting something that exists.

### 9.2 The manual-check interaction model exists as UI, but isn't wired into the app

`EditRecordModal.tsx` is a genuinely well-built form — trade/legal name, address, cert number, account status, BIN, registry status, both expiry dates — and it's the closest real answer to "where does data entry happen" (pressure-test blocker #2). But it's **never imported or rendered by `App.tsx`**. There's no button, no state, no path to reach it in the running app. Its `onSave` handler only calls `setContractors(...)`, local React state with no persistence — so even once it's wired in, edits currently vanish on refresh. Two separate gaps, not one: (1) connect the form to the UI, (2) connect the form to a backend.

### 9.3 The data model diverges from Sections 3–4 in specific, concrete ways

| This doc documented | This repo actually has |
|---|---|
| `Phone (Match Key)` as the cross-system identifier | No phone field anywhere. Search (`SearchModal.tsx`) filters on trade name, legal name, BIN, reference, cert number, NAICS — exactly the name-based keying Section 4 recommended against, though harmless so far since nothing's connected yet to actually collide. |
| `WSIB Status` / `Corporate Status` as fixed-value enums (`Active/Good Standing`, `Not Yet Checked`, etc.) | `accountStatus` / `registryStatus`: free-text strings, parsed by regex at display time (see 9.4). |
| Two independent footnote fields, one per status | One combined `verdict` computed from whichever of WSIB/Corporate is worse (`rank[certTier] >= rank[regTier] ? certTier : regTier`) — a single narrative, not two independent ones. |
| Blocked vs. completed-negative as separate states (Section 3.1 — called out as the single most important distinction) | `ComplianceTier` is a flat five-value union (`clear \| watch \| flag \| lapsed \| unknown`) with no way to represent "WSIB had no match, so Corporate never ran" as distinct from "not yet checked" or "checked, found nothing." All three collapse into `unknown` → "Incomplete" → "Verify the BIN or WSIB account number," which is actively wrong guidance for the blocked case. |
| `Class/Subclass` listed as proposed, not yet in schema | Already present (`classSubclass`) — this repo is ahead of the doc here, not behind. That line in Section 3.2 is now stale. |

### 9.4 Two concrete bugs, not stylistic gaps

- **The expiry-tier thresholds don't scale to WSIB's cycle length.** `getTierFromDays` applies one shared band (< 30 days = flag, ≤ 60 = watch) to both `certDays` (WSIB, ~42-day real validity window) and `regDays` (Corporate, ~5-year cycle). The sample data proves it: Apex Mechanical's WSIB cert, issued 29 days before the check date with ~38 days of genuine validity remaining, renders as **WATCH** — not clear — because 38 days trips a threshold sized for a multi-year cycle. This is the exact failure mode Section 3.2 split WSIB and Corporate expiry into separate fields to prevent, reproduced by reusing one function for both.
- **The status-override regex has a negation bug.** The override in `calculateRecordVerdict` fires on `!/eligible|active|good/i.test(record.accountStatus)`. A real string like "Not eligible for clearance certificates" still matches `/eligible/i` as a substring, so the negation makes the override skip — a genuinely ineligible account would render as fine.

### 9.5 A trust claim with nothing behind it

`WhatHappensNext.tsx` displays `record.provenanceHash` under a shield-check icon labeled "Verified ONBIS & WSIB Data." It's a raw string copied from mock data — no hashing, no signature, no verification logic exists anywhere in the repo. Shipping this as-is shows leads and GCs a cryptographic-looking authenticity claim that verifies nothing, which cuts directly against the project's own established guardrail against overclaiming. This is worth treating as a real risk to resolve before launch, not a cosmetic detail.

### 9.6 What's already right, worth keeping

The legal disclaimer copy in `WhatHappensNext.tsx` — "this is not legal advice... not a guarantee of any payment or bid outcome... For anything beyond record-keeping, we'll point you to the right professional" — is careful and correctly scoped, consistent with established copy guardrails. Design tokens (Iron Charcoal `#1B2126`, Terracotta Rust `#C1501C`, Forest `#2F6B4F`) match the established brand system exactly. Neither needs rework.

---

## 10. Decisions Needed From You Before Build Continues

Item 1 from the original list is resolved by Section 9 — no longer a decision, a confirmed fact. What's actually open now:

1. **Auth/edit-access model** — once `EditRecordModal` gets wired into the running app, who can reach it? Right now the answer is "nobody, because it isn't connected to anything" — but that's an accident of it being unfinished, not a decision. This needs an actual answer before it's wired in, not after.
2. **Whether an internal staff queue-management tool is still wanted at all**, separate from this public page. This repo doesn't provide one and shows no sign of growing into one — confirm whether that's still a real, separate build item or whether it's been deprioritized in favor of getting the public page connected first.
3. **The concrete interest-signal definition** for Section 5.3 (tag change / reply / booked call / other) — still open, unrelated to the repo findings.
4. **Locate or re-upload `Airtable_Softr_Build_Specification.md`** if it exists, so Section 3's field list can be completed against the primary source.
5. **Resolve the `provenanceHash` claim (9.5)** — remove it, or build the verification it implies, before this is shown to a real lead or GC.
