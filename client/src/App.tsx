import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { AuthProvider } from "@/hooks/useAuth";

import Home from "@/pages/Home";
import Architecture from "@/pages/Architecture";
import Technologies from "@/pages/Technologies";
import OnChainImplementation from "@/pages/OnChainImplementation";
import BestPractices from "@/pages/BestPractices";
import AIArchitect from "@/pages/AIArchitect";
import Auth from "@/pages/Auth";
import Trading from "@/pages/Trading";
import Wallet from "@/pages/Wallet";
import Portfolio from "@/pages/Portfolio";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Exchange */}
      <Route path="/auth" component={Auth} />
      <Route path="/trade" component={Trading} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/portfolio" component={Portfolio} />
      {/* Guide */}
      <Route path="/ai-architect" component={AIArchitect} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/technologies" component={Technologies} />
      <Route path="/on-chain" component={OnChainImplementation} />
      <Route path="/best-practices" component={BestPractices} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
