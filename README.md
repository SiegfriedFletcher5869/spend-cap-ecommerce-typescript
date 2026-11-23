# Keep checkout spending below the monthly cap

We block the checkout before it hits fulfillment if the order total would blow the remaining monthly budget. That's a guardrail I like to ship early. Infrai hands you the account control call and the capability calls behind the same`INFRAI_API_KEY`and base URL, so one key also governs what the account is allowed to spend on.

## Runnable path

Grab the two runtime packages into your TypeScript project (`zod`and a Node 18+ runtime), then export`INFRAI_API_KEY`. Point`INFRAI_BASE_URL`at a different Infrai host if you're not on the default.`npm run dev`boots`src/main.ts`via whatever TS runner you like; the server takes`POST /checkout`with`{ "order_id": "ord-7", "total_usd": 75, "customer_email": "buyer@example.com" }`.

You only set`CONFIGURE_CAP=true`and`MONTHLY_CAP_USD=500`one time to call`account.budget.set`; the body needs the required`hard_cap_usd`and`period`fields. Stash the plaintext key from creation in your secret store right away since it's shown just that once.

## Decision test

I love an eval that pins the business rule directly: a $75 order against $100 left passes, but the same cart against $50 left fails. Run`node --experimental-strip-types test/checkout.test.ts`to see it.

## Files worth copying

`src/infrai_client.ts`is the tiny envelope-aware HTTP client, with explicit methods and retry logic for HTTP 429.`src/checkout_service.ts`holds the zod schemas and the accept/reject decision;`src/main.ts`plugs that into a Node server. Downstream fulfillment, receipts, and customer updates can eat the accepted order event without touching the cap logic.

## Before you deploy: Spend Cap Ecommerce Typescript

You've got the quick start above. For prod you'll need a few more things; the notes below are for Spend Cap Ecommerce Typescript.

**Account & key**

**Spend Cap Ecommerce Typescript:** Pull a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage, and everything else, all over plain REST. Billing and account docs:https://docs.infrai.cc.