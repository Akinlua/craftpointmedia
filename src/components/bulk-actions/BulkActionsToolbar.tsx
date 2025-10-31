import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Tag, 
  User, 
  Trash2, 
  Download, 
  MoreHorizontal,
  Users,
  DollarSign,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkAction {
  type: string;
  data?: any;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  entityType: 'contacts' | 'deals' | 'tasks';
  onBulkAction: (action: BulkAction) => void;
  onClearSelection: () => void;
  availableTags?: string[];
  availableOwners?: Array<{ id: string; name: string }>;
  availableStages?: string[];
  className?: string;
}

export const BulkActionsToolbar = ({
  selectedCount,
  entityType,
  onBulkAction,
  onClearSelection,
  availableTags = [],
  availableOwners = [],
  availableStages = [],
  className
}: BulkActionsToolbarProps) => {
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  if (selectedCount === 0) return null;

  const getEntityIcon = () => {
    switch (entityType) {
      case 'contacts':
        return Users;
      case 'deals':
        return DollarSign;
      case 'tasks':
        return CheckSquare;
      default:
        return Users;
    }
  };

  const EntityIcon = getEntityIcon();

  const handleAddTag = () => {
    if (newTag.trim()) {
      onBulkAction({ type: 'add_tag', data: { tag: newTag.trim() } });
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const renderEntitySpecificActions = () => {
    switch (entityType) {
      case 'contacts':
        return (
          <>
            <DropdownMenuItem onClick={() => onBulkAction({ type: 'export' })}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        );
      
      case 'deals':
        return (
          <>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()}
              className="focus:bg-transparent focus:text-inherit"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <Select onValueChange={(value) => onBulkAction({ type: 'change_stage', data: { stage: value } })}>
                <SelectTrigger className="h-auto p-0 border-0 shadow-none">
                  <SelectValue placeholder="Change Stage" />
                </SelectTrigger>
                <SelectContent>
                  {availableStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        );
      
      case 'tasks':
        return (
          <>
            <DropdownMenuItem onClick={() => onBulkAction({ type: 'mark_complete' })}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark Complete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkAction({ type: 'mark_incomplete' })}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark Incomplete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up",
      className
    )}>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-2">
          <EntityIcon className="h-3 w-3" />
          {selectedCount} selected
        </Badge>

        <div className="flex items-center gap-2">
          {/* Add Tag */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="mr-2 h-4 w-4" />
                Tag
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {showTagInput ? (
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Enter tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setShowTagInput(false);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowTagInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setShowTagInput(true)}>
                    <Tag className="mr-2 h-4 w-4" />
                    Add New Tag
                  </DropdownMenuItem>
                  {availableTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {availableTags.map((tag) => (
                        <DropdownMenuItem 
                          key={tag}
                          onClick={() => onBulkAction({ type: 'add_tag', data: { tag } })}
                        >
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Assign Owner */}
          {availableOwners.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableOwners.map((owner) => (
                  <DropdownMenuItem 
                    key={owner.id}
                    onClick={() => onBulkAction({ type: 'assign_owner', data: { ownerId: owner.id } })}
                  >
                    {owner.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {renderEntitySpecificActions()}
              
              <DropdownMenuItem 
                onClick={() => onBulkAction({ type: 'delete' })}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearSelection}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};