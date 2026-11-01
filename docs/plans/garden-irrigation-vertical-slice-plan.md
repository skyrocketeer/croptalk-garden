# Garden irrigation vertical slice plan

## Goal

Deliver one complete customer interaction: select an authorized real plot in Croptalk Garden, request irrigation, follow the existing CRM worker task through assignment and worklog, verify completion, then refresh the garden from authoritative Cultivation data.

The Garden is a client only. It handles selection, request confirmation, status display, and visual feedback. A backend operation coordinator validates plot entitlement and state, prevents duplicate requests, and links the operation to a CRM task. CRM remains authoritative for task assignment, worker worklog, and manager approval. Cultivation remains authoritative for plots, cycles, and irrigation records.

## Scope

- Stage 1: load real authorized plots, select/highlight any plot, and show actions derived from backend state.
- Stage 2: complete irrigation from request through manager assignment, worker completion, manager verification, and authoritative garden refresh.
- Out of scope until this slice passes acceptance: planting and cultivation, game progress effects, harvest, inventory, delivery, and marketplace (Stages 3–5).

## Confirmed architecture findings

- Garden is a standalone Vite/TypeScript client in `src/main.ts`; it currently has no customer authentication or backend client. The current two plot hit areas and action state are mock data.
- The Garden foundation plan explicitly defers customer authentication and customer-to-plot authorization.
- The existing Croptalk storefront identity contract uses shared Firebase Auth with verified email, exchanges an ID token with CRM as `audience: storefront`, permits only `CUSTOMER`, and keeps the CRM access token in the storefront's host-only HTTP-only `hydroworks_session` cookie. Ecommerce exposes same-origin `/api/auth/me` and server-side CRM proxies; Garden currently runs as a separate Vite app and cannot read that cookie.
- Cultivation Service owns farms, plots, cycles, and irrigation activities. Its current principal policy explicitly rejects `CUSTOMER`; planned activity creation is manager-only, while assigned staff can complete a planned activity directly. There is no operation-to-CRM-task link or customer-facing plot entitlement API.
- CRM owns staff tasks, assignments, audit, worker task start/worklog, and manager task approval. Task create/assign/approve are manager actions. Worker completion is recorded through the existing Agent task workflow.
- A task approval does not currently update a linked Cultivation activity. Cross-service linking, idempotency, and status delivery are new integration work.

## Constraints and invariants

- Resolve authenticated customer identity and server-side customer-to-plot entitlement before exposing real plots or allowing requests.
- Never trust browser-supplied user, tenant, farm, plot ownership, assignment, or completion status.
- Use a stable idempotency key and backend uniqueness/locking so retries cannot create duplicate task commitments.
- Only manager-approved worker completion may update the Cultivation irrigation activity to completed.
- Garden must show unknown/pending/error states honestly and must not imply irrigation happened before verification.
- Do not add planting, cultivation, harvest, or marketplace behavior in this vertical slice.
- Preserve unrelated dirty and untracked repository work. Do not run database migrations against live environments, deploy, or promote releases in this task.

## Owner plans

- Garden client: [`garden-irrigation-client-plan.md`](garden-irrigation-client-plan.md)
- Storefront identity/BFF: [`Ecommerce customer session owner plan`](</Users/jimmy/Public/code/ecommerce/docs/plans/garden-irrigation-customer-session-plan.md>)
- Manager assignment queue: [`Portal manager queue owner plan`](</Users/jimmy/Public/code/aigri-agentic-portal/docs/plans/garden-irrigation-manager-queue-plan.md>)
- Cultivation operation authority: `/Users/jimmy/Public/code/cultivation-service/docs/plans/garden-irrigation-operation-plan.md`
- CRM task bridge: `/Users/jimmy/Public/code/crm-service/docs/plans/garden-irrigation-task-bridge-plan.md`

## Dependency-aware sequence

### Gate A — Resolve product and security contracts

