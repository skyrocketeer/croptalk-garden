# Croptalk Garden — Khu vườn biết nói

## Showcase

![Bảng thiết kế UI Croptalk Garden](docs/showcase/00-design-board.png)
*Bảng thiết kế UI — định hướng giao diện các màn hình chính.*

![Khu vườn của tôi](docs/showcase/02-garden.png)
*Ảnh chụp từ bản dev đang chạy.*

| Đăng nhập | Lô đất & thao tác |
|---|---|
| ![Đăng nhập vào khu vườn](docs/showcase/01-login.png) | ![Chi tiết lô đất](docs/showcase/03-plot-panel.png) |

| Marketplace | Cộng đồng |
|---|---|
| ![Marketplace nông sản](docs/showcase/05-marketplace.png) | ![Cộng đồng người làm vườn](docs/showcase/06-community.png) |

| Cửa hàng |
|---|
| ![Cửa hàng Croptalk](docs/showcase/04-shop.png) |

<p align="center">
  <img src="docs/showcase/07-garden-mobile.png" width="300" alt="Khu vườn trên mobile" />
</p>
<p align="center"><em>Giao diện mobile — vườn của tôi</em></p>

Screenshots chụp từ bản dev (`pnpm dev`) với tài khoản demo trải nghiệm.

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
