import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Send, 
  Paperclip, 
  FileText, 
  Calendar as CalendarIcon,
  X,
  Mail,
  MessageSquare,
  Clock
} from 'lucide-react';
import { ConversationChannel, MessageTemplate } from '@/types/conversation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageComposerProps {
  conversationId: string;
  channel: ConversationChannel;
  onSendMessage: (content: string, channel: ConversationChannel, scheduledFor?: string) => Promise<void>;
  templates?: MessageTemplate[];
  className?: string;
  disabled?: boolean;
}

interface AttachmentFile {
  id: string;
  file: File;
  preview: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  channel: defaultChannel,
  onSendMessage,
  templates = [],
  className,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ConversationChannel>(defaultChannel);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const channelTemplates = templates.filter(t => t.channel === selectedChannel);
  const isEmail = selectedChannel === 'email';
  const maxLength = isEmail ? 10000 : 160; // SMS character limit

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      let scheduledFor: string | undefined;
      if (scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':');
        const scheduled = new Date(scheduledDate);
        scheduled.setHours(parseInt(hours), parseInt(minutes));
        scheduledFor = scheduled.toISOString();
      }

      await onSendMessage(content, selectedChannel, scheduledFor);
      
      // Reset form
      setContent('');
      setSubject('');
      setAttachments([]);
      setScheduledDate(undefined);
      setScheduledTime('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setContent(template.content);
    if (template.subject) {
      setSubject(template.subject);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      
      setAttachments(prev => [...prev, { id, file, preview }]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const isScheduled = scheduledDate && scheduledTime;
  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Card className={cn('p-4 border-t bg-background', className)}>
      <div className="space-y-4">
        {/* Channel Selection & Templates */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select 
              value={selectedChannel} 
              onValueChange={(value: ConversationChannel) => setSelectedChannel(value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {channelTemplates.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={disabled}>
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Choose Template</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {channelTemplates.map((template) => (
                        <button
                          key={template.id}
                          className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-muted-foreground text-xs truncate">
                            {template.content.substring(0, 60)}...
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEmail && (
              <span className={cn(
                'text-xs font-medium',
                isOverLimit ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {remainingChars}
              </span>
            )}

            {/* Schedule Button */}
            <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={isScheduled ? "default" : "outline"} 
                  size="sm" 
                  disabled={disabled}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {isScheduled ? 'Scheduled' : 'Schedule'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Schedule Message</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScheduledDate(undefined);
                        setScheduledTime('');
                        setIsScheduleOpen(false);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsScheduleOpen(false)}
                      disabled={!scheduledDate || !scheduledTime}
                    >
                      Set Schedule
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Subject (Email only) */}
        {isEmail && (
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={disabled}
          />
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <Badge key={attachment.id} variant="secondary" className="gap-1">
                {attachment.file.name}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={`Type your ${isEmail ? 'email' : 'SMS message'}...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled}
            className={cn(
              'min-h-24 resize-none',
              isOverLimit && 'border-red-500 focus-visible:ring-red-500'
            )}
            maxLength={isEmail ? undefined : maxLength}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEmail && (
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </Button>
            )}
            
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center gap-2">
            {isScheduled && (
              <span className="text-xs text-muted-foreground">
                Sending {format(scheduledDate!, 'MMM d')} at {scheduledTime}
              </span>
            )}
            
            <Button
              onClick={handleSend}
              disabled={!content.trim() || isSending || disabled || isOverLimit}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : isScheduled ? 'Schedule' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MessageComposer;