import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-slate-600" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-white mb-2">404</h1>
        <p className="text-slate-500 text-sm">This page doesn't exist.</p>
      </div>
      <Link href="/">
        <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white">
          <Home className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
