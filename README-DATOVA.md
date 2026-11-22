# DATOVA

**Tagline:** Data Made Easy. Connections Made Better.

DATOVA is a Nigerian digital-services platform concept. This repository currently contains the responsive frontend/PWA prototype.

## Included
- Responsive DATOVA landing/dashboard preview
- Animated opening splash and four-step onboarding
- Light and dark appearance toggle
- Login/create-account modal preview
- Data and airtime service entry points
- Coming-soon cards for electricity, cable TV, internet and education PINs
- PWA manifest, app icon and basic service-worker shell

## Run
Open `index.html` in a browser for a basic preview. For PWA installation and service-worker testing, serve the repository over HTTPS (for example, deploy the static prototype to a suitable HTTPS host).

## Important: prototype only
This is **not a production VTU platform**. Login and signup are visual previews only. No customer accounts, database, wallet, checkout, payment gateway, VTU provider, transaction processing, admin dashboard, order history, refunds, or live data/airtime delivery are connected. Service cards intentionally do not claim to complete purchases.

Before accepting real money or placing real orders, implement and test:
1. Authentication and account recovery.
2. Server-side database access and role-based admin permissions.
3. A secure backend (for example, Supabase Edge Functions) for all provider and payment requests.
4. A Nigerian payment gateway integration with verified server-side payment webhooks.
5. A VTU aggregator integration, sandbox testing, supplier-float monitoring and transaction-status reconciliation.
6. Idempotency, duplicate-order protection, timeouts, reversals/refunds, audit logs and customer support workflows.
7. Proper wallet ledger controls and a compliance review before holding customer balances or enabling transfers.

**Never place VTU API keys, payment secret keys, service-role keys or other secrets in browser JavaScript or public repository files.** Store secrets only in the server-side secret manager.

## Current stage
Frontend foundation only. Backend and commercial integrations are intentionally not enabled yet.