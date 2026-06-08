import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Processing...");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");
        const errorDescription = queryParams.get("error_description");
        const errorCode = queryParams.get("error");
        const type = queryParams.get("type");

        if (errorCode) {
          throw new Error(errorDescription || "Authentication error");
        }

        // OAuth PKCE flow: exchange code for session
        if (code) {
          setMessage("Verifying your session...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Check for session (after exchange or implicit flow)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setMessage("Success! Redirecting...");
          setTimeout(() => setLocation("/"), 500);
        } else if (type === "signup" || type === "email_change") {
          setMessage("Email confirmed! Please sign in.");
          setTimeout(() => setLocation("/login"), 2000);
        } else {
          setMessage("Session not found. Please sign in.");
          setTimeout(() => setLocation("/login"), 2000);
        }
      } catch (err: any) {
        setError(err.message || "Authentication failed");
        setTimeout(() => setLocation("/login"), 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl text-red-400">!</span>
          </div>
          <h1 className="text-lg font-semibold mb-2">Authentication Error</h1>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <p className="text-xs text-slate-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-4" />
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}
