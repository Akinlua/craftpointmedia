import React from 'react';
import { Conversation } from '@/types/conversation';
import { Contact } from '@/types/contact';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Tag,
  Calendar,
  ExternalLink,
  UserPlus,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContactContextPanelProps {
  conversation: Conversation;
  contact?: Contact; // Optional extended contact info
  onAssignConversation?: (userId: string) => void;
  onAddTags?: (tags: string[]) => void;
  onRemoveTags?: (tags: string[]) => void;
  onViewContact?: () => void;
  onCreateDeal?: () => void;
  className?: string;
}

const ContactContextPanel: React.FC<ContactContextPanelProps> = ({
  conversation,
  contact,
  onAssignConversation,
  onAddTags,
  onRemoveTags,
  onViewContact,
  onCreateDeal,
  className,
}) => {
  const initials = conversation.contactName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('w-80 bg-background border-l', className)}>
      <div className="p-4 space-y-6">
        {/* Contact Header */}
        <div className="text-center">
          <Avatar className="h-16 w-16 mx-auto mb-3">
            <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-lg">{conversation.contactName}</h3>
          {conversation.contactCompany && (
            <p className="text-sm text-muted-foreground">{conversation.contactCompany}</p>
          )}
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={getPriorityColor(conversation.priority)}
            >
              {conversation.priority} priority
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onViewContact}>
              <User className="h-4 w-4 mr-2" />
              View Contact
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onCreateDeal}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contact?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            
            {contact?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            
            {contact?.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
            )}
            
            {contact?.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{contact.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">
                {conversation.status}
              </Badge>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Channel:</span>
              <Badge variant="secondary">
                {conversation.channel === 'email' ? (
                  <><Mail className="h-3 w-3 mr-1" />Email</>
                ) : (
                  <><Phone className="h-3 w-3 mr-1" />SMS</>
                )}
              </Badge>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>{format(new Date(conversation.createdAt), 'MMM d, yyyy')}</span>
            </div>
            
            {conversation.assignedTo && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assigned to:</span>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={conversation.assignedTo.avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {conversation.assignedTo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{conversation.assignedTo.name}</span>
                </div>
              </div>
            )}
            
            {conversation.slaDeadline && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SLA:</span>
                <span className={cn(
                  conversation.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                )}>
                  {format(new Date(conversation.slaDeadline), 'MMM d, h:mm a')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversation.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {conversation.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Timeline Preview */}
        {contact && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewContact}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Last contact: {format(new Date(contact.lastContactAt || contact.updatedAt), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-muted-foreground">
                  Lead score: {contact.leadScore || 0}/100
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: {contact.status}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContactContextPanel;