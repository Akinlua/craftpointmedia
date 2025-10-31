import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Contact, LeadStage } from "@/types/contact";
import { contactsApi } from "@/lib/api/contacts";
import { Mail, Phone, Building2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactPipelineProps {
  contacts: Contact[];
  onContactUpdated?: () => void;
}

const leadStages = [
  { id: 'new', title: 'New Leads', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'proposal', title: 'Proposal', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'closed', title: 'Closed', color: 'bg-green-100 dark:bg-green-900' }
];

export function ContactPipeline({ contacts, onContactUpdated }: ContactPipelineProps) {
  const { toast } = useToast();
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

  const getContactsForStage = (stage: string) => {
    return contacts.filter(contact => contact.leadStage === stage);
  };

  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (draggedContact && draggedContact.leadStage !== targetStage) {
      try {
        await contactsApi.updateLeadStage(draggedContact.id, targetStage);
        
        toast({
          title: "Contact moved",
          description: `${draggedContact.firstName} ${draggedContact.lastName} moved to ${leadStages.find(s => s.id === targetStage)?.title}`,
        });
        
        onContactUpdated?.();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update contact stage",
          variant: "destructive"
        });
      }
    }
    
    setDraggedContact(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
      {leadStages.map((stage) => {
        const stageContacts = getContactsForStage(stage.id);
        
        return (
          <div
            key={stage.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={`p-3 rounded-lg ${stage.color}`}>
              <h3 className="font-medium text-sm text-center">
                {stage.title} ({stageContacts.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {stageContacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="card-elevated cursor-move hover:shadow-lg transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, contact)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {contact.company}
                            </p>
                          </div>
                        </div>
                        {contact.leadScore && (
                          <Badge variant="outline" className="text-xs">
                            {contact.leadScore}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        
                        {contact.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span>{contact.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{contact.ownerName}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contact.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stageContacts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No contacts in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}