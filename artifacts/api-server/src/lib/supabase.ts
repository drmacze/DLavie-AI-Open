import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const DEVELOPER_EMAIL = "dlaviecom@gmail.com";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "lite" | "plus" | "max" | "developer";
  usage_tokens: number;
  usage_requests: number;
  created_at: string;
  role?: "user" | "developer";
};

export type UsageLog = {
  id: string;
  user_id: string;
  model: string;
  tokens_used: number;
  request_type: "chat" | "completion" | "agent";
  created_at: string;
};

export const isDeveloper = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  if (profile.role === "developer") return true;
  if (profile.email === DEVELOPER_EMAIL) return true;
  return false;
};

export const PLAN_LIMITS = {
  free:       { requests_per_day: 20,  tokens_per_day: 50_000,   models: ["local-qwen-1.5b"] },
  lite:       { requests_per_day: 100, tokens_per_day: 200_000,  models: ["local-qwen-1.5b", "grok-3-mini", "gemini-2.0-flash"] },
  plus:       { requests_per_day: 500, tokens_per_day: 1_000_000, models: ["local-qwen-1.5b", "grok-3-mini", "grok-3", "gemini-2.0-flash", "gemini-2.5-pro"] },
  max:        { requests_per_day: -1,  tokens_per_day: -1,        models: ["local-qwen-1.5b", "grok-3-mini", "grok-3", "gemini-2.0-flash", "gemini-2.5-pro", "claude-sonnet-4-5", "deepseek-r2"] },
  developer:  { requests_per_day: -1,  tokens_per_day: -1,        models: ["local-qwen-1.5b", "grok-3-mini", "grok-3", "gemini-2.0-flash", "gemini-2.5-pro", "claude-sonnet-4-5", "deepseek-r2"] },
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as UserProfile;
}

export async function checkUsageLimit(userId: string, plan: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;
  if (limits.requests_per_day === -1) return { allowed: true };

  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`);

  if ((count ?? 0) >= limits.requests_per_day) {
    return { allowed: false, reason: `Daily limit of ${limits.requests_per_day} requests reached. Upgrade your plan.` };
  }
  return { allowed: true };
}

export async function logUsage(userId: string, model: string, tokensUsed: number, requestType: "chat" | "completion" | "agent") {
  await supabase.from("usage_logs").insert({
    user_id: userId,
    model,
    tokens_used: tokensUsed,
    request_type: requestType,
  });
}
