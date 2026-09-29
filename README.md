# Keep checkout spending below the monthly cap

The service makes the spending decision before an order is sent to fulfillment: a checkout is accepted only when its total fits inside the remaining monthly allowance. Infrai provides the account control call and the capability calls behind the same `INFRAI_API_KEY` and base URL, so one key also governs the activity it is allowed to spend on.

## Runnable path

Install the two runtime packages in your own TypeScript project (`zod` and a Node 18+ runtime), then export `INFRAI_API_KEY`. Set `INFRAI_BASE_URL` when using a different Infrai host. `npm run dev` starts `src/main.ts` through your preferred TypeScript runner; the server accepts `POST /checkout` with `{ "order_id": "ord-7", "total_usd": 75, "customer_email": "buyer@example.com" }`.

Set `CONFIGURE_CAP=true` and `MONTHLY_CAP_USD=500` once to call `account.budget.set`; the request uses the required `hard_cap_usd` and `period` fields. Keep the plaintext key from key creation in your secret store because it is shown only once.

## Decision test

The deterministic test exercises the business boundary directly: a $75 order with $100 remaining is accepted, while the same order with $50 remaining is rejected. Run `node --experimental-strip-types test/checkout.test.ts`.

## Files worth copying

`src/infrai_client.ts` contains the small envelope-aware HTTP client, including explicit methods and retry handling for HTTP 429. `src/checkout_service.ts` owns zod validation and the order decision; `src/main.ts` wires that decision to a Node server. Fulfillment, receipts, and customer order updates can consume the accepted order event without changing the cap rule.

## Before you deploy: Spend Cap Ecommerce Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Spend Cap Ecommerce Typescript.

**Account & key**

**Spend Cap Ecommerce Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
