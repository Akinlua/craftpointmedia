import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSwitcher } from "@/components/auth/OrgSwitcher";
import { useSession } from "@/lib/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings, LogOut, User } from "lucide-react";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

const TopBar = () => {
  const { user, currentOrg, logout } = useSession();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Mock notification state - in real app this would come from a store or API
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="h-14 sm:h-16 glass-topbar flex items-center justify-between px-3 sm:px-4 lg:px-6 relative z-20 animate-slide-in-left">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <SidebarTrigger className="lg:hidden" />
        <h2 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent animate-bounce-gentle truncate">
          {currentOrg?.name || 'Your Company'}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        <div className="hidden sm:block">
          <OrgSwitcher />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent/50 hover:scale-110 transition-all duration-300 ease-out hover:shadow-md h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <NotificationPanel>
          <Button variant="ghost" size="icon" className="hover:bg-accent/50 hover:scale-110 transition-all duration-300 ease-out hover:shadow-md relative animate-float h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            {hasUnreadNotifications && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-pulse-glow shadow-glow" />
            )}
          </Button>
        </NotificationPanel>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:scale-110 transition-all duration-300 ease-out hover:shadow-lg">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-primary/30 ring-offset-1 sm:ring-offset-2 ring-offset-background hover:ring-primary/50 transition-all duration-300">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold shadow-inner text-xs sm:text-sm">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 sm:w-56 glass-panel animate-scale-in" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user && (
                  <>
                    <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                    <p className="w-[160px] sm:w-[200px] truncate text-xs sm:text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="sm:hidden">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Organization</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem onClick={() => navigate('/app/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default TopBar;