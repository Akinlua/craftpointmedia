import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X,
  Mail,
  MessageSquare,
  User,
  Tag,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { ConversationFilters } from '@/types/conversation';
import { cn } from '@/lib/utils';

interface InboxFiltersProps {
  filters: ConversationFilters;
  onFiltersChange: (filters: Partial<ConversationFilters>) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const FILTER_OPTIONS = {
  channels: [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
  ],
  status: [
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
  ],
  priority: [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' },
  ],
};

const InboxFilters: React.FC<InboxFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  searchQuery,
  onSearchChange,
  className,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'object' && value !== null) return true;
    return Boolean(value);
  });

  const activeFilterCount = [
    filters.channels?.length || 0,
    filters.status?.length || 0,
    filters.assignedTo?.length || 0,
    filters.tags?.length || 0,
    filters.unreadOnly ? 1 : 0,
    filters.dateRange ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Unread Filter */}
        <Button
          variant={filters.unreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onFiltersChange({ unreadOnly: !filters.unreadOnly })}
          className="gap-2"
        >
          <div className="h-2 w-2 bg-primary rounded-full" />
          Unread
        </Button>

        {/* Channel Filters */}
        {FILTER_OPTIONS.channels.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={filters.channels?.includes(value as any) ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const currentChannels = filters.channels || [];
              const newChannels = currentChannels.includes(value as any)
                ? currentChannels.filter(c => c !== value)
                : [...currentChannels, value as any];
              onFiltersChange({ channels: newChannels.length > 0 ? newChannels : undefined });
            }}
            className="gap-2"
          >
            <Icon className="h-3 w-3" />
            {label}
          </Button>
        ))}

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3 w-3" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="space-y-1">
                  {FILTER_OPTIONS.status.map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${value}`}
                        checked={filters.status?.includes(value as any) || false}
                        onCheckedChange={(checked) => {
                          const currentStatus = filters.status || [];
                          const newStatus = checked
                            ? [...currentStatus, value as any]
                            : currentStatus.filter(s => s !== value);
                          onFiltersChange({ status: newStatus.length > 0 ? newStatus : undefined });
                        }}
                      />
                      <label htmlFor={`status-${value}`} className="text-sm">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment</label>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assigned-to-me"
                      checked={filters.assignedTo?.includes('me') || false}
                      onCheckedChange={(checked) => {
                        const currentAssigned = filters.assignedTo || [];
                        const newAssigned = checked
                          ? [...currentAssigned.filter(a => a !== 'me'), 'me']
                          : currentAssigned.filter(a => a !== 'me');
                        onFiltersChange({ assignedTo: newAssigned.length > 0 ? newAssigned : undefined });
                      }}
                    />
                    <label htmlFor="assigned-to-me" className="text-sm">
                      Assigned to me
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unassigned"
                      checked={filters.assignedTo?.includes('unassigned') || false}
                      onCheckedChange={(checked) => {
                        const currentAssigned = filters.assignedTo || [];
                        const newAssigned = checked
                          ? [...currentAssigned.filter(a => a !== 'unassigned'), 'unassigned']
                          : currentAssigned.filter(a => a !== 'unassigned');
                        onFiltersChange({ assignedTo: newAssigned.length > 0 ? newAssigned : undefined });
                      }}
                    />
                    <label htmlFor="unassigned" className="text-sm">
                      Unassigned
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Enter tag name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newTag = e.currentTarget.value.trim();
                      const currentTags = filters.tags || [];
                      if (!currentTags.includes(newTag)) {
                        onFiltersChange({ tags: [...currentTags, newTag] });
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
                {filters.tags && filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = filters.tags!.filter(t => t !== tag);
                            onFiltersChange({ tags: newTags.length > 0 ? newTags : undefined });
                          }}
                          className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.unreadOnly && (
            <Badge variant="secondary" className="gap-1">
              Unread only
              <button
                onClick={() => onFiltersChange({ unreadOnly: false })}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          )}

          {filters.channels?.map((channel) => (
            <Badge key={channel} variant="secondary" className="gap-1">
              {channel === 'email' ? <Mail className="h-2 w-2" /> : <MessageSquare className="h-2 w-2" />}
              {channel}
              <button
                onClick={() => {
                  const newChannels = filters.channels!.filter(c => c !== channel);
                  onFiltersChange({ channels: newChannels.length > 0 ? newChannels : undefined });
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}

          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status}
              <button
                onClick={() => {
                  const newStatus = filters.status!.filter(s => s !== status);
                  onFiltersChange({ status: newStatus.length > 0 ? newStatus : undefined });
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxFilters;