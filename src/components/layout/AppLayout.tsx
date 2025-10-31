import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import TopBar from "./TopBar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Enhanced app background with animated elements */}
        <div className="fixed inset-0 bg-gradient-page pointer-events-none" />
        
        {/* Floating geometric shapes */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-32 w-16 h-16 border border-primary/10 rounded-lg rotate-45 animate-drift" />
          <div className="absolute top-1/3 left-20 w-12 h-12 border border-primary/8 rounded-full animate-float" style={{animationDelay: '2s'}} />
          <div className="absolute bottom-1/4 right-16 w-20 h-20 border border-primary/6 rounded-xl rotate-12 animate-bounce-gentle" style={{animationDelay: '1s'}} />
          <div className="absolute top-2/3 left-1/3 w-8 h-8 border border-primary/12 rounded-lg animate-morph" style={{animationDelay: '3s'}} />
        </div>
        
        {/* Subtle animated orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-40 left-1/4 w-32 h-32 bg-primary/3 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-primary/4 rounded-full blur-2xl animate-float" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-primary/2 rounded-full blur-xl animate-drift" style={{animationDelay: '2.5s'}} />
        </div>
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <TopBar />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 animate-fade-in overflow-hidden">
            <div className="max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;