import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactTable } from "@/components/contacts/ContactTable";
import { ContactFilters } from "@/components/contacts/ContactFilters";
import { ContactBulkActions } from "@/components/contacts/ContactBulkActions";
import { ContactPipeline } from "@/components/contacts/ContactPipeline";
import { AddContactForm } from "@/components/contacts/AddContactForm";
import { PageBackground } from "@/components/layout/PageBackground";
import { Contact, ContactFilters as ContactFiltersType, ContactBulkAction } from "@/types/contact";
import { useCRMStore } from "@/lib/stores/crmStore";
import { canCurrentUser } from "@/lib/rbac/can";
import { generateContactsCSV, downloadCSV } from "@/lib/utils/export";
import { Plus, Table as TableIcon, Kanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NoContactsState } from "@/components/ui/empty-states";

const ContactsPage = () => {
  const navigate = useNavigate();
  const { contacts, users, currentUser, updateContact, deleteContact } = useCRMStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ContactFiltersType>({});
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("table");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter contacts based on current filters
  const filteredContacts = contacts.filter(contact => {
    if (filters.status?.length && !filters.status.includes(contact.status)) return false;
    if (filters.tags?.length && !filters.tags.some(tag => contact.tags.includes(tag))) return false;
    if (filters.location && !contact.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!contact.firstName.toLowerCase().includes(search) &&
          !contact.lastName.toLowerCase().includes(search) &&
          !contact.email.toLowerCase().includes(search) &&
          !contact.company?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  // Pagination
  const itemsPerPage = 25;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
  const calculatedTotalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  useEffect(() => {
    setTotalPages(calculatedTotalPages);
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredContacts.length, calculatedTotalPages, currentPage]);

  // Get available tags and owners from CRM store
  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags)));
  const availableOwners = users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }));

  // Selection handlers
  const handleSelectContact = (contactId: string, selected: boolean) => {
    setSelectedContacts(prev => 
      selected 
        ? [...prev, contactId]
        : prev.filter(id => id !== contactId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedContacts(selected ? paginatedContacts.map(c => c.id) : []);
  };

  // Navigation handlers
  const handleContactClick = (contact: Contact) => {
    navigate(`/app/contacts/${contact.id}`);
  };

  const handleEditContact = (contact: Contact) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit contact:', contact);
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!canCurrentUser('delete', 'contacts', currentUser?.role)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete contacts",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        deleteContact(contact.id);
        toast({
          title: "Contact deleted",
          description: `${contact.firstName} ${contact.lastName} has been deleted`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive"
        });
      }
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action: ContactBulkAction) => {
    if (selectedContacts.length === 0) return;

    try {
      if (action.type === 'export') {
        // CSV Export functionality
        const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));
        const csvContent = generateContactsCSV(selectedContactsData);
        downloadCSV(csvContent, 'contacts-export.csv');
        
        toast({
          title: "Export completed",
          description: `Exported ${selectedContacts.length} contacts to CSV`
        });
        return;
      }

      // Handle other bulk actions
      selectedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          switch (action.type) {
            case 'add_tag':
              if (!contact.tags.includes(action.data.tag)) {
                updateContact(contactId, { 
                  tags: [...contact.tags, action.data.tag] 
                });
              }
              break;
            case 'remove_tag':
              updateContact(contactId, { 
                tags: contact.tags.filter(tag => tag !== action.data.tag) 
              });
              break;
            case 'assign_owner':
              const ownerInfo = users.find(u => u.id === action.data.ownerId);
              updateContact(contactId, { 
                ownerId: action.data.ownerId,
                ownerName: ownerInfo ? `${ownerInfo.firstName} ${ownerInfo.lastName}` : 'Unknown'
              });
              break;
            case 'delete':
              deleteContact(contactId);
              break;
          }
        }
      });
      
      const actionNames = {
        add_tag: 'Tags added',
        remove_tag: 'Tags removed', 
        assign_owner: 'Owner assigned',
        delete: 'Contacts deleted'
      };

      toast({
        title: actionNames[action.type as keyof typeof actionNames],
        description: `Applied to ${selectedContacts.length} contacts`
      });

      setSelectedContacts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  const canCreateContact = canCurrentUser('create', 'contacts', currentUser?.role);

  return (
    <PageBackground variant="contacts">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your contacts and leads
          </p>
        </div>
        {canCreateContact && (
          <Button className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        )}
      </div>

      {/* Filters */}
      <ContactFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

      {/* Bulk Actions */}
      <ContactBulkActions
        selectedCount={selectedContacts.length}
        onBulkAction={handleBulkAction}
        availableTags={availableTags}
        availableOwners={availableOwners}
      />

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table" className="gap-2">
            <TableIcon className="w-4 h-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Kanban className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          {filteredContacts.length === 0 ? (
            <NoContactsState onAddContact={() => setShowAddForm(true)} />
          ) : (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>All Contacts ({filteredContacts.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ContactTable
                  contacts={paginatedContacts}
                  selectedContacts={selectedContacts}
                  onSelectContact={handleSelectContact}
                  onSelectAll={handleSelectAll}
                  onContactClick={handleContactClick}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pipeline">
          <ContactPipeline contacts={filteredContacts} />
        </TabsContent>
      </Tabs>
      
      <AddContactForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
      />
      </div>
    </PageBackground>
  );
};

export default ContactsPage;