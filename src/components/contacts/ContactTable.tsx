import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Contact } from "@/types/contact";
import { canCurrentUser } from "@/lib/rbac/can";
import { useSession } from "@/lib/hooks/useSession";
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactTableProps {
  contacts: Contact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onContactClick: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  loading?: boolean;
}

export const ContactTable = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onContactClick,
  onEditContact,
  onDeleteContact,
  loading
}: ContactTableProps) => {
  const { user, role } = useSession();
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  const getStatusBadge = (status: string) => {
    const variants = {
      lead: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      customer: "bg-success/10 text-success border-success/20",
      archived: "bg-muted text-muted-foreground border-muted"
    };
    return variants[status as keyof typeof variants] || variants.lead;
  };

  const getTagColor = (tag: string) => {
    // Simple hash-based color assignment
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      "bg-red-500/10 text-red-600 border-red-500/20",
      "bg-blue-500/10 text-blue-600 border-blue-500/20", 
      "bg-green-500/10 text-green-600 border-green-500/20",
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "bg-pink-500/10 text-pink-600 border-pink-500/20"
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const canDelete = (contact: Contact) => {
    if (!role) return false;
    
    // Owner and Manager can delete any contact
    if (canCurrentUser('delete', 'contacts', role.role)) {
      return true;
    }
    
    // Staff can only delete their own contacts
    return user?.id === contact.ownerId;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              ref={(el) => {
                if (el) {
                  const input = el.querySelector('input');
                  if (input) input.indeterminate = someSelected;
                }
              }}
            />
          </TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow 
            key={contact.id} 
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => onContactClick(contact)}
          >
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedContacts.includes(contact.id)}
                onCheckedChange={(checked) => 
                  onSelectContact(contact.id, !!checked)
                }
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary border">
                    {getInitials(contact.firstName, contact.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.company && (
                      <div className="font-medium text-foreground">
                        {contact.company}
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {contact.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {contact.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={`text-xs border ${getTagColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {contact.ownerName}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="outline"
                className={`text-xs border ${getStatusBadge(contact.status)}`}
              >
                {contact.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
              </div>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditContact(contact)}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4" />
                    Archive
                  </DropdownMenuItem>
                  {canDelete(contact) && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteContact(contact)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};