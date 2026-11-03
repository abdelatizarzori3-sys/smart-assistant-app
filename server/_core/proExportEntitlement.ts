import { and, eq, gt, inArray, isNotNull, lte } from "drizzle-orm";
import { billingSubscriptions } from "../../drizzle/schema";
import { getDb } from "../db";

const PRO_EXPORT_PLAN_IDS = ["pro", "business", "enterprise"] as const;

export type ProExportEntitlement =
  | { granted: true; reason: "active" }
  | { granted: false; reason: "purchase_setup_required" | "unavailable" };

/**
 * The payment provider has not been selected or wired yet. This is deliberately
 * not inferred from client state, return URLs, or a payment order. A future
 * provider integration must set verifiedAt only after verifying a provider
 * webhook and persisting the subscription period for the authenticated user.
 */
export function getProExportPurchaseStatus() {
  return {
    configured: false as const,
    state: "setup_required" as const,
  };
}

/**
 * Looks up a server-verified, paid subscription that is still in its active
 * period. Any missing database, verification datum, cancellation, expiry, or
 * query failure denies the entitlement.
 */
export async function getProExportEntitlement(userId: number, now = new Date()): Promise<ProExportEntitlement> {
  try {
    const db = await getDb();
    if (!db) return { granted: false, reason: "unavailable" };

    const [subscription] = await db
      .select({ id: billingSubscriptions.id })
      .from(billingSubscriptions)
      .where(
        and(
          eq(billingSubscriptions.userId, userId),
          eq(billingSubscriptions.status, "active"),
          inArray(billingSubscriptions.planId, PRO_EXPORT_PLAN_IDS),
          isNotNull(billingSubscriptions.providerSubscriptionId),
          isNotNull(billingSubscriptions.verifiedAt),
          isNotNull(billingSubscriptions.currentPeriodStart),
          isNotNull(billingSubscriptions.currentPeriodEnd),
          lte(billingSubscriptions.currentPeriodStart, now),
          gt(billingSubscriptions.currentPeriodEnd, now),
        ),
      )
      .limit(1);

    return subscription ? { granted: true, reason: "active" } : { granted: false, reason: "purchase_setup_required" };
  } catch (error) {
    console.warn("[billing.pro-export] Entitlement lookup failed", error);
    return { granted: false, reason: "unavailable" };
  }
}
