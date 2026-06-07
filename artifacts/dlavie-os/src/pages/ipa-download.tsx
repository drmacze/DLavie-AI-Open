// @ts-nocheck
import { useState } from "react";
import { Smartphone, Download, Apple, CheckCircle, ExternalLink, Code2, Terminal, FileCode, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: 1, title: "Install Node + pnpm",
    commands: ["npm install -g pnpm"],
    desc: "Make sure Node.js 20+ is installed",
  },
  {
    step: 2, title: "Install Capacitor CLI",
    commands: ["npm install -g @capacitor/cli"],
    desc: "Capacitor handles native iOS/Android build",
  },
  {
    step: 3, title: "Install dependencies",
    commands: ["pnpm install", "pnpm add @capacitor/core @capacitor/ios @capacitor/android"],
    desc: "Install all project dependencies",
  },
  {
    step: 4, title: "Build & sync iOS",
    commands: ["bash scripts/build-ios.sh"],
    desc: "Builds frontend and syncs to Capacitor",
  },
  {
    step: 5, title: "Open in Xcode",
    commands: ["npx cap open ios"],
    desc: "Xcode will open — select your team and archive",
  },
  {
    step: 6, title: "Export IPA",
    commands: ["Product > Archive", "Distribute App > Ad Hoc / App Store"],
    desc: "In Xcode: Product > Archive > Distribute App",
  },
];

export default function IpaDownloadPage() {
  const [copied, setCopied] = useState<number | null>(null);

  const copyCmd = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/[0.1] flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">iOS / Android Build</h1>
              <p className="text-xs text-slate-500">Get DLavie OS on your device</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] flex items-start gap-3">
              <Apple className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">iOS (iPhone/iPad)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Requires Mac + Xcode. Export as IPA via TestFlight or Ad Hoc.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Android (APK)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Build on any OS. Run <code className="text-[10px] bg-white/5 px-1 rounded">npx cap open android</code> after sync.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Install Banner */}
        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] mb-6 flex items-start gap-3">
          <Zap className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Install as PWA (easiest)</p>
            <p className="text-xs text-slate-400">Open DLavie OS in Safari/Chrome → Share → "Add to Home Screen". Works on iOS and Android without building anything.</p>
          </div>
        </div>

        {/* Build Steps */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white mb-4">Native App Build Steps</h2>
          {STEPS.map((s, idx) => (
            <div key={s.step} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">{s.step}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-[10px] text-slate-500">{s.desc}</p>
                </div>
              </div>
              <div className="px-4 pb-3 space-y-1.5">
                {s.commands.map((cmd, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                      <Terminal className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      <code className="text-[11px] text-emerald-300 font-mono flex-1">{cmd}</code>
                    </div>
                    <button
                      onClick={() => copyCmd(cmd, idx * 10 + ci)}
                      className="text-slate-600 hover:text-violet-400 transition-colors p-1.5"
                    >
                      {copied === idx * 10 + ci ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resources */}
        <div className="mt-8 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <p className="text-xs font-semibold text-white mb-3">Resources</p>
          <div className="space-y-2">
            {[
              { label: "Capacitor iOS Guide", url: "https://capacitorjs.com/docs/ios" },
              { label: "Capacitor Android Guide", url: "https://capacitorjs.com/docs/android" },
              { label: "TestFlight Distribution", url: "https://developer.apple.com/testflight/" },
            ].map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                <ExternalLink className="w-3 h-3" />
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
