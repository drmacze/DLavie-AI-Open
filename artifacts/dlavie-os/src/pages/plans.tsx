import { useState } from "react";
import { Check, Zap, Crown, Sparkles, Star, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price_idr: 0,
    period: "",
    icon: Zap,
    color: "from-slate-500 to-slate-600",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    borderColor: "border-white/[0.07]",
    glowColor: "",
    features: ["20 requests/day", "Local model only (1.5B)", "2 projects", "Basic editor & AI chat"],
    notIncluded: ["Cloud AI models", "Autonomous Agent", "GitHub sync", "Knowledge base"],
  },
  {
    id: "lite",
    name: "Lite",
    price_idr: 49000,
    period: "/mo",
    icon: Star,
    color: "from-blue-500 to-cyan-500",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    borderColor: "border-blue-500/20",
    glowColor: "shadow-blue-500/10",
    features: ["100 requests/day", "Grok 3 Mini + Gemini 2.0 Flash", "10 projects", "Knowledge base", "Basic VoltAgent"],
    notIncluded: ["Grok 3 Full", "Gemini 2.5 Pro"],
  },
  {
    id: "plus",
    name: "Plus+",
    price_idr: 149000,
    period: "/mo",
    icon: Sparkles,
    color: "from-violet-500 to-indigo-500",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    borderColor: "border-violet-500/30",
    glowColor: "shadow-violet-500/15",
    popular: true,
    features: ["500 requests/day", "All models (Grok 3, Gemini 2.5 Pro)", "Unlimited projects", "Full VoltAgent", "GitHub sync"],
    notIncluded: [],
  },
  {
    id: "max",
    name: "Max",
    price_idr: 349000,
    period: "/mo",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    features: ["Unlimited requests", "All models + priority", "Custom knowledge", "API access", "White-label", "Priority support"],
    notIncluded: [],
  },
];

export default function PlansPage() {
  const { user, profile } = useAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const currentPlan = profile?.plan ?? "free";

  const handleUpgrade = async (planId: string) => {
    if (!user) { window.location.href = "/login"; return; }
    setUpgrading(planId);
    try {
      const token = (await import("@/lib/supabase").then(m => m.supabase.auth.getSession())).data.session?.access_token;
      const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
      const res = await fetch(`${BASE}/api/me/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
      } else {
        alert(data.error ?? "Failed to initiate payment");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <Crown className="w-3.5 h-3.5" /> Plans & Billing
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Upgrade Your Intelligence</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Choose the plan that fits your workflow. All paid plans include cloud AI models and advanced features.</p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border p-5 flex flex-col bg-white/[0.02] backdrop-blur-sm transition-all duration-200",
                  plan.borderColor,
                  plan.glowColor && `shadow-xl ${plan.glowColor}`,
                  isPopular && "scale-[1.02]"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold tracking-wide shadow-lg shadow-violet-500/30">
                    POPULAR
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", plan.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{plan.name}</p>
                    <div className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border inline-block", plan.badgeColor)}>
                      {plan.id.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  {plan.price_idr === 0 ? (
                    <p className="text-2xl font-bold text-white">Free</p>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      Rp {plan.price_idr.toLocaleString("id-ID")}
                      <span className="text-sm font-normal text-slate-500">{plan.period}</span>
                    </p>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {(plan.notIncluded ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <Lock className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-center text-xs text-slate-400 font-medium">
                    Current Plan
                  </div>
                ) : plan.id === "free" ? (
                  <div className="w-full py-2 rounded-xl bg-white/[0.03] text-center text-xs text-slate-600">
                    Default
                  </div>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!upgrading}
                    className={cn(
                      "w-full text-xs font-semibold shadow-lg border-0",
                      `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                    )}
                  >
                    {upgrading === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Pembayaran melalui <span className="text-slate-400">Midtrans</span> · QRIS · Transfer Bank · E-Wallet · Kartu Kredit
        </p>
      </div>
    </div>
  );
}
