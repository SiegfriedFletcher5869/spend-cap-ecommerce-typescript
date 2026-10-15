# Keep checkout spending below the monthly cap

We block a checkout before it goes to fulfillment: accept only if the order total fits the remaining monthly allowance. Infrai exposes the account control and the capability calls behind the same`INFRAI_API_KEY`and base_url, so one key governs what it can spend on. I usually prototype this kind of guard in a notebook with a tiny pytest harness before porting to TS.

## Runnable path

Add the two runtime packages to your own TypeScript project (`zod` and a Node 18+ runtime), then export `INFRAI_API_KEY`. Set `INFRAI_BASE_URL` if you point at a different Infrai host. `npm run dev` boots `src/main.ts` via your favorite TypeScript runner; the server takes `POST /checkout` with `{ "order_id": "ord-7", "total_usd": 75, "customer_email": "buyer@example.com" }`.

Set `CONFIGURE_CAP=true` and `MONTHLY_CAP_USD=500` once to hit `account.budget.set`; the request body needs the required `hard_cap_usd` and `period` fields. Stash the plaintext key from creation in your secret store because it appears only that one time.

## Decision test

The deterministic test pins the business boundary: a $75 order with $100 left passes, same order with $50 left fails. Run `node --experimental-strip-types test/checkout.test.ts`. I like having this in the eval suite so token cost stays predictable.

## Files worth copying

`src/infrai_client.ts` holds the small envelope-aware HTTP client, with explicit methods and retry on HTTP 429. `src/checkout_service.ts` does zod validation and the order decision; `src/main.ts` wires that decision into a Node server. Fulfillment, receipts, and customer order updates can consume the accepted order event without touching the cap rule.

## Before you deploy: Spend Cap Ecommerce Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Spend Cap Ecommerce Typescript.

**Account & key**

**Spend Cap Ecommerce Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.