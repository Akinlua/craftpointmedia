import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Users, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TeamTable from "@/components/settings/TeamTable";
import { canCurrentUser } from "@/lib/rbac/can";
import { authApi } from "@/lib/api/auth";
import { useSession } from "@/lib/hooks/useSession";
import { useCRMStore } from "@/lib/stores/crmStore";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["manager", "staff"], {
    required_error: "Please select a role",
  }),
  message: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const TeamPage = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile, organization } = useSession();
  const { users } = useCRMStore();

  // Use mock data from CRM store instead of API
  const teamMembers = users;
  const isLoading = false;

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "staff",
      message: "",
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!currentUser || !currentOrg) return;
    
    setIsSubmitting(true);
    try {
      // Call backend API to send invitation
      await authApi.sendInvite({
        email: values.email,
        role: values.role,
        message: values.message,
      });
      
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Invitation sent!",
        description: `Invitation sent to ${values.email}. They will receive an email to join your team.`,
      });
      setInviteDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user can manage team (only owner and manager)
  const canManageTeam = currentUser ? (currentUser.role === 'owner' || currentUser.role === 'manager') : false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their roles within your organization
          </p>
        </div>
        {canManageTeam && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Team Member
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="teammate@company.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          We'll send an invitation link to this email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div>
                                <div className="font-medium">Staff</div>
                                <div className="text-xs text-muted-foreground">
                                  Can view and edit contacts, deals, and tasks
                                </div>
                              </div>
                            </SelectItem>
                            {(currentUser?.role === 'owner') && (
                              <SelectItem value="manager">
                                <div>
                                  <div className="font-medium">Manager</div>
                                  <div className="text-xs text-muted-foreground">
                                    Full access except user management and billing
                                  </div>
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Welcome to our team! We're excited to have you join us..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Add a personal message to include in the invitation email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setInviteDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
           </Dialog>
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{teamMembers?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">
                  {teamMembers?.filter(m => true).length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {0}
                </p>
              </div>
              <Mail className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your team members, their roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers && teamMembers.length > 0 ? (
            <TeamTable 
              members={teamMembers.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatar: user.avatar,
                status: 'active' as const,
                lastLogin: new Date().toISOString(),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              }))} 
              currentUserId={currentUser?.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Invite your first team member to get started with collaboration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
          <CardDescription>
            Understanding different access levels in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                Owner
              </h4>
              <p className="text-sm text-muted-foreground">
                Full access to all features including billing, user management, and organization settings.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                Manager
              </h4>
              <p className="text-sm text-muted-foreground">
                Can manage contacts, deals, campaigns, and view reports. Cannot manage users or billing.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                Staff
              </h4>
              <p className="text-sm text-muted-foreground">
                Can view and edit contacts, deals, and tasks. Read-only access to reports and settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;