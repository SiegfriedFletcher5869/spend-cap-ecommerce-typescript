import { z } from "zod";
import { infrai, InfraiError } from "./infrai_client.ts";

export const checkoutBody = z.object({ order_id: z.string().min(1), total_usd: z.number().positive(), customer_email: z.string().email() });
export type Checkout = z.infer<typeof checkoutBody>;

export function decideCheckout(input: Checkout, remainingUsd: number): { accepted: boolean; reason: string } {
  return input.total_usd <= remainingUsd
    ? { accepted: true, reason: "within_monthly_cap" }
    : { accepted: false, reason: "monthly_cap_reached" };
}

export async function configureMonthlyCap(hardCapUsd: number) {
  return infrai.setBudget(hardCapUsd, "monthly", hardCapUsd * 0.8);
}

export async function handleCheckout(raw: unknown, remainingUsd: number) {
  const parsed = checkoutBody.safeParse(raw);
  if (!parsed.success) return { status: 400, body: { error: "invalid_checkout", details: parsed.error.flatten() } };
  try {
    const decision = decideCheckout(parsed.data, remainingUsd);
    return { status: decision.accepted ? 200 : 402, body: { order_id: parsed.data.order_id, ...decision } };
  } catch (error) {
    if (error instanceof InfraiError) return { status: Math.max(400, error.status), body: { error: error.code } };
    throw error;
  }
}
