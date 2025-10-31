import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConversationChannel } from "@/types/conversation";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useToast } from "@/hooks/use-toast";
import { Search, X, Send, Mail, MessageSquare } from "lucide-react";

interface ComposeMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedContactId?: string;
}

export const ComposeMessageModal = ({ 
  open, 
  onOpenChange, 
  preselectedContactId 
}: ComposeMessageModalProps) => {
  const { contacts, currentUser } = useCRMStore();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    preselectedContactId ? [preselectedContactId] : []
  );
  const [channel, setChannel] = useState<ConversationChannel>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(!preselectedContactId);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const company = contact.company?.toLowerCase() || '';
    const email = contact.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || company.includes(query) || email.includes(query);
  });

  const getSelectedContactsData = () => {
    return contacts.filter(contact => selectedContacts.includes(contact.id));
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(id => id !== contactId));
  };

  const handleSend = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one contact to send the message to",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    if (channel === 'email' && !subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter a subject for the email",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create conversations/messages for each selected contact
      selectedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact && currentUser) {
          // Here we would normally send the message via API
          // For now, we'll create a mock conversation
          const mockConversation = {
            contactId: contact.id,
            contactName: `${contact.firstName} ${contact.lastName}`,
            contactAvatar: contact.avatar,
            contactCompany: contact.company,
            channel: channel,
            status: 'open' as const,
            subject: channel === 'email' ? subject : undefined,
            lastMessage: {
              id: `msg_${Date.now()}`,
              content: message,
              timestamp: new Date().toISOString(),
              type: 'outbound' as const,
              fromName: `${currentUser.firstName} ${currentUser.lastName}`
            },
            unreadCount: 0,
            assignedTo: {
              id: currentUser.id,
              name: `${currentUser.firstName} ${currentUser.lastName}`,
              avatar: currentUser.avatar
            },
            tags: [],
            priority: 'normal' as const,
            isOverdue: false,
            orgId: currentUser.orgId
          };
          
          // This would be implemented in the store
          // addConversation(mockConversation);
        }
      });

      const contactNames = getSelectedContactsData().map(c => `${c.firstName} ${c.lastName}`).join(', ');
      
      toast({
        title: "Message Sent",
        description: `Message sent to ${contactNames} via ${channel}`,
      });

      // Reset form
      setSelectedContacts(preselectedContactId ? [preselectedContactId] : []);
      setSubject('');
      setMessage('');
      setSearchQuery('');
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {channel === 'email' ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(value) => setChannel(value as ConversationChannel)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Selection */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            
            {/* Selected contacts */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
                {getSelectedContactsData().map(contact => (
                  <Badge key={contact.id} variant="secondary" className="pr-1">
                    <Avatar className="w-4 h-4 mr-1">
                      <AvatarFallback className="text-xs">
                        {getInitials(contact.firstName, contact.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.firstName} {contact.lastName}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveContact(contact.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Contact search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowContactSearch(true)}
                  className="pl-10"
                />
              </div>
              
              {showContactSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No contacts found
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        className={`flex items-center gap-3 p-2 hover:bg-accent cursor-pointer ${
                          selectedContacts.includes(contact.id) ? 'bg-accent' : ''
                        }`}
                        onClick={() => handleContactToggle(contact.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          readOnly
                          className="rounded"
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.email} 
                            {contact.company && ` • ${contact.company}`}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subject (Email only) */}
          {channel === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Enter your ${channel} message...`}
              className="flex-1 min-h-32 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={selectedContacts.length === 0 || !message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};