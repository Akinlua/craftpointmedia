import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Deal, DealActivity, DealNote } from "@/types/deal";
import { dealsApi, dealStages } from "@/lib/api/deals";
import { canCurrentUser } from "@/lib/rbac/can";
import { useSession } from "@/lib/hooks/useSession";
import { 
  ArrowLeft, 
  DollarSign, 
  Edit, 
  Trash2, 
  Archive,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Receipt,
  Activity,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    value: 0,
    stageId: "",
    closeDate: ""
  });

  useEffect(() => {
    if (id) {
      loadDeal(id);
      loadActivities(id);
      loadNotes(id);
    }
  }, [id]);

  const loadDeal = async (dealId: string) => {
    try {
      setLoading(true);
      const dealData = await dealsApi.getDeal(dealId);
      if (!dealData) {
        toast({
          title: "Deal not found",
          description: "The deal you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate('/app/deals');
        return;
      }
      setDeal(dealData);
      setEditForm({
        title: dealData.title,
        value: dealData.value,
        stageId: dealData.stageId,
        closeDate: dealData.closeDate || ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (dealId: string) => {
    try {
      setActivitiesLoading(true);
      const activitiesData = await dealsApi.getDealActivities(dealId);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadNotes = async (dealId: string) => {
    try {
      setNotesLoading(true);
      const notesData = await dealsApi.getDealNotes(dealId);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!deal) return;

    try {
      const updatedDeal = await dealsApi.updateDeal(deal.id, {
        title: editForm.title,
        value: editForm.value,
        stageId: editForm.stageId,
        closeDate: editForm.closeDate || undefined
      });
      setDeal(updatedDeal);
      setIsEditing(false);
      toast({
        title: "Deal updated",
        description: "Deal details have been saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async () => {
    if (!deal || !newNote.trim()) return;

    try {
      const note = await dealsApi.createDealNote(deal.id, newNote);
      setNotes(prev => [note, ...prev]);
      setNewNote("");
      toast({
        title: "Note added",
        description: "Your note has been saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDeal = async () => {
    if (!deal || !canCurrentUser('delete', 'deals', user?.role)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete this deal",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealsApi.bulkAction([deal.id], { type: 'delete' });
        toast({
          title: "Deal deleted",
          description: `"${deal.title}" has been deleted`
        });
        navigate('/app/deals');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete deal",
          variant: "destructive"
        });
      }
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getStageColor = (stageId: string) => {
    const stage = dealStages.find(s => s.id === stageId);
    if (!stage) return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    
    const colorMap: Record<string, string> = {
      'bg-blue-500': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'bg-yellow-500': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      'bg-purple-500': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'bg-green-500': 'bg-green-500/10 text-green-600 border-green-500/20',
      'bg-red-500': 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    
    return colorMap[stage.color] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'stage_change': return <Activity className="w-4 h-4" />;
      case 'value_change': return <DollarSign className="w-4 h-4" />;
      case 'contact_added': return <Users className="w-4 h-4" />;
      case 'email_sent': return <MessageSquare className="w-4 h-4" />;
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

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium">Deal not found</h2>
          <p className="text-muted-foreground">The deal you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/deals')} 
            className="mt-4"
          >
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = canCurrentUser('update', 'deals', user?.role);
  const canDelete = canCurrentUser('delete', 'deals', user?.role) || 
                   (user?.id === deal.ownerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-display">{deal.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              </div>
              <Badge 
                variant="outline"
                className={`border ${getStageColor(deal.stageId)}`}
              >
                {dealStages.find(s => s.id === deal.stageId)?.name}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
          <Button variant="outline">
            <Archive className="w-4 h-4" />
            Archive
          </Button>
          {canDelete && (
            <Button variant="outline" onClick={handleDeleteDeal}>
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
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="value">Value</Label>
                        <Input
                          id="value"
                          type="number"
                          value={editForm.value}
                          onChange={(e) => setEditForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stage">Stage</Label>
                        <Select
                          value={editForm.stageId}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, stageId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dealStages.map(stage => (
                              <SelectItem key={stage.id} value={stage.id}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="closeDate">Close Date</Label>
                        <Input
                          id="closeDate"
                          type="date"
                          value={editForm.closeDate}
                          onChange={(e) => setEditForm(prev => ({ ...prev, closeDate: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <p className="mt-1">{deal.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Value</label>
                        <p className="mt-1">{formatCurrency(deal.value, deal.currency)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Stage</label>
                        <p className="mt-1">{dealStages.find(s => s.id === deal.stageId)?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Close Date</label>
                        <p className="mt-1">
                          {deal.closeDate ? format(new Date(deal.closeDate), 'MMM d, yyyy') : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Owner</label>
                        <p className="mt-1">{deal.ownerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Probability</label>
                        <p className="mt-1">{deal.probability ? `${deal.probability}%` : 'Not set'}</p>
                      </div>
                    </div>
                  )}
                  
                  {deal.description && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="mt-1">{deal.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
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
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              by {activity.createdByName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add note form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={handleAddNote} 
                      disabled={!newNote.trim()}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </Button>
                  </div>

                  <Separator />

                  {/* Notes list */}
                  {notesLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No notes yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{note.createdByName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Linked Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  {deal.contacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No contacts linked</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deal.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices yet</p>
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
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="mt-1 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(deal.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              
              {deal.lastActivityAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                  <p className="mt-1 text-sm">
                    {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="mt-1 text-sm">
                  {Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4" />
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="w-4 h-4" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;