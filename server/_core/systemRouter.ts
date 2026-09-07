import { z } from "zod";
import { notifyOwner } from "./notification";
import { getBillingStatus } from "./billing";
import { getUserBillingState } from "./billingRuntime";
import { getCapabilityManifest } from "./capabilities";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";

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

  notifyOwner: adminProcedure
    .input(z.object({ title: z.string().min(1, "title is required"), content: z.string().min(1, "content is required") }))
    .mutation(async ({ input }) => ({ success: await notifyOwner(input) } as const)),
});
