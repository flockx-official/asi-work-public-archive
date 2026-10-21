# Phantom decline follow-up: approval card durability

## Background

Work agents were reporting "the user declined {tool} so I stopped" for tool calls
the user never declined. The root cause analysis (RCA) traced this to a harness
bug, not model hallucination:

1. A sensitive tool call enters approval. The harness marks the tool request
   `goose.executable = false` (persisted in the session DB) and emits an
   approval card (in-memory / turn-scoped).
2. A concurrent process (goose acp plus a scheduled `goose run --resume`
   monitor) can trip SQLITE_BUSY mid-turn. The executable flag patch
   persists, but the approval card does not.
3. On resume, the conversation is rebuilt. `pending_tool_requests()` saw
   `goose.executable = false` with no approval card and concluded the request
   was declined, injecting a DECLINED_RESPONSE tool error.

Two of the three fix items already shipped:

- Item A (shipped): lost approval cards no longer fabricate a decline. Only an
  explicit user denial or a durable `goose.declined` policy marker yields
  `ToolDisposition::Decline`; a lost card re-raises the approval prompt.
- Item C (shipped): policy denials now persist a durable `goose.declined`
  marker so they remain distinguishable from lost cards across crash and
  resume.
- Item B (this plan): make the approval card durable so the user is never left
  with an invisible pending approval after a mid-turn interruption.

## Goal

After any mid-turn interruption (SQLITE_BUSY, crash, restart), a tool call that
was awaiting approval either shows the user a pending approval card or is
re-raised as one automatically. The persisted session state alone must be
sufficient to reconstruct whether a request was awaiting approval.

## Approach

Persist an explicit pending-approval marker alongside the executable flag, in
the same write, so the two cannot diverge:

1. Add a `goose.approval_pending` boolean to tool request meta, set to `true` at
   the same moment the harness emits the approval card (in
   `ops_tool_approval.rs`, alongside `mark_executable`). The patch and the card
   emission must be part of the same effect batch applied before the turn
   yields.
2. Clear the marker when a decision is recorded: on explicit user response
   (allow or deny) and on policy denial (the denial path already writes
   `goose.declined`; it should also clear `approval_pending`).
3. On resume, treat `approval_pending = true` as "re-raise the card":
   `pending_requests()` / `pending_tool_requests()` return the request so the
   approval flow re-emits a fresh card to the user. This is the same recovery
   path already implemented for lost cards in items A and C, now with an
   explicit signal instead of inference from the executable flag.
4. Migration and compatibility: requests written by older builds carry
   `goose.executable = false` with no `approval_pending` key. Treat a missing
   key as unknown, not false, and continue to use the existing lost-card
   recovery logic (executable false, no answer, no declined marker implies
   re-raise). The new marker is an optimization for clarity and ordering, not a
   behavior gate.

## Implementation steps

1. Define `TOOL_APPROVAL_PENDING_KEY = "goose.approval_pending"` and helpers
   `request_approval_pending(request) -> Option<bool>` and
   `mark_approval_pending(tool_call_id) -> GooseEffect` in
   `crates/goose/src/agents/state_machine/ops_tool_approval.rs`, mirroring the
   existing `TOOL_DECLINED_KEY` pattern.
2. In the approval request path (where `mark_executable(false)` and the card
   emission happen), add `mark_approval_pending` to the same effect vector so
   both writes are applied in one transaction-equivalent batch.
3. In the decision path (user response and policy denial), patch
   `goose.approval_pending = false`.
4. Update `pending_requests()` and `pending_tool_requests()` to include
   requests with `approval_pending = true` or `approval_pending` absent but
   executable false (compat path).
5. Unit tests in `ops_tool_approval.rs` and `ops_toolcalling.rs`:
   - pending marker plus executable false re-raises the card
   - pending marker cleared by an allow response executes
   - pending marker cleared by a policy denial does not re-raise
   - legacy request (executable false, no marker, no declined) still re-raises
6. Validation via CI only: Lint Rust Code, Check Rust Code Format, Check MSRV,
   Build and Test Rust Project, Build and Test TLS Backend (both backends).

## Risks and mitigations

- Risk: the meta patch and card emission still land in separate DB writes, so
  SQLITE_BUSY could interrupt between them. Mitigation: this plan persists the
  marker with the executable patch (one write ordering: executable false +
  approval pending together), and the card itself is reconstructible from the
  marker, so a lost card is no longer a lost approval.
- Risk: double cards (one persisted, one re-raised). Mitigation: the
  confirmation coordinator deduplicates by tool request id; verify in tests.
- Risk: marker never cleared on some path leaves a stuck pending approval.
  Mitigation: clear it in every terminal path (allow, deny, policy denial,
  external dispatch) and add a test for each.

## Out of scope

- Retrying SQLITE_BUSY writes (covered by the session DB busy retry work).
- Transient stream retry (separate in-flight work).
- Changing DECLINED_RESPONSE copy (the disposition fix removes the false
  decline at the source).
