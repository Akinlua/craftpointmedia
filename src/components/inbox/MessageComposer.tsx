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
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  conversationId: string;
  onSendMessage: (content: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  onSendMessage,
  className,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(content);

      // Reset form
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={cn('p-4 border-t bg-background', className)}>
      <div className="space-y-4">

        {/* Message Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={`Type your message...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled}
            className="min-h-24 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isSending || disabled}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MessageComposer;