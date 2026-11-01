# Croptalk Garden — Khu vườn biết nói

Standalone customer-facing web project for the Croptalk Garden experience.

## Current scope

The first planned slice is Garden and production tracking only. Customers can follow a virtual garden linked to real production, but the initial pilot does not sell services or promise harvest, delivery, or tradeable inventory.

The game is an interaction layer. Any production status shown to customers must come from an authorized, verifiable operational source. Virtual growth must never be treated as physical output.

## Product documents

- [Product vision](docs/croptalk-garden-product-vision.md)
- [Foundation implementation plan](docs/plans/croptalk-garden-foundation-plan.md)

## Project status

The Garden UI and Firebase-to-CRM customer session flow are implemented. Live sign-in and production data still require the Firebase, CRM, and Cultivation environment configuration.

In Vite development mode, the login page also offers **Đăng nhập bằng tài khoản demo**. This local-only test session loads one clearly marked sample plot for UI testing. It does not create a Firebase or CRM session, connect to farm services, or appear in production builds.

## Local development

```bash
pnpm install
pnpm dev
```

## Customer session and server API

Garden uses the shared Firebase customer identity and its own Garden-origin HTTP-only CRM session. Configure `VITE_FIREBASE_*` values from the existing Croptalk Firebase web app. Garden is a HydroWorks-only asset and uses the Hydroworks tenant configured in its server-side BFF. CRM validates the Firebase ID token and customer role, while Cultivation enforces customer-to-plot entitlements.

The Vite development and preview servers expose the same-origin `/api` BFF middleware. Production Node deployments serve `dist/` and the BFF from `node server.mjs` after `pnpm build`. Do not expose CRM access tokens, internal service credentials, or tenant selection to the browser.
