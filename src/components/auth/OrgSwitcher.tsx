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
  const { organization } = useSession();

  // For now, just display the current organization
  // Multi-org switching will be implemented later
  if (!organization) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm">
      <Building className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium truncate">{organization.name}</span>
    </div>
  );
};