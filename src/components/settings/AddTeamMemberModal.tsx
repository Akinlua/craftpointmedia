import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, ShieldCheck, Loader2 } from "lucide-react";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/user";

const addTeamMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["manager", "staff"], {
    required_error: "Please select a role",
  }),
});

type AddTeamMemberFormValues = z.infer<typeof addTeamMemberSchema>;

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: UserRole;
}

const AddTeamMemberModal = ({ open, onOpenChange, currentUserRole }: AddTeamMemberModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addUser, users } = useCRMStore();
  const { toast } = useToast();

  const form = useForm<AddTeamMemberFormValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "staff",
    },
  });

  const onSubmit = async (values: AddTeamMemberFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const existingUser = users.find(u => u.email === values.email);
      if (existingUser) {
        toast({
          title: "Error",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate user ID
      const userId = `u_${Math.random().toString(36).substr(2, 9)}`;
      const avatar = `${values.firstName[0]}${values.lastName[0]}`;

      // Add user to store
      addUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        orgId: 'org1',
        avatar,
        emailVerified: true,
        twoFactorEnabled: false,
      });

      toast({
        title: "Team member added successfully (mock)",
        description: `${values.firstName} ${values.lastName} has been added to your team.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRoles = currentUserRole === 'owner' 
    ? [{ value: 'manager', label: 'Manager' }, { value: 'staff', label: 'Staff' }]
    : [{ value: 'staff', label: 'Staff' }];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new team member to your organization directly.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john.doe@company.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The team member will use this email to log in
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
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            {role.value === 'manager' ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {role.value === 'manager'
                                  ? 'Full access except user management and billing'
                                  : 'Can view and edit contacts, deals, and tasks'
                                }
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
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
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberModal;