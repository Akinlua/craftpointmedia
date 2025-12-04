import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, X, Send, MessageSquare } from "lucide-react";

import { contactsApi } from "@/lib/api/contacts";
import { createMessage } from "@/lib/api/inbox";
import { Contact } from "@/types/contact";

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
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    preselectedContactId ? [preselectedContactId] : []
  );
  const [message, setMessage] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(!preselectedContactId);
  const [isSending, setIsSending] = useState(false);

  // Load contacts on mount or open
  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open]);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      // Fetch all contacts (or first 100)
      const result = await contactsApi.getContacts({ scope: 'organization' }, 1, 100);
      setContacts(result.data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

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

  const handleSend = async () => {
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

    setIsSending(true);
    try {
      // Send message to each selected contact
      // In a real scenario, we might want a bulk send endpoint, but for now we loop
      const promises = selectedContacts.map(contactId =>
        createMessage(contactId, message, 'email') // Defaulting to 'email' as per API requirement, though UI is internal
      );

      await Promise.all(promises);

      const contactNames = getSelectedContactsData().map(c => `${c.firstName} ${c.lastName}`).join(', ');

      toast({
        title: "Message Sent",
        description: `Message sent to ${contactNames}`,
      });

      // Reset form
      setSelectedContacts(preselectedContactId ? [preselectedContactId] : []);
      setMessage('');
      setSearchQuery('');

      onOpenChange(false);
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
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
            <MessageSquare className="w-5 h-5" />
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">

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
                        className={`flex items-center gap-3 p-2 hover:bg-accent cursor-pointer ${selectedContacts.includes(contact.id) ? 'bg-accent' : ''
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
                    )))}
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
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