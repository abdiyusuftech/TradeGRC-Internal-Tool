# TradeGRC Compliance Front End — Integration & Intent Context

**Purpose of this document:** a complete briefing for whoever builds and connects the new custom front end (`abdiyusuftech/TradeGRC-Internal-Tool`) to its backend, so it works the way it's actually meant to work — without guessing, re-deriving, or silently breaking a dependency someone already worked out the hard way. Written to carry the "why" behind each decision, not just the "what," because a builder who understands why a choice was made is far less likely to quietly undo it while fixing something unrelated.

**How to read this:** established facts (verified directly — against the live repository, or the live Airtable base itself, not against another document describing them) are stated as fact, no hedging. Proposals and recommendations are marked as such — they need explicit sign-off before being treated as spec. Section 12 lists everything still genuinely open. If something in here contradicts what you remember deciding, trust this document's most recent revision note over memory — this file gets updated as things get verified or decided, and the version in the repo may lag behind.

---

## Revision Note — What's New Since the Version Currently in the Repo

If you've already read an earlier version of this file (as `CLAUDE.md` in the repo root), here is what changed and why, so you can reconcile rather than assume your prior understanding still holds:

- **Section 3's field list is no longer a reconstruction.** It was built from secondary sources before; it is now read directly from the live Airtable base via API, field IDs included. Trust it fully — the caveats that applied to the old version no longer apply here.
- **The System Map (Section 2) now includes a fourth party, Zapier**, and a webhook relationship that didn't exist in the prior version — Sendr's actual return path.
- **A hard, previously-unstated requirement is now explicit: this app needs a real, per-record, deployed URL to function at all.** Not a nice-to-have — Sendr's entire integration and the self-search feature both depend on it structurally.
- **The intent section (Section 1) is substantially expanded.** The prior version described *what* this page shows; it never described the actual mechanism it exists to serve — a personalized video sales letter with the findings embedded, a booking flow, and a self-search lead-capture path. That's now documented.
- **A new consent-gated display rule is specified (Section 8)** — a real, previously-undocumented compliance mechanism (`Consent Status`) governs not just whether Sendr fires, but now also what this page is allowed to show.
- **One of this document's own prior claims was wrong and is now corrected**, not just updated: Section 6.2 previously listed the "interrupted record" scenario as an unresolved gap. It isn't — the live automation already excludes it. See Section 6.2 for the correction and how the error happened.
- **The edit-access question is now permanently resolved**, not open: no edit capability belongs in this front end, in any form, ever. See Section 1 and Section 9.
- **Section 3.2 now specifies, per field, what this front end actually does with it** — not just why each field exists. Every one of the 28 fields now gets an explicit instruction: reads for display, reads for logic only, writes to, not needed by this front end, or open question. Fixing this also surfaced and corrected an under-specified claim in Section 2 — `Sequence Status`, `Day 4 Send Date`, and `Sendr Generation Status` were "read-only, mirrored" with no stated purpose; they're now explicitly marked not needed by this front end.
- **This app is now genuinely connected to Airtable, live, in production — not a prototype anymore.** Router, serverless proxy, real data wiring, and consent-gated display are all built, deployed, and independently verified against the real base across nine separate real tests this session, not just reported as done. Section 5's "hard blocker" framing is resolved. Section 9 is substantially rewritten to describe what's actually running today, not a disconnected mock.
- **Two more display bugs were found and fixed in the same pass, on top of the two already known:** the real footnote sentences (Section 8.1) were being fetched and computed correctly but silently never rendered anywhere in the UI; the expiry-threshold legend (Section 8.2) rendered for any field the classifier defaulted to "clear," including fields with no expiry date on file at all — not just fields genuinely tracked against a real date. Both confirmed fixed against live data, not just a local check.
- **Section 3.2's `Phone (Match Key)` instruction was wrong and is now corrected**, from "reads for logic only" to "not needed by this front end" — the real, deployed proxy never references it anywhere; the record ID is the lookup key end to end.
- **Section 9.3's `classSubclass` finding is now resolved, not just noted.** It exists only inside the disconnected `ContractorRecord` type alongside `EditRecordModal` — confirmed dead code, not "ahead of" anything.
- **The connection-mechanism item in Section 11 — the single biggest open item since this document's first review — is resolved.** A base-scoped, read-only Airtable PAT lives in Vercel's environment only, never reaches the client bundle, and every fetch is real-time per request against the live record.

---

## 1. Intent & Scope

### 1.1 What this tool actually exists to do — the full mechanism, not just the page

This has been underspecified in every prior version of this document, and it matters, because the display logic in Section 8 and the router requirement in Section 5 only make sense once this is understood.

**The primary path is a personalized video sales letter, not a webpage someone browses to.** A cold lead who was scraped and entered the outreach sequence gets, around Day 4, a personalized video — a talking head narrating their own WSIB and corporate-standing findings, built by Sendr. The video asks whether they'd like to discuss it further, and includes an email-confirmation mechanic: "if this is the right email, just confirm; if not, reply with the correct one" — paired with a booking link. **This webpage is the thing Sendr's video points to and pulls from, not the primary artifact itself.** Leads and GCs land here by clicking through from the video or the surrounding message, not by discovering the tool independently.

