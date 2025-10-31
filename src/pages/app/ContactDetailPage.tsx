import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Contact, ContactTimeline } from "@/types/contact";
import { contactsApi } from "@/lib/api/contacts";
import { canCurrentUser } from "@/lib/rbac/can";
import { Role } from '@/lib/rbac/permissions';
import { useSession } from "@/lib/hooks/useSession";
import { EditContactModal } from "@/components/contacts/EditContactModal";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  Archive,
  Calendar,
  FileText,
  CheckSquare,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const ContactDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, role } = useSession();
  const { toast } = useToast();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [timeline, setTimeline] = useState<ContactTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadContact(id);
      loadTimeline(id);
    }
  }, [id]);

  const loadContact = async (contactId: string) => {
    try {
      setLoading(true);
      const contactData = await contactsApi.getContact(contactId);
      if (!contactData) {
        toast({
          title: "Contact not found",
          description: "The contact you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate('/app/contacts');
        return;
      }
      setContact(contactData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contact details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (contactId: string) => {
    try {
      setTimelineLoading(true);
      const timelineData = await contactsApi.getContactTimeline(contactId);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleEditContact = () => {
    setEditModalOpen(true);
  };

  const handleArchiveContact = async () => {
    if (!contact) return;
    
    try {
      await contactsApi.updateContact(contact.id, { status: 'archived' });
      toast({
        title: "Contact archived",
        description: `${contact.firstName} ${contact.lastName} has been archived`
      });
      // Reload the contact to reflect changes
      loadContact(contact.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive contact",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async () => {
    if (!contact || !role || !canCurrentUser('delete', 'contacts', role.role as Role)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete this contact",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeleting(true);
      await contactsApi.bulkAction([contact.id], { type: 'delete' });
      toast({
        title: "Contact deleted",
        description: `${contact.firstName} ${contact.lastName} has been deleted`
      });
      navigate('/app/contacts');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getTagColor = (tag: string) => {
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

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'task': return <CheckSquare className="w-4 h-4" />;
      case 'deal_update': return <DollarSign className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium">Contact not found</h2>
          <p className="text-muted-foreground">The contact you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/contacts')} 
            className="mt-4"
          >
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = role ? canCurrentUser('update', 'contacts', role.role as Role) : false;
  const canDelete = role ? (canCurrentUser('delete', 'contacts', role.role as Role) || 
                   (profile?.id === contact.ownerId)) : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/contacts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary border text-lg">
                {getInitials(contact.firstName, contact.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-display">{contact.firstName} {contact.lastName}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" onClick={handleEditContact}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={handleArchiveContact}>
            <Archive className="w-4 h-4" />
            Archive
          </Button>
          {canDelete && (
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="mt-1">{contact.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="mt-1">{contact.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1">{contact.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="mt-1">{contact.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company</label>
                      <p className="mt-1">{contact.company || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="mt-1 flex items-center gap-1">
                        {contact.location ? (
                          <>
                            <MapPin className="w-4 h-4" />
                            {contact.location}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {contact.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className={`${getTagColor(tag)} border`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : timeline.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {getTimelineIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{item.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              by {item.createdByName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deals">
              <Card>
                <CardHeader>
                  <CardTitle>Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No deals found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No files uploaded</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge 
                  variant="outline" 
                  className={`mt-1 ${
                    contact.status === 'lead' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                    contact.status === 'customer' ? 'bg-success/10 text-success border-success/20' :
                    'bg-muted text-muted-foreground border-muted'
                  }`}
                >
                  {contact.status}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Owner</label>
                <p className="mt-1">{contact.ownerName}</p>
              </div>
              
              {contact.leadScore && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lead Score</label>
                  <p className="mt-1 font-medium">{contact.leadScore}/100</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="mt-1 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              
              {contact.lastContactAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Contact</label>
                  <p className="mt-1 text-sm">
                    {formatDistanceToNow(new Date(contact.lastContactAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4" />
                Make Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="w-4 h-4" />
                Add Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <EditContactModal
        contact={contact}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={() => contact && loadContact(contact.id)}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteContact}
        itemName={contact ? `${contact.firstName} ${contact.lastName}` : 'contact'}
        isLoading={isDeleting}
        description="This action cannot be undone. All associated data will be permanently removed."
      />
    </div>
  );
};

export default ContactDetailPage;