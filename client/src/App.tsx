import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

import Home from "@/pages/Home";
import Architecture from "@/pages/Architecture";
import Technologies from "@/pages/Technologies";
import OnChainImplementation from "@/pages/OnChainImplementation";
import BestPractices from "@/pages/BestPractices";
import AIArchitect from "@/pages/AIArchitect";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ai-architect" component={AIArchitect} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/technologies" component={Technologies} />
      <Route path="/on-chain" component={OnChainImplementation} />
      <Route path="/best-practices" component={BestPractices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
          <Sidebar />
          <main className="flex-1 p-6 md:p-12 overflow-y-auto">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;