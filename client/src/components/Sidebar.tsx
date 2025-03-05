import { Link, useLocation } from "wouter";
import { dutch } from "@/lib/dutch";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, BookOpen, Users, Mic } from "lucide-react";

interface SidebarProps {
  onNavigate?: () => void;
}

const navigation = [
  { name: dutch.navigation.dashboard, href: "/", icon: LayoutDashboard },
  { name: dutch.navigation.planning, href: "/planning", icon: Calendar },
  { name: dutch.navigation.workshops, href: "/workshops", icon: BookOpen },
  { name: dutch.navigation.children, href: "/children", icon: Users },
  { name: dutch.navigation.sessions, href: "/sessions", icon: Mic },
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border">
      <div className="h-16 flex items-center px-6">
        <h1 className="text-xl font-bold text-sidebar-primary">Kameleon</h1>
      </div>
      <nav className="px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href} // Added unique key based on href
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}