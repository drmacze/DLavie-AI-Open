import { Router } from "express";
import { supabase, PLAN_LIMITS } from "../lib/supabase.js";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price_idr: 0,
    price_usd: 0,
    features: ["20 requests/day", "Local model only", "2 projects", "Basic editor"],
    limits: PLAN_LIMITS.free,
  },
  lite: {
    id: "lite",
    name: "Lite",
    price_idr: 49000,
    price_usd: 3,
    features: ["100 requests/day", "Grok 3 Mini + Gemini Flash", "10 projects", "Knowledge base"],
    limits: PLAN_LIMITS.lite,
  },
  plus: {
    id: "plus",
    name: "Plus+",
    price_idr: 149000,
    price_usd: 9,
    features: ["500 requests/day", "All models incl. Grok 3 + Gemini Pro", "Unlimited projects", "VoltAgent", "GitHub sync"],
    limits: PLAN_LIMITS.plus,
  },
  max: {
    id: "max",
    name: "Max",
    price_idr: 349000,
    price_usd: 20,
    features: ["Unlimited requests", "All models", "Priority processing", "Full VoltAgent", "Custom knowledge", "API access"],
    limits: PLAN_LIMITS.max,
  },
};

router.get("/plans", (_req, res) => {
  res.json(Object.values(PLANS));
});

router.get("/me/profile", authMiddleware, requireAuth, async (req: AuthRequest, res) => {
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", req.userId!).single();
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const today = new Date().toISOString().split("T")[0];
  const { count: todayRequests } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", req.userId!)
    .gte("created_at", `${today}T00:00:00`);

  const { data: recentUsage } = await supabase
    .from("usage_logs")
    .select("model, tokens_used, request_type, created_at")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false })
    .limit(20);

  res.json({
    profile,
    usage: { today_requests: todayRequests ?? 0, recent: recentUsage ?? [] },
    plan_details: PLANS[profile.plan as keyof typeof PLANS] ?? PLANS.free,
  });
});

router.post("/me/upgrade", authMiddleware, requireAuth, async (req: AuthRequest, res) => {
  const { plan } = req.body;
  if (!["lite", "plus", "max"].includes(plan)) return res.status(400).json({ error: "Invalid plan" });

  // Midtrans payment initiation
  const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
  if (!midtransServerKey) {
    return res.status(503).json({ error: "Payment not configured. Set MIDTRANS_SERVER_KEY." });
  }

  const planInfo = PLANS[plan as keyof typeof PLANS];
  const orderId = `dlavie-${req.userId}-${Date.now()}`;
  const credentials = Buffer.from(`${midtransServerKey}:`).toString("base64");

  try {
    const mtRes = await fetch("https://app.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: planInfo.price_idr },
        customer_details: { user_id: req.userId },
        item_details: [{ id: plan, price: planInfo.price_idr, quantity: 1, name: `DLavie ${planInfo.name} Plan` }],
        custom_field1: req.userId,
        custom_field2: plan,
      }),
    });

    if (!mtRes.ok) throw new Error(`Midtrans error: ${await mtRes.text()}`);
    const mtData = await mtRes.json() as any;
    res.json({ payment_url: mtData.redirect_url, token: mtData.token, order_id: orderId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/webhooks/midtrans", async (req, res) => {
  try {
    const { order_id, transaction_status, custom_field1: userId, custom_field2: plan } = req.body;
    if (transaction_status === "settlement" || transaction_status === "capture") {
      await supabase.from("profiles").update({ plan }).eq("id", userId);
      await supabase.from("subscriptions").upsert({
        user_id: userId, plan, order_id,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      });
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
