import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { useCRMStore } from "@/lib/stores/crmStore";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, organization, updateProfile } = useSession();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate password change if attempted
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords don't match",
          variant: "destructive"
        });
        return;
      }
      if (!formData.currentPassword) {
        toast({
          title: "Error", 
          description: "Current password is required to change password",
          variant: "destructive"
        });
        return;
      }
    }

    // Update profile
    await updateProfile({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
    });

    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully"
    });

    // Clear password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'manager':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'staff':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary border text-2xl">
                    {getInitials(profile.first_name || '', profile.last_name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profile.first_name} {profile.last_name}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <Badge 
                    variant="outline" 
                    className="mt-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {profile.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Add phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Organization Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                <p className="mt-1 font-medium">{organization?.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Domain</Label>
                <p className="mt-1 text-muted-foreground">{organization?.domain || 'Not set'}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm capitalize">{profile.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/settings')}>
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/settings/security')}>
                Security Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/app/settings/notifications')}>
                Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;