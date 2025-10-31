import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  User, 
  Users, 
  Palette, 
  Plug, 
  Bell, 
  CreditCard, 
  Shield,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  {
    name: "Profile",
    href: "/app/settings/profile",
    icon: User,
    description: "Business profile and organization details",
  },
  {
    name: "Team",
    href: "/app/settings/team", 
    icon: Users,
    description: "Manage team members and roles",
  },
  {
    name: "Branding",
    href: "/app/settings/branding",
    icon: Palette,
    description: "Customize your brand appearance",
  },
  {
    name: "Integrations", 
    href: "/app/settings/integrations",
    icon: Plug,
    description: "Connect external services",
  },
  {
    name: "Notifications",
    href: "/app/settings/notifications", 
    icon: Bell,
    description: "Notification preferences",
  },
  {
    name: "Billing",
    href: "/app/settings/billing",
    icon: CreditCard,
    description: "Subscription and billing",
  },
  {
    name: "Security",
    href: "/app/settings/security",
    icon: Shield,
    description: "Security and data management",
  },
];

const SettingsNavigation = ({ className }: { className?: string }) => {
  const location = useLocation();
  
  return (
    <nav className={cn("space-y-1", className)}>
      {settingsNavigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="w-4 h-4" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{item.name}</div>
              <div className="text-xs opacity-70 truncate">
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

const SettingsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 min-h-0 border-r border-border">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="px-4 mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
            <Separator className="mb-4" />
            <div className="flex-1 px-4">
              <SettingsNavigation />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="px-4 mb-4">
                <h2 className="text-lg font-semibold">Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
              <Separator className="mb-4" />
              <div className="flex-1 px-4">
                <SettingsNavigation />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-background border-b border-border">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="px-4 border-r border-border rounded-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <div className="flex-1 px-4 flex justify-between items-center">
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;