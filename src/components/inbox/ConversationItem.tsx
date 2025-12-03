import React from 'react';
import { Conversation, ConversationChannel } from '@/types/conversation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const getChannelIcon = (channel: ConversationChannel) => {
  switch (channel) {
    case 'email':
      return Mail;
    case 'sms':
      return MessageSquare;
    default:
      return Mail;
  }
};

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

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const ChannelIcon = getChannelIcon(conversation.channel);
  const initials = conversation.contactName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = conversation.lastMessage?.timestamp
    ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
      addSuffix: false,
    })
    : 'No messages';

  return (
    <div
      className={cn(
        'group cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted/50',
        isSelected && 'bg-primary/10 border-primary/20',
        conversation.unreadCount > 0 && !isSelected && 'bg-blue-50/50 border-l-2 border-l-primary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={conversation.contactAvatar} alt={conversation.contactName} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className={cn(
                'text-sm font-medium truncate',
                conversation.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {conversation.contactName}
              </h4>
              <ChannelIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {conversation.isOverdue && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              )}
              {conversation.slaDeadline && !conversation.isOverdue && (
                <Clock className="h-3 w-3 text-yellow-500" />
              )}
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>

          {/* Subject/Company */}
          {conversation.subject && (
            <p className={cn(
              'text-xs mb-1 truncate',
              conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {conversation.subject}
            </p>
          )}

          {conversation.contactCompany && !conversation.subject && (
            <p className="text-xs text-muted-foreground mb-1 truncate">
              {conversation.contactCompany}
            </p>
          )}

          {/* Last Message */}
          {conversation.lastMessage && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {conversation.lastMessage.type === 'outbound' && 'You: '}
              {conversation.lastMessage.content}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Priority Badge */}
              {conversation.priority !== 'normal' && (
                <Badge
                  variant="outline"
                  className={cn('text-xs px-1.5 py-0', getPriorityColor(conversation.priority))}
                >
                  {conversation.priority}
                </Badge>
              )}

              {/* Tags */}
              {conversation.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}

              {conversation.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{conversation.tags.length - 2}
                </Badge>
              )}
            </div>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <Badge className="h-5 w-5 p-0 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            )}
          </div>

          {/* Assigned To */}
          {conversation.assignedTo && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage src={conversation.assignedTo.avatar} />
                <AvatarFallback className="text-xs bg-muted">
                  {conversation.assignedTo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{conversation.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;