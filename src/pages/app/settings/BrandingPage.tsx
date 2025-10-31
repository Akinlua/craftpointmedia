import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Palette, 
  Upload, 
  Save, 
  Eye, 
  Monitor, 
  Moon, 
  Sun,
  Loader2,
  Globe,
  Copy,
  Check
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { settingsApi } from "@/lib/api/settings";
import { useToast } from "@/hooks/use-toast";

const BrandingPage = () => {
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [darkMode, setDarkMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [hideBranding, setHideBranding] = useState(false);
  const [copiedCNAME, setCopiedCNAME] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: settingsApi.getOrganization,
  });

  const updateBranding = useMutation({
    mutationFn: settingsApi.updateBranding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast({
        title: "Branding updated",
        description: "Your brand settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateBranding.mutate({
      primaryColor,
      secondaryColor,
      darkMode,
      whiteLabel: {
        enabled: whiteLabelEnabled,
        customDomain,
        hideBranding,
      },
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      toast({
        title: "Logo uploaded",
        description: "Your logo has been updated successfully.",
      });
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      toast({
        title: "Favicon uploaded",
        description: "Your favicon has been updated successfully.",
      });
    }
  };

  const copyCNAMERecord = async () => {
    const cnameRecord = `CNAME: ${customDomain} → your-org.crm-platform.com`;
    try {
      await navigator.clipboard.writeText(cnameRecord);
      setCopiedCNAME(true);
      setTimeout(() => setCopiedCNAME(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "CNAME record has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

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
      <div>
        <h1 className="text-display">Branding & Appearance</h1>
        <p className="text-muted-foreground mt-1">
          Customize your brand appearance and white-label settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Logo & Favicon */}
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>
                Upload your organization logo and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div>
                <Label className="text-sm font-medium">Organization Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={organization?.logo} />
                    <AvatarFallback>
                      {organization?.name?.charAt(0) || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB. Recommended: 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Favicon */}
              <div>
                <Label className="text-sm font-medium">Favicon</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-8 h-8 border rounded bg-muted flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="favicon-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="w-3 h-3 mr-2" />
                          Upload Favicon
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFaviconUpload}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG. Recommended: 32x32px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Theme */}
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Theme
              </CardTitle>
              <CardDescription>
                Customize your brand colors and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Dark Mode Preference</Label>
                  <p className="text-xs text-muted-foreground">
                    Default theme preference for new users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                  <Moon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* White Label */}
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                White Label Options
                <Badge variant="outline" className="ml-2">Pro</Badge>
              </CardTitle>
              <CardDescription>
                Remove branding and use custom domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enable White Label</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove platform branding from your CRM
                  </p>
                </div>
                <Switch
                  checked={whiteLabelEnabled}
                  onCheckedChange={setWhiteLabelEnabled}
                />
              </div>

              {whiteLabelEnabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="custom-domain">Custom Domain</Label>
                      <Input
                        id="custom-domain"
                        placeholder="crm.yourcompany.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {customDomain && (
                      <div className="p-3 bg-muted rounded-lg">
                        <Label className="text-xs font-medium">DNS Setup Instructions</Label>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Add this CNAME record to your DNS settings:
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-background rounded border">
                            <code className="text-xs flex-1">
                              CNAME: {customDomain} → your-org.crm-platform.com
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={copyCNAMERecord}
                              className="h-6 w-6 p-0"
                            >
                              {copiedCNAME ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Hide Platform Branding</Label>
                        <p className="text-xs text-muted-foreground">
                          Remove "Powered by" links and logos
                        </p>
                      </div>
                      <Switch
                        checked={hideBranding}
                        onCheckedChange={setHideBranding}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Brand Preview
              </CardTitle>
              <CardDescription>
                See how your branding will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header Preview */}
                <div className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={organization?.logo} />
                        <AvatarFallback style={{ backgroundColor: primaryColor, color: 'white' }}>
                          {organization?.name?.charAt(0) || "O"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{organization?.name || "Your Company"}</span>
                    </div>
                    <Button 
                      size="sm" 
                      style={{ 
                        backgroundColor: primaryColor, 
                        borderColor: primaryColor,
                        color: 'white'
                      }}
                    >
                      Primary Button
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded" style={{ width: '60%' }}></div>
                    <div className="h-2 bg-muted rounded" style={{ width: '40%' }}></div>
                    <div className="h-2 bg-muted rounded" style={{ width: '80%' }}></div>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <span className="text-sm font-medium">Sample Card</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded" style={{ width: '90%' }}></div>
                    <div className="h-2 bg-muted rounded" style={{ width: '70%' }}></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Secondary
                    </Button>
                    <Badge style={{ backgroundColor: secondaryColor, color: 'white' }}>
                      Status
                    </Badge>
                  </div>
                </div>

                {/* Branding Preview */}
                {!hideBranding && (
                  <div className="text-center p-3 border rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      Powered by CRM Platform
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full btn-primary"
            onClick={handleSave}
            disabled={updateBranding.isPending}
          >
            {updateBranding.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Branding Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;