**After a call books, the relationship continues through this same data.** The plan is to follow up with a PDF of the findings (something the lead can hold onto and forward internally) and a one-pager explaining what TradeGRC does more broadly. The `Deliverables` table in the base (outside this front end's scope — see 1.4) looks purpose-built for this, though nothing currently populates it — flagged, not confirmed, in Section 11.

**A secondary path exists deliberately: self-search as lead capture.** The main tool URL should also offer an open search — a way for someone to look up their own business even if they were never scraped or reached by outreach. This is explicitly *not* expected to usually return a real result (most searchers won't have been checked yet) — the value isn't the result, it's the signal. Someone attempting a search is a warm lead-capture event in its own right, worth recording and acting on. See Section 5.3 for how this maps onto existing infrastructure.

### 1.2 Confirmed against the actual repository — this is the public, lead-facing page, not an internal tool

`metadata.json` names the app itself *"Public record compliance inspection and verification engine."* The footer reads "Public Record Engine." There is no `Sequence Status`, `Day 4 Send Date`, queue view, or anything GHL-shaped anywhere in the codebase. This is settled, not hedged.

### 1.3 No edit capability belongs in this front end, in any form, ever — permanently resolved

This was an open question in earlier work; it is now closed by explicit decision, not by default. **Corrections to compliance data happen directly in the Airtable dashboard. That is outside this repository's scope entirely.** Not gated, not flagged with a "no access control yet" notice — the capability is absent. `EditRecordModal.tsx` and the `handleSaveRecord`/`handleResetToDefault` handlers in `App.tsx` (see Section 9) are permanently out of scope and must not be wired in under any circumstance. Whether those files should be deleted outright or left in place marked as dead code is still open — see Section 12.

**A distinction worth holding onto precisely, since it's easy to conflate with the point above:** self-search (1.1, 5.3) is not editing. It's *creating a lead-interest signal and, where no record exists yet, a new queued record* — a fundamentally different action from *correcting existing compliance findings*. Do not read "no edit, ever" as blocking self-search. They are different capabilities answering different questions.

**There is also no separate internal staff tool being built, and none is planned.** Airtable's own dashboard fills that role permanently. This repository will not grow into a staff queue-management surface. Any language elsewhere in this document that still frames that as an open possibility is stale — flag it if you find it.

### 1.4 Scope boundary — confirmed, not just inferred

This front end's connection to Airtable should be scoped to the `Compliance Records` table only. The live base contains six other tables — `Clients`, `Projects`, `Documents`, `Alerts`, `Deliverables`, `Jurisdictions` — representing the entire post-sale Monitoring product and a genuine multi-jurisdiction expansion framework. None of it is this front end's concern. This is now confirmed, not assumed: the original Airtable implementation spec (see Section 10) explains that `Compliance Records`' own `Jurisdiction` field was added purely as forward-compatible scaffolding for a future beyond Ontario, not as a sign this pipeline connects to the separate, richer `Jurisdictions` table that actually serves `Clients`/`Projects`. The two are structurally unrelated.

### 1.5 What this front end is explicitly NOT

- **Not a client-facing dashboard** in the sense TradeGRC's positioning prohibits — it's a single-record, link-based lookup, not an ongoing portal a client logs into and returns to.
- **Not a self-search tool yet.** The router, proxy, real data, and consent gating are live and verified (Section 9); self-search itself (Section 6.3) has not been built.
- **Not a replacement for judgment about who should see what.** See Section 8 — display logic now carries real compliance weight, not just cosmetic polish.

---

## 2. System Map — Division of Labor

Four systems, not three — a correction from the prior version of this document, made after locating the original Airtable implementation spec (Section 10) that this document's earlier drafts didn't have access to.

| System | Owns | Front end's relationship to it |
|---|---|---|
| **GHL** | Cold outreach pipeline. Scraped leads live here first. Runs the multi-touch sequence (SMS → voicenote → video). Source of truth for `Sequence Status` and `Day 4 Send Date`. Also the intended **downstream recipient** of Sendr's generated asset URL. | **Not needed by this front end.** These two fields exist in Airtable for the outreach pipeline's own use — a lead or GC viewing their results has no reason to see their own sequence timing, and per Section 1.3 there's no staff-facing surface here that would need to monitor it either. Resolving this explicitly rather than leaving "read-only, mirrored" as an instruction with no stated purpose — see Section 3.2. |
| **Airtable** | The compliance data layer and computation engine — the `Compliance Records` table, all formulas, staleness tracking, footnote text, consent gating, and the automation deciding whether Sendr fires. | **This is the front end's actual database.** Every read (and, per Section 1.3, no write beyond what self-search requires) goes here — but not every field in it. Section 3.2 specifies which fields this app actually reads, versus which exist purely for Airtable's own automations. |
| **Sendr** | Generates the personalized outreach video and the surrounding sales-letter mechanics (Section 1.1). Reads compliance data via webhook from Airtable, and is expected to also read from this public results page for its video's visual compositing. **Deliberately engineered to never query a government site directly.** | **Indirect.** The front end doesn't talk to Sendr — it's the destination Sendr's output points to, and (per the unverified path below) possibly a data source Sendr's own systems read from directly. `Sendr Generation Status` and `Sendr Page URL` are Sendr's own pipeline state, not needed by this front end for the same reason as the GHL fields above — see Section 3.2. |
| **Zapier** | Per the original implementation spec (Section 10) — the intended mechanism for Sendr's *return leg*. Not independently verified live; no Zap has ever been observed running, since no Sendr account has existed to trigger one. | **None, currently.** Documented here because it changes the system map's shape, not because it's confirmed operating. |

### The webhook relationships — four now, not three

1. **GHL → Airtable** (lead intake / sequence sync). Never built — confirmed by the live automations list (Section 10), which shows only two automations total, neither GHL-related. If the front end assumes `Sequence Status` is fresh, that assumption is currently false.
2. **Airtable → Sendr** (`Trigger Sendr Generation`). Trigger logic is confirmed built and correct — see Section 6.2 for the real, verified five-condition trigger. **The webhook action itself has no live endpoint** — there is no Sendr account yet.
3. **Sendr → GHL, via Zapier** (per the original spec, unverified live). The spec states Sendr's Zapier trigger writes the generated page URL directly to a GHL custom field — not to Airtable. Pointing that same Zap at the `Sendr Page URL` field in `Compliance Records` is described as optional, for record-keeping only, not required for the outreach sequence itself to function.
4. **Airtable → GHL**, general sync (proposed, never built, deliberately deprioritized). Distinct from #3 — this would be a broader status sync, not just the Sendr URL specifically. Not currently worth building.

**A concrete, previously-unidentified gap this system map surfaces:** the original spec's webhook payload for #2 names the fields to send to Sendr as `Company Name`, `Phone (Match Key)`, `WSIB Status`, `Corporate Status`. `Company Name` hasn't existed as a field since the trade-name/legal-name split (Section 10). **Even the last known version of the Sendr payload spec is stale relative to the current schema.** This needs to be re-specified against the real field list in Section 3 before any real connection work happens — not assumed to still be correct.

---

## 3. Data Model — Read Directly From the Live Airtable Base

**This section is no longer a reconstruction.** Everything below was pulled directly from the live `Compliance Records` table (`tblmhPHCx6bR8rxgJ`, base `appQsa08HTuHcviRm`) via the Airtable API — field IDs, types, and (where applicable) real option names and their internal select IDs. Treat this section with full confidence; the "verify before trusting" caution that applies to the rest of this document's history applies far less here.

### 3.1 The dependency chain — still the single most important thing to internalize

Only the **trade/operating name** exists at intake — the **legal name** is not a known input. It's an *output* of the WSIB search:

1. Search WSIB using the trade name — the only name available at this point.
2. If matched, the WSIB certificate reveals the legal name as a byproduct.
3. The legal name — not the trade name — is what feeds the corporate registry search.
4. If WSIB has no match, the legal name never surfaces, and the corporate check becomes **structurally unreachable**, not a completed negative result.

**Front-end implication, unchanged from prior versions:** any UI representing compliance status needs a genuine third state beyond "checked" and "not checked" — *blocked, pending WSIB match* — visually and functionally distinct from *checked, nothing found*.

### 3.2 The real field list — 28 fields, not 22 — with an explicit instruction for each

The "22 fields" figure in prior versions of this document was wrong — a stale figure from a source document, never itself verified until now. The live table has 28.

**Prior versions of this section explained why most fields exist but not consistently what this front end is supposed to do with each one** — an audit of the document against itself found 5 of 28 fields fully specified both ways, 10 with origin but no instruction, and 7 with neither. That gap is closed here. Every row below states an explicit instruction — one of **reads for display** (shown to the viewer), **reads for logic only** (used internally, never itself rendered), **writes to** (this app creates or updates it, doesn't just read it), **not needed by this front end** (exists for Airtable's own automations or the outreach pipeline, with no legitimate reason for a lead or GC to see it), or **open question** (genuinely unresolved, not silently decided by omission).

| Field | Why it exists | What this front end does with it |
|---|---|---|
| `Trade/Operating Name` (`fldZRgy67LgPvDb3Z`) | The only name known at intake — primary field. | **Reads for display.** The business name shown on the results page. |
| `Legal Name` (`fldCimjSRh0sfJzsz`) | Output of the WSIB search (Section 3.1), not a known input. | **Reads for display.** Shown alongside the trade name (e.g., "operating as X, legally Y") — useful identity confirmation for a GC viewer, no exposure concern for the business's own findings about itself. |
| `Phone (Match Key)` (`fldLtZYRm0A9Ic7SL`) | The cross-system identity key (Section 4) — used by GHL/Sendr matching, not by this app. | **Not needed by this front end.** Corrected from an earlier "reads for logic only" — confirmed against the real, deployed proxy code, which never references this field anywhere. The record ID itself (via `Results Page Token`) is the lookup key end to end; phone plays no role in how this app resolves a record. |
| `Address` (`fldrmHCm7dAqitMb9`) | Printed on the real WSIB certificate, added for schema completeness. | **Reads for display**, treated as optional/lower-priority — useful for identity confirmation on larger or multi-location businesses, not essential for every view. |
| `Industry/NAICS Code` (`fld1LB81yR7iks9ax`) | Printed on the real WSIB certificate. | **Reads for display**, optional/lower-priority — descriptive context, not a load-bearing finding. |
| `WSIB Status` (`fldMlr2D1vxr5HuBK`) | Core finding. Options: `Active/Good Standing`, `Lapsed/Delinquent`, `No Account Found`, `WSIB No Match – Legal Name Unavailable`, `Not Yet Checked`. | **Reads for display** (via the footnote/badge system, Section 8.1) **and reads for logic** (drives `Quadrant Tag`, Section 7, and gates the Sendr automation, Section 6.2). |
| `WSIB Clearance Certificate Number` (`fldZlKTtEVt5epcfo`) | Renamed from `WSIB Account Number` (Section 10) — a real, per-certificate reference. | **Reads for display.** This is a genuine verification anchor — a viewer or GC could independently confirm it against WSIB's own lookup. Worth connecting directly to resolving the `provenanceHash` problem (Section 11): a real, checkable reference number is the legitimate version of the trust claim that field currently fakes. |
| `Stated WSIB Expiry Date` (`fldOP2iQoJBcAsJDw`) | Real, manually-entered date — replaced a flawed flat formula (Section 10). | **Reads for display and for logic** — the actual date shown, and the basis for any freshness/urgency framing once Section 7's tier-logic reconciliation is resolved. |
| `WSIB Footnote` (`fldmR2O52xbOsPTop`) | Fixed explanatory sentence per status value. | **Reads for display**, verbatim — see Section 8.1. |
| `Corporate Status` (`fldXnM5ktcFIF3kpi`) | Core finding, same pattern as WSIB Status. | **Reads for display and for logic** — same reasoning as `WSIB Status` above. |
| `Corporate Status Recheck Due` (`fldAwAPwnL0W11hu7`) | Its formula was never pulled during live verification — existence and type confirmed, contents not. | **Open question.** Don't assume a purpose for this one — check its actual formula before deciding what, if anything, the front end should do with it. |
| `Corporate Registry Reference` (`fld1j4HLdZTNynlVf`) | A real registry reference number. | **Reads for display** — same verification-anchor reasoning as the WSIB certificate number above. |
| `Business Name Registration Status` (`fldx6TfVEEvOyl4VT`) | Deliberately separate from `Corporate Status` — tracks the trade name's own registration cycle, a distinct risk from the corporation's annual-return standing. | **Reads for display**, as its own distinct finding — a business's trade-name registration can lapse independently of its corporate standing, and collapsing the two would misrepresent that. |
| `Business Name BIN` (`fldlnb2YgWfxiZrLn`) | Assumed distinct from `Corporate Registry Reference`; never independently verified. | **Reads for display**, same verification-anchor reasoning — but flag the unverified distinctness (Section 11) if both are ever shown side by side. |
| `Stated Registry Expiry Date` (`fldyaZCtz57BhmFHT`) | Real, manually-entered, own multi-year cycle. | **Reads for display and for logic** — parallel to the WSIB expiry date above. |
| `Corporate Status Footnote` (`fld5momntyPvjYEcW`) | Fixed explanatory sentence, same pattern as WSIB's. | **Reads for display**, verbatim. |
| `Date Checked` (`fldbIssuf16zJNfmB`) | Single field, not split per WSIB/Corporate (Section 6.2's noted structural gap). | **Reads for display.** The footnote text (Section 8.1) says "as of the date checked" without itself stating a date — this field is what makes that claim concrete rather than vague. Should be shown alongside the findings, not omitted. |
| `Lookup Status` (`fldzfg62obfeWK3Qj`) | Queue-lifecycle field, likely what `Daily Lookup Queue` filters against. | **Not needed by this front end.** Airtable/automation-internal. `WSIB Status`/`Corporate Status`'s own `Not Yet Checked` value already covers the pending-state display this app needs. |
| `Sequence Status` (`fldaicr6HBHKh85DI`) | Synced copy from GHL. | **Not needed by this front end.** Outreach-pipeline-internal — see Section 2. |
| `Day 4 Send Date` (`fldpBW5jXbgZ6Ogak`) | Synced copy from GHL. | **Not needed by this front end.** Same reasoning as `Sequence Status` above. |
| `Jurisdiction` (`fldv5Rh1GakCUOYzX`) | Forward-compatible scaffolding (Section 1.4), Ontario-only for now. | **Reads for display**, optional/low-priority — could reasonably be omitted from a first version entirely given it currently has one real value. |
| `Sendr Generation Status` (`fldic3jHXJgLdrt83`) | Sendr's own pipeline state. | **Not needed by this front end.** Same reasoning as the GHL fields — Sendr's internal status isn't something a viewer needs to see about their own results, and there's no staff surface here to monitor it either (Section 1.3). |
| `Sendr Page URL` (`fldg11U1nt0IoD22b`) | Likely populated via the unverified Zapier leg (Section 2). | **Not needed by this front end.** This app is effectively what that URL points to, not a consumer of it. |
| `Consent Status` (`fldGOimULCLXgbJkc`) | Governs whether a real, non-mock lookup can run (field description), and per Section 6.2 gates Sendr generation. | **Reads for logic only.** Drives the display-gating rule in Section 8.3 directly — never itself rendered as a value to the viewer. |
| `Consent Date` (`fldzNpjND7H6cwkdm`) | When consent was captured. | **Reads for logic only.** Backs the consent gate; no display purpose of its own. |
| `Results Page Token` (`fld9ineNypRhUsRUh`) | `RECORD_ID()` — the routing key (Section 4). | **Reads for logic only.** This is the URL key, not a value ever displayed to a viewer. |
| `Quadrant Tag` (`fldBiFdD6z8E4e6qq`) | Sendr-routing signal (Section 7). | **Open question**, deliberately — see Section 7's reconciliation with the repo's own tier logic. Not silently decided here. |
| `Compliance Lookup Events` (`fldvYnNUBo8MglmNR`) | Audit-log link, previously unconnected to anything. | **Writes to.** This is where self-search attempts get logged (Section 6.3) — a write target for this app, not a field it reads and displays. |

**Not a field, worth stating plainly since it's easy to assume otherwise:** there is no field distinguishing *how* a record entered the pipeline — cold outreach vs. self-search. If self-search leads should be treated as warmer (Section 1.1), this needs a new field. It doesn't exist today.

**Blocked vs. completed-negative — still the schema's central design principle.** `Corporate Status = Not Found` (a real search that came back empty) and `Corporate Status = Unreachable – No Legal Name` (the search couldn't run) are kept as separate values on purpose. This governs both the Sendr trigger (Section 6.2) and the footnote system (Section 8.1).

---

## 4. Identifiers & Keys

- **`Phone (Match Key)`** — confirmed live. This is the cross-system identity key and the front end's primary join key.
- **`Results Page Token`** — confirmed live as `RECORD_ID()`. Used for the public results page's URL. The underlying data it exposes is already independently public via the same government searches it summarizes, so the token controls incidental exposure, not a genuine secret — accepted as low-stakes on that basis, not because the token itself is provably unguessable.

**Do not use `Trade/Operating Name` or `Legal Name` as an identifier or lookup key for anything system-internal.** The legal name isn't even known at intake (Section 3.1), and trade names aren't unique across companies.

**A real tension worth naming, surfaced by the self-search feature (Section 5.3):** self-search's only natural user input is a company name — that's the one thing a person searching for their own business actually knows to type. This directly conflicts with the identifier guidance above. This needs a real matching/dedup strategy before self-search is built — not "search by name and hope it's unique," which would risk creating duplicate `Compliance Records` entries for the same business. This is listed as open in Section 12, not resolved here.

---

## 5. The Router — Resolved and Verified Live

This was previously documented as a hard blocker. It's now built, deployed, and confirmed working against real production traffic — not just merged code.

**What's built:** `react-router-dom`'s `BrowserRouter`, wrapping the app in `main.tsx`, with a `/r/:token` route resolving a `Compliance Records` entry via its `Results Page Token`. The in-memory `selectedRecordId`-only navigation is gone.

**What it took to actually get there, worth knowing since it shapes how much to trust "deployed" claims elsewhere in this document:** getting a client-side router working on Vercel took four real, distinct fixes, not one — a direct URL hit needs the server to fall back to `index.html` for the client router to handle it at all, which took two attempts to get the rewrite rule right (a same-to-same passthrough rule didn't work as intended; a negative-lookahead pattern, verified against Vercel's own documented example, did). Separately, the serverless API function crashed twice more even after routing was fixed, both times from Vercel's build system not bundling a cross-file import inside `api/` correctly — first suspected as an underscore-folder exclusion (a real, documented Vercel behavior, but not this project's actual cause), then resolved for real by inlining the helper code directly into the one function file rather than relying on any theory about Vercel's bundler.

**Verified, not assumed:** direct navigation to `/r/:token` (pasted into a fresh tab, not clicked through the app — the real-world usage pattern for a link in a video or email) confirmed working against a live record. The lesson worth carrying forward, not just this one fix: each of the four attempts above was reasoned correctly from documentation and still needed a real test against the live deployment to confirm it actually worked — three of the four reasoned fixes were wrong or incomplete on the first attempt.

---

## 6. Triggers

### 6.1 Baseline — built and tested

The `Daily Lookup Queue` view (per Section 3.2, most likely filtering on `Lookup Status`) surfaces records ready for a human to check. **This work happens in Airtable directly — staff do not work this queue inside this front end, per Section 1.3.** Any language elsewhere implying otherwise is stale.

**Framing correction worth repeating:** this pipeline is not primarily a discovery-call mechanism. The check happens automatically at Day 4, before anyone has spoken to the lead — it feeds the personalized video (Section 1.1), and the discovery call's role is to confirm and deepen a finding already shown, not reveal it for the first time.

### 6.2 The Sendr trigger gate — the real five-condition version, and a correction to this document's own prior claim

**A previous version of this document described this automation's trigger as a single condition** (`WSIB Status is not the blocked value`) **and separately flagged an "interrupted record" scenario as an unresolved gap the automation wouldn't catch. Both were wrong, and it's worth being direct about why:** the automation's real trigger, read directly from the live configuration, is a five-condition AND:

1. `Lookup Status` is one of `Checked – Match Found` or `Checked – No Match`
2. `Sendr Generation Status` equals `Not Sent`
3. `WSIB Status` does not equal `WSIB No Match – Legal Name Unavailable`
4. `Corporate Status` does not equal `Not Yet Checked`
5. `Consent Status` is one of `Consented — Inbound Reply` or `Consented — Monitoring Agreement`

**Condition 4 is the correction.** The scenario previously documented as an open gap — WSIB checked, a human interrupted before Corporate ran, `Corporate Status` left at `Not Yet Checked` — is exactly what condition 4 excludes. The automation already prevents Sendr from firing on that record. This document's earlier claim that it didn't was a misreading of the live filter, not a real finding — flagged here plainly rather than left silently corrected, since a wrong "known gap" is worse than no documentation at all.

**Condition 5 is new information, not a correction — consent gating.** See Section 8 for what this means and why it now extends beyond just this automation.

**Deployment status:** this automation's configuration is valid but it is currently **undeployed** — switched off. Combined with there being no live Sendr endpoint, nothing here is actually running yet. The front end should represent this as "armed, not live," never as functioning end-to-end.

### 6.3 Self-search — a confirmed feature, not a proposal, with real open sub-questions

Per Section 1.1, this is a deliberate, intended feature: a visitor searching for their own business, even unsuccessfully, is a lead-capture signal worth acting on.

**How this maps onto existing infrastructure:** the `Compliance Lookup Events` table (Section 3.2) — described as tracking "every lookup event or user interaction for auditing and improvement" — is built for exactly this and currently connects to nothing. A self-search attempt is precisely what it exists to record. If no matching `Compliance Records` entry exists, the natural move is creating one with `Lookup Status = Not Started`, which drops it directly into the same `Daily Lookup Queue` that cold-outreach leads already use — reusing the existing pipeline rather than building a parallel one.

**A component already exists for this, but isn't a ready-to-reconnect starting point.** `SearchModal.tsx` was built early and, during the real-data rewiring, was deliberately disconnected from the app rather than left active — a "browse all records" directory doesn't belong on a real per-token public page, per direct instruction in that session. It currently searches the old hardcoded mock array and nothing else. When self-search gets built, treat this as a component to repurpose for querying live Airtable data, not one to simply switch back on.

**What's genuinely still open here, not resolved by this section:**
- **The matching/dedup strategy** (Section 4) — company name is the only input a self-searcher has, and it's the one identifier this schema deliberately avoids trusting.
- **The entry-channel field** (Section 3.2) doesn't exist — if self-search leads should be treated as warmer than cold ones, as Section 1.1 implies, this needs to be built.
- **What a self-searcher sees when no record exists yet** — presumably some warm, on-brand "we're working on this" state rather than a dead result, but the exact copy and behavior aren't specified here.

---

## 7. Quadrant Tag — A Real, Live Signal This Document Previously Had No Knowledge Of

`Quadrant Tag` (`fldBiFdD6z8E4e6qq`) is a live formula field on `Compliance Records`, confirmed directly from the base:

```
IF(
  OR(
    WSIB Status = "Not Yet Checked",
    Corporate Status = "Not Yet Checked",
    WSIB Status = "WSIB No Match – Legal Name Unavailable",
    Corporate Status = "Unreachable – No Legal Name"
  ),
  "Pending / Insufficient Data",
  IF(
    WSIB Status = "Active/Good Standing",
    IF(Corporate Status = "Active", "Clean-Clean", "Clean-Flagged"),
    IF(Corporate Status = "Active", "Flagged-Clean", "Flagged-Flagged")
  )
)
```

This is a status-only 2×2 matrix — WSIB (clean/flagged) × Corporate (clean/flagged) — apparently meant to route Sendr's script to one of four variants. **This is a genuinely different concept from the display-tier logic the repository independently built** (a five-tier, date-driven "worst of the two" verdict system — see Section 9.3). Neither was built with knowledge the other existed: this document never mentioned `Quadrant Tag` until this revision, so the repo's tier system was built blind to it.

**This is an open reconciliation question, not something this document resolves.** Plausible directions, none chosen here: keep both as separate signals for separate purposes (Sendr routing vs. display urgency); read `Quadrant Tag` directly for the front end's own status display instead of the repo's home-grown system; or redesign the repo's tier logic to incorporate it. See Section 12.

---

## 8. Display Logic

### 8.1 The footnote system — unchanged, still accurate

A bare status badge overstates its own certainty. Two-tier design, only tier 1 built: a fixed sentence per status value, built as Airtable formula fields (`WSIB Footnote`, `Corporate Status Footnote`), read by the front end rather than reimplemented locally. The confirmed `SWITCH()` mapping from prior versions of this document still holds — both status enums were independently re-verified live in Section 3.2 and match exactly.

### 8.2 Status color-coding — still accurate, two known bugs still need fixing once Section 7 is resolved

The three-way scheme (green/orange/gray, blocked states rendering no badge at all) from prior versions still holds as the intended design. It hasn't been implemented in the repository yet — see Section 9.4 for the two concrete bugs (the expiry-threshold mismatch and the status-override regex negation) that need fixing once the Section 7 reconciliation decides what drives this display in the first place.

### 8.3 Consent-gated display — a new, decided rule, with the reasoning behind it

**This is the single most consequential addition in this revision, and it's a decision, not a proposal.**

Previously, `Consent Status` was understood only as a gate on whether Sendr generates a video (Section 6.2, condition 5). It does not, on its own, stop this webpage from rendering full detail to anyone holding a valid link or performing a self-search — the two are structurally separate paths, and only one of them was gated.

**Why this became urgent rather than theoretical:** self-search (Section 6.3) opens this page to a materially different audience than a token link ever did. A token link only reaches someone TradeGRC specifically sent it to. Self-search is open to anyone — a competitor, a GC doing back-channel diligence, a rival trade contractor — who types a business name into a box. If that search matches an existing record with real findings from a business that's simply never replied yet, a random third party could see genuine WSIB or corporate findings for a business that has no relationship with TradeGRC and never consented to anything being checked.

**The decided rule, applying uniformly across both the token-link page and self-search — no tiers, no exceptions:**

> **If `Consent Status` is not `Consented — Inbound Reply` or `Consented — Monitoring Agreement`, this page must never render a real WSIB or Corporate finding — regardless of how the record was reached.** Instead, show a warm, on-brand, non-committal state (e.g., "a compliance review is underway for this business, we'll be in touch") — never a dead page, never the actual status.

**Why "no consent" is treated identically to "revoked," rather than more leniently:** an earlier draft of this decision considered a middle tier — gate `Revoked` strictly, leave `No Consent` visible on the reasoning that the underlying WSIB/OBR data is already public record. That reasoning is legitimate on its own, but it was designed around token-link exposure specifically. Once self-search is in scope, "never asked" and "actively said no" carry the same practical risk — a stranger typing a name into a search box either way — so the simpler, uniform rule was chosen deliberately over the more permissive tiered version.

**What this does not affect:** Section 6.2's Sendr gate is unchanged and was already correct — this section extends the same underlying principle to a surface that previously had no protection at all, it doesn't modify the automation.

---

## 9. Verified Against the Actual Repository (`abdiyusuftech/TradeGRC-Internal-Tool`)

Everything in this section is read directly from the code and, where noted, from live production tests — not from reports about the code. Sections 1–8 above describe the intended integration; this section describes what actually exists today, which is now the *connected* state, not the original prototype.

### 9.1 This app is genuinely connected to Airtable, live, in production

This section previously said there was no backend at all. That's no longer true. `api/records/[token].ts` is a real Vercel serverless function, self-contained (no cross-file imports inside `api/`, after that specific approach caused two of the four deployment failures below), reading directly from the live `Compliance Records` table using a base-scoped, read-only Airtable PAT stored only in Vercel's server-side environment — never reaching the client bundle. `src/lib/api.ts` fetches from it via a relative `/api/records/:token` call. `src/data/contractors.ts` and the mock `SAMPLE_CONTRACTORS` array still exist in the repo, but only as data for the disconnected components in 9.2 — the live `/r/:token` route never touches them.

### 9.2 The manual-check interaction model exists as UI, but is permanently out of scope

Unchanged from before: `EditRecordModal.tsx` and `App.tsx`'s `handleSaveRecord`/`handleResetToDefault` handlers are still fully built but never imported or called, and per Section 1.3 this stays permanently out of scope by explicit decision, not by accident. Whether these files get deleted or left in place marked as dead code is still open — Section 12.

### 9.3 What's now resolved, and the one thing that isn't

The divergences documented in earlier versions of this section — free-text status instead of real enums, one combined verdict instead of two footnotes, no distinct blocked state — are resolved. The real-data rewiring rebuilt the display logic around the live `WSIB Status`/`Corporate Status` enums directly, restored two independent footnote fields (Section 8.1, now actually rendering — see 9.4), and gave blocked status its own distinct, correctly-worded state rather than folding it into "Incomplete — verify the BIN."

**One divergence remains, and it's now fully confirmed rather than half-known:** `classSubclass` exists only inside the disconnected `ContractorRecord` type (9.2) — dead code, not something the live page reads or shows. It was never added to the live Airtable schema either (Section 3.2). Not "ahead of" anything; just unused on both sides.

### 9.4 Four bugs found and fixed this cycle — worth knowing the pattern, not just the count

Two were the originally documented display-logic bugs; two more were found during live verification of the fix for those:

- **The two originally documented bugs are fixed.** The shared expiry-threshold band and the status-override regex negation (both previously described here in detail) no longer exist in the current display logic, which reads the real status enums and uses separately-scaled thresholds per field (10/21-day for WSIB, 30/90-day for Corporate) rather than one shared band.
- **Fixing those surfaced two more, found only by checking the actual rendered page against real data, not by reading the code alone.** The real footnote sentences were being fetched and computed correctly the whole time but never rendered anywhere in the UI — a silently dropped value, not a data problem. Separately, the threshold legend was rendering for any field the classifier defaulted to "clear," including fields with no expiry date on file at all, not just fields genuinely being tracked against a real date. Both are now fixed and confirmed against a real record's actual live values, not just a passing typecheck.

**The pattern worth carrying forward, not just this instance of it:** every one of these four bugs, and three of the four deployment fixes in Section 5, looked correct on a code read and turned out to be wrong or incomplete only once tested against something real. Reading the code is necessary here; it has not once been sufficient on its own this session.

### 9.5 `provenanceHash` — removed, not resolved

The fake "Verified ONBIS & WSIB Data" claim (a raw string with no real hashing or verification logic behind it) has been removed from `WhatHappensNext.tsx` entirely, rather than replaced with anything. That closes the immediate risk of shipping a false trust claim, but it was a decision made without an explicit sign-off — whether removal is the final answer, or whether the real certificate-number verification idea (Section 3.2) should still be built, is still open. See Section 12.

### 9.6 What's already right, worth keeping

The legal disclaimer copy in `WhatHappensNext.tsx` is careful and correctly scoped, consistent with established copy guardrails. Design tokens (`#1B2126`, `#C1501C`, `#2F6B4F`) match the brand system exactly. Neither needs rework.

### 9.7 What's actually been verified live, and how — for whoever reads this next

Not a claim of "it works" — a record of what was specifically tested, against what, so the next session can trust this section without re-deriving it:

- Direct navigation to `/r/:token`, pasted into a fresh tab (not clicked through the app), against a real Airtable record — confirmed working after four deployment-layer fixes (Section 5).
- The API endpoint hit directly, isolated from the frontend — confirmed returning real JSON, not the app's own HTML or a crash, after the same four fixes.
- Consent gating, both directions, against a real record: with `Consent Status` unset, the raw API response contained no real WSIB/Corporate values, only `{"status":"gated","tradeName":"..."}` — confirmed from the actual response body, not the rendered page alone. With `Consent Status` set to `Consented — Inbound Reply` on that same record, the real `Corporate Status = Active` finding rendered correctly.
- The footnote and threshold-legend fixes (9.4), confirmed against that same record's real, known field values — footnote text present where expected, threshold legend absent where the record has no expiry date on file.

**One byproduct of this testing worth knowing about:** record `recgFsRR4lFtbNvAV` in the live base now has `Consent Status = Consented — Inbound Reply`, set directly during this verification, not by the app itself. It's one of the nine sparse test records already established as throwaway data, not a real lead — flagged here so it doesn't get mistaken for something the app did on its own.

---

## 10. Schema History — Where the Current Design Came From, and What It Corrected

This section exists because an original Airtable implementation spec document surfaced during this project and turned out to be the actual "before" picture of the live schema — genuinely useful for understanding *why* several current fields are shaped the way they are, not just *that* they are.

- **`Company Name` (one field) → `Trade/Operating Name` + `Legal Name` (split).** The original spec used a single field; the live schema splits them, consistent with the dependency chain in Section 3.1.
- **`WSIB Account Number` → `WSIB Clearance Certificate Number`.** A rename reflecting what the real certificate actually calls it — a per-certificate reference tied to one validity window, not a permanent account ID.
- **`Data Valid Until` (`DATEADD({Date Checked}, 90, 'days')`, one formula for both WSIB and Corporate) → two separate, manually-entered expiry dates.** This is the direct historical origin of the bug in Section 9.4 — a flat 90-day formula, applied identically to a ~42-day cycle and a multi-year cycle, was tried once in Airtable and abandoned in favor of real entered dates. The repository's `getTierFromDays` independently reintroduced the identical mistake, apparently with no awareness it had already been made and fixed once.
- **`WSIB Status` / `Corporate Status`: 4 options each in the original spec → 5 live**, the fifth being each field's blocked-state value. Confirms the blocked-vs-completed-negative distinction (3.1's central principle) was a genuine, deliberate later refinement, not part of the original design.
- **Consent gating does not appear anywhere in the original spec.** `Consent Status`, `Consent Date`, and condition 5 of the Sendr trigger (6.2) are all later additions. This document infers the likely reasoning is Canada's anti-spam consent-to-contact requirements around the *outreach itself*, distinct from the already-public underlying WSIB/OBR data — but that reasoning is inferred, not confirmed anywhere, and is stated here as inference, not fact.
- **The original spec's Sendr webhook action payload** (`Company Name`, `Phone (Match Key)`, `WSIB Status`, `Corporate Status`) **is stale** — `Company Name` no longer exists post-split. See Section 2's flagged gap.

