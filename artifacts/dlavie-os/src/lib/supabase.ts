import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars not set — auth will not work");
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: "dlavie-auth",
    },
  }
);

export type Plan = "free" | "lite" | "plus" | "max";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  usage_tokens: number;
  usage_requests: number;
};

export const PLAN_DISPLAY = {
  free:  { label: "Free",   color: "text-slate-400",  badge: "bg-slate-500/20 text-slate-400",  limit: "20 req/day" },
  lite:  { label: "Lite",   color: "text-blue-400",   badge: "bg-blue-500/20 text-blue-400",    limit: "100 req/day" },
  plus:  { label: "Plus+",  color: "text-violet-400", badge: "bg-violet-500/20 text-violet-400", limit: "500 req/day" },
  max:   { label: "Max",    color: "text-amber-400",  badge: "bg-amber-500/20 text-amber-400",   limit: "Unlimited" },
};
