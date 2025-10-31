import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X, Save, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface SavedView {
  id: string;
  name: string;
  conditions: FilterCondition[];
  entityType: string;
}

interface FilterBuilderProps {
  entityType: 'contacts' | 'deals' | 'tasks';
  fields: Array<{ value: string; label: string; type: 'text' | 'select' | 'date' }>;
  onFiltersChange: (conditions: FilterCondition[]) => void;
  savedViews?: SavedView[];
  onSaveView?: (name: string, conditions: FilterCondition[]) => void;
  className?: string;
}

const operators = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not in' },
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
};

export const FilterBuilder = ({
  entityType,
  fields,
  onFiltersChange,
  savedViews = [],
  onSaveView,
  className
}: FilterBuilderProps) => {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [showSaveView, setShowSaveView] = useState(false);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      field: '',
      operator: '',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    const newConditions = conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    setConditions(newConditions);
    onFiltersChange(newConditions);
  };

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter(condition => condition.id !== id);
    setConditions(newConditions);
    onFiltersChange(newConditions);
  };

  const clearAllConditions = () => {
    setConditions([]);
    onFiltersChange([]);
  };

  const loadSavedView = (view: SavedView) => {
    setConditions(view.conditions);
    onFiltersChange(view.conditions);
  };

  const saveCurrentView = () => {
    if (newViewName.trim() && onSaveView) {
      onSaveView(newViewName.trim(), conditions);
      setNewViewName("");
      setShowSaveView(false);
    }
  };

  const getOperatorsForField = (fieldValue: string) => {
    const field = fields.find(f => f.value === fieldValue);
    return field ? operators[field.type] : [];
  };

  const activeConditionsCount = conditions.filter(c => c.field && c.operator && c.value).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with saved views */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={showBuilder ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowBuilder(!showBuilder)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeConditionsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeConditionsCount}
              </Badge>
            )}
          </Button>

          {activeConditionsCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllConditions}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Saved Views */}
        {savedViews.length > 0 && (
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Saved views:</Label>
            {savedViews.filter(v => v.entityType === entityType).map((view) => (
              <Button
                key={view.id}
                variant="outline"
                size="sm"
                onClick={() => loadSavedView(view)}
                className="h-8"
              >
                {view.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Builder */}
      {showBuilder && (
        <Card className="card-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              Filter Builder
              {conditions.length > 0 && onSaveView && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSaveView(true)}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save View
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditions */}
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={condition.logicalOperator}
                      onValueChange={(value: 'AND' | 'OR') => 
                        updateCondition(condition.id, { logicalOperator: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Field */}
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(condition.id, { field: value, operator: '', value: '' })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator */}
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    disabled={!condition.field}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsForField(condition.field).map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value */}
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    disabled={!condition.operator}
                    className="flex-1"
                  />

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(condition.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Condition */}
            <Button
              variant="outline"
              size="sm"
              onClick={addCondition}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Condition
            </Button>

            {/* Save View Modal */}
            {showSaveView && (
              <div className="p-4 border rounded-lg bg-muted/20">
                <Label className="text-sm font-medium">Save as new view</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="View name"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCurrentView();
                      if (e.key === 'Escape') setShowSaveView(false);
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={saveCurrentView} disabled={!newViewName.trim()}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveView(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};