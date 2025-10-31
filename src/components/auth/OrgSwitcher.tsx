import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/lib/hooks/useSession';
import { authApi } from '@/lib/api/auth';
import { Organization } from '@/types/user';
import { Building, ChevronDown, Check } from 'lucide-react';

export const OrgSwitcher = () => {
  const { user, currentOrg, switchOrg } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const orgs = await authApi.getUserOrganizations(user.id);
      setOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentOrg || organizations.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            <span className="truncate">{currentOrg.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrg(org)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              <span>{org.name}</span>
            </div>
            {currentOrg.id === org.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">Manage organizations</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};