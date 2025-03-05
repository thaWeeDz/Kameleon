import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import WorkshopPlanning from "@/pages/WorkshopPlanning";
import WorkshopList from "@/pages/WorkshopList";
import ChildrenOverview from "@/pages/ChildrenOverview";
import ChildProfile from "@/pages/ChildProfile";
import SessionList from "@/pages/SessionList";
import SessionView from "@/pages/SessionView";
import NotFound from "@/pages/not-found";

function Router() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute left-4 top-4">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/planning" component={WorkshopPlanning} />
          <Route path="/workshops" component={WorkshopList} />
          <Route path="/children" component={ChildrenOverview} />
          <Route path="/children/:id" component={ChildProfile} />
          <Route path="/sessions" component={SessionList} />
          <Route path="/sessions/:id" component={SessionView} />
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