import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  MessageCircle,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Briefcase
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    url: "/app/contacts",
    icon: Users,
  },
  {
    title: "Deals",
    url: "/app/deals",
    icon: Target,
  },
  {
    title: "Inbox",
    url: "/app/inbox",
    icon: MessageCircle,
  },
  {
    title: "Tasks",
    url: "/app/tasks",
    icon: CheckSquare,
  },
];


const salesItems = [
  {
    title: "Products",
    url: "/app/sales/products",
    icon: DollarSign,
  },
  {
    title: "Invoices",
    url: "/app/sales/invoices",
    icon: DollarSign,
  },
];

const reportsItems = [
  {
    title: "Overview",
    url: "/app/reports",
    icon: BarChart3,
  },
  {
    title: "Sales Report",
    url: "/app/reports/sales",
    icon: TrendingUp,
  },
  {
    title: "Customer Report",
    url: "/app/reports/customers",
    icon: Users,
  },
];

const agencyItems = [
  {
    title: "Dashboard",
    url: "/app/agency",
    icon: LayoutDashboard,
  },
  {
    title: "Services",
    url: "/app/agency/services",
    icon: Briefcase,
  },
  {
    title: "Orders",
    url: "/app/agency/orders",
    icon: Target,
  },
];

const systemItems = [
  {
    title: "Analytics",
    url: "/app/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  const getNavClasses = (isActive: boolean) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/a2be0e90-2f01-4a6d-8c56-d1cc72041092.png"
              alt="Craftpoint"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-handwriting text-xl font-semibold text-sidebar-foreground">Craftpoint</h2>
              <p className="text-xs text-muted-foreground">Your Business Hub</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(currentPath === item.url)}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(currentPath.startsWith(item.url))}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Marketing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={getNavClasses(currentPath === "/app/marketing")}
                >
                  <NavLink to="/app/marketing">
                    <BarChart3 className="w-4 h-4" />
                    {!isCollapsed && <span>Overview</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={getNavClasses(currentPath === "/app/marketing/campaigns")}
                >
                  <NavLink to="/app/marketing/campaigns">
                    <MessageCircle className="w-4 h-4" />
                    {!isCollapsed && <span>Campaigns</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={getNavClasses(currentPath === "/app/marketing/templates")}
                >
                  <NavLink to="/app/marketing/templates">
                    <CheckSquare className="w-4 h-4" />
                    {!isCollapsed && <span>Templates</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(currentPath === item.url)}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CraftWorks Agency</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agencyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(currentPath.startsWith("/app/agency") && (currentPath === item.url || (item.url === "/app/agency" && currentPath === "/app/agency")))}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(currentPath === item.url)}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="p-4 bg-primary-subtle rounded-lg mx-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">JD</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Acme Corp
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}