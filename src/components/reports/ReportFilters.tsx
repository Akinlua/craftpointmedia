import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReportFilters as FilterType } from "@/types/report";
import { format } from "date-fns";
import { CalendarIcon, Filter, Download, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onExport?: (format: 'csv' | 'png' | 'pdf') => void;
  showOwnerFilter?: boolean;
  showPipelineFilter?: boolean;
  showCampaignFilter?: boolean;
  showLocationFilter?: boolean;
  showTagsFilter?: boolean;
}

const ReportFilters = ({
  filters,
  onFiltersChange,
  onExport,
  showOwnerFilter = false,
  showPipelineFilter = false,
  showCampaignFilter = false,
  showLocationFilter = false,
  showTagsFilter = false
}: ReportFiltersProps) => {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    if (!date) return;
    
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  const handleFilterChange = (field: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        to: new Date()
      }
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return false;
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <Card className="card-subtle">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            {onExport && (
              <Select onValueChange={(format) => onExport(format as 'csv' | 'png' | 'pdf')}>
                <SelectTrigger className="w-32">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => handleDateRangeChange('from', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => handleDateRangeChange('to', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showOwnerFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select 
                value={filters.owner} 
                onValueChange={(value) => handleFilterChange('owner', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Chen</SelectItem>
                  <SelectItem value="emily">Emily Rodriguez</SelectItem>
                  <SelectItem value="david">David Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showPipelineFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Pipeline</label>
              <Select 
                value={filters.pipeline} 
                onValueChange={(value) => handleFilterChange('pipeline', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All pipelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Pipeline</SelectItem>
                  <SelectItem value="enterprise">Enterprise Pipeline</SelectItem>
                  <SelectItem value="partner">Partner Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showCampaignFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign</label>
              <Select 
                value={filters.campaign} 
                onValueChange={(value) => handleFilterChange('campaign', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summer-sale">Summer Sale</SelectItem>
                  <SelectItem value="product-launch">Product Launch</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="holiday-special">Holiday Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
