import { z } from "zod";
import { notifyOwner } from "./notification";
import { getBillingStatus, type BillingPlanId } from "./billing";
import { getUserBillingState } from "./billingRuntime";
import { createPayPalOrder, capturePayPalOrder } from "./paypal";
import { getCapabilityManifest } from "./capabilities";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";

const safeUrl = z.string().url().refine(value => value.startsWith("https://") || value.startsWith("http://localhost"), "Invalid redirect URL");

export const systemRouter = router({
  health: publicProcedure
    .input(z.object({ timestamp: z.number().min(0, "timestamp cannot be negative") }))
    .query(() => ({ ok: true })),

  capabilities: publicProcedure.query(() => ({
    assistant: "smart-workspace-agent",
    capabilities: getCapabilityManifest(),
  })),

  billing: publicProcedure.query(() => getBillingStatus()),

  myBilling: protectedProcedure.query(({ ctx }) => getUserBillingState(ctx.user.id)),

  createPayPalOrder: protectedProcedure
    .input(z.object({ planId: z.enum(["pro", "business"]), returnUrl: safeUrl, cancelUrl: safeUrl }))
    .mutation(async ({ input }) => createPayPalOrder(input.planId as BillingPlanId, input.returnUrl, input.cancelUrl)),

  capturePayPalOrder: protectedProcedure
    .input(z.object({ orderId: z.string().trim().min(1).max(190) }))
    .mutation(async ({ input }) => capturePayPalOrder(input.orderId)),

  notifyOwner: adminProcedure
    .input(z.object({ title: z.string().min(1, "title is required"), content: z.string().min(1, "content is required") }))
    .mutation(async ({ input }) => ({ success: await notifyOwner(input) } as const)),
});
