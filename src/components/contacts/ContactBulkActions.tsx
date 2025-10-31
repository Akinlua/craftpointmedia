import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactBulkAction } from "@/types/contact";
import { canCurrentUser } from "@/lib/rbac/can";
import { useSession } from "@/lib/hooks/useSession";
import { 
  MoreHorizontal, 
  Tag, 
  X, 
  UserPlus, 
  Download, 
  Trash2 
} from "lucide-react";

interface ContactBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: ContactBulkAction) => void;
  availableTags: string[];
  availableOwners: Array<{ id: string; name: string }>;
}

export const ContactBulkActions = ({
  selectedCount,
  onBulkAction,
  availableTags,
  availableOwners
}: ContactBulkActionsProps) => {
  const { role } = useSession();
  const [addTagDialog, setAddTagDialog] = useState(false);
  const [removeTagDialog, setRemoveTagDialog] = useState(false);
  const [assignOwnerDialog, setAssignOwnerDialog] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");

  const canDelete = role ? canCurrentUser('delete', 'contacts', role.role) : false;

  const handleAddTag = () => {
    if (newTag.trim()) {
      onBulkAction({
        type: 'add_tag',
        data: { tag: newTag.trim() }
      });
      setNewTag("");
      setAddTagDialog(false);
    }
  };

  const handleRemoveTag = () => {
    if (selectedTag) {
      onBulkAction({
        type: 'remove_tag',
        data: { tag: selectedTag }
      });
      setSelectedTag("");
      setRemoveTagDialog(false);
    }
  };

  const handleAssignOwner = () => {
    const owner = availableOwners.find(o => o.id === selectedOwner);
    if (owner) {
      onBulkAction({
        type: 'assign_owner',
        data: { ownerId: owner.id, ownerName: owner.name }
      });
      setSelectedOwner("");
      setAssignOwnerDialog(false);
    }
  };

  const handleExport = () => {
    onBulkAction({ type: 'export' });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCount} contacts? This action cannot be undone.`)) {
      onBulkAction({ type: 'delete' });
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg">
      <span className="text-sm font-medium">
        {selectedCount} contact{selectedCount > 1 ? 's' : ''} selected
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Dialog open={addTagDialog} onOpenChange={setAddTagDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Tag className="w-4 h-4" />
                Add Tag
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tag to {selectedCount} Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter tag name..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add Tag
                  </Button>
                  <Button variant="outline" onClick={() => setAddTagDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={removeTagDialog} onOpenChange={setRemoveTagDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <X className="w-4 h-4" />
                Remove Tag
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Tag from {selectedCount} Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag to remove" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleRemoveTag} disabled={!selectedTag}>
                    Remove Tag
                  </Button>
                  <Button variant="outline" onClick={() => setRemoveTagDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={assignOwnerDialog} onOpenChange={setAssignOwnerDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <UserPlus className="w-4 h-4" />
                Assign Owner
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Owner to {selectedCount} Contacts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOwners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleAssignOwner} disabled={!selectedOwner}>
                    Assign Owner
                  </Button>
                  <Button variant="outline" onClick={() => setAssignOwnerDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenuItem onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </DropdownMenuItem>

          {canDelete && (
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};