**One item flagged from this spec, checked against live data, and left honestly unresolved:** the original spec's `Pending Sendr Generation` view filter is a two-condition rule that doesn't reflect the automation's real five-condition trigger (6.2). If the live view's filter was never updated to match, a human working from that view could see records as "ready" that the automation would actually skip — most likely due to missing consent. Direct verification was attempted: every record in the live table was pulled and checked, but the base currently holds only 9 sparse test records, none with `Consent Status` populated, so the discrepancy can't be observed in real data one way or the other. There is also no tool available in this process that reads a view's filter definition directly — only what's currently in a view, not why. **This needs manual confirmation directly in Airtable's UI.** One reassuring fact from the same check: nothing in this base has run at real volume yet — both automations are undeployed, and every record is clearly test data. Every gap this document flags is still cheap to fix, because none of it has touched a real lead.

---

## 11. Known Gaps & Explicitly Out of Scope

- **Automated OBR/WSIB scraping** — not part of this build. Manual, human-performed lookup remains the system of record, a deliberate decision, not an oversight.
- **`provenanceHash`'s removal as the final answer** (9.5) — it's gone, but whether that's the actual resolution or a placeholder pending real verification (e.g., the certificate-number idea, Section 3.2) was never explicitly confirmed.
- **Delete vs. mark-dead** for `EditRecordModal.tsx` and its two orphaned handlers (9.2) — explicitly deferred, not decided.
- **The Quadrant Tag reconciliation** (Section 7) — open, not decided here.
- **The stale Sendr webhook payload** (Section 2) — needs re-specifying against the real Section 3 field list before any real connection work happens on that leg specifically (distinct from the now-working Airtable→frontend connection in Section 9).
- **The Zapier leg** (Section 2, Section 10) — documented per the original spec, never independently verified live.
- **The `Pending Sendr Generation` view's real, current filter** (Section 10) — flagged, attempted, not resolvable from outside Airtable's own UI.
- **`Corporate Registry Reference` vs. `Business Name BIN`** — assumed genuinely distinct; never independently verified against a real corporate-only lookup.
- **The entry-channel field** (cold outreach vs. self-search) — doesn't exist yet; needed if self-search leads should be treated as warmer, per Section 1.1's stated intent.
- **The self-search matching/dedup strategy** (Section 4, Section 6.3) — genuinely unresolved; company name is the only available input and the one identifier this schema deliberately avoids trusting.
- **Whether the `Deliverables` table is actually wired to anything** for the post-booking PDF/one-pager flow (Section 1.1) — flagged as a plausible fit, not confirmed populated or connected.

---

## 12. Decisions Needed From You

1. **Delete vs. mark-dead** for the orphaned edit-capability code.
2. **`provenanceHash`** — confirm removal is the final answer, or build the real certificate-number verification instead.
3. **The Quadrant Tag reconciliation** — keep both systems, merge them, or replace the repo's tier logic with `Quadrant Tag` directly.
4. **The self-search matching strategy** and whether/how to add an entry-channel field.
5. **Confirm the scope boundary** (Section 1.4, `Compliance Records` only) — treated as settled based on the original spec's Jurisdiction explanation, but worth one explicit line of confirmation given how much else in this document has turned out to need correcting once actually checked.
