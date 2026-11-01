# Garden client owner plan — irrigation vertical slice

## Goal

Connect the standalone Garden UI to real authorized plots and the server-owned irrigation operation lifecycle while keeping task and farm operation rules out of the renderer.

## Existing files and boundaries

- `src/main.ts` renders the scene and handles delegated browser interactions. The clickable #04/#05 plots and task status panel are mock-only state added for review.
- `src/garden-game.css` owns plot marker and contextual panel visuals.
- `src/i18n.ts` and inline locale mappings own current language behavior.
- `package.json` provides Vite and TypeScript only; there is no auth SDK or API client yet.
- `docs/plans/croptalk-garden-foundation-plan.md` says customer auth and server-side customer-to-plot authorization must be decided before real production integration.
- The user selected the existing Croptalk customer identity contract. Ecommerce uses Firebase verified-email sign-in, CRM `audience: storefront`, and a host-only HTTP-only `hydroworks_session` cookie exposed to its own Next.js server routes. A separate Garden origin cannot read or reuse that cookie directly.

## Checklist

- [x] Use a Garden-origin BFF, the shared Firebase customer identity, and a Garden-owned HTTP-only session. The Ecommerce cookie is host-only and is not shared.
- [x] Add the BFF customer session exchange and API client using a server-configured tenant; never expose the CRM bearer token or tenant ID to Garden browser code.
- [x] Load stable plot records from the agreed customer-safe backend endpoint; remove demo plot IDs and mock state.
- [x] Keep selection, focus, and animations local; derive eligibility, task status, and operation state from server responses.
- [x] Confirm the irrigation request; send an idempotency key and the selected plot reference only. Show awaiting manager assignment until a manager sets the approved wage and assigns an eligible worker.
- [ ] Render pending/error/empty states without claiming work occurred; refresh authoritative plot state only after server-confirmed verification.
- [ ] Keep planting/cultivation buttons unavailable until their backend rules are implemented in the later Stage 3 slice.
- [ ] Verify keyboard, touch, narrow viewport, duplicate click, stale state, unauthorized plot, and API failure behavior.

## Verification

- TypeScript/Vite build.
- Browser check of plot list, plot selection, confirmed irrigation submit, status progression, verified refresh, and failure states using a safe local/staging environment.
- No claim of end-to-end completion without evidence from real CRM worker assignment/worklog/approval and Cultivation persistence.

## Blockers

- Garden needs a server-side runtime at its own origin; the production hosting target remains outside this implementation plan.
- Cultivation customer-to-Dedicated-Plot entitlement ownership is confirmed; the manager API and customer-scoped endpoint contract remain to be implemented.
- The browser must not call manager-only Cultivation or CRM task endpoints with customer credentials.
- Final status and refresh contract depends on a backend coordinator and CRM-to-Cultivation verification path.

## Clarification sign-off

- User approved Stage 1 and Stage 2 on 2026-10-22.
- Garden uses its own origin BFF and HTTP-only session while reusing shared Firebase customer identity.
- Production hosting/deployment and rollout remain outside this implementation scope.
