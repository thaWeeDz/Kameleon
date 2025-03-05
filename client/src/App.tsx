import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import WorkshopPlanning from "@/pages/WorkshopPlanning";
import WorkshopList from "@/pages/WorkshopList";
import ChildrenOverview from "@/pages/ChildrenOverview";
import ChildProfile from "@/pages/ChildProfile";
import NotFound from "@/pages/not-found";
import SessionView from "@/pages/SessionView"; // Added import

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/planning" component={WorkshopPlanning} />
          <Route path="/workshops" component={WorkshopList} />
          <Route path="/children" component={ChildrenOverview} />
          <Route path="/children/:id" component={ChildProfile} />
          <Route path="/sessions/:id" component={SessionView} /> {/* Added route */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;