export type BillingPlanId = "free" | "pro" | "business" | "enterprise";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  monthlyPriceUsd: number | null;
  monthlyMessages: number | null;
  features: string[];
};

/** Provider-neutral monetization configuration. Payment secrets never belong in source control. */
export const BILLING_PLANS: BillingPlan[] = [
  { id: "free", name: "مجاني", monthlyPriceUsd: 0, monthlyMessages: 50, features: ["المحادثة الأساسية", "المهارات الأساسية", "سياق الملفات المتاح"] },
  { id: "pro", name: "Pro", monthlyPriceUsd: 9, monthlyMessages: 2000, features: ["جميع المهارات", "سياق أطول", "أولوية التنفيذ", "إنتاجية أعلى"] },
  { id: "business", name: "Business", monthlyPriceUsd: 29, monthlyMessages: 10000, features: ["كل قدرات Pro", "مساحات عمل للفريق", "حدود استخدام أعلى", "إدارة الفريق"] },
  { id: "enterprise", name: "Enterprise", monthlyPriceUsd: null, monthlyMessages: null, features: ["خطة مخصصة", "دعم الشركات", "حدود واستخدام مخصصان"] },
];

export function getBillingPlan(id: string | undefined): BillingPlan {
  return BILLING_PLANS.find((plan) => plan.id === id) ?? BILLING_PLANS[0];
}

export function canUsePlanFeature(planId: string | undefined, feature: "advanced-skills" | "team-workspaces"): boolean {
  const plan = getBillingPlan(planId);
  return feature === "team-workspaces" ? plan.id === "business" || plan.id === "enterprise" : plan.id !== "free";
}

export function getPayPalConfig() {
  return {
    clientId: process.env.PAYPAL_CLIENT_ID ?? "",
    clientSecretConfigured: Boolean(process.env.PAYPAL_CLIENT_SECRET),
    webhookConfigured: Boolean(process.env.PAYPAL_WEBHOOK_ID),
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
    merchantEmail: process.env.PAYPAL_MERCHANT_EMAIL ?? "",
  } as const;
}

export function getBillingStatus() {
  const paypal = getPayPalConfig();
  return { provider: "paypal" as const, configured: Boolean(paypal.clientId && paypal.clientSecretConfigured), webhookConfigured: paypal.webhookConfigured, mode: paypal.mode, plans: BILLING_PLANS };
}
