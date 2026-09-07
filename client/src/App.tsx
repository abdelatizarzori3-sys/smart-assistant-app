import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Library from "./pages/Library";
import Tools from "./pages/Tools";
import SkillLibrary from "./pages/SkillLibrary";
import { useParams } from "wouter";

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function WorkspaceHome() {
  return <WorkspaceShell><Home /></WorkspaceShell>;
}

function WorkspaceTools() {
  return <WorkspaceShell><Tools /></WorkspaceShell>;
}

function WorkspaceLibrary() {
  return <WorkspaceShell><Library /></WorkspaceShell>;
}

function WorkspaceSkillLibrary() {
  return <WorkspaceShell><SkillLibrary /></WorkspaceShell>;
}

function LegacySkillRedirect() {
  const { skillId = "general" } = useParams<{ skillId: string }>();
  return <Redirect to={`/workspace/tools/${skillId}`} replace />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/tools" component={() => <Redirect to="/workspace/tools" replace />} />
      <Route path="/tools/" component={() => <Redirect to="/workspace/tools" replace />} />
      <Route path="/tools/:skillId" component={LegacySkillRedirect} />
      <Route path="/library" component={() => <Redirect to="/workspace/library" replace />} />
      <Route path="/library/" component={() => <Redirect to="/workspace/library" replace />} />
      <Route path="/workspace/tools" component={WorkspaceTools} />
      <Route path="/workspace/tools/:skillId" component={WorkspaceSkillLibrary} />
      <Route path="/workspace/library" component={WorkspaceLibrary} />
      <Route path="/workspace" component={WorkspaceHome} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
