import { getBillingPlan, type BillingPlanId } from "./billing";

const PAYPAL_SANDBOX = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE = "https://api-m.paypal.com";

function paypalBaseUrl() {
  return process.env.PAYPAL_MODE === "live" ? PAYPAL_LIVE : PAYPAL_SANDBOX;
}

function requirePayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured");
  return { clientId, clientSecret };
}

async function getAccessToken() {
  const { clientId, clientSecret } = requirePayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error(`PayPal authentication failed (${response.status})`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal did not return an access token");
  return data.access_token;
}

export async function createPayPalOrder(planId: BillingPlanId, returnUrl: string, cancelUrl: string) {
  const plan = getBillingPlan(planId);
  if (!plan.monthlyPriceUsd || plan.monthlyPriceUsd <= 0) throw new Error("A paid plan is required");
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: plan.monthlyPriceUsd.toFixed(2) }, description: `Smart Assistant ${plan.name} plan` }],
      application_context: { return_url: returnUrl, cancel_url: cancelUrl, user_action: "PAY_NOW" },
    }),
  });
  if (!response.ok) throw new Error(`PayPal order creation failed (${response.status})`);
  return response.json();
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`PayPal order capture failed (${response.status})`);
  return response.json();
}

export function getPayPalReturnConfig() {
  return {
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
    merchantEmail: process.env.PAYPAL_MERCHANT_EMAIL ?? "",
    configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  } as const;
}
