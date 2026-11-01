# Croptalk Garden — Foundation implementation plan

## Goal

Deliver the first Foundation slice of Croptalk Garden: a customer can create a virtual garden, link it to a real plot, bed, or verifiable production allocation, and follow its production diary and evidence. This initial pilot does not sell services or promise a harvest/delivery. Game state is a presentation and interaction layer; it cannot create inventory or tradeable produce.

This plan covers Garden and production tracking only. Paid service enrollment, harvest fulfillment, Marketplace trading, multi-farm network expansion, service credits, and transferable tokens remain out of the initial pilot scope and require subsequent scope approval.

## Decisions and constraints

- Participation in the game is optional; agricultural services must be accessible without playing.
- Support Dedicated Plot, Shared Production, and Harvest Allocation as distinct customer entitlements.
- Production lifecycle: growing/planned (not goods) → harvested and verified (physical lot) → allocated with valid disposition rights (tradeable balance).
- Tradeable quantities require verified physical production or a valid allocation against a verifiable real supply source.
- Reserve or decrement quantities atomically when an order is placed; unavailable quantities cannot be presented as available.
- Tenant, identity, entitlement, and inventory authority remain server-side.
- MVP rewards are non-transferable Garden XP; use ordinary approved payment methods. Do not implement HydroWorks Token. Credits remain a later evaluation.
- Preserve existing unrelated work in all repositories. No production migrations or deployments are included without their normal approval gates.

## Confirmed scope and remaining decision

- Confirmed: the first customer pilot is Garden and production tracking only; there is no paid service sale yet.
- Confirmed product constraint: customers must be able to access agricultural tracking without gameplay.
- Proposed starting constraint: one existing farm and a small invited cohort, subject to pilot operations confirmation.
- To verify in discovery: current Cultivation Service ownership for farms, plots, cycles, crops, activities, and production evidence; do not assume it already supports customer-facing access or allocation records.
- Confirmed: build a separate customer-facing web experience, not a customer area inside the operations Portal or an extension of the worker Mini App.
- Confirmed: use Vite and begin with Dedicated Plot as the initial production relationship.

## Implementation sequence

### Initial scaffold and Garden UI checkpoint

- [x] Create the standalone Vite app with TypeScript and a local development/build command.
- [x] Build the responsive Garden shell for the Dedicated Plot pilot with Garden and Diary views; real/animated modes share one farm layout.
- [x] Use truthful unlinked/empty states; do not fabricate customer, plot, crop, or production data.
- [x] Use an original isometric garden-game scene with compact game navigation and gentle animation.
- [x] Keep virtual garden artwork visibly separate from the real Dedicated Plot status panel; show no fake balances, harvest quantities, or farm updates.
- [x] Add the farm-map labels, simulated weather/crop callouts, map menu, mascot message, and action buttons; keep simulated data explicitly marked.
- [x] Keep watering visual-only and harvest unavailable until physical production is verified.
- [x] Match the reference dashboard composition with the game scene, real-plot detail, and Foundation summary panels; omit the device mockup.
- [x] Remove the requested footer tagline.
- [x] Keep one farm layout and replace the separate real-plot page tab with an in-scene Real/Animated mode switch.
- [x] Show an explicit no-real-image state until farm imagery is connected; switching modes does not invent farm data.
- [x] Remove the separate real-plot navigation route and the redundant header mode badge; retain real/animated mode control in the garden scene.
- [x] Keep view navigation synchronized with browser history.
- [x] Verify production build and inspect the Garden UI in a browser.
- [ ] Continue with customer authentication and real production access discovery before adding customer data.

Browser inspection confirmed the reference-style dashboard, Garden/Diary navigation, and both scene modes; the real mode shows a no-image state until imagery is connected. The requested footer tagline is absent. Screenshot-file export was unavailable in the current macOS session.

### 0. Confirm pilot scope and map current contracts

- [x] Decide the initial customer client surface: a separate web experience for customers.
- [x] Select Vite as the app toolchain and Dedicated Plot as the first tracking model.
- [ ] Select pilot farm, crop(s), customer cohort, tracking cadence, and operational owner; exclude pricing, payment, and delivery commitments from this initial slice.
- [ ] Inspect current CRM customer identity/tenant contracts, Cultivation production and activity APIs, Asset evidence flow, and the candidate client shell. Defer Order/payment/fulfillment integration unless later scope adds commerce.
- [ ] Produce a contract map showing authoritative owner for customer entitlement, production source, harvest lot, allocation, order, and delivery status.
- [ ] Identify API/data gaps; agree which service owns each new concept before schema changes.

