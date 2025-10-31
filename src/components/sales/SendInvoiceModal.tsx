import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { Invoice } from '@/types/invoice';

interface SendInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export function SendInvoiceModal({ invoice, onClose }: SendInvoiceModalProps) {
  const [channels, setChannels] = useState<('email' | 'sms')[]>(['email']);
  const [subject, setSubject] = useState(`Invoice ${invoice.number} from Your Company`);
  const [body, setBody] = useState(`Hi ${invoice.contactName},\n\nPlease find attached invoice ${invoice.number}.\n\nThank you for your business!`);
  const [attachPdf, setAttachPdf] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Channels */}
      <div>
        <label className="text-sm font-medium mb-3 block">Send via</label>
        <div className="flex gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={channels.includes('email')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setChannels([...channels, 'email']);
                } else {
                  setChannels(channels.filter(c => c !== 'email'));
                }
              }}
            />
            <label htmlFor="email" className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              Email
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms"
              checked={channels.includes('sms')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setChannels([...channels, 'sms']);
                } else {
                  setChannels(channels.filter(c => c !== 'sms'));
                }
              }}
            />
            <label htmlFor="sms" className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              SMS
            </label>
          </div>
        </div>
      </div>

      {/* Email Template */}
      {channels.includes('email') && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email message"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachPdf"
              checked={attachPdf}
              onCheckedChange={(checked) => setAttachPdf(checked as boolean)}
            />
            <label htmlFor="attachPdf" className="text-sm">
              Attach PDF invoice
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Recipients:</span>
          <div className="flex gap-1">
            {channels.map(channel => (
              <Badge key={channel} variant="secondary" className="text-xs">
                {channel}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {invoice.contactName} ({invoice.contactEmail})
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSend} disabled={isLoading || channels.length === 0}>
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending...' : 'Send Invoice'}
        </Button>
      </div>
    </div>
  );
}