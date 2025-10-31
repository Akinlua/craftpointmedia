import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Deal, DealStage } from "@/types/deal";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useToast } from "@/hooks/use-toast";
import { dealStages } from "@/lib/api/deals";

interface AddDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedContactId?: string;
  preselectedStageId?: string;
}

export const AddDealModal = ({ 
  open, 
  onOpenChange, 
  preselectedContactId,
  preselectedStageId 
}: AddDealModalProps) => {
  const { addDeal, contacts, users, currentUser } = useCRMStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    currency: 'USD',
    stage: preselectedStageId || 'new',
    ownerId: currentUser?.id || '',
    contactIds: preselectedContactId ? [preselectedContactId] : [] as string[],
    closeDate: '',
    description: '',
    probability: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSelection = (contactId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        contactIds: [...prev.contactIds, contactId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contactIds: prev.contactIds.filter(id => id !== contactId)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.value || formData.contactIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in title, value, and select at least one contact",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedContacts = contacts.filter(c => formData.contactIds.includes(c.id));
      const owner = users.find(u => u.id === formData.ownerId) || currentUser;
      
      const dealData = {
        title: formData.title,
        value: formData.value,
        currency: formData.currency,
        stage: formData.stage as DealStage,
        stageId: formData.stage,
        probability: formData.probability,
        ownerId: formData.ownerId,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : '',
        ownerAvatar: owner?.avatar,
        contactIds: formData.contactIds,
        contacts: selectedContacts.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          avatar: c.avatar
        })),
        closeDate: formData.closeDate || undefined,
        description: formData.description || undefined,
        orgId: currentUser?.orgId || 'org1'
      };

      const newDeal = addDeal(dealData);

      toast({
        title: "Deal Created",
        description: `"${formData.title}" has been added successfully`
      });

      // Reset form
      setFormData({
        title: '',
        value: 0,
        currency: 'USD',
        stage: 'new',
        ownerId: currentUser?.id || '',
        contactIds: [],
        closeDate: '',
        description: '',
        probability: 0
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter deal title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stage and Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select 
                value={formData.stage} 
                onValueChange={(value) => handleInputChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dealStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Deal Owner</Label>
              <Select 
                value={formData.ownerId} 
                onValueChange={(value) => handleInputChange('ownerId', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            <Label>Associated Contacts *</Label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts available</p>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`contact-${contact.id}`}
                      checked={formData.contactIds.includes(contact.id)}
                      onChange={(e) => handleContactSelection(contact.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label 
                      htmlFor={`contact-${contact.id}`}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {contact.firstName} {contact.lastName}
                      {contact.company && (
                        <span className="text-muted-foreground"> - {contact.company}</span>
                      )}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closeDate">Expected Close Date</Label>
              <Input
                id="closeDate"
                type="date"
                value={formData.closeDate}
                onChange={(e) => handleInputChange('closeDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add deal description..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Deal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};