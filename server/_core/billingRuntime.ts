import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { billingSubscriptions, billingUsage } from "../../drizzle/schema";
import { getBillingPlan, type BillingPlan } from "./billing";

const periodKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

export async function getUserBillingState(userId: number) {
  const db = await getDb();
  if (!db) return { plan: getBillingPlan("free"), usage: null, periodKey: periodKey() };
  const currentPeriod = periodKey();
  const [subscription] = await db.select().from(billingSubscriptions)
    .where(and(eq(billingSubscriptions.userId, userId), eq(billingSubscriptions.status, "active")))
    .orderBy(desc(billingSubscriptions.updatedAt)).limit(1);
  const [usage] = await db.select().from(billingUsage)
    .where(and(eq(billingUsage.userId, userId), eq(billingUsage.periodKey, currentPeriod))).limit(1);
  return { plan: getBillingPlan(subscription?.planId), usage: usage ?? null, periodKey: currentPeriod };
}

export async function recordBillingUsage(userId: number, input: { messages?: number; toolExecutions?: number; tokens?: number }) {
  const db = await getDb();
  if (!db) return;
  const key = periodKey();
  const [existing] = await db.select().from(billingUsage)
    .where(and(eq(billingUsage.userId, userId), eq(billingUsage.periodKey, key))).limit(1);
  if (existing) {
    await db.update(billingUsage).set({
      messageCount: existing.messageCount + (input.messages ?? 0),
      toolExecutionCount: existing.toolExecutionCount + (input.toolExecutions ?? 0),
      tokenCount: existing.tokenCount + (input.tokens ?? 0),
      updatedAt: new Date(),
    }).where(eq(billingUsage.id, existing.id));
    return;
  }
  await db.insert(billingUsage).values({
    userId,
    periodKey: key,
    messageCount: input.messages ?? 0,
    toolExecutionCount: input.toolExecutions ?? 0,
    tokenCount: input.tokens ?? 0,
  });
}

export function billingLimit(plan: BillingPlan) {
  return plan.monthlyMessages;
}
