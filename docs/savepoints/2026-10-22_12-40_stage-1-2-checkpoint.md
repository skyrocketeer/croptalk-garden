# Savepoint: Stage 1–2 implementation checkpoint

## Goal
Complete the approved Croptalk Garden Stage 1–2 vertical slice: real authorized plot selection and irrigation request through manager assignment, CRM worker completion, manager verification, and authoritative Garden refresh.

## Current step
Stage 1 and part of the Stage 2 foundation are implemented. The Garden client/BFF and Cultivation customer entitlement/operation APIs exist. CRM manager task bridge/status reconciliation and Portal manager workflows remain outstanding; end-to-end completion is not established.

## Files changed
- Garden: `src/main.ts`, `src/customer-auth.ts`, `src/garden-api.ts`, `src/garden-game.css`, `server.mjs`, `server/api.mjs`, `server/api.test.mjs`, `vite.config.ts`, package/config/docs. Added shared Firebase customer login and Garden-origin HTTP-only session; data-driven plot selection and irrigation request UI.
- Cultivation: customer entitlement migration/API/auth and irrigation operation migration/API/router/callback. Manager links customers to plots; customer operations are idempotent and scoped; CRM status callback records verified irrigation activity.
- CRM: customer-purpose auth change and config for Cultivation URL/credentials. No manager bridge/task-link persistence or CRM-to-Cultivation task status callback yet.
- Portal: customer-to-plot manager UI and Cultivation hooks/services implemented. Irrigation assignment queue UI remains outstanding.
- Plans: Garden master/client plans updated for completed contracts and client foundation.

## Validation status
- Cultivation focused auth/handler suite: passed via cached GOPATH (`GOPATH=/private/tmp/croptalk-cultivation-gopath GOCACHE=/private/tmp/croptalk-go-cache GO111MODULE=off go test cultivation-service/internal/auth cultivation-service/internal/handler`).
- Garden production build: passed.
- Garden BFF Node tests: 3/3 passed.
- Earlier CRM active-customer auth focused test passed; current full CRM focused validation is pending.
- Portal TypeScript and lint passed earlier; browser manager UI blocked because local development login failed and Chromium was unavailable to capture script.
- No database migration applied to a live database; no deployment performed.

## Remaining steps
1. Finish CRM manager bridge: validate operation through Cultivation, require approved positive wage/worker/group, create normal CRM staff task once, durably link task, and deliver worker/manager lifecycle updates to Cultivation idempotently.
2. Finish Portal irrigation queue UI with eligible worker and task-group selection, manager-set positive wage, and assignment submission.
3. Confirm Cultivation transition ordering/authentication and add durable retry/compensation handling around cross-service calls.
4. Verify Garden BFF request/status contracts against service endpoints; complete build/test checks and browser capture if a valid local account/runtime is available.
5. Sync all owner plans and savepoint; report runtime proof limits. Stages 3–5 remain out of scope.

## Open issues
- Cross-service transaction between CRM task creation, Cultivation task linking, and lifecycle callbacks needs durable retry/outbox or a safe compensating path.
- Garden production hosting/runtime configuration is outside this implementation.
- Manager Portal browser verification could not pass local dev login; no end-to-end operation has been run with real farm data.