**Gate:** the app scaffold and empty Garden experience may proceed. Customer data integration waits until the pilot operating model and authoritative service ownership are confirmed.

### 1. Define production and entitlement contracts

- [ ] Define the common customer-facing production link for Dedicated Plot, Shared Production, and Harvest Allocation without implying physical ownership where none exists.
- [ ] Define state transitions, minimum evidence, actor permissions, and audit history for planned/growing, harvested/verified lot, allocated balance, reservation, fulfillment, cancellation, and adjustment.
- [ ] Define quantity units, precision, quality status, lot identity, source farm, harvest date, allocation rights, and available/reserved/fulfilled balances.
- [ ] Define idempotency and concurrency behavior so reservations cannot oversell a lot or allocation.
- [ ] Define cancellation/release and discrepancy handling; unverifiable or failed harvest cannot silently become available inventory.
- [ ] Document API contracts and migration/backfill strategy before implementing cross-service changes.

**Gate:** service owners approve contracts and invariants; no client-supplied tenant or entitlement value is trusted as authority.

### 2. Build the Garden and tracking service path

- [ ] Add only the backend records/endpoints missing from existing service capabilities, assigning each to its domain owner (likely Cultivation for production evidence/lot linkage and Order/Fulfillment for customer order and delivery state).
- [ ] Implement server-authoritative customer entitlement linking to a plot, shared production allocation, or harvest allocation.
- [ ] Implement production diary and evidence reads with tenant/customer authorization and stable references to existing Asset evidence.
- [ ] Display harvest as verified only when an authorized operator has recorded suitable evidence and the authoritative service confirms it; do not expose tradeable balances in this initial slice.
- [ ] Add audit events for customer/production links, evidence changes, status changes, and corrections.
- [ ] Add focused unit/contract tests for authorization, visibility, lifecycle transitions, and evidence references.

**Gate:** service-level tests prove customers cannot view another customer's or tenant's production, and virtual growth cannot be represented as harvested goods.

### 3. Build the customer experience

- [ ] Implement a customer garden with a clear distinction between virtual plants/progress and linked real production.
- [ ] Present only the production participation types supported by the pilot data and explain their distinct relationship to physical production.
- [ ] Show diary, dated evidence, and production status; label expected estimates separately from verified quantities.
- [ ] Keep a non-game route to production tracking and support; defer service enrollment and harvest/delivery actions from the initial tracking pilot.
- [ ] Show game crops as planned/growing only until verified harvest and valid allocation are returned by the authoritative API.
- [ ] Do not present tradeable availability or order/delivery actions in this slice. Never derive physical output from virtual plant count, growth animation, or predicted yield.
- [ ] Add Vietnamese and English copy for all customer states, errors, and empty states.

**Gate:** UI acceptance confirms a customer can understand whether a plant is virtual, linked to production, or supported by verified harvest evidence, and can access tracking without gameplay.

### 4. Pilot operations and rollout

- [ ] Define operator workflow and permissions for linking customers to production and recording evidence/status.
- [ ] Prepare support and exception procedures for crop loss, delayed updates, missing evidence, and incorrect customer/production links.
- [ ] Seed/configure one pilot farm and a limited customer cohort; confirm consent and customer-facing terms for tracking.
- [ ] Run end-to-end staging scenarios for each supported tracking model, no-game access, delayed or failed harvest, tenant isolation, and corrected evidence.
- [ ] Review pilot metrics: activation, tracking engagement, evidence freshness/completeness, support rate, and customer demand for paid service.
- [ ] Expand only after pilot demand and operational reliability meet agreed thresholds.

**Gate:** user/operator sign-off on pilot evidence and metrics before production rollout; follow each service's migration/tag/GitOps release gates.

## Likely repositories and areas

Final ownership depends on the contract review in Step 0. Candidate areas:

