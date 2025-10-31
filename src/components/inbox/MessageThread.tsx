import React from 'react';
import { Message } from '@/types/conversation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  MessageSquare, 
  Download, 
  Clock,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

const getChannelIcon = (channel: 'email' | 'sms') => {
  return channel === 'email' ? Mail : MessageSquare;
};

const getDeliveryStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return CheckCircle;
    case 'failed':
      return AlertCircle;
    case 'pending':
      return Timer;
    default:
      return Clock;
  }
};

const getDeliveryStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
    case 'pending':
      return 'text-yellow-500';
    default:
      return 'text-muted-foreground';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const ChannelIcon = getChannelIcon(message.channel);
  const StatusIcon = getDeliveryStatusIcon(message.metadata.deliveryStatus || 'sent');
  const isOutbound = message.type === 'outbound';
  const isScheduled = message.scheduledFor && new Date(message.scheduledFor) > new Date();
  
  const initials = message.fromName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex gap-3 mb-4', isOutbound && 'flex-row-reverse')}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs font-medium',
          isOutbound ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-[70%]', isOutbound && 'text-right')}>
        {/* Header */}
        <div className={cn('flex items-center gap-2 mb-1', isOutbound && 'flex-row-reverse')}>
          <span className="text-sm font-medium text-foreground">
            {message.fromName}
          </span>
          <ChannelIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
          </span>
          {isScheduled && (
            <Badge variant="outline" className="text-xs">
              Scheduled
            </Badge>
          )}
        </div>

        {/* Message Bubble */}
        <div className={cn(
          'rounded-lg p-3 text-sm',
          isOutbound
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-muted text-foreground',
          message.channel === 'email' && 'rounded-lg',
          message.channel === 'sms' && 'rounded-2xl'
        )}>
          {/* Email Subject */}
          {message.channel === 'email' && message.metadata.emailHeaders?.subject && (
            <div className={cn(
              'font-medium mb-2 pb-2 border-b',
              isOutbound ? 'border-primary-foreground/20' : 'border-border'
            )}>
              {message.metadata.emailHeaders.subject}
            </div>
          )}

          {/* Content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 rounded bg-black/10 hover:bg-black/20 transition-colors"
                  >
                    <div className="p-1 rounded bg-white/20">
                      <Download className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {attachment.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {formatFileSize(attachment.size)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-white/20"
                      onClick={() => window.open(attachment.url)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Status */}
        {isOutbound && message.metadata.deliveryStatus && (
          <div className={cn('flex items-center gap-1 mt-1 justify-end')}>
            <StatusIcon className={cn('h-3 w-3', getDeliveryStatusColor(message.metadata.deliveryStatus))} />
            <span className={cn('text-xs', getDeliveryStatusColor(message.metadata.deliveryStatus))}>
              {message.metadata.deliveryStatus}
            </span>
          </div>
        )}

        {/* Read Status */}
        {!isOutbound && !message.isRead && (
          <div className="flex justify-start mt-1">
            <Badge variant="secondary" className="text-xs">
              Unread
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cn('flex gap-3', index % 2 === 0 && 'flex-row-reverse')}>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 max-w-[70%] space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start the conversation below</p>
        </div>
      </div>
    );
  }

  // Sort messages chronologically
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4">
        {sortedMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageThread;