import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ContactFilters as ContactFiltersType } from "@/types/contact";
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: ContactFiltersType) => void;
  availableTags: string[];
}

export const ContactFilters = ({
  filters,
  onFiltersChange,
  availableTags
}: ContactFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const updateFilters = (updates: Partial<ContactFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilter = (key: keyof ContactFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const addTag = (tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      updateFilters({ tags: [...currentTags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = filters.tags || [];
    updateFilters({ tags: currentTags.filter(t => t !== tag) });
  };

  const applyDateRange = () => {
    if (dateFrom && dateTo) {
      updateFilters({
        dateRange: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString()
        }
      });
    }
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ContactFiltersType];
    return value !== undefined && value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <Card className="card-subtle">
      <CardContent className="p-4 space-y-4">
        {/* Search and main filter button */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-primary" : ""}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.status?.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                Status: {status}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => {
                    const newStatus = filters.status?.filter(s => s !== status);
                    updateFilters({ status: newStatus?.length ? newStatus : undefined });
                  }}
                />
              </Badge>
            ))}
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                Tag: {tag}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                Location: {filters.location}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('location')}
                />
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="gap-1">
                Date: {format(new Date(filters.dateRange.from), 'MMM d')} - {format(new Date(filters.dateRange.to), 'MMM d')}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('dateRange')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            {/* Status filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select 
                value={filters.status?.[0]}
                onValueChange={(value) => updateFilters({ status: value ? [value as any] : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <Select onValueChange={addTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Add tag filter" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="Search location..."
                value={filters.location || ''}
                onChange={(e) => updateFilters({ location: e.target.value })}
              />
            </div>

            {/* Date range filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Added</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="w-4 h-4" />
                    {filters.dateRange 
                      ? `${format(new Date(filters.dateRange.from), 'MMM d')} - ${format(new Date(filters.dateRange.to), 'MMM d')}`
                      : "Select date range"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                      />
                    </div>
                    <Button onClick={applyDateRange} className="w-full">
                      Apply Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};