- `/Users/jimmy/Public/code/croptalk-garden`: new standalone customer-facing Garden and production-tracking repository; initialized locally with the product vision and current plan.
- `aigri-agentic-portal`: internal operator workflows, existing Cultivation screens/services, and EN/VI localization; do not add customer screens by default.
- `mini-app`: existing Telegram-authenticated worker workflows; no Phase 1 customer UI planned.
- `cultivation-service`: authoritative farms/plots/cycles/planting/activity evidence and potentially verified harvest source records.
- `order-service`: order, reservation, fulfillment, cancellation, and reconciliation if these contracts fit its current domain.
- `crm-service`: customer identity, tenant membership, and server-side authorization only where existing contracts require extension.
- `asset-service`: evidence storage only; avoid duplicating domain ownership of harvest or entitlement metadata.

Do not change every candidate repository by default. Step 0 assigns the smallest set of owners based on live code and existing APIs.

## Verification plan

- Run repository-specific formatting, lint, type, and focused test commands for each changed repository, following its `AGENTS.md`/`CLAUDE.md` instructions.
- Verify service contracts and authorization boundaries, including cross-tenant access rejection.
- Verify lifecycle and quantity invariants, including unverified harvest, partial harvest, concurrent reservation, duplicate requests, cancellation, and release.
- Run an authenticated end-to-end staging pilot for all three production types and a no-game service path.
- For any portal UI change, use the `ui-verification` skill and capture target, URL, DOM, screenshot, and console evidence.
- Treat static checks, staging behavior, database migration, and production rollout as separate evidence; report each distinctly.

## Client surface decision

- **Chosen:** a separate customer-facing web experience.
- Keep the first release deliberately thin: Garden and production tracking only, with no service sales, payments, order/delivery actions, Marketplace, credits, or token.
- Reuse existing backend contracts and domain services where they fit; do not copy domain logic into the new client.
- Keep customer identity and access separate from the internal operations Portal and worker Mini App. Confirm the supported login method and server-side customer-to-production authorization in discovery before choosing an implementation pattern.
- This plan lives in the standalone Croptalk Garden repository. Choose the deployment route and domain after reviewing current hosting and app conventions.

## Clarification

- **Resolved:** customer experience is a separate web application in this repository.
- **Resolved:** use Vite (user selected it over the Next.js recommendation).
- **Resolved:** Dedicated Plot is the initial tracking model.
- **Scope approved:** start with the app scaffold and Garden UI shell. This approval covers the initial UI foundation checkpoint only; it does not approve service/API, schema, customer authentication, production deployment, or commerce changes.
- **Deferred before real customer data:** identify customer authentication and customer-to-plot authorization; inspect Cultivation APIs and determine the authoritative operator workflow for linking a plot and recording evidence/status.
- **Acknowledged risk:** until those contracts are confirmed, the app must not show fabricated customer, plot, crop, harvest, or production data. Initial UI uses an unlinked/empty Garden state.
- **Sign-off:** user requested project start and selected Vite plus Dedicated Plot on 2026-10-21; cleared for the initial scaffold/UI checkpoint only.

## Risks and open questions

- **Tracking model:** decide whether initial tracking supports Dedicated Plot, Shared Production, Harvest Allocation, or a smaller subset; these affect entitlement data and customer language.
- **Customer access:** confirm login method, customer account source, and server-side customer-to-production authorization.
- **Source of truth:** verify current Cultivation data can represent customer-to-production links and evidence/status without a new domain boundary.
- **Web operations:** choose deployment target, domain, and app framework after checking current hosting and app conventions.
- **Pilot operations:** name the team accountable for evidence capture, status updates, customer support, and corrections.
- **Future commerce:** price, payments, delivery, credits, food-safety and transfer rules remain future decisions because the initial pilot does not sell services.
- **Economy scope:** Garden XP may be non-transferable later; credits and token work remain explicitly out of scope.

## Status

- Planning draft based on the product decisions in `docs/croptalk-garden-product-vision.md`.
- Customer surface decision is confirmed: separate web experience.
- Local repository created at `/Users/jimmy/Public/code/croptalk-garden` and seeded with the product vision and Foundation plan.
- Initial Vite scaffold and game-style Garden UI checkpoint complete. Customer authentication, production data contracts, deployment, and pilot operations remain unresolved and out of scope for this checkpoint.
