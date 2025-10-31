import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, UserX, Crown, ShieldCheck, User } from "lucide-react";
import { TeamMember } from "@/types/org";
import { settingsApi } from "@/lib/api/settings";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TeamTableProps {
  members: TeamMember[];
  currentUserId?: string;
}

const getRoleInfo = (role: TeamMember['role']) => {
  switch (role) {
    case 'owner':
      return { label: 'Owner', icon: Crown, variant: 'default' as const };
    case 'manager':
      return { label: 'Manager', icon: ShieldCheck, variant: 'secondary' as const };
    case 'staff':
      return { label: 'Staff', icon: User, variant: 'outline' as const };
    default:
      return { label: 'Unknown', icon: User, variant: 'outline' as const };
  }
};

const getStatusInfo = (status: TeamMember['status']) => {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default' as const };
    case 'inactive':
      return { label: 'Inactive', variant: 'secondary' as const };
    case 'pending':
      return { label: 'Pending', variant: 'outline' as const };
    default:
      return { label: 'Unknown', variant: 'outline' as const };
  }
};

const TeamTable = ({ members, currentUserId }: TeamTableProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionType, setActionType] = useState<'deactivate' | 'role-change' | null>(null);
  const [newRole, setNewRole] = useState<TeamMember['role']>('staff');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TeamMember['role'] }) =>
      settingsApi.updateTeamMemberRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully.",
      });
      setSelectedMember(null);
      setActionType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => settingsApi.deactivateTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Member deactivated",
        description: "Team member has been deactivated successfully.",
      });
      setSelectedMember(null);
      setActionType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (member: TeamMember, role: TeamMember['role']) => {
    setSelectedMember(member);
    setNewRole(role);
    setActionType('role-change');
  };

  const handleDeactivate = (member: TeamMember) => {
    setSelectedMember(member);
    setActionType('deactivate');
  };

  const confirmAction = () => {
    if (!selectedMember) return;

    if (actionType === 'role-change') {
      updateRoleMutation.mutate({ userId: selectedMember.id, role: newRole });
    } else if (actionType === 'deactivate') {
      deactivateMutation.mutate(selectedMember.id);
    }
  };

  const canManage = (member: TeamMember) => {
    // Owner can manage everyone except themselves
    // Manager can manage staff
    // Staff cannot manage anyone
    if (member.id === currentUserId) return false;
    return member.role !== 'owner';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              const statusInfo = getStatusInfo(member.status);

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                          {member.id === currentUserId && (
                            <span className="text-xs text-muted-foreground ml-1">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.variant} className="gap-1">
                      <roleInfo.icon className="w-3 h-3" />
                      {roleInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.lastLogin 
                      ? formatDistanceToNow(new Date(member.lastLogin), { addSuffix: true })
                      : member.status === 'pending' 
                        ? 'Never' 
                        : 'Unknown'
                    }
                  </TableCell>
                  <TableCell>
                    {canManage(member) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleChange(member, 'owner')}>
                            Change to Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member, 'manager')}>
                            Change to Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member, 'staff')}>
                            Change to Staff
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeactivate(member)}
                            className="text-destructive"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog 
        open={actionType === 'role-change'} 
        onOpenChange={() => setActionType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Member Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {selectedMember?.firstName} {selectedMember?.lastName}'s role to {newRole}? 
              This will immediately update their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={actionType === 'deactivate'} 
        onOpenChange={() => setActionType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedMember?.firstName} {selectedMember?.lastName}? 
              They will lose access to the system immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              disabled={deactivateMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamTable;