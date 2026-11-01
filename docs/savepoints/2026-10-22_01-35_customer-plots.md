# Savepoint: customer plot access

## Goal

Implement the approved Stage 1–2 Croptalk Garden vertical slice: real authorized plots and irrigation through manager task assignment, worker worklog, manager approval, and authoritative garden refresh.

## Current step

Stage 1 backend foundation is implemented. Next: manager Portal UI for customer-to-plot links, then operation request, CRM manager assignment queue, worker workflow callback, and Garden BFF/client.

## Files changed

- `cultivation-service/migrations/000005_garden_plot_customers.{up,down}.sql` — tenant-scoped, auditable active customer-to-plot links.
- `cultivation-service/internal/auth/context.go`, `internal/auth/http.go` — separate CUSTOMER auth purpose; staff/manager policy unchanged.
- `cultivation-service/internal/handler/router.go`, `internal/handler/garden_customer_api.go` — manager link list/assign/revoke and customer-only linked-plot projection.
- `cultivation-service/internal/handler/garden_customer_api_test.go`, `internal/auth/http_test.go` — eligibility and authorization tests.
- `cultivation-service/docs/openapi.yaml`, `README.md` — document the new customer and entitlement routes.
- `crm-service/internal/handler/auth_grpc.go`, `internal/handler/auth_grpc_test.go` — allow CRM CUSTOMER principal only under the `GARDEN_CUSTOMER_PLOTS` purpose.
- `croptalk-garden/docs/plans/*`, `cultivation-service/docs/plans/*`, `crm-service/docs/plans/*`, `aigri-agentic-portal/docs/plans/garden-irrigation-manager-queue-plan.md` — synchronize owner plans and sign-off.

## Validation

- `gofmt` passed on changed Go files.
- Focused Cultivation auth and handler suites passed: 84 tests across 2 packages via an isolated GOPATH using existing cached modules.
- The normal Go module-mode test command is blocked by this host's Go 1.26 toolchain reporting standard-library packages as missing; migration execution and PostgreSQL integration checks have not run.

## Remaining steps

- Add Portal UI for manager assignment/revocation of customers to Dedicated Plots.
- Resolve pending operation → CRM manager task creation with manager-selected worker and positive wage.
- Add idempotent CRM task link and approval callback/outbox to Cultivation.
- Add Garden-origin BFF, shared Firebase customer login, own HTTP-only session, and live plot/action UI.
- Verify the complete safe local workflow and update all owner plans.

## Open issues

- Portal repository edits require sandbox escalation because the repository is outside the configured writable roots.
- CRM task creation requires a positive wage and assigned worker; the user selected the manager queue path, so the Portal queue must collect both before CRM creates the task.
- No production migrations, task creation, or deployment have occurred.
