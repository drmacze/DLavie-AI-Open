import { Switch, Route, Router as WouterRouter, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { GlowOrbs } from "@/components/effects/GlowOrbs";
import { Sidebar } from "@/components/layout/Sidebar";

import Dashboard from "./pages/dashboard";
import Projects from "./pages/projects";
import Editor from "./pages/editor";
import ModelsPage from "./pages/models";
import KnowledgePage from "./pages/knowledge";
import GitHubPage from "./pages/github";
import SettingsPage from "./pages/settings";
import NotFound from "./pages/not-found";

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

function EditorRoute() {
  return <Editor />;
}

function AppRouter() {
  const [isEditor] = useRoute("/editor/:projectId*");
  const [isEditorFile] = useRoute("/editor/:projectId/files/:fileId");

  return (
    <Switch>
      <Route path="/editor/:projectId/files/:fileId" component={EditorRoute} />
      <Route path="/editor/:projectId" component={EditorRoute} />
      <Route>
        <LayoutWithSidebar>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/models" component={ModelsPage} />
            <Route path="/knowledge" component={KnowledgePage} />
            <Route path="/github" component={GitHubPage} />
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuroraBackground />
          <GlowOrbs />
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
