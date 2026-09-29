import assert from "node:assert/strict";
import { decideCheckout } from "../src/checkout_service.ts";

const order = { order_id: "ord-7", total_usd: 75, customer_email: "buyer@example.com" };
assert.deepEqual(decideCheckout(order, 100), { accepted: true, reason: "within_monthly_cap" });
assert.deepEqual(decideCheckout(order, 50), { accepted: false, reason: "monthly_cap_reached" });
console.log("checkout cap decisions pass");
