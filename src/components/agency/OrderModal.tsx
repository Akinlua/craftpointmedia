import { useState } from "react";
import { Service, Freelancer } from "@/types/agency";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  freelancers: Freelancer[];
  onSubmit: (orderData: {
    serviceId: string;
    freelancerId?: string;
    brief: string;
    deliveryDate?: Date;
    attachments: string[];
  }) => void;
}

export function OrderModal({ isOpen, onClose, service, freelancers, onSubmit }: OrderModalProps) {
  const [brief, setBrief] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | undefined>();
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!service) return null;

  const availableFreelancers = service.freelancerIds
    ? freelancers.filter((f) => service.freelancerIds!.includes(f.id))
    : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachments.length + files.length > 3) {
      toast.error("Maximum 3 attachments allowed");
      return;
    }
    setAttachments([...attachments, ...files.map((f) => f.name)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!brief.trim()) {
      toast.error("Please provide a project brief");
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit({
        serviceId: service.id,
        freelancerId: selectedFreelancer,
        brief,
        deliveryDate,
        attachments,
      });
      
      toast.success("Order placed successfully! Our team will review and confirm.");
      
      // Reset form
      setBrief("");
      setSelectedFreelancer(undefined);
      setDeliveryDate(undefined);
      setAttachments([]);
      onClose();
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceDisplay = typeof service.price === "number"
    ? `$${service.price}`
    : `$${service.price.min} - $${service.price.max}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Place Order: {service.name}</DialogTitle>
          <DialogDescription>
            Fill in the details below to place your order. Our team will review and get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Service:</span>
              <span className="text-sm">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Price:</span>
              <span className="text-sm font-semibold">{priceDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Estimated Delivery:</span>
              <span className="text-sm">{service.deliveryTime}</span>
            </div>
          </div>

          {/* Freelancer Selection */}
          {availableFreelancers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="freelancer">Preferred Freelancer (Optional)</Label>
              <Select value={selectedFreelancer} onValueChange={setSelectedFreelancer}>
                <SelectTrigger id="freelancer">
                  <SelectValue placeholder="Auto-assign best available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-assign best available</SelectItem>
                  {availableFreelancers.map((freelancer) => (
                    <SelectItem key={freelancer.id} value={freelancer.id}>
                      {freelancer.name} {freelancer.rating && `(${freelancer.rating}★)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Project Brief */}
          <div className="space-y-2">
            <Label htmlFor="brief">Project Brief *</Label>
            <Textarea
              id="brief"
              placeholder="Describe your project requirements, goals, and any specific preferences..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible to help us deliver exactly what you need.
            </p>
          </div>

          {/* Delivery Date */}
          <div className="space-y-2">
            <Label>Requested Delivery Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">Attachments (Optional, max 3)</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("files")?.click()}
                  disabled={attachments.length >= 3}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <span className="text-xs text-muted-foreground">
                  {attachments.length}/3 files
                </span>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                    >
                      <span className="text-sm truncate">{file}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
