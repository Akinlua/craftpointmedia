import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Automation, AutomationFilters, AutomationStatus } from '@/types/automation';
import { UserRole } from '@/types/user';
import { automationsApi } from '@/lib/api/automations';
import { can } from '@/lib/rbac/can';
import { MoreHorizontal, Play, Pause, Copy, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface AutomationListProps {
  automations: Automation[];
  isLoading: boolean;
  filters: AutomationFilters;
  onFiltersChange: (filters: Partial<AutomationFilters>) => void;
  userRole: UserRole;
}

export function AutomationList({ automations, isLoading, filters, onFiltersChange, userRole }: AutomationListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: automationsApi.deleteAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast({ title: 'Automation deleted successfully' });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: automationsApi.duplicateAutomation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast({ title: 'Automation duplicated successfully' });
    },
  });

  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div>Loading automations...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search automations..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({ status: value === 'all' ? undefined : value as AutomationStatus })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Triggers</TableHead>
            <TableHead>Total Runs</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {automations.map((automation) => (
            <TableRow key={automation.id}>
              <TableCell>
                <Link to={`/app/automations/${automation.id}`} className="font-medium hover:underline">
                  {automation.name}
                </Link>
                {automation.description && (
                  <div className="text-sm text-muted-foreground">{automation.description}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(automation.status)}>
                  {automation.status}
                </Badge>
              </TableCell>
              <TableCell>
                {automation.triggers.map(trigger => trigger.type).join(', ')}
              </TableCell>
              <TableCell>{automation.stats.totalRuns}</TableCell>
              <TableCell>
                {automation.stats.totalRuns > 0 
                  ? `${Math.round((automation.stats.successfulRuns / automation.stats.totalRuns) * 100)}%`
                  : '-'
                }
              </TableCell>
              <TableCell>
                {automation.stats.lastRun 
                  ? new Date(automation.stats.lastRun).toLocaleDateString()
                  : 'Never'
                }
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      {automation.status === 'active' ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateMutation.mutate(automation.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    {can(userRole, 'delete', 'automations') && (
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate(automation.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {automations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No automations found.
        </div>
      )}
    </div>
  );
}