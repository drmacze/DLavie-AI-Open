import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";

import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { GlowOrbs } from "@/components/effects/GlowOrbs";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "./pages/login";
import AuthCallback from "./pages/auth-callback";
import Dashboard from "./pages/dashboard";
import Projects from "./pages/projects";
import Editor from "./pages/editor";
import ModelsPage from "./pages/models";
import KnowledgePage from "./pages/knowledge";
import GitHubPage from "./pages/github";
import SettingsPage from "./pages/settings";
import AgentPage from "./pages/agent";
import PlansPage from "./pages/plans";
import IpaDownloadPage from "./pages/ipa-download";
import NotFound from "./pages/not-found";

// Configure API client
// Generated API client already includes /api/ prefix in every URL
// so setBaseUrl only needs the base path (without /api)
const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
setBaseUrl(BASE || null);
setAuthTokenGetter(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/editor/:projectId/files/:fileId" component={Editor} />
      <Route path="/editor/:projectId" component={Editor} />
      <Route>
        <LayoutWithSidebar>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/models" component={ModelsPage} />
            <Route path="/agent" component={AgentPage} />
            <Route path="/knowledge" component={KnowledgePage} />
            <Route path="/github" component={GitHubPage} />
            <Route path="/plans" component={PlansPage} />
            <Route path="/download" component={IpaDownloadPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </LayoutWithSidebar>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={BASE}>
            <AuroraBackground />
            <GlowOrbs />
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
