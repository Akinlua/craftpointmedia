import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface InvoiceEditorProps {
  data: any;
  onChange: (data: any) => void;
  onSave?: (data: any) => void;
  isNew?: boolean;
  isLoading?: boolean;
}

export function InvoiceEditor({ data, onChange, onSave, isNew, isLoading }: InvoiceEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Selection */}
        <div>
          <label className="text-sm font-medium">Contact</label>
          <Select value={data.contactId} onValueChange={(value) => onChange({ ...data, contactId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Sarah Davis</SelectItem>
              <SelectItem value="3">Mike Wilson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Line Items</label>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              No items added yet. Click "Add Item" to get started.
            </p>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Payment Terms</label>
            <Select value={data.paymentTerms?.toString()} onValueChange={(value) => onChange({ ...data, paymentTerms: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">NET 7</SelectItem>
                <SelectItem value="14">NET 14</SelectItem>
                <SelectItem value="30">NET 30</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={data.dueDate || ''}
              onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            placeholder="Add any notes for this invoice..."
            value={data.notes || ''}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Terms & Conditions</label>
          <Textarea
            placeholder="Payment terms and conditions..."
            value={data.terms || ''}
            onChange={(e) => onChange({ ...data, terms: e.target.value })}
          />
        </div>

        {!isNew && onSave && (
          <Button onClick={() => onSave(data)} disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}