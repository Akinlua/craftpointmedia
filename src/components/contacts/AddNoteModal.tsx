import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contactsApi } from "@/lib/api/contacts";
import { Contact } from "@/types/contact";

interface AddNoteModalProps {
    contact: Contact | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated?: () => void;
}

export const AddNoteModal = ({ contact, open, onOpenChange, onUpdated }: AddNoteModalProps) => {
    const { toast } = useToast();
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && contact) {
            // If contact has existing notes, we might want to append or just show them
            // For now, let's assume we are appending a new note, so we start empty
            // Or if we want to edit existing notes, we'd load them. 
            // Given "Add Note", let's assume appending.
            // But since we are updating the single 'notes' field, maybe we should show existing?
            // Let's show existing notes to allow editing.
            // Actually, if it's a single field, it's more like "Edit Notes".
            // But the user said "Add Note". 
            // If I append, I need to know previous notes.
            // Let's load existing notes into the textarea.
            setNote(contact.notes || "");
        }
    }, [open, contact]);

    const handleSubmit = async () => {
        if (!contact) return;

        try {
            setIsSubmitting(true);
            // We are updating the 'notes' field of the contact
            await contactsApi.updateContact(contact.id, { notes: note });

            toast({
                title: "Note Saved",
                description: "Contact notes have been updated successfully.",
            });

            onOpenChange(false);
            onUpdated?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save note",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Textarea
                        placeholder="Enter your note here..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={6}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? "Saving..." : "Save Note"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