- [x] Reuse Ecommerce's existing verified Firebase customer identity contract; do not create a second Garden identity or expose CRM access tokens to browser code.
- [x] Garden uses its own origin and BFF, shared Firebase customer sign-in, and its own HTTP-only session cookie; the Ecommerce host-only cookie is not shared across origins.
- [x] Cultivation Service owns server-side customer-to-Dedicated-Plot entitlement, with manager-maintained links and a distinct `CUSTOMER` capability scoped to linked plots.
- [x] An authenticated customer may request irrigation only for an actively linked Dedicated Plot. Cultivation retains it as pending until a manager sets the approved task wage and assigns a worker, then CRM creates the task. No pricing or payment is part of this slice.
- [x] Reuse the CRM manager-assignment, existing worker workflow, and manager-approval path.
- [x] Reuse the current worker task worklog/evidence and CRM manager approval as verification; do not invent irrigation volume, method, timing, or proof requirements.
- [x] Cultivation owns the operation record and validation; a private CRM bridge owns task creation, assignment lifecycle, worker completion, approval, and an idempotent verified-result callback.
- [ ] Define durable idempotency, retry, and compensation for CRM task creation and the approval callback across service boundaries.

### Gate B — Implement contracts and persistence

- [x] Add Cultivation-owned customer-to-Dedicated-Plot entitlements, manager assignment/revocation, and a distinct CRM-validated CUSTOMER plot projection.
- [x] Add a Cultivation-owned irrigation operation with stable identity, authenticated requester, authorized plot/cycle, linked CRM task fields, lifecycle status, audit timestamps, and idempotency.
- [x] Validate current plot/cycle/farm relationship and customer entitlement server-side before request creation.
- [ ] Create or link one real CRM task using the existing task lifecycle; expose only customer-safe status for the linked operation.
- [ ] Route manager approval to a single verified Cultivation activity completion, with replay/concurrency protection.
- [ ] Define compensation/retry behavior for partial failures between Cultivation and CRM before enabling the request path.

### Gate C — Connect and verify Garden

- [x] Replace the two demo plot markers with real authorized plot records and stable plot IDs.
- [x] Derive irrigation availability from active farm/plot and active crop state from Cultivation; leave unsupported actions unavailable.
- [x] Submit with confirmation and idempotency; display submitted, awaiting assignment, assigned, in progress, awaiting verification, completed, failed, or cancelled from server state.
- [ ] Refresh the plot only after verified completion; add lightweight visual feedback that does not imply physical work before that point.
- [ ] Verify unauthorized/cross-tenant plots, incompatible state, duplicate requests, worker worklog, manager approval, retry behavior, and error handling.

### Later stages

- Stage 3 adds planting and cultivation against the same operation framework.
- Stage 4 adds status-driven animations, progress, notifications, and refreshed visuals.
- Stage 5 adds verified harvest allocation and marketplace integration only after physical inventory ownership and reservation rules are approved.

## Clarification state

- The user requested the staged roadmap and explicitly selected one complete interaction before expanding scope.
- The user chose the existing Croptalk customer identity contract, CRM manager assignment/approval, and Cultivation-owned operation with a private CRM task bridge.
- The existing Ecommerce identity contract is confirmed in source. It uses an HTTP-only host-only session; the separate Garden app cannot read it directly.
- The user selected a Garden-origin BFF, shared Firebase sign-in, and a Garden-owned HTTP-only session.
- Cultivation Service will own manager-assigned Dedicated Plot customer links and authorize `CUSTOMER` reads/irrigation requests only for linked plots. Current Cultivation auth explicitly rejects `CUSTOMER`, so this requires a distinct scoped capability.
- CRM requires an assignee and positive unit wage when it creates a task. The user selected a manager queue to set the approved wage and assign an eligible worker before task creation.
- Risks acknowledged: Garden needs a server-side runtime; operation-to-task creation spans Cultivation and CRM; manager assignment/approval remain authoritative; no price/payment is part of this slice; CRM approval must notify Cultivation idempotently before Garden shows completion.
- **Clarification sign-off:** Approved by the user on 2026-10-22 to implement Stage 1 and Stage 2 only. The Garden-origin BFF uses shared Firebase customer identity and a Garden-owned HTTP-only session; Cultivation owns manager-maintained customer-to-Dedicated-Plot links; CRM manager assignment, worker worklog, and manager approval remain authoritative.
- Later stages 3–5 remain out of scope for this implementation.
- No service code, schema, task, or live farm state has been changed for this plan.
